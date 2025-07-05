import { useIpcQuery } from "@/ui/hooks/ipc/useIpcQuery";

import { IPC_CHANNELS } from "@/shared/ipc-channels";
import type { GetDMConversationsListResponseData } from "@/shared/ipc-types";

const GET_SIDEBAR_CONVERSATIONS_CHANNEL = IPC_CHANNELS.GET_DM_CONVERSATIONS_LIST;

export function useSidebarConversations() {
  const {
    data: sidebarConversations,
    isLoading: isLoadingSidebarConvs,
    error: sidebarConvsError,
  } = useIpcQuery<GetDMConversationsListResponseData>(
    GET_SIDEBAR_CONVERSATIONS_CHANNEL,
    undefined,
    { staleTime: 5 * 60 * 1000 },
  );

  return {
    sidebarConversations: sidebarConversations?.success ? sidebarConversations.data : undefined,
    isLoadingSidebarConvs,
    sidebarConvsError,
  };
}
