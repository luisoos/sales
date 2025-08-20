import type { NextApiRequest, NextApiResponse } from 'next';
import type { Socket as NetSocket } from 'net';
import { Server as HTTPServer } from 'http';
import { Server as IOServer, Socket } from 'socket.io';

import fs from 'fs';
import Groq from 'groq-sdk';
import path from 'path';
import { SystemPromptBuilder } from '~/utils/prompts/system-prompt';

interface SocketServer extends NetSocket {
    server: HTTPServer & { io?: IOServer };
}

interface SocketResponse extends NextApiResponse {
    socket: SocketServer;
}

export const config = {
    api: { bodyParser: false },
};

const audioCache: Record<string, Buffer[]> = {};
const chatCache: Record<string, Record<string, string>> = {};

export default function handler(req: NextApiRequest, res: SocketResponse) {
    const groq = new Groq();

    if (!res.socket.server.io) {
        console.log('⚡ Socket.IO initialisiert');

        const io = new IOServer(res.socket.server, {
            path: '/api/socket',
            cors: { origin: '*' },
        });

        res.socket.server.io = io;

        io.on('connection', (socket: Socket) => {
            console.log('⏩ Neuer Client:', socket.id);

            let selectedLessonSlug:
                | 'beginner'
                | 'intermediate'
                | 'advanced'
                | 'expert'
                | undefined = 'beginner';
            socket.on('selectLesson', (slug) => {
                selectedLessonSlug = slug;
            });

            // Beispiel: Audio-Chunks empfangen
            socket.on('audio', (chunk: Buffer) => {
                console.log('🎶 Audio-Chunk erhalten:', chunk.length, 'Bytes');

                if (!audioCache[socket.id]) {
                    audioCache[socket.id] = [];
                }
                audioCache[socket.id]!.push(chunk);

                // Testdaten zurücksenden
                // socket.emit('text', '✅ Ich habe dich verstanden (Test).');
                // socket.emit('tts', 'Das ist eine Test-KI-Antwort.');
            });

            // Stop-Signal behandeln
            socket.on('stop', async () => {
                const chunks = audioCache[socket.id] || [];

                console.log('⏹ Stop-Signal erhalten');
                socket.emit('stopped', {
                    ok: true,
                    message: 'Prozess gestoppt.',
                });

                const filePath = path.join('tmp/', `${socket.id}.wav`);
                fs.writeFileSync(filePath, Buffer.concat(chunks));

                // Speech-to-text
                try {
                    const transcription =
                        await groq.audio.transcriptions.create({
                            file: fs.createReadStream(filePath),
                            model: 'whisper-large-v3',
                            temperature: 0.05,
                            response_format: 'verbose_json',
                        });

                    // Text-to-text
                    const lessonNumber =
                        selectedLessonSlug === 'beginner'
                            ? 1
                            : selectedLessonSlug === 'intermediate'
                              ? 2
                              : selectedLessonSlug === 'advanced'
                                ? 3
                                : selectedLessonSlug === 'expert'
                                  ? 4
                                  : 1;

                    const chatCompletion = await groq.chat.completions.create({
                        messages: [
                            {
                                role: 'system',
                                content: new SystemPromptBuilder(
                                    lessonNumber,
                                ).build(),
                            },
                            {
                                role: 'user',
                                content: transcription.text,
                            },
                        ],
                        model: 'openai/gpt-oss-20b',
                        temperature: 1,
                        max_completion_tokens: 8192,
                        top_p: 1,
                        stream: false,
                        reasoning_effort: 'medium',
                        // "response_format": {
                        //   "type": "json_object"
                        // },
                        stop: null,
                    });

                    const chatAnswer =
                        chatCompletion.choices[0]?.message.content;

                    if (chatAnswer) {
                        // Text-to-speech
                        const wav = await groq.audio.speech.create({
                            model: 'playai-tts',
                            voice: 'Aaliyah-PlayAI',
                            response_format: 'wav',
                            input: chatAnswer,
                            sample_rate: 16000,
                            speed: 1,
                        });
                        const buffer = Buffer.from(await wav.arrayBuffer());

                        console.log(transcription.text, ' -> ', chatAnswer);
                        // Send the (text and) TTS to the client
                        socket.emit('tts', buffer);
                        socket.emit('transcription', transcription.text);
                        socket.emit('text', chatAnswer);
                    }

                    // Unset the audio cache to receive new user input
                    audioCache[socket.id] = [];
                } catch (e: any) {
                    if (e.error.error.message) {
                        if (e.error.error.message === 'file is empty') {
                            socket.emit('err', 'No speech was detected.');
                        } else if (
                            e.error.error.message.startsWith(
                                'Rate limit reached',
                            )
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
                    }
                } finally {
                    // Remove the used user audio input
                    fs.unlink(filePath, (err) => {
                        if (err) console.log('err'); //throw err;
                    });
                }
            });

            // Optional: Verbindung schließen
            socket.on('disconnect', () => {
                console.log('🚪 Client getrennt:', socket.id);
            });
        });
    }

    res.end();
}
