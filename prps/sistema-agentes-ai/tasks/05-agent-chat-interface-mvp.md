# Universal Task Template - Pattern-Based Implementation Guide

> Auto-contained tasks with complete context and patterns for LLM implementation across any project/repository

## Meta Information

```yaml
id: TASK-005
title: Agent Chat Interface - MVP Implementation
description: Implement real-time chat with AI agents using LLM integration
source_document: prps/sistema-agentes-ai/README.md
priority: high
estimated_effort: 4 hours
dependencies: [TASK-001, TASK-002, TASK-003, TASK-004]
tech_stack: [Electron, React, TypeScript, AI SDK, SQLite, Drizzle ORM]
domain_context: Agent System - Core Agent Interaction
project_type: desktop
feature_level: mvp
delivers_value: User can have real conversations with their AI agents
```

## Primary Goal

**Enable users to chat with their AI agents in real-time, with agents responding using their configured LLM providers and personalities**

### Success Criteria
- [ ] User can send messages to specific agents
- [ ] Agents respond using their LLM provider and system prompt
- [ ] Messages are stored persistently in database
- [ ] Chat interface shows conversation history
- [ ] Real-time message updates without page refresh
- [ ] Proper error handling for LLM API failures

## Complete Context

### Project Architecture Context
```
project-wiz/
├── src/
│   ├── main/                    # Backend (Electron main process)
│   │   ├── agents/              # Agent bounded context
│   │   │   ├── agent-chat.service.ts # NEW - Chat with agents
│   │   │   ├── agent-chat.handlers.ts # NEW - IPC handlers
│   │   │   └── llm-providers/   # From TASK-001, TASK-002
│   │   ├── conversations/       # Existing conversation system
│   │   │   ├── messages.schema.ts # Has llmMessagesTable
│   │   │   └── message.service.ts # Message persistence
│   │   └── main.ts              # Handler registration
│   └── renderer/                # Frontend (React)
│       ├── app/                 # TanStack Router pages
│       │   └── agents/          # Agent pages
│       │       └── [agentId]/   # NEW - Agent chat page
│       │           └── chat.tsx
│       ├── components/          # Chat components
│       └── store/               # Chat state management
```

### Technology-Specific Context
```yaml
ai_integration:
  library: AI SDK (@ai-sdk/core)
  pattern: generateText (not streamText) for Electron main process
  providers: OpenAI, DeepSeek via user-configured credentials
  
database:
  existing_tables: llmMessagesTable (role, content, toolCalls, metadata)
  conversation_system: Existing conversation/message infrastructure
  message_storage: Reuse existing message service patterns
  
backend:
  ai_pattern: Create provider instances from stored credentials
  error_handling: Handle API rate limits, invalid keys, network issues
  
frontend:
  chat_ui: Real-time chat interface with message bubbles
  state_management: Chat store with message history
  ux_patterns: Typing indicators, error states, retry mechanisms
```

### Existing Code Patterns
```typescript
// Pattern 1: LLM Provider Integration (from PRP docs)
// Use AI SDK with user's encrypted credentials
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { deepseek } from '@ai-sdk/deepseek';

// Create model from provider configuration
function createModelFromProvider(provider: DecryptedProvider) {
  switch (provider.type) {
    case 'openai':
      return openai(provider.model || 'gpt-4o-mini', {
        apiKey: provider.apiKey,
        baseURL: provider.baseUrl,
      });
    case 'deepseek':
      return deepseek(provider.model || 'deepseek-chat', {
        apiKey: provider.apiKey,
        baseURL: provider.baseUrl,
      });
  }
}

// Pattern 2: Existing Message Schema
// From messages.schema.ts - reuse existing infrastructure
export const llmMessagesTable = sqliteTable("llm_messages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  conversationId: text("conversation_id").notNull(),
  role: text("role").$type<"system" | "user" | "assistant">().notNull(),
  content: text("content").notNull(),
  toolCalls: text("tool_calls"), // JSON string
  metadata: text("metadata"), // JSON for additional data
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Pattern 3: Chat Interface Structure
// Real-time chat with message bubbles and proper UX
const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState("");
  
  const sendMessage = async (content: string) => {
    // Add user message immediately
    const userMessage = { role: "user", content, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      // Send to agent
      const response = await window.api.agents.chat(agentId, content);
      setMessages(prev => [...prev, response.data]);
    } catch (error) {
      // Handle error
    } finally {
      setIsTyping(false);
    }
  };
};
```

