import { useChatData } from "../hooks/use-chat-data";
import { AsyncBoundary } from "@/renderer/components/common/async-boundary";
import MessageList from "./message-list";
import MessageInput from "./message-input";

interface ChatWindowProps {
  conversationId: string;
}

function ChatWindow({ conversationId }: ChatWindowProps) {
  const {
    messages,
    isLoading,
    error,
    newMessage,
    setNewMessage,
    handleSendMessage,
    senderId,
  } = useChatData({ conversationId });

  return (
    <div className="flex flex-col h-full p-4">
      <AsyncBoundary isLoading={isLoading} error={error}>
        <MessageList messages={messages} senderId={senderId} />
        <MessageInput
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          handleSendMessage={handleSendMessage}
        />
      </AsyncBoundary>
    </div>
  );
}

export { ChatWindow };
