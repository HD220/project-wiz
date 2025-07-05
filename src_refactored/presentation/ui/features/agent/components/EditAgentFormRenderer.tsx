import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
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

import type {
  GetPersonaTemplatesListResponseData,
  GetLLMConfigsListResponseData,
  GetAgentInstanceDetailsResponseData,
  PersonaTemplate,
  LLMConfig,
  AgentLLM,
} from "@/shared/ipc-types";

import { AgentInstance } from "@/shared/types/entities";

interface EditAgentFormRendererProps {
  agentId: string;
  agentInstance: AgentInstance;
  personaTemplates: PersonaTemplate[] | null | undefined;
  llmConfigs: Record<AgentLLM, LLMConfig> | null | undefined;
  handleSubmit: (formData: AgentInstanceFormData) => Promise<void>;
  isSubmitting: boolean;
  initialValues?: Partial<AgentInstanceFormData>;
}

export function EditAgentFormRenderer({
  agentId,
  agentInstance,
  personaTemplates,
  llmConfigs,
  handleSubmit,
  isSubmitting,
}: EditAgentFormRendererProps) {
  if (!agentInstance) {
    // Should not happen if DataLoadingOrErrorDisplay is used before this
    return (
      <div className="p-8 text-center">
        <p>Instância de Agente não encontrada.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/app/agents">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista de Agentes
          </Link>
        </Button>
      </div>
    );
  }

  const initialValues: Partial<AgentInstanceFormData> = {
    agentName: agentInstance.agentName,
    personaTemplateId: agentInstance.personaTemplateId,
    llmProviderConfigId: agentInstance.llmProviderConfigId,
    temperature: agentInstance.temperature,
  };
  const agentDisplayName =
    agentInstance.agentName ||
    `Agente (ID: ${agentInstance.id.substring(0, 6)})`;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-2xl mx-auto">
      <Button variant="outline" size="sm" className="mb-4" asChild>
        <Link to="/app/agents/$agentId" params={{ agentId }}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Detalhes do Agente
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Editar Instância de Agente: {agentDisplayName}
          </CardTitle>
          <CardDescription>
            Modifique a configuração desta instância de Agente IA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AgentInstanceForm
            onSubmit={handleSubmit}
            initialValues={initialValues}
            isSubmitting={isSubmitting}
            personaTemplates={personaTemplates?.data || []}
            llmConfigs={llmConfigs?.data || []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
