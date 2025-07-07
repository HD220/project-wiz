import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import React from "react";

import type { AgentInstance } from "@/core/domain/entities/agent.entity";
import { AgentLLM } from "@/core/domain/entities/llm.entity";
import type { LLMConfig } from "@/core/domain/entities/llm.entity";
import type { PersonaTemplate } from "@/core/domain/entities/persona.entity";


import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AgentInstanceFormData } from "@/ui/features/agent/components/agent-instance-form";
import {
  AgentInstanceForm,
} from "@/ui/features/agent/components/agent-instance-form";

interface EditAgentFormRendererProps {
  agentId: string;
  agentInstance: AgentInstance;
  personaTemplates: PersonaTemplate[];
  llmConfigs: Record<AgentLLM, LLMConfig>;
  handleSubmit: (formData: AgentInstanceFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function EditAgentFormRenderer({
  agentId,
  agentInstance,
  personaTemplates,
  llmConfigs,
}: EditAgentFormRendererProps) {
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
            agentInstance={agentInstance}
            personaTemplates={personaTemplates}
            llmConfigs={Object.values(llmConfigs)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
