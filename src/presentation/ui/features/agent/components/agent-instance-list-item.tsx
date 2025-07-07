import React from 'react';

import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { AgentInstanceDetails } from './list-item-parts/agent-instance-details';
import { AgentInstanceFooter } from './list-item-parts/agent-instance-footer';
import { AgentInstanceHeader } from './list-item-parts/agent-instance-header';

export interface AgentInstance {
  id: string;
  agentName?: string;
  personaTemplateId: string;
  personaTemplateName?: string;
  llmProviderConfigId: string;
  llmConfigName?: string;
  temperature: number;
  status: 'idle' | 'running' | 'paused' | 'error' | 'completed';
  currentJobId?: string | null;
  lastActivity?: string;
}

interface AgentInstanceListItemProps {
  instance: AgentInstance;
  onEdit?: (instanceId: string) => void;
  onDelete?: (instanceId: string) => void;
  onToggleStatus?: (
    instanceId: string,
    currentStatus: AgentInstance['status'],
  ) => void;
  onViewChat?: (instanceId: string) => void;
}

export function AgentInstanceListItem({
  instance,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewChat,
}: AgentInstanceListItemProps) {
  const agentDisplayName =
    instance.agentName ||
    `Agente (Base: ${instance.personaTemplateName || 'Desconhecido'})`;

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200">
      <AgentInstanceHeader
        instance={instance}
        agentDisplayName={agentDisplayName}
        onViewChat={onViewChat}
        onEdit={onEdit}
        onToggleStatus={onToggleStatus}
        onDelete={onDelete}
      />
      <AgentInstanceDetails instance={instance} />
      <Separator />
      <AgentInstanceFooter instance={instance} />
    </Card>
  );
}
