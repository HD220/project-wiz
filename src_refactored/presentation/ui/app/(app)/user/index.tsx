import { createFileRoute, Link } from '@tanstack/react-router';
import { MessageSquareText, Settings, UserCircle, Activity, Users, Bot as BotIcon } from 'lucide-react';
import React from 'react';

// AvatarImage not used in this version
import { Avatar, AvatarFallback } from '@/presentation/ui/components/ui/avatar';
import { Button } from '@/presentation/ui/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/ui/components/ui/card';

// Mock data for quick stats or recent activity (can be expanded)
const userStatsMock = {
  // From mockDirectMessages in UserSidebar
  unreadDms: 3,
  // From mockDirectMessages filtering agents
  activeAgents: 2,
  // Example
  projectsInvolved: 3,
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
  // For links that don't have params like /settings/appearance
  | undefined;

const recentUserActivityMock: {id: string, text: string, time: string, type: string, linkTo: RecentActivityLink, icon: React.ElementType, params?: ActivityLinkParams}[] = [
    {id: '1', text: "Nova mensagem de CoderBot-Alpha.", time: "5m atrás", type: "dm", linkTo: "/user/dm/$conversationId", params: {conversationId: 'agent001'}, icon: BotIcon},
    {id: '2', text: "Alice (Designer) enviou uma nova mensagem.", time: "10m atrás", type: "dm", linkTo: "/user/dm/$conversationId", params: {conversationId: 'userAlice'}, icon: UserCircle},
    // No params needed
    {id: '3', text: "Você atualizou suas configurações de Aparência.", time: "3h atrás", type: "settings", linkTo: "/settings/appearance", icon: Settings},
    {id: '4', text: "Nova atividade no Projeto Phoenix.", time: "1d atrás", type: "project", linkTo: "/projects/$projectId", params: {projectId: 'mockId1'}, icon: Activity},
];

function UserPageHeader() {
  return (
    <header className="mb-8">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">
        Sua Área Pessoal
      </h1>
      <p className="text-slate-600 dark:text-slate-400 mt-1">
        Bem-vindo! Gerencie suas conversas diretas, acompanhe atividades e acesse suas configurações.
      </p>
    </header>
  );
}

function UserPageHeader() {
  return (
    <header className="mb-8">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">
        Sua Área Pessoal
      </h1>
      <p className="text-slate-600 dark:text-slate-400 mt-1">
        Bem-vindo! Gerencie suas conversas diretas, acompanhe atividades e acesse suas configurações.
      </p>
    </header>
  );
}

function UserQuickStats() {
  return (
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
          {/* Changed icon to Users */}
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userStatsMock.projectsInvolved}</div>
          <p className="text-xs text-muted-foreground">Que você participa</p>
        </CardContent>
      </Card>
    </div>
  );
}

function UserIndexPage() {
  // This page is the default content shown when navigating to /user/
  // It serves as a user-specific dashboard or landing spot within their personal area.

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto bg-slate-50 dark:bg-slate-800/20">
      <UserPageHeader />
      <UserQuickStats />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <UserQuickAccess />
        <UserRecentActivity />
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
