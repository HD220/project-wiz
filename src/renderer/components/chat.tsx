import * as React from "react";
import { useEffect, useRef } from "react";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { cn } from "@/renderer/lib/utils";

// ===========================
// CONTAINERS BASE - LAYOUT APENAS (como Card)
// ===========================

export function Chat({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chat"
      className={cn("flex flex-col h-full", className)}
      {...props}
    />
  );
}

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

export function ChatContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chat-content"
      className={cn("flex-1 overflow-hidden", className)}
      {...props}
    />
  );
}

export function ChatFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chat-footer"
      className={cn("flex-shrink-0", className)}
      {...props}
    />
  );
}

// ===========================
// ELEMENTO PRIMITIVO - ITEM GENÉRICO (como TableCell)
// ===========================

export function ChatItem({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="chat-item" className={cn("group", className)} {...props} />
  );
}

// ===========================
// FUNCIONALIDADES MODULARES - OPT-IN
// ===========================

// ChatScrollable - Funcionalidade de scroll automático
interface ChatScrollableProps {
  autoScroll?: boolean;
  initScroll?: boolean;
  scrollDelayMs?: number;
  children: React.ReactNode;
  className?: string;
}

export function ChatScrollable({
  autoScroll = true,
  initScroll = true,
  scrollDelayMs = 100,
  children,
  className,
}: ChatScrollableProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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

    const isInitialLoad = !children || (initScroll && scrollDelayMs === 0);
    const timeoutId = setTimeout(
      () => scrollToBottom(!isInitialLoad),
      isInitialLoad ? 0 : scrollDelayMs,
    );
    return () => clearTimeout(timeoutId);
  }, [children, autoScroll, initScroll, scrollDelayMs]);

  return (
    <ScrollArea ref={scrollAreaRef} className={cn("h-full w-full", className)}>
      {children}
    </ScrollArea>
  );
}

// ChatInput - Sistema de input modular
export function ChatInput({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div data-slot="chat-input" className={cn("", className)} {...props} />
  );
}
