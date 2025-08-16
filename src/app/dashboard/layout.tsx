'use client';

import { ReactNode } from 'react';
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

export default function RootLayout({ children }: { children: ReactNode }) {
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
                                    <BreadcrumbLink href='#'>
                                        {process.env.NEXT_PUBLIC_PROJECT_NAME}
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className='hidden md:block' />
                                <BreadcrumbItem>
                                    {/* TODO: detect route -> map to breadcrumb label */}
                                    <BreadcrumbPage>
                                        Data Fetching
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
