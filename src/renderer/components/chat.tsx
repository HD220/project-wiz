import * as React from "react";
import { useEffect, useRef, useMemo, useState } from "react";
import {
  Send,
  Paperclip,
  Smile,
  Loader2,
  Clock,
  Check,
  CheckCheck,
} from "lucide-react";

import { Button } from "@/renderer/components/ui/button";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { Textarea } from "@/renderer/components/ui/textarea";
import {
  ProfileAvatar,
  ProfileAvatarImage,
  ProfileAvatarStatus,
} from "@/renderer/components/ui/profile-avatar";
import { Badge } from "@/renderer/components/ui/badge";
import { Separator } from "@/renderer/components/ui/separator";
import { cn } from "@/renderer/lib/utils";

// ===========================
// INTERFACES GENÉRICAS (ZERO REGRA DE NEGÓCIO)
// ===========================

export interface ChatMessage {
  id: string;
  content: string;
  authorId: string;
  timestamp: Date;
  status?: "sending" | "sent" | "delivered" | "read" | "failed";
  metadata?: Record<string, unknown>;
}

export interface ChatAuthor {
  id: string;
  name: string;
  avatar?: string;
  status?: "online" | "away" | "busy" | "offline";
  isInactive?: boolean;
  metadata?: Record<string, unknown>;
}

export interface ChatOptions {
  groupMessages?: boolean;
  showTimestamps?: boolean;
  showStatus?: boolean;
  autoScroll?: boolean;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
}

export interface ChatMessageGroup {
  authorId: string;
  messages: ChatMessage[];
}

// ===========================
// COMPONENTE PRINCIPAL - CHAT
// ===========================

export function Chat({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chat"
      className={cn("flex flex-col h-full bg-background", className)}
      {...props}
    />
  );
}

// ===========================
// CHAT HEADER - SLOT CUSTOMIZÁVEL
// ===========================

export function ChatHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chat-header"
      className={cn("flex-shrink-0", className)}
      {...props}
    />
  );
}

// ===========================
// CHAT MESSAGES - ÁREA DE MENSAGENS
// ===========================

interface ChatMessagesProps extends React.ComponentProps<"div"> {
  messages: ChatMessage[];
  authors: ChatAuthor[];
  currentUserId: string;
  options?: ChatOptions;
}

export function ChatMessages({
  messages,
  authors,
  currentUserId,
  options = {},
  className,
  ...props
}: ChatMessagesProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { groupMessages = true, autoScroll = true } = options;

  // Group messages by author when enabled
  const messageGroups = useMemo((): ChatMessageGroup[] => {
    if (!groupMessages) {
      return messages.map((message) => ({
        authorId: message.authorId,
        messages: [message],
      }));
    }

    const groups: ChatMessageGroup[] = [];
    const uniqueMessages = messages.filter(
      (message, index, array) =>
        array.findIndex((m) => m.id === message.id) === index,
    );

    uniqueMessages.forEach((message) => {
      const lastGroup = groups[groups.length - 1];
      const lastMessage = lastGroup?.messages[lastGroup.messages.length - 1];
      const timeDiff = lastMessage
        ? new Date(message.timestamp).getTime() -
          new Date(lastMessage.timestamp).getTime()
        : 0;

      // Group if same author and less than 7 minutes difference
      if (
        lastGroup &&
        lastGroup.authorId === message.authorId &&
        timeDiff < 7 * 60 * 1000
      ) {
        lastGroup.messages.push(message);
      } else {
        groups.push({
          authorId: message.authorId,
          messages: [message],
        });
      }
    });

    return groups;
  }, [messages, groupMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (!autoScroll) return;

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

    const timeoutId = setTimeout(() => scrollToBottom(true), 100);
    return () => clearTimeout(timeoutId);
  }, [messages.length, autoScroll]);

  // Get author by ID
  const getAuthor = (authorId: string): ChatAuthor | null => {
    return authors.find((author) => author.id === authorId) || null;
  };

  if (messageGroups.length === 0) {
    return (
      <div
        data-slot="chat-messages"
        className={cn("flex-1 overflow-hidden", className)}
        {...props}
      >
        <div className="flex-1 flex items-center justify-center">
          <ChatEmpty />
        </div>
      </div>
    );
  }

  return (
    <div
      data-slot="chat-messages"
      className={cn("flex-1 overflow-hidden", className)}
      {...props}
    >
      <ScrollArea ref={scrollAreaRef} className="h-full w-full">
        <div className="min-h-full flex flex-col">
          <div className="flex-1">
            <div className="px-4 py-2">
              {messageGroups.map((group, groupIndex) => (
                <ChatMessageGroup
                  key={groupIndex}
                  group={group}
                  groupIndex={groupIndex}
                  messageGroups={messageGroups}
                  author={getAuthor(group.authorId)}
                  currentUserId={currentUserId}
                  options={options}
                />
              ))}
            </div>
          </div>
          <div className="h-2" />
        </div>
      </ScrollArea>
    </div>
  );
}

