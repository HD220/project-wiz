import { createFileRoute } from "@tanstack/react-router";
import {
  MessageSquare,
  Users,
  FileText,
  Settings,
  Activity,
  GitBranch,
} from "lucide-react";
import { useState, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjects } from "@/domains/projects/hooks/use-projects.hook";

import { ProjectDto } from "@/shared/types";

export function ProjectIndexPage() {
  const { projectId } = Route.useParams();
  const [currentProject, setCurrentProject] = useState<ProjectDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { getProjectById } = useProjects();

  useEffect(() => {
    const loadProject = async () => {
      if (projectId) {
        setIsLoading(true);
        const project = await getProjectById({ id: projectId });
        setCurrentProject(project);
        setIsLoading(false);
      }
    };

    loadProject();
  }, [projectId, getProjectById]);

  if (isLoading) {
    return <div className="p-4">Carregando projeto...</div>;
  }

  if (!currentProject) {
    return <div className="p-4">Projeto não encontrado.</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{currentProject.name}</h1>
          <p className="text-muted-foreground">
            {currentProject.description || "Visão geral do projeto"}
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Configurações
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 desde ontem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Agentes Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">3 online agora</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atividade</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89%</div>
            <p className="text-xs text-muted-foreground">Última semana</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Badge variant="secondary">
                  <GitBranch className="w-3 h-3 mr-1" />
                  commit
                </Badge>
                <span className="text-sm">Nova funcionalidade adicionada</span>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="outline">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  chat
                </Badge>
                <span className="text-sm">Discussão sobre arquitetura</span>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="destructive">
                  <FileText className="w-3 h-3 mr-1" />
                  issue
                </Badge>
                <span className="text-sm">Bug reportado no módulo X</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status dos Agentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Code Reviewer</span>
                <Badge variant="default">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Assistant</span>
                <Badge variant="default">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Developer</span>
                <Badge variant="secondary">Away</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/project/$projectId/")({
  component: ProjectIndexPage,
});
