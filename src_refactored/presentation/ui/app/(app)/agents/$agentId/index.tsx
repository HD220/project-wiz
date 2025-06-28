import { createFileRoute, useParams, Link, useRouter } from '@tanstack/react-router';
import { ArrowLeft, Edit3, MessageSquare, Bot, Zap, AlertTriangle, Thermometer, Briefcase, Cpu, ListChecks, Activity } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/presentation/ui/components/ui/badge';
import { Button } from '@/presentation/ui/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/ui/components/ui/card';
import { Separator } from '@/presentation/ui/components/ui/separator';
import { AgentInstance } from '@/presentation/ui/features/agent/components/AgentInstanceListItem'; // Reusing the type
import { LLMConfig } from '@/presentation/ui/features/llm/components/LLMConfigList';
import { PersonaTemplate } from '@/presentation/ui/features/persona/components/PersonaTemplateListItem';

// --- Mock Data ---
const mockPersonaTemplates: Record<string, Pick<PersonaTemplate, 'id' | 'name' | 'role'>> = {
  templateId1: { id: '1', name: 'Engenheiro de Software Sênior', role: 'Desenvolvedor especialista...' },
  templateId2: { id: '2', name: 'Analista de QA Detalhista', role: 'Especialista em testes...' },
};

const mockLlmConfigs: Record<string, Pick<LLMConfig, 'id' | 'name' | 'providerId'>> = {
  configId1: { id: '1', name: 'OpenAI Pessoal', providerId: 'openai' },
  configId2: { id: '2', name: 'Ollama Local', providerId: 'ollama' },
};

const mockAgentInstances: Record<string, AgentInstance> = {
  'agent-001': { id: 'agent-001', agentName: 'CoderBot-Alpha', personaTemplateId: 'templateId1', llmProviderConfigId: 'configId1', temperature: 0.7, status: 'idle', currentJobId: null, lastActivity: '5 minutos atrás' },
  'agent-002': { id: 'agent-002', agentName: 'TestMaster-7000', personaTemplateId: 'templateId2', llmProviderConfigId: 'configId1', temperature: 0.5, status: 'running', currentJobId: 'job-123', lastActivity: 'Agora mesmo' },
  'agent-003': { id: 'agent-003', personaTemplateId: 'templateId1', llmProviderConfigId: 'configId2', temperature: 0.8, status: 'error', currentJobId: 'job-120', lastActivity: '1 hora atrás' },
};

const statusDisplayMap: Record<AgentInstance['status'], { label: string; icon: React.ElementType; colorClasses: string }> = {
  idle: { label: 'Ocioso', icon: Zap, colorClasses: 'bg-slate-500 text-slate-50' },
  running: { label: 'Executando', icon: Zap, colorClasses: 'bg-sky-500 text-sky-50 animate-pulse' },
  paused: { label: 'Pausado', icon: Zap, colorClasses: 'bg-yellow-500 text-yellow-50' }, // Assuming Zap for paused too, could change
  error: { label: 'Erro', icon: AlertTriangle, colorClasses: 'bg-red-500 text-red-50' },
  completed: { label: 'Concluído (Job)', icon: Zap, colorClasses: 'bg-green-500 text-green-50' },
};
// --- End Mock Data ---

