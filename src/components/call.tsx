'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from './ui/button';
import PushToTalkButton, { Bars } from './push-to-talk-button';
import { cn } from '~/lib/utils';
import { toast } from 'sonner';

export default function Call() {
    const [messages, setMessages] = useState<string[]>([]);
    const [disableButton, setDisableButton] = useState<boolean>(false);
    const [characterSpeaks, setCharacterSpeaks] = useState<boolean>(false);
    const socketRef = useRef<Socket | null>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioContext = new AudioContext();

    useEffect(() => {
        // Connect to websocket
        const socket = io({
            path: '/api/socket',
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Verbunden:', socket.id);
        });

        socket.on('transcription', (msg: string) => {
            setMessages((prev) => [...prev, 'You: ' + msg]);
        });

        socket.on('text', (msg: string) => {
            setMessages((prev) => [...prev, 'Character: ' + msg]);
        });

        socket.on('tts', async (msg: ArrayBuffer) => {
            setCharacterSpeaks(true);

            playArrayBuffer(msg)

            setCharacterSpeaks(false);
        });

        socket.on('stopped', (msg) => {
            // setMessages((prev) => [...prev, '🛑 Server: ' + msg.message]);
            stopRecording();
            setDisableButton(true);
        });

        socket.on('err', (msg) => {
            console.log(msg)
            toast.error(msg)
            stopRecording();
            setDisableButton(false);
            setCharacterSpeaks(false);
        });

        return () => {
            try {
                if (recorderRef.current && recorderRef.current.state !== 'inactive') {
                    recorderRef.current.stop();
                }
            } catch {}
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
            }
            socket.disconnect();
        };
    }, []);

    async function startRecording() {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
        });
        streamRef.current = stream;
        const recorder = new MediaRecorder(stream);
        recorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0 && socketRef.current) {
                socketRef.current?.emit('audio', e.data);
            }
        };

        recorder.onstop = () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
            }
        };

        recorder.start(500);
    }

    function stopRecording() {
        if (recorderRef.current && recorderRef.current.state !== 'inactive') {
            recorderRef.current.stop();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        recorderRef.current = null;
    }

    function stopResponse() {
        socketRef.current?.emit('stop');
        if (recorderRef.current && recorderRef.current.state !== 'inactive') {
            recorderRef.current.stop();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        recorderRef.current = null;
    }

    function playArrayBuffer(arrayBuffer: ArrayBuffer) {
        audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            source.start(0);
            source.onended = () => {
                setDisableButton(false);
            };
        }, (error) => {
            console.error('Error decoding audio data', error);
        });
    }

    return (
        <div>
            {/* <Button onClick={startRecording} variant='outline' className='mx-2'>
                🎤 Aufnahme starten
            </Button>
            <Button onClick={stopResponse} variant='outline' className='mx-2'>
                ⏹ Antwort abbrechen
            </Button> */}
            <div
                className={cn(
                    'w-5/6 mx-auto mb-12 border rounded-xl shadow',
                    characterSpeaks
                        ? 'border border-green-500'
                        : 'border',
                )}>
                <img
                    src='https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimgv3.fotor.com%2Fimages%2Fgallery%2Fcartoon-character-generated-by-Fotor-ai-art-creator.jpg&f=1&nofb=1&ipt=07e4cd80d8b00359d14f4a23916a05465a2ef282f57d7622292bdbcf1bdc282d'
                    className='w-16 mx-auto my-24 rounded-full'
                />
            </div>
            <div className='w-min mx-auto'>
                <PushToTalkButton
                    start={() => startRecording()}
                    stop={() => stopResponse()}
                    disabled={disableButton}
                    getStream={() => streamRef.current}
                />
            </div>
            <div className='w-5/6 mx-auto mt-16'>
                <p className='font-medium text-lg'>Conversation Log</p>
                <ul>
                    {messages.map((m, i) => (
                        <li key={i}>{m}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
