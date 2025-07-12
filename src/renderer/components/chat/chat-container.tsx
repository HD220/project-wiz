import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Hash, Send, Paperclip, Smile, AtSign } from "lucide-react";
import {
  Message,
  mockMessages,
  getMessagesByChannel,
} from "@/lib/placeholders";
import { cn } from "@/lib/utils";
import { PageTitle } from "@/components/page-title";
import { MessageItem } from "./message-item";

interface ChatContainerProps {
  channelId?: string;
  channelName?: string;
  agentId?: string;
  agentName?: string;
  className?: string;
}

export function ChatContainer({
  channelId,
  channelName,
  agentId,
  agentName,
  className,
}: ChatContainerProps) {
  const [message, setMessage] = useState("");

  // Get messages based on channel or agent
  const messages = channelId
    ? getMessagesByChannel(channelId)
    : mockMessages.filter(
        (m) => m.authorId === agentId || m.channelId === "dm-" + agentId,
      );

  const handleSend = () => {
    if (!message.trim()) return;

    // TODO: Implement sending message
    console.log("Sending message:", message);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const displayName = channelName || agentName || "Chat";
  const isAgentChat = !!agentId;

  const titleIcon = isAgentChat ? (
    <Avatar className="w-5 h-5">
      <AvatarFallback className="text-xs">
        {displayName.slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  ) : (
    <Hash className="w-5 h-5 text-muted-foreground" />
  );

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      <PageTitle title={displayName} icon={titleIcon} />
      {isAgentChat && (
        <div className="px-4 py-2 border-b">
          <Badge variant="secondary" className="text-xs">
            Agente IA
          </Badge>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-4">
          <div className="space-y-4 py-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  {isAgentChat ? (
                    <AtSign className="w-8 h-8 text-muted-foreground" />
                  ) : (
                    <Hash className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  {isAgentChat
                    ? `Este é o início da sua conversa com ${displayName}`
                    : `Bem-vindo ao #${displayName}!`}
                </h3>
                <p className="text-muted-foreground">
                  {isAgentChat
                    ? "Comece uma conversa enviando uma mensagem abaixo."
                    : "Este é o início do canal. Envie uma mensagem para começar a discussão."}
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <MessageItem
                  key={msg.id}
                  message={{
                    id: msg.id,
                    content: msg.content,
                    senderId: msg.authorId,
                    senderName: msg.authorName,
                    senderType: msg.authorId.startsWith("agent-")
                      ? "agent"
                      : "user",
                    messageType:
                      msg.type === "code" ? "text" : (msg.type as any),
                    timestamp: msg.timestamp,
                    isEdited: msg.edited,
                    mentions: msg.mentions,
                  }}
                  onEdit={(id, content) => console.log("Edit:", id, content)}
                  onDelete={(id) => console.log("Delete:", id)}
                  onReply={(id) => console.log("Reply:", id)}
                  showActions={true}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border flex-shrink-0">
        <div className="relative">
          <Textarea
            placeholder={
              isAgentChat
                ? `Mensagem para ${displayName}`
                : `Mensagem para #${displayName}`
            }
            className="min-h-[44px] max-h-32 resize-none pr-12 py-3"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <Paperclip className="w-4 h-4 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <Smile className="w-4 h-4 text-muted-foreground" />
            </Button>
            <Button
              size="icon"
              className="w-8 h-8"
              onClick={handleSend}
              disabled={!message.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>Use **negrito**, *itálico*, `código` para formatar</span>
          <span>Enter para enviar, Shift+Enter para nova linha</span>
        </div>
      </div>
    </div>
  );
}
