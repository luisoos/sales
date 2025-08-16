import { type NextRequest } from 'next/server';
import { updateSession } from '~/utils/supabase/middleware';
import { createClient } from './utils/supabase/server';

export async function middleware(request: NextRequest) {
    if (
        request.nextUrl.pathname.startsWith('/api/protected') ||
        request.nextUrl.pathname.startsWith('/dashboard')
    ) {
        const supabase = await createClient();
        const session = await supabase.auth.getSession();

        if (!session) {
            return new Response('Unauthorized', { status: 401 });
        }
    }

    return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}