import { Briefcase, Cpu, ListChecks, Thermometer } from "lucide-react";
import React from "react";

import { CardContent } from "@/components/ui/card";
import { InfoItem } from "@/ui/components/InfoItem";

import type { AgentInstance } from "@/shared/ipc-types";

interface AgentDetailContentProps {
  instance: AgentInstance;
}

export function AgentDetailContent({ instance }: AgentDetailContentProps) {
  return (
    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
      <InfoItem
        icon={Briefcase}
        label="Persona Base"
        value={instance.personaTemplateName || "Não definida"}
      />
      <InfoItem
        icon={Cpu}
        label="Configuração LLM"
        value={instance.llmConfigName || "Não definida"}
      />
      <InfoItem
        icon={Thermometer}
        label="Temperatura"
        value={instance.temperature?.toFixed(1) || "N/D"}
      />
      {instance.currentJobId && (
        <InfoItem
          icon={ListChecks}
          label="Job Atual"
          value={instance.currentJobId}
          className="font-mono text-sky-600 dark:text-sky-400"
        />
      )}
    </CardContent>
  );
}
