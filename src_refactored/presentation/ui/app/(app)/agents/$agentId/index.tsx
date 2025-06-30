import { createFileRoute, useParams, Link, useRouter } from '@tanstack/react-router';
import { ArrowLeft, Edit3, MessageSquare, Bot, Zap, AlertTriangle, Thermometer, Briefcase, Cpu, ListChecks, Activity, Loader2, ServerCrash } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

import { Badge } from '@/presentation/ui/components/ui/badge';
import { Button } from '@/presentation/ui/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/ui/components/ui/card';
import { useIpcQuery } from '@/presentation/ui/hooks/ipc/useIpcQuery';
import { cn } from '@/presentation/ui/lib/utils';

import { IPC_CHANNELS } from '@/shared/ipc-channels';
import type { AgentInstance, GetAgentInstanceDetailsRequest, GetAgentInstanceDetailsResponseData } from '@/shared/ipc-types';

// Kept statusDisplayMap as it's UI specific display logic
const statusDisplayMap: Record<AgentInstance['status'], { label: string; icon: React.ElementType; colorClasses: string }> = {
  idle: { label: 'Ocioso', icon: Zap, colorClasses: 'bg-slate-500 text-slate-50' },
  running: { label: 'Executando', icon: Zap, colorClasses: 'bg-sky-500 text-sky-50 animate-pulse' },
  paused: { label: 'Pausado', icon: Zap, colorClasses: 'bg-yellow-500 text-yellow-50' },
  error: { label: 'Erro', icon: AlertTriangle, colorClasses: 'bg-red-500 text-red-50' },
  completed: { label: 'Concluído (Job)', icon: Zap, colorClasses: 'bg-green-500 text-green-50' },
};

const InfoItem = ({icon: itemIcon, label, value, className}: {icon: React.ElementType, label: string, value: string | number | undefined, className?: string}) => {
  const IconComponent = itemIcon;
  return (
    <div>
        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center mb-0.5">
            <IconComponent className="h-3.5 w-3.5 mr-1.5 text-slate-400 dark:text-slate-500"/> {label}
        </h4>
        <p className={cn("text-sm text-slate-700 dark:text-slate-200", className)}>{value !== undefined ? value : 'N/D'}</p>
    </div>
  );
};


// Sub-component for Agent Detail Header
interface AgentDetailHeaderProps {
  instance: AgentInstance;
  statusInfo: { label: string; icon: React.ElementType; colorClasses: string };
}
function AgentDetailHeader({ instance, statusInfo }: AgentDetailHeaderProps) {
  return (
    <CardHeader className="bg-slate-50 dark:bg-slate-800/50 p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Bot className="h-16 w-16 text-emerald-500 dark:text-emerald-400 flex-shrink-0 sm:mt-1" />
        <div className="flex-1">
          <CardTitle className="text-2xl lg:text-3xl mb-1">{instance.agentName || `Agente (Base: ${instance.personaTemplateName || 'N/D'})`}</CardTitle>
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
  );
}

// Sub-component for Agent Detail Content (InfoItems)
interface AgentDetailContentProps {
  instance: AgentInstance;
}
function AgentDetailContent({ instance }: AgentDetailContentProps) {
  return (
    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
      <InfoItem icon={Briefcase} label="Persona Base" value={instance.personaTemplateName || 'Não definida'} />
      <InfoItem icon={Cpu} label="Configuração LLM" value={instance.llmConfigName || 'Não definida'} />
      <InfoItem icon={Thermometer} label="Temperatura" value={instance.temperature?.toFixed(1) || 'N/D'} />
      {instance.currentJobId && <InfoItem icon={ListChecks} label="Job Atual" value={instance.currentJobId} className="font-mono text-sky-600 dark:text-sky-400" />}
    </CardContent>
  );
}

// Sub-component for Activity Log Card
function AgentActivityLogCard() {
  return (
    <Card>
      <CardHeader>
          <CardTitle className="flex items-center"><Activity className="mr-2 h-5 w-5"/> Logs de Atividade Recente</CardTitle>
          <CardDescription>Eventos e ações realizadas por esta instância de agente.</CardDescription>
      </CardHeader>
      <CardContent>
          <p className="text-sm text-slate-500 dark:text-slate-400">
              (Placeholder: Lista de logs de atividade do agente, como início/fim de jobs, ferramentas usadas, erros, etc.)
          </p>
          <ul className="mt-3 space-y-2 text-xs">
              <li className="flex items-start"><span className="font-mono text-slate-500 dark:text-slate-400 mr-2">[10:35:02]</span> Job &apos;task-abc-123&apos; iniciado.</li>
              <li className="flex items-start"><span className="font-mono text-slate-500 dark:text-slate-400 mr-2">[10:35:05]</span> Ferramenta &apos;filesystem.readFile&apos; executada com sucesso.</li>
              <li className="flex items-start"><span className="font-mono text-red-500 dark:text-red-400 mr-2">[10:36:12]</span> Erro ao processar &apos;subtask-xyz&apos;: Timeout.</li>
          </ul>
      </CardContent>
    </Card>
  );
}


function AgentInstanceDetailPage() {
  const params = useParams({ from: '/(app)/agents/$agentId/' });
  const agentId = params.agentId;
  const router = useRouter();

  const { data: instance, isLoading, error } = useIpcQuery<GetAgentInstanceDetailsRequest, GetAgentInstanceDetailsResponseData>(
    IPC_CHANNELS.GET_AGENT_INSTANCE_DETAILS,
    { agentId },
    {
      // staleTime: 5 * 60 * 1000,
      // Example: Cache for 5 minutes
      // refetchOnWindowFocus: true,
      onError: (err) => {
        toast.error(`Erro ao buscar detalhes do agente: ${err.message}`);
      }
    }
  );

  if (isLoading) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-10 w-10 animate-spin text-sky-500 mb-4" />
        <p className="text-lg text-slate-600 dark:text-slate-400">Carregando detalhes da instância do agente...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px] bg-red-50 dark:bg-red-900/10 rounded-lg">
        <ServerCrash className="h-12 w-12 text-red-500 dark:text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Falha ao carregar dados</h2>
        <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error.message}</p>
        <Button onClick={() => router.navigate({ to: '/agents' })} variant="destructive" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista de Agentes
        </Button>
      </div>
    );
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

  // Fallback to idle if status is unexpected
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
                <Link to="/chat" search={{ conversationId: `agent-${instance.id}` }}>
                {/* Ensure instance.id is used */}
                    <MessageSquare className="mr-2 h-4 w-4"/> Conversar
                </Link>
            </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <AgentDetailHeader instance={instance} statusInfo={statusInfo} />
        <AgentDetailContent instance={instance} />
      </Card>

      <AgentActivityLogCard />

    </div>
  );
}

// InfoItem component is now defined above AgentInstanceDetailPage or in a shared location.
// If it's above, no change needed here. If it was moved to shared, update import.
// For now, assuming it's defined above in the same file.

export const Route = createFileRoute('/(app)/agents/$agentId/')({
  component: AgentInstanceDetailPage,
});
