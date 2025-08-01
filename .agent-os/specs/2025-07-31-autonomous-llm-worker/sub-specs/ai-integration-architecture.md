# AI Integration Architecture Specification

> **Spec**: Autonomous LLM Worker Integration
> **Created**: 2025-08-01
> **Status**: Analysis Complete - Ready for Implementation
> **Analysis Method**: Multi-Agent Investigation (Technical Investigator, Fullstack Implementer, Component Architect, Context Fetcher)

## 📋 Executive Summary

This document provides a simplified architectural analysis for integrating the existing AI worker system with the Project Wiz messaging platform. The focus is on creating a clean, agnostic integration that maintains the worker system's generic nature while enabling agent responses in conversations.

**Key Finding**: Project Wiz has excellent foundational infrastructure but lacks the orchestration layer to connect messaging with AI processing. The recommended solution is a **Job Completion Handler** pattern that processes worker results and creates appropriate responses without altering core worker/job structures.

---

## 🔍 Current System Analysis

### ✅ Architectural Strengths Identified

1. **Robust Service Layer**: Excellent separation of concerns with high cohesion, low coupling
2. **Functional Worker System**: Complete job processing with auto-restart and error handling
3. **Enterprise Database**: 14 interconnected tables with soft deletion and full audit trails
4. **Type-Safe IPC**: Standardized main/renderer communication with error handling
5. **ACID Transactions**: Robust database operations with consistency guarantees
6. **Agnostic Worker Design**: Generic job system that can handle any processor type

### ❌ Critical Integration Gaps

1. **Zero Message-Worker Integration**: No connection between message creation and AI processing
2. **Missing Context Management**: No system to build conversation context for LLM processing
3. **No Agent Triggering**: No mechanism for agents to automatically respond to messages
4. **Missing Real-time Updates**: No system to notify UI about completed jobs
5. **No Job Result Processing**: No system to handle completed job results

---

## 🏗️ Current Architecture Deep Dive

### Message System Structure

```typescript
// Current Message Flow
messagesTable {
  id: string (UUID)
  sourceType: "dm" | "channel"  // Polymorphic reference
  sourceId: string              // dm_conversation_id or project_channel_id
  authorId: string              // references usersTable.id
  content: string
  isActive: boolean             // Soft deletion
  createdAt: timestamp_ms
  updatedAt: timestamp_ms
}

llmMessagesTable {
  id: string (UUID)
  messageId: string             // references messagesTable.id
  role: "user" | "assistant" | "system" | "tool"
  content: string
  isActive: boolean
  createdAt: timestamp_ms
  updatedAt: timestamp_ms
}
```

### Agent System Structure

```typescript
// Agent Configuration
agentsTable {
  id: string (UUID)
  userId: string               // Links agent to user record
  ownerId: string              // Who created the agent
  providerId: string           // references llmProvidersTable.id
  name: string
  role: string
  backstory: string
  goal: string
  systemPrompt: string         // Auto-generated from role/backstory/goal
  status: "active" | "inactive" | "busy"
  modelConfig: string (JSON)   // LLM configuration
  isActive: boolean
  createdAt: timestamp_ms
  updatedAt: timestamp_ms
}
```

### Worker System Structure (UNCHANGED)

```typescript
// Job Processing (keep existing structure)
jobsTable {
  id: string (UUID)
  name: string                 // Job type (e.g., "response_generator")
  data: string (JSON)          // Job parameters
  opts: string (JSON)          // Job options (delay, attempts, etc.)
  priority: integer
  status: "waiting" | "active" | "completed" | "failed" | "delayed" | "paused"
  progress: integer (0-100)
  attempts: integer
  maxAttempts: integer
  result: string (JSON)        // Job result data
  failureReason: string
  createdAt: timestamp_ms
  processedOn: timestamp_ms
  finishedOn: timestamp_ms
}
```

---

## 🎯 Recommended Architecture: Simple Job Result Processing

### Architectural Pattern Selection

**Simple Job Completion Handler** pattern that:
- Keeps worker system completely agnostic
- Processes job results without altering job/worker structures
- Uses existing messageService to create responses
- Maintains clean separation of concerns