### Project-Specific Conventions
```yaml
conversation_patterns:
  - Reuse existing conversation/message infrastructure
  - Create conversation per agent-user pair
  - Store all messages in llmMessagesTable
  - Include agent context in conversation metadata

ai_integration_patterns:
  - Decrypt provider credentials only in main process
  - Use generateText not streamText (Electron limitation)
  - Handle API errors gracefully with user feedback
  - Include agent's system prompt in LLM context

chat_ui_patterns:
  - Message bubbles with user/agent distinction
  - Typing indicators during AI response
  - Auto-scroll to latest messages
  - Error states with retry options
  - Input validation and submission handling
```

### Validation Commands
```bash
npm run type-check       # TypeScript validation
npm run lint             # ESLint checks
npm run dev              # Start development server
npm run quality:check    # All quality checks
```

## Implementation Steps

### Phase 1: Chat Service Layer
```
CREATE src/main/agents/agent-chat.service.ts:
  - IMPLEMENT: Core chat functionality with AI integration
    • Import AI SDK, provider services, conversation services
    • Import crypto for API key decryption
    
  - SERVICE_METHODS:
    ```typescript
    export class AgentChatService {
      
      static async sendMessage(
        agentId: string, 
        userMessage: string, 
        userId: string
      ): Promise<{ userMessage: any; agentResponse: any }> {
        const db = getDatabase();
        
        // 1. Get agent with provider info
        const agent = await AgentService.findByIdWithProvider(agentId);
        if (!agent) throw new Error("Agent not found");
        
        // 2. Get or create conversation between user and agent
        const conversation = await this.getOrCreateConversation(userId, agentId);
        
        // 3. Store user message
        const userMsg = await MessageService.create({
          conversationId: conversation.id,
          role: "user",
          content: userMessage,
          metadata: JSON.stringify({ senderId: userId }),
        });
        
        // 4. Get conversation history for context
        const messageHistory = await MessageService.getByConversationId(
          conversation.id, 
          { limit: 20 } // Last 20 messages for context
        );
        
        // 5. Generate AI response
        const agentResponse = await this.generateAgentResponse(
          agent, 
          messageHistory,
          userMessage
        );
        
        // 6. Store agent response
        const agentMsg = await MessageService.create({
          conversationId: conversation.id,
          role: "assistant",
          content: agentResponse.text,
          metadata: JSON.stringify({ 
            agentId: agentId,
            model: agentResponse.model,
            usage: agentResponse.usage 
          }),
        });
        
        return { userMessage: userMsg, agentResponse: agentMsg };
      }
      
      private static async generateAgentResponse(
        agent: AgentWithProvider,
        messageHistory: Message[],
        currentMessage: string
      ) {
        // Get decrypted provider credentials
        const provider = await LlmProviderService.getDecryptedProvider(agent.providerId);
        
        // Create AI model from provider
        const model = this.createModelFromProvider(provider);
        
        // Build conversation context
        const messages = [
          { role: "system", content: agent.systemPrompt },
          ...messageHistory.slice(-10).map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: "user", content: currentMessage },
        ];
        
        // Generate response using AI SDK
        const result = await generateText({
          model,
          messages,
          temperature: JSON.parse(agent.modelConfig).temperature || 0.7,
          maxTokens: JSON.parse(agent.modelConfig).maxTokens || 2000,
        });
        
        return {
          text: result.text,
          model: provider.model,
          usage: result.usage,
        };
      }
      
      private static createModelFromProvider(provider: DecryptedProvider) {
        switch (provider.type) {
          case 'openai':
            return openai(provider.model || 'gpt-4o-mini', {
              apiKey: provider.apiKey,
              baseURL: provider.baseUrl,
            });
          case 'deepseek':
            return deepseek(provider.model || 'deepseek-chat', {
              apiKey: provider.apiKey,
              baseURL: provider.baseUrl,
            });
          default:
            throw new Error(`Unsupported provider type: ${provider.type}`);
        }
      }
      
      private static async getOrCreateConversation(
        userId: string, 
        agentId: string
      ) {
        // Check for existing conversation between user and agent
        const existing = await ConversationService.findByParticipants([userId, agentId]);
        
        if (existing) return existing;
        
        // Create new conversation
        return await ConversationService.create({
          type: "direct_message",
          name: `Chat with ${agentId}`,
          metadata: JSON.stringify({ 
            isAgentChat: true,
            agentId,
            userId 
          }),
        });
      }
      
      static async getChatHistory(
        agentId: string, 
        userId: string
      ): Promise<Message[]> {
        const conversation = await this.getOrCreateConversation(userId, agentId);
        return await MessageService.getByConversationId(conversation.id);
      }
    }
    ```
    
  - ERROR_HANDLING:
    • API key invalid: "Invalid API key for provider"
    • Rate limiting: "Rate limit exceeded, please try again later"
    • Network errors: "Unable to connect to AI service"
    • Agent not found: "Agent not found or inactive"
  
  - VALIDATE: npm run type-check

UPDATE src/main/agents/agent.service.ts:
  - ADD: findByIdWithProvider method
    • Include provider information in agent query
    • Return agent with decrypted provider data
    • Used by chat service for AI integration
```

