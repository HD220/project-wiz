import { createFileRoute, useRouter, useParams, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/presentation/ui/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/ui/components/ui/card';
import { AgentInstanceForm, AgentInstanceFormData } from '@/presentation/ui/features/agent/components/AgentInstanceForm';
import { AgentInstance } from '@/presentation/ui/features/agent/components/AgentInstanceListItem';
import { LLMConfig } from '@/presentation/ui/features/llm/components/LLMConfigList';
import { PersonaTemplate } from '@/presentation/ui/features/persona/components/PersonaTemplateListItem';

// --- Mock Data (Reutilizado e simplificado para o contexto de edição) ---
const mockPersonaTemplates: Pick<PersonaTemplate, 'id' | 'name'>[] = [
  { id: 'templateId1', name: 'Engenheiro de Software Sênior' },
  { id: 'templateId2', name: 'Analista de QA Detalhista' },
  { id: 'templateId3', name: 'Gerente de Projetos Ágil' },
];

const mockLlmConfigs: Pick<LLMConfig, 'id' | 'name' | 'providerId'>[] = [
  { id: 'configId1', name: 'OpenAI Pessoal', providerId: 'openai' },
  { id: 'configId2', name: 'Ollama Local (Llama3)', providerId: 'ollama' },
  { id: 'configId3', name: 'DeepSeek Trabalho', providerId: 'deepseek' },
];

// Simulating a "database" of agent instances
let mockAgentInstancesDb: Record<string, AgentInstance> = {
  agent001: { id: 'agent001', agentName: 'CoderBot-Alpha', personaTemplateId: 'templateId1', llmProviderConfigId: 'configId1', temperature: 0.7, status: 'idle', currentJobId: null, lastActivity: '5 minutos atrás' },
  agent002: { id: 'agent002', agentName: 'TestMaster-7000', personaTemplateId: 'templateId2', llmProviderConfigId: 'configId1', temperature: 0.5, status: 'running', currentJobId: 'job-123', lastActivity: 'Agora mesmo' },
  agent003: { id: 'agent003', personaTemplateId: 'templateId1', llmProviderConfigId: 'configId2', temperature: 0.8, status: 'error', currentJobId: 'job-120', lastActivity: '1 hora atrás' },
};
// --- End Mock Data ---

function EditAgentInstancePage() {
  const router = useRouter();
  const params = useParams({ from: '/(app)/agents/$agentId/edit/' });
  const agentId = params.agentId;

  const [initialValues, setInitialValues] = useState<Partial<AgentInstanceFormData> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agentDisplayName, setAgentDisplayName] = useState<string>('');


  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const foundInstance = mockAgentInstancesDb[agentId];
      if (foundInstance) {
        setInitialValues({
          agentName: foundInstance.agentName,
          personaTemplateId: foundInstance.personaTemplateId,
          llmProviderConfigId: foundInstance.llmProviderConfigId,
          temperature: foundInstance.temperature,
        });
        setAgentDisplayName(foundInstance.agentName || `Agente ${foundInstance.id.substring(0,6)}...`);
      } else {
        toast.error(`Instância de Agente com ID "${agentId}" não encontrada.`);
      }
      setIsLoading(false);
    }, 300);
  }, [agentId]);

  const handleSubmit = async (data: AgentInstanceFormData) => {
    setIsSubmitting(true);
    console.log('Dados atualizados da instância de agente:', agentId, data);

    await new Promise(resolve => setTimeout(resolve, 1000));
    if (mockAgentInstancesDb[agentId]) {
      mockAgentInstancesDb[agentId] = { ...mockAgentInstancesDb[agentId], ...data };
      toast.success(`Instância de Agente "${data.agentName || agentDisplayName}" atualizada com sucesso (simulado)!`);
      router.navigate({ to: '/agents/$agentId', params: { agentId }, replace: true });
    } else {
       toast.error("Falha ao encontrar a instância para atualizar.");
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return <div className="p-8 text-center">Carregando dados da instância para edição...</div>;
  }

  if (!initialValues) {
    return (
      <div className="p-8 text-center">
        <p>Instância de Agente não encontrada.</p>
         <Button variant="outline" className="mt-4" asChild>
            <Link to="/agents"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista de Agentes</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-2xl mx-auto">
      <Button variant="outline" size="sm" className="mb-4" asChild>
        <Link to="/agents/$agentId" params={{ agentId }}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Detalhes do Agente
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Editar Instância de Agente: {agentDisplayName}</CardTitle>
          <CardDescription>
            Modifique a configuração desta instância de Agente IA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AgentInstanceForm
            onSubmit={handleSubmit}
            initialValues={initialValues}
            isSubmitting={isSubmitting}
            personaTemplates={mockPersonaTemplates}
            llmConfigs={mockLlmConfigs}
            // submitButtonText="Salvar Alterações na Instância" // Already handled by AgentInstanceForm
          />
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createFileRoute('/(app)/agents/$agentId/edit/')({
  component: EditAgentInstancePage,
});
