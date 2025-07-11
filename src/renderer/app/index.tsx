import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  GitBranch, 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  MessageSquare
} from "lucide-react";
import { mockProjects, mockAgents, mockTasks } from "@/lib/placeholders";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const activeProjects = mockProjects.filter(p => p.status === 'active');
  const onlineAgents = mockAgents.filter(a => a.status !== 'offline');
  const tasksInProgress = mockTasks.filter(t => t.status === 'in-progress');
  const completedTasks = mockTasks.filter(t => t.status === 'done');

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao Project Wiz. Aqui você pode ver uma visão geral de todos os seus projetos e agentes.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 novos este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agentes Online</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onlineAgents.length}</div>
            <p className="text-xs text-muted-foreground">
              de {mockAgents.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas em Progresso</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasksInProgress.length}</div>
            <p className="text-xs text-muted-foreground">
              {completedTasks.length} concluídas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((completedTasks.length / mockTasks.length) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              +12% desde a semana passada
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="w-5 h-5" />
              Projetos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeProjects.slice(0, 3).map((project) => (
              <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={project.avatar} />
                    <AvatarFallback>
                      {project.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{project.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {project.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {project.unreadCount > 0 && (
                    <Badge variant="destructive">
                      {project.unreadCount}
                    </Badge>
                  )}
                  <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                    {project.status}
                  </Badge>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              Ver Todos os Projetos
            </Button>
          </CardContent>
        </Card>

        {/* Active Agents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Agentes Ativos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {onlineAgents.slice(0, 4).map((agent) => (
              <div key={agent.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>
                        {agent.avatar || agent.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-background rounded-full ${
                      agent.status === 'online' ? 'bg-green-500' :
                      agent.status === 'executing' ? 'bg-blue-500' :
                      agent.status === 'busy' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium">{agent.name}</h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {agent.currentTask || agent.description}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="outline" className="text-xs">
                    {agent.type}
                  </Badge>
                  {agent.isExecuting && agent.executionProgress && (
                    <div className="w-16">
                      <Progress value={agent.executionProgress} className="h-1" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              Gerenciar Agentes
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-24 flex-col gap-2">
              <GitBranch className="w-6 h-6" />
              Novo Projeto
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2">
              <Users className="w-6 h-6" />
              Criar Agente
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2">
              <CheckCircle2 className="w-6 h-6" />
              Nova Tarefa
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2">
              <MessageSquare className="w-6 h-6" />
              Chat Rápido
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