### Phase 2: IPC Handlers for Chat
```
CREATE src/main/agents/agent-chat.handlers.ts:
  - IMPLEMENT: Chat-specific IPC handlers
    • Import AgentChatService, error types
    
  - HANDLERS:
    ```typescript
    export function setupAgentChatHandlers(): void {
      
      ipcMain.handle(
        "agents:chat",
        async (_, agentId: string, message: string): Promise<IpcResponse> => {
          try {
            const userId = getCurrentUserId(); // From auth context
            const result = await AgentChatService.sendMessage(agentId, message, userId);
            
            return { 
              success: true, 
              data: {
                userMessage: result.userMessage,
                agentResponse: result.agentResponse,
              }
            };
          } catch (error) {
            let errorMessage = "Failed to send message";
            
            // Handle specific AI API errors
            if (error.name === 'AI_APICallError') {
              if (error.statusCode === 401) {
                errorMessage = "Invalid API key for this agent's provider";
              } else if (error.statusCode === 429) {
                errorMessage = "Rate limit exceeded. Please try again later.";
              } else {
                errorMessage = `AI service error: ${error.message}`;
              }
            }
            
            return {
              success: false,
              error: errorMessage,
            };
          }
        }
      );
      
      ipcMain.handle(
        "agents:chat-history",
        async (_, agentId: string): Promise<IpcResponse> => {
          try {
            const userId = getCurrentUserId();
            const messages = await AgentChatService.getChatHistory(agentId, userId);
            
            return { success: true, data: messages };
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : "Failed to load chat history",
            };
          }
        }
      );
    }
    ```

UPDATE src/main/main.ts:
  - ADD: Import and register setupAgentChatHandlers()
  - PLACE: After other agent handler setups
```

