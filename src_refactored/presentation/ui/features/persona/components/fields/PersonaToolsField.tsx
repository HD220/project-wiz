import { X } from 'lucide-react';
import React from 'react';
import { Control, Controller } from 'react-hook-form';

import { Badge } from '@/presentation/ui/components/ui/badge';
import { Button } from '@/presentation/ui/components/ui/button';
import {
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
  // FormControl removed
} from '@/presentation/ui/components/ui/form';
import { Input } from '@/presentation/ui/components/ui/input';

import type { PersonaTemplateFormData } from '../PersonaTemplateForm';

// TODO: Consider moving this to a shared config or fetching from backend if dynamic
const AVAILABLE_TOOLS = [
  { id: 'filesystem', label: 'File System (Leitura/Escrita)' },
  { id: 'terminal', label: 'Terminal (Executar Comandos)' },
  { id: 'codeEditor', label: 'Editor de Código (Visualizar/Modificar)' },
  { id: 'search', label: 'Busca Web/Local' },
  { id: 'testRunner', label: 'Executor de Testes' },
  { id: 'issueTracker', label: 'Rastreador de Issues' },
  { id: 'browserDevTools', label: 'Ferramentas de Desenvolvedor do Navegador' },
  { id: 'taskManager', label: 'Gerenciador de Tarefas (Interno)' },
];

// Base props for field components
interface FormFieldProps {
  control: Control<PersonaTemplateFormData>;
}

interface PersonaToolsFieldProps extends FormFieldProps {
  currentToolInput: string;
  setCurrentToolInput: React.Dispatch<React.SetStateAction<string>>;
  handleAddTool: () => void;
  handleRemoveTool: (tool: string) => void;
}

export function PersonaToolsField({ control, currentToolInput, setCurrentToolInput, handleAddTool, handleRemoveTool }: PersonaToolsFieldProps) {
  return (
    <FormItem>
      <FormLabel>Ferramentas Permitidas</FormLabel>
      <div className="flex items-center gap-2">
        <Input
          placeholder="Digite o nome de uma ferramenta (ex: filesystem)"
          value={currentToolInput}
          onChange={(event) => setCurrentToolInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && currentToolInput.trim() !== '') {
              event.preventDefault();
              handleAddTool();
            }
          }}
          className="flex-grow"
        />
        <Button type="button" variant="outline" onClick={handleAddTool} disabled={!currentToolInput.trim()}>
          Adicionar
        </Button>
      </div>
      <FormDescription>
        Liste as ferramentas que esta persona poderá utilizar (pressione Enter ou clique Adicionar).
        Exemplos: {AVAILABLE_TOOLS.slice(0,3).map(tool => tool.id).join(', ')}...
      </FormDescription>
      <Controller
        control={control}
        name="toolNames"
        render={({ field }) => (
          <div className="mt-2 space-x-2 space-y-2">
            {field.value?.map((tool) => (
              <Badge key={tool} variant="secondary" className="whitespace-nowrap">
                {tool}
                <button
                  type="button"
                  className="ml-1.5 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={() => handleRemoveTool(tool)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      />
      <FormMessage />
    </FormItem>
  );
}
