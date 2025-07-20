# Task 10C: Chat Integration & Interface - Enhanced

## Overview

Integrate the tool system with agent chat conversations and create a comprehensive frontend interface for monitoring and managing tool usage. This micro-task completes the agent tool system by providing seamless chat integration and powerful monitoring capabilities.

## User Value

After completing this task, users can:
- Watch agents use tools naturally in conversations
- Monitor tool usage in real-time with detailed execution logs
- Manage agent permissions through an intuitive interface
- Visualize tool performance and usage statistics
- Control tool access with granular permission settings

## Technical Requirements

### Prerequisites
- Task 10A: Tool Foundation & Registry completed
- Task 10B: Git & Analysis Tools completed
- Existing agent chat service from Task 05
- Frontend component library (Shadcn/ui) available

### Enhanced Chat Integration
- AI SDK tool calling with multi-step conversations
- Tool result display in chat interface
- Tool execution progress indicators
- Error handling and user feedback

## Implementation Steps

### 1. Enhanced Agent Chat Service

```typescript
// Update src/main/agents/agent-chat.service.ts
import { ToolRegistry } from './tools/tool-registry';
import { generateText } from 'ai';

export class AgentChatService {
  
  static async sendMessage(
    agentId: string,
    userMessage: string,
    userId: string
  ): Promise<{ userMessage: any; agentResponse: any }> {
    const db = getDatabase();
    
    // Get or create conversation
    const conversation = await ConversationService.getOrCreateConversation(agentId, userId);
    
    // Store user message
    const userMsg = await MessageService.create({
      conversationId: conversation.id,
      role: "user",
      content: userMessage,
    });

    // Get agent details
    const agent = await AgentService.findById(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    // Get LLM provider
    const provider = await LlmProviderService.findById(agent.llmProviderId);
    if (!provider) {
      throw new Error('LLM provider not found');
    }

    // Create AI provider instance
    const model = this.createAIProvider(provider);

    // Get conversation history with tool context
    const messageHistory = await MessageService.getConversationHistory(conversation.id);

    // Initialize tool registry and get agent's available tools
    ToolRegistry.initialize();
    const tools = await ToolRegistry.getToolsForAgent(agentId);

    // Enhanced system prompt with tool capabilities
    const toolList = Object.keys(tools);
    const enhancedSystemPrompt = `${agent.systemPrompt}

Available Tools:
${toolList.map(toolName => {
  const toolDef = ToolRegistry.getToolByName(toolName);
  return `- ${toolName}: ${toolDef?.description || 'No description'}`;
}).join('\n')}

Tool Usage Guidelines:
- Use tools when they can help accomplish the user's request
- Always explain what you're doing when using tools
- For file operations, use relative paths from the project root
- Be careful with destructive operations and explain consequences
- Chain multiple tools together when needed to complete complex tasks
- Provide meaningful summaries of tool results`;

    try {
      // Generate response with tools
      const result = await generateText({
        model,
        messages: [
          { role: "system", content: enhancedSystemPrompt },
          ...messageHistory.map(msg => ({
            role: msg.role as any,
            content: msg.content,
            toolInvocations: msg.toolCalls ? JSON.parse(msg.toolCalls) : undefined,
          })),
          { role: "user", content: userMessage },
        ],
        tools,
        maxSteps: 5, // Allow multiple tool calls in sequence
        temperature: JSON.parse(agent.modelParameters || '{}').temperature || 0.7,
        maxTokens: JSON.parse(agent.modelParameters || '{}').maxTokens || 2000,
      });

      // Prepare response content with tool results
      let responseContent = result.text;
      const toolResults = [];

      if (result.toolCalls?.length) {
        // Format tool results for display
        for (const toolCall of result.toolCalls) {
          const toolResult = result.toolResults?.find(tr => tr.toolCallId === toolCall.toolCallId);
          if (toolResult) {
            toolResults.push({
              toolName: toolCall.toolName,
              parameters: toolCall.args,
              result: toolResult.result,
              success: !toolResult.result?.error,
              executionTime: toolResult.result?.executionTime,
            });
          }
        }

        // Add tool usage summary to response if tools were used
        const toolSummary = `\n\n**Tools Used:**\n${toolResults.map(tr => 
          `- ${tr.toolName}: ${tr.success ? '✅ Success' : '❌ Failed'}`
        ).join('\n')}`;
        
        responseContent += toolSummary;
      }

      // Store agent response with tool metadata
      const agentMsg = await MessageService.create({
        conversationId: conversation.id,
        role: "assistant",
        content: responseContent,
        toolCalls: result.toolCalls ? JSON.stringify(result.toolCalls) : null,
        metadata: JSON.stringify({
          agentId,
          model: provider.model,
          toolsUsed: result.toolCalls?.length || 0,
          toolResults,
          usage: result.usage,
          steps: result.steps?.length || 1,
        }),
      });

      // Store enhanced memory with tool context
      if (result.toolCalls?.length) {
        await MemoryService.create({
          agentId,
          type: "context",
          content: `Used tools to help with: ${userMessage}. Tools: ${result.toolCalls.map(tc => tc.toolName).join(', ')}`,
          context: {
            conversationId: conversation.id,
            toolCalls: result.toolCalls,
            toolResults,
            userRequest: userMessage,
          },
          importance: 7, // Tool usage is important to remember
        });
      }

      return { userMessage: userMsg, agentResponse: agentMsg };

    } catch (error) {
      // Store error response
      const errorMsg = await MessageService.create({
        conversationId: conversation.id,
        role: "assistant",
        content: `I encountered an error: ${error.message}. Please try again or rephrase your request.`,
        metadata: JSON.stringify({
          agentId,
          error: error.message,
          hadTools: Object.keys(tools).length > 0,
        }),
      });

      return { userMessage: userMsg, agentResponse: errorMsg };
    }
  }

  private static createAIProvider(provider: any) {
    // Same implementation as existing service
    // ... provider creation logic
  }
}
```

