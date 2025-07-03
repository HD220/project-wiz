import { useRouter } from "@tanstack/react-router";
import { Loader2, ServerCrash } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";



interface NewAgentLoadingErrorDisplayProps {
  isLoadingDependencies: boolean;
  dependencyError: Error | null | undefined;
  personasError?: Error | null;
  llmConfigsError?: Error | null;
}

export function NewAgentLoadingErrorDisplay({
  isLoadingDependencies,
  dependencyError,
  personasError,
  llmConfigsError,
}: NewAgentLoadingErrorDisplayProps) {
  const router = useRouter();

  if (isLoadingDependencies) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-10 w-10 animate-spin text-sky-500 mb-4" />
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Carregando dependências do formulário...
        </p>
      </div>
    );
  }

  if (dependencyError) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px] bg-red-50 dark:bg-red-900/10 rounded-lg">
        <ServerCrash className="h-12 w-12 text-red-500 dark:text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">
          Falha ao carregar dados para o formulário
        </h2>
        <p className="text-sm text-red-600 dark:text-red-400 mb-4">
          {personasError?.message && `Personas: ${personasError.message}`}
          {llmConfigsError?.message && `LLMs: ${llmConfigsError.message}`}
        </p>
        <Button
          onClick={() => router.history.back()}
          variant="destructive"
          className="mt-4"
        >
          Voltar
        </Button>
      </div>
    );
  }

  return null;
}
