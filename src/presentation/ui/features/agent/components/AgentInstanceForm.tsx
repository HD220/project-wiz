import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@tanstack/react-router";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import type { AgentInstance } from "@/core/domain/entities/agent";
import type { LLMConfig } from "@/core/domain/entities/llm";
import type { PersonaTemplate } from "@/core/domain/entities/persona";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useIpcMutation } from "@/ui/hooks/ipc/useIpcMutation";


import { IPC_CHANNELS } from "@/shared/ipc-channels";
import type {
  CreateAgentInstanceRequest,
  CreateAgentInstanceResponse,
  UpdateAgentInstanceRequest,
  UpdateAgentInstanceResponse,
} from "@/shared/ipc-types/agent.types";

import { AgentLLMConfigSelectField } from "./fields/AgentLLMConfigSelectField";
import { AgentNameField } from "./fields/AgentNameField";
import { AgentPersonaTemplateSelectField } from "./fields/AgentPersonaTemplateSelectField";
import { AgentTemperatureSliderField } from "./fields/AgentTemperatureSliderField";

// Schema definition
const agentInstanceFormSchema = z.object({
  agentName: z
    .string()
    .max(100, "Nome muito longo.")
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  personaTemplateId: z.string({
    required_error: "Selecione um Template de Persona.",
  }),
  llmProviderConfigId: z.string({
    required_error: "Selecione uma Configuração de LLM.",
  }),
  temperature: z.number().min(0).max(2).step(0.1).default(0.7),
});

export type AgentInstanceFormData = z.infer<typeof agentInstanceFormSchema>;

// Main Form Component Props
interface AgentInstanceFormProps {
  agentInstance?: AgentInstance;
  personaTemplates: Pick<PersonaTemplate, "id" | "name">[];
  llmConfigs: Pick<LLMConfig, "id" | "name" | "providerId">[];
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
      agentName: agentInstance?.agentName || "",
      personaTemplateId: agentInstance?.personaTemplateId || undefined,
      llmProviderConfigId: agentInstance?.llmProviderConfigId || undefined,
      temperature: agentInstance?.temperature ?? 0.7,
    },
  });

  const createAgentMutation = useIpcMutation<
    CreateAgentInstanceResponse,
    CreateAgentInstanceRequest
  >(IPC_CHANNELS.CREATE_AGENT_INSTANCE, {
    onSuccess: (data) => {
      toast.success(
        `Agente "${data.agentName || data.id}" criado com sucesso!`
      );
      onSuccess?.(data);
      router.navigate({
        to: "/app/agents/$agentId",
        params: { agentId: data.id },
      });
    },
    onError: (error) => {
      toast.error(`Erro ao criar agente: ${error.message}`);
    },
  });

  const updateAgentMutation = useIpcMutation<
    UpdateAgentInstanceResponse,
    UpdateAgentInstanceRequest
  >(IPC_CHANNELS.UPDATE_AGENT_INSTANCE, {
    onSuccess: (data) => {
      toast.success(
        `Agente "${data.agentName || data.id}" atualizado com sucesso!`
      );
      onSuccess?.(data);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar agente: ${error.message}`);
    },
  });

  const isSubmitting =
    createAgentMutation.isPending || updateAgentMutation.isPending;

  const handleSubmit = (data: AgentInstanceFormData) => {
    if (isEditing && agentInstance) {
      updateAgentMutation.mutate({ agentId: agentInstance.id, data: data });
    } else {
      createAgentMutation.mutate(data);
    }
  };

  const effectiveSubmitButtonText = isEditing
    ? "Atualizar Agente"
    : "Criar Agente";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <AgentNameField control={form.control} />
        <AgentPersonaTemplateSelectField
          control={form.control}
          personaTemplates={personaTemplates}
        />
        <AgentLLMConfigSelectField
          control={form.control}
          llmConfigs={llmConfigs}
        />
        <AgentTemperatureSliderField control={form.control} />

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={isSubmitting || (isEditing && !form.formState.isDirty)}
          >
            {isSubmitting
              ? isEditing
                ? "Atualizando Agente..."
                : "Criando Agente..."
              : effectiveSubmitButtonText}
          </Button>
        </div>
      </form>
    </Form>
  );
}
