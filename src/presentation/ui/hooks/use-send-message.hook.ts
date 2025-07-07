import { toast } from 'sonner';

import { useIpcMutation } from '@/ui/hooks/ipc/use-ipc-mutation.hook';

import { IPC_CHANNELS } from '@/shared/ipc-channels.constants';
import type {
  SendDMMessageRequest as SendConversationMessageRequest,
  SendDMMessageResponse as SendConversationMessageResponse,
} from '@/shared/ipc-types/chat.types';

const SEND_CONVERSATION_MESSAGE_CHANNEL = IPC_CHANNELS.SEND_DM_MESSAGE;

interface UseSendMessageProps {
  selectedConversationId: string | undefined;
}

export function useSendMessage({ selectedConversationId }: UseSendMessageProps) {
  const sendMessageMutation = useIpcMutation<
    SendConversationMessageResponse,
    SendConversationMessageRequest
  >(SEND_CONVERSATION_MESSAGE_CHANNEL, {
    onSuccess: (data) => {
      // Data is already unwrapped by the hook
      console.log("Message sent, response data:", data);
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
    if (sendMessageMutation.isPending) {
      toast.info('Aguarde o envio da mensagem anterior.');
      return;
    }
    sendMessageMutation.mutate({
      dmId: selectedConversationId,
      content,
      // Placeholder for actual user ID
      senderId: "current-user-id",
    });
  };

  return { handleSendMessage, sendMessageMutation };
}
