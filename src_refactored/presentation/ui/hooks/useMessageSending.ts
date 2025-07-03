import { toast } from "sonner";

import { useIpcMutation } from "@/ui/hooks/ipc/useIpcMutation";

import { IPC_CHANNELS } from "@/shared/ipc-channels";
import type {
  SendDMMessageRequest,
  SendDMMessageResponseData,
  IPCResponse,
  DirectMessageItem,
} from "@/shared/ipc-types";

interface UseMessageSendingProps {
  conversationId: string;
  conversationDetails: DirectMessageItem;
}

export function useMessageSending({
  conversationId,
  conversationDetails,
}: UseMessageSendingProps) {
  const sendMessageMutation = useIpcMutation<
    SendDMMessageRequest,
    IPCResponse<SendDMMessageResponseData>
  >(IPC_CHANNELS.SEND_DM_MESSAGE, {
    onSuccess: (response) => {
      if (response.success && response.data) {
        console.log("Message sent, response data:", response.data);
      } else {
        toast.error(
          `Falha ao enviar mensagem: ${response.error?.message || "Erro desconhecido retornando sucesso."}`,
        );
      }
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
    if (sendMessageMutation.isLoading) {
      toast.info("Aguarde o envio da mensagem anterior.");
      return;
    }
    sendMessageMutation.mutate({ conversationId, content });
  };

  return { handleSendMessage, sendMessageMutation };
}
