import { Badge } from "@/renderer/components/ui/badge";
import { Separator } from "@/renderer/components/ui/separator";
import {
  ProfileAvatar,
  ProfileAvatarImage,
  ProfileAvatarStatus,
} from "@/components/profile-avatar";
import { Button } from "@/renderer/components/ui/button";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { Textarea } from "@/renderer/components/ui/textarea";
import { Send, Paperclip, Smile } from "lucide-react";
import { cn } from "@/renderer/lib/utils";
import { useState, useRef, useEffect } from "react";

// ===========================
// WELCOME MESSAGE - COMPONENTE ESPECÍFICO
// ===========================

interface WelcomeMessageProps {
  chatType: "dm" | "channel";
  displayName: string;
  isArchived?: boolean;
}

export function WelcomeMessage({
  chatType,
  displayName,
  isArchived = false,
}: WelcomeMessageProps) {
  const emoji = chatType === "dm" ? "💬" : "#";
  const description = isArchived
    ? `This ${chatType === "dm" ? "conversation" : "channel"} has been archived and cannot receive new messages.`
    : `This is the beginning of your ${chatType === "dm" ? "conversation" : "channel"}. Start chatting with the AI agent to get assistance with your projects.`;

  const features = [
    {
      icon: "💬",
      title: "Natural Conversation",
      description: "Chat naturally with the AI agent",
    },
    {
      icon: "🎯",
      title: "Specialized Assistance",
      description: "Get specific help for development",
    },
    {
      icon: "⚡",
      title: "Quick Responses",
      description: "Get instant and accurate assistance",
    },
  ];

  return (
    <div className="text-center space-y-3">
      {/* Hero Icon */}
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center mx-auto border border-primary/20 shadow-lg shadow-primary/10">
          <span className="text-2xl font-bold text-primary">
            {typeof emoji === "string"
              ? emoji
              : displayName?.charAt(0).toUpperCase() || "#"}
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
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-card border border-border/50 hover:border-border transition-colors"
              >
                <div
                  className={cn(
                    "w-7 h-7 rounded-md flex items-center justify-center mb-2",
                    index === 0 && "bg-chart-2/10",
                    index === 1 && "bg-chart-5/10",
                    index === 2 && "bg-chart-4/10",
                  )}
                >
                  <span
                    className={cn(
                      "text-sm",
                      index === 0 && "text-chart-2",
                      index === 1 && "text-chart-5",
                      index === 2 && "text-chart-4",
                    )}
                  >
                    {feature.icon}
                  </span>
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
        )}
      </div>

      <Separator className="mt-6 opacity-30" />
    </div>
  );
}

// ===========================
// EMPTY STATE - COMPONENTE ESPECÍFICO
// ===========================

interface EmptyStateProps {
  chatType: "dm" | "channel";
  isArchived?: boolean;
}

export function EmptyState({ chatType, isArchived = false }: EmptyStateProps) {
  const entityName = chatType === "dm" ? "Conversation" : "Channel";
  const emoji = isArchived ? "📁" : chatType === "dm" ? "💬" : "#";

  return (
    <>
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
    </>
  );
}

// ===========================
// INACTIVE BADGE - COMPONENTE ESPECÍFICO
// ===========================

export function InactiveBadge() {
  return (
    <Badge
      variant="outline"
      className="h-4 px-1.5 text-xs bg-muted/40 text-muted-foreground border-muted-foreground/20"
    >
      Inactive
    </Badge>
  );
}

// ===========================
// AUTHOR AVATAR - COMPONENTE ESPECÍFICO
// ===========================

interface AuthorAvatarProps {
  id: string;
  name: string;
  avatar?: string;
  isInactive?: boolean;
}

