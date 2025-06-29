import { DirectMessage, Message } from '../../../../shared/types/entities';

export const mockDMs: DirectMessage[] = [
  {
    id: 'dm-1',
    participantIds: ['user-123', 'agent-1'], // DM between user and DevHelper Bot
    messages: [
      {
        id: 'msg-dm1-1',
        conversationId: 'dm-1',
        senderId: 'user-123',
        content: 'Hey DevHelper, can you help me with a Python script?',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
        contentType: 'text',
      },
      {
        id: 'msg-dm1-2',
        conversationId: 'dm-1',
        senderId: 'agent-1',
        content: 'Sure, I can help! What do you need?',
        timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(), // 4 minutes ago
        contentType: 'text',
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 minutes ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
  },
  {
    id: 'dm-2',
    participantIds: ['user-123', 'human-2'], // DM between user and another human (mock)
    messages: [
      {
        id: 'msg-dm2-1',
        conversationId: 'dm-2',
        senderId: 'human-2',
        content: 'Did you see the latest project update?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        contentType: 'text',
      },
      {
        id: 'msg-dm2-2',
        conversationId: 'dm-2',
        senderId: 'user-123',
        content: 'Not yet, been busy. Anything major?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(), // 1 hour ago
        contentType: 'text',
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
  },
];

// Helper to add a message to a DM (simulates receiving/sending new messages)
export const addMessageToMockDM = (dmId: string, message: Message): DirectMessage | undefined => {
  const dmIndex = mockDMs.findIndex(dm => dm.id === dmId);
  if (dmIndex !== -1) {
    mockDMs[dmIndex].messages.push(message);
    mockDMs[dmIndex].updatedAt = new Date().toISOString();
    return mockDMs[dmIndex];
  }
  return undefined;
};
