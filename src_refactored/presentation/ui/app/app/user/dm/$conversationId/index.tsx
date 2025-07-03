import { createFileRoute, useParams, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Loader2, ServerCrash } from "lucide-react";
import React, { useMemo } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ChatWindow } from "@/ui/features/chat/components/ChatWindow";
import { useIpcMutation } from "@/ui/hooks/ipc/useIpcMutation";
import { useIpcQuery } from "@/ui/hooks/ipc/useIpcQuery";
import { useIpcSubscription } from "@/ui/hooks/ipc/useIpcSubscription";

import { IPC_CHANNELS } from "@/shared/ipc-channels";
import type {
  DirectMessageItem,
  GetDMMessagesRequest,
  GetDMMessagesResponseData,
  DMMessageReceivedEventPayload,
  GetDMConversationsListResponseData,
  SendDMMessageRequest,
  SendDMMessageResponseData,
  IPCResponse,
} from "@/shared/ipc-types";

interface ChatWindowConversationHeader {
  id: string;
  name: string;
  type: "dm" | "channel" | "agent";
  avatarUrl?: string;
}

const currentUserId = "userJdoe";

interface DirectMessageContentProps {
  isLoading: boolean;
  error: Error | null;
  conversationId: string;
  conversationDetails: DirectMessageItem | null;
  messages: GetDMMessagesResponseData | null | undefined;
  isLoadingMessages: boolean;
  onSendMessage: (content: string) => void;
  currentUserId: string;
  router: ReturnType<typeof useRouter>;
}

function DirectMessageContent({
  isLoading,
  error,
  conversationId,
  conversationDetails,
  messages,
  isLoadingMessages,
  onSendMessage,
  currentUserId,
  router,
}: DirectMessageContentProps) {
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" /> Carregando
        conversa...
      </div>
    );
  }

  if (error) {
    const errorToShow = error;
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-red-50 dark:bg-red-900/10 rounded-lg">
        <ServerCrash className="h-12 w-12 text-red-500 dark:text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">
          Erro ao Carregar Conversa
        </h2>
        <p className="text-sm text-red-600 dark:text-red-400 mb-1">
          {errorToShow?.message}
        </p>
        <Button
          onClick={() => router.navigate({ to: "/user/" })}
          variant="destructive"
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para DMs
        </Button>
      </div>
    );
  }

  if (!conversationDetails) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900">
        <ServerCrash className="h-12 w-12 text-slate-500 dark:text-slate-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Conversa não encontrada</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Não foi possível encontrar detalhes para a conversa com ID:{" "}
          {conversationId}.
        </p>
        <Button
          onClick={() => router.navigate({ to: "/user/" })}
          variant="outline"
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para DMs
        </Button>
      </div>
    );
  }

  const chatWindowConversationHeader: ChatWindowConversationHeader = {
    id: conversationDetails.id,
    name: conversationDetails.name,
    type:
      conversationDetails.type === "agent" ? "dm" : conversationDetails.type,
    avatarUrl: conversationDetails.avatarUrl,
  };

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      <ChatWindow
        conversation={chatWindowConversationHeader}
        messages={messages || []}
        onSendMessage={onSendMessage}
        isLoading={isLoadingMessages}
        currentUserId={currentUserId}
      />
    </div>
  );
}

function DirectMessagePage() {
  const params = useParams({ from: "/(app)/user/dm/$conversationId/" });
  const conversationId = params.conversationId;
  const router = useRouter();

  const {
    data: dmConversations,
    isLoading: isLoadingConvList,
    error: convListError,
  } = useIpcQuery<null, GetDMConversationsListResponseData>(
    IPC_CHANNELS.GET_DM_CONVERSATIONS_LIST,
    null,
    { staleTime: 5 * 60 * 1000 }
  );

  const conversationDetails: DirectMessageItem | null = useMemo(() => {
    if (!dmConversations) return null;
    return dmConversations.find((conv) => conv.id === conversationId) || null;
  }, [dmConversations, conversationId]);

  const {
    data: messages,
    isLoading: isLoadingMessages,
    error: messagesError,
  } = useIpcSubscription<
    GetDMMessagesRequest,
    GetDMMessagesResponseData,
    DMMessageReceivedEventPayload
  >(
    IPC_CHANNELS.GET_DM_MESSAGES,
    { conversationId },
    IPC_CHANNELS.DM_MESSAGE_RECEIVED_EVENT,
    {
      getSnapshot: (prevMessages, eventPayload) => {
        if (eventPayload.conversationId === conversationId) {
          if (prevMessages?.find((msg) => msg.id === eventPayload.message.id)) {
            return prevMessages;
          }
          return [...(prevMessages || []), eventPayload.message];
        }
        return prevMessages || [];
      },
      onError: (err) => {
        toast.error(`Erro na subscrição de mensagens: ${err.message}`);
      },
    }
  );

  const sendMessageMutation = useIpcMutation<
    SendDMMessageRequest,
    IPCResponse<SendDMMessageResponseData>
  >(IPC_CHANNELS.SEND_DM_MESSAGE, {
    onSuccess: (response) => {
      if (response.success && response.data) {
        console.log("Message sent, response data:", response.data);
      } else {
        toast.error(
          `Falha ao enviar mensagem: ${response.error?.message || "Erro desconhecido retornando sucesso."}`
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

  const isLoading = isLoadingMessages || isLoadingConvList;
  const combinedError = messagesError || convListError;

  return (
    <DirectMessageContent
      isLoading={isLoading}
      error={combinedError}
      conversationId={conversationId}
      conversationDetails={conversationDetails}
      messages={messages}
      isLoadingMessages={isLoadingMessages}
      onSendMessage={handleSendMessage}
      currentUserId={currentUserId}
      router={router}
    />
  );
}

export const Route = createFileRoute("/app/user/dm/$conversationId/")({
  component: DirectMessagePage,
});
