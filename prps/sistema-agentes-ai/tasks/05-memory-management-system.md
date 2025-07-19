# Task: Create Agent Memory Management System

## Meta Information

```yaml
id: TASK-005
title: Create Agent Memory Management System
source_document: prps/sistema-agentes-ai/README.md
priority: high
estimated_effort: 3 hours
dependencies: [TASK-002, TASK-004]
tech_stack: [TypeScript, Drizzle ORM, SQLite, Vector Search]
domain_context: agents/memory
project_type: desktop
```

## Primary Goal

**Create a memory management system for agents that stores, retrieves, and searches conversation context, learning, and goals with importance-based prioritization and recency scoring**

### Success Criteria
- [ ] MemoryService class with store, retrieve, and search operations
- [ ] Memory type classification (conversation, learning, goal, context)
- [ ] Importance-based memory prioritization system
- [ ] Recency scoring for memory relevance
- [ ] Memory cleanup and optimization capabilities
- [ ] Integration with agent lifecycle and conversations
- [ ] Service follows established project patterns

## Complete Context

### Project Architecture Context
```
src/main/
├── agents/                         # CURRENT DOMAIN
│   ├── memory.schema.ts            # DEPENDENCY - Memory schema
│   ├── agents.schema.ts            # DEPENDENCY - Agent relationship
│   ├── memory.service.ts           # THIS TASK - Memory management
│   ├── agent.service.ts            # DEPENDENCY - Agent operations
│   └── agent-worker.ts             # FUTURE - Memory usage in processing
├── conversations/                  # INTEGRATION SOURCE
│   ├── messages.schema.ts          # Source of conversation memories
│   └── conversation.service.ts     # Conversation context integration
├── user/                           # PATTERN REFERENCE
│   └── authentication/
│       └── auth.service.ts         # Service structure patterns
```

### Technology-Specific Context
```yaml
database:
  type: SQLite
  orm_framework: Drizzle ORM
  schema_location: src/main/agents/memory.schema.ts
  migration_command: npm run db:migrate

backend:
  framework: Electron Main Process
  language: TypeScript
  api_pattern: Service layer returns data, handlers wrap IPC
  auth_method: Simple in-memory session

memory_system:
  storage: SQLite text fields for flexible content
  search: SQL LIKE queries and importance scoring
  cleanup: Automatic low-importance memory removal
  optimization: Memory summarization and consolidation

testing:
  unit_framework: Vitest
  test_command: npm test
  
build_tools:
  package_manager: npm
  linter: ESLint
  formatter: Prettier
  type_checker: TypeScript
```

### Existing Code Patterns
```typescript
// Pattern 1: Service Class Structure (from AuthService)
export class AuthService {
  static async methodName(input: InputType): Promise<OutputType> {
    const db = getDatabase();
    
    const [result] = await db
      .select()
      .from(table)
      .where(eq(table.field, input.value))
      .orderBy(desc(table.createdAt))
      .limit(10);
    
    return result;
  }
}

// Pattern 2: Complex Queries with Filtering
const memories = await db
  .select()
  .from(agentMemoriesTable)
  .where(and(
    eq(agentMemoriesTable.agentId, agentId),
    gte(agentMemoriesTable.importance, minImportance)
  ))
  .orderBy(desc(agentMemoriesTable.createdAt))
  .limit(limit);

// Pattern 3: Batch Operations
await db.insert(agentMemoriesTable).values(
  memories.map(memory => ({
    agentId,
    type: memory.type,
    content: memory.content,
    importance: memory.importance
  }))
);

// Pattern 4: Update Operations
await db
  .update(agentMemoriesTable)
  .set({ importance: newImportance, updatedAt: new Date() })
  .where(eq(agentMemoriesTable.id, memoryId));
```

### Project-Specific Conventions
```yaml
naming_conventions:
  files: kebab-case
  variables: camelCase
  constants: SCREAMING_SNAKE_CASE
  classes: PascalCase
  methods: camelCase

import_organization:
  - Node.js built-ins
  - External libraries (drizzle-orm)
  - Internal modules with @/ alias
  - Relative imports for same domain

error_handling:
  pattern: Throw errors with descriptive messages
  logging: Use existing logger utility
  validation: Service layer validates input and business rules
```

