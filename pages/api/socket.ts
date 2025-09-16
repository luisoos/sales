import type { NextApiRequest, NextApiResponse } from 'next';
import type { Socket as NetSocket } from 'net';
import { type Server as HTTPServer } from 'http';
import { Server as IOServer, type Socket } from 'socket.io';

import fs from 'fs';
import Groq from 'groq-sdk';
import path from 'path';
import { SystemPromptBuilder } from '~/utils/prompts/system-prompt';
import { createServerClient } from '@supabase/ssr';
import {
    appendTurnAndMaybeSetStatus,
    getOrCreateConversation,
} from '~/server/services/conversation';

declare global {
    // eslint-disable-next-line no-var
    var __io: IOServer | undefined;
}

interface SocketServer extends NetSocket {
    server: HTTPServer & { io?: IOServer };
}

interface SocketResponse extends NextApiResponse {
    socket: SocketServer;
}

export const config = {
    api: { bodyParser: false },
};

const audioCache: Record<string, Buffer> = {};
// Store chat history for each session
const chatHistory: Record<
    string,
    Groq.Chat.Completions.ChatCompletionMessageParam[]
> = {};

export default function handler(_req: NextApiRequest, res: SocketResponse) {
    const groq = new Groq();

    if (!global.__io) {
        console.log('⚡ Socket.IO initialisiert');

        const io = new IOServer(res.socket.server, {
            path: '/api/socket',
            cors: { origin: '*' },
        });

        global.__io = io;

        // Enforce auth on every socket connection using Supabase cookies
        io.use(async (socket, next) => {
            try {
                const cookieHeader = socket.request.headers.cookie ?? '';
                const parsed = cookieHeader
                    .split(';')
                    .map((c) => c.trim())
                    .filter(Boolean)
                    .map((c) => {
                        const idx = c.indexOf('=');
                        const name = idx > -1 ? c.substring(0, idx) : c;
                        const value = idx > -1 ? c.substring(idx + 1) : '';
                        return { name, value } as {
                            name: string;
                            value: string;
                        };
                    });

                const supabase = createServerClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                    {
                        cookies: {
                            getAll() {
                                return parsed;
                            },
                            setAll() {
                                // No-op for socket handshake
                            },
                        },
                    },
                );

                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (!user) {
                    return next(new Error('Unauthorized'));
                }

                socket.data.userId = user.id;

                return next();
            } catch (_err) {
                return next(new Error('Unauthorized'));
            }
        });

        io.on('connection', (socket: Socket) => {
            console.log('⏩ Neuer Client:', socket.id);

            socket.on('selectLesson', (lessonId: number) => {
                // Initialize chat history with the system prompt for the selected lesson
                chatHistory[socket.id] = [
                    {
                        role: 'system',
                        content: new SystemPromptBuilder(lessonId).build(),
                    },
                ];
                socket.data.lessonId = String(lessonId);
                console.log(
                    `📚 Lesson ${lessonId} selected for ${socket.id}. History initialized.`,
                );
            });

            socket.on('audio', (chunk: Buffer) => {
                audioCache[socket.id] = chunk;
            });

            socket.on('stop', async () => {
                const audioBuffer = audioCache[socket.id];
                delete audioCache[socket.id]; // Immediately clear cache

                if (!audioBuffer || audioBuffer.length < 1000) {
                    // Also validates minimum size
                    console.log(
                        '⏹ Stop-Signal received, but audio buffer is missing or too small.',
                    );
                    socket.emit('err', 'Audio recording too short or empty.');
                    return;
                }

                // Ensure history is initialized
                if (!chatHistory[socket.id]) {
                    socket.emit(
                        'err',
                        'Please select a lesson before starting the call.',
                    );
                    console.log(
                        `Error: Client ${socket.id} sent audio without selecting a lesson.`,
                    );
                    return;
                }

                console.log('⏹ Stop-Signal erhalten');
                socket.emit('stopped', {
                    ok: true,
                    message: 'Prozess gestoppt.',
                });

                const filePath = path.join(
                    'tmp/',
                    `${socket.id}-${Date.now()}.webm`,
                );

                try {
                    fs.writeFileSync(filePath, audioBuffer);

                    const transcription =
                        await groq.audio.transcriptions.create({
                            file: fs.createReadStream(filePath),
                            model: 'whisper-large-v3',
                            temperature: 0.05,
                            response_format: 'verbose_json',
                        });

                    // Add user message to history
                    const userMessage: Groq.Chat.Completions.ChatCompletionMessageParam =
                        {
                            role: 'user',
                            content: transcription.text,
                        };
                    chatHistory[socket.id]?.push(userMessage);
                    socket.emit('transcription', transcription.text);

                    const chatCompletion = await groq.chat.completions.create({
                        messages: chatHistory[socket.id] ?? [], // Send full history
                        model: 'openai/gpt-oss-20b',
                        temperature: 1,
                        max_tokens: 8192,
                        top_p: 1,
                        stream: false,
                    });

                    const chatAnswer =
                        chatCompletion.choices[0]?.message?.content;

                    if (chatAnswer) {
                        // Add assistant response to history
                        const assistantMessage: Groq.Chat.Completions.ChatCompletionMessageParam =
                            {
                                role: 'assistant',
                                content: chatAnswer,
                            };
                        chatHistory[socket.id]?.push(assistantMessage);

                        const wav = await groq.audio.speech.create({
                            model: 'playai-tts',
                            voice: 'Aaliyah-PlayAI',
                            response_format: 'wav',
                            input: chatAnswer
                                .replace(
                                    /<stop_call_close>|<stop_call_no_close>/g,
                                    '',
                                )
                                .trim(),
                            sample_rate: 16000,
                            speed: 1.25,
                        });
                        const buffer = Buffer.from(await wav.arrayBuffer());

                        console.log(transcription.text, ' -> ', chatAnswer);
                        socket.emit('tts', buffer);
                        socket.emit('text', chatAnswer);

                        // Save conversation to db
                        try {
                            const userId: string | undefined =
                                socket.data?.userId;
                            const lessonId: string | undefined =
                                socket.data?.lessonId;
                            if (userId && lessonId) {
                                const conversation =
                                    await getOrCreateConversation({
                                        userId,
                                        lessonId,
                                    });
                                console.log('Conversation found: ', conversation)
                                await appendTurnAndMaybeSetStatus({
                                    conversationId: conversation.id,
                                    userText: transcription.text,
                                    assistantText: chatAnswer,
                                });
                            } else {
                                console.warn(
                                    'Missing userId or lessonId, skipping persistence.',
                                );
                            }
                        } catch (err) {
                            console.error(
                                'Failed to persist conversation:',
                                err,
                            );
                        }
                    }
                } catch (e) {
                    let errorMessage: string | undefined;

                    if (typeof e === 'object' && e !== null) {
                        const error1 = (e as { error?: unknown }).error;
                        if (typeof error1 === 'object' && error1 !== null) {
                            const error2 = (error1 as { error?: unknown })
                                .error;
                            if (typeof error2 === 'object' && error2 !== null) {
                                const message = (
                                    error2 as { message?: unknown }
                                ).message;
                                if (typeof message === 'string') {
                                    errorMessage = message;
                                }
                            }
                        }
                    }

                    if (errorMessage) {
                        if (errorMessage === 'file is empty') {
                            socket.emit('err', 'No speech was detected.');
                        } else if (
                            errorMessage.startsWith('Rate limit reached')
                        ) {
                            socket.emit(
                                'err',
                                `Too many users are using ${process.env.NEXT_PUBLIC_PROJECT_NAME} at the moment. Try again later.`,
                            );
                        } else {
                            socket.emit(
                                'err',
                                'Sorry! Our systems had an internal error. We will work on fixing it as soon as possible.',
                            );
                            console.log(e);
                        }
                    } else {
                        console.error('An unexpected error occurred:', e);
                        socket.emit('err', 'An unexpected error occurred.');
                    }
                } finally {
                    fs.unlink(filePath, (err) => {
                        if (err) console.log('Error deleting temp file:', err);
                    });
                }
            });

            socket.on('disconnect', () => {
                console.log('🚪 Client getrennt:', socket.id);
                // Clean up caches on disconnect
                delete audioCache[socket.id];
                delete chatHistory[socket.id];
            });
        });
    }

    res.socket.server.io = global.__io;

    res.end();
}
