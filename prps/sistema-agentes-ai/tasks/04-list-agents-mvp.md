# Universal Task Template - Pattern-Based Implementation Guide

> Auto-contained tasks with complete context and patterns for LLM implementation across any project/repository

## Meta Information

```yaml
id: TASK-004
title: List Agents - MVP Implementation  
description: Implement agent listing interface showing user's AI agents with status
source_document: prps/sistema-agentes-ai/README.md
priority: high
estimated_effort: 2 hours
dependencies: [TASK-003]
tech_stack: [Electron, React, TypeScript, SQLite, Drizzle ORM]
domain_context: Agent System - Core Agent Management
project_type: desktop
feature_level: mvp
delivers_value: User can view all their created AI agents in an organized list
```

## Primary Goal

**Enable users to view all their AI agents in a clean list interface showing key information and status**

### Success Criteria
- [ ] User can see all their created agents in a list
- [ ] List shows agent name, role, status, and provider
- [ ] Agents are sorted by creation date (newest first)
- [ ] Loading and empty states are handled gracefully
- [ ] List updates when new agents are created
- [ ] Agent status is visually indicated with badges/colors

## Complete Context

### Project Architecture Context
```
project-wiz/
├── src/
│   ├── main/                    # Backend (Electron main process)
│   │   ├── agents/              # Agent bounded context
│   │   │   ├── agents.schema.ts # From TASK-003
│   │   │   ├── agent.service.ts # From TASK-003
│   │   │   ├── agent.handlers.ts # From TASK-003
│   │   │   ├── agent.types.ts   # From TASK-003
│   │   │   └── llm-providers/   # From TASK-001, TASK-002
│   │   └── main.ts              # Handler registration
│   └── renderer/                # Frontend (React)
│       ├── app/                 # TanStack Router pages
│       │   └── agents/          # NEW - Agent pages
│       ├── components/          # Shared components
│       └── store/               # Zustand state management
│           └── agent-store.ts   # From TASK-003
```

### Technology-Specific Context
```yaml
database:
  type: SQLite
  orm_framework: Drizzle ORM  
  query_pattern: Join agents with providers for full info
  
backend:
  service_pattern: AgentService.findByOwner() from TASK-003
  ipc_pattern: "agents:list" handler exists
  
frontend:
  framework: React 19
  state_management: Zustand store (agent-store.ts)
  ui_library: Shadcn/ui Card, Badge, Avatar components
  routing: TanStack Router for /agents page
  styling: Tailwind CSS with consistent spacing
```

### Existing Code Patterns
```typescript
// Pattern 1: Service Query with Joins
// From existing services - get full agent data with provider
const agentsWithProvider = await db
  .select({
    agent: agentsTable,
    provider: llmProvidersTable,
    user: usersTable,
  })
  .from(agentsTable)
  .innerJoin(llmProvidersTable, eq(agentsTable.providerId, llmProvidersTable.id))
  .innerJoin(usersTable, eq(agentsTable.userId, usersTable.id))
  .where(eq(agentsTable.ownerId, ownerId))
  .orderBy(desc(agentsTable.createdAt));

// Pattern 2: List Component Structure  
// From provider list - Card-based layout with loading states
export function AgentList() {
  const { agents, isLoading, error, loadAgents } = useAgentStore();
  
  useEffect(() => {
    loadAgents();
  }, []);
  
  if (isLoading) return <AgentListSkeleton />;
  if (error) return <ErrorAlert error={error} />;
  if (agents.length === 0) return <EmptyAgentState />;
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}

// Pattern 3: Status Badge Mapping
// Visual status indication with consistent colors
const statusMap = {
  active: { variant: "default", color: "green" },
  inactive: { variant: "secondary", color: "gray" },
  busy: { variant: "destructive", color: "yellow" },
} as const;
```

