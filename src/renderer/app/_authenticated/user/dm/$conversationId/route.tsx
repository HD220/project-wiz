import { createFileRoute, Outlet, useRouter } from "@tanstack/react-router";
import { Send, Paperclip, Smile } from "lucide-react";
import { useEffect, useState } from "react";

import {
  Chat,
  ChatMessages,
  ChatMessage,
  ChatInput,
} from "@/renderer/components/chat";
import { ContentHeader } from "@/renderer/components/layout/content-header";
import {
  MemberSidebar,
  type Member,
} from "@/renderer/components/members/member-sidebar";
import { Button } from "@/renderer/components/ui/button";
import { Textarea } from "@/renderer/components/ui/textarea";
import {
  getOtherParticipants,
  createConversationAvatar,
} from "@/renderer/features/conversation/utils/conversation-avatar.utils";
import {
  ProfileAvatar,
  ProfileAvatarImage,
  ProfileAvatarStatus,
} from "@/renderer/features/user/components/profile-avatar";
import { loadApiData } from "@/renderer/lib/route-loader";
import { cn } from "@/renderer/lib/utils";
import { getRendererLogger } from "@/shared/services/logger/renderer";

const logger = getRendererLogger("dm-conversation");

import type { DMConversation } from "@/shared/types/dm-conversation";
import type { Message } from "@/shared/types/message";
import type { User } from "@/shared/types/user";

interface DMLoaderData {
  conversation: DMConversation;
  messages: Message[];
  availableUsers: User[];
  user: User;
  participants: User[];
}