### Phase 3: Frontend Chat Store
```
CREATE src/renderer/store/agent-chat-store.ts:
  - IMPLEMENT: Chat state management
    • Import Zustand, agent types, message types
    
  - STORE_DEFINITION:
    ```typescript
    interface ChatMessage {
      id: string;
      role: "user" | "assistant";
      content: string;
      timestamp: Date;
      agentId?: string;
      error?: string;
    }
    
    interface AgentChatState {
      // Chat data
      messages: Record<string, ChatMessage[]>; // agentId -> messages
      currentAgentId: string | null;
      
      // UI state
      isLoading: boolean;
      isTyping: Record<string, boolean>; // agentId -> typing state
      error: string | null;
      
      // Actions
      sendMessage: (agentId: string, content: string) => Promise<void>;
      loadChatHistory: (agentId: string) => Promise<void>;
      setCurrentAgent: (agentId: string) => void;
      clearError: () => void;
    }
    
    export const useAgentChatStore = create<AgentChatState>((set, get) => ({
      messages: {},
      currentAgentId: null,
      isLoading: false,
      isTyping: {},
      error: null,
      
      sendMessage: async (agentId: string, content: string) => {
        const state = get();
        
        // Add user message immediately (optimistic update)
        const userMessage: ChatMessage = {
          id: `user-${Date.now()}`,
          role: "user",
          content,
          timestamp: new Date(),
        };
        
        set({
          messages: {
            ...state.messages,
            [agentId]: [...(state.messages[agentId] || []), userMessage],
          },
          isTyping: { ...state.isTyping, [agentId]: true },
          error: null,
        });
        
        try {
          const result = await window.api.agents.chat(agentId, content);
          
          if (result.success) {
            // Add agent response
            const agentMessage: ChatMessage = {
              id: result.data.agentResponse.id,
              role: "assistant",
              content: result.data.agentResponse.content,
              timestamp: new Date(result.data.agentResponse.createdAt),
              agentId,
            };
            
            set(state => ({
              messages: {
                ...state.messages,
                [agentId]: [...(state.messages[agentId] || []), agentMessage],
              },
              isTyping: { ...state.isTyping, [agentId]: false },
            }));
          } else {
            throw new Error(result.error);
          }
        } catch (error) {
          // Mark user message as failed and show error
          set(state => ({
            messages: {
              ...state.messages,
              [agentId]: state.messages[agentId]?.map(msg => 
                msg.id === userMessage.id 
                  ? { ...msg, error: error.message }
                  : msg
              ) || [],
            },
            isTyping: { ...state.isTyping, [agentId]: false },
            error: error.message,
          }));
        }
      },
      
      loadChatHistory: async (agentId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await window.api.agents.chatHistory(agentId);
          
          if (result.success) {
            const messages = result.data.map(msg => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              timestamp: new Date(msg.createdAt),
              agentId: msg.metadata?.agentId,
            }));
            
            set(state => ({
              messages: { ...state.messages, [agentId]: messages },
              isLoading: false,
            }));
          }
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      setCurrentAgent: (agentId: string) => {
        set({ currentAgentId: agentId });
        get().loadChatHistory(agentId);
      },
      
      clearError: () => set({ error: null }),
    }));
    ```

UPDATE src/renderer/preload.ts:
  - ADD: Chat API exposure
    ```typescript
    agents: {
      // ... existing methods
      chat: (agentId: string, message: string) => 
        ipcRenderer.invoke("agents:chat", agentId, message),
      chatHistory: (agentId: string) => 
        ipcRenderer.invoke("agents:chat-history", agentId),
    }
    ```

UPDATE src/renderer/window.d.ts:
  - ADD: Type definitions for chat API methods
```

