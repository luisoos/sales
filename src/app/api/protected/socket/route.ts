// app/api/socket/route.ts
import { NextRequest } from 'next/server';
import { Server as IOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

// Wir speichern das IO-Objekt im globalen Scope
const ioMap = global as unknown as { io?: IOServer };

export async function GET(req: NextRequest) {
    if (!ioMap.io) {
        console.log('⚡ Socket.IO initialisiert');

        const server: HTTPServer = (req as any).socket?.server;

        const io = new IOServer(server, {
            path: '/api/socket',
            cors: {
                origin: '*',
            },
        });

        io.on('connection', (socket) => {
            console.log('⏩ Neuer Client:', socket.id);

            socket.on('audio', (chunk) => {
                console.log('🎶 Audio-Chunk erhalten');
                // hier: STT -> GPT -> TTS
                socket.emit('text', 'Ich habe dich verstanden.');
                socket.emit('tts', 'Das ist eine KI-Antwort.');
            });

            socket.on('stop', () => {
                console.log('Stop-Signal');
                // hier: TTS-Abbruch
            });
        });

        ioMap.io = io;
    }

    return new Response('Socket.IO läuft', { status: 200 });
}
