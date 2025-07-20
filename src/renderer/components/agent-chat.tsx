import { Send, User, Bot } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

import type {
  AgentData,
  MessageData,
  AgentChatResponse,
  ConversationWithMessages,
} from "@/renderer/types/agent-chat.types";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AgentChatProps {
  agent: AgentData;
  userId: string;
}

interface Message extends MessageData {
  isFromAgent: boolean;
}

export function AgentChat({ agent, userId }: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversation = useCallback(async () => {
    try {
      const response = await window.api.agentChat.getConversation(
        userId,
        agent.id,
      );
      if (response.success && response.data) {
        const data = response.data as ConversationWithMessages;
        setConversationId(data.conversation.id);
        const formattedMessages = data.messages.map((msg: MessageData) => ({
          ...msg,
          isFromAgent: msg.authorId === agent.id,
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  }, [agent.id, userId]);

  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage("");
    setIsLoading(true);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      conversationId: conversationId,
      authorId: userId,
      content: messageContent,
      createdAt: new Date(),
      updatedAt: new Date(),
      isFromAgent: false,
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await window.api.agentChat.sendMessage({
        agentId: agent.id,
        userId,
        content: messageContent,
      });

      if (response.success && response.data) {
        const data = response.data as AgentChatResponse;
        const agentMessage: Message = {
          id: data.agentMessageId,
          conversationId: data.conversationId,
          authorId: agent.id,
          content: data.content,
          createdAt: new Date(),
          updatedAt: new Date(),
          isFromAgent: true,
        };

        setMessages((prev) => [...prev, agentMessage]);
        setConversationId(data.conversationId);
      } else {
        console.error("Failed to send message:", response.error);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex-none border-b">
        <CardTitle className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={`/avatars/${agent.id}.png`} />
            <AvatarFallback>
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span>{agent.name}</span>
            <span className="text-sm font-normal text-muted-foreground">
              {agent.role}
            </span>
          </div>
          <Badge variant="secondary" className="ml-auto">
            {agent.status}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <Bot className="h-8 w-8 mb-2" />
                <p>Start a conversation with {agent.name}</p>
                <p className="text-sm">{agent.goal}</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.isFromAgent ? "justify-start" : "justify-end"
                  }`}
                >
                  {message.isFromAgent && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.isFromAgent
                        ? "bg-muted"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <span className="text-xs opacity-70">
                      {message.createdAt instanceof Date
                        ? message.createdAt.toLocaleTimeString()
                        : new Date(message.createdAt).toLocaleTimeString()}
                    </span>
                  </div>

                  {!message.isFromAgent && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.1s]" />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.2s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${agent.name}...`}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
