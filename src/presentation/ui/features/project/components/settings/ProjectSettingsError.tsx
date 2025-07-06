import { ArrowLeft, ServerCrash } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";

interface ProjectSettingsErrorProps {
  error: Error;
  onBack: () => void;
}

export function ProjectSettingsError({ error, onBack }: ProjectSettingsErrorProps) {
  return (
    <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px] bg-red-50 dark:bg-red-900/10 rounded-lg">
      <ServerCrash className="h-12 w-12 text-red-500 dark:text-red-400 mb-4" />
      <h2 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">
        Falha ao carregar dados do projeto
      </h2>
      <p className="text-sm text-red-600 dark:text-red-400 mb-4">
        {error.message}
      </p>
      <Button onClick={onBack} variant="destructive" className="mt-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
      </Button>
    </div>
  );
}