### Phase 4: Chat Interface Components
```
CREATE src/renderer/components/chat/chat-message.tsx:
  - IMPLEMENT: Individual message component
    • Support user and agent message styling
    • Show timestamps and sender information
    • Handle error states for failed messages
    
  - COMPONENT:
    ```tsx
    interface ChatMessageProps {
      message: ChatMessage;
      agent?: AgentWithProvider;
    }
    
    export function ChatMessage({ message, agent }: ChatMessageProps) {
      const isUser = message.role === "user";
      
      return (
        <div className={cn(
          "flex gap-3 mb-4",
          isUser ? "justify-end" : "justify-start"
        )}>
          {!isUser && (
            <Avatar className="h-8 w-8">
              <AvatarImage src={agent?.user.avatar} />
              <AvatarFallback>
                {agent?.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          
          <div className={cn(
            "max-w-[70%] rounded-lg px-4 py-2",
            isUser 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted",
            message.error && "border border-destructive"
          )}>
            <div className="text-sm whitespace-pre-wrap">
              {message.content}
            </div>
            
            {message.error && (
              <div className="mt-2 text-xs text-destructive">
                Failed to send: {message.error}
              </div>
            )}
            
            <div className={cn(
              "text-xs mt-1 opacity-70",
              isUser ? "text-right" : "text-left"
            )}>
              {formatDistanceToNow(message.timestamp, { addSuffix: true })}
            </div>
          </div>
          
          {isUser && (
            <Avatar className="h-8 w-8">
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          )}
        </div>
      );
    }
    ```

CREATE src/renderer/components/chat/typing-indicator.tsx:
  - IMPLEMENT: Typing indicator for agent responses
    • Animated dots or pulse effect
    • Shows agent avatar and "typing..." text
    
  - COMPONENT:
    ```tsx
    interface TypingIndicatorProps {
      agent: AgentWithProvider;
    }
    
    export function TypingIndicator({ agent }: TypingIndicatorProps) {
      return (
        <div className="flex gap-3 mb-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src={agent.user.avatar} />
            <AvatarFallback>
              {agent.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="bg-muted rounded-lg px-4 py-2">
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">
                {agent.name} is typing
              </span>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }
    ```

CREATE src/renderer/components/chat/chat-input.tsx:
  - IMPLEMENT: Message input with send functionality
    • Textarea that grows with content
    • Send button with loading state
    • Enter to send, Shift+Enter for new line
    
  - COMPONENT:
    ```tsx
    interface ChatInputProps {
      onSendMessage: (content: string) => void;
      disabled?: boolean;
      placeholder?: string;
    }
    
    export function ChatInput({ onSendMessage, disabled, placeholder }: ChatInputProps) {
      const [input, setInput] = useState("");
      
      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !disabled) {
          onSendMessage(input.trim());
          setInput("");
        }
      };
      
      const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleSubmit(e);
        }
      };
      
      return (
        <form onSubmit={handleSubmit} className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder || "Type a message..."}
              disabled={disabled}
              className="min-h-[44px] max-h-32 resize-none"
              rows={1}
            />
            <Button 
              type="submit" 
              disabled={!input.trim() || disabled}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      );
    }
    ```
```

