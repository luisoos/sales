'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AnimatedDotsLoader from '~/components/animated-bars-loader';
import { useLessonStatus } from '~/hooks/use-lesson-status';
import { lessons } from '~/utils/prompts/lessons';

export default function Page() {
    const router = useRouter();
    const { uniqueLectionsSuccessfullyDone, lessonsWithStatus, isLoading } =
        useLessonStatus(lessons);

    useEffect(() => {
        // Only redirect when data is fully loaded and we have lessons
        if (
            !isLoading &&
            router &&
            lessonsWithStatus &&
            lessonsWithStatus.length > 0
        ) {
            router.replace('/dashboard/calls/' + lessonsWithStatus[0]?.id);
        }
    }, [isLoading, lessonsWithStatus, router]);

    return (
        <div className='flex flex-col items-center justify-center h-full text-muted-foreground mb-24 text-center'>
            <AnimatedDotsLoader />
            <p>Loading your next lection ...</p>
        </div>
    );
}
