import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";

interface LLMConfigNotFoundProps {
  configId: string;
}

export function LLMConfigNotFound({ configId }: LLMConfigNotFoundProps) {
  return (
    <div className="p-8 text-center">
      <p>Configuração LLM com ID &quot;{configId}&quot; não encontrada.</p>
      <Button variant="outline" className="mt-4" asChild>
        <Link to="/settings/llm">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista de Configs
          LLM
        </Link>
      </Button>
    </div>
  );
}
