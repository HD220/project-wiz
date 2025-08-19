import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/renderer/lib/utils";

import { ChatContext, type ChatContextValue } from "./chat.context";
import { useChat } from "./hooks/use-chat.hook";

const chatVariants = cva("flex h-full flex-col bg-background text-foreground", {
  variants: {
    variant: {
      default: "border border-input rounded-md shadow-xs",
      ghost: "",
      bordered: "border-2 border-input rounded-lg shadow-sm",
      filled: "bg-muted/30 border-0 rounded-lg",
    },
    size: {
      default: "min-h-[400px]",
      sm: "min-h-[300px]",
      lg: "min-h-[600px]",
      xl: "min-h-[800px]",
      full: "h-full",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

interface ChatProps extends Omit<React.ComponentProps<"div">, "defaultValue"> {
  children: React.ReactNode;
  keyFn: (item: unknown, index: number) => string | number;
  value?: unknown[];
  defaultValue?: unknown[];
  onValueChange?: (messages: unknown[]) => void;
  onSend?: (input: string, context: ChatContextValue) => void;
  onMessageUpdate?: (
    id: string | number,
    updates: Record<string, unknown>,
    context: ChatContextValue,
  ) => void;
  onMessageRemove?: (id: string | number, context: ChatContextValue) => void;
  onClear?: (context: ChatContextValue) => void;
  variant?: VariantProps<typeof chatVariants>["variant"];
  size?: VariantProps<typeof chatVariants>["size"];
  disabled?: boolean;
}

function Chat({
  className,
  children,
  value,
  defaultValue = [],
  onValueChange,
  onSend,
  onMessageUpdate,
  onMessageRemove,
  onClear,
  keyFn,
  variant,
  size,
  disabled = false,
  ...props
}: ChatProps) {
  const chat = useChat({
    defaultMessages: defaultValue,
    keyFn,
    onValueChange,
    onSend,
    onMessageUpdate,
    onMessageRemove,
    onClear,
    value,
    disabled,
  });

  return (
    <ChatContext.Provider value={chat.contextValue}>
      <div
        data-slot="chat"
        className={cn(
          chatVariants({ variant, size }),
          disabled && "opacity-50 pointer-events-none",
          className,
        )}
        role="log"
        aria-label="Chat conversation"
        aria-live="polite"
        {...props}
      >
        {children}
      </div>
    </ChatContext.Provider>
  );
}

export { Chat, chatVariants };
