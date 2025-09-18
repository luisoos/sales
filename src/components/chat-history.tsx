import { useEffect, useState } from 'react';
import { Skeleton } from './ui/skeleton';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '~/components/ui/accordion';
import FormattedDate from './formatted-date';
import { MentorChat } from '@prisma/client';
import { RoleMessage } from '~/types/conversation';

const chatHistoryBoxMaxCharacterLength = 55;

export default function ChatHistory({
    chatId,
}: {
    chatId: string | undefined;
}) {
    const [latestChats, setLatestChats] = useState<MentorChat[]>();
    const [error, setError] = useState<string>();
    const [loading, setLoading] = useState<boolean>(true);
    const [initialRender, setInitialRender] = useState<boolean>(true);

    useEffect(() => {
        const fetchMentorChats = async () => {
            try {
                setLoading(true);
                const mentorChats = await fetch('/api/protected/mentor');
                const data = await mentorChats.json();
                setLatestChats(data.mentorChats);
            } catch (error: any) {
                setError('Failed to fetch conversations.');
            } finally {
                setLoading(false);
                setInitialRender(false);
            }
        };
        fetchMentorChats();
    }, [chatId]);

    if (error || (latestChats && latestChats.length < 1)) {
        return <></>;
    }

    return (
        <Accordion
            type='single'
            collapsible
            className='mx-6 backdrop-blur'
            defaultValue='item-1'>
            <AccordionItem value='item-1'>
                <AccordionTrigger className='data-[state=closed]:text-zinc-500 data-[state=open]:text-zinc-800 pt-1 hover:no-underline hover:text-zinc-700 transition-all duration-100'>
                    Latest Chats
                </AccordionTrigger>
                <AccordionContent className=''>
                    <SkeletonOrContent
                        loading={loading}
                        initialRender={initialRender}
                        latestChats={latestChats}
                    />
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}

function SkeletonOrContent({
    loading,
    initialRender,
    latestChats,
}: {
    loading: boolean;
    initialRender: boolean;
    latestChats: MentorChat[] | undefined;
}) {
    if ((loading && initialRender) || !latestChats) {
        return (
            <div className='flex gap-4'>
                <Skeleton className='w-52 h-24 border rounded-md' />
                <Skeleton className='w-52 h-24 border rounded-md' />
                <Skeleton className='w-52 h-24 border rounded-md' />
            </div>
        );
    }

    return (
        <div className='max-w-[87vw] md:max-w-[calc(100vw-375px)] flex gap-4 pb-1 text-balance overflow-x-auto scrollbar-thin scrollbar-thumb-rounded'>
            {latestChats.length > 0 &&
                latestChats.map((chat) => (
                    <ChatHistoryBox
                        key={chat.id}
                        messages={chat.messages as RoleMessage[]}
                        updatedAt={chat.updatedAt}
                    />
                ))}
        </div>
    );
}

function ChatHistoryBox({
    messages,
    updatedAt,
}: {
    messages: RoleMessage[];
    updatedAt: Date | string;
}) {
    const firstMessage = messages[0]?.content || 'No messages in chat';
    return (
        <div className='w-52 h-24 flex flex-col px-4 py-2 shrink-0 justify-between border shadow-inner rounded-md'>
            <p className='tracking-tight'>
                {firstMessage.length > chatHistoryBoxMaxCharacterLength
                    ? firstMessage.substring(
                          0,
                          chatHistoryBoxMaxCharacterLength,
                      ) + '...'
                    : firstMessage}
            </p>
            <span className='text-zinc-500 font-mono text-xs'>
                <FormattedDate pDate={updatedAt} />
            </span>
        </div>
    );
}
