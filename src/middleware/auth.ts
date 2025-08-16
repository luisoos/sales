import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    // Abrufen der aktuellen Benutzersitzung und Aktualisierung des Tokens bei Bedarf
    const {
        data: { session },
    } = await supabase.auth.getSession();

    // Weitere Logik basierend auf der Sitzung kann hier hinzugefügt werden

    return res;
}
