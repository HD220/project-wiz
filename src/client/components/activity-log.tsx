import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHistory } from "../hooks/use-history";

/**
 * Componente que exibe o histórico real de conversas e mensagens
 * Permite selecionar uma conversa, filtrar mensagens e exportar o histórico
 */
export default function ActivityLog() {
  const {
    conversations,
    messages,
    selectedConversation,
    fetchConversations,
    fetchMessages,
    selectConversation,
    exportHistory,
    loading,
    error,
  } = useHistory();

  const [filter, setFilter] = useState("");

  // Carrega as conversas ao montar o componente
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Filtra mensagens da conversa selecionada pelo texto digitado
  const filteredMessages = messages.filter(
    (msg) =>
      msg.content.toLowerCase().includes(filter.toLowerCase()) ||
      msg.role.toLowerCase().includes(filter.toLowerCase())
  );

  /**
   * Formata data/hora para exibição amigável
   */
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return (
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
      " " +
      date.toLocaleDateString([], { month: "short", day: "numeric" })
    );
  };

  /**
   * Exporta o histórico completo em JSON
   */
  const handleExport = async () => {
    const data = await exportHistory("json");
    if (!data) return;
    const blob =
      data instanceof Blob ? data : new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "historico_conversas.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Lista de conversas */}
      <div className="w-full md:w-1/4 border rounded p-2 space-y-2 overflow-y-auto max-h-[80vh]">
        <h2 className="font-bold text-lg mb-2">Conversas</h2>
        {loading && <p>Carregando conversas...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => {
              selectConversation(conv);
              fetchMessages(conv.id);
            }}
            className={`p-2 rounded cursor-pointer border ${
              selectedConversation?.id === conv.id
                ? "bg-blue-100 border-blue-400"
                : "hover:bg-gray-100"
            }`}
          >
            <div className="font-semibold">{conv.title || "Sem título"}</div>
            <div className="text-xs text-gray-500">
              {formatDate(conv.updatedAt || conv.createdAt)}
            </div>
          </div>
        ))}
        {conversations.length === 0 && !loading && <p>Nenhuma conversa encontrada.</p>}
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2"
          onClick={handleExport}
        >
          Exportar Histórico
        </Button>
      </div>

      {/* Mensagens da conversa selecionada */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {selectedConversation?.title || "Selecione uma conversa"}
          </h2>
          <Input
            placeholder="Filtrar mensagens..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-xs"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mensagens</CardTitle>
            <CardDescription>
              {selectedConversation
                ? "Mensagens da conversa selecionada"
                : "Selecione uma conversa para visualizar as mensagens"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && <p>Carregando mensagens...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {selectedConversation && filteredMessages.length === 0 && !loading && (
              <p>Nenhuma mensagem encontrada.</p>
            )}
            <div className="space-y-4">
              {filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="border rounded p-2 flex flex-col gap-1 bg-muted"
                >
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{msg.role === "user" ? "Usuário" : "Assistente"}</span>
                    <span>{formatDate(msg.createdAt)}</span>
                  </div>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
