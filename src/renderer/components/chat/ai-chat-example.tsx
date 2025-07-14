import React, { useState } from "react";
import { useChannelChat } from "../../features/channel-messaging/hooks/use-channel-chat.hook";
import { useLlmProviders } from "../../features/llm-provider-management/hooks/use-llm-provider.hook";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Alert, AlertDescription } from "../ui/alert";
import { Loader2, MessageSquare, Bot, User } from "lucide-react";

interface AIChatExampleProps {
  channelId: string;
  authorId?: string;
  authorName?: string;
}

export function AIChatExample({
  channelId,
  authorId = "test-user",
  authorName = "Test User",
}: AIChatExampleProps) {
  const [selectedLlmProvider, setSelectedLlmProvider] = useState<string>("");
  const [messageInput, setMessageInput] = useState("");
  const [systemPrompt, setSystemPrompt] = useState(
    "Você é um assistente útil e amigável.",
  );

  // Carregar LLM providers disponíveis
  const { llmProviders, isLoading: loadingProviders } = useLlmProviders();

  // Auto-selecionar o primeiro provider disponível
  React.useEffect(() => {
    if (llmProviders.length > 0 && !selectedLlmProvider) {
      setSelectedLlmProvider(llmProviders[0].id);
    }
  }, [llmProviders, selectedLlmProvider]);

  // Hook de chat com IA
  const {
    messages,
    isLoading,
    isSending,
    isRegenerating,
    error,
    sendMessage,
    regenerateLastMessage,
    clearError,
    validateProvider,
    currentConfig,
  } = useChannelChat({
    channelId,
    llmProviderId: selectedLlmProvider,
    authorId,
    authorName,
    systemPrompt,
    temperature: 0.7,
    maxTokens: 1000,
    includeHistory: true,
    historyLimit: 10,
  });

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedLlmProvider) return;

    try {
      await sendMessage(messageInput.trim());
      setMessageInput("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleRegenerateLastMessage = async () => {
    try {
      await regenerateLastMessage();
    } catch (err) {
      console.error("Failed to regenerate message:", err);
    }
  };

  const handleValidateProvider = async () => {
    if (!selectedLlmProvider) return;

    try {
      const isValid = await validateProvider(selectedLlmProvider);
      alert(isValid ? "Provider válido!" : "Provider inválido!");
    } catch (err) {
      console.error("Failed to validate provider:", err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const lastMessage = messages[messages.length - 1];
  const canRegenerate = lastMessage && lastMessage.authorId === "ai";

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          AI Chat Test - Canal: {channelId}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Aviso se não há providers */}
        {!loadingProviders && llmProviders.length === 0 && (
          <Alert>
            <AlertDescription>
              ⚠️ Nenhum LLM Provider configurado. Vá para{" "}
              <strong>Configurações</strong> para adicionar um provider antes de
              testar o chat.
            </AlertDescription>
          </Alert>
        )}

        {/* Configuração */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">
              LLM Provider{" "}
              {loadingProviders && (
                <span className="text-xs text-muted-foreground">
                  (carregando...)
                </span>
              )}
            </label>
            <Select
              value={selectedLlmProvider}
              onValueChange={setSelectedLlmProvider}
              disabled={loadingProviders || llmProviders.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingProviders
                      ? "Carregando..."
                      : llmProviders.length === 0
                        ? "Nenhum provider disponível"
                        : "Selecione um provider"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {llmProviders.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name} ({provider.provider} - {provider.model})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">System Prompt</label>
            <Input
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Prompt do sistema..."
            />
          </div>
        </div>

        {/* Status e controles */}
        <div className="flex gap-2">
          <Button
            onClick={handleValidateProvider}
            disabled={!selectedLlmProvider}
            variant="outline"
            size="sm"
          >
            Testar Provider
          </Button>

          <Button
            onClick={handleRegenerateLastMessage}
            disabled={!canRegenerate || isRegenerating}
            variant="outline"
            size="sm"
          >
            {isRegenerating && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Regenerar Última
          </Button>
        </div>

        {/* Erro */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              {error}
              <Button
                onClick={clearError}
                variant="ghost"
                size="sm"
                className="ml-2"
              >
                Limpar
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Status de configuração */}
        {currentConfig && (
          <div className="text-sm text-muted-foreground">
            Configuração: {currentConfig.llmProviderId} | Temp:{" "}
            {currentConfig.temperature} | Max Tokens: {currentConfig.maxTokens}{" "}
            | História: {currentConfig.includeHistory ? "Sim" : "Não"}
          </div>
        )}

        {/* Lista de mensagens */}
        <div className="border rounded-lg p-4 h-96 overflow-y-auto space-y-3">
          {isLoading && (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.authorId === "ai" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.authorId === "ai"
                    ? "bg-muted text-muted-foreground"
                    : "bg-primary text-primary-foreground"
                } ${message.type === "system" ? "bg-yellow-100 text-yellow-800" : ""}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {message.authorId === "ai" ? (
                    <Bot className="h-4 w-4" />
                  ) : message.type === "system" ? (
                    <MessageSquare className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  <span className="text-xs font-medium">
                    {message.authorName}
                  </span>
                  <span className="text-xs opacity-70">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-sm whitespace-pre-wrap">
                  {message.content}
                </div>
                {message.isEdited && (
                  <div className="text-xs opacity-70 mt-1">(editado)</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input de mensagem */}
        <div className="flex gap-2">
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              !selectedLlmProvider
                ? "Selecione um provider primeiro..."
                : isSending
                  ? "Enviando..."
                  : "Digite sua mensagem..."
            }
            disabled={isSending || !selectedLlmProvider}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || isSending || !selectedLlmProvider}
          >
            {isSending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isSending ? "Enviando..." : "Enviar"}
          </Button>
        </div>

        {/* Status do provider selecionado */}
        {selectedLlmProvider && (
          <div className="text-sm text-muted-foreground">
            ✅ Provider ativo:{" "}
            {llmProviders.find((p) => p.id === selectedLlmProvider)?.name}
          </div>
        )}

        {/* Informações de debug */}
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer">Debug Info</summary>
          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
            {JSON.stringify(
              {
                channelId,
                selectedLlmProvider,
                messageCount: messages.length,
                isLoading,
                isSending,
                isRegenerating,
                hasError: !!error,
                currentConfig,
              },
              null,
              2,
            )}
          </pre>
        </details>
      </CardContent>
    </Card>
  );
}