### Project-Specific Conventions
```yaml
ui_patterns:
  - Grid layout for agent cards (responsive)
  - Card-based design with consistent spacing
  - Status badges with semantic colors
  - Avatar placeholders for agents
  - Hover effects for interactivity

data_patterns:
  - Always include provider information in agent lists
  - Sort by createdAt descending (newest first)
  - Filter by current user's ownership
  - Include user data for agent display

error_handling:
  - Graceful loading states with skeletons
  - Clear error messages with retry options
  - Empty states with action prompts
  - Network error recovery
```

### Validation Commands
```bash
npm run type-check       # TypeScript validation
npm run lint             # ESLint checks
npm run dev              # Start development server
npm run quality:check    # All quality checks
```

## Implementation Steps

### Phase 1: Backend Service Enhancement
```
UPDATE src/main/agents/agent.service.ts:
  - ENHANCE: findByOwner method for complete data
    • Add JOIN with llmProvidersTable to get provider info
    • Add JOIN with usersTable to get agent user info
    • Return enriched data with provider and user details
    • Sort by createdAt descending
    
  - METHOD: findByOwnerWithProvider(ownerId: string): Promise<AgentWithProvider[]>
    ```typescript
    static async findByOwnerWithProvider(ownerId: string): Promise<AgentWithProvider[]> {
      const db = getDatabase();
      
      const results = await db
        .select({
          id: agentsTable.id,
          name: agentsTable.name,
          role: agentsTable.role,
          backstory: agentsTable.backstory,
          goal: agentsTable.goal,
          status: agentsTable.status,
          createdAt: agentsTable.createdAt,
          updatedAt: agentsTable.updatedAt,
          provider: {
            id: llmProvidersTable.id,
            name: llmProvidersTable.name,
            type: llmProvidersTable.type,
          },
          user: {
            id: usersTable.id,
            name: usersTable.name,
            avatar: usersTable.avatar,
          },
        })
        .from(agentsTable)
        .innerJoin(llmProvidersTable, eq(agentsTable.providerId, llmProvidersTable.id))
        .innerJoin(usersTable, eq(agentsTable.userId, usersTable.id))
        .where(eq(agentsTable.ownerId, ownerId))
        .orderBy(desc(agentsTable.createdAt));
      
      return results;
    }
    ```
    
  - VALIDATE: npm run type-check
  - TEST: Method returns expected data structure

UPDATE src/main/agents/agent.types.ts:
  - ADD: AgentWithProvider type
    ```typescript
    export interface AgentWithProvider {
      id: string;
      name: string;
      role: string;
      backstory: string;
      goal: string;
      status: AgentStatus;
      createdAt: Date;
      updatedAt: Date;
      provider: {
        id: string;
        name: string;
        type: string;
      };
      user: {
        id: string;
        name: string;
        avatar?: string;
      };
    }
    ```

UPDATE src/main/agents/agent.handlers.ts:
  - MODIFY: "agents:list" handler
    • Use findByOwnerWithProvider instead of basic findByOwner
    • Return enriched agent data
    • Handle owner ID from current session
    
  - HANDLER:
    ```typescript
    ipcMain.handle("agents:list", async (_, ownerId?: string): Promise<IpcResponse> => {
      try {
        const currentOwnerId = ownerId || getCurrentUserId(); // Get from session
        const agents = await AgentService.findByOwnerWithProvider(currentOwnerId);
        return { success: true, data: agents };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to load agents",
        };
      }
    });
    ```
```

### Phase 2: Frontend Store Update
```
UPDATE src/renderer/store/agent-store.ts:
  - MODIFY: agents state type
    • Change from SelectAgent[] to AgentWithProvider[]
    • Update all related actions and selectors
    
  - ENHANCE: loadAgents action
    • Handle enriched data from backend
    • Update error handling for new data structure
    • Add retry mechanism for failed loads
    
  - ADD: Agent filtering selectors
    • getActiveAgents: Filter by status === "active"
    • getAgentsByProvider: Group by provider type
    • searchAgents: Filter by name or role
    
  - STORE_UPDATE:
    ```typescript
    interface AgentState {
      agents: AgentWithProvider[];
      currentAgent: AgentWithProvider | null;
      isLoading: boolean;
      error: string | null;
      isCreating: boolean;
    }
    
    const useAgentStore = create<AgentState>((set, get) => ({
      agents: [],
      currentAgent: null,
      isLoading: false,
      error: null,
      isCreating: false,
      
      loadAgents: async () => {
        set({ isLoading: true, error: null });
        try {
          const result = await window.api.agents.list();
          if (result.success) {
            set({ agents: result.data, isLoading: false });
          } else {
            throw new Error(result.error);
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Failed to load agents",
            isLoading: false 
          });
        }
      },
      
      // ... other actions
    }));
    ```
```

