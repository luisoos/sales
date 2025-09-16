import { useState, useEffect, useMemo } from 'react';
import { Conversation } from '@prisma/client';

export interface LessonWithStatus {
    id: number;
    userHasDoneLesson: boolean;
    [key: string]: any;
}

export function useLessonStatus<T extends { id: number }>(lessons: T[]) {
    const [uniqueLectionsSuccessfullyDone, setUniqueLectionsSuccessfullyDone] = useState<
        number | undefined
    >();
    const [uniqueLectionsSuccessfullyDoneIds, setUniqueLectionsSuccessfullyDoneIds] = useState<
        string[] | undefined
    >();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const conversationRequest = await fetch(
                    '/api/protected/conversations',
                );
                const data = await conversationRequest.json();
                const conversations = data.conversations as Conversation[];

                const uniqueConversationsSuccessfullyDone = conversations.filter(
                    (item, index, self) =>
                        item.status === "CLOSED" &&
                        index === self.findIndex(t => t.lessonId === item.lessonId)
                );

                setUniqueLectionsSuccessfullyDone(uniqueConversationsSuccessfullyDone.length);
                setUniqueLectionsSuccessfullyDoneIds(
                    uniqueConversationsSuccessfullyDone.map(
                        (conversation) => conversation.lessonId,
                    ),
                );
            } catch (error: any) {
                console.log('Could not fetch conversation history.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchConversations();
    }, []);

    // Computed state for lessons with completion status, sorted with undone lessons first
    const lessonsWithStatus = useMemo(() => {
        return lessons
            .map((lesson) => ({
                ...lesson,
                userHasDoneLesson:
                    uniqueLectionsSuccessfullyDoneIds?.includes(String(lesson.id)) ?? false,
            }))
            .sort((a, b) => {
                // If both have same completion status, sort by ID
                if (a.userHasDoneLesson === b.userHasDoneLesson) {
                    return a.id - b.id;
                }
                // Undone lessons (false) come first, done lessons (true) come last
                return a.userHasDoneLesson ? 1 : -1;
            });
    }, [lessons, uniqueLectionsSuccessfullyDoneIds]);

    return {
        uniqueLectionsSuccessfullyDone,
        uniqueLectionsSuccessfullyDoneIds,
        lessonsWithStatus,
        isLoading,
    };
}
