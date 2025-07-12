import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Paperclip, Smile, AtSign } from "lucide-react";
import { PageTitle } from "@/components/page-title";
import { MessageItem } from "@/components/chat/message-item";
import { useMessages } from "../hooks/use-messages.hook";
import type { ConversationDto } from "../../../../shared/types/message.types";

interface ConversationViewProps {
  conversationId: string;
  conversation: ConversationDto;
}

export function ConversationView({ conversationId, conversation }: ConversationViewProps) {
  const [message, setMessage] = useState("");
  const { messages, createMessage } = useMessages(conversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);
  const previousMessagesLength = useRef(0);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      // First load: scroll instantly to bottom
      if (isInitialLoad.current && messages.length > 0) {
        messagesEndRef.current.scrollIntoView({ behavior: "instant" });
        isInitialLoad.current = false;
        previousMessagesLength.current = messages.length;
      } 
      // New message added: smooth scroll
      else if (messages.length > previousMessagesLength.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        previousMessagesLength.current = messages.length;
      }
    }
  }, [messages]);

  // Reset for new conversation
  useEffect(() => {
    isInitialLoad.current = true;
    previousMessagesLength.current = 0;
  }, [conversationId]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };


  const getOtherParticipant = (conv: ConversationDto) => {
    return conv.participants.find((p: string) => p !== "user") || "Unknown";
  };

  const otherParticipant = getOtherParticipant(conversation);

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      await createMessage({
        content: message.trim(),
        senderId: "user",
        senderName: "Usuário",
        senderType: "user",
        conversationId,
      });
      setMessage("");
      // The useEffect will handle smooth scrolling automatically when messages update
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const titleIcon = (
    <Avatar className="w-5 h-5">
      <AvatarFallback className="text-xs">
        {otherParticipant.slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <div className="flex flex-col h-full bg-background">
      <PageTitle title={otherParticipant} icon={titleIcon} />
      <div className="px-4 py-2 border-b">
        <Badge variant="secondary" className="text-xs">
          Agente IA
        </Badge>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-4">
          <div className="space-y-4 py-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <AtSign className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  Este é o início da sua conversa com {otherParticipant}
                </h3>
                <p className="text-muted-foreground">
                  Comece uma conversa enviando uma mensagem abaixo.
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <MessageItem
                    key={msg.id}
                    message={{
                      id: msg.id,
                      content: msg.content,
                      senderId: msg.senderId,
                      senderName: msg.senderName,
                      senderType: msg.senderType,
                      messageType: "text",
                      timestamp: msg.timestamp,
                      isEdited: false,
                      mentions: [],
                    }}
                    onEdit={(id, content) => console.log("Edit:", id, content)}
                    onDelete={(id) => console.log("Delete:", id)}
                    onReply={(id) => console.log("Reply:", id)}
                    showActions={true}
                  />
                ))}
                {/* Invisible element for auto-scroll */}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border flex-shrink-0">
        <div className="relative">
          <Textarea
            placeholder={`Mensagem para ${otherParticipant}`}
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