import { Hash, Send, Paperclip, Smile, AtSign } from "lucide-react";
import { useState, useEffect } from "react";

import { PageTitle } from "@/components/page-title";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useChannelMessagesById } from "@/features/channel-messaging/hooks/use-channel-messages.hook";
import { Message } from "@/lib/placeholders";
import { cn } from "@/lib/utils";

import { MessageItem } from "./message-item";

import type { ChannelMessageDto } from "../../../shared/types/channel-message.types";

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
  const [isSending, setIsSending] = useState(false);

  // Use channel messages hook only for channel chat (not agent chat)
  const channelMessagesHook = channelId
    ? useChannelMessagesById(channelId)
    : null;

  // For agent chat, continue using placeholder data
  const agentMessages: Message[] = [];

  const messages = channelId
    ? channelMessagesHook?.messages || []
    : agentMessages;

  const handleSend = async () => {
    if (!message.trim() || isSending) return;

    if (channelId && channelMessagesHook) {
      // Send message to channel
      setIsSending(true);
      try {
        await channelMessagesHook.sendTextMessage(
          message.trim(),
          "current-user-id", // TODO: Get from user context
          "João Silva", // TODO: Get from user context
        );
        setMessage("");
      } catch (error) {
        console.error("Failed to send message:", error);
        // Error is handled by the store
      } finally {
        setIsSending(false);
      }
    } else if (agentId) {
      // Handle agent messages (placeholder)
      console.log("Sending message to agent:", message);
      setMessage("");
    }
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
  const isLoading = channelMessagesHook?.isLoading || false;
  const error = channelMessagesHook?.error;

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
            {isLoading && messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Hash className="w-8 h-8 text-muted-foreground animate-pulse" />
                </div>
                <p className="text-muted-foreground">Carregando mensagens...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                  <Hash className="w-8 h-8 text-destructive" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-destructive">
                  Erro ao carregar mensagens
                </h3>
                <p className="text-muted-foreground">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => channelMessagesHook?.refetch()}
                >
                  Tentar novamente
                </Button>
              </div>
            ) : messages.length === 0 ? (
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
              messages.map((msg) => {
                // Convert ChannelMessageDto to MessageItem format
                const isChannelMessage = "channelId" in msg;

                if (isChannelMessage) {
                  const channelMsg = msg as ChannelMessageDto;
                  return (
                    <MessageItem
                      key={channelMsg.id}
                      message={{
                        id: channelMsg.id,
                        content: channelMsg.content,
                        senderId: channelMsg.authorId,
                        senderName: channelMsg.authorName,
                        senderType:
                          channelMsg.authorId === "system"
                            ? "system"
                            : channelMsg.authorId.startsWith("agent-")
                              ? "agent"
                              : "user",
                        messageType:
                          channelMsg.type === "code" ? "code" : "text",
                        timestamp: channelMsg.createdAt,
                        isEdited: channelMsg.isEdited,
                        mentions: [], // TODO: Implement mentions
                      }}
                      onEdit={(id, content) => {
                        if (channelMessagesHook) {
                          channelMessagesHook.updateMessage({ id, content });
                        }
                      }}
                      onDelete={(id) => {
                        if (channelMessagesHook) {
                          channelMessagesHook.deleteMessage(id);
                        }
                      }}
                      onReply={(id) => console.log("Reply:", id)}
                      showActions={true}
                    />
                  );
                }
                // Handle agent messages (legacy format)
                const legacyMsg = msg as Message;
                return (
                  <MessageItem
                    key={legacyMsg.id}
                    message={{
                      id: legacyMsg.id,
                      content: legacyMsg.content,
                      senderId: legacyMsg.authorId,
                      senderName: legacyMsg.authorName,
                      senderType: legacyMsg.authorId.startsWith("agent-")
                        ? "agent"
                        : "user",
                      messageType:
                        legacyMsg.type === "code"
                          ? "text"
                          : (legacyMsg.type as any),
                      timestamp: legacyMsg.timestamp,
                      isEdited: legacyMsg.edited || false,
                      mentions: legacyMsg.mentions || [],
                    }}
                    onEdit={(id, content) => console.log("Edit:", id, content)}
                    onDelete={(id) => console.log("Delete:", id)}
                    onReply={(id) => console.log("Reply:", id)}
                    showActions={true}
                  />
                );
              })
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
              disabled={!message.trim() || isSending}
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
