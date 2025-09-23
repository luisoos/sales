import { ExternalLink, Trash, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '~/lib/utils';
import { RoleMessage } from '~/types/conversation';
import FormattedDate from './formatted-date';
import {
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogTitle,
} from './ui/alert-dialog';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from './ui/context-menu';
import { Button } from './ui/button';

const chatHistoryBoxMaxCharacterLength = 55;

export function ChatHistoryBox({
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
