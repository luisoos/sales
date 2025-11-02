'use client';

import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Card } from '~/components/ui/card';
import { Badge } from '~/components/ui/base/badges/badges';
import { Separator } from '~/components/ui/separator';
import { Send, Bot, User, Trash2, Loader2 } from 'lucide-react';
import useMentorStream from '~/hooks/use-mentor-stream';
import { cn, normaliseSpacing } from '~/lib/utils';
import { Streamdown } from 'streamdown';
import ChatHistory from '~/components/chat-history';

export default function Page() {
    const [input, setInput] = useState('');
    const {
        messages,
        isLoading,
        streamingMessage,
        error,
        chatId,
        setChatId,
        sendMessage,
        clearMessages,
    } = useMentorStream();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            sendMessage(input);
            setInput('');
        }
    }

    function handleKeyPress(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    }

    return (
        <div className='flex flex-col h-full'>
            {/* Header */}
            <div className='px-6 py-4'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <Bot className='h-8 w-8 text-brand' />
                        <div>
                            <h1 className='text-xl font-semibold text-gray-900'>
                                AI Mentor
                            </h1>
                            <p className='text-sm text-gray-500'>
                                Get personalized guidance and support
                            </p>
                        </div>
                    </div>
                    <div className='flex items-center gap-2'>
                        {streamingMessage && (
                            <Badge
                                type='pill-color'
                                color='brand'
                                className='flex items-center gap-1'>
                                <Loader2 className='h-3 w-3 animate-spin' />
                                AI is typing...
                            </Badge>
                        )}
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={clearMessages}
                            disabled={messages.length === 0 || isLoading}
                            className='flex items-center gap-2'>
                            <Trash2 className='h-4 w-4' />
                            Clear
                        </Button>
                    </div>
                </div>
            </div>
            <ChatHistory chatId={chatId} setChatId={setChatId} />
            {/* Messages */}
            <div className='flex-1 overflow-y-auto p-6 space-y-4'>
                {messages.length === 0 ? (
                    <div className='flex flex-col items-center justify-center h-full text-center'>
                        <Bot className='h-16 w-16 text-gray-300 mb-4' />
                        <h3 className='text-lg font-medium text-gray-900 mb-2'>
                            Welcome to AI Mentor
                        </h3>
                        <p className='text-gray-500 max-w-md'>
                            Start a conversation by typing a message below. I'm
                            here to help you with any questions or guidance you
                            need.
                        </p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className={cn(
                                'flex',
                                message.role === 'user'
                                    ? 'justify-end'
                                    : 'justify-start',
                            )}>
                            <Card
                                className={cn(
                                    'max-w-[80%] p-4 shadow-inner',
                                    message.role === 'user'
                                        ? 'bg-brand-dark text-white'
                                        : 'bg-white border',
                                )}>
                                <div className='flex items-start gap-3'>
                                    {message.role === 'assistant' && (
                                        <Bot className='h-5 w-5 text-brand mt-0.5 flex-shrink-0' />
                                    )}
                                    {message.role === 'user' && (
                                        <User className='h-5 w-5 text-white mt-0.5 flex-shrink-0' />
                                    )}
                                    <div className='flex-1'>
                                        <div className='text-sm font-medium mb-1'>
                                            {message.role === 'user'
                                                ? 'You'
                                                : 'AI Mentor'}
                                        </div>
                                        <div className='whitespace-pre-wrap break-words'>
                                            <Streamdown key={message.id}>
                                                {normaliseSpacing(
                                                    message.content,
                                                )}
                                            </Streamdown>
                                            {message.id ===
                                                messages[messages.length - 1]
                                                    ?.id &&
                                                streamingMessage && (
                                                    <span className='inline-block w-2 h-4 bg-current animate-pulse ml-1' />
                                                )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    ))
                )}

                {error && (
                    <div className='flex justify-center'>
                        <Card className='max-w-[80%] p-4 bg-red-50 border-red-200'>
                            <div className='flex items-center gap-2 text-red-600'>
                                <div className='h-2 w-2 bg-red-600 rounded-full' />
                                <span className='text-sm'>Error: {error}</span>
                            </div>
                        </Card>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className='sticky bottom-0 p-5 pt-0 bg-white'>
                <form onSubmit={handleSubmit} className='flex gap-3'>
                    <div className='flex-1 relative'>
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder='Type your message here...'
                            disabled={isLoading}
                            className='pr-12 focus-visible:ring-0 focus-within:border-brand'
                        />
                        {isLoading && (
                            <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
                                <Loader2 className='h-4 w-4 animate-spin text-gray-400' />
                            </div>
                        )}
                    </div>
                    <Button
                        type='submit'
                        disabled={!input.trim() || isLoading}
                        className='px-6'>
                        <Send className='h-4 w-4' />
                    </Button>
                </form>
                {messages.length === 0 && (
                    <div className='mt-1 flex flex-wrap gap-2 text-xs text-zinc-700'>
                        <MessageExample
                            text='Analyse all my conversations and tell me how to improve'
                            onClick={(text) => setInput(text)}
                        />
                        <MessageExample
                            text='What inaccuracies did my sales technique have recently?'
                            onClick={(text) => setInput(text)}
                        />
                        <MessageExample
                            text='What did I do wrong in unclosed calls?'
                            onClick={(text) => setInput(text)}
                        />
                    </div>
                )}
                <p className='text-xs text-gray-500 mt-2 text-center'>
                    Press Enter to send, Shift+Enter for new line
                </p>
            </div>
        </div>
    );
}

function MessageExample({
    text,
    onClick,
}: {
    text: string;
    onClick: (text: string) => void;
}) {
    return (
        <div
            className='py-0.5 px-2 border rounded-full shadow-inner hover:scale-[.99] transition-all cursor-pointer hover:bg-gray-50'
            onClick={() => onClick(text)}>
            {text}
        </div>
    );
}
