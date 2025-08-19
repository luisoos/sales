'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from './ui/button';
import PushToTalkButton, { Bars } from './push-to-talk-button';
import { cn } from '~/lib/utils';

export default function Call() {
    const [messages, setMessages] = useState<string[]>([]);
    const [disableButton, setDisableButton] = useState<boolean>(false);
    const [characterSpeaks, setCharacterSpeaks] = useState<boolean>(false);
    const socketRef = useRef<Socket | null>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);

    useEffect(() => {
        // Connect to websocket
        const socket = io({
            path: '/api/socket',
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Verbunden:', socket.id);
        });

        socket.on('text', (msg: string) => {
            setMessages((prev) => [...prev, 'You: ' + msg]);
        });

        socket.on('tts', async (msg: string) => {
            setMessages((prev) => [...prev, 'Character: ' + msg]);
            setCharacterSpeaks(true);

            console.log(msg)
            const audio = new Audio(msg);
            await audio.play();

            setCharacterSpeaks(false);
        });

        socket.on('stopped', (msg) => {
            // setMessages((prev) => [...prev, '🛑 Server: ' + msg.message]);
            stopRecording();
            setDisableButton(true);
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
        recorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0 && socketRef.current) {
                socketRef.current?.emit('audio', e.data);
            }
        };

        recorder.start(500);
    }

    function stopRecording() {
        if (recorderRef.current) {
            recorderRef.current.stop();
        }
    }

    function stopResponse() {
        socketRef.current?.emit('stop');
        recorderRef.current?.stop();
    }

    return (
        <div>
            {/* <Button onClick={startRecording} variant='outline' className='mx-2'>
                🎤 Aufnahme starten
            </Button>
            <Button onClick={stopResponse} variant='outline' className='mx-2'>
                ⏹ Antwort abbrechen
            </Button> */}
            <div className={cn('w-5/6 mx-auto mb-12 border rounded-xl', characterSpeaks ? 'shadow-inner shadow-green-600' : 'shadow')} >
                <img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimgv3.fotor.com%2Fimages%2Fgallery%2Fcartoon-character-generated-by-Fotor-ai-art-creator.jpg&f=1&nofb=1&ipt=07e4cd80d8b00359d14f4a23916a05465a2ef282f57d7622292bdbcf1bdc282d" 
                className="w-16 mx-auto my-24 rounded-full" />
            </div>
            <div className="w-min mx-auto"><PushToTalkButton
                start={() => startRecording()}
                stop={() => stopResponse()}
                disabled={disableButton}
            /></div>
            <div className="w-5/6 mx-auto mt-16">
            <p className="font-medium text-lg">Conversation Log</p>
            <ul>
                {messages.map((m, i) => (
                    <li key={i}>{m}</li>
                ))}
            </ul></div>
        </div>
    );
}