### Phase 3: Agent Card Component
```
CREATE src/renderer/components/agent-card.tsx:
  - IMPLEMENT: Individual agent card component
    • Import Shadcn/ui components (Card, Badge, Avatar)
    • Import agent types
    • Props interface for AgentWithProvider
    
  - COMPONENT_STRUCTURE:
    ```tsx
    interface AgentCardProps {
      agent: AgentWithProvider;
      onClick?: (agent: AgentWithProvider) => void;
    }
    
    export function AgentCard({ agent, onClick }: AgentCardProps) {
      const statusConfig = {
        active: { variant: "default", label: "Active" },
        inactive: { variant: "secondary", label: "Inactive" },
        busy: { variant: "destructive", label: "Busy" },
      } as const;
      
      return (
        <Card 
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => onClick?.(agent)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={agent.user.avatar} />
                  <AvatarFallback>
                    {agent.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                  <CardDescription>{agent.role}</CardDescription>
                </div>
              </div>
              <Badge variant={statusConfig[agent.status].variant}>
                {statusConfig[agent.status].label}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {agent.backstory}
              </p>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{agent.provider.name} ({agent.provider.type})</span>
                <span>
                  {formatDistanceToNow(new Date(agent.createdAt), { addSuffix: true })}
                </span>
              </div>
              
              <div className="text-xs">
                <span className="font-medium">Goal:</span> {agent.goal}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    ```
    
  - STYLING:
    • Responsive card layout
    • Consistent spacing and typography
    • Hover effects for interactivity
    • Badge colors for status indication
    • Line clamping for long text

CREATE src/renderer/components/agent-list-skeleton.tsx:
  - IMPLEMENT: Loading skeleton
    • Match agent card structure
    • Use Skeleton component
    • Show 3-6 skeleton cards
    
  - STRUCTURE:
    ```tsx
    export function AgentListSkeleton() {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-4 w-32 mt-1" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }
    ```

CREATE src/renderer/components/empty-agent-state.tsx:
  - IMPLEMENT: Empty state component
    • Clear message when no agents
    • Call-to-action to create first agent
    • Optional illustration or icon
    
  - STRUCTURE:
    ```tsx
    export function EmptyAgentState() {
      return (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Bot className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No agents yet</h3>
          <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
            Create your first AI agent to start collaborating with virtual team members.
          </p>
          <Button asChild>
            <Link to="/agents/new">Create Agent</Link>
          </Button>
        </div>
      );
    }
    ```
```

### Phase 4: Agent List Component
```
CREATE src/renderer/components/agent-list.tsx:
  - IMPLEMENT: Main list component
    • Import all sub-components
    • Handle loading, error, and empty states
    • Grid layout for responsive design
    
  - COMPONENT:
    ```tsx
    export function AgentList() {
      const { agents, isLoading, error, loadAgents } = useAgentStore();
      
      useEffect(() => {
        loadAgents();
      }, [loadAgents]);
      
      if (isLoading) {
        return <AgentListSkeleton />;
      }
      
      if (error) {
        return (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading agents</AlertTitle>
            <AlertDescription>
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2"
                onClick={() => loadAgents()}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        );
      }
      
      if (agents.length === 0) {
        return <EmptyAgentState />;
      }
      
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard 
              key={agent.id} 
              agent={agent}
              onClick={(agent) => {
                // Navigate to agent detail page (future enhancement)
                console.log("Selected agent:", agent.name);
              }}
            />
          ))}
        </div>
      );
    }
    ```
    
  - FEATURES:
    • Automatic loading on mount
    • Error handling with retry
    • Responsive grid layout
    • Agent selection handling
```

