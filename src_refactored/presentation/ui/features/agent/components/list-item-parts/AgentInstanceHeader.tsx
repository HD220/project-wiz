import { Link } from '@tanstack/react-router';
import {
  Bot,
  Edit3,
  Trash2,
  MoreVertical,
  PlayCircle,
  PauseCircle,
  MessageSquare,
} from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { AgentInstance } from '../AgentInstanceListItem';

import { AgentInstanceStatusBadge } from './AgentInstanceStatusBadge';

interface AgentInstanceHeaderProps {
  instance: AgentInstance;
  agentDisplayName: string;
  onViewChat?: (instanceId: string) => void;
  onEdit?: (instanceId: string) => void;
  onToggleStatus?: (
    instanceId: string,
    currentStatus: AgentInstance['status'],
  ) => void;
  onDelete?: (instanceId: string) => void;
}

export function AgentInstanceHeader({
  instance,
  agentDisplayName,
  onViewChat,
  onEdit,
  onToggleStatus,
  onDelete,
}: AgentInstanceHeaderProps) {
  return (
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between mb-2">
        <Bot className="h-10 w-10 text-emerald-500 dark:text-emerald-400" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 data-[state=open]:bg-slate-100 dark:data-[state=open]:bg-slate-800"
            >
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
            {onToggleStatus &&
              instance.status !== 'error' &&
              instance.status !== 'completed' && (
                <DropdownMenuItem
                  onClick={() => onToggleStatus(instance.id, instance.status)}
                >
                  {instance.status === 'running' ? (
                    <PauseCircle className="mr-2 h-3.5 w-3.5" />
                  ) : (
                    <PlayCircle className="mr-2 h-3.5 w-3.5" />
                  )}
                  {instance.status === 'running'
                    ? 'Pausar Agente'
                    : 'Ativar/Continuar Agente'}
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
        <Link
          to="/agents/$agentId"
          params={{ agentId: instance.id }}
          className="hover:underline"
        >
          {agentDisplayName}
        </Link>
      </CardTitle>
      <CardDescription className="text-xs h-5">
        <AgentInstanceStatusBadge status={instance.status} />
      </CardDescription>
    </CardHeader>
  );
}
