'use client';

import { useEffect, useState, useRef } from 'react';
import { useNotesPopoverStore } from '~/lib/store/notes-popover.store';
import { io, type Socket } from 'socket.io-client';
import PushToTalkButton from './push-to-talk-button';
import { cn } from '~/lib/utils';
import { toast } from 'sonner';
import { TextArea } from 'react-aria-components';

type CallProps = {
    lessonId?: number;
};

export default function Call({ lessonId }: CallProps) {
    const { isOpen } = useNotesPopoverStore();
    const [messages, setMessages] = useState<string[]>([]);
    const [disableButton, setDisableButton] = useState<boolean>(false);
    const [characterSpeaks, setCharacterSpeaks] = useState<boolean>(false);
    const socketRef = useRef<Socket | null>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioContext = new AudioContext();

    const callEndedRef = useRef(false);
    const messagesRef = useRef(messages);
    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    function handleCallEnd(status: 'CLOSE' | 'NOT CLOSED') {
        if (callEndedRef.current) return;
        callEndedRef.current = true;

        stopRecording();
        setDisableButton(true);
        socketRef.current?.disconnect();

        // TODO: Send conversation log to the database
        const logData = {
            status: status,
            conversation: messagesRef.current,
            endedAt: new Date(),
        };
        console.log('--- Call Log ---', logData);
        toast.info(`Call ended with status: ${status}`);
    }

    useEffect(() => {
        // Connect to websocket
        const socket = io({
            path: '/api/socket',
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Verbunden:', socket.id);
            if (lessonId) {
                socket.emit('selectLesson', lessonId);
            }
        });

        socket.on('transcription', (msg: string) => {
            setMessages((prev) => [...prev, 'You: ' + msg]);
        });

        socket.on('text', (msg: string) => {
            if (msg.includes('<stop_call_close>')) {
                const cleanMsg = msg.replace(/<stop_call_close>/g, '').trim();
                setMessages((prev) => [...prev, 'Character: ' + cleanMsg]);
                handleCallEnd('CLOSE');
            } else if (msg.includes('<stop_call_no_close>')) {
                const cleanMsg = msg
                    .replace(/<stop_call_no_close>/g, '')
                    .trim();
                setMessages((prev) => [...prev, 'Character: ' + cleanMsg]);
                handleCallEnd('NOT CLOSED');
            } else {
                setMessages((prev) => [...prev, 'Character: ' + msg]);
            }
        });

        socket.on('tts', async (msg: ArrayBuffer) => {
            setCharacterSpeaks(true);

            playArrayBuffer(msg);

            setCharacterSpeaks(false);
        });

        socket.on('stopped', (msg) => {
            // setMessages((prev) => [...prev, '🛑 Server: ' + msg.message]);
            stopRecording();
            setDisableButton(true);
        });

        socket.on('err', (msg) => {
            console.log(msg);
            toast.error(msg);
            stopRecording();
            setDisableButton(false);
            setCharacterSpeaks(false);
        });

        return () => {
            if (!callEndedRef.current) {
                handleCallEnd('NOT CLOSED');
            }
        };
    }, []);

    // Update selected lesson if it changes while the socket is active
    useEffect(() => {
        if (lessonId && socketRef.current) {
            socketRef.current.emit('selectLesson', lessonId);
        }
    }, [lessonId]);

    async function startRecording() {
        let stream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
        } catch (e) {
            toast.error(
                'We could not access your microphone. Check if you allowed access to it.',
            );
            return;
        }
        streamRef.current = stream;
        const options = { mimeType: 'audio/webm;codecs=opus' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            toast.error('Your browser does not support recording in webm/opus format.');
            return;
        }
        const recorder = new MediaRecorder(stream, options);
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
        audioContext.decodeAudioData(
            arrayBuffer,
            (audioBuffer) => {
                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContext.destination);
                source.start(0);
                source.onended = () => {
                    setDisableButton(false);
                };
            },
            (error) => {
                console.error('Error decoding audio data', error);
            },
        );
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
                    'w-5/6 mx-auto mb-12 border rounded-xl bg-gradient-to-tr from-white to-zinc-50 shadow-inner',
                    characterSpeaks ? 'border border-green-500' : 'border',
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
            <div className={cn('w-5/6 mx-auto mt-16 transition-all', isOpen && 'w-4/6')}>
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
