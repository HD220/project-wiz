# Task: Create Agent Worker System

## Meta Information

```yaml
id: TASK-007
title: Create Agent Worker System with AI SDK Integration
source_document: prps/sistema-agentes-ai/README.md
priority: high
estimated_effort: 5 hours
dependencies: [TASK-003, TASK-004, TASK-005, TASK-006]
tech_stack: [TypeScript, AI SDK, Electron Worker Threads, Node.js]
domain_context: agents/worker
project_type: desktop
```

## Primary Goal

**Create a background worker system that processes agent tasks using AI SDK generateText with tool calling capabilities, running 24/7 in worker threads with proper error handling and memory management**

### Success Criteria
- [ ] AgentWorker class that processes tasks using AI SDK generateText
- [ ] Integration with LLM providers for model access with decrypted credentials
- [ ] Tool calling system for agent actions (send messages, analyze code, etc.)
- [ ] Worker thread implementation for background processing
- [ ] Memory integration for context and learning storage
- [ ] Error handling and recovery for AI API failures
- [ ] Worker pool management for multiple concurrent agents

## Complete Context

### Project Architecture Context
```
src/main/
├── agents/                         # CURRENT DOMAIN
│   ├── agent-worker.ts             # THIS TASK - Worker implementation
│   ├── agent.service.ts            # DEPENDENCY - Agent data access
│   ├── memory.service.ts           # DEPENDENCY - Context and learning
│   ├── task-queue.service.ts       # DEPENDENCY - Task processing
│   └── agent-tools.ts              # FUTURE - Tool definitions
├── llm/                            # DEPENDENCY
│   ├── provider.service.ts         # DEPENDENCY - Provider credentials
│   └── providers.schema.ts         # Provider configuration
├── conversations/                  # INTEGRATION
│   ├── message.service.ts          # Message sending capability
│   └── messages.schema.ts          # Message storage
├── main.ts                         # Worker pool initialization
```

### Technology-Specific Context
```yaml
ai_sdk:
  primary_function: generateText (NOT streamText for Electron)
  providers: OpenAI, DeepSeek, Anthropic, Mistral
  tool_calling: Zod schema validation and execution
  error_handling: AI_APICallError for rate limits and auth

worker_threads:
  framework: Node.js worker_threads module
  electron_config: nodeIntegrationInWorker: true
  limitations: No Electron APIs, only Node.js APIs
  communication: MessagePort for task data exchange

database:
  type: SQLite
  orm_framework: Drizzle ORM
  access: Worker threads can access database directly
  concurrency: Handle concurrent database access

backend:
  framework: Electron Main Process
  language: TypeScript
  processing: Background 24/7 operation
  monitoring: Worker health and performance tracking

testing:
  unit_framework: Vitest
  test_command: npm test
  integration: Test with real LLM providers (using test API keys)
  
build_tools:
  package_manager: npm
  bundler: Vite (ensure worker thread compatibility)
  linter: ESLint
  formatter: Prettier
  type_checker: TypeScript
```

### Existing Code Patterns
```typescript
// Pattern 1: Service Integration (from existing services)
import { AgentService } from './agent.service';
import { MemoryService } from './memory.service';
import { TaskQueueService } from './task-queue.service';
import { ProviderService } from '../llm/provider.service';

// Pattern 2: AI SDK Usage (generateText pattern for Electron)
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { deepseek } from '@ai-sdk/deepseek';

const { text, toolCalls } = await generateText({
  model: openai('gpt-4o-mini'),
  system: agent.systemPrompt,
  prompt: contextualPrompt,
  tools: availableTools,
  temperature: 0.7,
  maxTokens: 2000,
});

// Pattern 3: Error Handling (from existing services)
try {
  const result = await operation();
  return { success: true, data: result };
} catch (error) {
  return { 
    success: false, 
    error: error instanceof Error ? error.message : 'Unknown error' 
  };
}

// Pattern 4: Worker Thread Communication
import { parentPort, workerData } from 'worker_threads';

parentPort?.on('message', (task) => {
  processTask(task).then(result => {
    parentPort?.postMessage({ type: 'result', data: result });
  });
});
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
  - Node.js built-ins (worker_threads, crypto)
  - External libraries (ai, @ai-sdk/*)
  - Internal modules with @/ alias
  - Relative imports for same domain

error_handling:
  pattern: Comprehensive try/catch with specific error types
  logging: Structured logging for debugging and monitoring
  recovery: Graceful degradation and retry mechanisms
```

