'use client';

import { lessons } from '~/utils/prompts/lessons';
import {
    Table,
    TableCard,
    TableRowActionsDropdown,
} from '~/components/ui/application/table/table';
import { LeadTemperatureBadge } from './[slug]/page';
import { BadgeWithImage } from '~/components/ui/base/badges/badges';
import { BadgeGroup } from '~/components/ui/base/badges/badge-groups';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Conversation } from '@prisma/client';

export default function Page() {
    const router = useRouter();

    const [uniqueLectionsDone, setUniqueLectionsDone] = useState<
        number | undefined
    >();

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const conversationRequest = await fetch(
                    '/api/protected/conversations',
                );
                const data = await conversationRequest.json();
                const conversations = data.conversation as Conversation[];
                setUniqueLectionsDone(
                    conversations.filter(
                        (item, index, self) =>
                            index ===
                            self.findIndex((t) => t.lessonId === item.lessonId),
                    ).length,
                );
            } catch (error: any) {
                console.log('Could not fetch conversation history.');
            }
        };
        fetchConversations();
    }, []);

    return (
        <div className='w-11/12 mx-auto'>
            <TableCard.Root className='w-full mt-2'>
                {/* TODO: make "... lections left" */}
                <TableCard.Header
                    title='All Lections'
                    badge={
                        uniqueLectionsDone
                            ? lessons.length -
                              uniqueLectionsDone +
                              ' Lections unpracticed'
                            : lessons.length + ' Lections'
                    }
                />
                <Table
                    aria-label='All Lections'
                    onRowAction={(key) =>
                        router.push(`/dashboard/calls/${key}`)
                    }>
                    <Table.Header className='max-lg:hidden'>
                        <Table.Head
                            id='level'
                            label='Level'
                            isRowHeader
                            className='w-min'
                        />
                        <Table.Head id='title' label='Title' />
                        <Table.Head id='Character' label='Character' />
                        <Table.Head
                            id='temperature'
                            label='Lead Temperature'
                            className='lg:hidden xl:table-cell'
                        />
                    </Table.Header>

                    <Table.Body items={lessons}>
                        {(item) => {
                            // TODO:
                            const userHasDoneLesson = true;
                            return (
                                <Table.Row
                                    id={item.id}
                                    className='cursor-pointer'>
                                    <Table.Cell className='w-min flex max-md:flex-nowrap flex-wrap items-center my-1.5 gap-1'>
                                        {' '}
                                        <BadgeGroup
                                            addonText={String(item.id)}
                                            color={
                                                userHasDoneLesson
                                                    ? 'gray'
                                                    : 'brand'
                                            }
                                            theme='modern'
                                            align='leading'
                                            size='sm'>
                                            {item.levelLabel}
                                        </BadgeGroup>
                                        <LeadTemperatureBadge
                                            leadTemperature={
                                                item.leadTemperature
                                            }
                                            className='max-lg:flex hidden'
                                        />
                                        <BadgeWithImage
                                            type='modern'
                                            color='gray'
                                            size='sm'
                                            imgSrc={item.character.avatarUrl}
                                            className='max-lg:flex hidden'>
                                            {item.character.name}
                                        </BadgeWithImage>
                                    </Table.Cell>
                                    <Table.Cell className='whitespace-normal break-words'>
                                        {item.title}
                                    </Table.Cell>
                                    <Table.Cell className='max-lg:hidden'>
                                        <div className='flex items-center gap-3'>
                                            <img
                                                src={item.character.avatarUrl}
                                                alt={item.character.name}
                                                className='w-8 h-8 rounded-full border'
                                            />
                                            <div>
                                                <p className='text-sm text-zinc-600 whitespace-normal break-words'>
                                                    {item.character.name}
                                                </p>
                                            </div>
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell className='max-lg:hidden'>
                                        <LeadTemperatureBadge
                                            leadTemperature={
                                                item.leadTemperature
                                            }
                                        />
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
