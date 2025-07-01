import { createFileRoute, Outlet, useParams, Link, useRouter } from '@tanstack/react-router';
import { ArrowLeft, Settings, Play, Pause, CheckCircle, Clock, AlertTriangle, ChevronDown, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/presentation/ui/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/ui/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/presentation/ui/components/ui/dropdown-menu';
import { ProjectContextSidebar } from '@/presentation/ui/features/project/components/layout/ProjectContextSidebar';
import { ProjectParticipantsSidebar } from '@/presentation/ui/features/project/components/layout/ProjectParticipantsSidebar';
import { Project } from '@/presentation/ui/features/project/components/ProjectListItem';


const OverviewTabContent = ({ project }: { project: Project }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Resumo do Projeto</CardTitle>
        <CardDescription>Informações chave e estatísticas sobre &quot;{project.name}&quot;.</CardDescription>
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

// Mock data - replace with actual data fetching
const mockProjectsData: Record<string, Project> = {
  mockId1: { id: '1', name: 'Projeto Phoenix', description: 'Reconstrução da plataforma principal...', status: 'active', lastActivity: '2 horas atrás', agentCount: 5, taskCount: 23 },
  mockId2: { id: '2', name: 'Operação Quimera', description: 'Integração de múltiplos serviços...', status: 'paused', lastActivity: '1 dia atrás', agentCount: 2, taskCount: 8 },
  mockId3: { id: '3', name: 'Iniciativa Netuno', description: 'Desenvolvimento de um novo data lake...', status: 'planning', lastActivity: '5 dias atrás', agentCount: 1, taskCount: 2 },
};

const statusDetails: Record<Project['status'], { label: string; icon: React.ElementType; colorClass: string }> = {
  active: { label: 'Ativo', icon: Play, colorClass: 'text-green-500 dark:text-green-400' },
  paused: { label: 'Pausado', icon: Pause, colorClass: 'text-yellow-500 dark:text-yellow-400' },
  planning: { label: 'Planejamento', icon: Clock, colorClass: 'text-blue-500 dark:text-blue-400' },
  completed: { label: 'Concluído', icon: CheckCircle, colorClass: 'text-slate-500 dark:text-slate-400' },
  archived: { label: 'Arquivado', icon: AlertTriangle, colorClass: 'text-red-500 dark:text-red-400' },
};

// This component now acts as the LAYOUT for /projects/$projectId and its children (tabs)
function ProjectDetailLayoutPage() {
  const params = useParams({ from: '/(app)/projects/$projectId/' });
  const projectId = params.projectId;
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const currentPath = router.state.location.pathname;


  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const foundProject = mockProjectsData[projectId];
      setProject(foundProject || null);
      setIsLoading(false);
      if (!foundProject) {
        toast.error(`Projeto com ID "${projectId}" não encontrado.`);
      }
    }, 300);
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        Carregando detalhes do projeto...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Projeto não encontrado</h2>
        <Button asChild variant="outline">
          <Link to="/projects">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Projetos
          </Link>
        </Button>
      </div>
    );
  }

  const currentStatusDetail = statusDetails[project.status];

  // The main AppSidebar is already part of the (app)/_layout.tsx
  // This page will have its own ProjectContextSidebar and the main content area with Outlet
  return (
    <div className="flex h-full">
      <ProjectContextSidebar project={project} className="h-full" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                {project.name}
              </h1>
              <div className="mt-1 flex items-center space-x-2">
                <currentStatusDetail.icon className={`h-4 w-4 ${currentStatusDetail.colorClass}`} />
                <span className={`text-xs font-medium ${currentStatusDetail.colorClass}`}>
                  {currentStatusDetail.label}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">| Última atividade: {project.lastActivity}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" asChild>
                 <Link to="./settings" params={{projectId: project.id}}>
                    <Settings className="mr-1.5 h-3.5 w-3.5" /> Configurações
                 </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Ações <ChevronDown className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Play className="mr-2 h-4 w-4" /> Ativar/Continuar
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Pause className="mr-2 h-4 w-4" /> Pausar Projeto
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-500 focus:text-red-600 dark:focus:text-red-500 dark:focus:bg-red-900/50">
                    <Trash2 className="mr-2 h-4 w-4" /> Excluir Projeto
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Content Area for Tabs (rendered by Outlet) or Overview */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {(currentPath === `/projects/${params.projectId}` || currentPath === `/projects/${params.projectId}/`) ? (
                <OverviewTabContent project={project} />
            ) : (
                <Outlet />
            )}
        </div>
      </div>

      {/* Right Sidebar for Participants */}
      <ProjectParticipantsSidebar className="h-full" />
    </div>
  );
}

// This route now acts as a layout route for its children (the tabs)
export const Route = createFileRoute('/(app)/projects/$projectId/')({
  component: ProjectDetailLayoutPage,
});
