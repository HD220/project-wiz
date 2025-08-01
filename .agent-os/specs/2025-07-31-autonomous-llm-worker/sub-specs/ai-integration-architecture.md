# AI Integration Architecture Specification

> **Spec**: Autonomous LLM Worker Integration  
> **Created**: 2025-08-01  
> **Status**: Architecture Finalized - Ready for Implementation  
> **Pattern**: Centralized Event-Driven Orchestration

## 📋 Executive Summary  

This document defines the definitive architecture for integrating the AI worker system with Project Wiz messaging platform. The solution uses a **centralized orchestration pattern** where the `AgenticWorkerHandler` serves as the single point of integration with the worker system, managing the complete lifecycle of AI jobs while keeping services decoupled through an event bus.

**Key Innovation**: Services are "dumb" regarding the worker - they only publish events. The `AgenticWorkerHandler` proactively calls services when needed, eliminating the need for services to register listeners or wait for worker results.

---

## 🎯 Core Architecture Principles

### **1. Centralized Worker Orchestration**
- **Single Point of Integration**: `AgenticWorkerHandler` is the ONLY component that communicates with the worker
- **Proactive Service Calls**: Handler calls services directly when processing results
- **Complete Data Preparation**: All database queries performed in main process before sending to worker

### **2. Event-Driven Decoupling**
- **Services Publish Events**: Services emit events to global event bus without knowing about worker
- **Handler Listens**: `AgenticWorkerHandler` listens to relevant events and acts accordingly
- **Zero Service Coupling**: Services don't know worker exists or register for worker events

### **3. Worker Agnosticism**
- **Zero External Queries**: Worker only accesses `jobsTable`, all data comes in `job.data`
- **Complete Job Payloads**: All necessary data (agents, providers, context) included in job creation
- **Pure Processing**: Worker focuses solely on LLM processing logic

---

## 🏗️ Component Architecture

### **1. Global Event Bus**
```typescript
// shared/events/event-bus.ts
export interface SystemEvents {
  // User interactions
  'user-sent-message': {
    conversationId: string;
    message: SelectMessage;
    conversationContext: ConversationContext;
  };
  
  // Agent lifecycle
  'agent-status-changed': {
    agentId: string;
    oldStatus: AgentStatus;
    newStatus: AgentStatus;
  };
  
  // System notifications
  'conversation-updated': {
    conversationId: string;
    updateType: 'new-message' | 'agent-response' | 'status-change';
  };
}

export class EventBus extends EventEmitter {
  emit<K extends keyof SystemEvents>(event: K, payload: SystemEvents[K]): boolean
  on<K extends keyof SystemEvents>(event: K, listener: (payload: SystemEvents[K]) => void): this
}

// Global singleton instance
export const eventBus = new EventBus();
```

