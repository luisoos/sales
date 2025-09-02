import { cn } from '~/lib/utils';

export const tailwindTextGradientClasses =
    'bg-gradient-to-t from-zinc-600 via-zinc-800 to-zinc-900 bg-clip-text text-transparent';

export function FeaturesBento({ className }: { className?: string }) {
    return (
        <div className={className}>
            <h2 className='text-3xl mx-auto mb-8 flex items-center gap-2 flex-wrap justify-center text-center leading-tight '>
                <span className={tailwindTextGradientClasses}>Practice</span>
                <IconGroup />
                <span className='text-brand'>Perfect</span>
                <span className={tailwindTextGradientClasses}>
                    Sales Calls with AI
                </span>
            </h2>
            <div className={cn('grid md:grid-cols-3 gap-6')}>
                <BentoContainer
                    className='col-span-2'
                    title={'Practice Without Pressure'}
                    subtitle={'REALISTIC AI CALLS'}>
                    Hone your pitch, navigate tough questions, and master your
                    flow in simulated calls. Our AI adapts to your conversation,
                    providing a realistic training ground where it's safe to
                    fail.
                </BentoContainer>
                <BentoContainer
                    className='col-span-1'
                    title={'Analyze & Improve'}
                    subtitle={'INSTANT FEEDBACK'}>
                    Get immediate, data-driven feedback on your performance.
                    Understand what you did well and where you can improve, from
                    word choice to closing technique.
                </BentoContainer>
                <div
                    className={cn(
                        'col-span-3 text-center text-3xl',
                        tailwindTextGradientClasses,
                    )}>
                    This is how you Learn Sales Correctly.
                </div>
                <BentoContainer
                    className='col-span-1'
                    title={'Target Your Weaknesses'}
                    subtitle={'GOAL-ORIENTED TRAINING'}
                    reverseGradient={true}>
                    Choose specific scenarios and goals, from booking a meeting
                    to handling pricing objections. Turn your weak points into
                    strengths, one call at a time.
                </BentoContainer>
                <BentoContainer
                    className='col-span-2'
                    title={'Watch Your Skills Grow'}
                    subtitle={'TRACK YOUR PROGRESS'}
                    reverseGradient={true}>
                    Visualize your improvement over time with our performance
                    dashboard. See your scores increase and gain the confidence
                    to take on any sales challenge.
                </BentoContainer>
            </div>
        </div>
    );
}

export default function IconGroup() {
    return (
        <span className='flex -space-x-3'>
            {/* Hand Coins */}
            <div className='rounded-full bg-white border p-2 shadow-inner'>
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='w-6 h-6'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'>
                    <path d='M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17' />
                    <path d='m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9' />
                    <path d='m2 16 6 6' />
                    <circle cx='16' cy='9' r='2.9' />
                    <circle cx='6' cy='5' r='3' />
                </svg>
            </div>

            {/* Landmark */}
            <div className='rounded-full bg-white border p-2 shadow-inner'>
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='w-6 h-6'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'>
                    <path d='M10 18v-7' />
                    <path d='M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z' />
                    <path d='M14 18v-7' />
                    <path d='M18 18v-7' />
                    <path d='M3 22h18' />
                    <path d='M6 18v-7' />
                </svg>
            </div>

            {/* Banknote */}
            <div className='rounded-full bg-white border p-2 shadow-inner'>
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='w-6 h-6'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'>
                    <rect width='20' height='12' x='2' y='6' rx='2' />
                    <circle cx='12' cy='12' r='2' />
                    <path d='M6 12h.01M18 12h.01' />
                </svg>
            </div>
        </span>
    );
}

function BentoContainer({
    title,
    subtitle,
    children,
    reverseGradient = false,
    className,
}: {
    title: string;
    subtitle: string;
    children: React.ReactNode;
    reverseGradient?: boolean;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'w-full h-auto p-4',
                'rounded-xl border shadow-inner bg-gradient-to-t',
                className,
                reverseGradient
                    ? 'from-zinc-50 via-white to-white'
                    : 'from-white via-white to-zinc-50',
            )}>
            <p className='uppercase text-sm font-semibold text-brand'>
                {subtitle}
            </p>
            <h4
                className={cn(
                    'text-xl font-medium',
                    tailwindTextGradientClasses,
                )}>
                {title}
            </h4>
            {children}
        </div>
    );
}
