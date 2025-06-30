import { createFileRoute } from '@tanstack/react-router';
import { Activity, Briefcase, Zap } from 'lucide-react';
import React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/presentation/ui/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/presentation/ui/components/ui/card';

function DashboardPage() {
  const stats = {
    activeProjects: 3,
    runningAgents: 5,
    tasksCompletedToday: 12,
  };

  const recentActivities = [
    { id: '1', user: 'Alice', action: 'iniciou um novo job em "Projeto Phoenix"', time: '5m atrás', avatar: '/avatars/01.png' },
    { id: '2', user: 'Agente Coder', action: 'completou a tarefa "Refatorar API"', time: '15m atrás', avatar: '/avatars/agent.png' },
    { id: '3', user: 'Bob', action: 'adicionou uma nova Persona "QA Master"', time: '1h atrás', avatar: '/avatars/02.png' },
  ];

  const user = {
    name: 'J. Doe',
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Bem-vindo de volta, {user.name}!
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Aqui está um resumo da sua fábrica de software autônoma.
        </p>
      </header>

      {/* Stats Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              +2 do que semana passada (placeholder)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agentes em Execução</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.runningAgents}</div>
            <p className="text-xs text-muted-foreground">
              +1 desde ontem (placeholder)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Concluídas (Hoje)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tasksCompletedToday}</div>
            <p className="text-xs text-muted-foreground">
              Total de 150 esta semana (placeholder)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              O que aconteceu recentemente na sua fábrica.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={activity.avatar} alt={`Avatar de ${activity.user}`} />
                  <AvatarFallback>{activity.user.substring(0,1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
            {recentActivities.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma atividade recente.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/(app)/dashboard/')({
  component: DashboardPage,
});
