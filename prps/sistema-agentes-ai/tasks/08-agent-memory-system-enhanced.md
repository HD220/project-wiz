# Universal Task Template - Pattern-Based Implementation Guide

> Auto-contained tasks with complete context and patterns for LLM implementation across any project/repository

## Meta Information

```yaml
id: TASK-008
title: Agent Memory System - Enhanced Implementation
description: Implement persistent memory system for agents to maintain context across conversations
source_document: prps/sistema-agentes-ai/README.md
priority: medium
estimated_effort: 3.5 hours
dependencies: [TASK-003, TASK-005]
tech_stack: [Electron, React, TypeScript, SQLite, Drizzle ORM]
domain_context: Agent System - Memory and Context Management
project_type: desktop
feature_level: enhanced
delivers_value: Agents remember context across sessions and learn from interactions
```

## Primary Goal

**Enable agents to maintain persistent memory of conversations, user preferences, and learnings to provide contextual and personalized interactions**

### Success Criteria
- [ ] Agents store conversation memories with importance scoring
- [ ] Memory retrieval prioritizes recent and important information
- [ ] Agents maintain context across multiple chat sessions
- [ ] User preferences and patterns are learned and remembered
- [ ] Memory system supports different memory types (conversation, learning, preferences)
- [ ] Memory can be viewed and managed by users
- [ ] Old memories are archived or pruned based on relevance

## Complete Context

### Project Architecture Context
```
project-wiz/
├── src/
│   ├── main/                    # Backend (Electron main process)
│   │   ├── agents/              # Agent bounded context
│   │   │   ├── memory/          # NEW - Memory subsystem
│   │   │   │   ├── memory.schema.ts # Memory data models
│   │   │   │   ├── memory.service.ts # Memory management logic
│   │   │   │   ├── memory.handlers.ts # IPC handlers
│   │   │   │   └── memory.types.ts # Domain types
│   │   │   ├── agent-chat.service.ts # Enhanced with memory
│   │   │   └── agents.schema.ts # From TASK-003
│   │   └── main.ts              # Handler registration
│   └── renderer/                # Frontend (React)
│       ├── app/                 # Memory management pages
│       │   └── agents/
│       │       └── [agentId]/
│       │           ├── memory.tsx # NEW - Memory viewer
│       │           └── chat.tsx # Enhanced with memory context
│       ├── components/          # Memory components
│       └── store/               # Memory store management
```

### Technology-Specific Context
```yaml
memory_system:
  storage: SQLite with indexed queries for performance
  retrieval: Importance + recency scoring algorithm
  types: conversation, learning, preference, goal, context
  management: Automatic archiving and pruning strategies
  
integration:
  chat_system: Memory context injection in conversations
  agent_prompts: Dynamic context building from memories
  user_interface: Memory browsing and management tools
  
performance:
  indexing: Database indexes on agentId, type, importance, createdAt
  caching: Recent memory caching for faster access
  pruning: Automated old memory cleanup
```

### Existing Code Patterns
```typescript
// Pattern 1: Memory Schema Design
// Flexible memory storage with typed categories
export const agentMemoriesTable = sqliteTable("agent_memories", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  agentId: text("agent_id").notNull().references(() => agentsTable.id),
  type: text("type").$type<MemoryType>().notNull(),
  content: text("content").notNull(),
  context: text("context"), // JSON: conversation ID, participants, etc.
  importance: integer("importance").notNull().default(1), // 1-10 scale
  embedding: text("embedding"), // Future: vector embeddings for similarity
  tags: text("tags"), // JSON array of tags for categorization
  expiresAt: integer("expires_at", { mode: "timestamp" }), // Optional expiration
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Pattern 2: Memory Retrieval Algorithm
// Score-based retrieval combining recency and importance
export class MemoryService {
  static async getRelevantMemories(
    agentId: string, 
    context: string, 
    limit: number = 10
  ): Promise<ScoredMemory[]> {
    const memories = await this.searchMemories(agentId, context);
    
    return memories
      .map(memory => ({
        ...memory,
        score: this.calculateRelevanceScore(memory, context),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
  
  private static calculateRelevanceScore(memory: Memory, context: string): number {
    const ageWeight = this.getAgeWeight(memory.createdAt);
    const importanceWeight = memory.importance / 10;
    const contextWeight = this.getContextRelevance(memory.content, context);
    
    return (ageWeight * 0.3) + (importanceWeight * 0.4) + (contextWeight * 0.3);
  }
}

// Pattern 3: Chat Integration with Memory
// Enhanced chat service that includes memory context
export class AgentChatService {
  static async sendMessage(agentId: string, userMessage: string, userId: string) {
    // ... existing code ...
    
    // Get relevant memories for context
    const relevantMemories = await MemoryService.getRelevantMemories(
      agentId, 
      userMessage, 
      5
    );
    
    // Build enhanced context for AI
    const memoryContext = this.buildMemoryContext(relevantMemories);
    const enhancedSystemPrompt = `${agent.systemPrompt}\n\nRelevant Context:\n${memoryContext}`;
    
    // Generate response with memory context
    const response = await generateText({
      model,
      messages: [
        { role: "system", content: enhancedSystemPrompt },
        ...conversationHistory,
        { role: "user", content: userMessage },
      ],
    });
    
    // Store new memories from this interaction
    await this.extractAndStoreMemories(agentId, userMessage, response.text);
    
    return response;
  }
}
```

