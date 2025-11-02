import { NextRequest, NextResponse } from 'next/server';
import z from 'zod';
import { db } from '~/server/db';
import { createClient } from '~/utils/supabase/server';
import { ConversationStatus } from '@prisma/client';

const conversationSchema = z.object({
    id: z.string().optional(),
    status: z.nativeEnum(ConversationStatus),
    messages: z.array(z.string()),
    lessonId: z.string(),
});

const deleteConversationIdSchema = z.string();

export async function GET(request: NextRequest): Promise<NextResponse> {
    const supabase = await createClient();
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversations = await db.conversation.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ conversations });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    const supabase = await createClient();
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const parsed = conversationSchema.safeParse(data);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Invalid request data' },
            { status: 400 },
        );
    }

    const conversations = await db.conversation.create({
        data: {
            userId: user.id,
            status: parsed.data.status,
            messages: JSON.stringify(parsed.data.messages),
            lessonId: parsed.data.lessonId,
        },
    });
    return NextResponse.json({ conversations });
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
    const supabase = await createClient();
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const parsed = conversationSchema.safeParse(data);
    if (!parsed.success || !parsed.data.id) {
        return NextResponse.json(
            { error: 'Invalid request data' },
            { status: 400 },
        );
    }

    const conversations = await db.conversation.update({
        where: { id: parsed.data.id },
        data: {
            status: parsed.data.status,
            messages: JSON.stringify(parsed.data.messages),
        },
    });
    return NextResponse.json({ conversations });
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
    const supabase = await createClient();
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const parsed = deleteConversationIdSchema.safeParse(data);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Invalid request data' },
            { status: 400 },
        );
    }

    const conversations = await db.conversation.delete({
        where: { id: parsed.data },
    });
    return NextResponse.json({ conversations });
}
