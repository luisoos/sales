'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { getLessonById } from '~/utils/prompts/lessons';
import { Table, TableCard } from '~/components/ui/application/table/table';
import { BadgeWithDot } from '~/components/ui/base/badges/badges';
import { Fragment, useEffect, useState } from 'react';
import { Conversation, ConversationStatus } from '@prisma/client';
import { BadgeColors } from '~/components/ui/base/badges/badge-types';
import { CloudAlert, MessageCircleOff } from 'lucide-react';
import Link from 'next/link';
import AnimatedDotsLoader from '~/components/animated-bars-loader';
import { standardiseWord, ucfirst, cn } from '~/lib/utils';
import FormattedDate from '~/components/formatted-date';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '~/components/ui/sheet';
import { ScrollArea } from '~/components/ui/scroll-area';
import { RoleMessage } from '~/types/conversation';

export default function Page() {
    const router = useRouter();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const conversations = await fetch(
                    '/api/protected/conversations',
                );
                const data = await conversations.json();
                setConversations(data.conversations);
            } catch (error: any) {
                setError('Failed to fetch conversations.');
            } finally {
                setLoading(false);
            }
        };
        fetchConversations();
    }, []);

    if (loading) {
        return (
            <div className='flex flex-col items-center justify-center h-full text-muted-foreground mb-24 text-center'>
                <AnimatedDotsLoader />
                <p>Loading your conversation log ...</p>
            </div>
        );
    }
    if (error) {
        return (
            <div className='flex flex-col items-center justify-center h-full text-muted-foreground mb-24 text-center'>
                <CloudAlert className='w-10 h-10 mx-auto mb-2' />
                <p>{error}</p>
                <p>
                    You may reload{' '}
                    <Link
                        href=''
                        onClick={() => window.location.reload()}
                        className='underline decoration-dotted'>
                        the page
                    </Link>{' '}
                    or try again later.
                </p>
            </div>
        );
    }
    if (conversations.length === 0) {
        return (
            <div className='flex flex-col items-center justify-center h-full text-muted-foreground mb-24 text-center'>
                <MessageCircleOff className='w-10 h-10 mx-auto mb-2' />
                <p>No Conversations Found</p>
                <p>
                    Start a{' '}
                    <Link
                        href='/dashboard/calls'
                        className='underline decoration-dotted'>
                        lesson
                    </Link>{' '}
                    to see it here.
                </p>
            </div>
        );
    }
    return (
        <div className='w-11/12 mx-auto'>
            <TableCard.Root className='w-full mt-2'>
                <TableCard.Header
                    title='Conversation Log'
                    badge={
                        conversations.length +
                        ' Conversation' +
                        (conversations.length !== 1 ? 's' : '')
                    }
                />
                <Table aria-label='Conversation Log'>
                    <Table.Header className='max-lg:hidden'>
                        <Table.Head
                            id='lesson'
                            label='Lesson'
                            isRowHeader
                            className='w-min'
                        />
                        <Table.Head id='status' label='Status' />
                        <Table.Head id='createdAt' label='Created At' />
                        <Table.Head id='action' label='Action' />
                    </Table.Header>

                    <Table.Body items={conversations}>
                        {(item) => {
                            return (
                                <Table.Row
                                    id={item.id}
                                    className='cursor-pointer'>
                                    <Table.Cell className='lg:w-min'>
                                        <ConversationMessagesSheet
                                            content={
                                                item.messages as RoleMessage[]
                                            }>
                                            <div className='flex lg:hidden'>
                                                <BadgeWithDot
                                                    color={getStatusBadgeColor(
                                                        item.status,
                                                    )}
                                                    size='sm'
                                                    className='mr-2'>
                                                    {standardiseWord(
                                                        item.status,
                                                    )}
                                                </BadgeWithDot>
                                                <span className='font-mono text-muted-foreground'>
                                                    <FormattedDate
                                                        pDate={item.createdAt}
                                                    />
                                                </span>
                                            </div>
                                            <span className='font-mono font-extralight'>
                                                #{item.lessonId}{' '}
                                            </span>
                                            {
                                                getLessonById(
                                                    Number(item.lessonId),
                                                )?.title
                                            }
                                        </ConversationMessagesSheet>
                                    </Table.Cell>
                                    <Table.Cell className='max-lg:hidden'>
                                        <BadgeWithDot
                                            color={getStatusBadgeColor(
                                                item.status,
                                            )}
                                            size='sm'>
                                            {standardiseWord(item.status)}
                                        </BadgeWithDot>
                                    </Table.Cell>
                                    <Table.Cell className='max-lg:hidden'>
                                        <FormattedDate pDate={item.createdAt} />
                                    </Table.Cell>
                                    <Table.Cell className='max-lg:hidden'>
                                        <ConversationMessagesSheet
                                            content={
                                                item.messages as RoleMessage[]
                                            }
                                            visualiseButton={true}>
                                            View Messages
                                        </ConversationMessagesSheet>
                                    </Table.Cell>
                                </Table.Row>
                            );
                        }}
                    </Table.Body>
                </Table>
            </TableCard.Root>
        </div>
    );
}

function getStatusBadgeColor(status: ConversationStatus): BadgeColors {
    switch (status) {
        case 'CLOSED':
            return 'brand';
        case 'NOT_CLOSED':
            return 'error';
        case 'UNFINISHED':
            return 'gray';
    }
}

function ConversationMessagesSheet({
    children,
    content,
    visualiseButton = false,
    className,
}: {
    children: React.ReactNode;
    content: RoleMessage[];
    visualiseButton?: boolean;
    className?: string;
}) {
    return (
        <Sheet>
            <SheetTrigger
                visualiseButton={visualiseButton}
                variant='outline'
                className='text-left'>
                {children}
            </SheetTrigger>
            <SheetContent className={className}>
                <SheetHeader>
                    <SheetTitle>Messages in this Conversation</SheetTitle>
                </SheetHeader>
                <ScrollArea className='h-[calc(100vh-4rem)] pr-4'>
                    <div className='text-sm text-muted-foreground'>
                        {content.map((msg, index) => (
                            <div key={index} className='mb-4'>
                                <span className='font-semibold text-foreground'>
                                    {getDisplayRole(msg.role)}:{' '}
                                </span>
                                <span>
                                    {msg.content
                                        .replace(
                                            /<stop_call_close>|<stop_call_no_close>/g,
                                            '',
                                        )
                                        .trim()}
                                </span>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}

function getDisplayRole(role: RoleMessage['role']): string {
    switch (role) {
        case 'system':
            return 'System';
        case 'user':
            return 'Trainee (You)';
        case 'assistant':
            return 'Prospect';
        default:
            return 'Unknown';
    }
}