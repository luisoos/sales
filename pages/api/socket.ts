import type { NextApiRequest, NextApiResponse } from 'next';
import type { Socket as NetSocket } from 'net';
import { Server as HTTPServer } from 'http';
import { Server as IOServer, Socket } from 'socket.io';

import fs from 'fs';
import Groq from 'groq-sdk';
import path from 'path';

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
                const transcription = await groq.audio.transcriptions.create({
                    file: fs.createReadStream(filePath),
                    model: 'whisper-large-v3',
                    temperature: 0.05,
                    response_format: 'verbose_json',
                });

                // Text-to-text
                const chatCompletion = await groq.chat.completions.create({
                    messages: [
                        {
                            role: 'system',
                            content:
                                'You are an AI that should test the user in Sales. <response_format>Only answer in plain English and no other language. Do NOT use any symbols or Markdown syntax, even when asked for.</response_format>',
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

                const chatAnswer = chatCompletion.choices[0]?.message.content;

                if (chatAnswer) {
                    // Text-to-speech
                    const wav = await groq.audio.speech.create({
                        model: 'playai-tts',
                        voice: 'Mamaw-PlayAI',
                        response_format: 'wav',
                        input: chatAnswer,
                    });
                    const buffer = Buffer.from(await wav.arrayBuffer());

                    console.log(transcription.text, ' -> ', chatAnswer);
                    // Send the (text and) TTS to the client
                    socket.emit('tts', buffer);
                    socket.emit('text', chatAnswer);
                }

                // Remove the used user audio input
                fs.unlink(filePath, (err) => {
                    if (err) console.log("err");//throw err;
                });

                // Unset the audio cache to receive new user input
                audioCache[socket.id] = [];
            });

            // Optional: Verbindung schließen
            socket.on('disconnect', () => {
                console.log('🚪 Client getrennt:', socket.id);
            });
        });
    }

    res.end();
}