### Phase 5: Page Implementation
```
CREATE src/renderer/app/agents/index.tsx:
  - IMPLEMENT: Main agents page
    • Page layout with header
    • Navigation to create new agent
    • Agent list component
    
  - PAGE_STRUCTURE:
    ```tsx
    export default function AgentsPage() {
      const { agents } = useAgentStore();
      
      return (
        <div className="container max-w-6xl py-8">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">AI Agents</h1>
                <p className="text-muted-foreground">
                  Manage your virtual team members
                </p>
              </div>
              
              <Button asChild>
                <Link to="/agents/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Agent
                </Link>
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {agents.length} agent{agents.length !== 1 ? 's' : ''} total
              </div>
              
              {/* Future: Add filter/search controls */}
            </div>
            
            <AgentList />
          </div>
        </div>
      );
    }
    ```

UPDATE TanStack Router configuration:
  - ADD: Route for /agents
  - ENSURE: Proper navigation structure
  - LINK: From main navigation menu
```

### Phase 6: Integration and Updates
```
UPDATE src/renderer/store/agent-store.ts:
  - MODIFY: createAgent action
    • After successful creation, refresh agents list
    • Update local state optimistically
    
  - ACTION_UPDATE:
    ```typescript
    createAgent: async (input: CreateAgentInput) => {
      set({ isCreating: true, error: null });
      try {
        const result = await window.api.agents.create(input);
        if (result.success) {
          // Refresh list to get updated data with provider info
          await get().loadAgents();
          set({ isCreating: false });
          return result.data;
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : "Failed to create agent",
          isCreating: false 
        });
        throw error;
      }
    }
    ```

ADD navigation menu entry:
  - UPDATE: Main navigation component
  - ADD: Link to /agents page
  - ICON: Bot or Users icon for agents
```

## Validation Checkpoints

### Checkpoint 1: Backend Data
```
VALIDATE_BACKEND:
  - TEST: AgentService.findByOwnerWithProvider returns joined data
  - VERIFY: Provider and user information included
  - CHECK: Sorting by creation date works
  - CONFIRM: Only user's agents returned
```

### Checkpoint 2: Frontend Store
```
VALIDATE_STORE:
  - TEST: loadAgents updates state with enriched data
  - VERIFY: Loading states work correctly
  - CHECK: Error handling displays messages
  - CONFIRM: List updates after agent creation
```

### Checkpoint 3: UI Components
```
VALIDATE_UI:
  - VIEW: Agent cards display correctly
  - CHECK: Status badges show appropriate colors
  - TEST: Loading skeleton appears during fetch
  - VERIFY: Empty state shows when no agents
  - CONFIRM: Responsive layout works on different screens
```

### Checkpoint 4: Full Integration
```
VALIDATE_INTEGRATION:
  - NAVIGATE: To /agents page
  - CREATE: New agent via form
  - VERIFY: List updates to show new agent
  - CHECK: All agent information displays correctly
  - TEST: Error recovery with retry button
```

## Use Cases & Examples

### Example Data/Output
```typescript
// Example agent list data from backend
const exampleAgentList: AgentWithProvider[] = [
  {
    id: "agent-1",
    name: "Alex Frontend",
    role: "Frontend Developer", 
    backstory: "Expert React developer with TypeScript skills",
    goal: "Build beautiful user interfaces",
    status: "active",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    provider: {
      id: "provider-1",
      name: "My OpenAI",
      type: "openai",
    },
    user: {
      id: "user-agent-1",
      name: "Alex Frontend",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
    },
  },
  {
    id: "agent-2", 
    name: "Sam Backend",
    role: "Backend Developer",
    backstory: "Experienced with Node.js and database design",
    goal: "Create robust APIs and data systems",
    status: "inactive",
    createdAt: new Date("2024-01-14"),
    updatedAt: new Date("2024-01-14"),
    provider: {
      id: "provider-2",
      name: "DeepSeek Pro",
      type: "deepseek",
    },
    user: {
      id: "user-agent-2",
      name: "Sam Backend",
      avatar: null,
    },
  },
];
```

