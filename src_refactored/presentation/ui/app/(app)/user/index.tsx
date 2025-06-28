import { createFileRoute, Link } from '@tanstack/react-router';
import { MessageSquareText, Settings, UserCircle, Activity } from 'lucide-react';
import React from 'react';

import { Button } from '@/presentation/ui/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/ui/components/ui/card';

// Mock data for quick stats or recent activity
const userStatsMock = {
  unreadDms: 3,
  activeAgents: 2,
  recentProjectActivities: 5,
};

const recentActivityMock = [
    {id: '1', text: "Nova mensagem de CoderBot-Alpha.", time: "5m atrás", type: "dm", linkTo: "/user/dm/agent001"},
    {id: '2', text: "Tarefa 'Refatorar API' concluída no Projeto Phoenix.", time: "1h atrás", type: "project", linkTo: "/projects/mockId1"},
    {id: '3', text: "Você atualizou suas configurações de LLM.", time: "3h atrás", type: "settings", linkTo: "/settings/llm"},
];


function UserIndexPage() {
  // This page is the default content shown when navigating to /user/
  // before a specific DM or user setting sub-page is selected.

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">
          Sua Área Pessoal
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Bem-vindo! Gerencie suas conversas, configurações e atividades.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Não Lidas</CardTitle>
            <MessageSquareText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStatsMock.unreadDms}</div>
            <p className="text-xs text-muted-foreground">Em suas DMs</p>
          </CardContent>
        </Card>
         <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Agentes Ativos</CardTitle>
            <UserCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStatsMock.activeAgents}</div>
            <p className="text-xs text-muted-foreground">Atualmente em execução</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow md:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Atividade em Projetos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStatsMock.recentProjectActivities}</div>
            <p className="text-xs text-muted-foreground">Atualizações recentes nos seus projetos</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Rápido</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Button variant="outline" asChild className="justify-start text-left h-auto py-2">
                <Link to="/user/dm/$conversationId" params={{conversationId: 'agent001'}}> {/* Example DM link */}
                    <MessageSquareText className="mr-2 h-4 w-4 text-sky-500"/>
                    <div>
                        <span className="font-medium">Conversar com Agentes</span>
                        <p className="text-xs text-muted-foreground">Ver suas DMs</p>
                    </div>
                </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start text-left h-auto py-2">
                <Link to="/settings/profile">
                    <UserCircle className="mr-2 h-4 w-4 text-green-500"/>
                     <div>
                        <span className="font-medium">Meu Perfil</span>
                        <p className="text-xs text-muted-foreground">Editar seus dados</p>
                    </div>
                </Link>
            </Button>
             <Button variant="outline" asChild className="justify-start text-left h-auto py-2">
                <Link to="/settings">
                    <Settings className="mr-2 h-4 w-4 text-slate-500"/>
                     <div>
                        <span className="font-medium">Configurações</span>
                        <p className="text-xs text-muted-foreground">Ajustes da aplicação</p>
                    </div>
                </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente do Usuário (Placeholder)</CardTitle>
            <CardDescription>Suas últimas ações e notificações importantes.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivityMock.length > 0 ? (
                 <ul className="space-y-3">
                    {recentActivityMock.map(activity => (
                        <li key={activity.id} className="text-sm text-slate-700 dark:text-slate-300">
                            {/* Correctly type 'to' prop for TanStack Router Link */}
                            <Link to={activity.linkTo as '/user/dm/$conversationId' | '/projects/$projectId' | '/settings/llm'} className="hover:underline">
                                {activity.text}
                            </Link>
                            <span className="block text-xs text-slate-500 dark:text-slate-400">{activity.time}</span>
                        </li>
                    ))}
                 </ul>
            ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma atividade recente para mostrar.</p>
            )}
          </CardContent>
        </Card>
      </div>


      <div className="mt-10 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Selecione uma conversa na barra lateral esquerda para visualizar suas mensagens diretas.
        </p>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/(app)/user/')({
  component: UserIndexPage,
});
