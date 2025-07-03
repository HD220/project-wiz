import { DirectMessageItem, ChatMessage } from "../../../../shared/types/entities";

export const mockDMs: DirectMessageItem[] = [
  {
    id: "dm-1",
    name: "DevHelper Bot",
    type: "agent",
    avatarUrl: "https://example.com/agent-avatar.png",
    lastMessage: "Sure, I can help! What do you need?",
    timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    unreadCount: 0,
    // messages: [
    //   {
    //     id: "msg-dm1-1",
    //     conversationId: "dm-1",
    //     senderId: "user-123",
    //     content: "Hey DevHelper, can you help me with a Python script?",
    //     timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    //     contentType: "text",
    //   },
    //   {
    //     id: "msg-dm1-2",
    //     conversationId: "dm-1",
    //     senderId: "agent-1",
    //     content: "Sure, I can help! What do you need?",
    //     timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    //     contentType: "text",
    //   },
    // ],
  },
  {
    id: "dm-2",
    name: "Human User 2",
    type: "user",
    avatarUrl: "https://example.com/user-avatar.png",
    lastMessage: "Not yet, been busy. Anything major?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    unreadCount: 1,
    // messages: [
    //   {
    //     id: "msg-dm2-1",
    //     conversationId: "dm-2",
    //     senderId: "human-2",
    //     content: "Did you see the latest project update?",
    //     timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    //     contentType: "text",
    //   },
    //   {
    //     id: "msg-dm2-2",
    //     conversationId: "dm-2",
    //     senderId: "user-123",
    //     content: "Not yet, been busy. Anything major?",
    //     timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    //     contentType: "text",
    //   },
    // ],
  },
];

// Helper to add a message to a DM (simulates receiving/sending new messages)
export const addMessageToMockDM = (
  dmId: string,
  message: ChatMessage
): DirectMessageItem | undefined => {
  const dmIndex = mockDMs.findIndex((dm) => dm.id === dmId);
  if (dmIndex !== -1) {
    // In a real app, you'd update the actual messages array for the DM
    // For this mock, we'll just update lastMessage and timestamp
    mockDMs[dmIndex].lastMessage = message.content;
    mockDMs[dmIndex].timestamp = message.timestamp.toString();
    return mockDMs[dmIndex];
  }
  return undefined;
};