### Project-Specific Conventions
```yaml
memory_types:
  conversation: Direct dialogue excerpts and exchanges
  learning: Insights about user preferences and behavior
  preference: User settings, likes, dislikes, patterns
  goal: Long-term objectives and project information
  context: Situational information and working context

scoring_system:
  importance: 1-10 scale (10 = critical to remember)
  recency: Time-based decay function
  relevance: Context similarity matching
  combined: Weighted score for retrieval priority

lifecycle_management:
  creation: Automatic during conversations + manual entry
  retrieval: Score-based with context filtering
  updating: Importance adjustment based on reinforcement
  archiving: Move old, low-importance memories to archive
  deletion: User-controlled or automatic expiration
```

### Validation Commands
```bash
npm run type-check       # TypeScript validation
npm run lint             # ESLint checks
npm run db:generate      # Generate memory schema migration
npm run db:migrate       # Apply memory schema
npm run quality:check    # All quality checks
```

## Implementation Steps

### Phase 1: Memory Schema and Types
```
CREATE src/main/agents/memory/memory.schema.ts:
  - DESIGN_SCHEMA:
    ```typescript
    export type MemoryType = 
      | "conversation" 
      | "learning" 
      | "preference" 
      | "goal" 
      | "context";
    
    export const agentMemoriesTable = sqliteTable("agent_memories", {
      id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
      agentId: text("agent_id")
        .notNull()
        .references(() => agentsTable.id, { onDelete: "cascade" }),
      type: text("type").$type<MemoryType>().notNull(),
      content: text("content").notNull(),
      context: text("context"), // JSON: { conversationId, userId, timestamp, etc. }
      importance: integer("importance").notNull().default(5), // 1-10 scale
      tags: text("tags"), // JSON array: ["react", "typescript", "debugging"]
      expiresAt: integer("expires_at", { mode: "timestamp" }),
      createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
      updatedAt: integer("updated_at", { mode: "timestamp" })
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
    });
    
    // Indexes for performance
    export const memoryAgentIndex = index("agent_memories_agent_id_idx")
      .on(agentMemoriesTable.agentId);
    export const memoryTypeIndex = index("agent_memories_type_idx")
      .on(agentMemoriesTable.type);
    export const memoryImportanceIndex = index("agent_memories_importance_idx")
      .on(agentMemoriesTable.importance);
    export const memoryCreatedIndex = index("agent_memories_created_idx")
      .on(agentMemoriesTable.createdAt);
    
    export type SelectMemory = typeof agentMemoriesTable.$inferSelect;
    export type InsertMemory = typeof agentMemoriesTable.$inferInsert;
    export type UpdateMemory = Partial<InsertMemory> & { id: string };
    ```

CREATE src/main/agents/memory/memory.types.ts:
  - DEFINE_TYPES:
    ```typescript
    export interface MemoryContext {
      conversationId?: string;
      userId?: string;
      messageId?: string;
      trigger?: string; // What caused this memory to be created
      participants?: string[];
      metadata?: Record<string, any>;
    }
    
    export interface CreateMemoryInput {
      agentId: string;
      type: MemoryType;
      content: string;
      context?: MemoryContext;
      importance?: number;
      tags?: string[];
      expiresAt?: Date;
    }
    
    export interface ScoredMemory extends SelectMemory {
      score: number;
      ageInDays: number;
      relevanceReason?: string;
    }
    
    export interface MemorySearchParams {
      agentId: string;
      types?: MemoryType[];
      tags?: string[];
      minImportance?: number;
      maxAge?: number; // days
      limit?: number;
      searchTerm?: string;
    }
    
    export interface MemoryStats {
      total: number;
      byType: Record<MemoryType, number>;
      averageImportance: number;
      oldestMemory: Date;
      newestMemory: Date;
    }
    
    export const createMemorySchema = z.object({
      agentId: z.string().uuid(),
      type: z.enum(["conversation", "learning", "preference", "goal", "context"]),
      content: z.string().min(1, "Content is required"),
      importance: z.number().min(1).max(10).default(5),
      tags: z.array(z.string()).optional(),
      expiresAt: z.date().optional(),
    });
    ```

UPDATE src/main/database/index.ts:
  - ADD: Import agentMemoriesTable for migration detection
  - GENERATE: Migration with npm run db:generate
  - APPLY: Migration with npm run db:migrate
```