### **2. AgenticWorkerHandler - Central Orchestrator**
```typescript
// shared/worker/agentic-worker.handler.ts
export class AgenticWorkerHandler extends EventEmitter {
  private queueClient: QueueClient;
  private activeJobs = new Map<string, JobContext>();
  
  constructor() {
    super();
    this.queueClient = new QueueClient("llm-jobs");
    this.setupEventListeners();    // Listen to event bus
    this.setupWorkerListeners();   // Listen to worker results
  }
  
  /**
   * CORE RESPONSIBILITY: Listen to system events and create worker jobs
   */
  private setupEventListeners(): void {
    eventBus.on('user-sent-message', this.handleUserMessage.bind(this));
    eventBus.on('agent-status-changed', this.handleAgentStatusChange.bind(this));
  }
  
  /**
   * CORE RESPONSIBILITY: Listen to worker results and process them
   */
  private setupWorkerListeners(): void {
    this.queueClient.on('job-completed', this.handleJobCompleted.bind(this));
    this.queueClient.on('job-failed', this.handleJobFailed.bind(this));
    this.queueClient.on('job-progress', this.handleJobProgress.bind(this));
  }
  
  /**
   * EVENT HANDLER: User sent message - create job if agents present
   */
  private async handleUserMessage(payload: SystemEvents['user-sent-message']): Promise<void> {
    const { conversationId, message, conversationContext } = payload;
    
    try {
      // Build COMPLETE job data (all queries done here)
      const completeJobData = await this.buildCompleteJobData(conversationId, message, conversationContext);
      
      if (completeJobData.agents.length === 0) {
        logger.debug(`No active agents in conversation ${conversationId}, skipping job creation`);
        return;
      }
      
      // Create job with complete data
      const jobResult = await this.queueClient.add(completeJobData, {
        priority: 1,
        attempts: 3,
        timeout: 30000
      });
      
      // Track job for result processing
      this.activeJobs.set(jobResult.jobId, {
        type: 'conversation',
        conversationId,
        triggerMessageId: message.id,
        agentIds: completeJobData.agents.map(a => a.id),
        createdAt: new Date()
      });
      
      // Update agent status to busy (call service directly)
      await this.updateAgentsStatus(completeJobData.agents.map(a => a.id), 'busy');
      
      logger.info(`Created conversation job ${jobResult.jobId} for conversation ${conversationId} with ${completeJobData.agents.length} agents`);
      
    } catch (error) {
      logger.error(`Error creating job for conversation ${conversationId}:`, error);
    }
  }
  
  /**
   * WORKER RESULT HANDLER: Process completed job results
   */
  private async handleJobCompleted(jobResult: any): Promise<void> {
    const { jobId, result } = jobResult;
    const jobContext = this.activeJobs.get(jobId);
    
    if (!jobContext) {
      logger.warn(`Received result for unknown job ${jobId}`);
      return;
    }
    
    try {
      // Route result processing based on action type
      await this.processJobResult(result, jobContext);
      
      // Clean up tracking
      this.activeJobs.delete(jobId);
      
      logger.info(`Successfully processed job ${jobId} result: ${result.action}`);
      
    } catch (error) {
      logger.error(`Error processing job result ${jobId}:`, error);
      await this.handleProcessingError(jobId, jobContext, error);
    }
  }
  
  /**
   * RESULT PROCESSOR: Route job results to appropriate handlers
   */
  private async processJobResult(result: any, jobContext: JobContext): Promise<void> {
    switch (result.action) {
      case 'agent-responses':
        await this.processAgentResponses(result, jobContext);
        break;
        
      case 'no-response':
        await this.processNoResponse(result, jobContext);
        break;
        
      case 'analysis-complete':
        await this.processAnalysisResult(result, jobContext);
        break;
        
      // Future job types can be added here
      default:
        logger.warn(`Unknown job result action: ${result.action} for job type: ${jobContext.type}`);
    }
  }
  
  /**
   * SPECIFIC PROCESSOR: Handle agent responses
   */
  private async processAgentResponses(result: any, jobContext: JobContext): Promise<void> {
    const { conversationId } = jobContext;
    const { responses } = result;
    
    logger.info(`Processing ${responses.length} agent responses for conversation ${conversationId}`);
    
    // Process each agent response
    for (const response of responses) {
      try {
        // CALL messageService directly - no registration needed
        await messageService.sendWithLlmData({
          messageInput: {
            sourceType: 'dm',
            sourceId: conversationId,
            authorId: response.agentUserId,
            content: response.response
          },
          llmData: {
            role: 'assistant',
            content: response.response
          }
        });
        
        // CALL agentService to update status
        await agentService.updateStatus(response.agentId, 'active');
        
        logger.debug(`Created response message for agent ${response.agentId}`);
        
      } catch (error) {
        logger.error(`Error processing response for agent ${response.agentId}:`, error);
      }
    }
    
    // CALL renderer to update UI
    await this.notifyRenderer('conversation-updated', {
      conversationId,
      updateType: 'agent-response',
      messageCount: responses.length
    });
    
    // PUBLISH event for other interested parties
    eventBus.emit('conversation-updated', {
      conversationId,
      updateType: 'agent-response'
    });
  }
  
  /**
   * DATA BUILDER: Create complete job data with all necessary information
   */
  private async buildCompleteJobData(
    conversationId: string, 
    message: SelectMessage, 
    context: ConversationContext
  ): Promise<CompleteJobData> {
    
    // Get all active agents in conversation
    const agents = await dmConversationService.getActiveAgentsInConversation(conversationId);
    
    // Build complete agent data with providers (ALL queries done here)
    const completeAgents = await Promise.all(
      agents.map(async (agent) => {
        const provider = await llmProviderService.findById(agent.providerId);
        const decryptedApiKey = await this.decryptApiKey(provider.encryptedApiKey);
        
        return {
          id: agent.id,
          userId: agent.userId,
          name: agent.name,
          role: agent.role,
          backstory: agent.backstory,
          goal: agent.goal,
          systemPrompt: agent.systemPrompt,
          status: agent.status,
          modelConfig: JSON.parse(agent.modelConfig),
          provider: {
            name: provider.name,
            apiKey: decryptedApiKey,
            baseUrl: provider.baseUrl,
            model: provider.defaultModel,
            rateLimits: provider.rateLimits ? JSON.parse(provider.rateLimits) : null
          }
        };
      })
    );
    
    // Build conversation message history
    const messages = await messageService.getDMMessages(conversationId);
    const recentMessages = messages.slice(-20); // Last 20 messages for context
    const llmMessages = await this.convertToLLMFormat(recentMessages);
    
    return {
      type: 'conversation',
      conversationId,
      triggerMessage: {
        id: message.id,
        content: message.content,
        authorId: message.authorId,  
        createdAt: message.createdAt
      },
      agents: completeAgents,
      messages: llmMessages,
      conversationContext: {
        ...context,
        totalMessages: messages.length,
        participants: await dmConversationService.getParticipants(conversationId)
      }
    };
  }
  
  /**
   * ERROR HANDLER: Handle job failures
   */
  private async handleJobFailed(jobResult: any): Promise<void> {
    const { jobId, error, attempts, maxAttempts } = jobResult;
    const jobContext = this.activeJobs.get(jobId);
    
    if (!jobContext) {
      logger.warn(`Received failure for unknown job ${jobId}`);
      return;
    }
    
    if (attempts < maxAttempts) {
      logger.warn(`Job ${jobId} failed, will retry (${attempts}/${maxAttempts}): ${error}`);
      return; // QueueClient handles retry automatically
    }
    
    // Final failure - handle gracefully
    logger.error(`Job ${jobId} failed permanently after ${maxAttempts} attempts: ${error}`);
    
    await this.handleFinalJobFailure(jobContext, error);
    this.activeJobs.delete(jobId);
  }
  
  /**
   * FAILURE HANDLER: Create error responses for failed jobs
   */
  private async handleFinalJobFailure(jobContext: JobContext, error: string): Promise<void> {
    if (jobContext.type === 'conversation') {
      // Create error message from first agent
      const agents = await agentService.findByIds(jobContext.agentIds);
      if (agents.length > 0) {
        const firstAgent = agents[0];
        
        await messageService.sendWithLlmData({
          messageInput: {
            sourceType: 'dm',
            sourceId: jobContext.conversationId,
            authorId: firstAgent.userId,
            content: 'Desculpe, tive um problema técnico. Pode tentar novamente?'
          },
          llmData: {
            role: 'assistant',
            content: `Error response due to job failure: ${error}`
          }
        });
        
        // Update agent status back to active
        await agentService.updateStatus(firstAgent.id, 'active');
      }
      
      // Notify UI
      await this.notifyRenderer('conversation-updated', {
        conversationId: jobContext.conversationId,
        updateType: 'agent-response'
      });
    }
  }
  
  /**
   * UTILITY: Update multiple agent statuses
   */
  private async updateAgentsStatus(agentIds: string[], status: AgentStatus): Promise<void> {
    await Promise.all(
      agentIds.map(agentId => agentService.updateStatus(agentId, status))
    );
  }
  
  /**
   * UTILITY: Notify renderer process
   */
  private async notifyRenderer(event: string, data: any): Promise<void> {
    const mainWindow = this.getMainWindow(); // From electron-main context
    if (mainWindow) {
      mainWindow.webContents.send(event, data);
    }
  }
}

// Global singleton instance
export const agenticWorkerHandler = new AgenticWorkerHandler();
```

