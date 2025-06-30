import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from '@tanstack/react-router';
import React from 'react'; // Keep React for useState if needed for complex forms, though not used here
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/presentation/ui/components/ui/select';
import { Slider } from '@/presentation/ui/components/ui/slider';
import { useIpcMutation } from '@/presentation/ui/hooks/ipc/useIpcMutation';

import { IPC_CHANNELS } from '@/shared/ipc-channels';
import type { CreateAgentInstanceRequest, CreateAgentInstanceResponse, AgentInstance, UpdateAgentInstanceRequest, UpdateAgentInstanceResponse, PersonaTemplate, LLMConfig } from '@/shared/ipc-types'; // Adjusted imports


// Schema definition remains the same
const agentInstanceFormSchema = z.object({
  agentName: z.string().max(100, 'Nome muito longo.').optional().transform(val => val === '' ? undefined : val),
  personaTemplateId: z.string({ required_error: 'Selecione um Template de Persona.' }),
  llmProviderConfigId: z.string({ required_error: 'Selecione uma Configuração de LLM.' }),
  temperature: z.number().min(0).max(2).step(0.1).default(0.7),
});

export type AgentInstanceFormData = z.infer<typeof agentInstanceFormSchema>;

interface AgentInstanceFormProps {
  agentInstance?: AgentInstance; // Pass existing instance for editing
  personaTemplates: Pick<PersonaTemplate, 'id' | 'name'>[]; // Assuming these are fetched separately or passed down
  llmConfigs: Pick<LLMConfig, 'id' | 'name' | 'providerName'>[]; // Adjusted to providerName as per mock
  onSuccess?: (data: AgentInstance) => void;
}

export function AgentInstanceForm({
  agentInstance,
  personaTemplates,
  llmConfigs,
  onSuccess,
}: AgentInstanceFormProps) {
  const router = useRouter();
  const isEditing = !!agentInstance;

  const form = useForm<AgentInstanceFormData>({
    resolver: zodResolver(agentInstanceFormSchema),
    defaultValues: {
      agentName: agentInstance?.agentName || '',
      personaTemplateId: agentInstance?.personaTemplateId || undefined,
      llmProviderConfigId: agentInstance?.llmConfigId || undefined, // Corrected: llmConfigId from AgentInstance
      temperature: agentInstance?.temperature ?? 0.7,
    },
  });

  const createAgentMutation = useIpcMutation<CreateAgentInstanceRequest, CreateAgentInstanceResponse>(
    IPC_CHANNELS.CREATE_AGENT_INSTANCE,
    {
      onSuccess: (response) => {
        if (response.success && response.data) {
          toast.success(`Agente "${response.data.agentName || response.data.id}" criado com sucesso!`);
          onSuccess?.(response.data);
          router.navigate({ to: '/agents/$agentId', params: { agentId: response.data.id } });
        } else {
          toast.error(response.error || 'Falha ao criar o agente.');
        }
      },
      onError: (error) => {
        toast.error(`Erro ao criar agente: ${error.message}`);
      },
    }
  );

  const updateAgentMutation = useIpcMutation<UpdateAgentInstanceRequest, UpdateAgentInstanceResponse>(
    IPC_CHANNELS.UPDATE_AGENT_INSTANCE,
    {
      onSuccess: (response) => {
        if (response.success && response.data) {
          toast.success(`Agente "${response.data.agentName || response.data.id}" atualizado com sucesso!`);
          onSuccess?.(response.data);
          router.invalidate(); // Invalidate to refetch data on the details page
        } else {
          toast.error(response.error || 'Falha ao atualizar o agente.');
        }
      },
      onError: (error) => {
        toast.error(`Erro ao atualizar agente: ${error.message}`);
      },
    }
  );

  const isSubmitting = createAgentMutation.isLoading || updateAgentMutation.isLoading;

  const handleSubmit = (data: AgentInstanceFormData) => {
    if (isEditing && agentInstance) {
      updateAgentMutation.mutate({ id: agentInstance.id, ...data });
    } else {
      createAgentMutation.mutate(data);
    }
  };

  const effectiveSubmitButtonText = isEditing ? 'Atualizar Agente' : 'Criar Agente';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="agentName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Instância do Agente (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ex: MeuCoderQA, AgenteDeRefatoracao" {...field} />
              </FormControl>
              <FormDescription>
                Um nome customizado para esta instância específica. Se vazio, um nome será gerado.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="personaTemplateId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template de Persona</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um template de persona" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {personaTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Define o comportamento, papel e objetivos base do agente.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="llmProviderConfigId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Configuração do Provedor LLM</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma configuração LLM" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {llmConfigs.map(config => (
                    <SelectItem key={config.id} value={config.id}>
                      {config.name} ({config.providerName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Define qual modelo de linguagem e API Key o agente utilizará.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="temperature"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Temperatura</FormLabel>
              <div className="flex items-center gap-4">
                <FormControl>
                   <Slider
                    min={0}
                    max={2}
                    step={0.1}
                    defaultValue={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    className="flex-grow"
                  />
                </FormControl>
                <span className="text-sm font-mono w-10 text-right">{field.value.toFixed(1)}</span>
              </div>
              <FormDescription>
                Controla a aleatoriedade das respostas do LLM. Valores mais baixos são mais determinísticos. (0.0 - 2.0)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isSubmitting || (isEditing && !form.formState.isDirty)}>
            {isSubmitting ? (isEditing ? 'Atualizando Agente...' : 'Criando Agente...') : effectiveSubmitButtonText}
          </Button>
        </div>
      </form>
    </Form>
  );
}
