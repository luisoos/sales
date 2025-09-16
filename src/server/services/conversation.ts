import { db } from '~/server/db';
import { ConversationStatus } from '@prisma/client';
import { RoleMessage } from '~/types/conversation';

export async function getAllConversations(params: { userId: string }) {
    return db.conversation.findMany({
        where: { userId: params.userId },
        orderBy: { createdAt: 'desc' },
    });
}

export async function getOrCreateConversation(params: {
    userId: string;
    lessonId: string;
}) {
    const existing = await db.conversation.findFirst({
        where: { userId: params.userId, lessonId: params.lessonId, status: 'UNFINISHED' },
        orderBy: { createdAt: 'desc' },
    });
    if (existing) return existing;

    return db.conversation.create({
        data: {
            userId: params.userId,
            lessonId: params.lessonId,
            status: 'UNFINISHED',
            messages: [],
        },
    });
}

export async function appendTurnAndMaybeSetStatus(params: {
    conversationId: string;
    userText: string;
    assistantText: string;
}) {
    const { conversationId, userText, assistantText } = params;

    const hasClose = assistantText.includes('<stop_call_close>');
    const hasNoClose = assistantText.includes('<stop_call_no_close>');
    const nextStatus: ConversationStatus = hasClose
        ? 'CLOSED'
        : hasNoClose
          ? 'NOT_CLOSED'
          : 'UNFINISHED';

    const conversation = await db.conversation.findUnique({
        where: { id: conversationId },
        select: { messages: true }
    });
    const previousMessages = Array.isArray(conversation?.messages) ? (conversation.messages as RoleMessage[]) : [];

    return db.conversation.update({
        where: { id: conversationId },
        data: {
            status: nextStatus,
            // store as JSON array of role messages (recommended)
            messages: [
                ...previousMessages,
                { role: 'user', content: userText } as RoleMessage,
                {
                    role: 'assistant',
                    content: assistantText,
                } as RoleMessage,
            ],
        },
    });
}