### Validation Commands
```bash
npm run type-check      # TypeScript type checking
npm run lint           # ESLint checks
npm run format         # Prettier formatting
npm test              # Run unit tests
npm run dev           # Start development with worker pool
```

## Implementation Steps

### Phase 1: Worker Foundation
```
CREATE src/main/agents/agent-worker.ts:
  - SETUP_IMPORTS:
    • Import AI SDK core functions (generateText)
    • Import AI SDK providers (openai, deepseek, anthropic)
    • Import worker_threads for background processing
    • Import service dependencies
    • Import error handling utilities
  
  - DEFINE_INTERFACES:
    • AgentWorkerConfig (agent, provider, tools)
    • TaskProcessingContext (memories, conversation, project)
    • ProcessingResult (success, response, toolCalls, error)
    • WorkerPoolOptions (maxWorkers, taskTimeout)
  
  - CREATE_WORKER_CLASS:
    • AgentWorker class with agent and provider configuration
    • Model initialization from provider credentials
    • Tool system integration
    • Context building from memories and conversations
  
  - VALIDATE: npm run type-check
  - IF_FAIL: Check import paths and interface definitions
```

### Phase 2: AI Model Integration
```
IMPLEMENT_MODEL_SETUP:
  - CREATE_MODEL_FROM_PROVIDER:
    • Support OpenAI, DeepSeek, Anthropic providers
    • Use decrypted provider credentials
    • Handle custom base URLs and configurations
    • Apply model-specific parameters and limits
  
  - CONFIGURE_MODEL_PARAMETERS:
    • Parse agent model configuration JSON
    • Set temperature, max tokens, system prompts
    • Apply provider-specific optimizations
    • Handle model availability and fallbacks
  
  - VALIDATE_PROVIDER_ACCESS:
    • Test provider connectivity
    • Validate API key authentication
    • Handle rate limiting and quotas
    • Implement provider health checks
  
  - VALIDATE: npm run type-check
  - IF_FAIL: Check AI SDK provider configurations
```

### Phase 3: Task Processing Logic
```
IMPLEMENT_TASK_PROCESSING:
  - PROCESS_TASK_METHOD:
    • Get task from queue system
    • Build contextual prompt from memories
    • Execute generateText with tools
    • Handle tool execution results
    • Store results and update memory
  
  - BUILD_CONTEXT:
    • Retrieve relevant memories
    • Include conversation history
    • Add project and user context
    • Format context for optimal AI processing
  
  - HANDLE_TOOL_CALLS:
    • Execute tool functions with parameters
    • Validate tool call results
    • Handle tool execution errors
    • Update context with tool results
  
  - STORE_PROCESSING_RESULTS:
    • Store agent response in appropriate location
    • Update agent memory with new learnings
    • Mark task as completed or failed
    • Handle processing statistics
  
  - VALIDATE: npm test
  - IF_FAIL: Add test cases for task processing workflow
```

### Phase 4: Worker Thread Implementation
```
IMPLEMENT_WORKER_THREADS:
  - WORKER_POOL_MANAGER:
    • Create and manage worker thread pool
    • Distribute tasks across available workers
    • Handle worker lifecycle and health
    • Implement worker restart on failures
  
  - WORKER_COMMUNICATION:
    • Use MessagePort for task distribution
    • Handle worker responses and errors
    • Implement worker heartbeat monitoring
    • Support graceful worker shutdown
  
  - WORKER_ISOLATION:
    • Ensure workers can only access authorized resources
    • Handle database connections in workers
    • Manage memory usage per worker
    • Implement worker resource limits
  
  - BACKGROUND_PROCESSING:
    • Continuous task processing loop
    • Handle queue polling and task distribution
    • Implement 24/7 operation capabilities
    • Support system pause/resume
  
  - VALIDATE: npm test
  - IF_FAIL: Test worker thread communication and isolation
```

### Phase 5: Error Handling and Recovery
```
IMPLEMENT_ERROR_HANDLING:
  - AI_API_ERROR_HANDLING:
    • Handle rate limiting with backoff
    • Manage authentication failures
    • Deal with model unavailability
    • Implement provider failover
  
  - WORKER_ERROR_RECOVERY:
    • Restart failed workers automatically
    • Handle worker memory leaks
    • Manage worker crashes gracefully
    • Implement circuit breaker patterns
  
  - TASK_FAILURE_HANDLING:
    • Mark tasks as failed with error details
    • Implement retry mechanisms
    • Handle permanent failures
    • Notify relevant systems of failures
  
  - SYSTEM_MONITORING:
    • Track worker performance metrics
    • Monitor AI API usage and costs
    • Log processing statistics
    • Implement health check endpoints
  
  - VALIDATE: npm test
  - IF_FAIL: Test comprehensive error scenarios
```

