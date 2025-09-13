import { Table } from '~/components/ui/application/table/table';
import { LeadTemperatureBadge } from '~/app/dashboard/calls/[slug]/page';
import { BadgeWithImage } from '~/components/ui/base/badges/badges';
import { BadgeGroup } from '~/components/ui/base/badges/badge-groups';
import { cn } from '~/lib/utils';
import { leadTemperature } from '~/utils/prompts/lessons';

interface LessonRowProps {
    lesson: {
        id: number;
        levelLabel: string;
        title: string;
        character: {
            name: string;
            avatarUrl: string;
        };
        leadTemperature: string;
        userHasDoneLesson: boolean;
    };
    onRowClick: (id: number) => void;
}

export function LessonRow({ lesson, onRowClick }: LessonRowProps) {
    return (
        <Table.Row
            id={lesson.id}
            className={cn(
                'cursor-pointer',
                lesson.userHasDoneLesson && 'opacity-70',
            )}
            onClick={() => onRowClick(lesson.id)}>
            <Table.Cell className='w-min flex max-md:flex-nowrap flex-wrap items-center my-1.5 gap-1'>
                <BadgeGroup
                    addonText={String(lesson.id)}
                    color={lesson.userHasDoneLesson ? 'gray' : 'brand'}
                    theme='modern'
                    align='leading'
                    size='sm'>
                    {lesson.levelLabel}
                </BadgeGroup>
                <LeadTemperatureBadge
                    leadTemperature={lesson.leadTemperature as leadTemperature}
                    className='max-lg:flex hidden'
                />
                <BadgeWithImage
                    type='modern'
                    color='gray'
                    size='sm'
                    imgSrc={lesson.character.avatarUrl}
                    className='max-lg:flex hidden'>
                    {lesson.character.name}
                </BadgeWithImage>
            </Table.Cell>
            <Table.Cell className='whitespace-normal break-words'>
                {lesson.title}
            </Table.Cell>
            <Table.Cell className='max-lg:hidden'>
                <div className='flex items-center gap-3'>
                    <img
                        src={lesson.character.avatarUrl}
                        alt={lesson.character.name}
                        className='w-8 h-8 rounded-full border'
                    />
                    <div>
                        <p className='text-sm text-zinc-600 whitespace-normal break-words'>
                            {lesson.character.name}
                        </p>
                    </div>
                </div>
            </Table.Cell>
            <Table.Cell className='max-lg:hidden'>
                <LeadTemperatureBadge
                    leadTemperature={lesson.leadTemperature as leadTemperature}
                />
            </Table.Cell>
        </Table.Row>
    );
}
