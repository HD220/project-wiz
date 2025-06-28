import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';

import { Badge } from '@/presentation/ui/components/ui/badge';
import { Button } from '@/presentation/ui/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/presentation/ui/components/ui/form';
import { Input } from '@/presentation/ui/components/ui/input';
import { Textarea } from '@/presentation/ui/components/ui/textarea';
// Para um multi-select mais robusto, poderia usar ShadCN Combobox com modo múltiplo,
// ou uma lib como react-select. Por simplicidade, faremos um input de texto para tools.
// import { Checkbox } from "@/presentation/ui/components/ui/checkbox" // Exemplo se fosse usar checkboxes

// Lista de ferramentas disponíveis (exemplo, poderia vir de uma config ou API)
const AVAILABLE_TOOLS = [
  { id: 'filesystem', label: 'File System (Leitura/Escrita)' },
  { id: 'terminal', label: 'Terminal (Executar Comandos)' },
  { id: 'codeEditor', label: 'Editor de Código (Visualizar/Modificar)' },
  { id: 'search', label: 'Busca Web/Local' },
  { id: 'testRunner', label: 'Executor de Testes' },
  { id: 'issueTracker', label: 'Rastreador de Issues' },
  { id: 'browserDevTools', label: 'Ferramentas de Desenvolvedor do Navegador' },
  { id: 'taskManager', label: 'Gerenciador de Tarefas (Interno)' },
  // Adicionar mais ferramentas conforme necessário
];

const personaTemplateFormSchema = z.object({
  name: z.string().min(3, 'Nome deve ter ao menos 3 caracteres.').max(100, 'Nome muito longo.'),
  role: z.string().min(10, 'Papel deve ter ao menos 10 caracteres.').max(500, 'Papel muito longo.'),
  goal: z.string().min(10, 'Objetivo deve ter ao menos 10 caracteres.').max(1000, 'Objetivo muito longo.'),
  backstory: z.string().max(2000, 'Backstory muito longo.').optional(),
  toolNames: z.array(z.string()).optional(), // Simples array de strings por agora
});

export type PersonaTemplateFormData = z.infer<typeof personaTemplateFormSchema>;

interface PersonaTemplateFormProps {
  onSubmit: (data: PersonaTemplateFormData) => Promise<void> | void;
  initialValues?: Partial<PersonaTemplateFormData>;
  isSubmitting?: boolean;
}

export function PersonaTemplateForm({
  onSubmit,
  initialValues,
  isSubmitting = false,
}: PersonaTemplateFormProps) {
  const form = useForm<PersonaTemplateFormData>({
    resolver: zodResolver(personaTemplateFormSchema),
    defaultValues: {
      name: initialValues?.name || '',
      role: initialValues?.role || '',
      goal: initialValues?.goal || '',
      backstory: initialValues?.backstory || '',
      toolNames: initialValues?.toolNames || [],
    },
  });

  // Estado local para gerenciar o input da ferramenta atual
  const [currentToolInput, setCurrentToolInput] = React.useState('');

  const handleAddTool = () => {
    const toolValue = currentToolInput.trim();
    if (toolValue && !form.getValues('toolNames')?.includes(toolValue)) {
      const currentTools = form.getValues('toolNames') || [];
      form.setValue('toolNames', [...currentTools, toolValue], { shouldValidate: true, shouldDirty: true });
      setCurrentToolInput('');
    }
  };

  const handleRemoveTool = (toolToRemove: string) => {
    const currentTools = form.getValues('toolNames') || [];
    form.setValue('toolNames', currentTools.filter(tool => tool !== toolToRemove), { shouldValidate: true, shouldDirty: true });
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Template</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Desenvolvedor Python Sênior" {...field} />
              </FormControl>
              <FormDescription>Um nome único e descritivo para este template de persona.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Papel (Role)</FormLabel>
              <FormControl>
                <Textarea placeholder="Descreva o papel principal desta persona. Ex: 'Um engenheiro de software especializado em...' " {...field} className="min-h-[80px]" />
              </FormControl>
              <FormDescription>Qual é a função ou especialidade principal desta persona?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="goal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Objetivo Principal (Goal)</FormLabel>
              <FormControl>
                <Textarea placeholder="Defina o objetivo primário que esta persona deve alcançar. Ex: 'Desenvolver e manter APIs robustas e escaláveis.' " {...field} className="min-h-[100px]" />
              </FormControl>
              <FormDescription>Qual é a meta ou resultado principal esperado das ações desta persona?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="backstory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Backstory / Contexto (Opcional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Forneça um breve histórico ou contexto para esta persona, se relevante. Ex: 'Trabalhou em X empresas, especialista em Y tecnologias...' " {...field} className="min-h-[100px]" />
              </FormControl>
              <FormDescription>Informações adicionais que ajudam a definir a personalidade e o conhecimento da persona.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Gerenciamento de Ferramentas (ToolNames) - Versão Simplificada */}
        <FormItem>
          <FormLabel>Ferramentas Permitidas</FormLabel>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Digite o nome de uma ferramenta (ex: filesystem)"
              value={currentToolInput}
              onChange={(event) => setCurrentToolInput(event.target.value)} // e to event
              onKeyDown={(event) => { // e to event
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
            Exemplos: {AVAILABLE_TOOLS.slice(0,3).map(tool => tool.id).join(', ')}... {/* t to tool */}
          </FormDescription>
          <Controller
            control={form.control}
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


        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando Template...' : (initialValues?.name ? 'Atualizar Template' : 'Salvar Template')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
