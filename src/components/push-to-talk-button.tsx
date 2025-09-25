'use client';

import { Mic } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

type PushToTalkButtonProps = {
    start: () => Promise<void> | void;
    stop: () => void;
    disabled: boolean;
    getStream: () => MediaStream | null;
};

export default function PushToTalkButton({
    start,
    stop,
    disabled,
    getStream,
}: PushToTalkButtonProps) {
    const [volume, setVolume] = useState(0);
    const [active, setActive] = useState<boolean>(false);

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
    const animationIdRef = useRef<number | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    // We do not acquire our own stream; we visualise the parent's stream

    const getAverageVolume = (array: Uint8Array) => {
        if (!array) return 0;
        let values = 0;
        for (let i = 0; i < array.length; i++) {
            values += array[i]!;
        }
        return values / array.length;
    };

    const updateVolume = () => {
        if (!analyserRef.current || !dataArrayRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        const avg = getAverageVolume(dataArrayRef.current);
        setVolume(avg);
        animationIdRef.current = requestAnimationFrame(updateVolume);
    };

    const startMonitoring = async () => {
        try {
            const stream = getStream();
            if (!stream) return;

            audioContextRef.current = new AudioContext();
            sourceRef.current =
                audioContextRef.current.createMediaStreamSource(stream);

            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;

            dataArrayRef.current = new Uint8Array(
                analyserRef.current.frequencyBinCount,
            );

            sourceRef.current.connect(analyserRef.current);

            updateVolume();
        } catch (err) {
            console.error('Error initialising analyser:', err);
        }
    };

    const stopMonitoring = () => {
        if (animationIdRef.current !== null) {
            cancelAnimationFrame(animationIdRef.current);
            animationIdRef.current = null;
        }
        if (sourceRef.current) {
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        dataArrayRef.current = null;
        analyserRef.current = null;
        setVolume(0);
    };

    const handlePressStart = async () => {
        if (active) return;
        setActive(true);
        const maybePromise = start();
        if (maybePromise && typeof (maybePromise as any).then === 'function') {
            await maybePromise;
        }
        await startMonitoring();
    };

    const handlePressEnd = () => {
        if (!active) return;
        setActive(false);
        stop();
        stopMonitoring();
    };

    // If the parent disables the button while we are active, force stop
    useEffect(() => {
        if (disabled && active) {
            setActive(false);
            try {
                stop();
            } catch {}
            stopMonitoring();
        }
    }, [disabled]);

    // Cleanup on unmount to ensure mic is released
    useEffect(() => {
        return () => {
            stopMonitoring();
        };
    }, []);

    return (
        <div style={{ display: 'inline-block', textAlign: 'center' }}>
            <button
                onMouseDown={handlePressStart}
                onMouseUp={handlePressEnd}
                onMouseLeave={handlePressEnd}
                onTouchStart={handlePressStart}
                onTouchEnd={handlePressEnd}
                style={{ padding: 10, fontSize: 16 }}
                className='rounded-xl w-80 border bg-gradient-to-br from-white to-zinc-50 shadow-inner h-[100px]'
                disabled={disabled}>
                {active ? (
                    <Bars sensitivity={Math.min(volume / 2, 50)} />
                ) : (
                    <div className='text-sm'>
                        <Mic className='mx-auto text-indigo-700' />
                        Push to talk
                    </div>
                )}
            </button>
        </div>
    );
}

export function Bars({ sensitivity }: { sensitivity: number }) {
    const [history, setHistory] = useState<number[]>([]);

    // Whenever sensitivity changes, keep only the last 5 values
    useEffect(() => {
        setHistory((h) => [...h.slice(-4), sensitivity]);
    }, [sensitivity]);

    return (
        <>
            <div className='mx-auto flex items-end gap-1 w-min h-16'>
                {history.map((v, i) => (
                    <div
                        key={i}
                        className='w-1 bg-indigo-700 rounded-full'
                        style={{ height: `${Math.max(1, Math.round(v))}px` }}
                    />
                ))}
            </div>
            <div
                className={`mx-auto -mt-16 w-12 h-12 bg-indigo-300 rounded-full animate-ping ${sensitivity * 3 < 35 ? 'duration-1000' : 'duration-500'}`}></div>
        </>
    );
}
