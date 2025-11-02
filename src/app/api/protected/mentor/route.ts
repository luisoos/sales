import { Conversation } from '@prisma/client';
import Groq from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';
import z from 'zod';
import { db } from '~/server/db';
import { getAllConversations } from '~/server/services/conversation';
import { updateOrCreateMentorChat } from '~/server/services/mentor-chat';
import { RateLimiter } from '~/server/services/rate-limit';
import getMentorPrompt from '~/utils/prompts/mentor-prompt';
import { createClient } from '~/utils/supabase/server';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const MessageSchema = z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
});

const messageSchema = z.object({
    mentorChatId: z.string().optional(),
    messageHistory: z.array(MessageSchema).default([]),
    message: z.string(),
});

const limiter = new RateLimiter({
    minute: { max: 5, window: 60 * 1000 },
    hour: { max: 60, window: 60 * 60 * 1000 },
    day: { max: 120, window: 24 * 60 * 60 * 1000 },
});

export async function GET(request: NextRequest): Promise<NextResponse> {
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

        const params = request.nextUrl.searchParams;
        const limit = params.get('limit') || '10';
        const offset = params.get('offset') || '0';

        if (Number(limit) < 1) {
            return NextResponse.json(
                { error: 'Invalid limit' },
                { status: 400 },
            );
        }
        if (Number(offset) < 0) {
            return NextResponse.json(
                { error: 'Invalid offset' },
                { status: 400 },
            );
        }

        const mentorChats = await db.mentorChat.findMany({
            where: { userId: user.id },
            orderBy: { updatedAt: 'desc' },
            take: Number(limit),
            skip: Number(offset),
        });

        const totalCount = await db.mentorChat.count({
            where: { userId: user.id },
        });

        return NextResponse.json(
            { mentorChats },
            {
                headers: {
                    'X-Has-More': (
                        Number(offset) + Number(limit) <
                        totalCount
                    ).toString(),
                },
            },
        );
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

export async function POST(request: NextRequest): Promise<NextResponse> {
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

        const data = await request.json();
        const parsed = messageSchema.safeParse(data);

        if (!parsed.success || !parsed.data.message) {
            return NextResponse.json(
                { error: 'Invalid request data' },
                { status: 400 },
            );
        }

        // IP Rate Limit Check
        const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
        const rateLimiterCheck = limiter.checkIp(ip);
        if (rateLimiterCheck.limited) {
            return NextResponse.json(
                {
                    error: `Too many requests (${rateLimiterCheck.limit[1].max} messages per ${rateLimiterCheck.limit[0]})`,
                },
                { status: 429 },
            );
        }

        const conversations: Conversation[] = await getAllConversations({
            userId: user.id,
        });

        console.log([
            {
                role: 'system',
                content: getMentorPrompt(conversations),
            },
            ...parsed.data.messageHistory,
            { role: 'user', content: parsed.data.message },
        ]);

        const stream = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: getMentorPrompt(conversations),
                },
                ...parsed.data.messageHistory,
                { role: 'user', content: parsed.data.message },
            ],
            model: 'openai/gpt-oss-20b',
            stream: true,
            max_tokens: 3072,
            temperature: 0.7,
        });

        const responseStream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                let fullResponse: string = '';

                try {
                    for await (const chunk of stream) {
                        const content = chunk.choices[0]?.delta?.content;

                        if (content) {
                            fullResponse += content;
                            controller.enqueue(encoder.encode(content));
                        }
                    }
                } catch (error) {
                    console.error('Streaming error:', error);
                    controller.error(error);
                } finally {
                    const savedChat = await updateOrCreateMentorChat({
                        userId: user.id,
                        newMessages: [
                            { role: 'user', content: parsed.data.message },
                            { role: 'assistant', content: fullResponse },
                        ],
                        mentorChatId: parsed.data.mentorChatId,
                    });

                    const metadata = `\n__CHAT_ID__:${savedChat.id}`;
                    controller.enqueue(encoder.encode(metadata));

                    controller.close();
                }
            },
        });

        return new NextResponse(responseStream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
            },
        });
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
