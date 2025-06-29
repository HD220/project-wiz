import { createFileRoute, Link } from '@tanstack/react-router';
import { MessageSquareText, Settings, UserCircle, Activity, Users, Bot as BotIcon } from 'lucide-react';
import React from 'react';

import { Avatar, AvatarFallback } from '@/presentation/ui/components/ui/avatar'; // AvatarImage not used in this version
import { Button } from '@/presentation/ui/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/ui/components/ui/card';

// Mock data for quick stats or recent activity (can be expanded)
const userStatsMock = {
  unreadDms: 3, // From mockDirectMessages in UserSidebar
  activeAgents: 2, // From mockDirectMessages filtering agents
  projectsInvolved: 3, // Example
};

// Define a more specific type for Link 'to' props for type safety with TanStack Router
type RecentActivityLink =
  | '/user/dm/$conversationId'
  | '/projects/$projectId'
  | '/settings/llm'
  | '/settings/appearance'
  | '/settings/profile'
  | '/settings';

// Define a more specific type for the `params` prop of the Link component
// This helps satisfy the `no-explicit-any` ESLint rule.
// It's a union of possible parameter objects for the links in recentUserActivityMock.
type ActivityLinkParams =
  | { conversationId: string }
  | { projectId: string }
  | undefined; // For links that don't have params like /settings/appearance

const recentUserActivityMock: {id: string, text: string, time: string, type: string, linkTo: RecentActivityLink, icon: React.ElementType, params?: ActivityLinkParams}[] = [
    {id: '1', text: "Nova mensagem de CoderBot-Alpha.", time: "5m atrás", type: "dm", linkTo: "/user/dm/$conversationId", params: {conversationId: 'agent001'}, icon: BotIcon},
    {id: '2', text: "Alice (Designer) enviou uma nova mensagem.", time: "10m atrás", type: "dm", linkTo: "/user/dm/$conversationId", params: {conversationId: 'userAlice'}, icon: UserCircle},
    {id: '3', text: "Você atualizou suas configurações de Aparência.", time: "3h atrás", type: "settings", linkTo: "/settings/appearance", icon: Settings}, // No params needed
    {id: '4', text: "Nova atividade no Projeto Phoenix.", time: "1d atrás", type: "project", linkTo: "/projects/$projectId", params: {projectId: 'mockId1'}, icon: Activity},
];


function UserIndexPage() {
  // This page is the default content shown when navigating to /user/
  // It serves as a user-specific dashboard or landing spot within their personal area.

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto bg-slate-50 dark:bg-slate-800/20">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">
          Sua Área Pessoal
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Bem-vindo! Gerencie suas conversas diretas, acompanhe atividades e acesse suas configurações.
        </p>
      </header>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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
            <CardTitle className="text-sm font-medium">Agentes Contatados</CardTitle>
            <BotIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStatsMock.activeAgents}</div>
            <p className="text-xs text-muted-foreground">Com quem você interagiu</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow md:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Projetos Envolvidos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" /> {/* Changed icon to Users */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStatsMock.projectsInvolved}</div>
            <p className="text-xs text-muted-foreground">Que você participa</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions / Links */}
        <div className="lg:col-span-1 space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Acesso Rápido</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col space-y-2">
                    <Button variant="outline" asChild className="justify-start text-left">
                        <Link to="/user/dm/$conversationId" params={{conversationId: 'agent001'}}>
                            <MessageSquareText className="mr-2 h-4 w-4 text-sky-500"/>
                            Conversar com CoderBot
                        </Link>
                    </Button>
                    <Button variant="outline" asChild className="justify-start text-left">
                        <Link to="/settings/profile">
                            <UserCircle className="mr-2 h-4 w-4 text-green-500"/>
                            Editar Meu Perfil
                        </Link>
                    </Button>
                     <Button variant="outline" asChild className="justify-start text-left">
                        <Link to="/settings">
                            <Settings className="mr-2 h-4 w-4 text-slate-500"/>
                            Ver Todas Configurações
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>

        {/* Recent Activity Feed */}
        <div className="lg:col-span-2">
            <Card>
            <CardHeader>
                <CardTitle  className="text-lg">Atividade Recente</CardTitle>
                <CardDescription>Suas últimas interações e notificações importantes.</CardDescription>
            </CardHeader>
            <CardContent>
                {recentUserActivityMock.length > 0 ? (
                    <ul className="space-y-3">
                        {recentUserActivityMock.map(activity => {
                            const Icon = activity.icon;
                            return (
                            <li key={activity.id} className="flex items-start space-x-3 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                <Avatar className="h-8 w-8 mt-0.5">
                                    <AvatarFallback className="bg-slate-200 dark:bg-slate-700">
                                        <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400"/>
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                <Link
                                    to={activity.linkTo}
                                    params={activity.params as any} // Using 'as any' here to bypass strict param typing for demo
                                    className="hover:underline text-sm text-slate-700 dark:text-slate-200"
                                >
                                    {activity.text}
                                </Link>
                                <span className="block text-xs text-slate-500 dark:text-slate-400">{activity.time}</span>
                                </div>
                            </li>
                        )})}
                    </ul>
                ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">Nenhuma atividade recente para mostrar.</p>
                )}
            </CardContent>
            </Card>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Para iniciar uma nova conversa, use a barra lateral à esquerda.
        </p>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/(app)/user/')({
  component: UserIndexPage,
});
