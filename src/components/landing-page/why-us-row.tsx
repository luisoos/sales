import { Award, BookOpenCheck, HandCoins, Lock } from 'lucide-react';
import { cn } from '~/lib/utils';
import { lessons } from '~/utils/prompts/lessons';
import { tailwindTextGradientClasses } from './bento';

export function WhyUsRow({ className }: { className?: string }) {
    const lessonNumber = lessons.length;
    return (
        <div className={cn(className)}>
            <h2
                className={cn(
                    'text-3xl mx-auto mb-8 flex items-center gap-2 flex-wrap justify-center text-center leading-tight',
                    tailwindTextGradientClasses,
                )}>
                Why choose us?
            </h2>
            <div className='md:grid grid-cols-2 lg:grid-cols-4 gap-4'>
                <WhyUsCell>
                    <Lock className='max-md:mx-auto mt-0.5' /> Truly Private
                    Conversation
                    <p className='text-sm'>
                        Your conversation is saved encrypted. Data servers
                        located in Germany.
                    </p>
                </WhyUsCell>
                <WhyUsCell>
                    <HandCoins className='max-md:mx-auto mt-0.5' /> Transparent
                    Pricing
                    <p className='text-sm'>
                        We offer a generous Free Tier and fair monthly
                        subscriptions for advanced users.
                    </p>
                </WhyUsCell>
                <WhyUsCell>
                    <BookOpenCheck className='max-md:mx-auto mt-0.5' />
                    {lessonNumber}+ Lessons
                    <p className='text-sm'>
                        Allowing you to train on different levels and improve,
                        we constantly add lessons.
                    </p>
                </WhyUsCell>
                <WhyUsCell>
                    <Award className='max-md:mx-auto mt-0.5' />
                    Show your progress
                    <p className='text-sm'>
                        Earn awards and medals for your continuous learning
                        efforts.
                    </p>
                </WhyUsCell>
            </div>
        </div>
    );
}

function WhyUsCell({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={cn('max-md:my-6 max-md:text-center text-md', className)}>{children}</div>
    );
}
