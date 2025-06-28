import { createFileRoute, useParams, Link } from '@tanstack/react-router';
import { ArrowLeft, Settings, Edit3, Trash2, Play, Pause, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

// Commenting out unused imports to satisfy ESLint
// import { Avatar, AvatarFallback, AvatarImage } from '@/presentation/ui/components/ui/avatar';
// import { Badge } from '@/presentation/ui/components/ui/badge';
import { Button } from '@/presentation/ui/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/ui/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/presentation/ui/components/ui/dropdown-menu';
import { Separator } from '@/presentation/ui/components/ui/separator';
import { ProjectDetailView } from '@/presentation/ui/features/project/components/ProjectDetailView';
import { Project } from '@/presentation/ui/features/project/components/ProjectListItem'; // Reusing the Project type


// Mock data - replace with actual data fetching
const mockProjectsData: Record<string, Project> = {
  // Changed string keys to more descriptive ones for ESLint rule compliance
  mockId1: { id: '1', name: 'Projeto Phoenix', description: 'Reconstrução da plataforma principal com foco em escalabilidade e IA. Este projeto visa modernizar toda a stack tecnológica e introduzir novos paradigmas de desenvolvimento ágil e orientado a IA para otimizar entregas.', lastActivity: '2 horas atrás', status: 'active', agentCount: 5, taskCount: 23 },
  mockId2: { id: '2', name: 'Operação Quimera', description: 'Integração de múltiplos serviços legados em uma nova arquitetura de microfrontends.', lastActivity: '1 dia atrás', status: 'paused', agentCount: 2, taskCount: 8 },
  mockId3: { id: '3', name: 'Iniciativa Netuno', description: 'Desenvolvimento de um novo data lake para análise preditiva de mercado.', lastActivity: '5 dias atrás', status: 'planning', agentCount: 1, taskCount: 2 },
  mockId4: { id: '4', name: 'Projeto Alpha', description: 'Um projeto de exploração de novas tecnologias de IA.', lastActivity: '3 horas atrás', status: 'active', agentCount: 3, taskCount: 15 },
  mockId5: { id: '5', name: 'Legado Modernizado', description: 'Atualização de sistema legado para novas tecnologias.', lastActivity: '1 semana atrás', status: 'completed', agentCount: 0, taskCount: 50 },
};

const statusDetails: Record<Project['status'], { label: string; icon: React.ElementType; colorClass: string }> = {
  active: { label: 'Ativo', icon: Play, colorClass: 'text-green-500 dark:text-green-400' },
  paused: { label: 'Pausado', icon: Pause, colorClass: 'text-yellow-500 dark:text-yellow-400' },
  planning: { label: 'Planejamento', icon: Clock, colorClass: 'text-blue-500 dark:text-blue-400' },
  completed: { label: 'Concluído', icon: CheckCircle, colorClass: 'text-slate-500 dark:text-slate-400' },
  archived: { label: 'Arquivado', icon: AlertTriangle, colorClass: 'text-red-500 dark:text-red-400' }, // Assuming archived might use a warning or error like color
};


function ProjectDetailPage() {
  const params = useParams({ from: Route.id });
  const projectId = params.projectId;
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setIsLoading(true);
    setTimeout(() => {
      const foundProject = mockProjectsData[projectId];
      setProject(foundProject || null);
      setIsLoading(false);
      if (!foundProject) {
        toast.error(`Projeto com ID "${projectId}" não encontrado.`);
        // Consider redirecting or showing a specific "not found" component
      }
    }, 500);
  }, [projectId]);

  if (isLoading) {
    return <div className="p-8 text-center">Carregando detalhes do projeto...</div>;
  }

  if (!project) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Projeto não encontrado</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          O projeto que você está tentando acessar não existe ou foi movido.
        </p>
        <Button asChild variant="outline">
          <Link to="/projects">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Projetos
          </Link>
        </Button>
      </div>
    );
  }

  const currentStatusDetail = statusDetails[project.status];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <div>
          <Button variant="outline" size="sm" className="mb-3" asChild>
            <Link to="/projects">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Projetos
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center">
            {/* Optional: Project Icon/Avatar */}
            {/* <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={project.imageUrl || ''} alt={project.name} />
              <AvatarFallback>{project.name.substring(0,1)}</AvatarFallback>
            </Avatar> */}
            {project.name}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            {project.description}
          </p>
           <div className="mt-2 flex items-center space-x-2">
            <currentStatusDetail.icon className={`h-4 w-4 ${currentStatusDetail.colorClass}`} />
            <span className={`text-sm font-medium ${currentStatusDetail.colorClass}`}>
              {currentStatusDetail.label}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          <Button variant="outline">
            <Edit3 className="mr-2 h-4 w-4" /> Editar
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
                <span className="sr-only">Configurações do Projeto</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Play className="mr-2 h-4 w-4" /> Ativar Projeto
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Pause className="mr-2 h-4 w-4" /> Pausar Projeto
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500 focus:text-red-600 focus:bg-red-50 dark:focus:text-red-400 dark:focus:bg-red-900/60">
                <Trash2 className="mr-2 h-4 w-4" /> Excluir Projeto
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Separator />

      {/* Main Content Area with Tabs/Sections */}
      <ProjectDetailView project={project} />
    </div>
  );
}

export const Route = createFileRoute('/(app)/projects/$projectId/')({
  component: ProjectDetailPage,
});