function DMLayout() {
  const { conversationId } = Route.useParams();
  const router = useRouter();
  const { conversation, messages, availableUsers, user } =
    Route.useLoaderData() as DMLoaderData;
  const [optimisticMessages, setOptimisticMessages] = useState(messages || []);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Update optimistic messages when route data changes
  useEffect(() => {
    setOptimisticMessages(messages || []);
  }, [messages]);

  // Handle message sending with optimistic updates
  const handleSendMessage = async (input: string) => {
    if (!input.trim() || sendingMessage) return;

    setSendingMessage(true);

    // Create optimistic message
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`, // Temporary ID
      sourceType: "dm",
      sourceId: conversationId,
      authorId: user.id,
      content: input.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add optimistic message immediately
    setOptimisticMessages((prev) => [...prev, optimisticMessage]);

    try {
      // Send message to backend
      await window.api.dm.sendMessage({
        dmId: conversationId,
        content: input.trim(),
      });

      // Invalidate router to refresh messages from backend
      router.invalidate();
    } catch (error) {
      // Remove optimistic message on error
      setOptimisticMessages((prev) =>
        prev.filter((msg) => msg.id !== optimisticMessage.id),
      );
      logger.error("Failed to send message:", error);
    } finally {
      setSendingMessage(false);
    }
  };

  if (!conversation) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-muted-foreground">DM conversation not found</div>
      </div>
    );
  }

  const { participants } = Route.useLoaderData() as DMLoaderData;
  const otherParticipants = getOtherParticipants(participants, user.id);

  // Determine if it's a group conversation (3+ participants) or 1-1 (2 participants)
  const isGroupConversation = otherParticipants.length > 1;
  const is1on1Conversation = otherParticipants.length === 1;

  // Convert participants to Member format for sidebar
  const conversationMembers: Member[] = participants.map((participant) => ({
    id: participant.id,
    name: participant.name,
    username: participant.name.toLowerCase().replace(/\s+/g, ""),
    status: "online", // Default status - could be enhanced with real status
    role: participant.id === user.id ? "owner" : "member",
    avatarUrl: participant.avatar || undefined,
    type: participant.type === "agent" ? "agent" : "user",
  }));

  const displayName = conversation.name || "Unknown DM";
  const description =
    otherParticipants.length === 1
      ? "Direct message"
      : `${otherParticipants.length + 1} participants`;

  // Create conversation avatar
  const conversationAvatar = (
    <div className="flex-shrink-0">
      {createConversationAvatar(otherParticipants, "sm")}
    </div>
  );

  // Process messages into groups (Discord-like)
  const processMessages = (messages: any[]) => {
    const messageGroups: any[] = [];

    messages.forEach((msg: any) => {
      const lastGroup = messageGroups[messageGroups.length - 1];

      if (lastGroup && lastGroup.authorId === msg.authorId) {
        lastGroup.messages.push(msg);
      } else {
        messageGroups.push({
          authorId: msg.authorId,
          messages: [msg],
        });
      }
    });

    return messageGroups;
  };

  return (
    <div className="h-full w-full flex flex-col">
      <ContentHeader
        title={displayName}
        description={description}
        customIcon={conversationAvatar}
        showMembersToggle={isGroupConversation || is1on1Conversation}
        isMemberSidebarCollapsed={isSidebarCollapsed}
        onToggleMemberSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div className="flex-1 flex">
        {/* Main Chat Content */}
        <main className="flex-1 overflow-hidden">
          <Chat
          keyFn={(message: any) => message.id}
          value={optimisticMessages}
          onSend={(input, context) => {
            handleSendMessage(input);
            // Focus back to input after sending (input clears automatically now)
            context.refs.inputRef?.current?.focus();
          }}
          className="bg-background flex-1 flex flex-col"
        >
          <ChatMessages>
            {(() => {
              const processedMessages = optimisticMessages || [];

              // Welcome message for new conversations
              if (processedMessages.length === 0) {
                return (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <div className="mb-6">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <span className="text-2xl">💬</span>
                      </div>
                      <h3 className="text-lg font-medium mb-2">
                        Welcome to {displayName}!
                      </h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        {conversation.archivedAt
                          ? "This conversation has been archived and cannot receive new messages."
                          : "This is the beginning of your conversation. Start chatting with the AI agent to get assistance with your projects."}
                      </p>
                    </div>

                    {!conversation.archivedAt && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <div className="text-lg mb-2">💬</div>
                          <h4 className="font-medium text-sm mb-1">
                            Natural Conversation
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Chat naturally with the AI agent
                          </p>
                        </div>
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <div className="text-lg mb-2">🎯</div>
                          <h4 className="font-medium text-sm mb-1">
                            Specialized Assistance
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Get specific help for development
                          </p>
                        </div>
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <div className="text-lg mb-2">⚡</div>
                          <h4 className="font-medium text-sm mb-1">
                            Quick Responses
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Get instant and accurate assistance
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              const messageGroups = processMessages(processedMessages);

              return messageGroups.map((group, groupIndex) => {
                const author =
                  group.authorId === user.id
                    ? { id: user.id, name: user.name, avatar: user.avatar }
                    : availableUsers.find(
                        (u: User) => u.id === group.authorId,
                      ) || {
                        id: group.authorId,
                        name: "Unknown User",
                        avatar: null,
                      };

                // Calculate if should show avatar (first message of group or >7min)
                const timeDiff =
                  groupIndex > 0 && group.messages[0]?.createdAt
                    ? new Date(group.messages[0].createdAt).getTime() -
                      new Date(
                        messageGroups[groupIndex - 1].messages[
                          messageGroups[groupIndex - 1].messages.length - 1
                        ].createdAt,
                      ).getTime()
                    : 0;

                const showAvatar = groupIndex === 0 || timeDiff > 7 * 60 * 1000;

                return (
                  <div
                    key={groupIndex}
                    className={showAvatar ? "mt-[17px] first:mt-0" : ""}
                  >
                    {group.messages.map((msg: any, messageIndex: number) => (
                      <ChatMessage
                        key={msg.id}
                        messageData={msg}
                        messageIndex={messageIndex}
                        render={(_message) => (
                          <div
                            className={cn(
                              "group relative flex gap-3 px-4 py-0.5 hover:bg-muted/30 transition-colors",
                              showAvatar && messageIndex === 0
                                ? "mt-3 pb-0.5"
                                : "mt-0 pb-0",
                            )}
                          >
                            {/* Avatar/Timestamp Area */}
                            <div className="flex-shrink-0 w-10">
                              {showAvatar && messageIndex === 0 ? (
                                <ProfileAvatar size="sm">
                                  <ProfileAvatarImage
                                    src={author.avatar}
                                    name={author.name || "Unknown"}
                                    className={cn(
                                      !author.name ||
                                        author.name === "Unknown User"
                                        ? "text-muted-foreground bg-muted"
                                        : "",
                                    )}
                                  />
                                  {author.id && (
                                    <ProfileAvatarStatus id={author.id} />
                                  )}
                                </ProfileAvatar>
                              ) : (
                                <div className="flex justify-end items-start h-5 pt-0.5">
                                  <span className="text-xs text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                                    {new Date(msg.createdAt).toLocaleTimeString(
                                      [],
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Message Content */}
                            <div className="flex-1 min-w-0">
                              {showAvatar && messageIndex === 0 && (
                                <div className="flex items-baseline gap-2 mb-1">
                                  <span
                                    className={cn(
                                      "text-sm font-medium hover:underline cursor-pointer",
                                      !author.name ||
                                        author.name === "Unknown User"
                                        ? "text-muted-foreground"
                                        : "text-foreground hover:text-primary",
                                    )}
                                  >
                                    {author.name || "Unknown User"}
                                  </span>
                                  <span className="text-xs text-muted-foreground/60 font-mono">
                                    {new Date(msg.createdAt).toLocaleString(
                                      [],
                                      {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )}
                                  </span>
                                </div>
                              )}

                              <div
                                className={cn(
                                  "text-sm leading-[1.375] break-words",
                                  !author.name || author.name === "Unknown User"
                                    ? "text-muted-foreground/80"
                                    : "text-foreground",
                                )}
                              >
                                <p className="whitespace-pre-wrap selection:bg-primary/20 m-0">
                                  {msg.content}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      />
                    ))}
                  </div>
                );
              });
            })()}
          </ChatMessages>

          {conversation.archivedAt ? (
            <div className="border-t border-border/60 px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-md p-3">
                📦 This conversation has been archived and cannot receive new
                messages.
              </div>
            </div>
          ) : (
            <div className="border-t border-border/60 px-4 py-3">
              <ChatInput
                render={(chatInput) => (
                  <FunctionalChatInput
                    inputRef={
                      chatInput.inputRef as React.RefObject<HTMLTextAreaElement>
                    }
                    value={chatInput.value}
                    loading={sendingMessage}
                    onValueChange={chatInput.setValue}
                    onSend={chatInput.send}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp" && !chatInput.value) {
                        e.preventDefault();
                        chatInput.navigateHistory("up");
                      } else if (e.key === "ArrowDown" && !chatInput.value) {
                        e.preventDefault();
                        chatInput.navigateHistory("down");
                      }
                    }}
                    placeholder={`Message ${displayName}...`}
                    disabled={false}
                  />
                )}
              />
            </div>
          )}
          </Chat>
        </main>

        {/* Sidebar - Members for groups, Profile for 1-1 */}
        {!isSidebarCollapsed && (
          <div className="w-60">
            {isGroupConversation ? (
              <MemberSidebar
                members={conversationMembers}
                isCollapsed={isSidebarCollapsed}
                onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              />
            ) : is1on1Conversation ? (
              <div className="h-full bg-sidebar border-l border-sidebar-border">
                <div className="p-4">
                  <h3 className="font-medium text-sidebar-foreground mb-2">
                    User Profile
                  </h3>
                  <p className="text-sm text-sidebar-foreground/60">
                    Profile content will be implemented here.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
      <Outlet />
    </div>
  );
}

// Functional Chat Input Component
interface FunctionalChatInputProps extends React.ComponentProps<"div"> {
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  loading: boolean;
  onValueChange: (value: string) => void;
  onSend: (value?: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  disabled?: boolean;
}

function FunctionalChatInput({
  inputRef,
  value,
  loading,
  onValueChange,
  onSend,
  onKeyDown,
  placeholder = "Type a message...",
  disabled = false,
}: FunctionalChatInputProps) {
  // Usar inputRef diretamente - sem ref local desnecessário

  const handleSubmit = () => {
    if (value.trim() && !loading) {
      onSend();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }

    onKeyDown?.(e);
  };

  // Auto-resize textarea com throttling para performance
  const resizeTextarea = () => {
    if (inputRef?.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(resizeTextarea, 0);
    return () => clearTimeout(timeoutId);
  }, [value]);

  return (
    <div className="flex items-end gap-3">
      <div className="flex-1 relative">
        <Textarea
          ref={inputRef}
          value={value}
          onChange={(e) => {
            const newValue = e.target.value;
            onValueChange(newValue);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-[44px] max-h-[200px] resize-none rounded-lg border-input bg-background px-3 py-2 text-sm focus-visible:ring-1 focus-visible:ring-ring/50 focus-visible:ring-offset-1"
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-[44px] w-[44px] p-0"
          disabled={disabled || loading}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-[44px] w-[44px] p-0"
          disabled={disabled || loading}
        >
          <Smile className="h-4 w-4" />
        </Button>

        <Button
          type="submit"
          size="sm"
          className="h-[44px] w-[44px] p-0"
          disabled={!value.trim() || loading || disabled}
          onClick={handleSubmit}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/user/dm/$conversationId")(
  {
    loader: async ({ params }) => {
      const { conversationId } = params;

      // Load specific conversation directly instead of loading all conversations
      const dmConversation = await loadApiData(
        () => window.api.dm.get({ dmId: conversationId }),
        "Failed to load DM conversation",
      );

      if (!dmConversation) {
        throw new Error("DM conversation not found");
      }

      const currentUser = await loadApiData(
        () => window.api.auth.getCurrent({}),
        "Failed to load current user",
      );

      if (!currentUser) {
        throw new Error("No authenticated user");
      }

      const [messages, availableUsers] = await Promise.all([
        loadApiData(
          () => window.api.dm.listMessages({ dmId: conversationId }),
          "Failed to load DM messages",
        ),
        loadApiData(
          () =>
            window.api.user.listAvailableUsers({}),
          "Failed to load available users",
        ),
      ]);

      // Get participant user details from availableUsers using the participants from dm.get()
      const otherParticipants = availableUsers.filter((user) =>
        dmConversation.participants?.some((p) => p.participantId === user.id),
      );
      
      // Include current user in participants list
      const participants = [currentUser, ...otherParticipants];

      return {
        conversation: dmConversation,
        messages: messages || [],
        availableUsers,
        user: currentUser,
        participants,
      };
    },
    component: DMLayout,
  },
);
