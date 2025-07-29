import { UniversalChat } from "./universal-chat";
import type {
  SelectConversation,
  AuthenticatedUser,
  SelectMessage,
} from "@/renderer/types/chat.types";

interface ConversationChatProps {
  conversationId: string;
  conversation: SelectConversation & {
    messages: SelectMessage[];
    archivedAt?: Date | null;
  };
  availableUsers: unknown[];
  currentUser: AuthenticatedUser | null;
  className?: string;
}

export function ConversationChat(props: ConversationChatProps) {
  const { conversation, availableUsers, currentUser, className } = props;

  if (!currentUser) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Authentication required</p>
      </div>
    );
  }

  // Determine chat type based on conversation type field or fallback logic
  const chatType: "dm" | "channel" =
    conversation.type === "channel" ? "channel" : "dm";

  return (
    <UniversalChat
      chatType={chatType}
      sourceId={conversation.id}
      messages={conversation.messages || []}
      currentUser={currentUser}
      availableUsers={availableUsers}
      isArchived={!!conversation.archivedAt}
      archivedAt={conversation.archivedAt}
      className={className}
    />
  );
}
