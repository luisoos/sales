import { useEffect, useRef, useState } from 'react';
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
import { cn } from '~/lib/utils';
import { Button } from './ui/button';
import { AnimatePresence, motion } from 'motion/react';
import { useDraggable } from 'react-use-draggable-scroll';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from './ui/context-menu';
import { ExternalLink, Loader2, Trash } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from './ui/alert-dialog';
import { toast } from 'sonner';

const chatHistoryBoxMaxCharacterLength = 55;
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
            {!loading && hasMoreData && (
                <Button onClick={loadMoreDataAction} className='my-auto'>
                    Load more chats
                </Button>
            )}
        </div>
    );
}

function ChatHistoryBox({
    messages,
    updatedAt,
    chatId,
    onClick,
    initiateReload,
}: {
    messages: RoleMessage[];
    updatedAt: Date | string;
    chatId: string;
    onClick: () => void;
    initiateReload: (reload: boolean) => void;
}) {
    const [showDeleteAlert, setShowDeleteAlert] = useState<boolean>(false);
    const firstMessage = messages[0]?.content || 'No messages in chat';

    return (
        <>
            <ContextMenu modal={false}>
                <ContextMenuTrigger
                    className={cn(
                        'w-52 h-24 flex flex-col px-4 py-2 shrink-0 justify-between',
                        'border shadow-inner rounded-md',
                        'cursor-pointer hover:bg-accent hover:text-accent-foreground active:scale-[.98] transition-all',
                    )}
                    onClick={onClick}
                    aria-label={`Select chat ${chatId}`}>
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
                </ContextMenuTrigger>
                <ContextMenuContent>
                    <ContextMenuItem onClick={onClick}>
                        <ExternalLink className='text-zinc-800' /> Open Chat
                    </ContextMenuItem>
                    <ContextMenuItem
                        variant='destructive'
                        className='cursor-pointer'
                        onSelect={(event) => {
                            event.preventDefault(); // Verhindert das Schließen des Context Menus
                            setShowDeleteAlert(true);
                        }}>
                        <Trash
                            strokeWidth={2.25}
                            className='text-destructive'
                        />
                        Delete Chat
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
            <DeleteChatAlertDialog
                chatId={chatId}
                showDeleteAlert={showDeleteAlert}
                setShowDeleteAlert={setShowDeleteAlert}
                initiateReload={initiateReload}
            />
        </>
    );
}

function DeleteChatAlertDialog({
    chatId,
    showDeleteAlert,
    setShowDeleteAlert,
    initiateReload,
}: {
    chatId: string;
    showDeleteAlert: boolean;
    setShowDeleteAlert: (showAlert: boolean) => void;
    initiateReload: (reload: boolean) => void;
}) {
    const [deletionLoading, setDeletionLoading] = useState<boolean>(false);

    const deleteChat = async () => {
        try {
            setDeletionLoading(true);
            const response = await fetch(`/api/protected/mentor/${chatId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Delete failed');
            }
            setShowDeleteAlert(false);
            initiateReload(true);
        } catch (error: any) {
            toast.error('Failed to delete the selected chat.');
        } finally {
            setDeletionLoading(false);
        }
    };
    return (
        <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete this and remove associated data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button onClick={deleteChat} disabled={deletionLoading}>
                        {deletionLoading && (
                            <Loader2 className='h-3 w-3 animate-spin' />
                        )}
                        Continue
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
