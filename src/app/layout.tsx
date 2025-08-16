import '~/styles/globals.css';
import React from 'react';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { type Metadata } from 'next';

export const metadata: Metadata = {
    title: process.env.NEXT_PUBLIC_PROJECT_NAME,
    description: 'Manage your waitlists and beta rollouts with ease.',
    icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html
            lang='en'
            className={`${GeistSans.variable} ${GeistMono.variable}`}>
            <body>{children}</body>
        </html>
    );
}
