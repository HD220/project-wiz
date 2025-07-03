import React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AgentInstanceForm,
  AgentInstanceFormData,
} from "@/ui/features/agent/components/AgentInstanceForm";

import type { PersonaTemplate, LLMConfig } from "@/shared/ipc-types";

interface NewAgentFormRendererProps {
  personaTemplates: PersonaTemplate[] | null | undefined;
  llmConfigs: LLMConfig[] | null | undefined;
  handleSubmit: (formData: AgentInstanceFormData) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function NewAgentFormRenderer({
  personaTemplates,
  llmConfigs,
  handleSubmit,
  isSubmitting,
  onCancel,
}: NewAgentFormRendererProps) {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Criar Nova Instância de Agente
          </CardTitle>
          <CardDescription>
            Configure um novo Agente IA selecionando um Template de Persona e
            uma Configuração LLM.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AgentInstanceForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            personaTemplates={
              (personaTemplates || []) as Pick<PersonaTemplate, "id" | "name">[]
            }
            llmConfigs={
              (llmConfigs || []) as Pick<
                LLMConfig,
                "id" | "name" | "providerId"
              >[]
            }
          />
        </CardContent>
      </Card>
      <Button
        variant="link"
        onClick={onCancel}
        className="mt-4"
        disabled={isSubmitting}
      >
        Cancelar e Voltar
      </Button>
    </div>
  );
}
