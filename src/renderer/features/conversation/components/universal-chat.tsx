import { useEffect, useRef, useMemo } from "react";

import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { Separator } from "@/renderer/components/ui/separator";
import { ArchivedConversationBanner } from "@/renderer/features/conversation/components/archived-conversation-banner";
import { MessageBubble } from "@/renderer/features/conversation/components/message-bubble";
import { MessageInput } from "@/renderer/features/conversation/components/message-input";
import type {
  UniversalChatProps,
  MessageGroup,
} from "@/renderer/types/chat.types";
import { useApiMutation } from "@/renderer/hooks/use-api-mutation.hook";
import { cn } from "@/renderer/lib/utils";

interface UserBasic {
  id: string;
  name?: string;
}

// Welcome message composition
interface WelcomeMessageProps {
  chatType: "dm" | "channel";
  name: string | null;
  isArchived: boolean;
}

export function WelcomeMessage({
  chatType,
  name,
  isArchived,
}: WelcomeMessageProps) {
  const displayName =
    name || (chatType === "dm" ? "this conversation" : "this channel");
  const emoji = chatType === "dm" ? "💬" : "#";
  const description = isArchived
    ? `This ${chatType === "dm" ? "conversation" : "channel"} has been archived and cannot receive new messages.`
    : `This is the beginning of your ${chatType === "dm" ? "conversation" : "channel"}. Start chatting with the AI agent to get assistance with your projects.`;

  return (
    <div className="px-6 py-4 mx-auto max-w-2xl lg:max-w-4xl xl:max-w-5xl">
      <div className="text-center space-y-3">
        {/* Hero Icon */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center mx-auto border border-primary/20 shadow-lg shadow-primary/10">
            <span className="text-2xl font-bold text-primary">
              {typeof emoji === "string"
                ? emoji
                : name?.charAt(0).toUpperCase() || "#"}
            </span>
          </div>
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 blur opacity-30 animate-pulse"></div>
        </div>

        {/* Welcome Content */}
        <div className="space-y-3">
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Welcome to {displayName}!
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              {description}
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
  chatType: "dm" | "channel";
  isArchived: boolean;
}

export function EmptyState({ chatType, isArchived }: EmptyStateProps) {
  const entityName = chatType === "dm" ? "Conversation" : "Channel";
  const emoji = isArchived ? "📁" : chatType === "dm" ? "💬" : "#";

  return (
    <div className="flex flex-col items-center justify-center py-6 px-6 text-center">
      <div className="relative mb-4">
        <div className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center">
          <span className="text-2xl opacity-50">{emoji}</span>
        </div>
        <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-muted/10 to-muted/5 blur opacity-20"></div>
      </div>

      <div className="space-y-2 max-w-md lg:max-w-lg xl:max-w-xl">
        <h3 className="text-base font-medium text-foreground">
          {isArchived ? `Archived ${entityName}` : "Ready to Chat"}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {isArchived
            ? `This ${entityName.toLowerCase()} has been archived and is no longer active. To reactivate, use the unarchive option.`
            : `Start a conversation by sending a message. The agent is ready to help with your projects and questions.`}
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
  group: any;
  groupIndex: number;
  messageGroups: any[];
  currentUser: any;
  getUserById: (userId: string) => any | null;
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
  const author = getUserById(group.authorId);
  if (!author) {
    console.warn(`Author with ID ${group.authorId} not found`);
    return null;
  }
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
      {group.messages.slice(1).map((message: any, messageIndex: any) => {
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

// Convert SelectMessage to RendererMessage for compatibility
function convertToRendererMessage(message: any, sourceId: string): any {
  return {
    id: message.id,
    isActive: message.isActive,
    deactivatedAt: message.deactivatedAt,
    deactivatedBy: message.deactivatedBy,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    conversationId: sourceId, // Map sourceId to conversationId for compatibility
    content: message.content,
    authorId: message.authorId,
    senderId: message.authorId,
    senderType: "user", // Default to user, could be enhanced later
    metadata: null,
    sourceType: message.sourceType || "dm", // Add missing sourceType
    sourceId: sourceId, // Add missing sourceId
  };
}

export function UniversalChat(props: UniversalChatProps) {
  const {
    chatType,
    sourceId,
    messages,
    currentUser,
    availableUsers,
    isArchived,
    archivedAt,
    className,
  } = props;
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Convert messages to renderer format
  const rendererMessages: any[] = useMemo(() => {
    return messages.map((msg) => convertToRendererMessage(msg, sourceId));
  }, [messages, sourceId]);

  // Determine send message mutation based on chat type
  const sendMessageMutation = useApiMutation(
    (content: string) => {
      if (chatType === "dm") {
        return window.api.dm.sendMessage(sourceId, content);
      } else {
        return window.api.channels.sendMessage(sourceId, content);
      }
    },
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
    const isInitialLoad = !rendererMessages?.length;
    const timeoutId = setTimeout(
      () => scrollToBottom(!isInitialLoad),
      isInitialLoad ? 0 : 100,
    );
    return () => clearTimeout(timeoutId);
  }, [rendererMessages?.length]);

  // Send message handler - inline logic
  async function handleSendMessage(content: string) {
    if (!currentUser) return;
    sendMessageMutation.mutate(content);
  }

  // Safe type guard for user conversion - INLINE-FIRST (< 15 lines)
  function convertToAuthenticatedUser(user: unknown): any {
    if (!user || typeof user !== "object") {
      throw new Error("Invalid user data: not an object");
    }
    const userData = user as Record<string, unknown>;

    // Validate required fields
    if (!userData["id"] || typeof userData["id"] !== "string") {
      throw new Error("Invalid user data: missing id");
    }
    if (!userData["name"] || typeof userData["name"] !== "string") {
      throw new Error("Invalid user data: missing name");
    }

    return userData as any;
  }

  // Get user info by ID - inline logic with fallback handling
  function getUserById(userId: string): any | null {
    if (userId === currentUser?.id) return currentUser;

    const foundUser = (availableUsers as UserBasic[]).find(
      (user) => user.id === userId,
    );
    // Cast to AuthenticatedUser for compatibility, knowing this might be incomplete
    return foundUser ? convertToAuthenticatedUser(foundUser) : null;
  }

  const messageGroups = useMemo((): any[] => {
    const groups: any[] = [];

    const uniqueMessages = rendererMessages.filter(
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
  }, [rendererMessages]);

  if (!currentUser) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Authentication required</p>
      </div>
    );
  }

  const entityName = chatType === "dm" ? "conversation" : "channel";
  const displayName = chatType === "dm" ? "conversation" : `# ${sourceId}`;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Archived banner */}
      {isArchived && archivedAt && (
        <ArchivedConversationBanner
          conversationId={sourceId}
          conversationName={displayName}
          archivedAt={archivedAt}
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
                  chatType={chatType}
                  name={displayName}
                  isArchived={!!isArchived}
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
                <EmptyState chatType={chatType} isArchived={!!isArchived} />
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
          placeholder={`Message ${displayName}...`}
        />
      )}

      {/* Archived input replacement */}
      {isArchived && (
        <div className="bg-muted/20 px-4 py-3 border-t border-border/50">
          <div className="flex items-center justify-center gap-3 text-muted-foreground max-w-md mx-auto">
            <div className="w-6 h-6 rounded-full bg-muted/30 flex items-center justify-center flex-shrink-0">
              <span className="text-sm">📁</span>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium mb-0.5">
                Archived{" "}
                {entityName.charAt(0).toUpperCase() + entityName.slice(1)}
              </p>
              <p className="text-xs text-muted-foreground/80">
                This {entityName} has been archived. Unarchive to send messages.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
