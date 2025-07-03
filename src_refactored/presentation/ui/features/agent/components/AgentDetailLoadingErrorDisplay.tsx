import { useRouter } from '@tanstack/react-router';
import { Loader2, ServerCrash, ArrowLeft } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";

interface AgentDetailLoadingErrorDisplayProps {
  isLoading: boolean;
  error: Error | null;
  agentId: string;
}

export function AgentDetailLoadingErrorDisplay({
  isLoading,
  error,
}: AgentDetailLoadingErrorDisplayProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-10 w-10 animate-spin text-sky-500 mb-4" />
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Carregando detalhes da instância do agente...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px] bg-red-50 dark:bg-red-900/10 rounded-lg">
        <ServerCrash className="h-12 w-12 text-red-500 dark:text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">
          Falha ao carregar dados
        </h2>
        <p className="text-sm text-red-600 dark:text-red-400 mb-4">
          {error.message}
        </p>
        <Button
          onClick={() => router.navigate({ to: "/app/agents" })}
          variant="destructive"
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista de Agentes
        </Button>
      </div>
    );
  }

  return null;
}