### Validation Commands
```bash
npm run type-check      # TypeScript type checking
npm run lint           # ESLint checks
npm run format         # Prettier formatting
npm test              # Run unit tests
npm run dev           # Start development for integration testing
```

## Implementation Steps

### Phase 1: Service Foundation
```
CREATE src/main/agents/memory.service.ts:
  - FOLLOW_PATTERN: src/main/user/authentication/auth.service.ts
  - SETUP_IMPORTS:
    • Import Drizzle ORM utilities (eq, and, or, desc, asc, gte, lte)
    • Import getDatabase from @/main/database/connection
    • Import memory schema types from ./memory.schema
    • Import date utilities for recency calculations
  
  - DEFINE_INTERFACES:
    • StoreMemoryInput (type, content, importance, agentId)
    • SearchMemoryInput (query, agentId, types, minImportance)
    • MemorySearchResult (memory with relevance score)
    • MemoryCleanupOptions (age, importance thresholds)
  
  - VALIDATE: npm run type-check
  - IF_FAIL: Check import paths and type definitions
```

### Phase 2: Memory Storage Operations
```
IMPLEMENT_STORAGE_METHODS:
  - STORE_METHOD:
    • Validate memory input (type, content, importance)
    • Store memory with timestamp and agent association
    • Handle importance scoring (1-10 scale)
    • Support batch memory storage
    • Return stored memory with generated ID
  
  - STORE_CONVERSATION:
    • Extract important conversation moments
    • Store with type="conversation"
    • Include participants and context
    • Auto-assign importance based on content analysis
  
  - STORE_LEARNING:
    • Store user preferences and patterns
    • Use type="learning" with high importance
    • Support learning consolidation
    • Handle conflicting learnings
  
  - STORE_GOAL:
    • Store agent goals and objectives
    • Use type="goal" with highest importance
    • Support goal evolution and updates
    • Link to task completion outcomes
  
  - VALIDATE: npm run type-check
  - IF_FAIL: Check memory schema usage and validation logic
```

### Phase 3: Memory Retrieval Operations
```
IMPLEMENT_RETRIEVAL_METHODS:
  - GET_RECENT_MEMORIES:
    • Retrieve memories ordered by recency
    • Apply importance threshold filtering
    • Support type-specific retrieval
    • Include relevance scoring
  
  - GET_IMPORTANT_MEMORIES:
    • Retrieve memories ordered by importance
    • Apply recency weighting
    • Support cross-type memory retrieval
    • Limit results for performance
  
  - GET_CONVERSATION_CONTEXT:
    • Retrieve conversation-specific memories
    • Include participant context
    • Order by relevance to current conversation
    • Support context window management
  
  - GET_LEARNINGS:
    • Retrieve user preferences and patterns
    • Filter by learning type and confidence
    • Support learning hierarchy
    • Handle learning conflicts
  
  - VALIDATE: npm run type-check
  - IF_FAIL: Check query patterns and result formatting
```

### Phase 4: Memory Search and Analysis
```
IMPLEMENT_SEARCH_METHODS:
  - SEARCH_MEMORIES:
    • Implement text-based search in content
    • Apply importance and recency scoring
    • Support multi-term search queries
    • Return ranked search results
  
  - FIND_RELATED_MEMORIES:
    • Find memories related to current context
    • Use keyword matching and content similarity
    • Apply temporal relevance scoring
    • Support context expansion
  
  - ANALYZE_MEMORY_PATTERNS:
    • Identify frequently accessed memories
    • Detect memory usage patterns
    • Support memory optimization suggestions
    • Track memory effectiveness
  
  - CALCULATE_RELEVANCE:
    • Combine importance and recency scores
    • Apply context-specific weighting
    • Support custom relevance algorithms
    • Optimize for agent performance
  
  - VALIDATE: npm test
  - IF_FAIL: Add test cases for search accuracy
```