### Phase 5: Chat Page Implementation
```
CREATE src/renderer/app/agents/[agentId]/chat.tsx:
  - IMPLEMENT: Main chat page
    • Agent header with info
    • Message list with auto-scroll
    • Chat input component
    • Error handling and loading states
    
  - PAGE_COMPONENT:
    ```tsx
    export default function AgentChatPage() {
      const { agentId } = useParams();
      const navigate = useNavigate();
      
      const { agents } = useAgentStore();
      const { 
        messages, 
        isTyping, 
        error, 
        sendMessage, 
        setCurrentAgent,
        clearError 
      } = useAgentChatStore();
      
      const agent = agents.find(a => a.id === agentId);
      const agentMessages = messages[agentId] || [];
      const isAgentTyping = isTyping[agentId] || false;
      
      const messagesEndRef = useRef<HTMLDivElement>(null);
      
      useEffect(() => {
        if (agentId) {
          setCurrentAgent(agentId);
        }
      }, [agentId, setCurrentAgent]);
      
      useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, [agentMessages, isAgentTyping]);
      
      if (!agent) {
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Agent not found</h2>
              <Button onClick={() => navigate("/agents")}>
                Back to Agents
              </Button>
            </div>
          </div>
        );
      }
      
      return (
        <div className="flex flex-col h-full">
          {/* Chat Header */}
          <div className="border-b p-4">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate("/agents")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <Avatar className="h-10 w-10">
                <AvatarImage src={agent.user.avatar} />
                <AvatarFallback>
                  {agent.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h1 className="font-semibold">{agent.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {agent.role} • {agent.status}
                </p>
              </div>
            </div>
          </div>
          
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="m-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2"
                  onClick={clearError}
                >
                  Dismiss
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {agentMessages.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  Start a conversation with {agent.name}
                </div>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {agent.backstory}
                </p>
              </div>
            ) : (
              <>
                {agentMessages.map((message) => (
                  <ChatMessage 
                    key={message.id} 
                    message={message} 
                    agent={agent}
                  />
                ))}
                
                {isAgentTyping && <TypingIndicator agent={agent} />}
                
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
          
          {/* Chat Input */}
          <ChatInput
            onSendMessage={(content) => sendMessage(agentId, content)}
            disabled={isAgentTyping}
            placeholder={`Message ${agent.name}...`}
          />
        </div>
      );
    }
    ```

UPDATE src/renderer/app/agents/[agentId]/index.tsx:
  - ADD: Agent detail page that can navigate to chat
  - INCLUDE: "Start Chat" button linking to chat page

UPDATE Agent list components:
  - MODIFY: AgentCard component to include chat link
  - ADD: Quick chat button on agent cards
```

### Phase 6: Integration and Polish
```
UPDATE src/renderer/components/agent-card.tsx:
  - ADD: Chat button to agent cards
    ```tsx
    <CardContent>
      {/* ... existing content ... */}
      
      <div className="flex gap-2 mt-4">
        <Button 
          variant="outline" 
          size="sm" 
          asChild
          className="flex-1"
        >
          <Link to={`/agents/${agent.id}/chat`}>
            <MessageCircle className="mr-2 h-4 w-4" />
            Chat
          </Link>
        </Button>
        
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </CardContent>
    ```

ADD navigation routes:
  - CONFIGURE: TanStack Router for /agents/[agentId]/chat
  - ENSURE: Proper route parameters and navigation

ENHANCE error handling:
  - ADD: Retry mechanisms for failed messages
  - IMPLEMENT: Network connectivity checks
  - PROVIDE: Clear error messages for different failure types
```

## Validation Checkpoints

### Checkpoint 1: Backend AI Integration
```
VALIDATE_AI_INTEGRATION:
  - TEST: AgentChatService.sendMessage with valid agent
  - VERIFY: AI SDK generates responses correctly
  - CHECK: Provider credentials are decrypted properly
  - CONFIRM: Messages are stored in database
```

### Checkpoint 2: IPC Communication
```
VALIDATE_IPC:
  - START: npm run dev
  - TEST: window.api.agents.chat(agentId, "Hello")
  - VERIFY: Returns user message and agent response
  - CHECK: Error handling for invalid agent/provider
```

### Checkpoint 3: Chat Interface
```
VALIDATE_UI:
  - NAVIGATE: To agent chat page
  - SEND: Test message to agent
  - VERIFY: Message appears immediately
  - CHECK: Agent response appears after processing
  - TEST: Typing indicator shows during response
```

### Checkpoint 4: End-to-End Flow
```
VALIDATE_E2E:
  - CREATE: New agent with valid provider
  - NAVIGATE: To chat interface
  - SEND: Multiple messages in conversation
  - VERIFY: Context is maintained across messages
  - CHECK: Chat history persists on page refresh
```

## Use Cases & Examples

### Example Conversation Flow
```typescript
// Example chat session
const conversationExample = [
  {
    role: "user",
    content: "Hi Alex, can you help me with a React component?",
    timestamp: "2024-01-15T10:00:00Z"
  },
  {
    role: "assistant", 
    content: "Hello! I'd be happy to help you with React components. What specifically are you working on? Are you building a new component or having issues with an existing one?",
    timestamp: "2024-01-15T10:00:05Z"
  },
  {
    role: "user",
    content: "I need to create a reusable button component with different variants.",
    timestamp: "2024-01-15T10:01:00Z"
  },
  {
    role: "assistant",
    content: "Great choice! A reusable button component is essential. Here's a TypeScript approach using variants...\n\n```tsx\ninterface ButtonProps {\n  variant: 'primary' | 'secondary' | 'danger';\n  children: React.ReactNode;\n  onClick?: () => void;\n}\n\nexport function Button({ variant, children, onClick }: ButtonProps) {\n  // Implementation here\n}\n```\n\nWould you like me to complete this implementation or do you have specific styling requirements?",
    timestamp: "2024-01-15T10:01:15Z"
  }
];
```

### Common Scenarios
1. **Code Help**: User asks agent for programming assistance
2. **Project Planning**: Agent helps organize tasks and priorities  
3. **Code Review**: User shares code for agent feedback
4. **Learning**: User asks agent to explain concepts or patterns

### Edge Cases & Error Scenarios
- **Invalid API Key**: Clear error message with provider configuration link
- **Rate Limiting**: Graceful degradation with retry timing
- **Network Issues**: Offline indicator and message queuing
- **Long Messages**: Text truncation and expansion options
- **Agent Unavailable**: Status-based chat availability

## Troubleshooting Guide

### Common Issues

#### AI Integration Issues
```
PROBLEM: Agent doesn't respond to messages
SOLUTION:
  - Check agent's provider has valid API key
  - Verify provider credentials are decrypted correctly
  - Test AI SDK connection with manual request
  - Check agent system prompt is properly formatted

PROBLEM: AI responses are poor quality
SOLUTION:
  - Review agent's system prompt and backstory
  - Adjust model configuration (temperature, maxTokens)
  - Check conversation context length
  - Verify model selection is appropriate
```

#### Chat Interface Issues
```
PROBLEM: Messages don't appear in real-time
SOLUTION:
  - Check store subscription in components
  - Verify optimistic updates are working
  - Ensure useEffect dependencies are correct
  - Test store actions in isolation

PROBLEM: Typing indicator stuck or missing
SOLUTION:
  - Check isTyping state management in store
  - Verify typing state is cleared on error/success
  - Test with slow network to see timing
  - Check animation CSS is loaded
```

#### Database and Persistence Issues
```
PROBLEM: Chat history not loading
SOLUTION:
  - Verify conversation creation logic
  - Check message storage in database
  - Test ConversationService.findByParticipants
  - Ensure foreign key relationships work

PROBLEM: Messages lost on page refresh
SOLUTION:
  - Check chat history loading on component mount
  - Verify message persistence in database
  - Test getChatHistory service method
  - Ensure conversation ID is consistent
```

### Debug Commands
```bash
# Test AI SDK directly
npm run dev
# Console: generateText test

# Check database messages
npm run db:studio
# View llm_messages table

# Test store actions
# Console: useAgentChatStore.getState()

# Verify IPC handlers
# Console: window.api.agents.chat('agent-id', 'test')
```

## Dependencies & Prerequisites

### Required Files/Components
- [x] Agent creation and listing (TASK-003, TASK-004)
- [x] LLM provider system (TASK-001, TASK-002)
- [x] Existing conversation/message infrastructure
- [x] AI SDK installation and configuration
- [x] Shadcn/ui chat-related components
- [x] TanStack Router for agent pages

### Required Patterns/Conventions
- [x] Service layer patterns with error handling
- [x] IPC response wrapper patterns
- [x] Chat UI patterns and components
- [x] Real-time state management
- [x] Database conversation patterns

### Environment Setup
- [x] AI SDK providers installed (@ai-sdk/openai, @ai-sdk/deepseek)
- [x] Valid LLM provider with API key configured
- [x] Agent created and linked to provider
- [x] Development server with database

---

## Task Completion Checklist

- [ ] Agent chat service integrates with AI SDK
- [ ] Messages are stored persistently in database
- [ ] Chat interface shows real-time conversation
- [ ] Typing indicators work during AI responses
- [ ] Error handling covers all failure scenarios
- [ ] Chat history loads and persists correctly
- [ ] Agent personality shows through responses
- [ ] UI is responsive and accessible
- [ ] Navigation between agents and chat works
- [ ] No TypeScript or linting errors

**Final Validation**: Run `npm run quality:check` and ensure all automated checks pass.

**Delivers**: After completing this task, users can have natural conversations with their AI agents, experiencing the personality and expertise they configured, with full persistence and real-time interaction.