### **3. Enhanced QueueClient as EventEmitter**
```typescript
// features/queue-client/queue-client.ts
export class QueueClient extends EventEmitter {
  private queueName: string;
  private logger = getLogger("queue-client");
  
  constructor(queueName: string) {
    super();
    this.queueName = queueName;
    this.setupWorkerCommunication();
  }
  
  /**
   * Add job to queue
   */
  async add(data: any, opts: JobOptions = {}): Promise<{ jobId: string }> {
    const message = {
      action: "add",
      queueName: this.queueName,
      jobData: data,
      opts,
    };

    this.logger.debug(`Adding job to queue ${this.queueName}:`, { message });
    return this.sendMessage(message);
  }
  
  /**
   * Setup worker communication and event emission
   */
  private setupWorkerCommunication(): void {
    workerManager.on('message', (message) => {
      if (message.queueName === this.queueName) {
        this.logger.debug(`Received worker message for queue ${this.queueName}:`, message);
        
        switch (message.type) {
          case 'job-completed':
            this.emit('job-completed', {
              jobId: message.jobId,
              result: message.result,
              queueName: this.queueName
            });
            break;
            
          case 'job-failed':
            this.emit('job-failed', {
              jobId: message.jobId,
              error: message.error,
              attempts: message.attempts,
              maxAttempts: message.maxAttempts,
              queueName: this.queueName
            });
            break;
            
          case 'job-progress':
            this.emit('job-progress', {
              jobId: message.jobId,
              progress: message.progress,
              queueName: this.queueName
            });
            break;
            
          default:
            this.logger.warn(`Unknown worker message type: ${message.type}`);
        }
      }
    });
  }
  
  /**
   * Send message to worker with response handling
   */
  private async sendMessage(message: any): Promise<any> {
    this.logger.debug(`Sending message to worker:`, message);
    try {
      const result = await workerManager.sendMessageWithResponse(message);
      this.logger.debug(`Worker response:`, result);
      return result;
    } catch (error) {
      this.logger.error(`Worker communication error:`, error);
      throw error;
    }
  }
}
```

