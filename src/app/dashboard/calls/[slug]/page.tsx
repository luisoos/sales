'use client';

import Call from '~/components/call';
import { redirect, useParams } from 'next/navigation';
import { getLessonById } from '~/utils/prompts/lessons';
import React from 'react';
import { Checkbox } from '~/components/ui/checkbox';
import { Label } from '~/components/ui/label';
import ProductPopUp from '~/components/product-pop-up';
import { LeadTemperatureBadge } from '~/components/lead-temperature-badge';

export default function Page() {
    const params = useParams<{
        slug: string;
    }>();
    const lesson = params?.slug
        ? getLessonById(Number(params.slug))
        : undefined;

    const [showNotes, setShowNotes] = React.useState<boolean>(true);

    if (!params?.slug || !lesson) redirect('/dashboard/calls');

    return (
        <div className='h-full'>
            {lesson && (
                <div className='w-11/12 mx-auto'>
                    <h2 className='font-medium text-xl'>{lesson.title}</h2>
                    <div className='flex justify-between mt-2 mb-4'>
                        <p className='flex w-fit text-sm items-center gap-2'>
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
                        <div className='flex items-start gap-2 my-auto'>
                            <Checkbox
                                id='toggle'
                                checked={showNotes}
                                onCheckedChange={(checked) =>
                                    setShowNotes(!!checked)
                                }
                                className='text-black'
                            />
                            <Label
                                className='font-normal my-auto'
                                htmlFor='toggle'>
                                Enable notes
                            </Label>
                        </div>
                    </div>
                </div>
            )}
            <Call lesson={lesson} showNotes={showNotes} />
            <ProductPopUp product={lesson.product} />
        </div>
    );
}
