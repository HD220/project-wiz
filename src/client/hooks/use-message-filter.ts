import { useState, useMemo } from "react";

interface Message {
  content: string;
  role: string;
  [key: string]: any;
}

/**
 * Hook to filter messages by content or role.
 * Returns filtered messages, filter value, and setter.
 */
export function useMessageFilter<T extends Message>(messages: T[]) {
  const [filter, setFilter] = useState("");

  const filteredMessages = useMemo(
    () =>
      messages.filter(
        (msg) =>
          msg.content.toLowerCase().includes(filter.toLowerCase()) ||
          msg.role.toLowerCase().includes(filter.toLowerCase())
      ),
    [messages, filter]
  );

  return { filter, setFilter, filteredMessages };
}