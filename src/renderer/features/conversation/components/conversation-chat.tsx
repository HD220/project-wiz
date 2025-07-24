import { useEffect, useRef, useMemo } from "react";

import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { Separator } from "@/renderer/components/ui/separator";
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
  conversation: SelectConversation & { messages: Message[] };
  availableUsers: unknown[];
  currentUser: AuthenticatedUser | null;
  className?: string;
}

function ConversationChat(props: ConversationChatProps) {
  const { conversation, availableUsers, currentUser, className } = props;
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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

  // Get user info by ID
  function getUserById(userId: string) {
    if (userId === currentUser?.id) return currentUser;
    return (availableUsers as UserBasic[]).find((user) => user.id === userId);
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
                    Este é o início da sua conversa direta.
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

              return (
                <div key={groupIndex}>
                  {/* First message in group - shows avatar and name */}
                  <MessageBubble
                    message={group.messages[0]}
                    author={author}
                    isCurrentUser={isCurrentUser}
                    showAvatar={showAvatar}
                    isSending={
                      sendMessageMutation.isPending &&
                      groupIndex === messageGroups.length - 1
                    }
                  />

                  {/* Subsequent messages in same group - no avatar */}
                  {group.messages.slice(1).map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      author={author}
                      isCurrentUser={isCurrentUser}
                      showAvatar={false}
                      isSending={
                        sendMessageMutation.isPending &&
                        message === group.messages[group.messages.length - 1]
                      }
                    />
                  ))}
                </div>
              );
            })}

            {/* Empty state */}
            {messageGroups.length === 0 && (
              <div className="px-4 py-8 text-center text-muted-foreground">
                <div className="text-4xl mb-4">💬</div>
                <div className="text-sm">
                  Nenhuma mensagem ainda. Comece a conversa!
                </div>
              </div>
            )}

            {/* Scroll padding */}
            <div className="h-4" />
          </div>
        </ScrollArea>
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={sendMessageMutation.isPending}
        isSending={sendMessageMutation.isPending}
        placeholder={`Conversar em ${conversation.name || "conversa"}...`}
      />
    </div>
  );
}

export { ConversationChat };