## Validation Checkpoints

### Checkpoint 1: Worker Setup
```
VALIDATE_WORKER_SETUP:
  - TEST_WORKER_INITIALIZATION:
    • Create AgentWorker with valid configuration
    • Verify model setup with provider credentials
    • Test tool system initialization
    • Check memory and context access
  
  - TEST_PROVIDER_INTEGRATION:
    • Test OpenAI provider setup
    • Test DeepSeek provider setup
    • Verify credential decryption
    • Test custom endpoint configurations
```

### Checkpoint 2: Task Processing
```
VALIDATE_TASK_PROCESSING:
  - TEST_SIMPLE_TASK:
    • Process basic message sending task
    • Verify AI response generation
    • Check tool call execution
    • Validate result storage
  
  - TEST_COMPLEX_TASK:
    • Process multi-step task with tools
    • Verify context building from memories
    • Test tool chaining and results
    • Check memory updates
```

### Checkpoint 3: Worker Threads
```
VALIDATE_WORKER_THREADS:
  - TEST_WORKER_POOL:
    • Start worker pool successfully
    • Distribute tasks across workers
    • Verify worker communication
    • Test worker health monitoring
  
  - TEST_CONCURRENT_PROCESSING:
    • Process multiple tasks simultaneously
    • Verify thread safety
    • Test resource isolation
    • Check performance under load
```

### Checkpoint 4: Error Handling
```
VALIDATE_ERROR_HANDLING:
  - TEST_AI_API_ERRORS:
    • Handle rate limiting gracefully
    • Test authentication failure recovery
    • Verify provider failover
    • Check error logging and reporting
  
  - TEST_WORKER_FAILURES:
    • Simulate worker crashes
    • Test automatic worker restart
    • Verify task recovery
    • Check system stability
```

### Checkpoint 5: Integration Testing
```
VALIDATE_INTEGRATION:
  - START: npm run dev
  - TEST_END_TO_END:
    • Start worker pool
    • Enqueue tasks for different agents
    • Verify background processing
    • Test 24/7 operation stability
    • Monitor performance and resource usage
```

## Use Cases & Examples

### Example Data/Input
```typescript
// Example worker configuration
const workerConfig: AgentWorkerConfig = {
  agent: {
    id: "agent-123-uuid",
    name: "Sarah the Frontend Developer",
    systemPrompt: "You are Sarah, a helpful frontend developer...",
    modelConfig: {
      model: "gpt-4o-mini",
      temperature: 0.7,
      maxTokens: 2000
    }
  },
  provider: {
    type: "openai",
    apiKey: "decrypted-api-key",
    baseUrl: "https://api.openai.com/v1"
  },
  tools: ["sendMessage", "analyzeCode", "createTask"]
};

// Example task processing context
const processingContext: TaskProcessingContext = {
  memories: [
    {
      type: "learning",
      content: "User prefers TypeScript and clean code",
      importance: 8
    }
  ],
  conversation: {
    id: "conv-456-uuid",
    recentMessages: [...]
  },
  project: {
    id: "project-789-uuid",
    context: "React application with TypeScript"
  }
};

// Example processing result
const processingResult: ProcessingResult = {
  success: true,
  response: "I've analyzed the code and found several optimization opportunities...",
  toolCalls: [
    {
      tool: "sendMessage",
      parameters: {
        conversationId: "conv-456-uuid",
        content: "Here's my analysis..."
      },
      result: {
        messageId: "msg-101112-uuid",
        sent: true
      }
    }
  ],
  error: null
};
```

### Common Scenarios
1. **Message Processing**: Agent processes conversation and responds naturally
2. **Code Analysis**: Agent analyzes code and provides feedback via tools
3. **Task Creation**: Agent creates follow-up tasks based on conversations
4. **Learning Storage**: Agent learns from interactions and stores memories
5. **Tool Chaining**: Agent uses multiple tools to complete complex tasks

