import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { Message } from '~/types/mentor';

interface ChatMessage extends Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export default function useMentorStream() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [streamingMessage, setStreamingMessage] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [chatId, setChatId] = useState<string | undefined>();

    const sendMessage = useCallback(
        async (message: string) => {
            if (!message.trim()) return;

            const randomStr = Math.random().toString(36).substring(2, 8);
            const messageId = chatId
                ? `msg-${chatId}-${Date.now()}-${randomStr}`
                : `temp-${Date.now()}-${randomStr}`;
            const userMessage: ChatMessage = {
                id: messageId,
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
                        mentorChatId: chatId,
                    }),
                });

                if (!response.ok) {
                    if (response.status === 429) {
                        const data = await response.json();
                        return toast.error(data.error);
                    }
                    throw new Error('Failed to send message');
                }

                const reader = response.body?.getReader();
                if (!reader) {
                    throw new Error('No response body');
                }

                const assistantRandomStr = Math.random()
                    .toString(36)
                    .substring(2, 8);
                const assistantMessage: ChatMessage = {
                    id: chatId
                        ? `msg-${chatId}-${Date.now() + 1}-${assistantRandomStr}`
                        : `temp-${Date.now() + 1}-${assistantRandomStr}`,
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
                            const chatIdMatch =
                                chunk.match(/__CHAT_ID__:(\S+)/);
                            if (!chatIdMatch || !chatIdMatch[1]) {
                                console.error('Invalid chat ID format');
                                return;
                            }
                            const newChatId = chatIdMatch[1].trim();
                            setChatId(newChatId);

                            // Update message IDs to use the new chat ID
                            setMessages((prev) => {
                                const timestamp = Date.now();
                                return prev.map((msg, index) => {
                                    if (!msg.id.startsWith('temp-')) return msg;
                                    const randomStr = Math.random()
                                        .toString(36)
                                        .substring(2, 8);
                                    return {
                                        ...msg,
                                        id: `msg-${newChatId}-${timestamp}-${index}-${randomStr}`,
                                    };
                                });
                            });
                        } else {
                            setMessages((prev) =>
                                prev.map((msg) =>
                                    msg.id === assistantMessage.id
                                        ? {
                                              ...msg,
                                              content: msg.content + chunk,
                                          }
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

    useEffect(() => {
        console.log(chatId, streamingMessage);
        if (chatId && !streamingMessage) {
            const fetchMessages = async () => {
                try {
                    const response = await fetch(
                        `/api/protected/mentor/${chatId}`,
                    );
                    const data = await response.json();

                    if (!data.messages || !Array.isArray(data.messages)) {
                        throw new Error('Invalid response format');
                    }

                    // Ensure messages have the correct type and stable IDs
                    const messagesWithIds = data.messages.map(
                        (msg: any, index: number) => {
                            // Provide defaults for missing fields
                            const messageId =
                                msg.id ||
                                `msg-${chatId}-${index}-${Date.now()}`;
                            const role = msg.role || 'assistant';
                            const content = msg.content || '';

                            return {
                                ...msg,
                                id: messageId,
                                role: role,
                                content: content,
                            } as ChatMessage;
                        },
                    );

                    setMessages(messagesWithIds);
                } catch (error) {
                    console.error('Error fetching messages:', error);
                }
            };
            fetchMessages();
        }
    }, [chatId, streamingMessage]);

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
