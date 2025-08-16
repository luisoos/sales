import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '~/server/db';

const waitlistIdSchema = z.number().int();

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const validatedId = waitlistIdSchema.safeParse(params.id);
    if (!validatedId)
        return NextResponse.json({ error: 'Bad request' }, { status: 400 });
        
    const entry = await db.waitlist.findUnique({
        where: { id: validatedId.data },
    });
    return NextResponse.json(entry);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const validatedId = waitlistIdSchema.safeParse(params.id);
    if (!validatedId)
        return NextResponse.json({ error: 'Bad request' }, { status: 400 });

    const data = await request.json();
    const updatedEntry = await db.waitlist.update({
        where: { id: validatedId.data },
        data,
    });
    return NextResponse.json(updatedEntry);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const validatedId = waitlistIdSchema.safeParse(params.id);
    if (!validatedId)
        return NextResponse.json({ error: 'Bad request' }, { status: 400 });

    await db.waitlist.delete({
        where: { id: validatedId.data },
    });
    return NextResponse.json({ message: 'Entry deleted' });
}