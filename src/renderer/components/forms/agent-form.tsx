import { UseFormReturn, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Consolidated Agent Form Component
 * Replaces multiple scattered form field components
 */

// Schema for agent form
export const AgentFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  role: z.string().min(2, "Role deve ter pelo menos 2 caracteres").max(100),
  goal: z.string().min(10, "Goal deve ter pelo menos 10 caracteres").max(500),
  backstory: z
    .string()
    .min(10, "Backstory deve ter pelo menos 10 caracteres")
    .max(1000),
  llmProviderId: z.string().min(1, "Selecione um provider LLM"),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(4000).default(1000),
});

export type AgentFormData = z.infer<typeof AgentFormSchema>;

interface AgentFormProps {
  form: UseFormReturn<AgentFormData>;
  onSubmit: (data: AgentFormData) => Promise<void>;
  isLoading?: boolean;
  llmProviders?: Array<{ id: string; name: string }>;
}

export function AgentForm({
  form,
  onSubmit,
  isLoading,
  llmProviders = [],
}: AgentFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Agente</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: AssistenteCodigo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Função</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Desenvolvedor Senior" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Goal */}
        <FormField
          control={form.control}
          name="goal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Objetivo</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva o objetivo principal do agente..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Backstory */}
        <FormField
          control={form.control}
          name="backstory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>História de Fundo</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva a experiência e contexto do agente..."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* LLM Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="llmProviderId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provider LLM</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um provider" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {llmProviders.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="temperature"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Temperature</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    placeholder="0.7"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxTokens"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Tokens</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    max="4000"
                    placeholder="1000"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Criando..." : "Criar Agente"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Validation hook for the form
export function useAgentForm() {
  const form = useForm<AgentFormData>({
    resolver: zodResolver(AgentFormSchema),
    defaultValues: {
      name: "",
      role: "",
      goal: "",
      backstory: "",
      llmProviderId: "",
      temperature: 0.7,
      maxTokens: 1000,
    },
  });

  return form;
}
