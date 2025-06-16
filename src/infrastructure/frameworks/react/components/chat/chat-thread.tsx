import { ChatInput } from "@/components/chat/chat-input";

import { useScroll } from "@/hooks/use-scroll";
import { H3 } from "@/components/typography/titles";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage, ChatMessageProps } from "@/components/chat/chat-message";

export function ChatThread({
  threadId,
  messages,
}: {
  threadId: string;
  messages: ChatMessageProps[];
}) {
  const ref = useScroll([threadId], { behavior: "instant" });

  return (
    <div className="h-screen flex flex-1 flex-col">
      <header className="">
        <H3 className="m-2">{"Mensagens Diretas"}</H3>
        <Separator />
      </header>
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="flex flex-col gap-2">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={ref} />
          </div>
        </ScrollArea>
      </div>
      <ChatInput />
    </div>
  );
}
