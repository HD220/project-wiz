import { createFileRoute, Link } from '@tanstack/react-router';
import { PlusCircle, Bot, Search } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/presentation/ui/components/ui/button';
import { Input } from '@/presentation/ui/components/ui/input';
import { AgentInstanceList } from '@/presentation/ui/features/agent/components/AgentInstanceList';
import { AgentInstance } from '@/presentation/ui/features/agent/components/AgentInstanceListItem';
import { LLMConfig } from '@/presentation/ui/features/llm/components/LLMConfigList';
import { PersonaTemplate } from '@/presentation/ui/features/persona/components/PersonaTemplateListItem';

// Mock Data - Persona Templates (abbreviated)
const mockPersonaTemplates: Record<string, Pick<PersonaTemplate, 'id' | 'name'>> = {
  templateId1: { id: '1', name: 'Engenheiro de Software Sênior' },
  templateId2: { id: '2', name: 'Analista de QA Detalhista' },
};

// Mock Data - LLM Configs (abbreviated)
const mockLlmConfigs: Record<string, Pick<LLMConfig, 'id' | 'name' | 'providerId'>> = {
  configId1: { id: '1', name: 'OpenAI Pessoal', providerId: 'openai' },
  configId2: { id: '2', name: 'Ollama Local', providerId: 'ollama' },
};


// Mock Data - Agent Instances
const mockAgentInstances: AgentInstance[] = [
  { id: 'agent-001', agentName: 'CoderBot-Alpha', personaTemplateId: '1', llmProviderConfigId: '1', temperature: 0.7, status: 'idle', currentJobId: null, lastActivity: '5 minutos atrás' },
  { id: 'agent-002', agentName: 'TestMaster-7000', personaTemplateId: '2', llmProviderConfigId: '1', temperature: 0.5, status: 'running', currentJobId: 'job-123', lastActivity: 'Agora mesmo' },
  { id: 'agent-003', personaTemplateId: '1', llmProviderConfigId: '2', temperature: 0.8, status: 'error', currentJobId: 'job-120', lastActivity: '1 hora atrás' },
];


function AgentInstancesPage(): JSX.Element {
  const [searchTerm, setSearchTerm] = useState('');

  const getPersonaName = (templateId: string): string => mockPersonaTemplates[templateId]?.name || 'Desconhecido';
  const getLlmConfigName = (configId: string): string => mockLlmConfigs[configId]?.name || 'Desconhecido';

  const enrichedAgentInstances = mockAgentInstances.map(agent => ({
    ...agent,
    personaTemplateName: getPersonaName(agent.personaTemplateId),
    llmConfigName: getLlmConfigName(agent.llmProviderConfigId),
  }));

  const filteredInstances = enrichedAgentInstances.filter(instance =>
    (instance.agentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    instance.personaTemplateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instance.llmConfigName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center">
            <Bot className="mr-3 h-8 w-8 text-emerald-600 dark:text-emerald-500" />
            Gerenciador de Agentes (Instâncias)
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Crie, visualize e gerencie suas instâncias de Agentes IA.
          </p>
        </div>
        <Button asChild>
          <Link to="/agents/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Instância de Agente
          </Link>
        </Button>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
        <Input
          type="search"
          placeholder="Buscar por nome do agente, persona ou LLM..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="pl-10 w-full md:w-1/2 lg:w-1/3"
        />
      </div>

      {filteredInstances.length > 0 ? (
        <AgentInstanceList instances={filteredInstances} />
      ) : (
        <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg mt-6">
           <Bot className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-50">
            {searchTerm ? 'Nenhuma instância encontrada' : 'Nenhuma instância de agente criada'}
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {searchTerm ? 'Tente ajustar seus termos de busca.' : 'Comece criando sua primeira instância de agente.'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <Button asChild variant="outline">
                <Link to="/agents/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Criar Nova Instância
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute('/(app)/agents/')({
  component: AgentInstancesPage,
});
