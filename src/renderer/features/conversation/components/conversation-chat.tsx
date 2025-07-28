import { useEffect, useRef, useMemo } from "react";

import type { AuthenticatedUser } from "@/main/features/user/user.types";

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
    <div className="px-6 py-4 mx-auto max-w-2xl lg:max-w-4xl xl:max-w-5xl">
      <div className="text-center space-y-3">
        {/* Hero Icon */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center mx-auto border border-primary/20 shadow-lg shadow-primary/10">
            <span className="text-2xl font-bold text-primary">
              {conversation.name?.charAt(0).toUpperCase() || "#"}
            </span>
          </div>
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 blur opacity-30 animate-pulse"></div>
        </div>

        {/* Welcome Content */}
        <div className="space-y-3">
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Welcome to {conversation.name || "this conversation"}!
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              {isArchived
                ? "This conversation has been archived and cannot receive new messages."
                : "This is the beginning of your conversation. Start chatting with the AI agent to get assistance with your projects."}
            </p>
          </div>

          {/* Feature Highlights */}
          {!isArchived && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              <div className="p-3 rounded-lg bg-card border border-border/50 hover:border-border transition-colors">
                <div className="w-7 h-7 rounded-md bg-chart-2/10 flex items-center justify-center mb-2">
                  <span className="text-chart-2 text-sm">💬</span>
                </div>
                <h3 className="font-medium text-sm text-foreground mb-1">
                  Natural Conversation
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Chat naturally with the AI agent
                </p>
              </div>
              <div className="p-3 rounded-lg bg-card border border-border/50 hover:border-border transition-colors">
                <div className="w-7 h-7 rounded-md bg-chart-5/10 flex items-center justify-center mb-2">
                  <span className="text-chart-5 text-sm">🎯</span>
                </div>
                <h3 className="font-medium text-sm text-foreground mb-1">
                  Specialized Assistance
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Get specific help for development
                </p>
              </div>
              <div className="p-3 rounded-lg bg-card border border-border/50 hover:border-border transition-colors">
                <div className="w-7 h-7 rounded-md bg-chart-4/10 flex items-center justify-center mb-2">
                  <span className="text-chart-4 text-sm">⚡</span>
                </div>
                <h3 className="font-medium text-sm text-foreground mb-1">
                  Quick Responses
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Get instant and accurate assistance
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Separator className="mt-6 opacity-30" />
    </div>
  );
}

// Empty state composition
interface EmptyStateProps {
  isArchived: boolean;
}

export function EmptyState({ isArchived }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-6 px-6 text-center">
      <div className="relative mb-4">
        <div className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center">
          <span className="text-2xl opacity-50">
            {isArchived ? "📁" : "💬"}
          </span>
        </div>
        <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-muted/10 to-muted/5 blur opacity-20"></div>
      </div>

      <div className="space-y-2 max-w-md lg:max-w-lg xl:max-w-xl">
        <h3 className="text-base font-medium text-foreground">
          {isArchived ? "Archived Conversation" : "Ready to Chat"}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {isArchived
            ? "This conversation has been archived and is no longer active. To reactivate, use the unarchive option."
            : "Start a conversation by sending a message. The agent is ready to help with your projects and questions."}
        </p>
      </div>

      {!isArchived && (
        <div className="mt-4 p-3 rounded-lg bg-muted/10 border border-border/50 max-w-sm lg:max-w-md">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> Be specific in your questions to get more
            accurate answers.
          </p>
        </div>
      )}
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
    <div
      className={cn(
        "animate-in fade-in duration-200",
        showAvatar && "mt-[17px] first:mt-0",
      )}
    >
      {/* First message in group - shows avatar and name */}
      {group.messages[0] && (
        <MessageBubble
          message={group.messages[0]}
          author={author}
          isCurrentUser={isCurrentUser}
          showAvatar={showAvatar}
          authorIsInactive={authorIsInactive}
          originalAuthorName={authorIsInactive ? "Agent" : undefined}
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
            originalAuthorName={authorIsInactive ? "Agent" : undefined}
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
    <div
      className={cn(
        "bg-muted/20 px-4 py-3 border-t border-border/50",
        className,
      )}
    >
      <div className="flex items-center justify-center gap-3 text-muted-foreground max-w-md mx-auto">
        <div className="w-6 h-6 rounded-full bg-muted/30 flex items-center justify-center flex-shrink-0">
          <span className="text-sm">📁</span>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium mb-0.5">Archived Conversation</p>
          <p className="text-xs text-muted-foreground/80">
            This conversation has been archived. Unarchive to send messages.
          </p>
        </div>
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

  // Auto-scroll to bottom when new messages arrive - Discord-like behavior
  useEffect(() => {
    const scrollToBottom = (smooth = true) => {
      if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector(
          "[data-radix-scroll-area-viewport]",
        );
        if (viewport) {
          if (smooth) {
            viewport.scrollTo({
              top: viewport.scrollHeight,
              behavior: "smooth",
            });
          } else {
            viewport.scrollTop = viewport.scrollHeight;
          }
        }
      }
    };

    // Immediate scroll for initial load, smooth scroll for new messages
    const isInitialLoad = !conversation.messages?.length;
    const timeoutId = setTimeout(
      () => scrollToBottom(!isInitialLoad),
      isInitialLoad ? 0 : 100,
    );
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
    <div className={cn("flex flex-col h-full", className)}>
      {/* Archived conversation banner */}
      {isArchived && conversation.archivedAt && (
        <ArchivedConversationBanner
          conversationId={conversation.id}
          conversationName={conversation.name || undefined}
          archivedAt={conversation.archivedAt}
        />
      )}

      {/* Messages Area - Discord style */}
      <div className="flex-1 overflow-hidden relative">
        <ScrollArea ref={scrollAreaRef} className="h-full w-full">
          <div className="min-h-full flex flex-col">
            {/* Welcome Message - only show when no messages */}
            {messageGroups.length === 0 && (
              <div className="flex-1 flex items-center justify-center">
                <WelcomeMessage
                  conversation={conversation}
                  isArchived={isArchived}
                />
              </div>
            )}

            {/* Messages Container - Discord style */}
            {messageGroups.length > 0 && (
              <div className="flex-1">
                <div className="px-4 py-2">
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
                </div>
              </div>
            )}

            {/* Empty state - fallback for unusual scenarios */}
            {messageGroups.length === 0 && (
              <div className="flex-1 flex items-center justify-center">
                <EmptyState isArchived={isArchived} />
              </div>
            )}

            {/* Scroll padding */}
            <div className="h-2" />
          </div>
        </ScrollArea>
      </div>

      {/* Message Input */}
      {!isArchived && (
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={sendMessageMutation.isPending}
          isSending={sendMessageMutation.isPending}
          placeholder={`Message ${conversation.name || "conversation"}...`}
        />
      )}

      {/* Archived conversation input replacement */}
      {isArchived && <ArchivedInputPlaceholder />}
    </div>
  );
}