function AgentInstanceDetailPage() {
  const params = useParams({ from: '/(app)/agents/$agentId/' });
  const agentId = params.agentId;
  const [instance, setInstance] = useState<AgentInstance & { personaName?: string; llmName?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const foundInstance = mockAgentInstances[agentId];
      if (foundInstance) {
        setInstance({
          ...foundInstance,
          personaName: mockPersonaTemplates[foundInstance.personaTemplateId]?.name || 'Desconhecida',
          llmName: mockLlmConfigs[foundInstance.llmProviderConfigId]?.name || 'Desconhecida',
        });
      } else {
        toast.error(`Instância de Agente com ID "${agentId}" não encontrada.`);
      }
      setIsLoading(false);
    }, 300);
  }, [agentId]);

  if (isLoading) {
    return <div className="p-8 text-center">Carregando detalhes da instância do agente...</div>;
  }

  if (!instance) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Instância de Agente não encontrada</h2>
        <Button onClick={() => router.navigate({ to: '/agents' })} variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista de Agentes
        </Button>
      </div>
    );
  }

  const statusInfo = statusDisplayMap[instance.status] || statusDisplayMap.idle;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link to="/agents">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista
          </Link>
        </Button>
        <div className="flex items-center space-x-2">
            <Button variant="default" asChild>
            <Link to="/agents/$agentId/edit" params={{ agentId: instance.id }}>
                <Edit3 className="mr-2 h-4 w-4" /> Editar Instância
            </Link>
            </Button>
            <Button variant="outline" className="bg-sky-500 hover:bg-sky-600 text-white dark:bg-sky-600 dark:hover:bg-sky-700" asChild>
                {/* This could navigate to /chat with agentId as a param, or open a dedicated chat modal */}
                <Link to="/chat" search={{ conversationId: `agent-${instance.id}` }}>
                    <MessageSquare className="mr-2 h-4 w-4"/> Conversar
                </Link>
            </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="bg-slate-50 dark:bg-slate-800/50 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Bot className="h-16 w-16 text-emerald-500 dark:text-emerald-400 flex-shrink-0 sm:mt-1" />
            <div className="flex-1">
              <CardTitle className="text-2xl lg:text-3xl mb-1">{instance.agentName || `Agente (Base: ${instance.personaName})`}</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge className={cn("text-xs", statusInfo.colorClasses)}>
                  <statusInfo.icon className="h-3.5 w-3.5 mr-1.5" />
                  {statusInfo.label}
                </Badge>
                <span className="text-xs text-slate-500 dark:text-slate-400">Última atividade: {instance.lastActivity || 'N/D'}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
          <InfoItem icon={Briefcase} label="Persona Base" value={instance.personaName} />
          <InfoItem icon={Cpu} label="Configuração LLM" value={instance.llmName} />
          <InfoItem icon={Thermometer} label="Temperatura" value={instance.temperature.toFixed(1)} />
          {instance.currentJobId && <InfoItem icon={ListChecks} label="Job Atual" value={instance.currentJobId} className="font-mono text-sky-600 dark:text-sky-400" />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center"><Activity className="mr-2 h-5 w-5"/> Logs de Atividade Recente</CardTitle>
            <CardDescription>Eventos e ações realizadas por esta instância de agente.</CardDescription>
        </CardHeader>
        <CardContent>
            {/* Placeholder for activity logs */}
            <p className="text-sm text-slate-500 dark:text-slate-400">
                (Placeholder: Lista de logs de atividade do agente, como início/fim de jobs, ferramentas usadas, erros, etc.)
            </p>
            <ul className="mt-3 space-y-2 text-xs">
                <li className="flex items-start"><span className="font-mono text-slate-500 dark:text-slate-400 mr-2">[10:35:02]</span> Job 'task-abc-123' iniciado.</li>
                <li className="flex items-start"><span className="font-mono text-slate-500 dark:text-slate-400 mr-2">[10:35:05]</span> Ferramenta 'filesystem.readFile' executada com sucesso.</li>
                <li className="flex items-start"><span className="font-mono text-red-500 dark:text-red-400 mr-2">[10:36:12]</span> Erro ao processar 'subtask-xyz': Timeout.</li>
            </ul>
        </CardContent>
      </Card>

    </div>
  );
}

const InfoItem = ({icon: Icon, label, value, className}: {icon: React.ElementType, label: string, value: string | number, className?: string}) => (
    <div>
        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center mb-0.5">
            <Icon className="h-3.5 w-3.5 mr-1.5 text-slate-400 dark:text-slate-500"/> {label}
        </h4>
        <p className={cn("text-sm text-slate-700 dark:text-slate-200", className)}>{value}</p>
    </div>
);


export const Route = createFileRoute('/(app)/agents/$agentId/')({
  component: AgentInstanceDetailPage,
});
