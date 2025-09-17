import { RoleMessage } from '~/types/conversation';
import { db } from '~/server/db';

export async function updateOrCreateMentorChat(params: {
    userId: string;
    newMessages: RoleMessage[];
    mentorChatId?: string | undefined;
}) {
    if (!params.mentorChatId) {
        return db.mentorChat.create({
            data: {
                userId: params.userId,
                messages: params.newMessages,
            },
        });
    }

    const mentorChat = await db.mentorChat.findUnique({
        where: { id: params.mentorChatId },
        select: { messages: true },
    });
    const previousMessages = Array.isArray(mentorChat?.messages)
        ? (mentorChat.messages as RoleMessage[])
        : [];

    return db.mentorChat.update({
        where: { id: params.mentorChatId },
        data: {
            // store as JSON array of role messages (recommended)
            messages: [...previousMessages, params.newMessages],
        },
    });
}
