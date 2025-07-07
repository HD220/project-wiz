import { useIpcQuery } from "@/ui/hooks/ipc/use-ipc-query.hook";

import { IPC_CHANNELS } from "@/shared/ipc-channels.constants";
import type { GetDMConversationsListResponse } from "@/shared/ipc-types/chat.types";

const GET_SIDEBAR_CONVERSATIONS_CHANNEL = IPC_CHANNELS.GET_DM_CONVERSATIONS_LIST;

export function useSidebarConversations() {
  const {
    data: sidebarConversations,
    isLoading: isLoadingSidebarConvs,
    error: sidebarConvsError,
  } = useIpcQuery<GetDMConversationsListResponse>(
    GET_SIDEBAR_CONVERSATIONS_CHANNEL,
    undefined,
    { staleTime: 5 * 60 * 1000 },
  );

  return {
    sidebarConversations,
    isLoadingSidebarConvs,
    sidebarConvsError,
  };
}