### Why This Approach?

- **Maintains Worker Agnosticism**: Job and worker systems remain generic
- **Simple Integration**: Minimal new code, maximum reuse of existing patterns
- **Future-Proof**: Can handle any job type, not just agent responses
- **Clean Separation**: Processors handle job-specific logic, handlers process results

---

## 🔧 Implementation Architecture

### 1. Core Components

#### **Job Completion Handler** (New Component)
```typescript
// src/main/shared/job/job-completion.handler.ts
export class JobCompletionHandler {
  // Process any completed job result
  async handleJobCompletion(jobId: string, result: any): Promise<void>
  
  // Delegate to specific result processors
  private async processResponseGeneratorResult(jobData: any, result: any): Promise<void>
  
  // Future: processCodeAnalysisResult, processFileGenerationResult, etc.
}
```

**Responsibilities**:
- Listen for job completion events from worker
- Route job results to appropriate processors based on job type
- Handle job failures with appropriate error responses
- Notify renderer process of updates

#### **Enhanced Message Service** (Minor Modification)
```typescript
// Add to existing messageService - NO major changes
async sendToDM(dmId: string, authorId: string, content: string): Promise<SelectMessage> {
  const message = await this.send({
    sourceType: "dm",
    sourceId: dmId,
    authorId,
    content,
  });

  // NEW: Check if this should trigger agent processing
  await this.checkForAgentTrigger(dmId, message);

  return message;
}

private async checkForAgentTrigger(dmId: string, userMessage: SelectMessage): Promise<void> {
  // Simple logic to create jobs when user messages agents
  const conversation = await dmConversationService.findById(dmId);
  const agents = await this.getActiveAgentsInConversation(dmId);
  
  if (agents.length > 0) {
    await this.createAgentJob(dmId, userMessage, agents[0]);
  }
}
```

### 2. Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SIMPLIFIED INTEGRATION                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 👤 User Message                                                │
│      │                                                          │
│      ▼                                                          │
│ 📝 DM Handler → Message Service → Database                     │
│      │                    │                                     │
│      │                    ▼                                     │
│      │           Check for Agent Trigger                       │
│      │                    │                                     │
│      │                    ▼                                     │
│      │         Create Job (if agents present)                  │
│      │                    │                                     │
│      ▼                    ▼                                     │
│ 📱 Return to User    🔄 Worker Processes Job                   │
│                                                                 │
│                    ┌─────────────────────┐                     │
│                    │   WORKER PROCESS    │                     │
│                    │   (UNCHANGED)       │                     │
│                    │                     │                     │
│                    │ 🔄 Process Job      │                     │
│                    │ 🧠 Generate Response│                     │
│                    │ 💾 Save Result      │                     │
│                    │ 📤 Notify Main      │                     │
│                    └─────────┬───────────┘                     │
│                              │                                 │
│                              ▼                                 │
│                    📨 Job Completion Handler                   │
│                              │                                 │
│                              ├─→ Create Agent Message          │
│                              ├─→ Update Agent Status           │
│                              └─→ Notify Renderer               │
│                                                                 │
│                              ▼                                 │
│                    📱 UI Updates with Agent Response           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Job Data Structure (For Processors)

```typescript
// Data passed to response_generator processor
export interface ResponseGeneratorJobData {
  // Core LLM data
  agent: {
    name: string;
    role: string;
    backstory: string;
  };
  messages: CoreMessage[];
  provider: string;
  model: string;
  apiKey: string;
  
  // Metadata for result processing (added to job.data)
  conversationId: string;
  triggerMessageId: string;
  agentUserId: string; // Agent's user ID for creating response
}
```

---

## 🔧 Implementation Details

### 1. Job Creation Logic

