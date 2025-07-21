import type {
  ConversationWithParticipants,
  ConversationWithMessagesAndParticipants,
  AuthenticatedUser,
  MessageWithLlmData,
  CreateConversationInput,
  SendMessageInput,
} from "./conversation.types";

// Mock data - Available users (including AI agents as regular users)
const MOCK_AVAILABLE_USERS: AuthenticatedUser[] = [
  {
    id: "user-1",
    name: "João Silva",
    username: "joao.silva",
    avatar: null,
    type: "human",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "user-2", 
    name: "Maria Santos",
    username: "maria.santos",
    avatar: null,
    type: "human",
    createdAt: new Date("2024-01-16"),
    updatedAt: new Date("2024-01-16"),
  },
  {
    id: "agent-1",
    name: "Claude Assistant",
    username: "claude.assistant",
    avatar: null,
    type: "agent",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
  },
  {
    id: "agent-2",
    name: "GPT-4 Helper", 
    username: "gpt4.helper",
    avatar: null,
    type: "agent",
    createdAt: new Date("2024-01-11"),
    updatedAt: new Date("2024-01-11"),
  },
];

// Mock conversations
const MOCK_CONVERSATIONS: ConversationWithParticipants[] = [
  {
    id: "conv-1",
    name: "João Silva", // 1:1 DM - name is other participant
    description: null,
    type: "dm",
    agentId: null,
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-21"),
    participants: [
      {
        id: "part-1",
        conversationId: "conv-1",
        participantId: "demo", // current user
        createdAt: new Date("2024-01-20"),
        updatedAt: new Date("2024-01-20"),
      },
      {
        id: "part-2", 
        conversationId: "conv-1",
        participantId: "user-1",
        createdAt: new Date("2024-01-20"),
        updatedAt: new Date("2024-01-20"),
      }
    ],
  },
  {
    id: "conv-2",
    name: "Grupo Design",
    description: "Discussão sobre UI/UX",
    type: "dm",
    agentId: null,
    createdAt: new Date("2024-01-18"),
    updatedAt: new Date("2024-01-21"),
    participants: [
      {
        id: "part-3",
        conversationId: "conv-2", 
        participantId: "demo", // current user
        createdAt: new Date("2024-01-18"),
        updatedAt: new Date("2024-01-18"),
      },
      {
        id: "part-4",
        conversationId: "conv-2",
        participantId: "user-2",
        createdAt: new Date("2024-01-18"),
        updatedAt: new Date("2024-01-18"),
      },
      {
        id: "part-5",
        conversationId: "conv-2",
        participantId: "agent-1",
        createdAt: new Date("2024-01-18"),
        updatedAt: new Date("2024-01-18"),
      }
    ],
  },
  {
    id: "conv-3",
    name: "Claude Assistant",
    description: null,
    type: "dm",
    agentId: null,
    createdAt: new Date("2024-01-19"),
    updatedAt: new Date("2024-01-20"),
    participants: [
      {
        id: "part-6",
        conversationId: "conv-3",
        participantId: "demo", // current user
        createdAt: new Date("2024-01-19"),
        updatedAt: new Date("2024-01-19"),
      },
      {
        id: "part-7",
        conversationId: "conv-3", 
        participantId: "agent-1",
        createdAt: new Date("2024-01-19"),
        updatedAt: new Date("2024-01-19"),
      }
    ],
  },
];

