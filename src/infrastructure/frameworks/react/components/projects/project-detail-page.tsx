import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { placeholderUserProjects, PlaceholderProject, placeholderProjectDetails, PlaceholderTask, PlaceholderTeamMember, getProjectDetailsPlaceholder } from "@/lib/placeholders"; // To be updated in placeholders

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
        <h1 className="text-2xl">Projeto não encontrado</h1>
        <p>O projeto com o ID '{projectId}' não foi encontrado nos dados de placeholder.</p>
        <Button onClick={() => window.history.back()} className="mt-4">Voltar</Button>
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
        <p className="text-sm text-muted-foreground mt-2">Última atualização: {new Date(project.lastUpdate).toLocaleString()}</p>
      </header>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="tasks">Tarefas</TabsTrigger>
          <TabsTrigger value="team">Equipe</TabsTrigger>
          <TabsTrigger value="discussions">Discussões</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Detalhes do Projeto</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <p><strong>ID do Projeto:</strong> {project.id}</p>
              <p><strong>Nome:</strong> {project.name}</p>
              <p><strong>Descrição Completa:</strong> {project.description}</p>
              {/* Add more detailed overview fields if necessary */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Tarefas do Projeto</CardTitle></CardHeader>
            <CardContent>
              {details && details.tasks.length > 0 ? (
                <ul className="space-y-3">
                  {details.tasks.map(task => (
                    <li key={task.id} className="p-3 border rounded-md flex justify-between items-center hover:bg-muted/50">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground">{task.assignedTo} - Prioridade: {task.priority}</p>
                      </div>
                      <Badge variant={task.status === "Concluída" ? "default" : "outline"}
                             className={`${task.status === "Concluída" ? "bg-green-500 text-white" : ""}`}>
                        {task.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">Nenhuma tarefa definida para este projeto.</p>
              )}
            </CardContent>
            <CardFooter>
                <Button variant="outline">Adicionar Tarefa</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Membros da Equipe</CardTitle></CardHeader>
            <CardContent>
              {details && details.teamMembers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {details.teamMembers.map(member => (
                    <Card key={member.id} className="p-4 flex flex-col items-center text-center">
                      <Avatar className="w-16 h-16 mb-2">
                        <AvatarImage src={member.avatarUrl} alt={member.name} />
                        <AvatarFallback>{member.name.substring(0,2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <p className="font-semibold">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum membro da equipe atribuído a este projeto.</p>
              )}
            </CardContent>
             <CardFooter>
                <Button variant="outline">Gerenciar Equipe</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="discussions" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Discussões</CardTitle></CardHeader>
            <CardContent>
              {/* Placeholder for ChatThread or similar component */}
              <p className="text-muted-foreground">Funcionalidade de discussão a ser implementada. (Poderia usar o ChatThread aqui)</p>
              <div className="mt-4 p-6 border rounded-md h-64 bg-muted/20 flex items-center justify-center">
                 <p>Área de Chat/Discussão</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
