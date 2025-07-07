import React from 'react';

import type { Project } from '@/core/domain/entities/project.entity';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const ProjectOverviewTab = ({ project }: { project: Project }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Resumo do Projeto</CardTitle>
        <CardDescription>
          Informações chave e estatísticas sobre &quot;{project.name}&quot;.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div>
          <h4 className="font-medium mb-1">Status Atual</h4>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {project.status}
          </p>
        </div>
        <div>
          <h4 className="font-medium mb-1">Última Atividade</h4>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {project.lastActivity}
          </p>
        </div>
        <div>
          <h4 className="font-medium mb-1">Agentes Envolvidos</h4>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {project.agentCount}
          </p>
        </div>
        <div>
          <h4 className="font-medium mb-1">Total de Tarefas (Conceitual)</h4>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {project.taskCount}
          </p>
        </div>
        <div className="md:col-span-2">
          <h4 className="font-medium mb-1">Descrição Completa</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">
            {project.description || 'Nenhuma descrição detalhada fornecida.'}
          </p>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>Atividade Recente (Placeholder)</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Feed de atividades recentes do projeto aparecerá aqui...
        </p>
      </CardContent>
    </Card>
  </div>
);