// ===========================
// CHAT MESSAGE GROUP - AGRUPAMENTO
// ===========================

interface ChatMessageGroupProps {
  group: ChatMessageGroup;
  groupIndex: number;
  messageGroups: ChatMessageGroup[];
  author: ChatAuthor | null;
  currentUserId: string;
  options?: ChatOptions;
}

export function ChatMessageGroup({
  group,
  groupIndex,
  messageGroups,
  author,
  currentUserId,
  options = {},
}: ChatMessageGroupProps) {
  const isCurrentUser = group.authorId === currentUserId;

  // Calculate time difference for avatar display logic
  const timeDiff =
    groupIndex > 0 && group.messages[0]
      ? (() => {
          const currentMessageTime = new Date(
            group.messages[0].timestamp,
          ).getTime();
          const previousGroup = messageGroups[groupIndex - 1];
          const lastMessage =
            previousGroup?.messages[previousGroup.messages.length - 1];
          const previousMessageTime = lastMessage
            ? new Date(lastMessage.timestamp).getTime()
            : 0;
          return currentMessageTime - previousMessageTime;
        })()
      : 0;

  // Show avatar and header if it's first group or if more than 7 minutes passed
  const showAvatar = groupIndex === 0 || timeDiff > 7 * 60 * 1000;

  return (
    <div
      data-slot="chat-message-group"
      className={cn(
        "animate-in fade-in duration-200",
        showAvatar && "mt-[17px] first:mt-0",
      )}
    >
      {group.messages.map((message, messageIndex) => (
        <ChatMessage
          key={message.id}
          message={message}
          author={author}
          isCurrentUser={isCurrentUser}
          showAvatar={showAvatar && messageIndex === 0}
          options={options}
        />
      ))}
    </div>
  );
}

// ===========================
// CHAT MESSAGE - BUBBLE INDIVIDUAL
// ===========================

interface ChatMessageProps {
  message: ChatMessage;
  author: ChatAuthor | null;
  isCurrentUser: boolean;
  showAvatar?: boolean;
  options?: ChatOptions;
}

