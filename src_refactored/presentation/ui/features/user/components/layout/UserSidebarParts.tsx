import { Link, useRouter } from '@tanstack/react-router';
import { Settings, UserCircle, MessageSquarePlus, Search, Palette, Bot as BotIcon, Loader2, AlertTriangle } from 'lucide-react';
import React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/ui/components/ui/avatar';
import { Button } from '@/ui/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/components/ui/dropdown-menu';
import { Input } from '@/ui/components/ui/input';
import { cn } from '@/ui/lib/utils';

import type { DirectMessageItem } from '@/shared/ipc-types';

// This mock is used by UserProfileDropdown, so it's included here.
// If it were used by UserSidebar directly for other purposes, it might stay there or be passed as prop.
const currentUserMock = {
  name: 'J. Doe',
  email: 'j.doe@example.com',
  avatarUrl: '/avatars/user-main.png',
};

// Helper component for individual DM items
export interface DMListItemProps {
  dm: DirectMessageItem;
  selectedDmId: string | null;
  onSelectDm: (id: string) => void;
}

export function DMListItem({ dm, selectedDmId, onSelectDm }: DMListItemProps) {
  return (
    <Link
      key={dm.id}
      to="/app/user/dm/$conversationId"
      params={{ conversationId: dm.id }}
      className={cn(
        "flex items-center gap-2.5 p-2 rounded-md text-left transition-colors group",
        selectedDmId === dm.id
          ? "bg-sky-100 dark:bg-sky-700/60 text-sky-700 dark:text-sky-200 font-medium"
          : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/50"
      )}
      onClick={() => onSelectDm(dm.id)}
      activeProps={{ className: "!bg-sky-100 dark:!bg-sky-700/60 !text-sky-700 dark:!text-sky-200 font-medium" }}
    >
      <Avatar className="h-7 w-7 text-xs flex-shrink-0">
        <AvatarImage src={dm.avatarUrl} alt={dm.name} />
        <AvatarFallback className={cn(
          "text-white",
          dm.type === 'agent' ? "bg-emerald-500" : "bg-purple-500"
        )}>
          {dm.type === 'agent' ? <BotIcon size={14}/> : dm.name.substring(0,1).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium truncate group-hover:text-slate-800 dark:group-hover:text-slate-100">{dm.name}</span>
          {dm.timestamp && <span className="text-[10px] text-slate-400 dark:text-slate-500 flex-shrink-0">{dm.timestamp}</span>}
        </div>
        <div className="flex justify-between items-center">
          {dm.lastMessage && <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{dm.lastMessage}</p>}
          {dm.unreadCount && dm.unreadCount > 0 && (
            <span className="ml-auto text-[10px] bg-red-500 text-white font-semibold rounded-full px-1.5 py-0.5 leading-none">
              {dm.unreadCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// Helper component for rendering the list of DMs
export interface DMListProps {
  isLoading: boolean;
  error: Error | null;
  filteredDMs: DirectMessageItem[];
  selectedDmId: string | null;
  searchTerm: string;
  onSelectDm: (id: string) => void;
}

export function DMList({ isLoading, error, filteredDMs, selectedDmId, searchTerm, onSelectDm }: DMListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-4 text-xs text-slate-500 dark:text-slate-400 h-full">
        <Loader2 className="h-6 w-6 animate-spin mb-2" />
        Carregando conversas...
      </div>
    );
  }

  if (error) {
    return (
       <div className="flex flex-col items-center justify-center p-4 text-xs text-red-600 dark:text-red-400 h-full">
        <AlertTriangle className="h-6 w-6 mb-2" />
        <span>Erro ao carregar DMs.</span>
      </div>
    );
  }

  if (!filteredDMs || filteredDMs.length === 0) {
    return (
      <p className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
        {searchTerm ? "Nenhuma conversa encontrada." : "Sem mensagens diretas ainda."}
      </p>
    );
  }

  return filteredDMs.map((dm) => (
    <DMListItem key={dm.id} dm={dm} selectedDmId={selectedDmId} onSelectDm={onSelectDm} />
  ));
}

// Helper component for User Profile Dropdown
export interface UserProfileDropdownProps {
  router: ReturnType<typeof useRouter>;
}

export function UserProfileDropdown({ router }: UserProfileDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start items-center h-auto px-1 py-1">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={currentUserMock.avatarUrl} alt={currentUserMock.name} />
            <AvatarFallback>{currentUserMock.name.substring(0,1).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold truncate text-slate-800 dark:text-slate-100">{currentUserMock.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentUserMock.email}</p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 ml-1" align="start" side="bottom">
        <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.navigate({ to: '/app/settings/profile' })}>
          <UserCircle className="mr-2 h-4 w-4" /> Perfil
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.navigate({ to: '/app/settings/appearance' })}>
          <Palette className="mr-2 h-4 w-4" /> Aparência
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.navigate({ to: '/app/settings' })}>
          <Settings className="mr-2 h-4 w-4" /> Todas Configurações
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-500 focus:text-red-500 dark:focus:text-red-500">
          Sair (Logout - N/I)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Helper component for DM Search and Create button
export interface DMSearchCreateProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onNewDm: () => void;
}

export function DMSearchCreate({ searchTerm, onSearchTermChange, onNewDm }: DMSearchCreateProps) {
  return (
    <div className="p-3 space-y-2 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
      <Button variant="outline" size="sm" className="w-full" onClick={onNewDm}>
        <MessageSquarePlus className="mr-2 h-4 w-4" /> Nova Mensagem Direta
      </Button>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
        <Input
          type="search"
          placeholder="Buscar DMs ou iniciar nova..."
          className="h-8 pl-9"
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
        />
      </div>
    </div>
  );
}
