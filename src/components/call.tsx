'use client';
import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from './ui/button';

export default function Call() {
    const [messages, setMessages] = useState<string[]>([]);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // Verbindung starten
        const socket = io({
            path: '/api/protected/socket',
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Verbunden:', socket.id);
        });

        socket.on('text', (msg: string) => {
            setMessages((prev) => [...prev, 'KI hat gehört: ' + msg]);
        });

        socket.on('tts', (msg: string) => {
            setMessages((prev) => [...prev, 'Antwort: ' + msg]);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    async function startRecording() {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
        });
        const recorder = new MediaRecorder(stream);

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0 && socketRef.current) {
                // Audio-Chunk in Base64 schicken
                e.data.arrayBuffer().then((buf) => {
                    const base64 = Buffer.from(buf).toString('base64');
                    socketRef.current?.emit('audio', base64);
                });
            }
        };

        recorder.start(500); // alle 500ms ein Chunk
    }

    function stopResponse() {
        socketRef.current?.emit('stop');
    }

    return (
        <div>
            <Button onClick={startRecording} variant='outline' className='mx-2'>
                🎤 Aufnahme starten
            </Button>
            <Button onClick={stopResponse} variant='outline' className='mx-2'>
                ⏹ Antwort abbrechen
            </Button>
            <ul>
                {messages.map((m, i) => (
                    <li key={i}>{m}</li>
                ))}
            </ul>
        </div>
    );
}