### 2. Tool Management Interface

```typescript
// src/renderer/app/agents/[agentId]/tools.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, Settings, Activity, Clock, CheckCircle, XCircle, 
  AlertTriangle, Eye, EyeOff, BarChart3, RefreshCw 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAgentStore } from '@/store/agent-store';
import type { ToolDefinition, SelectToolExecution, ToolPermission } from '@/types/tools';

export default function AgentToolsPage() {
  const { agentId } = useParams({ from: '/agents/$agentId/tools' });
  const { agents } = useAgentStore();
  
  const [availableTools, setAvailableTools] = useState<ToolDefinition[]>([]);
  const [toolExecutions, setToolExecutions] = useState<SelectToolExecution[]>([]);
  const [usageStats, setUsageStats] = useState<any[]>([]);
  const [agentPermissions, setAgentPermissions] = useState<ToolPermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const agent = agents.find(a => a.id === agentId);

  useEffect(() => {
    if (agentId) {
      loadToolData();
    }
  }, [agentId]);

  const loadToolData = async () => {
    setIsLoading(true);
    try {
      const [toolsResult, executionsResult, statsResult, permissionsResult] = await Promise.all([
        window.api.tools.getAvailable(agentId),
        window.api.tools.getExecutions(agentId),
        window.api.tools.getUsageStats(agentId),
        window.api.tools.getPermissions(agentId),
      ]);

      if (toolsResult.success) setAvailableTools(toolsResult.data);
      if (executionsResult.success) setToolExecutions(executionsResult.data);
      if (statsResult.success) setUsageStats(statsResult.data);
      if (permissionsResult.success) setAgentPermissions(permissionsResult.data);
    } catch (error) {
      console.error("Failed to load tool data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePermission = async (permission: ToolPermission) => {
    try {
      if (agentPermissions.includes(permission)) {
        await window.api.tools.revokePermission(agentId, permission);
      } else {
        await window.api.tools.grantPermission(agentId, permission);
      }
      await loadToolData(); // Refresh data
    } catch (error) {
      console.error("Failed to toggle permission:", error);
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const filteredTools = selectedCategory === 'all' 
    ? availableTools 
    : availableTools.filter(tool => tool.category === selectedCategory);

  const categories = ['all', ...new Set(availableTools.map(tool => tool.category))];
  const allPermissions: ToolPermission[] = ['read', 'write', 'system', 'destructive', 'network'];

  if (!agent) {
    return <div>Agent not found</div>;
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{agent.name}'s Tools</h1>
            <p className="text-muted-foreground">
              Manage tools, permissions, and monitor usage
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadToolData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/agents/${agentId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Agent
              </Link>
            </Button>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Tools</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{availableTools.length}</div>
              <p className="text-xs text-muted-foreground">
                {agentPermissions.length} permissions granted
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{toolExecutions.length}</div>
              <p className="text-xs text-muted-foreground">
                {toolExecutions.filter(e => e.success).length} successful
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {toolExecutions.length > 0 
                  ? Math.round((toolExecutions.filter(e => e.success).length / toolExecutions.length) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Overall execution success
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Execution Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {toolExecutions.length > 0
                  ? Math.round(toolExecutions.reduce((sum, e) => sum + (e.executionTime || 0), 0) / toolExecutions.length)
                  : 0}ms
              </div>
              <p className="text-xs text-muted-foreground">
                Average response time
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="tools" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tools">Available Tools</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="executions">Execution History</TabsTrigger>
            <TabsTrigger value="stats">Usage Statistics</TabsTrigger>
          </TabsList>

          {/* Available Tools Tab */}
          <TabsContent value="tools" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Available Tools</CardTitle>
                    <CardDescription>
                      Tools this agent can use based on current permissions
                    </CardDescription>
                  </div>
                  
                  <div className="flex gap-2">
                    {categories.map(category => (
                      <Badge
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredTools.map((tool) => (
                    <div key={tool.name} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{tool.name}</h3>
                        <div className="flex gap-1">
                          <Badge variant={tool.destructive ? "destructive" : "default"}>
                            {tool.category}
                          </Badge>
                          {tool.destructive && (
                            <Badge variant="outline">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Destructive
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {tool.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {tool.permissions.map((perm) => (
                          <Badge key={perm} variant="outline" className="text-xs">
                            {perm}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Permission Management</CardTitle>
                <CardDescription>
                  Control which tool categories this agent can access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allPermissions.map((permission) => {
                    const hasPermission = agentPermissions.includes(permission);
                    const description = {
                      read: "Read-only operations like viewing files and getting status",
                      write: "Modify files and create new content",
                      system: "System-level operations and configuration",
                      destructive: "Operations that can delete or permanently modify data",
                      network: "Network access and external API calls",
                    }[permission];

                    return (
                      <div key={permission} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium capitalize">{permission}</h3>
                            <Badge variant={hasPermission ? "default" : "secondary"}>
                              {hasPermission ? "Granted" : "Denied"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {description}
                          </p>
                        </div>
                        <Button
                          variant={hasPermission ? "destructive" : "default"}
                          size="sm"
                          onClick={() => togglePermission(permission)}
                        >
                          {hasPermission ? (
                            <>
                              <EyeOff className="mr-2 h-4 w-4" />
                              Revoke
                            </>
                          ) : (
                            <>
                              <Eye className="mr-2 h-4 w-4" />
                              Grant
                            </>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Execution History Tab */}
          <TabsContent value="executions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Tool Executions</CardTitle>
                <CardDescription>
                  History of tool usage by this agent
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {toolExecutions.slice(0, 20).map((execution) => (
                    <div key={execution.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(execution.success)}
                          <span className="font-medium">{execution.toolName}</span>
                          <Badge variant={execution.success ? "default" : "destructive"}>
                            {execution.success ? "Success" : "Failed"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{execution.executionTime}ms</span>
                          <span>
                            {formatDistanceToNow(new Date(execution.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      
                      {execution.error && (
                        <Alert variant="destructive" className="mb-3">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{execution.error}</AlertDescription>
                        </Alert>
                      )}
                      
                      <details className="text-sm">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          View Details
                        </summary>
                        <div className="mt-3 space-y-2">
                          <div>
                            <span className="font-medium">Parameters:</span>
                            <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                              {JSON.stringify(JSON.parse(execution.parameters), null, 2)}
                            </pre>
                          </div>
                          
                          {execution.result && (
                            <div>
                              <span className="font-medium">Result:</span>
                              <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                                {JSON.stringify(JSON.parse(execution.result), null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usage Statistics Tab */}
          <TabsContent value="stats" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tool Usage Statistics</CardTitle>
                <CardDescription>
                  Performance metrics and usage patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {usageStats.map((stat) => (
                    <div key={stat.toolName} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{stat.toolName}</h3>
                        <Badge variant="outline">{stat.count} uses</Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Success Rate</span>
                          <span>{Math.round(stat.successRate)}%</span>
                        </div>
                        <Progress value={stat.successRate} className="h-2" />
                        
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Avg Time: {Math.round(stat.avgExecutionTime)}ms</span>
                          <span>{stat.count} total executions</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
```

