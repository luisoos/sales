'use client';

import Call from '~/components/call';
import { useParams } from 'next/navigation';
import { getLessonBySlug, leadTemperature } from '~/utils/prompts/lessons';
import { ucfirst } from '~/lib/utils';
import { BadgeWithDot } from '~/components/ui/base/badges/badges';

export default function Page() {
    const params = useParams<{
        slug: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    }>();
    const lesson = params?.slug ? getLessonBySlug(params.slug) : undefined;

    function getTemperatureColor(temperature: leadTemperature) {
        switch (temperature) {
            case 'warm':
                return 'warning';
            case 'mixed':
                return 'orange';
            case 'cold':
                return 'blue';                
            case 'hostile':
                return 'blue-light';
        }
    }

    return (
        <>
            {lesson && (
                <div className='w-5/6 mx-auto'>
                    <h2 className='font-medium text-xl'>{lesson.title}</h2>
                    <p className='flex mt-2 mb-4 text-sm'>
                        {lesson.levelLabel} ⋅ {lesson.personaName} (
                        {lesson.personaRole}) ⋅{' '}
                        <BadgeWithDot type="modern" color={getTemperatureColor(lesson.leadTemperature)} size="sm" className="ml-1">
                            {ucfirst(lesson.leadTemperature)}
                        </BadgeWithDot>
                    </p>
                </div>
            )}
            <Call lessonSlug={params?.slug} />
        </>
    );
}
