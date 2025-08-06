import * as React from "react";
import { ChatContextValue } from "./chat.types";

export const ChatContext = React.createContext<ChatContextValue | null>(null);

export function useChatContext(): ChatContextValue {
  const context = React.useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a <Chat /> component");
  }
  return context;
}
