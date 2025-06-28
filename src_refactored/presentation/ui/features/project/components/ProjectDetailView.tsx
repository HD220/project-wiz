import { BarChart2, ListChecks, MessageSquareText, BookText, Settings2, Users, GitBranch } from 'lucide-react';
import React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/ui/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/ui/components/ui/tabs';

import { Project } from './ProjectListItem'; // Reusing the Project type

interface ProjectDetailViewProps {
  project: Project;
}

// Placeholder components for tab content
const OverviewTabContent = ({ project }: { project: Project }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Resumo do Projeto</CardTitle>
        <CardDescription>Informações chave e estatísticas sobre "{project.name}".</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div>
          <h4 className="font-medium mb-1">Status Atual</h4>
          <p className="text-sm text-slate-700 dark:text-slate-300">{project.status}</p>
        </div>
        <div>
          <h4 className="font-medium mb-1">Última Atividade</h4>
          <p className="text-sm text-slate-700 dark:text-slate-300">{project.lastActivity}</p>
        </div>
        <div>
          <h4 className="font-medium mb-1">Agentes Envolvidos</h4>
          <p className="text-sm text-slate-700 dark:text-slate-300">{project.agentCount}</p>
        </div>
        <div>
          <h4 className="font-medium mb-1">Total de Tarefas</h4>
          <p className="text-sm text-slate-700 dark:text-slate-300">{project.taskCount} (ativas/planejadas)</p>
        </div>
        <div className="md:col-span-2">
          <h4 className="font-medium mb-1">Descrição Completa</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">
            {project.description || "Nenhuma descrição detalhada fornecida."}
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

const TasksTabContent = () => (
  <Card>
    <CardHeader>
      <CardTitle>Gerenciamento de Tarefas (Jobs)</CardTitle>
      <CardDescription>Visualize e gerencie todas as tarefas associadas a este projeto.</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Lista de tarefas (jobs), filtros, e opções de criação de novas tarefas aparecerão aqui...
      </p>
    </CardContent>
  </Card>
);

const ChatTabContent = () => (
  <Card>
    <CardHeader>
      <CardTitle>Canais de Comunicação / Chat do Projeto</CardTitle>
      <CardDescription>Interaja com agentes e colaboradores nos canais deste projeto.</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Interface de chat com canais (#geral, #desenvolvimento, #logs-agentes) aparecerá aqui...
      </p>
    </CardContent>
  </Card>
);

const DocsTabContent = () => (
  <Card>
    <CardHeader>
      <CardTitle>Documentação do Projeto</CardTitle>
      <CardDescription>Acesse e gerencie a documentação técnica e de negócios.</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Visualizador de arquivos Markdown, estrutura de pastas da documentação, e opções de edição aparecerão aqui...
      </p>
    </CardContent>
  </Card>
);

const ProjectSettingsTabContent = () => (
  <Card>
    <CardHeader>
      <CardTitle>Configurações do Projeto</CardTitle>
      <CardDescription>Ajuste as configurações específicas deste projeto.</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Opções para editar nome, descrição, repositório Git associado, membros/agentes do projeto, etc., aparecerão aqui...
      </p>
    </CardContent>
  </Card>
);


export function ProjectDetailView({ project }: ProjectDetailViewProps) {
  const tabs = [
    { value: 'overview', label: 'Visão Geral', icon: BarChart2, content: <OverviewTabContent project={project} /> },
    { value: 'tasks', label: 'Tarefas', icon: ListChecks, content: <TasksTabContent /> },
    { value: 'chat', label: 'Chat/Canais', icon: MessageSquareText, content: <ChatTabContent /> },
    { value: 'docs', label: 'Documentação', icon: BookText, content: <DocsTabContent /> },
    { value: 'members', label: 'Membros & Agentes', icon: Users, content: <p>Gerenciamento de membros e agentes...</p> },
    { value: 'vcs', label: 'Controle de Versão', icon: GitBranch, content: <p>Status do Git, branches, commits...</p> },
    { value: 'settings', label: 'Configurações', icon: Settings2, content: <ProjectSettingsTabContent /> },
  ];

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-1 h-auto flex-wrap justify-start mb-4">
        {tabs.map(tab => (
          <TabsTrigger key={tab.value} value={tab.value} className="flex-col sm:flex-row sm:justify-start h-auto py-2 px-3 data-[state=active]:shadow-sm">
            <tab.icon className="h-4 w-4 mb-1 sm:mb-0 sm:mr-2" />
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map(tab => (
        <TabsContent key={tab.value} value={tab.value} className="mt-0">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
