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

export default function Page() {
    return (
        <div className='w-11/12 mx-auto'>
            <TableCard.Root className='w-full mt-2'>
                {/* TODO: make "... lections left" */}
                <TableCard.Header
                    title='All Lections'
                    badge={lessons.length + ' Lections'}
                />
                <Table aria-label='All Lections'>
                    <Table.Header className='max-md:hidden'>
                        <Table.Head
                            id='level'
                            label='Level'
                            isRowHeader
                            className='w-full max-w-1/4'
                        />
                        <Table.Head id='title' label='Title' />
                        <Table.Head id='Character' label='Character' />
                        <Table.Head
                            id='temperature'
                            label='Lead Temperature'
                            className='md:hidden xl:table-cell'
                        />
                    </Table.Header>

                    <Table.Body items={lessons}>
                        {(item) => {
                            // TODO:
                            const userHasDoneLesson = true;
                            return (
                                <Table.Row id={item.id}>
                                    <Table.Cell className='flex flex-wrap items-center my-1.5 gap-1'>
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
                                            className='max-md:flex hidden'
                                        />
                                        <BadgeWithImage
                                            type='modern'
                                            color='gray'
                                            size='sm'
                                            imgSrc={item.character.avatarUrl}
                                            className='max-md:flex hidden'>
                                            {item.character.name}
                                        </BadgeWithImage>
                                    </Table.Cell>
                                    <Table.Cell className='whitespace-normal break-words'>
                                        {item.title}
                                    </Table.Cell>
                                    <Table.Cell className='max-md:hidden'>
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
                                    <Table.Cell className='max-md:hidden'>
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
