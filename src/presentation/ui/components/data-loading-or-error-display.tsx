import { useRouter } from "@tanstack/react-router";
import { ArrowLeft, Loader2, ServerCrash } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";



interface DataLoadingOrErrorDisplayProps {
  isLoadingAll: boolean;
  anyError: Error | null | undefined;
  agentError?: Error | null;
  personasError?: Error | null;
  llmsError?: Error | null;
  router: ReturnType<typeof useRouter>;
}

export function DataLoadingOrErrorDisplay({
  isLoadingAll,
  anyError,
  agentError,
  personasError,
  llmsError,
  router,
}: DataLoadingOrErrorDisplayProps) {
  if (isLoadingAll) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-10 w-10 animate-spin text-sky-500 mb-4" />
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Carregando dados para edição...
        </p>
      </div>
    );
  }

  if (anyError) {
    const errorMessages = [];
    if (agentError)
      errorMessages.push(`Detalhes do Agente: ${agentError.message}`);
    if (personasError)
      errorMessages.push(`Templates de Persona: ${personasError.message}`);
    if (llmsError)
      errorMessages.push(`Configurações LLM: ${llmsError.message}`);
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px] bg-red-50 dark:bg-red-900/10 rounded-lg">
        <ServerCrash className="h-12 w-12 text-red-500 dark:text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">
          Falha ao carregar dados
        </h2>
        <div className="text-sm text-red-600 dark:text-red-400 mb-4 space-y-1">
          {errorMessages.map((msg, idx) => (
            <p key={idx}>{msg}</p>
          ))}
        </div>
        <Button
          onClick={() => router.history.back()}
          variant="destructive"
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </div>
    );
  }
  return null;
}
