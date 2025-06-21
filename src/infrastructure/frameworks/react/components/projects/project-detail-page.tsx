import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { placeholderUserProjects, PlaceholderProject, placeholderProjectDetails, PlaceholderTask, PlaceholderTeamMember, getProjectDetailsPlaceholder } from "@/lib/placeholders"; // To be updated in placeholders
import { getInitials } from "@/lib/utils";
import { Trans, t } from "@lingui/macro";
import { ProjectOverviewTab } from "./details/project-overview-tab";
import { ProjectTasksTab } from "./details/project-tasks-tab";
import { ProjectTeamTab } from "./details/project-team-tab";
import { ProjectDiscussionsTab } from "./details/project-discussions-tab";

interface ProjectDetailPageProps {
  projectId: string;
}

export function ProjectDetailPage({ projectId }: ProjectDetailPageProps) {
  const [project, setProject] = useState<PlaceholderProject | null>(null);
  const [details, setDetails] = useState<{ tasks: PlaceholderTask[]; teamMembers: PlaceholderTeamMember[]; } | null>(null);

  useEffect(() => {
    // Simulate fetching project data based on ID from placeholders
    const foundProject = placeholderUserProjects.find(p => p.id === projectId);
    setProject(foundProject || null);
    if (foundProject) {
      setDetails(getProjectDetailsPlaceholder(projectId));
    }
  }, [projectId]);

  if (!project) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl"><Trans>Projeto não encontrado</Trans></h1>
        <p>{t({ id: "projectDetail.notFoundFull", message: `O projeto com o ID '${projectId}' não foi encontrado nos dados de placeholder.`, values: { projectId: projectId }})}</p>
        <Button onClick={() => window.history.back()} className="mt-4"><Trans>Voltar</Trans></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header Section */}
      <header className="pb-4 border-b">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold">{project.name}</h1>
                <p className="text-muted-foreground mt-1">{project.description}</p>
            </div>
            <Badge variant={project.status === "Concluído" ? "default" : "outline"}
                   className={`text-sm ${project.status === "Concluído" ? "bg-green-500 text-white" : project.status === "Em Andamento" ? "border-blue-500 text-blue-500" : "border-yellow-500 text-yellow-500"}`}>
                {project.status}
            </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2"><Trans>Última atualização:</Trans> {new Date(project.lastUpdate).toLocaleString()}</p>
      </header>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-4">
          <TabsTrigger value="overview"><Trans>Visão Geral</Trans></TabsTrigger>
          <TabsTrigger value="tasks"><Trans>Tarefas</Trans></TabsTrigger>
          <TabsTrigger value="team"><Trans>Equipe</Trans></TabsTrigger>
          <TabsTrigger value="discussions"><Trans>Discussões</Trans></TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <ProjectOverviewTab project={project} />
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <ProjectTasksTab tasks={details?.tasks} />
        </TabsContent>

        <TabsContent value="team" className="mt-4">
          <ProjectTeamTab teamMembers={details?.teamMembers} />
        </TabsContent>

        <TabsContent value="discussions" className="mt-4">
          <ProjectDiscussionsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
