import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner'; // Assuming sonner is used for toasts
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

// Schema for form validation using Zod
const llmConfigSchema = z.object({
  name: z.string().min(1, 'O nome da configuração é obrigatório.'),
  providerId: z.enum(['openai', 'deepseek', 'ollama'], { // Added ollama as an example
    required_error: 'Selecione um provedor LLM.',
  }),
  apiKey: z.string().optional(), // API Key is optional for local LLMs like Ollama
  baseUrl: z.string().url('Insira uma URL válida.').optional().or(z.literal('')), // Optional and can be empty
}).superRefine((data, ctx) => {
  // API Key is required if provider is not 'ollama' (or other local providers)
  if (data.providerId !== 'ollama' && !data.apiKey) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'A Chave de API é obrigatória para este provedor.',
      path: ['apiKey'],
    });
  }
  // Base URL is required if provider is 'ollama'
  if (data.providerId === 'ollama' && (!data.baseUrl || data.baseUrl.trim() === '')) {
     ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'A URL Base é obrigatória para o provedor Ollama.',
      path: ['baseUrl'],
    });
  }
});

export type LLMConfigFormData = z.infer<typeof llmConfigSchema>;

interface LLMConfigFormProps {
  onSubmit: (data: LLMConfigFormData) => Promise<void> | void;
  initialValues?: Partial<LLMConfigFormData>;
  isSubmitting?: boolean; // Optional prop to indicate submission state
}

const supportedProviders = [
  { id: 'openai', name: 'OpenAI (GPT-3.5, GPT-4, etc.)' },
  { id: 'deepseek', name: 'DeepSeek Coder' },
  { id: 'ollama', name: 'Ollama (Local LLMs)' },
  // Add more providers as they are supported
];

export function LLMConfigForm({ onSubmit, initialValues, isSubmitting }: LLMConfigFormProps) {
  const form = useForm<LLMConfigFormData>({
    resolver: zodResolver(llmConfigSchema),
    defaultValues: {
      name: initialValues?.name || '',
      providerId: initialValues?.providerId || undefined, // Let placeholder show
      apiKey: initialValues?.apiKey || '',
      baseUrl: initialValues?.baseUrl || '',
    },
  });

  const watchedProvider = form.watch('providerId');

  const handleFormSubmit = async (data: LLMConfigFormData) => {
    try {
      await onSubmit(data);
      // Toast notification for success can be handled by the parent page
      // or here if a generic success message is desired.
    } catch (error) {
      console.error("Error submitting LLM config form:", error);
      toast.error("Ocorreu um erro ao salvar a configuração. Tente novamente.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Configuração</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Meu OpenAI Pessoal, Ollama Local" {...field} />
              </FormControl>
              <FormDescription>
                Um nome amigável para identificar esta configuração LLM.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="providerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Provedor LLM</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um provedor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {supportedProviders.map(provider => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Escolha o serviço de LLM que você deseja configurar.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {watchedProvider !== 'ollama' && ( // Only show API Key if not Ollama
          <FormField
            control={form.control}
            name="apiKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chave de API (API Key)</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx" {...field} />
                </FormControl>
                <FormDescription>
                  Sua chave de API para o provedor selecionado.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="baseUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Base (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ex: https://api.example.com/v1 (para proxies ou Ollama)" {...field} />
              </FormControl>
              <FormDescription>
                Se você estiver usando um proxy, um endpoint auto-hospedado (como Ollama: http://localhost:11434),
                ou um provedor compatível com API OpenAI, insira a URL base aqui.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting || !form.formState.isDirty}>
            {isSubmitting ? 'Salvando...' : (initialValues?.name ? 'Atualizar Configuração' : 'Salvar Configuração')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
