import { Link, useRouter } from '@tanstack/react-router';
import { Settings, UserCircle, MessageSquarePlus, Search, Palette, Bot as BotIcon, Loader2, AlertTriangle } from 'lucide-react'; // Added Loader2, AlertTriangle
import React, { useState, useMemo } from 'react'; // Added useMemo
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/presentation/ui/components/ui/avatar';
import { Button } from '@/presentation/ui/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/presentation/ui/components/ui/dropdown-menu';
import { Input } from '@/presentation/ui/components/ui/input';
import { ScrollArea } from '@/presentation/ui/components/ui/scroll-area';
import { useIpcSubscription } from '@/presentation/ui/hooks/ipc/useIpcSubscription';
import { cn } from '@/presentation/ui/lib/utils';

import { IPC_CHANNELS } from '@/shared/ipc-channels';
import type { DirectMessageItem, GetDMConversationsListResponseData, DMConversationsUpdatedEventPayload } from '@/shared/ipc-types'; // Using types from shared


// const mockDirectMessages: DirectMessageItem[] = [
//   { id: 'userAlice', name: 'Alice (Designer)', avatarUrl: '/avatars/01.png', lastMessage: "Hey! Viu o novo design?", timestamp: "10:30", type: 'user', unreadCount: 2 },
//   { id: 'agent001', name: 'CoderBot-Alpha', avatarUrl: '/avatars/agent-coder.png', lastMessage: "Script finalizado.", timestamp: "09:15", type: 'agent' },
//   { id: 'userBob', name: 'Bob (Backend Dev)', avatarUrl: '/avatars/02.png', lastMessage: "Preciso de ajuda com a API.", timestamp: "Ontem", type: 'user' },
//   { id: 'agent002', name: 'TestMaster-7000', avatarUrl: '/avatars/agent-qa.png', lastMessage: "Testes concluídos.", timestamp: "Segunda", type: 'agent', unreadCount: 0 },
// ];

const currentUserMock = { // This can remain as it's UI specific for current user display
  name: 'J. Doe',
  email: 'j.doe@example.com',
  avatarUrl: '/avatars/user-main.png',
};

export function UserSidebar() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: dmConversations, isLoading, error } = useIpcSubscription<
    null, // No args for initial fetch
    GetDMConversationsListResponseData, // Type for initial data
    DMConversationsUpdatedEventPayload // Type for event payload
  >(
    IPC_CHANNELS.GET_DM_CONVERSATIONS_LIST,
    null, // Args for initial fetch
    IPC_CHANNELS.DM_CONVERSATION_UPDATED_EVENT,
    {
      // getSnapshot: (currentData, eventPayload) => eventPayload, // Replace current data with payload
      // For more granular updates, one might merge or update specific items.
      // For now, assuming eventPayload is the new full list as per shared/ipc-types.ts comment.
      // If eventPayload is a single item, the getSnapshot logic would need to change.
      // Let's assume payload is the full list:
      getSnapshot: (_prevData, eventPayload) => eventPayload,
      onError: (err) => {
        toast.error(`Erro ao carregar DMs: ${err.message}`);
      }
    }
  );

  const [selectedDmId, setSelectedDmId] = useState<string | null>(() => {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const dmPathMatch = currentPath.match(/\/user\/dm\/([^/]+)/);
    // Set selectedDmId based on current route, fallback to first DM if available after loading
    return dmPathMatch ? dmPathMatch[1] : null;
  });

  // Update selectedDmId if the current selection is no longer in the list or if nothing is selected and list is available
  React.useEffect(() => {
    if (dmConversations && dmConversations.length > 0) {
      const currentSelectionExists = dmConversations.some(dm => dm.id === selectedDmId);
      if (!currentSelectionExists && !selectedDmId) { // if nothing selected and list is there
        setSelectedDmId(dmConversations[0].id);
      } else if (!currentSelectionExists && selectedDmId) { // if current selection disappeared
         setSelectedDmId(dmConversations[0].id); // select first one
      }
    } else if (dmConversations && dmConversations.length === 0) {
        setSelectedDmId(null); // No DMs, nothing to select
    }
  }, [dmConversations, selectedDmId]);


  const filteredDMs = useMemo(() => {
    if (!dmConversations) return [];
    return dmConversations.filter(dm =>
      dm.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [dmConversations, searchTerm]);

  const handleNewDm = () => {
    // This would ideally open a modal to select a user/agent or navigate to a "new DM" page
    toast.info("Funcionalidade 'Nova Mensagem Direta' ainda não implementada.");
  };

  const renderDmList = () => {
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
          {/* The hook itself already shows a toast, so a retry button might be more useful here if desired */}
          {/* <Button variant="link" size="sm" className="mt-1 text-xs" onClick={() => { /* TODO: refetch logic if hook supports it *\/ }}>Tentar novamente</Button> */}
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

    return filteredDMs.map((dm: DirectMessageItem) => (
      <Link
        key={dm.id}
        to="/user/dm/$conversationId"
        params={{ conversationId: dm.id }}
        className={cn(
          "flex items-center gap-2.5 p-2 rounded-md text-left transition-colors group",
          selectedDmId === dm.id
            ? "bg-sky-100 dark:bg-sky-700/60 text-sky-700 dark:text-sky-200 font-medium"
            : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/50"
        )}
        onClick={() => setSelectedDmId(dm.id)}
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
    ));
  };

  return (
    <aside className="w-72 flex-shrink-0 bg-slate-100 dark:bg-slate-800/70 flex flex-col border-r border-slate-200 dark:border-slate-700 h-full">
      {/* User Profile Dropdown */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-700">
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
            <DropdownMenuItem onSelect={() => router.navigate({ to: '/settings/profile' })}>
              <UserCircle className="mr-2 h-4 w-4" /> Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => router.navigate({ to: '/settings/appearance' })}>
              <Palette className="mr-2 h-4 w-4" /> Aparência
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => router.navigate({ to: '/settings' })}>
              <Settings className="mr-2 h-4 w-4" /> Todas Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500 focus:text-red-500 dark:focus:text-red-500">
              Sair (Logout - N/I)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search and New DM Button */}
      <div className="p-3 space-y-2 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
        <Button variant="outline" size="sm" className="w-full" onClick={handleNewDm}>
          <MessageSquarePlus className="mr-2 h-4 w-4" /> Nova Mensagem Direta
        </Button>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
          <Input
            type="search"
            placeholder="Buscar DMs ou iniciar nova..."
            className="h-8 pl-9"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </div>

      {/* DM List Area */}
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-0.5">
          {renderDmList()}
        </nav>
      </ScrollArea>
    </aside>
  );
}
