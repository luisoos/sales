import '~/styles/globals.css';
import React from 'react';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { type Metadata } from 'next';
import { Toaster } from '~/components/ui/sonner';
import localFont from 'next/font/local';

export const metadata: Metadata = {
    title: process.env.NEXT_PUBLIC_PROJECT_NAME,
    description: 'Manage your waitlists and beta rollouts with ease.',
    icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

const vendSans = localFont({
    src: [{ path: './fonts/VendSans-Variable.ttf', style: 'normal' }],
    variable: '--font-vendsans',
    display: 'swap',
});

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html
            lang='en'
            className={`${vendSans.variable} ${GeistSans.variable} ${GeistMono.variable}`}>
            <body>
                {children}
                <Toaster />
            </body>
        </html>
    );
}