### **4. Service Integration Pattern (Example: MessageService)**
```typescript
// features/message/message.service.ts (Enhanced)
export const messageService = {
  /**
   * Send message to DM - publishes event for worker processing
   */
  async sendToDM(dmId: string, authorId: string, content: string): Promise<SelectMessage> {
    // Save message to database
    const message = await this.send({
      sourceType: "dm",
      sourceId: dmId,  
      authorId,
      content,
    });

    try {
      // Build conversation context for potential agent processing
      const conversationContext = await this.buildConversationContext(dmId);
      
      // PUBLISH EVENT - AgenticWorkerHandler listens and acts
      eventBus.emit('user-sent-message', {
        conversationId: dmId,
        message,
        conversationContext
      });
      
      logger.debug(`Published user-sent-message event for conversation ${dmId}`);
      
    } catch (error) {
      logger.error(`Error building conversation context for ${dmId}:`, error);
      // Don't fail message sending if context building fails
    }

    return message;
  },
  
  /**
   * Build conversation context with all necessary data
   */
  async buildConversationContext(dmId: string): Promise<ConversationContext> {
    const conversation = await dmConversationService.findById(dmId);
    const participants = await dmConversationService.getParticipants(dmId);
    const messageCount = await this.getMessageCount('dm', dmId);
    
    return {
      conversation: {
        id: conversation.id,
        name: conversation.name,
        description: conversation.description,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt
      },
      participants: participants.map(p => ({
        id: p.id,
        participantId: p.participantId,
        role: p.role || 'member'
      })),
      metadata: {
        totalMessages: messageCount,
        lastActivity: conversation.updatedAt,
        hasActiveAgents: participants.some(p => p.isAgent && p.isActive)
      }
    };
  },
  
  // ... existing methods remain unchanged
};
```

---

