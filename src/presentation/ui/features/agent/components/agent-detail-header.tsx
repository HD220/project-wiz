import { Bot } from "lucide-react";
import React from "react";

import type { AgentInstance } from "@/core/domain/entities/agent.entity";

import { Badge } from "@/components/ui/badge";
import {
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/ui/lib/utils";


interface AgentDetailHeaderProps {
  instance: AgentInstance;
  statusInfo: { label: string; icon: React.ElementType; colorClasses: string };
}

export function AgentDetailHeader({ instance, statusInfo }: AgentDetailHeaderProps) {
  return (
    <CardHeader className="bg-slate-50 dark:bg-slate-800/50 p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Bot className="h-16 w-16 text-emerald-500 dark:text-emerald-400 flex-shrink-0 sm:mt-1" />
        <div className="flex-1">
          <CardTitle className="text-2xl lg:text-3xl mb-1">
            {instance.agentName ||
              `Agente (Base: ${instance.personaTemplateName || "N/D"})`}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className={cn("text-xs", statusInfo.colorClasses)}>
              <statusInfo.icon className="h-3.5 w-3.5 mr-1.5" />
              {statusInfo.label}
            </Badge>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Última atividade: {instance.lastActivity || "N/D"}
            </span>
          </div>
        </div>
      </div>
    </CardHeader>
  );
}
