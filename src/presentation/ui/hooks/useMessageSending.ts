import { toast } from "sonner";

import type { DirectMessageItem } from "@/core/domain/entities/chat";

import { useIpcMutation } from "@/ui/hooks/ipc/useIpcMutation";

import { IPC_CHANNELS } from "@/shared/ipc-channels";
import type { SendDMMessageRequest, SendDMMessageResponse } from "@/shared/ipc-types/chat.types";

interface UseMessageSendingProps {
  conversationId: string;
  conversationDetails: DirectMessageItem | null | undefined;
}

export function useMessageSending({
  conversationId,
  conversationDetails,
}: UseMessageSendingProps) {
  const sendMessageMutation = useIpcMutation<
    SendDMMessageResponse,
    SendDMMessageRequest
  >(IPC_CHANNELS.SEND_DM_MESSAGE, {
    onSuccess: (data) => {
      console.log("Message sent, response data:", data);
    },
    onError: (error) => {
      toast.error(`Falha ao enviar mensagem: ${error.message}`);
    },
  });

  const handleSendMessage = (content: string) => {
    if (!conversationDetails) {
      toast.error("Detalhes da conversa não encontrados para enviar mensagem.");
      return;
    }
    if (sendMessageMutation.isPending) {
      toast.info("Aguarde o envio da mensagem anterior.");
      return;
    }
    // Assuming currentUserId is available in the context or passed as prop
    sendMessageMutation.mutate({ dmId: conversationId, content, senderId: "current-user-id" });
  };

  return { handleSendMessage, sendMessageMutation };
}
