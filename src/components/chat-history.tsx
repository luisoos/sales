import { useEffect, useRef, useState } from 'react';
import { Skeleton } from './ui/skeleton';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '~/components/ui/accordion';
import { MentorChat } from '@prisma/client';
import { RoleMessage } from '~/types/conversation';
import { Button } from './ui/button';
import { AnimatePresence, motion } from 'motion/react';
import { useDraggable } from 'react-use-draggable-scroll';
import { ChatHistoryBox } from './chat-history-box';
import { Loader2 } from 'lucide-react';

const chatHistoryLimit = 10;

export default function ChatHistory({
    chatId,
    setChatId,
}: {
    chatId: string | undefined;
    setChatId: (id: string) => void;
}) {
    const [latestChats, setLatestChats] = useState<MentorChat[]>([]);
    const [error, setError] = useState<string>();
    const [loading, setLoading] = useState<boolean>(true);
    const [initialRender, setInitialRender] = useState<boolean>(true);

    const [chatHistoryOffset, setChatHistoryOffset] =
        useState<number>(chatHistoryLimit);
    const [hasMoreData, setHasMoreData] = useState<boolean>(true);
    const [reloading, setReload] = useState<boolean>(false);

    useEffect(() => {
        const fetchMentorChats = async () => {
            try {
                setLoading(true);
                const mentorChats = await fetch(
                    `/api/protected/mentor?limit=${chatHistoryLimit}`,
                );
                const data = await mentorChats.json();
                // Type and sanitize incoming data
                const incoming = (data.mentorChats ?? []) as MentorChat[];
                const sanitized = incoming.filter(
                    (c): c is MentorChat =>
                        typeof (c as any)?.id === 'string' &&
                        (c as any).id.length > 0,
                );
                // Deduplicate by id in case the API returns overlapping items
                const unique = Array.from(
                    new Map(sanitized.map((c) => [c.id, c] as const)).values(),
                );
                setLatestChats(unique);
                setHasMoreData(
                    mentorChats.headers.get('X-Has-More') === 'true',
                );
            } catch (error: any) {
                setError('Failed to fetch conversations.');
            } finally {
                setLoading(false);
                setInitialRender(false);
                setChatHistoryOffset(chatHistoryLimit);
                setReload(false);
            }
        };
        fetchMentorChats();
    }, [chatId, reloading]);

    const fetchMoreMentorChats = async () => {
        try {
            setLoading(true);
            const mentorChats = await fetch(
                `/api/protected/mentor?offset=${chatHistoryOffset}&limit=${chatHistoryLimit}`,
            );
            const data = await mentorChats.json();
            const incoming = (data.mentorChats ?? []) as MentorChat[];
            const sanitized = incoming.filter(
                (c): c is MentorChat =>
                    typeof (c as any)?.id === 'string' &&
                    (c as any).id.length > 0,
            );
            // Merge while ensuring uniqueness by id
            setLatestChats((prev) => {
                const map = new Map(prev.map((c) => [c.id, c] as const));
                for (const c of sanitized) {
                    if (!map.has(c.id)) map.set(c.id, c);
                }
                return Array.from(map.values());
            });
            setHasMoreData(mentorChats.headers.get('X-Has-More') === 'true');
            setChatHistoryOffset(chatHistoryOffset + chatHistoryLimit);
        } catch (error: any) {
            setError('Failed to fetch conversations.');
        } finally {
            setLoading(false);
        }
    };

    if (error) {
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
                <AccordionContent>
                    <SkeletonOrContent
                        loading={loading}
                        initialRender={initialRender}
                        latestChats={latestChats}
                        setChatId={setChatId}
                        hasMoreData={hasMoreData}
                        loadMoreDataAction={fetchMoreMentorChats}
                        initiateReload={setReload}
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
    setChatId,
    hasMoreData,
    loadMoreDataAction,
    initiateReload,
}: {
    loading: boolean;
    initialRender: boolean;
    latestChats: MentorChat[] | undefined;
    setChatId: (id: string) => void;
    hasMoreData: boolean;
    loadMoreDataAction: () => void;
    initiateReload: (reload: boolean) => void;
}) {
    const ref = useRef<HTMLDivElement>(
        null,
    ) as React.MutableRefObject<HTMLInputElement>;
    const { events } = useDraggable(ref);

    return (
        <div
            ref={ref}
            {...events}
            onWheel={(e) => {
                e.preventDefault();
                e.currentTarget.scrollLeft += e.deltaY;
            }}
            className='max-w-[87vw] md:max-w-[calc(100vw-375px)] flex gap-4 pb-1 px-2 text-balance overflow-x-auto overscroll-contain scrollbar-thin scrollbar-thumb-rounded'>
            <AnimatePresence initial={false}>
                {(loading && initialRender) || !latestChats ? (
                    <motion.div key='skeletons' className='flex gap-4'>
                        <Skeleton className='w-52 h-24 border rounded-md' />
                        <Skeleton className='w-52 h-24 border rounded-md' />
                        <Skeleton className='w-52 h-24 border rounded-md' />
                    </motion.div>
                ) : (
                    latestChats.length > 0 &&
                    latestChats.map((chat) => (
                        <motion.div
                            key={chat.id}
                            layout
                            initial={{ opacity: 0, x: 500 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 30,
                            }}>
                            <ChatHistoryBox
                                chatId={chat.id}
                                messages={chat.messages as RoleMessage[]}
                                updatedAt={chat.updatedAt}
                                onClick={() => setChatId(chat.id)}
                                initiateReload={initiateReload}
                            />
                        </motion.div>
                    ))
                )}
            </AnimatePresence>
            {!initialRender && hasMoreData && (
                <Button
                    onClick={loadMoreDataAction}
                    className='my-auto'
                    disabled={loading}>
                    {loading && <Loader2 className='h-3 w-3 animate-spin' />}
                    Load more chats
                </Button>
            )}
        </div>
    );
}
