import React, { useState } from 'react';
import { PromptData } from '../../../core/infrastructure/db/promptRepository';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

/**
 * Propriedades para o componente PromptList.
 */
interface PromptListProps {
  prompts: PromptData[];
  onCreate: () => void;
  onEdit: (prompt: PromptData) => void;
  onDelete: (id: string) => void;
  onRestoreDefaults: () => void;
  onExport: () => void;
  onImport: () => void;
  onGenerateLink: (prompt: PromptData) => void;
}

/**
 * Lista de prompts com busca, filtros e ações.
 */
export function PromptList({
  prompts,
  onCreate,
  onEdit,
  onDelete,
  onRestoreDefaults,
  onExport,
  onImport,
  onGenerateLink,
}: PromptListProps) {
  const [search, setSearch] = useState('');

  const filteredPrompts = prompts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center mb-4 gap-2 flex-wrap">
        <Input
          placeholder="Buscar prompts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={onCreate}>Novo Prompt</Button>
        <Button variant="outline" onClick={onRestoreDefaults}>
          Restaurar Padrão
        </Button>
        <Button variant="outline" onClick={onExport}>
          Exportar
        </Button>
        <Button variant="outline" onClick={onImport}>
          Importar
        </Button>
      </div>

      <div className="space-y-2">
        {filteredPrompts.map((prompt) => (
          <div
            key={prompt.id}
            className="border rounded p-2 flex justify-between items-center hover:bg-muted"
          >
            <div>
              <div className="font-semibold">{prompt.name}</div>
              {prompt.isDefault && (
                <span className="text-xs text-gray-500">Padrão</span>
              )}
              {prompt.isShared && (
                <span className="text-xs text-blue-500 ml-2">Compartilhado</span>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" onClick={() => onEdit(prompt)}>
                Editar
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => prompt.id && onDelete(prompt.id)}
              >
                Excluir
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onGenerateLink(prompt)}
              >
                Gerar Link
              </Button>
            </div>
          </div>
        ))}

        {filteredPrompts.length === 0 && (
          <div className="text-gray-500">Nenhum prompt encontrado.</div>
        )}
      </div>
    </div>
  );
}