## 🔄 Complete Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                 CENTRALIZED ORCHESTRATION FLOW                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 👤 User sends message via UI                                   │
│      │                                                          │
│      ▼                                                          │
│ 📝 DM Handler → MessageService.sendToDM()                      │
│      ├─→ Save message to messagesTable                         │
│      ├─→ Build conversation context                            │
│      └─→ eventBus.emit('user-sent-message', {...})             │
│                    │                                            │
│                    ▼                                            │
│ 🎯 AgenticWorkerHandler.handleUserMessage() [LISTENS]          │
│      ├─→ Get agents in conversation                            │
│      ├─→ Get agent providers + decrypt API keys               │
│      ├─→ Get message history (last 20)                        │
│      ├─→ Build COMPLETE job data                               │
│      ├─→ queueClient.add(completeJobData)                     │
│      ├─→ agentService.updateStatus(agents, 'busy')            │
│      └─→ Track job in activeJobs map                          │
│                    │                                            │
│                    ▼                                            │
│ 🔄 Worker: ConversationProcessor.process()                     │
│      ├─→ Use ONLY job.data (no external queries)              │
│      ├─→ Select which agents should respond                   │
│      ├─→ Generate LLM responses for selected agents           │
│      └─→ Return { action: 'agent-responses', responses: [...]} │
│                    │                                            │
│                    ▼                                            │
│ 📡 QueueClient emits 'job-completed' event                    │
│                    │                                            │
│                    ▼                                            │
│ 🎯 AgenticWorkerHandler.handleJobCompleted() [RECEIVES]        │
│      ├─→ Route to processAgentResponses()                     │
│      ├─→ FOR EACH response:                                   │
│      │   ├─→ messageService.sendWithLlmData() [CALLS DIRECT]  │
│      │   └─→ agentService.updateStatus(id, 'active') [CALLS]  │
│      ├─→ notifyRenderer('conversation-updated')               │
│      ├─→ eventBus.emit('conversation-updated')                │
│      └─→ Clean up activeJobs tracking                         │
│                    │                                            │
│                    ▼                                            │
│ 📱 Renderer receives IPC → Updates UI                         │
│      ├─→ Invalidate TanStack Query cache                      │
│      ├─→ Show new agent messages                              │
│      └─→ Update agent status indicators                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Worker Side Implementation

### **Conversation Processor (Enhanced)**
```typescript
// worker/processors/conversation-processor.ts
export class ConversationProcessor {
  async process(job: Job<CompleteJobData>): Promise<JobResult> {
    const { conversationId, triggerMessage, agents, messages, conversationContext } = job.data;
    
    logger.info(`Processing conversation job for ${conversationId} with ${agents.length} agents`);
    
    try {
      // Select which agents should respond based on context
      const respondingAgents = await this.selectRespondingAgents(agents, messages, conversationContext);
      
      if (respondingAgents.length === 0) {
        return {
          action: 'no-response',
          reason: 'No agents available to respond',
          conversationId
        };
      }
      
      // Generate responses from selected agents
      const responses = await this.generateAgentResponses(respondingAgents, messages);
      
      return {
        action: 'agent-responses',
        conversationId,
        responses
      };
      
    } catch (error) {
      logger.error(`Error processing conversation job:`, error);
      throw error;
    }
  }
  
  /**
   * Select which agents should respond based on conversation context
   */
  private async selectRespondingAgents(
    agents: CompleteAgent[], 
    messages: LLMMessage[], 
    context: ConversationContext
  ): Promise<CompleteAgent[]> {
    
    // Filter to active agents only
    const activeAgents = agents.filter(agent => agent.status === 'active');
    
    if (activeAgents.length === 0) {
      return [];
    }
    
    // Simple selection: first active agent responds
    // Future: More sophisticated selection based on:
    // - Agent relevance to message content
    // - Agent availability/rate limits
    // - Conversation context and history
    // - Agent specialization matching
    
    return [activeAgents[0]];
  }
  
  /**
   * Generate LLM responses for selected agents
   */
  private async generateAgentResponses(
    agents: CompleteAgent[], 
    messages: LLMMessage[]
  ): Promise<AgentResponse[]> {
    
    const responses = [];
    
    for (const agent of agents) {
      try {
        // Build system prompt
        const systemPrompt = `${agent.systemPrompt}\n\nYou are ${agent.name}, ${agent.role}. ${agent.backstory}. Your goal: ${agent.goal}`;
        
        // Prepare messages for LLM
        const llmMessages = [
          { role: 'system', content: systemPrompt },
          ...messages
        ];
        
        // Generate response using agent's provider
        const response = await this.callLLM(agent.provider, agent.modelConfig, llmMessages);
        
        responses.push({
          agentId: agent.id,
          agentUserId: agent.userId,
          response: response.content,
          model: agent.modelConfig.model,
          tokensUsed: response.usage?.total_tokens || 0
        });
        
      } catch (error) {
        logger.error(`Error generating response for agent ${agent.id}:`, error);
        // Continue with other agents
      }
    }
    
    return responses;
  }
  
  /**
   * Call LLM API using agent's provider configuration
   */
  private async callLLM(
    provider: ProviderConfig, 
    modelConfig: ModelConfig, 
    messages: LLMMessage[]
  ): Promise<LLMResponse> {
    
    // Use provider configuration to make LLM call
    // This is where the actual LLM API integration happens
    // Implementation depends on provider (OpenAI, Anthropic, DeepSeek, etc.)
    
    const response = await generateText({
      model: openai(modelConfig.model), // or anthropic(), etc.
      messages,
      apiKey: provider.apiKey,
      baseURL: provider.baseUrl,
      temperature: modelConfig.temperature || 0.7,
      maxTokens: modelConfig.maxTokens || 1000,
    });
    
    return {
      content: response.text,
      usage: response.usage
    };
  }
}
```

