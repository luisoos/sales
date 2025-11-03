'use client';

import { useEffect, useState, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import PushToTalkButton from './push-to-talk-button';
import { cn, standardiseWord } from '~/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '~/components/ui/dialog';
import { ArrowLeft } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Lesson } from '~/types/lessons';

type CallProps = {
    lesson: Lesson;
    showNotes: boolean;
};

export default function Call({ lesson, showNotes }: CallProps) {
    const lessonId = lesson.id;
    const [messages, setMessages] = useState<string[]>([]);
    const [disableButton, setDisableButton] = useState<boolean>(false);
    const [characterSpeaks, setCharacterSpeaks] = useState<boolean>(false);
    const socketRef = useRef<Socket | null>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioContext = new AudioContext();

    const callEndedRef = useRef(false);
    const messagesRef = useRef(messages);
    const [callEndedDialogOpen, setCallEndedDialogOpen] = useState(false);
    const [callEndedDialogStatus, setCallEndedDialogStatus] = useState<
        'CLOSE' | 'NOT CLOSED'
    >('NOT CLOSED');
    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    function handleCallEnd(status: 'CLOSE' | 'NOT CLOSED') {
        if (callEndedRef.current) return;
        callEndedRef.current = true;

        stopRecording();
        setDisableButton(true);
        socketRef.current?.disconnect();

        toast.info(`Call ended with status: ${standardiseWord(status)}`);

        setCallEndedDialogOpen(true);
        setCallEndedDialogStatus(status);
    }

    useEffect(() => {
        if (socketRef.current) return;
        
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
            if (socketRef.current?.connected) {
                if (!callEndedRef.current && messagesRef.current.length > 0) {
                    callEndedRef.current = true;
                    socketRef.current?.disconnect();
                } else {
                    socketRef.current?.disconnect();
                }
            }
        };
    }, []);

    // Update selected lesson if it changes while the socket is active
    useEffect(() => {
        if (lessonId && socketRef.current) {
            socketRef.current.emit('selectLesson', lessonId);
        }
    }, [lessonId]);

    // Due to react strict mode in development, each request is being sent twice.
    // This results in a duplicated conversation log.
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            const uniqueMessages = [...new Set(messages)];
            if (uniqueMessages.length !== messages.length)
                // No endless loop
                setMessages(uniqueMessages);
        }
    }, [messages]);

    const audioChunksRef = useRef<Blob[]>([]);

    function cleanupRecording() {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        recorderRef.current = null;
        audioChunksRef.current = [];
    }

    async function startRecording() {
        if (recorderRef.current) {
            return;
        }
        audioChunksRef.current = []; // Clear chunks for new recording
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
            toast.error(
                'Your browser does not support recording in webm/opus format.',
            );
            cleanupRecording();
            return;
        }
        const recorder = new MediaRecorder(stream, options);
        recorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                audioChunksRef.current.push(e.data);
            }
        };

        recorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, {
                type: 'audio/webm;codecs=opus',
            });
            socketRef.current?.emit('audio', audioBlob);
            socketRef.current?.emit('stop'); // Tell server to process the audio
            cleanupRecording();
        };

        recorder.start(500);
    }

    function stopRecording() {
        if (recorderRef.current && recorderRef.current.state !== 'inactive') {
            recorderRef.current.stop();
        }
    }

    function stopResponse() {
        stopRecording();
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
            <CallEndedDialog
                status={callEndedDialogStatus}
                open={callEndedDialogOpen}
                setOpen={setCallEndedDialogOpen}
            />
            <div
                className={cn(
                    'w-5/6 mx-auto mb-12 border rounded-xl bg-gradient-to-tr from-white to-zinc-50 shadow-inner',
                    characterSpeaks ? 'border border-green-500' : 'border',
                )}>
                <img
                    src={lesson?.character.avatarUrl}
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

            <div
                className={cn(
                    'w-5/6 mx-auto mt-16 mb-8',
                    'flex flex-col-reverse lg:flex-row gap-4', // always applied
                )}>
                <div className='lg:w-1/2'>
                    <p className='font-medium text-lg'>Conversation Log</p>
                    <ul>
                        {messages.map((m, i) => {
                            const [firstWord, ...restWords] = m.split(' ');
                            const rest = restWords.join(' ');
                            return (
                                <li key={i}>
                                    <strong>{firstWord}</strong>
                                    {rest ? ' ' + rest : ''}
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <AnimatePresence>
                    {showNotes && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            key='notes'
                            className={showNotes ? 'lg:w-1/2' : 'lg:w-full'}>
                            <p className='font-medium text-lg'>Notes</p>
                            <table className='border-separate border-spacing-y-2'>
                                <tbody>
                                    <NoteRow
                                        label='Call Goal'
                                        value={lesson?.goal}
                                    />
                                    <NoteRow
                                        label='About the Company'
                                        value={lesson?.companyDescription}
                                    />
                                    <NoteRow
                                        label='Primary Pain Points'
                                        value={lesson?.primaryPainPoints.join(
                                            ', ',
                                        )}
                                    />
                                    <NoteRow
                                        label='Summary'
                                        value={lesson?.summary}
                                    />
                                    <NoteRow
                                        label='Product Features'
                                        value={lesson?.product.features}
                                    />
                                </tbody>
                            </table>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function CallEndedDialog({
    status,
    open,
    setOpen,
}: {
    status: 'CLOSE' | 'NOT CLOSED';
    open: boolean;
    setOpen: (open: boolean) => void;
}) {
    const AI_COACH_NAME: string = 'Mentor (AI Coach)';

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className='sm:max-w-[425px] p-8'>
                    <DialogHeader>
                        {status === 'CLOSE' ? (
                            <>
                                <img
                                    src='/call-success-image.png'
                                    alt=' '
                                    className='mx-auto mb-4 h-32 w-32'
                                />
                                <DialogTitle>
                                    Closed lead successfully
                                </DialogTitle>
                                <DialogDescription>
                                    {`You achieved the goal of this call. Review the tips from the ${AI_COACH_NAME}.`}
                                </DialogDescription>
                            </>
                        ) : (
                            <>
                                <img
                                    src='/call-failed-image.png'
                                    alt=' '
                                    className='mx-auto mb-4 h-32 w-32 brightness-125'
                                />
                                <DialogTitle>Failed to close lead</DialogTitle>
                                <DialogDescription>
                                    {`You were not able to achieve the call goal. Try again. Visit the ${AI_COACH_NAME} to learn from this call.`}
                                </DialogDescription>
                            </>
                        )}
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            onClick={() => {
                                window.location.assign('/dashboard/calls');
                            }}
                            className='w-full flex items-center focus-visible:ring-0'
                            variant={
                                status === 'CLOSE' ? 'brand' : 'destructive'
                            }>
                            <ArrowLeft size={16} /> Return to call list
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function NoteRow({
    label,
    value,
}: {
    label: string;
    value: string | string[] | undefined;
}) {
    return (
        <tr>
            <td className='w-40 align-top font-medium pr-2'>{label}:</td>
            <td className='align-top list-inside'>
                {Array.isArray(value)
                    ? value.map((item, index) => <li key={index}>{item}</li>)
                    : value}
            </td>
        </tr>
    );
}
