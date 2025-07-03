import React from 'react';

import { CardFooter } from '@/components/ui/card';

import { AgentInstance } from '../AgentInstanceListItem';

interface AgentInstanceFooterProps {
  instance: AgentInstance;
}

export function AgentInstanceFooter({ instance }: AgentInstanceFooterProps) {
  return (
    <CardFooter className="p-3 text-xs text-slate-500 dark:text-slate-400">
      {instance.lastActivity
        ? `Última atividade: ${instance.lastActivity}`
        : 'Nenhuma atividade recente'}
    </CardFooter>
  );
}
