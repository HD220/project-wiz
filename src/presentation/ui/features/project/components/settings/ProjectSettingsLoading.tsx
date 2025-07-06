import { Loader2 } from "lucide-react";
import React from "react";

export function ProjectSettingsLoading() {
  return (
    <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
      <Loader2 className="h-10 w-10 animate-spin text-sky-500 mb-4" />
      <p className="text-lg text-slate-600 dark:text-slate-400">
        Carregando configurações do projeto...
      </p>
    </div>
  );
}