### Business Rules & Constraints
- **Provider Authentication**: Workers must use valid, non-expired credentials
- **Tool Security**: Tools must validate parameters and permissions
- **Memory Limits**: Workers must respect memory usage limits
- **Processing Timeout**: Tasks must complete within reasonable time limits
- **API Rate Limits**: Workers must respect provider rate limiting

### Edge Cases & Error Scenarios
- **Provider Outage**: Handle temporary AI service unavailability
- **Invalid Credentials**: Handle expired or invalid API keys
- **Tool Failures**: Handle tool execution errors gracefully
- **Memory Overflow**: Handle excessive memory usage in workers
- **Network Issues**: Handle connectivity problems and timeouts

## Troubleshooting Guide

### Common Issues by Technology

#### AI SDK Integration Issues
```
PROBLEM: generateText failures
SOLUTION: 
  - Verify provider credentials are valid and decrypted
  - Check API endpoint accessibility and rate limits
  - Validate model parameters and token limits
  - Implement proper error handling for AI_APICallError

PROBLEM: Tool calling not working
SOLUTION:
  - Verify tool schemas are properly defined with Zod
  - Check tool function implementations
  - Validate tool parameter passing
  - Ensure tools are registered correctly
```

#### Worker Thread Issues
```
PROBLEM: Worker threads not starting
SOLUTION:
  - Verify nodeIntegrationInWorker: true in Electron config
  - Check worker script compilation and paths
  - Ensure worker has access to required modules
  - Validate worker thread communication setup

PROBLEM: Worker memory leaks
SOLUTION:
  - Implement proper cleanup in worker lifecycle
  - Monitor memory usage and implement limits
  - Restart workers periodically
  - Use weak references for large objects
```

#### Performance Issues
```
PROBLEM: Slow task processing
SOLUTION:
  - Optimize AI prompt construction
  - Implement parallel processing where possible
  - Cache frequently used context data
  - Monitor and tune worker pool size

PROBLEM: High API costs
SOLUTION:
  - Optimize prompt length and complexity
  - Implement intelligent caching
  - Use cheaper models for simple tasks
  - Monitor token usage and implement budgets
```

### Debug Commands
```bash
# Worker system testing
npm test agent-worker.test.ts        # Specific worker tests
npm run type-check --verbose         # Detailed type errors

# Worker monitoring
ps aux | grep node                   # Check worker processes
top -p $(pgrep -f "agent-worker")    # Monitor worker resources

# AI SDK debugging
export AI_DEBUG=1                    # Enable AI SDK debug logging
npm run dev                          # Start with debug mode

# Database debugging
sqlite3 project-wiz.db "SELECT status, COUNT(*) FROM agent_tasks GROUP BY status"
```

## Dependencies & Prerequisites

### Required Files/Components
- [ ] `TASK-003`: LLM provider service with credential decryption
- [ ] `TASK-004`: Agent service for agent configuration
- [ ] `TASK-005`: Memory service for context and learning
- [ ] `TASK-006`: Task queue service for task processing
- [ ] AI SDK providers (@ai-sdk/openai, @ai-sdk/deepseek, etc.)

### Required Patterns/Conventions
- [ ] AI SDK generateText usage (not streamText)
- [ ] Worker thread communication patterns
- [ ] Error handling for AI API failures
- [ ] Service integration patterns
- [ ] Background processing patterns

### Environment Setup
- [ ] All previous tasks completed and tested
- [ ] AI SDK dependencies installed and configured
- [ ] Electron configuration supports worker threads
- [ ] Test LLM provider API keys available
- [ ] Performance monitoring tools configured

---

## Task Completion Checklist

- [ ] AgentWorker class created with AI SDK integration
- [ ] LLM provider integration with credential management
- [ ] Task processing logic with context building
- [ ] Tool calling system implementation
- [ ] Worker thread implementation for background processing
- [ ] Worker pool management and health monitoring
- [ ] Error handling for AI API and worker failures
- [ ] Memory integration for context and learning storage
- [ ] Unit tests created and passing for all worker operations
- [ ] Integration tests verify end-to-end task processing
- [ ] Performance testing validates 24/7 operation
- [ ] Error recovery testing ensures system stability
- [ ] TypeScript compilation passes without errors
- [ ] Linting passes without warnings
- [ ] Worker system operates reliably in background

**Final Validation**: Run `npm test && npm run dev` and verify worker system processes agent tasks continuously using AI SDK with proper tool execution and memory integration.