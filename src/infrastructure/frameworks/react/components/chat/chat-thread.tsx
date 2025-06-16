import { ChatInput } from "@/components/chat/chat-input";

import { useScroll } from "@/hooks/use-scroll";
import { H3 } from "@/components/typography/titles";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage, ChatMessageProps } from "@/components/chat/chat-message";

export function ChatThread({
  threadId,
  messages,
  title = "Chat",
}: {
  threadId: string;
  messages: ChatMessageProps[];
  title?: string;
}) {
  const ref = useScroll([threadId], { behavior: "instant" });

  return (
    <div className="h-screen flex flex-1 flex-col">
      <header className="">
        <H3 className="m-2">{title}</H3>
        <Separator />
      </header>
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="flex flex-col gap-2 h-full">
            {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4">
              <p className="text-muted-foreground">Nenhuma mensagem ainda.</p>
              <p className="text-sm text-muted-foreground">Envie uma mensagem para começar a conversa!</p>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            )))}
            <div ref={ref} />
          </div>
        </ScrollArea>
      </div>
      <ChatInput />
    </div>
  );
}