export function ChatMessage({
  message,
  author,
  isCurrentUser,
  showAvatar = true,
  options = {},
}: ChatMessageProps) {
  const { showTimestamps = true, showStatus = true } = options;

  return (
    <div
      data-slot="chat-message"
      className={cn(
        "relative flex gap-3 group px-4 py-0.5 hover:bg-muted/30 transition-colors",
        showAvatar ? "mt-3 pb-0.5" : "mt-0 pb-0",
        author?.isInactive && "opacity-80",
        message.status === "sending" && "animate-pulse",
      )}
    >
      {/* Avatar or timestamp placeholder */}
      <div className="flex-shrink-0 w-10">
        {showAvatar ? (
          <ChatMessageAvatar author={author} />
        ) : (
          <div className="flex justify-end items-start h-5 pt-0.5">
            {showTimestamps && (
              <span className="text-xs text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Message content */}
      <div className="flex-1 min-w-0">
        {showAvatar && (
          <ChatMessageMeta
            author={author}
            timestamp={message.timestamp}
            showTimestamp={showTimestamps}
          />
        )}

        <ChatMessageContent content={message.content} author={author} />

        {showStatus && isCurrentUser && (
          <ChatMessageStatus status={message.status} />
        )}
      </div>
    </div>
  );
}

// ===========================
// CHAT MESSAGE AVATAR
// ===========================

interface ChatMessageAvatarProps {
  author: ChatAuthor | null;
}

export function ChatMessageAvatar({ author }: ChatMessageAvatarProps) {
  if (!author) {
    return (
      <ProfileAvatar size="md">
        <ProfileAvatarImage fallbackIcon="?" />
      </ProfileAvatar>
    );
  }

  const authorInitials = author.name.charAt(0).toUpperCase();

  return (
    <div data-slot="chat-message-avatar">
      <ProfileAvatar size="md">
        <ProfileAvatarImage
          src={!author.isInactive ? author.avatar : undefined}
          name={!author.isInactive ? author.name : undefined}
          fallbackIcon={author.isInactive ? "?" : authorInitials}
          className={author.isInactive ? "opacity-60 grayscale" : undefined}
        />
        {author.status && !author.isInactive && (
          <ProfileAvatarStatus id={author.id} size="md" />
        )}
      </ProfileAvatar>
    </div>
  );
}

// ===========================
// CHAT MESSAGE META - METADADOS
// ===========================

interface ChatMessageMetaProps {
  author: ChatAuthor | null;
  timestamp: Date;
  showTimestamp?: boolean;
}

export function ChatMessageMeta({
  author,
  timestamp,
  showTimestamp = true,
}: ChatMessageMetaProps) {
  const authorName = author?.name || "Unknown User";

  return (
    <div
      data-slot="chat-message-meta"
      className="flex items-baseline gap-2 mb-1"
    >
      <span
        className={cn(
          "text-sm font-medium hover:underline cursor-pointer",
          author?.isInactive
            ? "text-muted-foreground"
            : "text-foreground hover:text-primary",
        )}
      >
        {authorName}
      </span>

      {author?.isInactive && (
        <Badge
          variant="outline"
          className="h-4 px-1.5 text-xs bg-muted/40 text-muted-foreground border-muted-foreground/20"
        >
          Inactive
        </Badge>
      )}

      {showTimestamp && (
        <span className="text-xs text-muted-foreground/60 font-mono">
          {new Date(timestamp).toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      )}
    </div>
  );
}

// ===========================
// CHAT MESSAGE CONTENT - CONTEÚDO
// ===========================

interface ChatMessageContentProps {
  content: string;
  author: ChatAuthor | null;
}

export function ChatMessageContent({
  content,
  author,
}: ChatMessageContentProps) {
  return (
    <div
      data-slot="chat-message-content"
      className={cn(
        "text-sm leading-[1.375] break-words",
        author?.isInactive ? "text-muted-foreground/80" : "text-foreground",
      )}
    >
      <p className="whitespace-pre-wrap selection:bg-primary/20 m-0">
        {content}
      </p>
    </div>
  );
}

// ===========================
// CHAT MESSAGE STATUS - STATUS
// ===========================

interface ChatMessageStatusProps {
  status?: ChatMessage["status"];
}

export function ChatMessageStatus({ status }: ChatMessageStatusProps) {
  if (!status) return null;

  const statusConfig = {
    sending: {
      icon: Loader2,
      className: "animate-spin text-muted-foreground/60",
      label: "Sending...",
    },
    sent: { icon: Check, className: "text-muted-foreground/60", label: "Sent" },
    delivered: {
      icon: CheckCheck,
      className: "text-chart-2/80",
      label: "Delivered",
    },
    read: { icon: CheckCheck, className: "text-chart-5/80", label: "Read" },
    failed: { icon: Clock, className: "text-destructive/80", label: "Failed" },
  };

  const config = statusConfig[status];
  if (!config) return null;

  const IconComponent = config.icon;

  return (
    <div
      data-slot="chat-message-status"
      className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <IconComponent className={cn("w-3 h-3", config.className)} />
      {status === "sending" && (
        <span className="text-xs text-muted-foreground/60">{config.label}</span>
      )}
    </div>
  );
}

// ===========================
// CHAT INPUT - CONTAINER INPUT
// ===========================

interface ChatInputProps extends React.ComponentProps<"div"> {
  onSend: (content: string) => Promise<void>;
  options?: ChatOptions;
}

export function ChatInput({
  onSend,
  options = {},
  className,
  ...props
}: ChatInputProps) {
  const {
    placeholder = "Type a message...",
    maxLength = 2000,
    disabled = false,
  } = options;

  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    const trimmedMessage = message.trim();
    if (
      !trimmedMessage ||
      isSending ||
      disabled ||
      message.length > maxLength
    ) {
      return;
    }

    try {
      setIsSending(true);
      setMessage("");
      await onSend(trimmedMessage);
    } catch (error) {
      // Restore message on error
      setMessage(trimmedMessage);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      data-slot="chat-input"
      className={cn("bg-background border-t border-border/60", className)}
      {...props}
    >
      <div className="px-4 py-3">
        <div className="relative">
          <ChatInputField
            value={message}
            onChange={setMessage}
            onSend={handleSend}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={disabled || isSending}
          />
          <ChatInputActions
            onSend={handleSend}
            canSend={!!message.trim() && !disabled && !isSending}
            isSending={isSending}
          />
        </div>

        {message.length > maxLength * 0.8 && (
          <div className="flex justify-end items-center mt-2 px-2">
            <div
              className={cn(
                "text-xs transition-colors duration-200",
                message.length > maxLength
                  ? "text-destructive"
                  : "text-muted-foreground/80",
              )}
            >
              {message.length}/{maxLength}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ===========================
// CHAT INPUT FIELD - TEXTAREA
// ===========================

interface ChatInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
}

export function ChatInputField({
  value,
  onChange,
  onSend,
  placeholder = "Type a message...",
  maxLength = 2000,
  disabled = false,
}: ChatInputFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  // Restore focus when not disabled
  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }

    if (event.key === "Escape" && value.trim()) {
      onChange("");
    }
  };

  return (
    <div
      data-slot="chat-input-field"
      className={cn(
        "bg-muted/40 rounded-lg border transition-all duration-200 relative",
        "border-border/50 hover:border-border/70 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20",
        disabled && "opacity-60 cursor-not-allowed",
        value.length > maxLength &&
          "border-destructive/50 ring-1 ring-destructive/20",
      )}
    >
      <ScrollArea className="max-h-[120px]">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className={cn(
            "resize-none bg-transparent border-0 min-h-[44px]",
            "focus-visible:ring-0 focus-visible:ring-offset-0",
            "px-4 py-3 pr-16 leading-[1.375] text-sm w-full",
            "placeholder:text-muted-foreground/60",
            "transition-all duration-150",
            disabled && "cursor-not-allowed opacity-50",
            value.length > maxLength && "text-destructive",
          )}
          rows={1}
          aria-label="Type a message"
        />
      </ScrollArea>
    </div>
  );
}

// ===========================
// CHAT INPUT ACTIONS - BOTÕES
// ===========================

interface ChatInputActionsProps {
  onSend: () => void;
  canSend: boolean;
  isSending: boolean;
}

export function ChatInputActions({
  onSend,
  canSend,
  isSending,
}: ChatInputActionsProps) {
  return (
    <div
      data-slot="chat-input-actions"
      className="absolute flex items-center bottom-2 right-2 gap-1"
    >
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => console.log("Attachment - TODO")}
        disabled={isSending}
        className="p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 h-7 w-7"
        title="Attach file"
      >
        <Paperclip className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => console.log("Emoji - TODO")}
        disabled={isSending}
        className="p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 h-7 w-7"
        title="Add emoji"
      >
        <Smile className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={onSend}
        disabled={!canSend}
        className={cn(
          "p-0 transition-all duration-150 h-7 w-7",
          canSend
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
          isSending && "animate-pulse",
        )}
        title={canSend ? "Send message" : "Type a message"}
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}

// ===========================
// CHAT WELCOME - BOAS-VINDAS
// ===========================

interface ChatWelcomeProps extends React.ComponentProps<"div"> {
  title?: string;
  description?: string;
  features?: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
}

export function ChatWelcome({
  title = "Welcome to the conversation!",
  description = "This is the beginning of your conversation. Start chatting to get assistance with your projects.",
  features = [],
  className,
  ...props
}: ChatWelcomeProps) {
  const defaultFeatures = [
    {
      icon: "💬",
      title: "Natural Conversation",
      description: "Chat naturally with ease",
    },
    {
      icon: "🎯",
      title: "Specialized Assistance",
      description: "Get specific help for your needs",
    },
    {
      icon: "⚡",
      title: "Quick Responses",
      description: "Get instant and accurate assistance",
    },
  ];

  const displayFeatures = features.length > 0 ? features : defaultFeatures;

  return (
    <div
      data-slot="chat-welcome"
      className={cn(
        "px-6 py-4 mx-auto max-w-2xl lg:max-w-4xl xl:max-w-5xl",
        className,
      )}
      {...props}
    >
      <div className="text-center space-y-3">
        {/* Hero Icon */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center mx-auto border border-primary/20 shadow-lg shadow-primary/10">
            <span className="text-2xl font-bold text-primary">💬</span>
          </div>
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 blur opacity-30 animate-pulse"></div>
        </div>

        {/* Welcome Content */}
        <div className="space-y-3">
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            {displayFeatures.map((feature, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-card border border-border/50 hover:border-border transition-colors"
              >
                <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center mb-2">
                  <span className="text-primary text-sm">{feature.icon}</span>
                </div>
                <h3 className="font-medium text-sm text-foreground mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Separator className="mt-6 opacity-30" />
    </div>
  );
}

// ===========================
// CHAT EMPTY - ESTADO VAZIO
// ===========================

interface ChatEmptyProps extends React.ComponentProps<"div"> {
  icon?: string;
  title?: string;
  description?: string;
}

export function ChatEmpty({
  icon = "💬",
  title = "No messages yet",
  description = "Start a conversation by sending a message.",
  className,
  ...props
}: ChatEmptyProps) {
  return (
    <div
      data-slot="chat-empty"
      className={cn(
        "flex flex-col items-center justify-center py-6 px-6 text-center",
        className,
      )}
      {...props}
    >
      <div className="relative mb-4">
        <div className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center">
          <span className="text-2xl opacity-50">{icon}</span>
        </div>
        <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-muted/10 to-muted/5 blur opacity-20"></div>
      </div>

      <div className="space-y-2 max-w-md lg:max-w-lg xl:max-w-xl">
        <h3 className="text-base font-medium text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