// Mock messages for conversations
const MOCK_MESSAGES: Record<string, MessageWithLlmData[]> = {
  "conv-1": [
    {
      id: "msg-1",
      conversationId: "conv-1",
      authorId: "user-1", 
      content: "Olá! Como vai o projeto?",
      createdAt: new Date("2024-01-21T10:00:00Z"),
      updatedAt: new Date("2024-01-21T10:00:00Z"),
    },
    {
      id: "msg-2",
      conversationId: "conv-1",
      authorId: "demo",
      content: "Oi João! Está indo bem, terminei a parte do frontend ontem.",
      createdAt: new Date("2024-01-21T10:05:00Z"),
      updatedAt: new Date("2024-01-21T10:05:00Z"),
    },
    {
      id: "msg-3",
      conversationId: "conv-1", 
      authorId: "user-1",
      content: "Perfeito! Vou revisar quando possível.",
      createdAt: new Date("2024-01-21T10:10:00Z"),
      updatedAt: new Date("2024-01-21T10:10:00Z"),
    },
  ],
  "conv-2": [
    {
      id: "msg-4",
      conversationId: "conv-2",
      authorId: "user-2",
      content: "Pessoal, o que acham dessa nova paleta de cores?",
      createdAt: new Date("2024-01-21T09:00:00Z"),
      updatedAt: new Date("2024-01-21T09:00:00Z"),
    },
    {
      id: "msg-5",
      conversationId: "conv-2",
      authorId: "agent-1",
      content: "A paleta está muito boa! As cores se complementam bem e mantêm boa legibilidade.",
      createdAt: new Date("2024-01-21T09:05:00Z"),
      updatedAt: new Date("2024-01-21T09:05:00Z"),
    },
    {
      id: "msg-6", 
      conversationId: "conv-2",
      authorId: "demo",
      content: "Concordo com o Claude. Podemos testar com alguns usuários?",
      createdAt: new Date("2024-01-21T09:10:00Z"),
      updatedAt: new Date("2024-01-21T09:10:00Z"),
    },
  ],
  "conv-3": [
    {
      id: "msg-7",
      conversationId: "conv-3",
      authorId: "demo",
      content: "Oi Claude, preciso de ajuda com um problema no React.",
      createdAt: new Date("2024-01-20T14:00:00Z"),
      updatedAt: new Date("2024-01-20T14:00:00Z"), 
    },
    {
      id: "msg-8",
      conversationId: "conv-3",
      authorId: "agent-1",
      content: "Claro! Qual é o problema que você está enfrentando? Pode mostrar o código?",
      createdAt: new Date("2024-01-20T14:01:00Z"),
      updatedAt: new Date("2024-01-20T14:01:00Z"),
    },
  ],
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const conversationApi = {
  // Get all DM conversations for current user
  getUserConversations: async (): Promise<ConversationWithParticipants[]> => {
    await delay(500);
    // Filter only DM type conversations
    return MOCK_CONVERSATIONS.filter(conv => conv.type === "dm");
  },

  // Get specific conversation with messages
  getConversationWithMessages: async (conversationId: string): Promise<ConversationWithMessagesAndParticipants | null> => {
    await delay(300);
    
    const conversation = MOCK_CONVERSATIONS.find(conv => conv.id === conversationId);
    if (!conversation) return null;

    const messages = MOCK_MESSAGES[conversationId] || [];

    return {
      ...conversation,
      messages,
    };
  },

  // Get available users for creating conversations
  getAvailableUsers: async (): Promise<AuthenticatedUser[]> => {
    await delay(200);
    return MOCK_AVAILABLE_USERS;
  },

  // Create new conversation
  createConversation: async (participantIds: string[]): Promise<ConversationWithParticipants> => {
    await delay(800);

    // Generate new conversation
    const conversationId = `conv-${Date.now()}`;
    const participants = [
      {
        id: `part-${Date.now()}-1`,
        conversationId,
        participantId: "demo", // current user
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      ...participantIds.map((participantId, index) => ({
        id: `part-${Date.now()}-${index + 2}`,
        conversationId,
        participantId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    ];

    // Determine conversation name based on participants
    let conversationName = "New Conversation";
    if (participantIds.length === 1) {
      // 1:1 conversation - use other participant's name
      const otherUser = MOCK_AVAILABLE_USERS.find(user => user.id === participantIds[0]);
      conversationName = otherUser?.name || "Unknown User";
    } else if (participantIds.length > 1) {
      // Group conversation - create generic name (could be customizable)
      conversationName = `Grupo ${participantIds.length + 1} pessoas`;
    }

    const newConversation: ConversationWithParticipants = {
      id: conversationId,
      name: conversationName,
      description: null,
      type: "dm",
      agentId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      participants,
    };

    // Add to mock data
    MOCK_CONVERSATIONS.unshift(newConversation);
    MOCK_MESSAGES[conversationId] = [];

    return newConversation;
  },

  // Send message to conversation
  sendMessage: async (input: SendMessageInput): Promise<MessageWithLlmData> => {
    await delay(400);

    const message: MessageWithLlmData = {
      id: `msg-${Date.now()}`,
      conversationId: input.conversationId,
      authorId: input.authorId,
      content: input.content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add to mock messages
    if (!MOCK_MESSAGES[input.conversationId]) {
      MOCK_MESSAGES[input.conversationId] = [];
    }
    MOCK_MESSAGES[input.conversationId].push(message);

    // Update conversation's updatedAt
    const conversation = MOCK_CONVERSATIONS.find(conv => conv.id === input.conversationId);
    if (conversation) {
      conversation.updatedAt = new Date();
    }

    return message;
  },

  // Get user by ID (helper function)
  getUserById: async (userId: string): Promise<AuthenticatedUser | null> => {
    await delay(100);
    return MOCK_AVAILABLE_USERS.find(user => user.id === userId) || null;
  },
};