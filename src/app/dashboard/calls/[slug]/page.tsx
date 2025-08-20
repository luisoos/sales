'use client';

import Call from '~/components/call';
import { useParams } from 'next/navigation';
import { getLessonBySlug, leadTemperature } from '~/utils/prompts/lessons';
import { cn, ucfirst } from '~/lib/utils';
import { BadgeWithDot } from '~/components/ui/base/badges/badges';

export default function Page() {
    const params = useParams<{
        slug: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    }>();
    const lesson = params?.slug ? getLessonBySlug(params.slug) : undefined;

    return (
        <>
            {lesson && (
                <div className='w-11/12 mx-auto'>
                    <h2 className='font-medium text-xl'>{lesson.title}</h2>
                    <p className='flex mt-2 mb-4 text-sm items-center gap-2'>
                        <img
                            src={lesson.character.avatarUrl}
                            alt={lesson.character.name}
                            className='w-5 h-5 rounded-full border'
                        />
                        {lesson.levelLabel} ⋅ {lesson.character.name} (
                        {lesson.character.role}) ⋅{' '}
                        <LeadTemperatureBadge
                            leadTemperature={lesson.leadTemperature}
                        />
                    </p>
                </div>
            )}
            <Call lessonSlug={params?.slug} />
        </>
    );
}

export function LeadTemperatureBadge({
    leadTemperature,
    className,
}: {
    leadTemperature: leadTemperature;
    className?: string;
}) {
    function getTemperatureColor(temperature: leadTemperature) {
        switch (temperature) {
            case 'warm':
                return 'warning';
            case 'mixed':
                return 'orange';
            case 'cold':
                return 'blue';
            case 'hostile':
                return 'gray';
        }
    }

    return (
        <BadgeWithDot
            type='modern'
            color={getTemperatureColor(leadTemperature)}
            size='sm'
            className={cn(className)}>
            {ucfirst(leadTemperature)}
        </BadgeWithDot>
    );
}
