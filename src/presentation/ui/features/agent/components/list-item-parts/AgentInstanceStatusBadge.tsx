import {
  AlertTriangle,
  PauseCircle,
  PlayCircle,
  Zap,
} from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';

import { AgentInstance } from '../AgentInstanceListItem';

const statusMap: Record<
  AgentInstance['status'],
  { label: string; color: string; icon: React.ElementType }
> = {
  idle: {
    label: 'Ocioso',
    color: 'bg-slate-500 dark:bg-slate-400',
    icon: PauseCircle,
  },
  running: {
    label: 'Executando',
    color: 'bg-sky-500 dark:bg-sky-400',
    icon: PlayCircle,
  },
  paused: {
    label: 'Pausado',
    color: 'bg-yellow-500 dark:bg-yellow-400',
    icon: PauseCircle,
  },
  error: {
    label: 'Erro',
    color: 'bg-red-500 dark:bg-red-400',
    icon: AlertTriangle,
  },
  completed: {
    label: 'Concluído (Job)',
    color: 'bg-green-500 dark:bg-green-400',
    icon: Zap,
  },
};

interface AgentInstanceStatusBadgeProps {
  status: AgentInstance['status'];
}

export function AgentInstanceStatusBadge({ status }: AgentInstanceStatusBadgeProps) {
  const agentStatus = statusMap[status] || statusMap.idle;

  return (
    <>
      Status:{" "}
      <Badge
        style={{ backgroundColor: agentStatus.color }}
        className="text-xs text-white dark:text-black font-medium px-1.5 py-0.5"
      >
        <agentStatus.icon className="h-3 w-3 mr-1" />
        {agentStatus.label}
      </Badge>
    </>
  );
}
