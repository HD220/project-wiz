import { useEffect, useRef, useState } from "react";
import { Button } from "@/renderer/components/ui/button";
import { Input } from "@/renderer/components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/renderer/components/ui/avatar";
import { Badge } from "@/renderer/components/ui/badge";
import { MessageComponent } from "./message-component";
import { MessageInput } from "./message-input";
import { Hash, Users, Search, Inbox, Question, Pin } from "lucide-react";

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderType: "user" | "agent";
  messageType: "text" | "task_update" | "system" | "file_share";
  timestamp: Date;
  isEdited?: boolean;
  replyTo?: string;
  mentions?: string[];
  attachments?: any[];
  metadata?: any;
}

interface ChatAreaProps {
  channelName: string;
  channelType: "text" | "direct_message";
  channelDescription?: string;
  messages: Message[];
  onSendMessage: (content: string, mentions?: string[]) => void;
  onEditMessage: (messageId: string, content: string) => void;
  onDeleteMessage: (messageId: string) => void;
  isLoading?: boolean;
  typingUsers?: string[];
}

export function ChatArea({
  channelName,
  channelType,
  channelDescription,
  messages,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  isLoading = false,
  typingUsers = [],
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isNearBottom) {
      scrollToBottom();
    }
  }, [messages, isNearBottom]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNear = scrollHeight - scrollTop - clientHeight < 100;
    setIsNearBottom(isNear);
  };

  return (
    <div className="flex flex-col h-full bg-gray-700">
      {/* Channel Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-gray-600 bg-gray-800 shadow-sm">
        <div className="flex items-center space-x-3">
          {channelType === "text" ? (
            <Hash className="h-5 w-5 text-gray-400" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-green-500" />
          )}
          <div>
            <h2 className="font-semibold text-white">{channelName}</h2>
            {channelDescription && (
              <p className="text-xs text-gray-400">{channelDescription}</p>
            )}
          </div>
        </div>

        {/* Channel Actions */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="w-6 h-6">
            <Pin className="h-4 w-4 text-gray-400" />
          </Button>
          <Button variant="ghost" size="icon" className="w-6 h-6">
            <Users className="h-4 w-4 text-gray-400" />
          </Button>
          <Button variant="ghost" size="icon" className="w-6 h-6">
            <Search className="h-4 w-4 text-gray-400" />
          </Button>
          <Button variant="ghost" size="icon" className="w-6 h-6">
            <Inbox className="h-4 w-4 text-gray-400" />
          </Button>
          <Button variant="ghost" size="icon" className="w-6 h-6">
            <Question className="h-4 w-4 text-gray-400" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        onScroll={handleScroll}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mb-4">
              {channelType === "text" ? (
                <Hash className="h-8 w-8 text-gray-400" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-green-500" />
              )}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Welcome to #{channelName}!
            </h3>
            <p className="text-gray-400 max-w-md">
              {channelType === "text"
                ? "This is the beginning of the #" +
                  channelName +
                  " channel."
                : "This is the beginning of your direct message history."}
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageComponent
                key={message.id}
                message={message}
                onEdit={onEditMessage}
                onDelete={onDeleteMessage}
              />
            ))}

            {/* Typing Indicators */}
            {typingUsers.length > 0 && (
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150" />
                </div>
                <span>
                  {typingUsers.length === 1
                    ? `${typingUsers[0]} is typing...`
                    : `${typingUsers.slice(0, -1).join(", ")} and ${typingUsers[typingUsers.length - 1]} are typing...`}
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 bg-gray-800">
        <MessageInput
          channelName={channelName}
          onSendMessage={onSendMessage}
          placeholder={`Message #${channelName}`}
        />
      </div>
    </div>
  );
}