```typescript
// In messageService
private async createAgentJob(dmId: string, userMessage: SelectMessage, agent: SelectAgent): Promise<void> {
  // Build conversation context
  const messages = await this.buildConversationContext(dmId);
  
  // Get agent configuration
  const provider = await llmProviderService.findById(agent.providerId);
  const modelConfig = JSON.parse(agent.modelConfig);
  
  // Create job data
  const jobData: ResponseGeneratorJobData = {
    agent: {
      name: agent.name,
      role: agent.role,
      backstory: agent.backstory
    },
    messages,
    provider: provider.name,
    model: modelConfig.model,
    apiKey: provider.apiKey,
    
    // Metadata for result processing
    conversationId: dmId,
    triggerMessageId: userMessage.id,
    agentUserId: agent.userId
  };
  
  // Send to worker
  const queueClient = new QueueClient("llm-jobs");
  await queueClient.add(jobData, { priority: 1, attempts: 3 });
  
  // Update agent status
  await agentService.updateStatus(agent.id, 'busy');
}

private async buildConversationContext(dmId: string): Promise<CoreMessage[]> {
  // Get recent messages
  const messages = await this.getDMMessages(dmId);
  const recentMessages = messages.slice(-20); // Last 20 messages
  
  // Convert to LLM format
  const llmMessages: CoreMessage[] = [];
  
  for (const message of recentMessages) {
    const llmData = await this.getMessageWithLlmData(message.id);
    
    if (llmData?.llmMessage) {
      llmMessages.push({
        role: llmData.llmMessage.role,
        content: llmData.llmMessage.content
      });
    } else {
      llmMessages.push({
        role: 'user',
        content: message.content
      });
    }
  }
  
  return llmMessages;
}
```

### 2. Job Completion Processing

```typescript
// src/main/shared/job/job-completion.handler.ts
export class JobCompletionHandler {
  async handleJobCompletion(jobId: string, result: any): Promise<void> {
    try {
      // Get job details
      const job = await this.getJobById(jobId);
      const jobData = JSON.parse(job.data);
      
      // Route based on job name
      switch (job.name) {
        case 'response_generator':
          await this.processResponseGeneratorResult(jobData, result);
          break;
        
        // Future job types:
        // case 'code_analyzer':
        //   await this.processCodeAnalysisResult(jobData, result);
        //   break;
        
        default:
          logger.warn(`Unknown job type: ${job.name}`);
      }
      
    } catch (error) {
      logger.error(`Error processing job completion: ${error}`);
    }
  }
  
  private async processResponseGeneratorResult(jobData: ResponseGeneratorJobData, result: any): Promise<void> {
    // Create agent response message
    const agentMessage = await messageService.sendWithLlmData({
      messageInput: {
        sourceType: 'dm',
        sourceId: jobData.conversationId,
        authorId: jobData.agentUserId,
        content: result.response
      },
      llmData: {
        role: 'assistant',
        content: result.response
      }
    });
    
    // Update agent status back to active
    const agent = await agentService.findByUserId(jobData.agentUserId);
    if (agent) {
      await agentService.updateStatus(agent.id, 'active');
    }
    
    // Notify renderer
    this.notifyRenderer('agent-response-ready', {
      conversationId: jobData.conversationId,
      message: agentMessage
    });
  }
  
  private notifyRenderer(event: string, data: any): void {
    const mainWindow = this.getMainWindow();
    if (mainWindow) {
      mainWindow.webContents.send(event, data);
    }
  }
}
```

### 3. Worker Integration

```typescript
// In worker-manager.ts (minimal changes)
// Add job completion handler to existing worker message handling

// When worker sends completion message:
workerProcess.on('message', (message) => {
  if (message.type === 'job-completed') {
    // NEW: Handle job completion
    jobCompletionHandler.handleJobCompletion(message.jobId, message.result);
  }
  
  // Existing response handling...
  const callback = this.responseCallbacks.get(message.id);
  if (callback) {
    callback(message);
    this.responseCallbacks.delete(message.id);
  }
});
```

---

## 🛡️ Error Handling

### Job Failure Processing