export function AuthorAvatar({
  id,
  name,
  avatar,
  isInactive = false,
}: AuthorAvatarProps) {
  const authorInitials = name.charAt(0).toUpperCase();

  return (
    <ProfileAvatar size="md">
      <ProfileAvatarImage
        src={!isInactive ? avatar : undefined}
        name={!isInactive ? name : undefined}
        fallbackIcon={isInactive ? "?" : authorInitials}
        className={isInactive ? "opacity-60 grayscale" : undefined}
      />
      {!isInactive && <ProfileAvatarStatus id={id} size="md" />}
    </ProfileAvatar>
  );
}

// ===========================
// ARCHIVED INPUT REPLACEMENT - COMPONENTE ESPECÍFICO
// ===========================

interface ArchivedInputReplacementProps {
  entityName: string;
}

export function ArchivedInputReplacement({
  entityName,
}: ArchivedInputReplacementProps) {
  return (
    <div className="bg-muted/20 px-4 py-3 border-t border-border/50">
      <div className="flex items-center justify-center gap-3 text-muted-foreground max-w-md mx-auto">
        <div className="w-6 h-6 rounded-full bg-muted/30 flex items-center justify-center flex-shrink-0">
          <span className="text-sm">📁</span>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium mb-0.5">
            Archived {entityName.charAt(0).toUpperCase() + entityName.slice(1)}
          </p>
          <p className="text-xs text-muted-foreground/80">
            This {entityName} has been archived. Unarchive to send messages.
          </p>
        </div>
      </div>
    </div>
  );
}

// ===========================
// FUNCTIONAL CHAT INPUT - COMPONENTE ESPECÍFICO COM LÓGICA
// ===========================

interface FunctionalChatInputProps {
  onSend: (content: string) => Promise<void>;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
}

export function FunctionalChatInput({
  onSend,
  placeholder = "Type a message...",
  maxLength = 2000,
  disabled = false,
}: FunctionalChatInputProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Restore focus when not disabled
  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

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
      setMessage(""); // Clear immediately for better UX
      await onSend(trimmedMessage);
    } catch (error) {
      // Restore message on error so user doesn't lose their work
      setMessage(trimmedMessage);
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }

    if (event.key === "Escape" && message.trim()) {
      setMessage("");
    }
  };

  const canSend = !!message.trim() && !disabled && !isSending;

  return (
    <div className="px-4 py-3">
      <div className="relative">
        <div
          className={cn(
            "bg-muted/40 rounded-lg border transition-all duration-200 relative",
            "border-border/50 hover:border-border/70 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20",
            disabled && "opacity-60 cursor-not-allowed",
            message.length > maxLength &&
              "border-destructive/50 ring-1 ring-destructive/20",
          )}
        >
          <ScrollArea className="max-h-[120px]">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isSending}
              maxLength={maxLength}
              className={cn(
                "resize-none bg-transparent border-0 min-h-[44px]",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "px-4 py-3 pr-16 leading-[1.375] text-sm w-full",
                "placeholder:text-muted-foreground/60",
                "transition-all duration-150",
                disabled && "cursor-not-allowed opacity-50",
                message.length > maxLength && "text-destructive",
              )}
              rows={1}
              aria-label="Type a message"
            />
          </ScrollArea>

          {/* Action buttons */}
          <div className="absolute flex items-center bottom-2 right-2 gap-1">
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
              onClick={handleSend}
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
// CHAT WELCOME - COMPONENTE ESPECÍFICO PARA ESTADOS
// ===========================

interface ChatWelcomeProps {
  className?: string;
  children: React.ReactNode;
}

export function ChatWelcome({ className, children }: ChatWelcomeProps) {
  return (
    <div
      className={cn(
        "px-6 py-4 mx-auto max-w-2xl lg:max-w-4xl xl:max-w-5xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ===========================
// CHAT EMPTY - COMPONENTE ESPECÍFICO PARA ESTADOS
// ===========================

interface ChatEmptyProps {
  className?: string;
  children: React.ReactNode;
}

export function ChatEmpty({ className, children }: ChatEmptyProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-6 px-6 text-center",
        className,
      )}
    >
      {children}
    </div>
  );
}
