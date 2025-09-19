import { NextRequest, NextResponse } from 'next/server';
import { db } from '~/server/db';
import { createClient } from '~/utils/supabase/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 },
            );
        }

        const { id } = await params;
        const chat = await db.mentorChat.findUnique({
            where: { userId: user.id, id: id },
        });

        return NextResponse.json(chat);
    } catch (error) {
        console.error('API Error:', error);
        return new NextResponse(
            JSON.stringify({
                error: 'Internal Error',
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            },
        );
    }
}
