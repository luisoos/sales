import * as React from 'react';
import {
    Home,
    Users,
    Settings,
    Medal,
    BadgePercent,
    MessageCircleMore,
} from 'lucide-react';
import { usePathname } from 'next/navigation';

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '~/components/ui/sidebar';

// Navigation data with proper structure
const data = {
    navMain: [
        {
            title: 'Dashboard',
            url: '/dashboard',
            icon: Home,
            items: [],
        },
        {
            title: 'Calls',
            url: '/dashboard/calls',
            icon: Users,
            items: [
                {
                    title: 'All Calls',
                    url: '/dashboard/calls',
                },
                {
                    title: 'Train next',
                    url: '/dashboard/calls/next',
                },
            ],
        },
        {
            title: 'Conversation Log',
            url: '/dashboard/conversation-log',
            icon: MessageCircleMore,
            items: [],
        },
        {
            title: 'Leaderboard',
            url: '/leaderboard',
            icon: Medal,
            items: [],
        },
        {
            title: 'Settings',
            url: '/dashboard/settings',
            icon: Settings,
            items: [],
        },
    ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname();

    // Helper function to check if a path is active
    const isPathActive = (path: string) => {
        if (!pathname) return false;
        if (path === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(path);
    };

    return (
        <Sidebar variant='floating' {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size='lg' asChild>
                            <a href='/dashboard'>
                                <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-brand/10 text-brand-dark border border-brand-light'>
                                    <BadgePercent className='size-4' />
                                </div>
                                <div className='flex flex-col gap-0.5 leading-none'>
                                    <span className='font-semibold'>
                                        {process.env.NEXT_PUBLIC_PROJECT_NAME}
                                    </span>
                                    <span className=''>v1.0.0</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu className='gap-2'>
                        {data.navMain.map((item) => {
                            const IconComponent = item.icon;
                            const isActive = isPathActive(item.url);

                            return (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive}>
                                        <a
                                            href={item.url}
                                            className='font-medium'>
                                            {IconComponent && (
                                                <IconComponent className='size-4' />
                                            )}
                                            {item.title}
                                        </a>
                                    </SidebarMenuButton>
                                    {item.items?.length ? (
                                        <SidebarMenuSub className='ml-0 border-l-0 px-1.5'>
                                            {item.items.map((subItem) => {
                                                const isSubActive =
                                                    pathname === subItem.url;

                                                return (
                                                    <SidebarMenuSubItem
                                                        key={subItem.title}>
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            isActive={
                                                                isSubActive
                                                            }>
                                                            <a
                                                                href={
                                                                    subItem.url
                                                                }>
                                                                {subItem.title}
                                                            </a>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                );
                                            })}
                                        </SidebarMenuSub>
                                    ) : null}
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