---

## 📊 Type Definitions

```typescript
// shared/types/worker.types.ts
export interface CompleteJobData {
  type: 'conversation' | 'analysis' | 'generation';
  conversationId: string;
  triggerMessage: {
    id: string;
    content: string;
    authorId: string;
    createdAt: Date;
  };
  agents: CompleteAgent[];
  messages: LLMMessage[];
  conversationContext: ConversationContext;
}

export interface CompleteAgent {
  id: string;
  userId: string;
  name: string;
  role: string;
  backstory: string;
  goal: string;
  systemPrompt: string;
  status: AgentStatus;
  modelConfig: ModelConfig;
  provider: ProviderConfig;
}

export interface ProviderConfig {
  name: string;
  apiKey: string;
  baseUrl?: string;
  model: string;
  rateLimits?: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
}

export interface JobContext {
  type: 'conversation' | 'analysis' | 'generation';
  conversationId: string;
  triggerMessageId: string;
  agentIds: string[];
  createdAt: Date;
}

export interface JobResult {
  action: 'agent-responses' | 'no-response' | 'analysis-complete';
  conversationId: string;
  responses?: AgentResponse[];
  reason?: string;
}

export interface AgentResponse {
  agentId: string;
  agentUserId: string;
  response: string;
  model: string;
  tokensUsed: number;
}

export interface ConversationContext {
  conversation: {
    id: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
  };
  participants: {
    id: string;
    participantId: string;
    role: string;
  }[];
  metadata: {
    totalMessages: number;
    lastActivity: Date;
    hasActiveAgents: boolean;
  };
}
```

---

## 🛡️ Error Handling & Resilience

### **Job Failure Management**
- **Automatic Retry**: QueueClient handles retry logic with exponential backoff
- **Graceful Degradation**: Failed jobs create error messages from agents
- **Status Recovery**: Agent status reset to 'active' even on job failure
- **Error Logging**: Comprehensive logging for debugging

### **Service Call Failures**
- **Transaction Safety**: Database operations wrapped in transactions
- **Partial Success**: Single agent failures don't break entire job processing
- **UI Consistency**: Renderer always notified of conversation updates

### **Worker Communication**
- **Timeout Handling**: Jobs have configurable timeouts
- **Connection Recovery**: Worker manager handles reconnection
- **Message Integrity**: All worker messages include queue context