### Common Scenarios
1. **First Visit**: User sees their created agents after initial setup
2. **Agent Management**: User reviews agent status and configuration
3. **Quick Overview**: User checks which agents are active/busy
4. **Provider Tracking**: User sees which LLM provider each agent uses

### Edge Cases & Error Scenarios
- **No Agents**: Show helpful empty state with creation prompt
- **Loading Failure**: Display error with retry mechanism
- **Large Agent List**: Grid layout handles many agents gracefully
- **Provider Issues**: Show agent cards even if provider data missing

## Troubleshooting Guide

### Common Issues

#### Backend Query Issues
```
PROBLEM: Agents list returns empty despite existing agents
SOLUTION:
  - Check JOIN conditions in query
  - Verify ownerId filtering is correct
  - Ensure foreign key relationships exist
  - Test query in database directly

PROBLEM: Provider information missing from results
SOLUTION:
  - Check INNER JOIN vs LEFT JOIN usage
  - Verify all agents have valid providerId
  - Ensure llmProvidersTable is properly joined
```

#### Frontend State Issues
```
PROBLEM: List doesn't update after creating agent
SOLUTION:
  - Verify createAgent calls loadAgents after success
  - Check useEffect dependency array in components
  - Ensure store state updates trigger re-renders
  - Test store actions in isolation

PROBLEM: Loading state stuck or incorrect
SOLUTION:
  - Check all async action paths set loading to false
  - Verify error handling doesn't prevent state updates
  - Test with slow network to see loading behavior
```

#### UI Display Issues
```
PROBLEM: Agent cards layout is broken
SOLUTION:
  - Check CSS Grid classes and responsive breakpoints
  - Verify Tailwind CSS is loaded properly
  - Test with different screen sizes
  - Check for conflicting CSS styles

PROBLEM: Status badges wrong color or missing
SOLUTION:
  - Verify status mapping object includes all statuses
  - Check Badge component variant props
  - Ensure agent.status has valid values
  - Test with different agent statuses
```

### Debug Commands
```bash
# Test backend query
npm run dev
# Console: window.api.agents.list()

# Check store state
# Console: useAgentStore.getState()

# Test individual components
# Temporarily hardcode agent data

# Database verification
npm run db:studio
# Check agents and relationships
```

## Dependencies & Prerequisites

### Required Files/Components
- [x] Agent creation system (TASK-003)
- [x] Agent service with findByOwner method
- [x] IPC handlers for agent listing
- [x] Shadcn/ui Card, Badge, Avatar, Skeleton components
- [x] TanStack Router setup
- [x] Zustand store configuration

### Required Patterns/Conventions
- [x] Database query patterns with JOINs
- [x] Component patterns for lists and cards
- [x] Loading and error state handling
- [x] Responsive grid layouts
- [x] Navigation and routing

### Environment Setup
- [x] Development server ready
- [x] Database with agents and providers
- [x] At least one test agent created
- [x] Frontend routing configured

---

## Task Completion Checklist

- [ ] Backend service returns agents with provider information
- [ ] Frontend store loads and manages agent state
- [ ] Agent cards display correctly with all information
- [ ] Status badges show appropriate colors and states
- [ ] Loading skeleton appears during data fetch
- [ ] Empty state appears when no agents exist
- [ ] Error states are handled with retry options
- [ ] List updates when new agents are created
- [ ] Responsive layout works on all screen sizes
- [ ] No TypeScript or linting errors

**Final Validation**: Run `npm run quality:check` and ensure all automated checks pass.

**Delivers**: After completing this task, users can view all their AI agents in a clean, organized list interface that shows key information and updates in real-time when new agents are created.