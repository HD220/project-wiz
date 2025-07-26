import { useEffect, useRef, useMemo } from "react";

import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { Separator } from "@/renderer/components/ui/separator";
import { ArchivedConversationBanner } from "@/renderer/features/conversation/components/archived-conversation-banner";
import { MessageBubble } from "@/renderer/features/conversation/components/message-bubble";
import { MessageInput } from "@/renderer/features/conversation/components/message-input";
import type {
  SelectConversation,
  SendMessageInput,
  SelectMessage,
} from "@/renderer/features/conversation/types";
import type { AuthenticatedUser } from "@/renderer/features/user/user.types";
import { useApiMutation } from "@/renderer/hooks/use-api-mutation.hook";

// Message type for chat component
type Message = SelectMessage & {
  senderId?: string;
  senderType?: "user" | "agent";
  metadata?: unknown;
};

interface UserBasic {
  id: string;
  name?: string;
}

interface ConversationChatProps {
  conversationId: string;
  conversation: SelectConversation & {
    messages: Message[];
    archivedAt?: Date | null;
  };
  availableUsers: unknown[];
  currentUser: AuthenticatedUser | null;
  className?: string;
}

function ConversationChat(props: ConversationChatProps) {
  const { conversation, availableUsers, currentUser, className } = props;
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Check if conversation is archived
  const isArchived = !!conversation.archivedAt;

  // Standardized mutation with automatic error handling
  const sendMessageMutation = useApiMutation(
    (input: SendMessageInput) => window.api.messages.send(input),
    {
      errorMessage: "Failed to send message",
      // No success message for chat messages (too noisy)
    },
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector(
          "[data-radix-scroll-area-viewport]",
        );
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
      }
    };

    const timeoutId = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(timeoutId);
  }, [conversation.messages?.length]);

  async function handleSendMessage(content: string) {
    if (!currentUser) return;

    sendMessageMutation.mutate({
      conversationId: conversation.id,
      authorId: currentUser.id,
      content,
    });
  }

  // Get user info by ID with enhanced logic for inactive agents
  function getUserById(userId: string) {
    if (userId === currentUser?.id) return currentUser;

    // Try to find in available users first
    const foundUser = (availableUsers as UserBasic[]).find(
      (user) => user.id === userId,
    );
    if (foundUser) return foundUser;

    // If not found, it might be an inactive agent - return null to trigger fallback
    return null;
  }

  const messageGroups = useMemo(() => {
    const groups: {
      authorId: string;
      messages: Message[];
    }[] = [];

    const uniqueMessages = conversation.messages.filter(
      (message, index, array) =>
        array.findIndex((messageItem) => messageItem.id === message.id) ===
        index,
    );

    uniqueMessages.forEach((message) => {
      const lastGroup = groups[groups.length - 1];

      if (lastGroup && lastGroup.authorId === message.authorId) {
        lastGroup.messages.push(message);
      } else {
        groups.push({
          authorId: message.authorId,
          messages: [message],
        });
      }
    });

    return groups;
  }, [conversation]);

  if (!currentUser) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Authentication required</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-background ${className || ""}`}>
      {/* Archived conversation banner */}
      {isArchived && conversation.archivedAt && (
        <ArchivedConversationBanner
          conversationId={conversation.id}
          conversationName={conversation.name || undefined}
          archivedAt={conversation.archivedAt}
        />
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full w-full">
          <div className="pb-4">
            {/* Welcome Message - only show when no messages */}
            {messageGroups.length === 0 && (
              <div className="px-4 py-8">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">
                      {conversation.name?.charAt(0).toUpperCase() || "#"}
                    </span>
                  </div>
                  <div className="text-xl font-semibold mb-2">
                    Bem-vindo a {conversation.name || "esta conversa"}!
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {isArchived
                      ? "Esta conversa foi arquivada."
                      : "Este é o início da sua conversa direta."}
                  </div>
                </div>
                <Separator className="mt-8" />
              </div>
            )}

            {/* Message Groups - Discord style */}
            {messageGroups.map((group, groupIndex) => {
              const author = getUserById(group.authorId) as AuthenticatedUser;
              const isCurrentUser = group.authorId === currentUser.id;
              const timeDiff =
                groupIndex > 0
                  ? new Date(group.messages[0]?.createdAt).getTime() -
                    new Date(
                      messageGroups[groupIndex - 1].messages[
                        messageGroups[groupIndex - 1].messages.length - 1
                      ]?.createdAt,
                    ).getTime()
                  : 0;

              // Show avatar and header if it's first group or if more than 7 minutes passed
              const showAvatar = groupIndex === 0 || timeDiff > 7 * 60 * 1000;

              // Determine if author is inactive (missing from available users)
              const authorIsInactive = !author && !isCurrentUser;

              // Check if this is the last group from current user and we're sending a message
              const isLastCurrentUserGroup =
                sendMessageMutation.isPending &&
                isCurrentUser &&
                groupIndex === messageGroups.length - 1;

              return (
                <div key={groupIndex}>
                  {/* First message in group - shows avatar and name */}
                  <MessageBubble
                    message={group.messages[0]}
                    author={author}
                    isCurrentUser={isCurrentUser}
                    showAvatar={showAvatar}
                    authorIsInactive={authorIsInactive}
                    originalAuthorName={authorIsInactive ? "Agente" : undefined}
                    isSending={
                      isLastCurrentUserGroup && group.messages.length === 1
                    }
                  />

                  {/* Subsequent messages in same group - no avatar */}
                  {group.messages.slice(1).map((message, messageIndex) => {
                    // Only show sending indicator on the very last message in the group
                    const isLastMessageInGroup =
                      messageIndex === group.messages.length - 2; // -2 because we sliced the first one

                    return (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        author={author}
                        isCurrentUser={isCurrentUser}
                        showAvatar={false}
                        authorIsInactive={authorIsInactive}
                        originalAuthorName={
                          authorIsInactive ? "Agente" : undefined
                        }
                        isSending={
                          isLastCurrentUserGroup && isLastMessageInGroup
                        }
                      />
                    );
                  })}
                </div>
              );
            })}

            {/* Empty state */}
            {messageGroups.length === 0 && (
              <div className="px-4 py-8 text-center text-muted-foreground">
                <div className="text-4xl mb-4">💬</div>
                <div className="text-sm">
                  {isArchived
                    ? "Esta conversa foi arquivada."
                    : "Nenhuma mensagem ainda. Comece a conversa!"}
                </div>
              </div>
            )}

            {/* Scroll padding */}
            <div className="h-4" />
          </div>
        </ScrollArea>
      </div>

      {/* Message Input - hide if conversation is archived */}
      {!isArchived && (
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={sendMessageMutation.isPending}
          isSending={sendMessageMutation.isPending}
          placeholder={`Conversar em ${conversation.name || "conversa"}...`}
        />
      )}

      {/* Archived conversation message input replacement */}
      {isArchived && (
        <div className="border-t bg-muted/30 px-4 py-3">
          <div className="text-center text-sm text-muted-foreground">
            Esta conversa foi arquivada. Para enviar mensagens, desarquive a
            conversa primeiro.
          </div>
        </div>
      )}
    </div>
  );
}

export { ConversationChat };
