'use client';

import { ArrowDown, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FeaturesBento } from '~/components/landing-page/bento';
import { WhyUsRow } from '~/components/landing-page/why-us-row';
import { BadgeGroup } from '~/components/ui/base/badges/badge-groups';
import { Button } from '~/components/ui/button';
import {
    ListItem,
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from '~/components/ui/navigation-menu';
import { PointerHighlight } from '~/components/ui/pointer-highlight';
import { cn } from '~/lib/utils';

export default function HomePage() {
    const router = useRouter();

    const components: { title: string; href: string; description: string }[] = [
        {
            title: 'Waitlist',
            href: '/docs/primitives/alert-dialog',
            description:
                'A modal dialog that interrupts the user with important content and expects a response.',
        },
        {
            title: 'Beta Rollouts',
            href: '/docs/primitives/hover-card',
            description:
                'For sighted users to preview content available behind a link.',
        },
    ];

    return (
        <main className='min-h-screen w-full'>
            <div className='w-full pt-2'>
                <NavigationMenu className='mx-auto'>
                    <NavigationMenuList className='w-full'>
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <Link href='/' className={navigationMenuTriggerStyle()}>
                                    Home
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuTrigger>
                                Features
                            </NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className='grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] '>
                                    {components.map((component) => (
                                        <ListItem
                                            key={component.title}
                                            title={component.title}
                                            href={component.href}>
                                            {component.description}
                                        </ListItem>
                                    ))}
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                        <NavigationMenuItem className='pl-auto'>
                            <NavigationMenuLink asChild>
                                <Link
                                    href='/login'
                                    className={cn(
                                        navigationMenuTriggerStyle(),
                                        'bg-brand text-white border border-brand-dark',
                                    )}>
                                    Login
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
            </div>
            <div>
                <div className='hero-section mt-48 py-10'>
                    <div className='container mx-auto p-4 text-center'>
                        <HeaderBadgeGroup />
                        <h1 className='flex w-fit mx-auto text-5xl font-normal my-4 tracking-tighter'>
                            Learn Sales{' '}
                            <PointerHighlight
                                onClick={() => router.push('dashboard')}
                                containerClassName='ml-2 px-4 cursor-pointer'
                                rectangleClassName='shadow-inner bg-brand/20 border border-brand rounded-full'>
                                interactively
                            </PointerHighlight>
                            .
                        </h1>
                        <p className='text-md mb-4 max-w-96 mx-auto'>
                            With {process.env.NEXT_PUBLIC_PROJECT_NAME} you can
                            learn Sales by having realistic calls with AI
                            characters.
                        </p>
                        <div className='flex w-min gap-4 mx-auto'>
                            <Button
                                variant='ghost'
                                className='text-zinc-500 group'>
                                Learn More{' '}
                                <ArrowDown
                                    size={14}
                                    className='group-hover:translate-y-0.5 transition-all'
                                />
                            </Button>
                            <Button
                                onClick={() => router.push('dashboard')}
                                className='px-6 py-3 shadow-inner bg-brand border border-brand-dark text-white hover:bg-brand-dark transition-all rounded-md group'>
                                Get Started{' '}
                                <ArrowRight
                                    size={14}
                                    className='group-hover:translate-x-0.5 transition-all'
                                />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <FeaturesBento className='mx-4 md:mx-auto md:max-w-[800px] my-32' />
            <WhyUsRow className='mx-12 lg:mx-auto lg:max-w-[1000px] my-32' />
        </main>
    );
}

const HeaderBadgeGroup = () => {
    return (
        <div className='w-min mx-auto flex flex-col items-start gap-4 hover:translate-x-2 transition-all duration-500'>
            <BadgeGroup
                addonText='New feature'
                color='gray'
                theme='light'
                align='leading'
                size='md'>
                We've just released a new feature{' '}
                <ArrowRight size={14} className='ml-1' />
            </BadgeGroup>
        </div>
    );
};
