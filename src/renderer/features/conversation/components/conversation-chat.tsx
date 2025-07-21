import { useEffect, useRef, useMemo } from "react";
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
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
          // Force scroll to absolute bottom
          viewport.scrollTop = viewport.scrollHeight;
        }
      }
    };

    // Use setTimeout to ensure DOM is updated after render
    const timeoutId = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(timeoutId);
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


  const messageGroups = useMemo(() => {
    const groups: {
      authorId: string;
      messages: typeof conversation.messages;
    }[] = [];

    // Create a unique set to avoid duplicates
    const uniqueMessages = conversation.messages.filter(
      (message, index, array) => 
        array.findIndex(m => m.id === message.id) === index
    );

    uniqueMessages.forEach((message, index) => {
      const lastGroup = groups[groups.length - 1];
      
      if (lastGroup && lastGroup.authorId === message.authorId) {
        // Same author, add to existing group
        lastGroup.messages.push(message);
      } else {
        // New author or first message, create new group
        groups.push({
          authorId: message.authorId,
          messages: [message],
        });
      }
    });

    return groups;
  }, [conversation.messages]);

  if (!currentUser) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Authentication required</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className || ""}`}>
      {/* Messages area - Discord style */}
      <ScrollArea 
        className="flex-1 h-0" 
        ref={scrollAreaRef}
      >
        {messageGroups.length === 0 ? (
          /* Empty conversation state */
          <div className="h-full flex items-center justify-center p-8">
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
          <div className="p-4 space-y-1">
            {messageGroups.map((group, groupIndex) => {
              const author = getUserById(group.authorId);
              const isCurrentUser = group.authorId === currentUser.id;

              return (
                <div key={`group-${group.authorId}-${groupIndex}`} className="space-y-0.5">
                  {group.messages.map((message, messageIndex) => {
                    // Check if this is the last message from current user and we're sending
                    const isLastUserMessage = isCurrentUser && 
                      groupIndex === messageGroups.length - 1 && 
                      messageIndex === group.messages.length - 1;
                    const showSending = isSendingMessage && isLastUserMessage;
                    
                    return (
                      <MessageBubble
                        key={`${message.id}-${messageIndex}`}
                        message={message}
                        author={author}
                        isCurrentUser={isCurrentUser}
                        showAvatar={messageIndex === 0} // Only show avatar for first message in group
                        isSending={showSending}
                      />
                    );
                  })}
                  
                  {/* Add some spacing between different authors */}
                  {groupIndex < messageGroups.length - 1 && (
                    <div className="h-2" />
                  )}
                </div>
              );
            })}
            
            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Separator */}
      <Separator />


      {/* Error message */}
      {error && (
        <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Message input - Fixed at bottom */}
      <div className="flex-shrink-0">
        <MessageInput
          onSendMessage={handleSendMessage}
          isSending={isSendingMessage}
          placeholder={`Message ${conversation.name || "this conversation"}...`}
        />
      </div>
    </div>
  );
}

export { ConversationChat };