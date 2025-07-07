import React from 'react';

import { CardContent } from '@/components/ui/card';

import { AgentInstance } from '../AgentInstanceListItem';

interface AgentInstanceDetailsProps {
  instance: AgentInstance;
}

export function AgentInstanceDetails({ instance }: AgentInstanceDetailsProps) {
  return (
    <CardContent className="flex-grow pb-3 space-y-1.5 text-xs">
      <p>
        Persona:{" "}
        <span className="font-medium text-slate-700 dark:text-slate-300">
          {instance.personaTemplateName || 'N/A'}
        </span>
      </p>
      <p>
        LLM Config:{" "}
        <span className="font-medium text-slate-700 dark:text-slate-300">
          {instance.llmConfigName || 'N/A'}
        </span>
      </p>
      <p>
        Temperatura:{" "}
        <span className="font-medium text-slate-700 dark:text-slate-300">
          {instance.temperature.toFixed(1)}
        </span>
      </p>
      {instance.currentJobId && (
        <p>
          Job Atual:{" "}
          <span className="font-mono text-sky-600 dark:text-sky-400 text-xs">
            {instance.currentJobId}
          </span>
        </p>
      )}
    </CardContent>
  );
}
