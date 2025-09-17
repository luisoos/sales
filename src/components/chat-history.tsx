import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion";
import FormattedDate from "./formatted-date";
import { MentorChat } from "@prisma/client";
import { JsonArray } from "@prisma/client/runtime/library";
import { RoleMessage } from "~/types/conversation";

const chatHistoryBoxMaxCharacterLength = 50;

export default function ChatHistory() {
    const [latestChats, setLatestChats] = useState<MentorChat[]>();
    const [error, setError] = useState<string>();
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchMentorChats = async () => {
            try {
                setLoading(true)
                const mentorChats = await fetch(
                    '/api/protected/mentor',
                );
                const data = await mentorChats.json();
                setLatestChats(data.mentorChats);
            } catch (error: any) {
                setError('Failed to fetch conversations.');
            } finally {
                setLoading(false);
            }
        };
        fetchMentorChats();
    }, []);

    if (error || (latestChats && latestChats.length < 1)) {
        return(<></>);
    }

    if (loading) {
        <div className="flex space-y-3">
            <Skeleton className="h-[125px] w-[250px] rounded-xl" />
            <Skeleton className="h-[125px] w-[250px] rounded-xl" />
            <Skeleton className="h-[125px] w-[250px] rounded-xl" />
            <Skeleton className="h-[125px] w-[250px] rounded-xl" />
            <Skeleton className="h-[125px] w-[250px] rounded-xl" />
        </div>
    }

    return (
        <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue="item-1"
        >
            <AccordionItem value="item-1">
                <AccordionContent className="flex gap-4 mx-6 text-balance overflow-x-scroll">
                {latestChats && latestChats.length > 0 && latestChats.map(chat => (
                    <ChatHistoryBox key={chat.id} messages={chat.messages as RoleMessage[]} updatedAt={chat.updatedAt} />
                ))}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}

function ChatHistoryBox({messages, updatedAt}: { messages: RoleMessage[], updatedAt: Date | string }) {
    const firstMessage = messages[0]?.content || 'No messages in chat';
    return (<div className="w-52 h-14 flex flex-col justify-between">
        {firstMessage.length > chatHistoryBoxMaxCharacterLength && firstMessage.substring(0, chatHistoryBoxMaxCharacterLength)}...
        <span className="text-zinc-500 font-mono text-xs"><FormattedDate pDate={updatedAt} /></span>
    </div>);
}