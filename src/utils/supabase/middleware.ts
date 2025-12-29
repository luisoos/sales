import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
    // Defensive: if env vars are missing, don't attempt to call Supabase (avoid fetch failures)
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        // Allow the request to continue but surface a helpful console message during development
        // (This prevents a hard crash such as "fetch failed" inside the Edge sandbox.)
        // NOTE: NEXT_PUBLIC_... env vars are required by createServerClient in this codepath.
        // If you rely on server-only envs in middleware, change how you initialize the client.
        // eslint-disable-next-line no-console
        console.error(
            'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Skipping Supabase session update in middleware.',
        );

        return NextResponse.next({ request });
    }

    let supabaseResponse = NextResponse.next({ request });

    let supabase;
    try {
        supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll(
                        cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[],
                    ): void {
                        cookiesToSet.forEach(
                            ({ name, value, options }: { name: string; value: string; options?: Record<string, unknown> }) =>
                                request.cookies.set(name, value),
                        );
                        supabaseResponse = NextResponse.next({ request });
                        cookiesToSet.forEach(
                            ({ name, value, options }: { name: string; value: string; options?: Record<string, unknown> }) =>
                                supabaseResponse.cookies.set(name, value, options),
                        );
                    },
                },
            },
        );
    } catch (err) {
        // Catch synchronous initialization errors
        // eslint-disable-next-line no-console
        console.error('Failed to initialize Supabase client in middleware:', err);
        return NextResponse.next({ request });
    }

    // Do not run code between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    // IMPORTANT: DO NOT REMOVE auth.getUser()

    let user;
    try {
        const {
            data: { user: gotUser },
        } = await supabase.auth.getUser();
        user = gotUser;
    } catch (err) {
        // Network or fetch error inside the Edge runtime should not crash the middleware.
        // Log a helpful message and continue the request (best-effort session handling).
        // eslint-disable-next-line no-console
        console.error('Supabase auth.getUser() failed in middleware:', err);
        return supabaseResponse;
    }

    if (!user && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/auth')) {
        // no user, potentially respond by redirecting the user to the login page
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    // IMPORTANT: You *must* return the supabaseResponse object as it is.
    // If you're creating a new response object with NextResponse.next() make sure to:
    // 1. Pass the request in it, like so:
    //    const myNewResponse = NextResponse.next({ request })
    // 2. Copy over the cookies, like so:
    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. Change the myNewResponse object to fit your needs, but avoid changing
    //    the cookies!
    // 4. Finally:
    //    return myNewResponse
    // If this is not done, you may be causing the browser and server to go out
    // of sync and terminate the user's session prematurely!

    return supabaseResponse;
}
