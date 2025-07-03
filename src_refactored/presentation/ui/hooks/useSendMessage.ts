import { toast } from 'sonner';

import { useIpcMutation } from '@/ui/hooks/ipc/useIpcMutation';

import { IPC_CHANNELS } from '@/shared/ipc-channels';
import type {
  SendDMMessageRequest as SendConversationMessageRequest,
  SendDMMessageResponseData as SendConversationMessageResponseData,
  IPCResponse,
} from '@/shared/ipc-types';

const SEND_CONVERSATION_MESSAGE_CHANNEL = IPC_CHANNELS.SEND_DM_MESSAGE;

interface UseSendMessageProps {
  selectedConversationId: string | undefined;
}

export function useSendMessage({ selectedConversationId }: UseSendMessageProps) {
  const sendMessageMutation = useIpcMutation<
    SendConversationMessageRequest,
    IPCResponse<SendConversationMessageResponseData>
  >(SEND_CONVERSATION_MESSAGE_CHANNEL, {
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(
          `Falha ao enviar mensagem: ${response.error?.message || 'Erro desconhecido.'}`, 
        );
      }
    },
    onError: (error) => {
      toast.error(`Erro ao enviar mensagem: ${error.message}`);
    },
  });

  const handleSendMessage = (content: string): void => {
    if (!selectedConversationId) {
      toast.error('Nenhuma conversa selecionada.');
      return;
    }
    if (sendMessageMutation.isLoading) {
      toast.info('Aguarde o envio da mensagem anterior.');
      return;
    }
    sendMessageMutation.mutate({
      conversationId: selectedConversationId,
      content,
    });
  };

  return { handleSendMessage, sendMessageMutation };
}
