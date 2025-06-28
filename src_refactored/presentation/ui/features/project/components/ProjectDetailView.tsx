import { Link, Outlet, useRouter, useParams } from '@tanstack/react-router';
// Removed ListChecks, GitBranch as these tabs were removed
import { BarChart2, MessageSquareText, BookText, Settings2, Users } from 'lucide-react';
import React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/ui/components/ui/card';
// Removed TabsContent as Outlet will handle content rendering for child routes
import { Tabs, TabsList, TabsTrigger } from '@/presentation/ui/components/ui/tabs';
import { cn } from '@/presentation/ui/lib/utils';

import { Project } from './ProjectListItem';

interface ProjectDetailViewProps {
  project: Project; // Project data might still be useful for the OverviewTabContent
}

// OverviewTabContent remains as it's the default/index content for the $projectId route
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
          <h4 className="font-medium mb-1">Total de Tarefas (Conceitual)</h4>
          <p className="text-sm text-slate-700 dark:text-slate-300">{project.taskCount}</p>
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

// ProjectSettingsTabContent is removed as its content is now directly rendered by the route
// '/(app)/projects/$projectId/settings/' which will be a child of the $projectId layout.

export function ProjectDetailView({ project }: ProjectDetailViewProps) {
  const tabs = [
    { value: 'overview', label: 'Visão Geral', icon: BarChart2, to: './' }, // Relative to current $projectId path
    { value: 'chat', label: 'Chat/Canais', icon: MessageSquareText, to: './chat' },
    { value: 'docs', label: 'Documentação', icon: BookText, to: './docs' },
    { value: 'members', label: 'Membros & Agentes', icon: Users, to: './members' },
    { value: 'settings', label: 'Configurações', icon: Settings2, to: './settings' },
  ];
  const router = useRouter();
  const params = useParams({ from: '/(app)/projects/$projectId' });

  const currentPath = router.state.location.pathname;
  // Simplified active tab logic: check if the current path ends with the tab's 'to' path,
  // or if it's the base path for the 'overview' tab.
  const activeTabValue = tabs.find(tab => {
    if (tab.to === './') { // Overview tab
      return currentPath === `/projects/${params.projectId}` || currentPath === `/projects/${params.projectId}/`;
    }
    return currentPath.endsWith(tab.to.substring(1)); // Remove leading './' for comparison
  })?.value || 'overview';


  return (
    <Tabs value={activeTabValue} className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1 h-auto flex-wrap justify-start mb-4">
        {tabs.map(tab => (
          <Link
            key={tab.value}
            // The 'to' prop for Link should be relative to its closest Route,
            // which is the $projectId route. So, './settings' is correct.
            to={tab.to}
            params={{ projectId: params.projectId }} // Ensure projectId is always passed for context
            resetScroll={false}
            // activeProps and className for active state are good for visual feedback
            activeProps={{ className: "text-primary font-semibold" }}
            className="[&.active]:text-primary [&.active]:font-semibold"
          >
            <TabsTrigger value={tab.value} className={cn("w-full flex-col sm:flex-row sm:justify-start h-auto py-2 px-3 data-[state=active]:shadow-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary")}>
              <tab.icon className="h-4 w-4 mb-1 sm:mb-0 sm:mr-2" />
              {tab.label}
            </TabsTrigger>
          </Link>
        ))}
      </TabsList>

      <Outlet />
      {/* Render OverviewTabContent only if current path is exactly the project's base path */}
      {(currentPath === `/projects/${params.projectId}` || currentPath === `/projects/${params.projectId}/`) && (
        <OverviewTabContent project={project} />
      )}
    </Tabs>
  );
}
