import { Link } from '@tanstack/react-router';
import { Bot, Edit3, Trash2, MoreVertical, Zap, PlayCircle, PauseCircle, AlertTriangle, MessageSquare } from 'lucide-react';
import React from 'react';

import { Badge } from '@/presentation/ui/components/ui/badge';
import { Button } from '@/presentation/ui/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/presentation/ui/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/presentation/ui/components/ui/dropdown-menu';
import { Separator } from '@/presentation/ui/components/ui/separator';
// Tooltip components are not used in this version, so commented out to clear ESLint warning
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/presentation/ui/components/ui/tooltip';

export interface AgentInstance {
  id: string;
  // Optional custom name for the instance
  agentName?: string;
  personaTemplateId: string;
  // Denormalized for display
  personaTemplateName?: string;
  llmProviderConfigId: string;
  // Denormalized for display
  llmConfigName?: string;
  temperature: number;
  // Expanded status
  status: 'idle' | 'running' | 'paused' | 'error' | 'completed';
  currentJobId?: string | null;
  lastActivity?: string;
}

interface AgentInstanceListItemProps {
  instance: AgentInstance;
  onEdit?: (instanceId: string) => void;
  onDelete?: (instanceId: string) => void;
  onToggleStatus?: (instanceId: string, currentStatus: AgentInstance['status']) => void;
  // Action to view/start chat with this agent
  onViewChat?: (instanceId: string) => void;
}

const statusMap: Record<AgentInstance['status'], { label: string; color: string; icon: React.ElementType }> = {
  idle: { label: 'Ocioso', color: 'bg-slate-500 dark:bg-slate-400', icon: PauseCircle },
  running: { label: 'Executando', color: 'bg-sky-500 dark:bg-sky-400', icon: PlayCircle },
  paused: { label: 'Pausado', color: 'bg-yellow-500 dark:bg-yellow-400', icon: PauseCircle },
  error: { label: 'Erro', color: 'bg-red-500 dark:bg-red-400', icon: AlertTriangle },
  // Assuming completed refers to last job
  completed: { label: 'Concluído (Job)', color: 'bg-green-500 dark:bg-green-400', icon: Zap },
};

export function AgentInstanceListItem({ instance, onEdit, onDelete, onToggleStatus, onViewChat }: AgentInstanceListItemProps) {
  const agentDisplayName = instance.agentName || `Agente (Base: ${instance.personaTemplateName || 'Desconhecido'})`;
  const agentStatus = statusMap[instance.status] || statusMap.idle;

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <Bot className="h-10 w-10 text-emerald-500 dark:text-emerald-400" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 data-[state=open]:bg-slate-100 dark:data-[state=open]:bg-slate-800">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onViewChat && (
                <DropdownMenuItem onClick={() => onViewChat(instance.id)}>
                  <MessageSquare className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                  Conversar com Agente
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(instance.id)}>
                  <Edit3 className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                  Editar Instância
                </DropdownMenuItem>
              )}
              {onToggleStatus && instance.status !== 'error' && instance.status !== 'completed' && (
                 <DropdownMenuItem onClick={() => onToggleStatus(instance.id, instance.status)}>
                  {instance.status === 'running' ? <PauseCircle className="mr-2 h-3.5 w-3.5"/> : <PlayCircle className="mr-2 h-3.5 w-3.5"/>}
                  {instance.status === 'running' ? 'Pausar Agente' : 'Ativar/Continuar Agente'}
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 dark:text-red-500 focus:text-red-600 dark:focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/50"
                    onClick={() => onDelete(instance.id)}
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Excluir Instância
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle className="text-lg truncate" title={agentDisplayName}>
           {/* Link to a future agent detail page */}
          <Link to="/agents/$agentId" params={{ agentId: instance.id }} className="hover:underline">
            {agentDisplayName}
          </Link>
        </CardTitle>
        <CardDescription className="text-xs h-5">
          Status: <Badge style={{ backgroundColor: agentStatus.color }} className="text-xs text-white dark:text-black font-medium px-1.5 py-0.5">
            <agentStatus.icon className="h-3 w-3 mr-1" />
            {agentStatus.label}
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pb-3 space-y-1.5 text-xs">
        <p>Persona: <span className="font-medium text-slate-700 dark:text-slate-300">{instance.personaTemplateName || 'N/A'}</span></p>
        <p>LLM Config: <span className="font-medium text-slate-700 dark:text-slate-300">{instance.llmConfigName || 'N/A'}</span></p>
        <p>Temperatura: <span className="font-medium text-slate-700 dark:text-slate-300">{instance.temperature.toFixed(1)}</span></p>
        {instance.currentJobId && <p>Job Atual: <span className="font-mono text-sky-600 dark:text-sky-400 text-xs">{instance.currentJobId}</span></p>}
      </CardContent>
      <Separator />
      <CardFooter className="p-3 text-xs text-slate-500 dark:text-slate-400">
        {instance.lastActivity ? `Última atividade: ${instance.lastActivity}` : 'Nenhuma atividade recente'}
      </CardFooter>
    </Card>
  );
}
