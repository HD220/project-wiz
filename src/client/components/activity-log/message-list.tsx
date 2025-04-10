import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageItem } from "./message-item";

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt?: string;
}

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  error?: string;
  selectedConversationTitle?: string;
  formatDate: (dateString?: string) => string;
}

export function MessageList({
  messages,
  loading,
  error,
  selectedConversationTitle,
  formatDate,
}: MessageListProps) {
  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {selectedConversationTitle || "Selecione uma conversa"}
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mensagens</CardTitle>
          <CardDescription>
            {selectedConversationTitle
              ? "Mensagens da conversa selecionada"
              : "Selecione uma conversa para visualizar as mensagens"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && <p>Carregando mensagens...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {selectedConversationTitle && messages.length === 0 && !loading && (
            <p>Nenhuma mensagem encontrada.</p>
          )}
          <div className="space-y-4">
            {messages.map((msg) => (
              <MessageItem
                key={msg.id}
                id={msg.id}
                role={msg.role}
                content={msg.content}
                createdAt={msg.createdAt}
                formatDate={formatDate}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}