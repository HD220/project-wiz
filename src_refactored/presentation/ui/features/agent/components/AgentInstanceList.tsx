import React from 'react';
import { toast } from 'sonner';

import { AgentInstance, AgentInstanceListItem } from './AgentInstanceListItem';

interface AgentInstanceListProps {
  // Expecting enriched instances with names
  instances: AgentInstance[];
}

export function AgentInstanceList({ instances }: AgentInstanceListProps) {

  const handleDeleteInstance = (instanceId: string) => {
    const instance = instances.find(item => item.id === instanceId);
    toast.warning(`Exclusão da instância "${instance?.agentName || instance?.id}" (simulado).`, {
      description: "Esta funcionalidade ainda não está conectada ao backend.",
    });
  };

  const handleEditInstance = (instanceId: string) => {
    const instance = instances.find(item => item.id === instanceId);
    toast.info(`Edição da instância "${instance?.agentName || instance?.id}" (simulado).`, {
      description: "Redirecionamento para formulário de edição (a ser implementado).",
    });
  };

  const handleToggleStatus = (instanceId: string, currentStatus: AgentInstance['status']) => {
     const instance = instances.find(item => item.id === instanceId);
    const newStatus = currentStatus === 'running' ? 'pausado' : 'em execução';
    toast.info(`Status da instância "${instance?.agentName || instance?.id}" alterado para ${newStatus} (simulado).`, {
       description: "Esta funcionalidade ainda não está conectada ao backend.",
    });
  };

  const handleViewChat = (instanceId: string) => {
    const instance = instances.find(item => item.id === instanceId);
    toast.info(`Abrindo chat com "${instance?.agentName || instance?.id}" (simulado).`, {
      description: "Redirecionamento para interface de chat (a ser implementado).",
    });
    // Example: router.navigate({ to: `/chat/${instanceId}` });
  };


  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {instances.map((instance) => (
        <AgentInstanceListItem
          key={instance.id}
          instance={instance}
          onDelete={handleDeleteInstance}
          onEdit={handleEditInstance}
          onToggleStatus={handleToggleStatus}
          onViewChat={handleViewChat}
        />
      ))}
    </div>
  );
}
