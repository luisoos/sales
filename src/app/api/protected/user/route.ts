import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '~/utils/supabase/server';

export async function GET(request: Request) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.getUser();
    if (error)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    return NextResponse.json({ user: data.user });
}
