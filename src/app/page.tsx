import Link from 'next/link';
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
import { cn } from '~/lib/utils';

export default function HomePage() {
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
                            <Link href='/' legacyBehavior passHref>
                                <NavigationMenuLink
                                    className={navigationMenuTriggerStyle()}>
                                    Home
                                </NavigationMenuLink>
                            </Link>
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
                            <Link href='/login' legacyBehavior passHref>
                                <NavigationMenuLink
                                    className={cn(
                                        navigationMenuTriggerStyle(),
                                        'bg-brand text-white border border-brand-dark',
                                    )}>
                                    Login
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
            </div>
            <div>
                <div className='hero-section py-10'>
                    <div className='container mx-auto text-center'>
                        <h1 className='text-4xl font-bold mb-4'>
                            Welcome to {process.env.NEXT_PUBLIC_PROJECT_NAME}
                        </h1>
                        <p className='text-lg mb-6'>
                            Manage your waitlists and beta rollouts with ease.
                        </p>
                        <Link href='/login' legacyBehavior passHref>
                            <a className='px-6 py-3 bg-brand border border-brand-dark text-white rounded-md'>
                                Get Started
                            </a>
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
