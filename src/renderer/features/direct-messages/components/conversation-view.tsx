import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Paperclip, Smile, AtSign } from "lucide-react";
import { PageTitle } from "@/components/page-title";
import { MessageItem } from "@/components/chat/message-item";
import { useAgentChat } from "../hooks/use-agent-chat.hook";
import type { ConversationDto, MessageDto } from "../../../../shared/types/message.types";

interface ConversationViewProps {
  conversationId: string;
  conversation: ConversationDto;
}

export function ConversationView({ conversationId, conversation }: ConversationViewProps) {
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);
  const previousMessagesLength = useRef(0);

  // Use agent chat hook which handles LLM provider selection based on agent
  const {
    messages,
    isSending,
    isTyping,
    error,
    sendMessage,
    regenerateLastMessage,
    clearError,
    agent,
    fullAgent,
  } = useAgentChat({
    conversationId,
    conversation,
  });

  // Auto-scroll to bottom when messages change or typing indicator appears
  useEffect(() => {
    if (messagesEndRef.current) {
      // First load: scroll instantly to bottom
      if (isInitialLoad.current && messages.length > 0) {
        messagesEndRef.current.scrollIntoView({ behavior: "instant" });
        isInitialLoad.current = false;
        previousMessagesLength.current = messages.length;
      } 
      // New message added: smooth scroll
      else if (messages.length > previousMessagesLength.current || isTyping) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        previousMessagesLength.current = messages.length;
      }
    }
  }, [messages, isTyping]);

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



  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !fullPersona) return;

    const messageToSend = messageInput.trim();
    // Limpar input imediatamente
    setMessageInput("");

    try {
      await sendMessage(messageToSend);
    } catch (err) {
      console.error("Failed to send message:", err);
      // Em caso de erro, restaurar a mensagem no input
      setMessageInput(messageToSend);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as any);
    }
  };


  // Convert MessageDto to format expected by MessageItem
  const convertToMessageFormat = (msg: MessageDto) => ({
    id: msg.id,
    content: msg.content,
    senderId: msg.senderId,
    senderName: msg.senderId === "user" ? "João Silva" : agent.name,
    senderType: msg.senderType,
    messageType: "text" as const,
    timestamp: new Date(msg.timestamp || msg.createdAt),
    isEdited: false,
    mentions: [],
  });

  const titleIcon = (
    <Avatar className="w-5 h-5">
      <AvatarFallback className="text-xs">
        {agent.name.slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <div className="flex flex-col h-full bg-background">
      <PageTitle title={agent.name} icon={titleIcon} />

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-4">
          <div className="space-y-4 py-4">
            {/* Error display */}
            {error && (
              <div className="flex items-center justify-between bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
                <span>{error}</span>
                <Button variant="ghost" size="sm" onClick={clearError}>
                  Limpar
                </Button>
              </div>
            )}
            
            {/* Warning for missing agent or LLM provider */}
            {!fullPersona && (
              <div className="flex items-center justify-center bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                ⚠️ Persona não encontrada para esta conversa.
              </div>
            )}
            
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <AtSign className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  Este é o início da sua conversa com {agent.name}
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
                    message={convertToMessageFormat(msg)}
                    onEdit={(id, content) => console.log("Edit:", id, content)}
                    onDelete={(id) => console.log("Delete:", id)}
                    onReply={(id) => console.log("Reply:", id)}
                    showActions={true}
                  />
                ))}
                {isTyping && (
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-purple-500">
                        {agent.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2 text-muted-foreground bg-muted rounded-lg px-3 py-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-sm">{agent.name} está digitando...</span>
                    </div>
                  </div>
                )}
                {/* Invisible element for auto-scroll */}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border flex-shrink-0">
        <form onSubmit={handleSend}>
          <div className="relative">
            <Textarea
              placeholder={
                !fullPersona 
                  ? "Persona não encontrada..."
                  : `Mensagem para ${agent.name}`
              }
              className="min-h-[44px] max-h-32 resize-none pr-12 py-3"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!fullPersona}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <Paperclip className="w-4 h-4 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <Smile className="w-4 h-4 text-muted-foreground" />
              </Button>
              <Button
                type="submit"
                size="icon"
                className="w-8 h-8"
                disabled={!messageInput.trim() || !fullPersona}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </form>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>Use **negrito**, *itálico*, `código` para formatar</span>
          <span>Enter para enviar, Shift+Enter para nova linha</span>
        </div>
      </div>
    </div>
  );
}