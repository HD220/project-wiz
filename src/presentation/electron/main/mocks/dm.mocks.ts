import { DirectMessageItem, ChatMessage } from "@/shared/ipc-types";

export const mockDMs: DirectMessageItem[] = [
  {
    id: "dm-1",
    name: "DevHelper Bot",
    type: "dm",
    avatarUrl: "https://example.com/agent-avatar.png",
    lastMessage: "Sure, I can help! What do you need?",
    timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    unreadCount: 0,
  },
  {
    id: "dm-2",
    name: "Human User 2",
    type: "dm",
    avatarUrl: "https://example.com/user-avatar.png",
    lastMessage: "Not yet, been busy. Anything major?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    unreadCount: 1,
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