---

## 🚀 Implementation Plan

### **Phase 1: Core Infrastructure (Week 1)**
- [ ] **Create EventBus system**
  - [ ] Define SystemEvents interface
  - [ ] Implement EventBus class with typed events
  - [ ] Create global singleton instance

- [ ] **Create AgenticWorkerHandler**
  - [ ] Basic class structure with event listening
  - [ ] Worker communication setup
  - [ ] Job tracking implementation

- [ ] **Enhance QueueClient**
  - [ ] Add EventEmitter functionality
  - [ ] Implement worker message routing
  - [ ] Add comprehensive logging

### **Phase 2: Message Integration (Week 1)**
- [ ] **Enhance MessageService**
  - [ ] Add event publishing to sendToDM
  - [ ] Implement conversation context building
  - [ ] Add error handling for context failures

- [ ] **Implement Job Creation**
  - [ ] Complete data gathering logic
  - [ ] Agent and provider data compilation
  - [ ] Message history formatting

- [ ] **Basic End-to-End Test**
  - [ ] User message → Event → Job creation
  - [ ] Verify complete job data structure

### **Phase 3: Result Processing (Week 1)**
- [ ] **Implement Job Result Handling**
  - [ ] Job completion processing
  - [ ] Agent response creation
  - [ ] Agent status management

- [ ] **Add Error Handling**
  - [ ] Job failure processing
  - [ ] Error message creation
  - [ ] Status recovery logic

- [ ] **UI Integration**
  - [ ] Renderer notification system
  - [ ] Cache invalidation triggers
  - [ ] Real-time updates

### **Phase 4: Testing & Polish (Week 1)**
- [ ] **Comprehensive Testing**
  - [ ] End-to-end conversation flows
  - [ ] Error scenarios and recovery
  - [ ] Multiple agent scenarios
  - [ ] Performance under load

- [ ] **Documentation & Monitoring**
  - [ ] API documentation
  - [ ] Logging standardization
  - [ ] Performance metrics

---

## 📋 Database Schema (No Changes Required)

The architecture uses existing database tables without modifications:

- **`messagesTable`** - Store user and agent messages
- **`llmMessagesTable`** - Store LLM-specific message data  
- **`agentsTable`** - Agent configuration and status
- **`jobsTable`** - Worker job processing (unchanged)
- **`dmConversationsTable`** - Conversation management
- **`dmParticipantsTable`** - Conversation participants
- **`llmProvidersTable`** - Provider configurations

All integration data is managed in memory (job tracking) or passed through job data payload.

---

## ✅ Success Criteria

### **Functional Requirements**
- [ ] Users can send messages to agents and receive contextual responses
- [ ] Multiple agents can participate in conversations with intelligent selection
- [ ] System handles job failures gracefully with error messages
- [ ] Agent status accurately reflects processing state
- [ ] UI updates in real-time when agents respond

### **Architecture Requirements**
- [ ] Services remain decoupled from worker system
- [ ] Worker maintains complete data agnosticism
- [ ] All database queries performed in main process
- [ ] Event-driven communication works reliably
- [ ] Single point of worker integration maintained

### **Quality Requirements**
- [ ] Zero changes to core worker/job system
- [ ] Comprehensive error handling and recovery
- [ ] Clean separation of concerns maintained
- [ ] Performance suitable for real-time conversations
- [ ] Extensive logging for debugging and monitoring

---

## 🎯 Conclusion

This architecture provides a robust, scalable foundation for AI agent integration while maintaining clean separation of concerns. The centralized orchestration pattern ensures that the worker system remains agnostic while services stay decoupled through event-driven communication.

**Key Benefits:**
- **Single Responsibility**: Each component has a clear, focused role
- **Future-Proof**: Easy to add new job types and processors
- **Maintainable**: Clean interfaces and minimal coupling
- **Reliable**: Comprehensive error handling and recovery
- **Scalable**: Event-driven architecture supports growth

**Next Step**: Begin Phase 1 implementation with EventBus and AgenticWorkerHandler core infrastructure.