### Phase 2: Memory Service Implementation
```
CREATE src/main/agents/memory/memory.service.ts:
  - IMPLEMENT: Core memory management
    ```typescript
    export class MemoryService {
      
      static async create(input: CreateMemoryInput): Promise<SelectMemory> {
        const db = getDatabase();
        
        const memoryData: InsertMemory = {
          agentId: input.agentId,
          type: input.type,
          content: input.content,
          context: input.context ? JSON.stringify(input.context) : null,
          importance: input.importance || 5,
          tags: input.tags ? JSON.stringify(input.tags) : null,
          expiresAt: input.expiresAt,
        };
        
        const [memory] = await db
          .insert(agentMemoriesTable)
          .values(memoryData)
          .returning();
          
        if (!memory) throw new Error("Failed to create memory");
        return memory;
      }
      
      static async getRelevantMemories(
        agentId: string,
        context: string,
        limit: number = 10
      ): Promise<ScoredMemory[]> {
        const db = getDatabase();
        
        // Get recent memories (last 30 days) with high importance
        const memories = await db
          .select()
          .from(agentMemoriesTable)
          .where(
            and(
              eq(agentMemoriesTable.agentId, agentId),
              or(
                gte(agentMemoriesTable.importance, 7), // High importance
                gte( // Or recent
                  agentMemoriesTable.createdAt,
                  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                )
              ),
              or( // Not expired
                isNull(agentMemoriesTable.expiresAt),
                gt(agentMemoriesTable.expiresAt, new Date())
              )
            )
          )
          .orderBy(desc(agentMemoriesTable.importance), desc(agentMemoriesTable.createdAt))
          .limit(50); // Get more for scoring
        
        // Score and rank memories
        const scoredMemories = memories
          .map(memory => ({
            ...memory,
            score: this.calculateRelevanceScore(memory, context),
            ageInDays: this.getAgeInDays(memory.createdAt),
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, limit);
        
        return scoredMemories;
      }
      
      static async searchMemories(params: MemorySearchParams): Promise<SelectMemory[]> {
        const db = getDatabase();
        
        let query = db
          .select()
          .from(agentMemoriesTable)
          .where(eq(agentMemoriesTable.agentId, params.agentId));
        
        // Apply filters
        const conditions = [eq(agentMemoriesTable.agentId, params.agentId)];
        
        if (params.types?.length) {
          conditions.push(inArray(agentMemoriesTable.type, params.types));
        }
        
        if (params.minImportance) {
          conditions.push(gte(agentMemoriesTable.importance, params.minImportance));
        }
        
        if (params.maxAge) {
          const cutoffDate = new Date(Date.now() - params.maxAge * 24 * 60 * 60 * 1000);
          conditions.push(gte(agentMemoriesTable.createdAt, cutoffDate));
        }
        
        if (params.searchTerm) {
          conditions.push(
            like(agentMemoriesTable.content, `%${params.searchTerm}%`)
          );
        }
        
        const memories = await db
          .select()
          .from(agentMemoriesTable)
          .where(and(...conditions))
          .orderBy(desc(agentMemoriesTable.importance), desc(agentMemoriesTable.createdAt))
          .limit(params.limit || 50);
        
        return memories;
      }
      
      static async updateImportance(
        id: string, 
        importance: number
      ): Promise<SelectMemory> {
        const db = getDatabase();
        
        const [updated] = await db
          .update(agentMemoriesTable)
          .set({ 
            importance: Math.max(1, Math.min(10, importance)),
            updatedAt: new Date() 
          })
          .where(eq(agentMemoriesTable.id, id))
          .returning();
          
        if (!updated) throw new Error("Memory not found");
        return updated;
      }
      
      static async deleteMemory(id: string, agentId: string): Promise<void> {
        const db = getDatabase();
        
        const result = await db
          .delete(agentMemoriesTable)
          .where(
            and(
              eq(agentMemoriesTable.id, id),
              eq(agentMemoriesTable.agentId, agentId)
            )
          );
          
        if (result.rowsAffected === 0) {
          throw new Error("Memory not found or access denied");
        }
      }
      
      static async getMemoryStats(agentId: string): Promise<MemoryStats> {
        const db = getDatabase();
        
        const memories = await db
          .select()
          .from(agentMemoriesTable)
          .where(eq(agentMemoriesTable.agentId, agentId));
        
        const byType = memories.reduce((acc, memory) => {
          acc[memory.type] = (acc[memory.type] || 0) + 1;
          return acc;
        }, {} as Record<MemoryType, number>);
        
        const importanceSum = memories.reduce((sum, m) => sum + m.importance, 0);
        const dates = memories.map(m => new Date(m.createdAt));
        
        return {
          total: memories.length,
          byType,
          averageImportance: memories.length ? importanceSum / memories.length : 0,
          oldestMemory: dates.length ? new Date(Math.min(...dates.map(d => d.getTime()))) : new Date(),
          newestMemory: dates.length ? new Date(Math.max(...dates.map(d => d.getTime()))) : new Date(),
        };
      }
      
      static async pruneOldMemories(agentId: string): Promise<number> {
        const db = getDatabase();
        
        // Delete memories older than 90 days with importance < 5
        const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        
        const result = await db
          .delete(agentMemoriesTable)
          .where(
            and(
              eq(agentMemoriesTable.agentId, agentId),
              lt(agentMemoriesTable.createdAt, cutoffDate),
              lt(agentMemoriesTable.importance, 5)
            )
          );
          
        return result.rowsAffected || 0;
      }
      
      private static calculateRelevanceScore(memory: SelectMemory, context: string): number {
        const ageWeight = this.getAgeWeight(memory.createdAt);
        const importanceWeight = memory.importance / 10;
        const contextWeight = this.getContextRelevance(memory.content, context);
        
        return (ageWeight * 0.3) + (importanceWeight * 0.4) + (contextWeight * 0.3);
      }
      
      private static getAgeWeight(createdAt: Date): number {
        const ageInDays = this.getAgeInDays(createdAt);
        return Math.max(0.1, 1 - (ageInDays / 365)); // Decay over a year
      }
      
      private static getAgeInDays(createdAt: Date): number {
        return (Date.now() - new Date(createdAt).getTime()) / (24 * 60 * 60 * 1000);
      }
      
      private static getContextRelevance(content: string, context: string): number {
        // Simple keyword matching - could be enhanced with embeddings
        const contentWords = content.toLowerCase().split(/\s+/);
        const contextWords = context.toLowerCase().split(/\s+/);
        
        const matches = contextWords.filter(word => 
          word.length > 2 && contentWords.some(cw => cw.includes(word))
        );
        
        return Math.min(1, matches.length / Math.max(1, contextWords.length));
      }
    }
    ```
```

### Phase 3: Enhanced Chat Integration
```
UPDATE src/main/agents/agent-chat.service.ts:
  - ENHANCE: Chat service with memory integration
    ```typescript
    export class AgentChatService {
      
      static async sendMessage(
        agentId: string,
        userMessage: string,
        userId: string
      ): Promise<{ userMessage: any; agentResponse: any }> {
        // ... existing conversation setup ...
        
        // Get relevant memories for context
        const relevantMemories = await MemoryService.getRelevantMemories(
          agentId,
          userMessage,
          5
        );
        
        // Build memory context
        const memoryContext = this.buildMemoryContext(relevantMemories);
        
        // Enhanced system prompt with memory
        const enhancedSystemPrompt = `${agent.systemPrompt}
        
        ${memoryContext ? `\nRelevant Context from Previous Interactions:\n${memoryContext}` : ''}
        
        Remember to maintain personality consistency and refer to relevant past context when appropriate.`;
        
        // Generate response with memory context
        const agentResponse = await this.generateAgentResponse(
          { ...agent, systemPrompt: enhancedSystemPrompt },
          messageHistory,
          userMessage
        );
        
        // Store conversation memory
        await this.storeConversationMemory(agentId, userMessage, agentResponse.text, conversation.id);
        
        // Extract learnings and preferences
        await this.extractAndStoreInsights(agentId, userMessage, agentResponse.text, userId);
        
        // ... rest of existing logic ...
      }
      
      private static buildMemoryContext(memories: ScoredMemory[]): string {
        if (memories.length === 0) return "";
        
        return memories
          .map(memory => {
            const age = memory.ageInDays < 1 ? "today" : 
                      memory.ageInDays < 7 ? "this week" : 
                      memory.ageInDays < 30 ? "this month" : "previously";
            
            return `[${memory.type.toUpperCase()} - ${age}]: ${memory.content}`;
          })
          .join("\n");
      }
      
      private static async storeConversationMemory(
        agentId: string,
        userMessage: string,
        agentResponse: string,
        conversationId: string
      ): Promise<void> {
        // Store significant parts of the conversation
        if (userMessage.length > 50 || agentResponse.length > 100) {
          const importance = this.calculateConversationImportance(userMessage, agentResponse);
          
          await MemoryService.create({
            agentId,
            type: "conversation",
            content: `User: ${userMessage}\nAgent: ${agentResponse}`,
            context: {
              conversationId,
              trigger: "chat_interaction",
            },
            importance,
            tags: this.extractTags(userMessage + " " + agentResponse),
          });
        }
      }
      
      private static async extractAndStoreInsights(
        agentId: string,
        userMessage: string,
        agentResponse: string,
        userId: string
      ): Promise<void> {
        // Simple pattern matching for preferences and learnings
        const patterns = [
          { pattern: /i (prefer|like|love|enjoy)/i, type: "preference" as const },
          { pattern: /i (don't like|hate|dislike)/i, type: "preference" as const },
          { pattern: /my (goal|objective) is/i, type: "goal" as const },
          { pattern: /i'm working on/i, type: "context" as const },
          { pattern: /i learned|i discovered/i, type: "learning" as const },
        ];
        
        for (const { pattern, type } of patterns) {
          if (pattern.test(userMessage)) {
            await MemoryService.create({
              agentId,
              type,
              content: userMessage,
              context: { userId, trigger: "pattern_detected" },
              importance: type === "goal" ? 8 : type === "preference" ? 7 : 6,
              tags: this.extractTags(userMessage),
            });
          }
        }
      }
      
      private static calculateConversationImportance(
        userMessage: string,
        agentResponse: string
      ): number {
        let importance = 5; // Base importance
        
        // Increase for longer conversations
        const totalLength = userMessage.length + agentResponse.length;
        if (totalLength > 500) importance += 1;
        if (totalLength > 1000) importance += 1;
        
        // Increase for certain keywords
        const importantKeywords = [
          "help", "problem", "issue", "learn", "understand", 
          "project", "goal", "important", "urgent", "deadline"
        ];
        
        const text = (userMessage + " " + agentResponse).toLowerCase();
        const keywordMatches = importantKeywords.filter(kw => text.includes(kw));
        importance += Math.min(2, keywordMatches.length);
        
        return Math.min(10, importance);
      }
      
      private static extractTags(text: string): string[] {
        // Simple tag extraction - could be enhanced with NLP
        const techKeywords = [
          "react", "typescript", "javascript", "python", "nodejs", "api",
          "database", "frontend", "backend", "testing", "debugging", "deployment"
        ];
        
        const lowerText = text.toLowerCase();
        return techKeywords.filter(tag => lowerText.includes(tag));
      }
    }
    ```
```

### Phase 4: Memory Management Interface
```
CREATE src/renderer/store/memory-store.ts:
  - IMPLEMENT: Memory management store
    ```typescript
    interface MemoryState {
      memories: SelectMemory[];
      stats: MemoryStats | null;
      isLoading: boolean;
      error: string | null;
      
      // Actions
      loadMemories: (agentId: string, params?: MemorySearchParams) => Promise<void>;
      createMemory: (input: CreateMemoryInput) => Promise<void>;
      updateMemoryImportance: (id: string, importance: number) => Promise<void>;
      deleteMemory: (id: string, agentId: string) => Promise<void>;
      loadStats: (agentId: string) => Promise<void>;
      pruneMemories: (agentId: string) => Promise<number>;
    }
    
    export const useMemoryStore = create<MemoryState>((set, get) => ({
      memories: [],
      stats: null,
      isLoading: false,
      error: null,
      
      loadMemories: async (agentId: string, params?: MemorySearchParams) => {
        set({ isLoading: true, error: null });
        try {
          const result = await window.api.memory.search({ agentId, ...params });
          if (result.success) {
            set({ memories: result.data, isLoading: false });
          } else {
            throw new Error(result.error);
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Failed to load memories",
            isLoading: false 
          });
        }
      },
      
      createMemory: async (input: CreateMemoryInput) => {
        try {
          const result = await window.api.memory.create(input);
          if (result.success) {
            set(state => ({
              memories: [result.data, ...state.memories],
            }));
          } else {
            throw new Error(result.error);
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : "Failed to create memory" });
          throw error;
        }
      },
      
      updateMemoryImportance: async (id: string, importance: number) => {
        try {
          const result = await window.api.memory.updateImportance(id, importance);
          if (result.success) {
            set(state => ({
              memories: state.memories.map(m => 
                m.id === id ? { ...m, importance } : m
              ),
            }));
          } else {
            throw new Error(result.error);
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : "Failed to update memory" });
          throw error;
        }
      },
      
      deleteMemory: async (id: string, agentId: string) => {
        try {
          const result = await window.api.memory.delete(id, agentId);
          if (result.success) {
            set(state => ({
              memories: state.memories.filter(m => m.id !== id),
            }));
          } else {
            throw new Error(result.error);
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : "Failed to delete memory" });
          throw error;
        }
      },
      
      loadStats: async (agentId: string) => {
        try {
          const result = await window.api.memory.getStats(agentId);
          if (result.success) {
            set({ stats: result.data });
          }
        } catch (error) {
          console.error("Failed to load memory stats:", error);
        }
      },
      
      pruneMemories: async (agentId: string) => {
        try {
          const result = await window.api.memory.prune(agentId);
          if (result.success) {
            // Reload memories after pruning
            await get().loadMemories(agentId);
            return result.data.prunedCount;
          }
          return 0;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : "Failed to prune memories" });
          return 0;
        }
      },
    }));
    ```

CREATE src/renderer/components/memory/memory-card.tsx:
  - IMPLEMENT: Memory display component
    ```tsx
    interface MemoryCardProps {
      memory: SelectMemory;
      onUpdateImportance?: (id: string, importance: number) => void;
      onDelete?: (id: string) => void;
    }
    
    export function MemoryCard({ memory, onUpdateImportance, onDelete }: MemoryCardProps) {
      const [isEditing, setIsEditing] = useState(false);
      const [importance, setImportance] = useState(memory.importance);
      
      const memoryTypeConfig = {
        conversation: { icon: MessageCircle, label: "Conversation", color: "blue" },
        learning: { icon: Brain, label: "Learning", color: "green" },
        preference: { icon: Heart, label: "Preference", color: "red" },
        goal: { icon: Target, label: "Goal", color: "purple" },
        context: { icon: Info, label: "Context", color: "gray" },
      };
      
      const config = memoryTypeConfig[memory.type];
      const Icon = config.icon;
      
      const handleImportanceChange = (newImportance: number) => {
        setImportance(newImportance);
        onUpdateImportance?.(memory.id, newImportance);
        setIsEditing(false);
      };
      
      return (
        <Card className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 text-${config.color}-500`} />
                <Badge variant="secondary" className="text-xs">
                  {config.label}
                </Badge>
                <div className="flex items-center gap-1">
                  {isEditing ? (
                    <Select
                      value={importance.toString()}
                      onValueChange={(value) => handleImportanceChange(parseInt(value))}
                    >
                      <SelectTrigger className="w-16 h-6 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10].map(i => (
                          <SelectItem key={i} value={i.toString()}>
                            {i}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => setIsEditing(true)}
                    >
                      {Array.from({ length: importance }, (_, i) => (
                        <Star key={i} className="h-3 w-3 fill-current" />
                      ))}
                    </Button>
                  )}
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit className="mr-2 h-3 w-3" />
                    Edit Importance
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(memory.id)}
                    className="text-destructive"
                  >
                    <Trash className="mr-2 h-3 w-3" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          
          <CardContent>
            <p className="text-sm whitespace-pre-wrap mb-3">
              {memory.content}
            </p>
            
            {memory.tags && (
              <div className="flex flex-wrap gap-1 mb-2">
                {JSON.parse(memory.tags).map((tag: string) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(memory.createdAt), { addSuffix: true })}
            </div>
          </CardContent>
        </Card>
      );
    }
    ```

CREATE src/renderer/app/agents/[agentId]/memory.tsx:
  - IMPLEMENT: Memory management page
    ```tsx
    export default function AgentMemoryPage() {
      const { agentId } = useParams();
      const { agents } = useAgentStore();
      const { 
        memories, 
        stats, 
        isLoading, 
        error,
        loadMemories,
        loadStats,
        updateMemoryImportance,
        deleteMemory,
        pruneMemories
      } = useMemoryStore();
      
      const agent = agents.find(a => a.id === agentId);
      const [filter, setFilter] = useState<MemoryType | "all">("all");
      const [searchTerm, setSearchTerm] = useState("");
      
      useEffect(() => {
        if (agentId) {
          loadMemories(agentId);
          loadStats(agentId);
        }
      }, [agentId, loadMemories, loadStats]);
      
      const filteredMemories = memories.filter(memory => {
        const matchesType = filter === "all" || memory.type === filter;
        const matchesSearch = !searchTerm || 
          memory.content.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesSearch;
      });
      
      const handlePrune = async () => {
        if (agentId) {
          const prunedCount = await pruneMemories(agentId);
          toast.success(`Removed ${prunedCount} old memories`);
        }
      };
      
      if (!agent) {
        return <div>Agent not found</div>;
      }
      
      return (
        <div className="container max-w-6xl py-8">
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">{agent.name}'s Memory</h1>
                <p className="text-muted-foreground">
                  Manage memories and context for this agent
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={handlePrune}>
                  <Trash className="mr-2 h-4 w-4" />
                  Prune Old Memories
                </Button>
                <Button asChild>
                  <Link to={`/agents/${agentId}/chat`}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Back to Chat
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* Stats */}
            {stats && (
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-sm text-muted-foreground">Total Memories</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">
                      {stats.averageImportance.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Importance</div>
                  </CardContent>
                </Card>
                {/* ... more stat cards ... */}
              </div>
            )}
            
            {/* Filters */}
            <div className="flex gap-4">
              <Select value={filter} onValueChange={(value) => setFilter(value as any)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="conversation">Conversations</SelectItem>
                  <SelectItem value="learning">Learnings</SelectItem>
                  <SelectItem value="preference">Preferences</SelectItem>
                  <SelectItem value="goal">Goals</SelectItem>
                  <SelectItem value="context">Context</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                placeholder="Search memories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            
            {/* Memory List */}
            {isLoading ? (
              <MemoryListSkeleton />
            ) : filteredMemories.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredMemories.map((memory) => (
                  <MemoryCard
                    key={memory.id}
                    memory={memory}
                    onUpdateImportance={updateMemoryImportance}
                    onDelete={(id) => deleteMemory(id, agentId)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No memories found</h3>
                <p className="text-muted-foreground">
                  Start chatting with {agent.name} to build memories
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }
    ```
```

### Phase 5: IPC Handlers and Integration
```
CREATE src/main/agents/memory/memory.handlers.ts:
  - IMPLEMENT: Memory IPC handlers
    ```typescript
    export function setupMemoryHandlers(): void {
      
      ipcMain.handle(
        "memory:create",
        async (_, input: CreateMemoryInput): Promise<IpcResponse> => {
          try {
            const memory = await MemoryService.create(input);
            return { success: true, data: memory };
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : "Failed to create memory",
            };
          }
        }
      );
      
      ipcMain.handle(
        "memory:search",
        async (_, params: MemorySearchParams): Promise<IpcResponse> => {
          try {
            const memories = await MemoryService.searchMemories(params);
            return { success: true, data: memories };
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : "Failed to search memories",
            };
          }
        }
      );
      
      ipcMain.handle(
        "memory:update-importance",
        async (_, id: string, importance: number): Promise<IpcResponse> => {
          try {
            const memory = await MemoryService.updateImportance(id, importance);
            return { success: true, data: memory };
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : "Failed to update memory",
            };
          }
        }
      );
      
      ipcMain.handle(
        "memory:delete",
        async (_, id: string, agentId: string): Promise<IpcResponse> => {
          try {
            await MemoryService.deleteMemory(id, agentId);
            return { success: true, data: null };
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : "Failed to delete memory",
            };
          }
        }
      );
      
      ipcMain.handle(
        "memory:get-stats",
        async (_, agentId: string): Promise<IpcResponse> => {
          try {
            const stats = await MemoryService.getMemoryStats(agentId);
            return { success: true, data: stats };
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : "Failed to get stats",
            };
          }
        }
      );
      
      ipcMain.handle(
        "memory:prune",
        async (_, agentId: string): Promise<IpcResponse> => {
          try {
            const prunedCount = await MemoryService.pruneOldMemories(agentId);
            return { success: true, data: { prunedCount } };
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : "Failed to prune memories",
            };
          }
        }
      );
    }
    ```

UPDATE src/main/main.ts:
  - ADD: setupMemoryHandlers() registration

UPDATE src/renderer/preload.ts:
  - ADD: Memory API exposure
    ```typescript
    memory: {
      create: (input) => ipcRenderer.invoke("memory:create", input),
      search: (params) => ipcRenderer.invoke("memory:search", params),
      updateImportance: (id, importance) => 
        ipcRenderer.invoke("memory:update-importance", id, importance),
      delete: (id, agentId) => ipcRenderer.invoke("memory:delete", id, agentId),
      getStats: (agentId) => ipcRenderer.invoke("memory:get-stats", agentId),
      prune: (agentId) => ipcRenderer.invoke("memory:prune", agentId),
    }
    ```
```

## Validation Checkpoints

### Checkpoint 1: Memory Storage
```
VALIDATE_STORAGE:
  - TEST: Memory creation with different types
  - VERIFY: Importance scoring and retrieval
  - CHECK: Context parsing and storage
  - CONFIRM: Memory pruning and lifecycle
```

### Checkpoint 2: Chat Integration
```
VALIDATE_CHAT_INTEGRATION:
  - TEST: Chat includes relevant memories in context
  - VERIFY: New memories are created from conversations
  - CHECK: Memory importance is calculated correctly
  - CONFIRM: Context improves response quality
```

### Checkpoint 3: Memory Management UI
```
VALIDATE_UI:
  - VIEW: Agent memory page with filters
  - TEST: Memory importance editing
  - VERIFY: Memory deletion and confirmation
  - CHECK: Memory statistics display
```

## Dependencies & Prerequisites

### Required Files/Components
- [x] Agent creation and chat system (TASK-003, TASK-005)
- [x] Database schema and migration system
- [x] Shadcn/ui components for UI
- [x] IPC handler patterns
- [x] Store management patterns

### Required Patterns/Conventions
- [x] Database schema with proper indexing
- [x] Service layer with CRUD operations
- [x] IPC response patterns
- [x] Component patterns for lists and cards
- [x] Form validation and management

---

## Task Completion Checklist

- [ ] Memory schema created with proper types and indexes
- [ ] Memory service implements storage and retrieval
- [ ] Chat integration includes memory context
- [ ] Memory management UI allows viewing and editing
- [ ] Memory scoring algorithm works effectively
- [ ] Memory pruning and lifecycle management
- [ ] IPC handlers provide complete API
- [ ] Memory statistics and insights
- [ ] No TypeScript or linting errors
- [ ] Memory improves conversation quality

**Final Validation**: Run `npm run quality:check` and ensure all automated checks pass.

**Delivers**: After completing this task, agents maintain persistent memory across conversations, learning user preferences and providing contextual responses based on past interactions.