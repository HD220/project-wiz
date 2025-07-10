import React, { useState } from "react";

import { ChatWindow } from "./components/chat-window";
import { ConversationList } from "./components/conversation-list";

function DirectMessagesFeature() {
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);

  return (
    <div className="flex h-full">
      <div className="w-1/4 border-r border-gray-200">
        <ConversationList onSelectConversation={setSelectedConversation} />
      </div>
      <div className="flex-1">
        {selectedConversation ? (
          <ChatWindow conversationId={selectedConversation} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
}

export { DirectMessagesFeature };