### 3. Enhanced Chat Interface with Tool Display

```typescript
// Update src/renderer/components/chat/message-item.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Tool, CheckCircle, XCircle } from 'lucide-react';

interface MessageItemProps {
  message: any;
  isUser: boolean;
}

export function MessageItem({ message, isUser }: MessageItemProps) {
  const toolCalls = message.toolCalls ? JSON.parse(message.toolCalls) : [];
  const metadata = message.metadata ? JSON.parse(message.metadata) : {};
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg p-4`}>
        {/* Message Content */}
        <div className="prose prose-sm max-w-none">
          {message.content}
        </div>
        
        {/* Tool Usage Display */}
        {!isUser && toolCalls.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Tool className="h-4 w-4" />
              <span>Used {toolCalls.length} tool(s)</span>
            </div>
            
            <Collapsible>
              <CollapsibleTrigger asChild>
                <button className="flex items-center gap-2 text-sm hover:text-foreground">
                  <ChevronDown className="h-3 w-3" />
                  View Tool Details
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 space-y-2">
                  {metadata.toolResults?.map((result: any, index: number) => (
                    <Card key={index} className="text-xs">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm">
                          {result.success ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-500" />
                          )}
                          {result.toolName}
                          <Badge variant="outline" className="text-xs">
                            {result.executionTime}ms
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <details>
                          <summary className="cursor-pointer">Parameters & Result</summary>
                          <div className="mt-2 space-y-1">
                            <div>
                              <strong>Parameters:</strong>
                              <pre className="mt-1 p-1 bg-muted/50 rounded text-xs overflow-x-auto">
                                {JSON.stringify(result.parameters, null, 2)}
                              </pre>
                            </div>
                            {result.result && (
                              <div>
                                <strong>Result:</strong>
                                <pre className="mt-1 p-1 bg-muted/50 rounded text-xs overflow-x-auto">
                                  {JSON.stringify(result.result, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </details>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
        
        {/* Message Metadata */}
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{new Date(message.createdAt).toLocaleTimeString()}</span>
          {metadata.toolsUsed > 0 && (
            <>
              <span>•</span>
              <span>{metadata.toolsUsed} tool(s) used</span>
            </>
          )}
          {metadata.steps > 1 && (
            <>
              <span>•</span>
              <span>{metadata.steps} steps</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

### 4. Frontend API Integration

```typescript
// Update src/renderer/preload.ts
tools: {
  getAvailable: (agentId: string) => 
    ipcRenderer.invoke('tools:get-available', agentId),
  getByCategory: (category: string) => 
    ipcRenderer.invoke('tools:get-by-category', category),
  getExecutions: (agentId: string, limit?: number) => 
    ipcRenderer.invoke('tools:get-executions', agentId, limit),
  getUsageStats: (agentId?: string) => 
    ipcRenderer.invoke('tools:get-usage-stats', agentId),
  getPermissions: (agentId: string) => 
    ipcRenderer.invoke('tools:get-permissions', agentId),
  grantPermission: (agentId: string, permission: string) => 
    ipcRenderer.invoke('tools:grant-permission', agentId, permission),
  revokePermission: (agentId: string, permission: string) => 
    ipcRenderer.invoke('tools:revoke-permission', agentId, permission),
}

// Update src/renderer/window.d.ts
tools: {
  getAvailable: (agentId: string) => Promise<IpcResponse>;
  getByCategory: (category: string) => Promise<IpcResponse>;
  getExecutions: (agentId: string, limit?: number) => Promise<IpcResponse>;
  getUsageStats: (agentId?: string) => Promise<IpcResponse>;
  getPermissions: (agentId: string) => Promise<IpcResponse>;
  grantPermission: (agentId: string, permission: string) => Promise<IpcResponse>;
  revokePermission: (agentId: string, permission: string) => Promise<IpcResponse>;
};
```

### 5. Integration with Main Process

```typescript
// Update src/main/main.ts
import { setupToolHandlers } from './agents/tools/tool.handlers';
import { ToolRegistry } from './agents/tools/tool-registry';

app.whenReady().then(async () => {
  // ... existing initialization ...
  
  // Initialize tool system
  ToolRegistry.initialize();
  setupToolHandlers();
});
```

## Validation Checkpoints

### Checkpoint 1: Chat Integration
- Test tool calling in agent conversations
- Verify tool results are displayed properly in chat
- Test multi-step tool execution sequences
- Validate error handling and user feedback

### Checkpoint 2: Tool Monitoring
- Test tool execution logging and display
- Verify permission management interface
- Test usage statistics and performance metrics
- Validate real-time updates and data refresh

### Checkpoint 3: User Experience
- Test tool permission workflows
- Verify tool discovery and documentation
- Test tool execution feedback and progress
- Validate overall interface responsiveness

## Success Criteria

✅ **Seamless Integration**: Tools work naturally in agent conversations
✅ **Comprehensive Monitoring**: Complete visibility into tool usage and performance
✅ **Permission Management**: Intuitive control over agent capabilities
✅ **Error Handling**: Robust error reporting and recovery
✅ **Performance Tracking**: Detailed metrics and usage analytics

## Next Steps

After completing chat integration and interface:
1. **Advanced Features**: Tool composition and workflow automation
2. **Enhanced Security**: User approval dialogs and confirmation flows
3. **Performance Optimization**: Tool execution caching and optimization

This task completes the agent tool system by providing seamless integration with conversations and comprehensive monitoring capabilities, delivering a professional tool management experience.