### Phase 5: Memory Management and Cleanup
```
IMPLEMENT_MANAGEMENT_METHODS:
  - UPDATE_IMPORTANCE:
    • Update memory importance based on usage
    • Support batch importance updates
    • Handle importance decay over time
    • Maintain memory hierarchy
  
  - CONSOLIDATE_MEMORIES:
    • Merge similar or duplicate memories
    • Create summary memories from details
    • Remove redundant information
    • Optimize storage efficiency
  
  - CLEANUP_OLD_MEMORIES:
    • Remove low-importance old memories
    • Archive instead of delete for audit
    • Support configurable cleanup policies
    • Maintain essential memories
  
  - OPTIMIZE_STORAGE:
    • Compress memory content
    • Summarize verbose memories
    • Balance detail vs storage efficiency
    • Monitor memory growth rates
  
  - VALIDATE: npm test
  - IF_FAIL: Add comprehensive cleanup and optimization tests
```

## Validation Checkpoints

### Checkpoint 1: Memory Storage
```
VALIDATE_MEMORY_STORAGE:
  - TEST_STORE_OPERATIONS:
    • Store memory with valid input
    • Verify memory appears in database
    • Test importance scoring assignment
    • Test batch memory storage
  
  - TEST_TYPE_CLASSIFICATION:
    • Store different memory types
    • Verify type-specific storage logic
    • Test type validation and constraints
```

### Checkpoint 2: Memory Retrieval
```
VALIDATE_MEMORY_RETRIEVAL:
  - TEST_RETRIEVAL_METHODS:
    • Retrieve recent memories with correct ordering
    • Get important memories with proper filtering
    • Test conversation context retrieval
    • Verify learning pattern retrieval
  
  - TEST_FILTERING_AND_LIMITS:
    • Test importance threshold filtering
    • Verify result limit enforcement
    • Test type-specific filtering
```

### Checkpoint 3: Memory Search
```
VALIDATE_MEMORY_SEARCH:
  - TEST_SEARCH_FUNCTIONALITY:
    • Search memories by content keywords
    • Verify relevance scoring accuracy
    • Test multi-term search queries
    • Check search result ranking
  
  - TEST_CONTEXT_MATCHING:
    • Find related memories accurately
    • Test context expansion logic
    • Verify temporal relevance scoring
```

### Checkpoint 4: Memory Management
```
VALIDATE_MEMORY_MANAGEMENT:
  - TEST_UPDATE_OPERATIONS:
    • Update memory importance successfully
    • Test batch importance updates
    • Verify importance decay logic
  
  - TEST_CLEANUP_OPERATIONS:
    • Remove old low-importance memories
    • Verify cleanup policy enforcement
    • Test memory archival vs deletion
    • Check essential memory preservation
```

### Checkpoint 5: Integration Testing
```
VALIDATE_INTEGRATION:
  - START: npm run dev
  - TEST_AGENT_INTEGRATION:
    • Create agent and store memories
    • Retrieve memories during agent processing
    • Test memory search in conversation context
    • Verify memory cleanup during agent lifecycle
```

## Use Cases & Examples

### Example Data/Input
```typescript
// Example memory storage input
const storeMemoryInput: StoreMemoryInput = {
  agentId: "agent-123-uuid",
  type: "learning",
  content: "User prefers TypeScript over JavaScript and values clean, well-documented code",
  importance: 8
};

// Example conversation memory
const conversationMemory: StoreMemoryInput = {
  agentId: "agent-123-uuid",
  type: "conversation",
  content: "User discussed implementing dark mode toggle for the application. They want it in the settings page with system theme detection.",
  importance: 6
};

// Example search input
const searchInput: SearchMemoryInput = {
  agentId: "agent-123-uuid",
  query: "dark mode theme settings",
  types: ["conversation", "learning"],
  minImportance: 5
};

// Example search result
const searchResult: MemorySearchResult = {
  id: "memory-456-uuid",
  agentId: "agent-123-uuid",
  type: "conversation",
  content: "User discussed implementing dark mode toggle...",
  importance: 6,
  relevanceScore: 0.85,
  createdAt: new Date(),
  updatedAt: new Date()
};
```

### Common Scenarios
1. **Conversation Storage**: Agent stores important conversation moments
2. **Learning Accumulation**: Agent learns user preferences over time
3. **Goal Tracking**: Agent remembers current objectives and progress
4. **Context Retrieval**: Agent retrieves relevant memories for responses
5. **Memory Optimization**: System cleans up old, low-importance memories

