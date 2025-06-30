// Icons for edit/delete
import { Pencil, Trash2 } from 'lucide-react';
import React from 'react';

// To display provider type
import { Badge } from '@/presentation/ui/components/ui/badge';
import { Button } from '@/presentation/ui/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/presentation/ui/components/ui/table';

// This type would ideally come from a shared location or be generated from backend types
export interface LLMConfig {
  id: string;
  name: string;
  providerId: string;
  // e.g., 'openai', 'deepseek', 'ollama'
  // apiKey: string;
  // Sensitive, usually not displayed directly
  baseUrl?: string;
  // createdAt: string;
  // Or Date object
}

interface LLMConfigListProps {
  configs: LLMConfig[];
  onEdit: (configId: string) => void;
  // Will navigate to /settings/llm/$configId/edit
  onDelete: (config: LLMConfig) => void;
  // Pass full config object for delete confirmation
}

const providerDisplayNames: Record<string, string> = {
  openai: 'OpenAI',
  deepseek: 'DeepSeek',
  ollama: 'Ollama',
};

export function LLMConfigList({ configs, onEdit, onDelete }: LLMConfigListProps) {
  if (!configs || configs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500 dark:text-slate-400">
          Nenhuma configuração de LLM encontrada.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome da Configuração</TableHead>
            <TableHead>Provedor</TableHead>
            <TableHead>URL Base</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {configs.map((config) => (
            <TableRow key={config.id}>
              <TableCell className="font-medium">{config.name}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {providerDisplayNames[config.providerId] || config.providerId}
                </Badge>
              </TableCell>
              <TableCell>{config.baseUrl || 'N/A'}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="ghost" size="icon" onClick={() => onEdit(config.id)} title="Editar Configuração">
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Editar</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(config)} title="Excluir Configuração">
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <span className="sr-only">Excluir</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
