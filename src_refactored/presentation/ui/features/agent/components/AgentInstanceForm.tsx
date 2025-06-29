import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/ui/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/components/ui/form';
import { Input } from '@/ui/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/components/ui/select';
import { Slider } from '@/ui/components/ui/slider';
import { LLMConfig } from '@/ui/features/llm/components/LLMConfigList';
import { PersonaTemplate } from '@/ui/features/persona/components/PersonaTemplateListItem';


const agentInstanceFormSchema = z.object({
  agentName: z.string().max(100, 'Nome muito longo.').optional(),
  personaTemplateId: z.string({ required_error: 'Selecione um Template de Persona.' }),
  llmProviderConfigId: z.string({ required_error: 'Selecione uma Configuração de LLM.' }),
  temperature: z.number().min(0).max(2).step(0.1),
});

export type AgentInstanceFormData = z.infer<typeof agentInstanceFormSchema>;

interface AgentInstanceFormProps {
  onSubmit: (data: AgentInstanceFormData) => Promise<void> | void;
  initialValues?: Partial<AgentInstanceFormData>;
  isSubmitting?: boolean;
  personaTemplates: Pick<PersonaTemplate, 'id' | 'name'>[];
  llmConfigs: Pick<LLMConfig, 'id' | 'name' | 'providerId'>[];
}

export function AgentInstanceForm({
  onSubmit,
  initialValues,
  isSubmitting = false,
  personaTemplates,
  llmConfigs,
}: AgentInstanceFormProps) {
  const form = useForm<AgentInstanceFormData>({
    resolver: zodResolver(agentInstanceFormSchema),
    defaultValues: {
      agentName: initialValues?.agentName || '',
      personaTemplateId: initialValues?.personaTemplateId || undefined,
      llmProviderConfigId: initialValues?.llmProviderConfigId || undefined,
      temperature: initialValues?.temperature ?? 0.7, // Default to 0.7 if not provided
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      {config.name} ({config.providerId})
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Criando Agente...' : (initialValues?.agentName ? 'Atualizar Agente' : 'Criar Agente')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