```typescript
// In JobCompletionHandler
async handleJobFailure(jobId: string, error: any): Promise<void> {
  const job = await this.getJobById(jobId);
  const jobData = JSON.parse(job.data);
  
  // Create error response message
  await messageService.sendWithLlmData({
    messageInput: {
      sourceType: 'dm',
      sourceId: jobData.conversationId,
      authorId: jobData.agentUserId,
      content: 'Desculpe, tive um problema técnico. Pode tentar novamente?'
    },
    llmData: {
      role: 'assistant',
      content: 'Error response due to job failure'
    }
  });
  
  // Update agent status back to active
  const agent = await agentService.findByUserId(jobData.agentUserId);
  if (agent) {
    await agentService.updateStatus(agent.id, 'active');
  }
}
```

---

## 🚀 Implementation Plan

### Phase 1: Basic Integration (Week 1)
- [ ] **Create JobCompletionHandler**
  - [ ] Basic job completion processing
  - [ ] Response generator result handling
  - [ ] Agent status updates

- [ ] **Enhance MessageService**
  - [ ] Add agent trigger checking
  - [ ] Add conversation context building
  - [ ] Add job creation for agent conversations

- [ ] **Basic Testing**
  - [ ] User sends message → Job created
  - [ ] Job completes → Agent response created
  - [ ] Agent status updates correctly

### Phase 2: Error Handling & Polish (Week 1)
- [ ] **Add Error Handling**
  - [ ] Job failure processing
  - [ ] Error response creation
  - [ ] Proper logging

- [ ] **Add UI Notifications**
  - [ ] IPC events for job completion
  - [ ] Renderer updates for new messages
  - [ ] Agent status indicators

- [ ] **End-to-End Testing**
  - [ ] Complete user→agent→response flow
  - [ ] Error scenarios (job failures, timeouts)
  - [ ] Multiple conversations simultaneously

---

## 📊 Database Schema (NO CHANGES)

### Existing Tables Used (NO MODIFICATIONS)
- `messagesTable` - Store user and agent messages
- `llmMessagesTable` - Store LLM-specific message data
- `agentsTable` - Agent configuration (NO new columns)
- `jobsTable` - Job processing (NO changes to structure)
- `dmConversationsTable` - Conversation management
- `dmParticipantsTable` - Conversation participants

### Job Data Usage
```typescript
// Job data contains all needed info for processing results
{
  // LLM processing data
  agent: { name, role, backstory },
  messages: CoreMessage[],
  provider: string,
  model: string,
  apiKey: string,
  
  // Result processing metadata
  conversationId: string,
  triggerMessageId: string,
  agentUserId: string
}
```

---

## 🎯 Success Criteria

### Functional Requirements ✅
- [ ] Users can send messages to agents and receive automated responses
- [ ] Agent responses are contextually appropriate based on conversation history
- [ ] Failed agent jobs result in appropriate error messages to users
- [ ] Agent status correctly reflects processing state (active/busy)
- [ ] System works with existing worker/job infrastructure unchanged

### Quality Requirements 🏆
- [ ] Zero changes to core worker/job system structures
- [ ] All agent responses stored with proper audit trails
- [ ] Comprehensive logging for debugging
- [ ] Clean separation between job processing and result handling

---

## 📚 Implementation Files

### New Files to Create
- `src/main/shared/job/job-completion.handler.ts` - Main job result processor
- `src/main/shared/job/job-completion.types.ts` - Type definitions

### Files to Modify (Minor Changes)
- `src/main/features/message/message.service.ts` - Add agent triggering
- `src/main/workers/worker-manager.ts` - Add job completion handling

### Files Unchanged
- All worker system files remain exactly the same
- All job system files remain exactly the same
- All database models remain exactly the same

---

## ✅ Conclusion

This simplified architectural approach maintains the agnostic nature of the worker system while enabling AI agent responses in conversations. The implementation focuses on:

1. **Clean Integration**: No changes to core worker/job infrastructure
2. **Simple Flow**: User message → Job creation → Result processing → Agent response
3. **Future-Proof**: Can handle any job type, not just agent responses
4. **Maintainable**: Minimal new code, maximum reuse of existing patterns

The system provides a solid foundation for autonomous AI agents while keeping the architecture clean and extensible for future enhancements.

**Next Step**: Begin Phase 1 implementation with JobCompletionHandler and basic message-job integration.