import { Link, Router } from "@tanstack/react-router";
import { ArrowLeft, Edit3, MessageSquare } from "lucide-react";
import React from "react";

import type { AgentInstance } from "@/core/domain/entities/agent";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AgentActivityLogCard } from "@/ui/features/agent/components/AgentActivityLogCard";
import { AgentDetailContent } from "@/ui/features/agent/components/AgentDetailContent";
import { AgentDetailHeader } from "@/ui/features/agent/components/AgentDetailHeader";


interface AgentDetailViewProps {
  instance: AgentInstance;
  statusInfo: { label: string; icon: React.ElementType; colorClasses: string };
  agentId: string;
  
}

export function AgentDetailView({
  instance,
  statusInfo,
}: AgentDetailViewProps) {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link to="/app/agents">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista
          </Link>
        </Button>
        <div className="flex items-center space-x-2">
          <Button variant="default" asChild>
            <Link to="/app/agents/$agentId/edit" params={{ agentId: instance.id }}>
              <Edit3 className="mr-2 h-4 w-4" /> Editar Instância
            </Link>
          </Button>
          <Button
            variant="outline"
            className="bg-sky-500 hover:bg-sky-600 text-white dark:bg-sky-600 dark:hover:bg-sky-700"
            asChild
          >
            <Link
              to="/app/chat"
              search={{ conversationId: `agent-${instance.id}` }}
            >
              <MessageSquare className="mr-2 h-4 w-4" /> Conversar
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


