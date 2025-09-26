'use server';

import { lessons } from '~/utils/prompts/lessons';
import { getAllConversations } from '~/server/services/conversation';
import { createClient } from '~/utils/supabase/server';
import { Conversation } from '@prisma/client';
import { getAllMentorChats } from '~/server/services/mentor-chat';
import { ArrowRight } from 'lucide-react';
import { cn } from '~/lib/utils';
import { tailwindTextGradientClasses } from '~/components/landing-page/bento';
import React from 'react';

export default async function Page() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const conversations: Conversation[] = user
        ? await getAllConversations({ userId: user.id })
        : [];

    const uniqueConversationsSuccessfullyDone = conversations.filter(
        (item, index, self) =>
            item.status === 'CLOSED' &&
            index === self.findIndex((t) => t.lessonId === item.lessonId),
    );

    const uniqueLectionsSuccessfullyDone =
        uniqueConversationsSuccessfullyDone.length;

    const mentorChats = user
        ? await getAllMentorChats({ userId: user.id })
        : [];

    return (
        <div className='grid w-11/12 grid-cols-3 gap-4 mx-auto'>
            <div className='col-span-3'>
                <h2
                    className={cn(
                        'text-2xl font-medium',
                        tailwindTextGradientClasses,
                    )}>
                    Welcome back.
                </h2>
            </div>
            <StatCard
                value={
                    <>
                        {uniqueLectionsSuccessfullyDone}
                        <span className='text-lg opacity-75 text-brand-dark'>
                            /{lessons.length}
                        </span>
                    </>
                }
                label={`Unique ${uniqueLectionsSuccessfullyDone === 1 ? 'Lesson' : 'Lessons'} Done Successfully`}
                className='bg-gradient-to-br from-brand/5 to-transparent'
            />
            <StatCard
                value={lessons.length}
                label='Lessons available'
                className='bg-gradient-to-tr from-brand/5 to-brand/10'
            />
            <StatCard
                value={conversations.length}
                label='Total Conversations'
                className='bg-gradient-to-r from-brand/10 to-brand-dark/20'
            />
            <StatCard
                value={mentorChats.length}
                label='Mentor Coachings'
                className='bg-gradient-to-tr from-brand/5 to-transparent'
            />
            <a
                href='/dashboard/mentor'
                className='group flex justify-end p-4 border rounded-lg shadow-sm col-span-2 bg-gradient-to-r from-transparent via-brand/80 to-brand-dark/80'>
                <p className='h-min my-auto text-xl mr-2 font-medium text-white group-hover:-translate-x-2 transition-all delay-75'>
                    Jump into next Mentor Coaching
                </p>
                <ArrowRight
                    size={42}
                    className='my-auto text-white/90 group-hover:translate-x-1 transition-all delay-75'
                />
            </a>
        </div>
    );
}

function StatCard({
    value,
    label,
    className,
}: {
    value: React.ReactNode;
    label: string;
    className?: string;
}) {
    return (
        <div className={cn('p-4 border rounded-lg shadow-sm', className)}>
            <p className='font-mono text-2xl text-brand'>{value}</p>
            <p className={cn('font-medium', tailwindTextGradientClasses)}>
                {label}
            </p>
        </div>
    );
}
