import { Toaster } from '~/components/ui/sonner';

import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <body>
            <main>{children}</main>
        </body>
    );
}
