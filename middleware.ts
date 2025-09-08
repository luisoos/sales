import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '~/utils/supabase/middleware';
import { createClient } from '~/utils/supabase/server';

// Match all request paths except for:
// - _next/static (static files)
// - _next/image (image optimization files)
// - favicon.ico (favicon file)
// - public folder
// - public folder files
// - public folder subdirectories
export const config = {
    matcher: ['/dashboard/:path*', '/api/:path*'],
};

export async function middleware(request: NextRequest) {
    // Update the user's auth session and get the response
    const response = await updateSession(request);

    // For protected routes, ensure user is authenticated
    if (
        request.nextUrl.pathname.startsWith('/api/') ||
        request.nextUrl.pathname.startsWith('/dashboard')
    ) {
        // Create a new Supabase client for server-side operations
        const supabase = await createClient();
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Return the response from updateSession or continue with the request
    return response || NextResponse.next();
}
