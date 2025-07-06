import { Link } from "@tanstack/react-router";
import { PlusCircle } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";

export function NoLLMConfigsDisplay() {
  return (
    <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
      <svg
        className="mx-auto h-12 w-12 text-slate-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-50">
        Nenhuma configuração LLM
      </h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Comece adicionando uma nova configuração de LLM.
      </p>
      <div className="mt-6">
        <Button asChild variant="outline">
          <Link to="/app/settings/llm/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar Configuração
          </Link>
        </Button>
      </div>
    </div>
  );
}
