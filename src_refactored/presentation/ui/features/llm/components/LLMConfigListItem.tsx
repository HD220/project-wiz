import { Pencil, Trash2 } from "lucide-react";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface LLMConfig {
  id: string;
  name: string;
  providerId: string;
  baseUrl?: string;
}

interface LLMConfigListItemProps {
  config: LLMConfig;
  onEdit: (configId: string) => void;
  onDelete: (configId: string) => void;
}

const providerDisplayNames: Record<string, string> = {
  openai: "OpenAI",
  deepseek: "DeepSeek",
  ollama: "Ollama",
};

export function LLMConfigListItem({
  config,
  onEdit,
  onDelete,
}: LLMConfigListItemProps) {
  return (
    <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate"
          title={config.name}
        >
          {config.name}
        </p>
        <div className="flex items-center space-x-2 mt-1">
          <Badge variant="secondary" className="text-xs">
            {providerDisplayNames[config.providerId] || config.providerId}
          </Badge>
          {config.baseUrl && (
            <p
              className="text-xs text-slate-500 dark:text-slate-400 truncate"
              title={config.baseUrl}
            >
              URL: {config.baseUrl}
            </p>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 ml-4 space-x-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onEdit(config.id)}
          title="Editar Configuração"
        >
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Editar</span>
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onDelete(config.id)}
          title="Excluir Configuração"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
          <span className="sr-only">Excluir</span>
        </Button>
      </div>
    </div>
  );
}
