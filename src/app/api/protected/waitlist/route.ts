import { NextResponse } from 'next/server';
import { db } from '~/server/db';

export async function GET(request: Request) {
    const waitlist = await db.waitlist.findMany();
    return NextResponse.json(waitlist);
}

export async function POST(request: Request) {
    const data = await request.json();
    const newEntry = await db.waitlist.create({
        data,
    });
    return NextResponse.json(newEntry);
}