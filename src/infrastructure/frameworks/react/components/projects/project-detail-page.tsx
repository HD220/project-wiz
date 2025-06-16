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
          <Card>
            <CardHeader><CardTitle><Trans>Detalhes do Projeto</Trans></CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <p><strong><Trans>ID do Projeto:</Trans></strong> {project.id}</p>
              <p><strong><Trans>Nome:</Trans></strong> {project.name}</p>
              <p><strong><Trans>Descrição Completa:</Trans></strong> {project.description}</p>
              {/* Add more detailed overview fields if necessary */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <Card>
            <CardHeader><CardTitle><Trans>Tarefas do Projeto</Trans></CardTitle></CardHeader>
            <CardContent>
              {details && details.tasks.length > 0 ? (
                <ul className="space-y-3">
                  {details.tasks.map(task => (
                    <li key={task.id} className="p-3 border rounded-md flex justify-between items-center hover:bg-muted/50">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground">{task.assignedTo} - <Trans>Prioridade:</Trans> {task.priority}</p>
                      </div>
                      <Badge variant={task.status === "Concluída" ? "default" : "outline"}
                             className={`${task.status === "Concluída" ? "bg-green-500 text-white" : ""}`}>
                        {task.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground"><Trans>Nenhuma tarefa definida para este projeto.</Trans></p>
              )}
            </CardContent>
            <CardFooter>
                <Button variant="outline"><Trans>Adicionar Tarefa</Trans></Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-4">
          <Card>
            <CardHeader><CardTitle><Trans>Membros da Equipe</Trans></CardTitle></CardHeader>
            <CardContent>
              {details && details.teamMembers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {details.teamMembers.map(member => (
                    <Card key={member.id} className="p-4 flex flex-col items-center text-center">
                      <Avatar className="w-16 h-16 mb-2">
                        <AvatarImage src={member.avatarUrl} alt={member.name} />
                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <p className="font-semibold">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground"><Trans>Nenhum membro da equipe atribuído a este projeto.</Trans></p>
              )}
            </CardContent>
             <CardFooter>
                <Button variant="outline"><Trans>Gerenciar Equipe</Trans></Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="discussions" className="mt-4">
          <Card>
            <CardHeader><CardTitle><Trans>Discussões</Trans></CardTitle></CardHeader>
            <CardContent>
              {/* Placeholder for ChatThread or similar component */}
              <p className="text-muted-foreground"><Trans>Funcionalidade de discussão a ser implementada. (Poderia usar o ChatThread aqui)</Trans></p>
              <div className="mt-4 p-6 border rounded-md h-64 bg-muted/20 flex items-center justify-center">
                 <p><Trans>Área de Chat/Discussão</Trans></p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
