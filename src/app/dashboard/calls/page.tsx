'use client';

import { lessons } from '~/utils/prompts/lessons';
import {
    Table,
    TableCard,
    TableRowActionsDropdown,
} from '~/components/ui/application/table/table';
import { LessonRow } from '~/components/lesson-row';
import { useRouter } from 'next/navigation';
import { useLessonStatus } from '~/hooks/use-lesson-status';
import AnimatedDotsLoader from '~/components/animated-bars-loader';

export default function Page() {
    const router = useRouter();
    const { uniqueLectionsDone, lessonsWithStatus, isLoading } = useLessonStatus(lessons);

    if (isLoading) {
        return (<div className='flex flex-col items-center justify-center h-full text-muted-foreground mb-24 text-center'>
            <AnimatedDotsLoader />
            <p>Loading all lections ...</p>
        </div>);
    }
    
    return (
        <div className='w-11/12 mx-auto'>
            <TableCard.Root className='w-full mt-2'>
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

                    <Table.Body items={lessonsWithStatus}>
                        {(item) => (
                            <LessonRow
                                key={item.id}
                                lesson={item}
                                onRowClick={(id) => router.push(`/dashboard/calls/${id}`)}
                            />
                        )}
                    </Table.Body>
                </Table>
            </TableCard.Root>
        </div>
    );
}
