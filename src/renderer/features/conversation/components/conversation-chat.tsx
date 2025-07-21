import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { Separator } from "@/renderer/components/ui/separator";

import type { ConversationWithMessagesAndParticipants } from "../conversation.types";
import { useConversationStore } from "../conversation.store";
import { useAuthStore } from "@/renderer/store/auth.store";

import { MessageBubble } from "./message-bubble";
import { MessageInput } from "./message-input";

interface ConversationChatProps {
  conversation: ConversationWithMessagesAndParticipants;
  className?: string;
}

function ConversationChat(props: ConversationChatProps) {
  const { conversation, className } = props;
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { user: currentUser } = useAuthStore();
  const { 
    availableUsers,
    isSendingMessage,
    sendMessage,
    error,
  } = useConversationStore();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation.messages.length]);

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Get user info by ID
  const getUserById = (userId: string) => {
    if (userId === currentUser?.id) return currentUser;
    return availableUsers.find(user => user.id === userId);
  };

  // Group consecutive messages by the same author
  const groupMessages = () => {
    const groups: {
      authorId: string;
      messages: typeof conversation.messages;
      showAvatar: boolean;
    }[] = [];

    conversation.messages.forEach((message, index) => {
      const lastGroup = groups[groups.length - 1];
      
      if (lastGroup && lastGroup.authorId === message.authorId) {
        // Same author, add to existing group
        lastGroup.messages.push(message);
      } else {
        // New author or first message, create new group
        groups.push({
          authorId: message.authorId,
          messages: [message],
          showAvatar: true, // First message in group shows avatar
        });
      }
    });

    return groups;
  };

  const messageGroups = groupMessages();

  if (!currentUser) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Authentication required</p>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col h-full ${className || ""}`}>
      {/* Messages area - Discord style */}
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-4 space-y-1">
          {messageGroups.length === 0 ? (
            /* Empty conversation state */
            <div className="flex-1 flex items-center justify-center py-16">
              <div className="text-center space-y-2">
                <p className="text-muted-foreground">
                  This is the beginning of your conversation
                </p>
                <p className="text-sm text-muted-foreground">
                  Send a message to get started!
                </p>
              </div>
            </div>
          ) : (
            messageGroups.map((group, groupIndex) => {
              const author = getUserById(group.authorId);
              const isCurrentUser = group.authorId === currentUser.id;

              return (
                <div key={`group-${groupIndex}`} className="space-y-0.5">
                  {group.messages.map((message, messageIndex) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      author={author}
                      isCurrentUser={isCurrentUser}
                      showAvatar={messageIndex === 0} // Only show avatar for first message in group
                    />
                  ))}
                  
                  {/* Add some spacing between different authors */}
                  {groupIndex < messageGroups.length - 1 && (
                    <div className="h-2" />
                  )}
                </div>
              );
            })
          )}
          
          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Separator */}
      <Separator />

      {/* Sending indicator */}
      {isSendingMessage && (
        <div className="px-4 py-2 bg-muted/30">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Sending message...</span>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Message input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        isSending={isSendingMessage}
        placeholder={`Message ${conversation.name || "this conversation"}...`}
      />
    </div>
  );
}

export { ConversationChat };