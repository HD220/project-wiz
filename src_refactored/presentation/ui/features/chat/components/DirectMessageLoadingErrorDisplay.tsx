import { ArrowLeft, Loader2, ServerCrash } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { useRouter } from "@tanstack/react-router";

interface DirectMessageLoadingErrorDisplayProps {
  isLoading: boolean;
  error: Error | null;
  conversationId: string;
}

export function DirectMessageLoadingErrorDisplay({
  isLoading,
  error,
  conversationId,
}: DirectMessageLoadingErrorDisplayProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" /> Carregando
        conversa...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-red-50 dark:bg-red-900/10 rounded-lg">
        <ServerCrash className="h-12 w-12 text-red-500 dark:text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">
          Erro ao Carregar Conversa
        </h2>
        <p className="text-sm text-red-600 dark:text-red-400 mb-1">
          {error.message}
        </p>
        <Button
          onClick={() => router.navigate({ to: "/user/" })}
          variant="destructive"
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para DMs
        </Button>
      </div>
    );
  }

  if (!conversationId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900">
        <ServerCrash className="h-12 w-12 text-slate-500 dark:text-slate-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Conversa não encontrada</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Não foi possível encontrar detalhes para a conversa com ID:{" "}
          {conversationId}.
        </p>
        <Button
          onClick={() => router.navigate({ to: "/user/" })}
          variant="outline"
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para DMs
        </Button>
      </div>
    );
  }

  return null;
}
