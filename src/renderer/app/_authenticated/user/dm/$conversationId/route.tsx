import { createFileRoute, Outlet } from "@tanstack/react-router";

import { ContentHeader } from "@/renderer/features/layout/components/content-header";
import {
  ProfileAvatar,
  ProfileAvatarImage,
  ProfileAvatarStatus,
  ProfileAvatarCounter,
} from "@/components/profile-avatar";
import {
  Chat,
  ChatContent,
  ChatFooter,
  ChatItem,
  ChatScrollable,
  ChatInput,
} from "@/renderer/components/chat";
import {
  WelcomeMessage,
  AuthorAvatar,
  ArchivedInputReplacement,
  FunctionalChatInput,
  ChatWelcome,
} from "@/renderer/components/chat-components";
import { loadApiData } from "@/renderer/lib/route-loader";
import { cn } from "@/renderer/lib/utils";

function DMLayout() {
  const { conversationId } = Route.useParams();
  const { conversation, messages, availableUsers, user } =
    Route.useLoaderData() as any;

  if (!conversation) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-muted-foreground">DM conversation not found</div>
      </div>
    );
  }

  // Get conversation display info
  const otherParticipants =
    conversation.participants
      ?.filter((participant: any) => participant.userId !== user?.id)
      .map((participant: any) =>
        availableUsers.find(
          (availableUser: { id: string }) =>
            availableUser.id === participant.userId,
        ),
      )
      .filter(Boolean) || [];

  const displayName = conversation.name || "Unknown DM";
  const description =
    otherParticipants.length === 1
      ? "Direct message"
      : `${otherParticipants.length + 1} participants`;

  // Create conversation avatar
  const conversationAvatar = (
    <div className="flex-shrink-0">
      {(() => {
        if (otherParticipants.length === 0) {
          return (
            <ProfileAvatar size="sm">
              <ProfileAvatarImage
                fallbackIcon={<div className="text-xs font-bold">?</div>}
              />
            </ProfileAvatar>
          );
        }

        if (otherParticipants.length === 1) {
          const participant = otherParticipants[0];
          if (!participant) {
            return (
              <ProfileAvatar size="sm">
                <ProfileAvatarImage
                  fallbackIcon={<div className="text-xs font-bold">?</div>}
                />
              </ProfileAvatar>
            );
          }
          return (
            <ProfileAvatar size="sm">
              <ProfileAvatarImage
                src={participant.avatar}
                name={participant.name}
              />
              <ProfileAvatarStatus id={participant.id} size="sm" />
            </ProfileAvatar>
          );
        }

        const firstParticipant = otherParticipants[0];
        const remainingCount = otherParticipants.length - 1;

        if (!firstParticipant) {
          return (
            <ProfileAvatar size="sm">
              <ProfileAvatarImage
                fallbackIcon={<div className="text-xs font-bold">?</div>}
              />
            </ProfileAvatar>
          );
        }

        return (
          <ProfileAvatar size="sm">
            <ProfileAvatarImage
              src={firstParticipant.avatar}
              name={firstParticipant.name}
            />
            <ProfileAvatarStatus id={firstParticipant.id} size="sm" />
            {remainingCount > 0 && (
              <ProfileAvatarCounter count={remainingCount} size="sm" />
            )}
          </ProfileAvatar>
        );
      })()}
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col">
      <ContentHeader
        title={displayName}
        description={description}
        customIcon={conversationAvatar}
      />
      <main className="flex-1 overflow-hidden">
        <Chat className="bg-background">
          <ChatContent>
            <ChatScrollable
              autoScroll={true}
              initScroll={true}
              scrollDelayMs={100}
              className="px-4 py-2"
            >
              {(() => {
                const processedMessages = messages || [];

                // Welcome message for new conversations
                if (processedMessages.length === 0) {
                  return (
                    <ChatWelcome>
                      <WelcomeMessage
                        chatType="dm"
                        displayName={displayName}
                        isArchived={!!conversation.archivedAt}
                      />
                    </ChatWelcome>
                  );
                }

                // Group messages by author (Discord-like)
                const messageGroups: any[] = [];

                processedMessages.forEach((msg: any) => {
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

                return messageGroups.map((group, groupIndex) => {
                  const author =
                    group.authorId === user.id
                      ? { id: user.id, name: user.name, avatar: user.avatar }
                      : availableUsers.find(
                          (u: any) => u.id === group.authorId,
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

                  const showAvatar =
                    groupIndex === 0 || timeDiff > 7 * 60 * 1000;

                  return (
                    <div
                      key={groupIndex}
                      className={showAvatar ? "mt-[17px] first:mt-0" : ""}
                    >
                      {group.messages.map((msg: any, messageIndex: number) => (
                        <ChatItem
                          key={msg.id}
                          className={cn(
                            "relative flex gap-3 px-4 py-0.5 hover:bg-muted/30 transition-colors",
                            showAvatar && messageIndex === 0
                              ? "mt-3 pb-0.5"
                              : "mt-0 pb-0",
                          )}
                        >
                          {/* Avatar/Timestamp Area */}
                          <div className="flex-shrink-0 w-10">
                            {showAvatar && messageIndex === 0 ? (
                              <AuthorAvatar
                                id={author.id}
                                name={author.name || "Unknown"}
                                avatar={author.avatar}
                                isInactive={
                                  !author.name || author.name === "Unknown User"
                                }
                              />
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
                                  {new Date(msg.createdAt).toLocaleString([], {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
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
                        </ChatItem>
                      ))}
                    </div>
                  );
                });
              })()}
            </ChatScrollable>
          </ChatContent>

          {conversation.archivedAt ? (
            <ChatFooter className="border-t border-border/60">
              <ArchivedInputReplacement entityName="conversation" />
            </ChatFooter>
          ) : (
            <ChatFooter className="border-t border-border/60 px-4 py-3">
              <ChatInput>
                <FunctionalChatInput
                  onSend={async (content) => {
                    await window.api.dm.sendMessage(conversationId, content);
                  }}
                  placeholder={`Message ${displayName}...`}
                  disabled={false}
                />
              </ChatInput>
            </ChatFooter>
          )}
        </Chat>
      </main>
      <Outlet />
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/user/dm/$conversationId")(
  {
    loader: async ({ params }) => {
      const { conversationId } = params;

      try {
        const [dmConversation, messages, availableUsers, user] =
          await Promise.all([
            loadApiData(
              () => window.api.dm.findById(conversationId),
              "Failed to load DM conversation",
            ),
            loadApiData(
              () => window.api.dm.getMessages(conversationId),
              "Failed to load DM messages",
            ),
            loadApiData(
              () => window.api.users.listAvailableUsers(),
              "Failed to load available users",
            ),
            loadApiData(
              () => window.api.auth.getCurrentUser(),
              "Failed to load current user",
            ),
          ]);

        if (!dmConversation) {
          throw new Error("DM conversation not found");
        }

        return {
          conversation: dmConversation,
          messages: messages || [],
          availableUsers,
          user,
        };
      } catch (error) {
        console.error("Failed to load DM conversation data:", error);
        throw error;
      }
    },
    component: DMLayout,
  },
);
