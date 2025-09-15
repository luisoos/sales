import { db } from '~/server/db';
import { ConversationStatus } from '@prisma/client';
import { RoleMessage } from '~/types/conversation';

export async function getOrCreateConversation(params: {
    userId: string;
    lessonId: string;
}) {
    const existing = await db.conversation.findFirst({
        where: { userId: params.userId, lessonId: params.lessonId },
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

    return db.conversation.update({
        where: { id: conversationId },
        data: {
            status: nextStatus,
            // store as JSON array of role messages (recommended)
            messages: {
                push: [
                    { role: 'user', content: userText } as RoleMessage,
                    {
                        role: 'assistant',
                        content: assistantText,
                    } as RoleMessage,
                ],
            },
        },
    });
}
