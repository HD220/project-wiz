/* eslint-disable max-lines-per-function */
import { useLoaderData, useRouter } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useMemo } from "react";
import { toast } from "sonner";

import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { Separator } from "@/renderer/components/ui/separator";
import { MessageBubble } from "@/renderer/features/conversation/components/message-bubble";
import { MessageInput } from "@/renderer/features/conversation/components/message-input";
import type { SendMessageInput } from "@/main/features/conversation/conversation.types";

interface ConversationChatProps {
  conversationId: string;
  className?: string;
}

function ConversationChat(props: ConversationChatProps) {
  const { className } = props;
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // SIMPLE: Get data from route loader
  const {
    conversation,
    availableUsers,
    user: currentUser,
  } = useLoaderData({
    from: "/_authenticated/user/dm/$conversationId",
  });

  // SIMPLE: Direct mutation with window.api
  const sendMessageMutation = useMutation({
    mutationFn: (input: SendMessageInput) => window.api.messages.send(input),
    onSuccess: () => {
      router.invalidate(); // Refresh conversation data
    },
    onError: () => {
      toast.error("Failed to send message");
    },
  });

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

  // Get user info by ID
  function getUserById(userId: string) {
    if (userId === currentUser?.id) return currentUser;
    return availableUsers.find((user: any) => user.id === userId);
  }

  const messageGroups = useMemo(() => {
    const groups: {
      authorId: string;
      messages: typeof conversation.messages;
    }[] = [];

    const uniqueMessages = conversation.messages.filter(
      (message, index, array) =>
        array.findIndex((m) => m.id === message.id) === index,
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
    <div className={`flex flex-col h-full ${className || ""}`}>
      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full w-full">
          <div className="p-4 space-y-4">
            {/* Welcome Message - only show when no messages */}
            {messageGroups.length === 0 && (
              <>
                <div className="text-center py-8">
                  <div className="text-2xl font-semibold mb-2">
                    Welcome to the conversation!
                  </div>
                  <div className="text-muted-foreground">
                    This is the beginning of your direct message with{" "}
                    <strong>{conversation.name || "this conversation"}</strong>.
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Message Groups */}
            {messageGroups.map((group, groupIndex) => {
              const author = getUserById(group.authorId);
              const isCurrentUser = group.authorId === currentUser.id;

              return (
                <div key={groupIndex} className="space-y-1">
                  {/* Author Header (only shown once per group) */}
                  <div className="flex items-center gap-3 px-1">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {author?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="font-medium">
                      {author?.name || "Unknown User"}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (you)
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {group.messages[0]?.createdAt
                        ? new Date(group.messages[0].createdAt).toLocaleString()
                        : "Unknown time"}
                    </div>
                  </div>

                  {/* Messages in Group */}
                  <div className="space-y-1">
                    {group.messages.map((message) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isCurrentUser={isCurrentUser}
                        showAvatar={false} // Already shown in group header
                      />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Empty state */}
            {messageGroups.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No messages yet. Start the conversation!
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <Separator />

      {/* Message Input */}
      <div className="p-4">
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={sendMessageMutation.isPending}
          isSending={sendMessageMutation.isPending}
          placeholder={`Message ${conversation.name || "conversation"}...`}
        />
      </div>
    </div>
  );
}

export { ConversationChat };
