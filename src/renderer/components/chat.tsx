import * as React from "react";
import { useEffect, useRef } from "react";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { cn } from "@/renderer/lib/utils";

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
// CHAT MESSAGES - CONTAINER PURO
// ===========================

export function ChatMessages({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chat-messages"
      className={cn("flex-1 overflow-hidden", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ===========================
// CHAT MESSAGES SCROLLABLE - FUNCIONALIDADE GENÉRICA
// ===========================

interface ChatMessagesScrollableProps {
  autoScroll?: boolean;
  initScroll?: boolean;
  scrollDelayMs?: number;
  children: React.ReactNode;
}

export function ChatMessagesScrollable({
  autoScroll = true,
  initScroll = true,
  scrollDelayMs = 100,
  children,
}: ChatMessagesScrollableProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when children change
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

    // Immediate scroll for initial load, smooth scroll for updates
    const isInitialLoad = !children || (initScroll && scrollDelayMs === 0);
    const timeoutId = setTimeout(
      () => scrollToBottom(!isInitialLoad),
      isInitialLoad ? 0 : scrollDelayMs,
    );
    return () => clearTimeout(timeoutId);
  }, [children, autoScroll, initScroll, scrollDelayMs]);

  return (
    <ScrollArea ref={scrollAreaRef} className="h-full w-full">
      <div className="min-h-full flex flex-col">
        <div className="flex-1">
          <div className="px-4 py-2">{children}</div>
        </div>
        <div className="h-2" />
      </div>
    </ScrollArea>
  );
}

// ===========================
// CHAT GROUP - CONTAINER PURO
// ===========================

export function ChatGroup({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chat-group"
      className={cn("animate-in fade-in duration-200", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ===========================
// CHAT MESSAGE - CONTAINER PURO
// ===========================

export function ChatMessage({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chat-message"
      className={cn(
        "relative flex gap-3 group px-4 py-0.5 hover:bg-muted/30 transition-colors",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ===========================
// CHAT MESSAGE AVATAR
// ===========================

interface ChatMessageAvatarProps extends React.ComponentProps<"div"> {}

export function ChatMessageAvatar({
  className,
  children,
  ...props
}: ChatMessageAvatarProps) {
  return (
    <div
      data-slot="chat-message-avatar"
      className={cn("flex-shrink-0 w-10", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ===========================
// CHAT MESSAGE META - METADADOS
// ===========================

interface ChatMessageMetaProps extends React.ComponentProps<"div"> {}

export function ChatMessageMeta({
  className,
  children,
  ...props
}: ChatMessageMetaProps) {
  return (
    <div
      data-slot="chat-message-meta"
      className={cn("flex items-baseline gap-2 mb-1", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ===========================
// CHAT MESSAGE CONTENT - CONTEÚDO
// ===========================

interface ChatMessageContentProps extends React.ComponentProps<"div"> {}

export function ChatMessageContent({
  className,
  children,
  ...props
}: ChatMessageContentProps) {
  return (
    <div
      data-slot="chat-message-content"
      className={cn("flex-1 min-w-0", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ===========================
// CHAT MESSAGE STATUS - CONTAINER GENÉRICO
// ===========================

export function ChatMessageStatus({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chat-message-status"
      className={cn("flex items-center gap-2 mt-1", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ===========================
// CHAT INPUT - CONTAINER GENÉRICO
// ===========================

export function ChatInput({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chat-input"
      className={cn("bg-background border-t border-border/60", className)}
      {...props}
    >
      {children}
    </div>
  );
}
