import { useState, useCallback } from 'react';
import { Message } from '~/types/mentor';

export default function useMentorStream() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [streamingMessage, setStreamingMessage] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [chatId, setChatId] = useState<string | undefined>();

    const sendMessage = useCallback(
        async (message: string) => {
            if (!message.trim()) return;

            const userMessage: Message = {
                id: Date.now().toString(),
                role: 'user',
                content: message,
            };

            setMessages((prev) => [...prev, userMessage]);
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch('/api/protected/mentor', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        messageHistory: messages,
                        message: message,
                        chatId: chatId,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to send message');
                }

                const reader = response.body?.getReader();
                if (!reader) {
                    throw new Error('No response body');
                }

                const assistantMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: '',
                };

                setMessages((prev) => [...prev, assistantMessage]);
                setStreamingMessage(true);

                const decoder = new TextDecoder();
                let done = false;

                while (!done) {
                    const { value, done: readerDone } = await reader.read();
                    done = readerDone;

                    if (value) {
                        const chunk = decoder.decode(value);

                        if (chunk.includes('__CHAT_ID__:')) {
                            setChatId(chunk.split('__CHAT_ID__:')[1]);
                        } else {
                            setMessages((prev) =>
                                prev.map((msg) =>
                                    msg.id === assistantMessage.id
                                        ? { ...msg, content: msg.content + chunk }
                                        : msg,
                                ),
                            );
                        }
                    }
                }
            } catch (err) {
                console.error('Error sending message:', err);
                setError(
                    err instanceof Error ? err.message : 'An error occurred',
                );
            } finally {
                setIsLoading(false);
                setStreamingMessage(false);
            }
        },
        [messages],
    );

    const clearMessages = useCallback(() => {
        setMessages([]);
        setError(null);
        setChatId(undefined);
    }, []);

    return {
        messages,
        isLoading,
        streamingMessage,
        error,
        chatId,
        setChatId,
        sendMessage,
        clearMessages,
    };
}