### Business Rules & Constraints
- **Agent Ownership**: Memories belong to specific agents only
- **Importance Range**: Importance scores must be 1-10
- **Type Validation**: Memory types must be valid enum values
- **Content Limits**: Memory content should have reasonable size limits
- **Cleanup Policies**: Old memories cleaned based on importance and age

### Edge Cases & Error Scenarios
- **Empty Content**: Handle memories with minimal or empty content
- **Duplicate Memories**: Detect and consolidate duplicate information
- **Memory Overflow**: Handle agents with excessive memory accumulation
- **Search Performance**: Optimize search for large memory collections
- **Concurrent Access**: Handle multiple threads accessing same memories

## Troubleshooting Guide

### Common Issues by Technology

#### Memory Storage Issues
```
PROBLEM: Memory storage failures
SOLUTION: 
  - Verify agent exists before storing memory
  - Check content size limits and encoding
  - Validate importance score range (1-10)
  - Ensure proper error handling for database failures

PROBLEM: Memory type validation errors
SOLUTION:
  - Check memory type enum values
  - Verify type classification logic
  - Ensure proper type-specific handling
  - Validate type constraints in schema
```

#### Memory Retrieval Issues
```
PROBLEM: Poor search performance
SOLUTION:
  - Add database indexes on frequently queried fields
  - Optimize LIKE queries with proper indexing
  - Implement query result caching
  - Consider memory content preprocessing

PROBLEM: Irrelevant search results
SOLUTION:
  - Improve relevance scoring algorithm
  - Adjust importance and recency weighting
  - Enhance keyword matching logic
  - Implement content similarity scoring
```

#### Memory Management Issues
```
PROBLEM: Memory cleanup too aggressive
SOLUTION:
  - Adjust cleanup thresholds carefully
  - Implement memory archival instead of deletion
  - Preserve essential memories regardless of age
  - Monitor cleanup impact on agent performance

PROBLEM: Memory consolidation failures
SOLUTION:
  - Implement safe memory merging logic
  - Validate consolidated memory content
  - Handle consolidation conflicts gracefully
  - Test consolidation thoroughly before deployment
```

### Debug Commands
```bash
# Memory service testing
npm test memory.service.test.ts      # Specific service tests
npm run type-check --verbose         # Detailed type errors

# Database debugging
npm run db:studio                    # Visual memory inspection
sqlite3 project-wiz.db "SELECT type, importance, substr(content, 1, 50) FROM agent_memories ORDER BY createdAt DESC LIMIT 10"

# Memory analysis
sqlite3 project-wiz.db "SELECT type, COUNT(*), AVG(importance) FROM agent_memories GROUP BY type"
```

## Dependencies & Prerequisites

### Required Files/Components
- [ ] `TASK-002`: Agent memory schema must exist
- [ ] `TASK-004`: Agent service for agent validation
- [ ] `src/main/database/connection.ts`: Database connection utility
- [ ] `src/main/conversations/messages.schema.ts`: Message integration reference

### Required Patterns/Conventions
- [ ] Service class with static methods pattern
- [ ] Database operations using getDatabase() and Drizzle
- [ ] Error handling with descriptive messages
- [ ] Text search and filtering patterns

### Environment Setup
- [ ] Database with agent_memories table exists
- [ ] Agent service operational for integration testing
- [ ] Testing framework configured for async operations
- [ ] Performance monitoring tools for memory optimization

---

## Task Completion Checklist

- [ ] MemoryService class created with comprehensive memory operations
- [ ] Memory storage methods implemented with type classification
- [ ] Memory retrieval methods with importance and recency scoring
- [ ] Memory search functionality with relevance ranking
- [ ] Memory management and cleanup capabilities
- [ ] Service follows existing project service patterns
- [ ] Database operations use established Drizzle query patterns
- [ ] Error handling consistent with project conventions
- [ ] Unit tests created and passing for all memory operations
- [ ] Integration tests verify agent-memory relationships
- [ ] Performance testing for search and retrieval operations
- [ ] Memory cleanup and optimization policies tested
- [ ] TypeScript compilation passes without errors
- [ ] Linting passes without warnings

**Final Validation**: Run `npm test && npm run type-check` and verify all memory operations work correctly with proper search, storage, and cleanup functionality.