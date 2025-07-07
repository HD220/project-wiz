import React from "react";

import type { LLMConfig, AgentLLM } from "@/core/domain/entities/llm.entity";
import type { PersonaTemplate } from "@/core/domain/entities/persona.entity";

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
} from "@/ui/features/agent/components/agent-instance-form";
import { AgentInstanceFormData } from "@/ui/features/agent/components/agent-instance-form";

interface NewAgentFormRendererProps {
  personaTemplates: PersonaTemplate[];
  llmConfigs: Record<AgentLLM, LLMConfig>;
  handleSubmit: (formData: AgentInstanceFormData) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function NewAgentFormRenderer({
  personaTemplates,
  llmConfigs,
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
            personaTemplates={personaTemplates}
            llmConfigs={Object.values(llmConfigs)}
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
