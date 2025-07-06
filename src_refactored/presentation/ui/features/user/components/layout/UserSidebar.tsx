import { useRouter } from '@tanstack/react-router';
import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';

// UI - Components
import type { DirectMessageItem } from "@/core/domain/entities/chat";

import { ScrollArea } from '@/ui/components/ui/scroll-area';
// UI - Hooks
import { useIpcSubscription } from '@/ui/hooks/ipc/useIpcSubscription';

// Shared
import { IPC_CHANNELS } from '@/shared/ipc-channels';
import type { GetDMConversationsListResponse, DMConversationsUpdatedEventPayload } from '@/shared/ipc-types/chat.types';

// Parts for this component
import {
  DMList,
  DMSearchCreate,
  UserProfileDropdown,
} from './UserSidebarParts';


export function UserSidebar() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: dmConversations, isLoading, error } = useIpcSubscription<
    void,
    GetDMConversationsListResponse,
    DMConversationsUpdatedEventPayload
  >(
    IPC_CHANNELS.GET_DM_CONVERSATIONS_LIST,
    undefined,
    IPC_CHANNELS.DM_CONVERSATION_UPDATED_EVENT,
    {
      getSnapshot: (_prevData, eventPayload) => eventPayload,
      onError: (err) => {
        toast.error(`Erro ao carregar DMs: ${err.message}`);
      }
    }
  );

  const [selectedDmId, setSelectedDmId] = useState<string | null>(() => {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const dmPathMatch = currentPath.match(/\/user\/dm\/([^/]+)/);
    return dmPathMatch ? dmPathMatch[1] : null;
  });

  useEffect(() => {
    if (dmConversations && dmConversations.length > 0) {
      const currentSelectionExists = dmConversations.some(dm => dm.id === selectedDmId);
      if (!currentSelectionExists && !selectedDmId) {
        setSelectedDmId(dmConversations[0].id);
      } else if (!currentSelectionExists && selectedDmId) {
         setSelectedDmId(dmConversations[0].id);
      }
    } else if (dmConversations && dmConversations.length === 0) {
        setSelectedDmId(null);
    }
  }, [dmConversations, selectedDmId]);

  const filteredDMs = useMemo(() => {
    if (!dmConversations) return [];
    return dmConversations.filter((dm: DirectMessageItem) =>
      dm.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [dmConversations, searchTerm]);

  const handleNewDm = () => {
    toast.info("Funcionalidade 'Nova Mensagem Direta' ainda não implementada.");
  };

  return (
    <aside className="w-72 flex-shrink-0 bg-slate-100 dark:bg-slate-800/70 flex flex-col border-r border-slate-200 dark:border-slate-700 h-full">
      <div className="p-3 border-b border-slate-200 dark:border-slate-700">
        <UserProfileDropdown router={router} />
      </div>

      <DMSearchCreate searchTerm={searchTerm} onSearchTermChange={setSearchTerm} onNewDm={handleNewDm} />

      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-0.5">
          <DMList
            isLoading={isLoading}
            error={error}
            filteredDMs={filteredDMs}
            selectedDmId={selectedDmId}
            searchTerm={searchTerm}
            onSelectDm={setSelectedDmId}
          />
        </nav>
      </ScrollArea>
    </aside>
  );
}
