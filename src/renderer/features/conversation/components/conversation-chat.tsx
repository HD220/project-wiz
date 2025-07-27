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
import type { AuthenticatedUser } from "@/main/features/user/user.types";
import { useApiMutation } from "@/renderer/hooks/use-api-mutation.hook";
import { cn } from "@/renderer/lib/utils";

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

// Welcome message composition
interface WelcomeMessageProps {
  conversation: SelectConversation;
  isArchived: boolean;
}

export function WelcomeMessage({
  conversation,
  isArchived,
}: WelcomeMessageProps) {
  return (
    <div className="px-6 py-8">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl font-bold text-primary">
            {conversation.name?.charAt(0).toUpperCase() || "#"}
          </span>
        </div>
        <div className="text-2xl font-semibold tracking-tight mb-4">
          Bem-vindo a {conversation.name || "esta conversa"}!
        </div>
        <div className="text-base text-muted-foreground">
          {isArchived
            ? "Esta conversa foi arquivada."
            : "Este é o início da sua conversa direta."}
        </div>
      </div>
      <Separator className="mt-8" />
    </div>
  );
}

// Empty state composition
interface EmptyStateProps {
  isArchived: boolean;
}

export function EmptyState({ isArchived }: EmptyStateProps) {
  return (
    <div className="px-6 py-8 text-center text-muted-foreground">
      <div className="text-4xl mb-6">💬</div>
      <div className="text-base">
        {isArchived
          ? "Esta conversa foi arquivada."
          : "Nenhuma mensagem ainda. Comece a conversa!"}
      </div>
    </div>
  );
}

// Message group composition
interface MessageGroupProps {
  group: {
    authorId: string;
    messages: Message[];
  };
  groupIndex: number;
  messageGroups: Array<{
    authorId: string;
    messages: Message[];
  }>;
  currentUser: AuthenticatedUser;
  getUserById: (userId: string) => AuthenticatedUser | null;
  isSendingMessage: boolean;
}

export function MessageGroup({
  group,
  groupIndex,
  messageGroups,
  currentUser,
  getUserById,
  isSendingMessage,
}: MessageGroupProps) {
  const author = getUserById(group.authorId) as AuthenticatedUser;
  const isCurrentUser = group.authorId === currentUser.id;

  // Calculate time difference for avatar display logic
  const timeDiff =
    groupIndex > 0 && group.messages[0]?.createdAt
      ? (() => {
          const currentMessageTime = new Date(
            group.messages[0].createdAt,
          ).getTime();
          const previousGroup = messageGroups[groupIndex - 1];
          const lastMessage =
            previousGroup?.messages[previousGroup.messages.length - 1];
          const previousMessageTime = lastMessage?.createdAt
            ? new Date(lastMessage.createdAt).getTime()
            : 0;
          return currentMessageTime - previousMessageTime;
        })()
      : 0;

  // Show avatar and header if it's first group or if more than 7 minutes passed
  const showAvatar = groupIndex === 0 || timeDiff > 7 * 60 * 1000;

  // Determine if author is inactive (missing from available users)
  const authorIsInactive = !author && !isCurrentUser;

  // Check if this is the last group from current user and we're sending a message
  const isLastCurrentUserGroup =
    isSendingMessage &&
    isCurrentUser &&
    groupIndex === messageGroups.length - 1;

  return (
    <div>
      {/* First message in group - shows avatar and name */}
      {group.messages[0] && (
        <MessageBubble
          message={group.messages[0]}
          author={author}
          isCurrentUser={isCurrentUser}
          showAvatar={showAvatar}
          authorIsInactive={authorIsInactive}
          originalAuthorName={authorIsInactive ? "Agente" : undefined}
          isSending={isLastCurrentUserGroup && group.messages.length === 1}
        />
      )}

      {/* Subsequent messages in same group - no avatar */}
      {group.messages.slice(1).map((message, messageIndex) => {
        // Only show sending indicator on the very last message in the group
        const isLastMessageInGroup = messageIndex === group.messages.length - 2; // -2 because we sliced the first one

        return (
          <MessageBubble
            key={message.id}
            message={message}
            author={author}
            isCurrentUser={isCurrentUser}
            showAvatar={false}
            authorIsInactive={authorIsInactive}
            originalAuthorName={authorIsInactive ? "Agente" : undefined}
            isSending={isLastCurrentUserGroup && isLastMessageInGroup}
          />
        );
      })}
    </div>
  );
}

// Archived input placeholder composition
interface ArchivedInputPlaceholderProps {
  className?: string;
}

export function ArchivedInputPlaceholder({
  className,
}: ArchivedInputPlaceholderProps) {
  return (
    <div className={cn("border-t bg-muted/30 px-6 py-4", className)}>
      <div className="text-center text-base text-muted-foreground">
        Esta conversa foi arquivada. Para enviar mensagens, desarquive a
        conversa primeiro.
      </div>
    </div>
  );
}

export function ConversationChat(props: ConversationChatProps) {
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

  // Send message handler - inline logic
  async function handleSendMessage(content: string) {
    if (!currentUser) return;

    sendMessageMutation.mutate({
      conversationId: conversation.id,
      authorId: currentUser.id,
      content,
    });
  }

  // Get user info by ID - inline logic with fallback handling
  function getUserById(userId: string): AuthenticatedUser | null {
    if (userId === currentUser?.id) return currentUser;

    const foundUser = (availableUsers as UserBasic[]).find(
      (user) => user.id === userId,
    );
    // Cast to AuthenticatedUser for compatibility, knowing this might be incomplete
    return foundUser ? (foundUser as unknown as AuthenticatedUser) : null;
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
    <div className={cn("flex flex-col h-full bg-background", className)}>
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
              <WelcomeMessage
                conversation={conversation}
                isArchived={isArchived}
              />
            )}

            {/* Message Groups - Discord style */}
            {messageGroups.map((group, groupIndex) => (
              <MessageGroup
                key={groupIndex}
                group={group}
                groupIndex={groupIndex}
                messageGroups={messageGroups}
                currentUser={currentUser}
                getUserById={getUserById}
                isSendingMessage={sendMessageMutation.isPending}
              />
            ))}

            {/* Empty state - fallback for unusual scenarios */}
            {messageGroups.length === 0 && (
              <EmptyState isArchived={isArchived} />
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
      {isArchived && <ArchivedInputPlaceholder />}
    </div>
  );
}
