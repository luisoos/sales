'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Separator } from '@radix-ui/react-separator';
import { AppSidebar } from '~/components/app-sidebar';
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator,
    BreadcrumbPage,
} from '~/components/ui/breadcrumb';
import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
} from '~/components/ui/sidebar';

const getBreadcrumbLabel = (pathname: string) => {
    if (pathname === '/dashboard') {
        return 'Dashboard';
    }
    if (pathname.startsWith('/dashboard/calls')) {
        if (pathname === '/dashboard/calls') {
            return 'Calls';
        }
        return 'Call Details';
    }
    const lastSegment = pathname.split('/').pop();
    if (!lastSegment) return '';

    return lastSegment
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export default function RootLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const breadcrumbLabel = pathname ? getBreadcrumbLabel(pathname) : '';

    return (
        <main>
            <SidebarProvider
                style={
                    {
                        '--sidebar-width': '19rem',
                    } as React.CSSProperties
                }>
                <AppSidebar />
                <SidebarInset>
                    <header className='flex h-16 shrink-0 items-center gap-2 px-4'>
                        <SidebarTrigger className='-ml-1' />
                        <Separator
                            orientation='vertical'
                            className='mr-2 h-4'
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className='hidden md:block'>
                                    <BreadcrumbLink href='/dashboard'>
                                        {process.env.NEXT_PUBLIC_PROJECT_NAME}
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className='hidden md:block' />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>
                                        {breadcrumbLabel}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </header>
                    {children}
                </SidebarInset>
            </SidebarProvider>
        </main>
    );
}
