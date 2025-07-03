import {
  createFileRoute,
  Outlet,
  useParams,
  useRouter,
} from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { ProjectDetailHeader } from '@/ui/features/project/components/details/ProjectDetailHeader';
import { ProjectLoading } from '@/ui/features/project/components/details/ProjectLoading';
import { ProjectNotFound } from '@/ui/features/project/components/details/ProjectNotFound';
import { ProjectOverviewTab } from '@/ui/features/project/components/details/ProjectOverviewTab';
import { ProjectContextSidebar } from '@/ui/features/project/components/layout/ProjectContextSidebar';
import { ProjectParticipantsSidebar } from '@/ui/features/project/components/layout/ProjectParticipantsSidebar';
import { Project } from '@/ui/features/project/components/ProjectListItem';

// Mock data - replace with actual data fetching
const mockProjectsData: Record<string, Project> = {
  mockId1: {
    id: '1',
    name: 'Projeto Phoenix',
    description: 'Reconstrução da plataforma principal...',
    status: 'active',
    lastActivity: '2 horas atrás',
    agentCount: 5,
    taskCount: 23,
  },
  mockId2: {
    id: '2',
    name: 'Operação Quimera',
    description: 'Integração de múltiplos serviços...',
    status: 'paused',
    lastActivity: '1 dia atrás',
    agentCount: 2,
    taskCount: 8,
  },
  mockId3: {
    id: '3',
    name: 'Iniciativa Netuno',
    description: 'Desenvolvimento de um novo data lake...',
    status: 'planning',
    lastActivity: '5 dias atrás',
    agentCount: 1,
    taskCount: 2,
  },
};

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
    return <ProjectLoading />;
  }

  if (!project) {
    return <ProjectNotFound />;
  }

  const isOverviewPage =
    currentPath === `/projects/${params.projectId}` ||
    currentPath === `/projects/${params.projectId}/`;

  return (
    <div className="flex h-full">
      <ProjectContextSidebar project={project} className="h-full" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <ProjectDetailHeader project={project} />

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {isOverviewPage ? <ProjectOverviewTab project={project} /> : <Outlet />}
        </div>
      </div>

      <ProjectParticipantsSidebar className="h-full" />
    </div>
  );
}

export const Route = createFileRoute('/app/projects/$projectId/')({
  component: ProjectDetailLayoutPage,
});
