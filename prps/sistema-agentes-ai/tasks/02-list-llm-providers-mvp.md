# Universal Task Template - Pattern-Based Implementation Guide

> Auto-contained tasks with complete context and patterns for LLM implementation across any project/repository

## Meta Information

```yaml
id: TASK-002
title: List LLM Providers - MVP Implementation
description: Implement LLM provider listing with complete backend→frontend flow
source_document: prps/sistema-agentes-ai/README.md
priority: high
estimated_effort: 1.5 hours
dependencies: [TASK-001]
tech_stack: [Electron, React, TypeScript, SQLite, Drizzle ORM]
domain_context: Agent System - LLM Provider Management
project_type: desktop
feature_level: mvp
delivers_value: User can view all their configured LLM providers in a list
```

## Primary Goal

**Enable users to view their configured LLM providers in a list interface, showing provider details without exposing API keys**

### Success Criteria
- [ ] User can see all their LLM providers in a list
- [ ] List shows provider name, type, and status
- [ ] API keys are never exposed in the UI
- [ ] List updates when new providers are added
- [ ] Loading and empty states are handled gracefully

## Complete Context

### Project Architecture Context
```
project-wiz/
├── src/
│   ├── main/                    # Backend (Electron main process)
│   │   ├── agents/              # Agent bounded context
│   │   │   └── llm-providers/   # LLM provider subdomain
│   │   │       ├── llm-providers.schema.ts (from TASK-001)
│   │   │       ├── llm-provider.service.ts (from TASK-001)
│   │   │       ├── llm-provider.handlers.ts (from TASK-001)
│   │   │       └── llm-provider.types.ts (from TASK-001)
│   │   └── main.ts              # Handler registration
│   └── renderer/                # Frontend (React)
│       ├── app/                 # TanStack Router pages
│       ├── components/          # Shared components
│       └── store/               # Zustand state management
│           └── llm-provider-store.ts (from TASK-001)
```

### Technology-Specific Context
```yaml
database:
  type: SQLite
  orm_framework: Drizzle ORM
  query_pattern: db.select().from().where()
  
backend:
  framework: Electron (main process)
  language: TypeScript
  api_pattern: IPC handlers returning IpcResponse
  
frontend:
  framework: React 19
  state_management: Zustand with TypeScript
  ui_library: Shadcn/ui components
  styling: Tailwind CSS
  
validation:
  commands:
    - npm run type-check
    - npm run lint
    - npm run quality:check
```

### Existing Code Patterns
```typescript
// Pattern 1: Database Query with User Filtering
// From existing services - always filter by userId for multi-user support
const [result] = await db
  .select()
  .from(table)
  .where(eq(table.userId, userId))
  .limit(1);

// Pattern 2: List Components with Shadcn/ui
// Use Card components for list items, Skeleton for loading
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// Pattern 3: Zustand Store with Loading States
// From auth-store pattern - handle loading, error, and data states
interface StoreState {
  items: Item[];
  isLoading: boolean;
  error: string | null;
  // Actions
  loadItems: () => Promise<void>;
}
```

### Project-Specific Conventions
```yaml
component_structure:
  - Use functional components with TypeScript
  - Props interfaces named {Component}Props
  - Export components as default from files
  - Co-locate component-specific types
  
state_management:
  - Zustand stores handle all async operations
  - Components subscribe to store state
  - Error handling in store actions
  - Loading states for all async operations
  
ui_patterns:
  - Card-based layouts for list items
  - Consistent spacing with Tailwind classes
  - Loading skeletons match content structure
  - Empty states with clear messaging
```

### Validation Commands
```bash
npm run type-check       # TypeScript validation
npm run lint             # ESLint checks
npm run dev              # Start development server
npm run quality:check    # All quality checks
```

## Implementation Steps

### Phase 1: Backend Service Extension
```
UPDATE src/main/agents/llm-providers/llm-provider.service.ts:
  - KEEP: Existing methods from TASK-001
  - ENHANCE: findByUserId method if needed
    • Ensure it returns all providers for user
    • Sort by createdAt descending (newest first)
    • Keep API keys encrypted (never decrypt for listing)
  
  - ADD: Method to mask provider details
    • sanitizeForDisplay(provider: SelectLlmProvider): SanitizedProvider
    • Return provider without apiKey field
    • Or replace apiKey with masked value like "••••••••"
  
  - VALIDATE: npm run type-check
  - IF_FAIL: Check type definitions

The handler from TASK-001 should already support listing:
  - "llm-providers:list" handler exists
  - Returns array of providers
  - No changes needed if implemented correctly
```

### Phase 2: Frontend Store Enhancement
```
UPDATE src/renderer/store/llm-provider-store.ts:
  - ENHANCE: Existing store from TASK-001
  - ENSURE: loadProviders action exists and works:
    • Set isLoading to true at start
    • Call window.api.llmProviders.list(userId)
    • Update providers array with results
    • Set isLoading to false
    • Handle errors appropriately
  
  - ADD: Computed selector if needed:
    • activeProviders: Filter by isActive
    • defaultProvider: Find where isDefault is true
  
  - ENSURE: Store updates when new provider is created
    • After successful creation, reload the list
    • Or optimistically add to local state
```

### Phase 3: List Component Implementation
```
CREATE src/renderer/components/llm-provider-list.tsx:
  - IMPLEMENT: Provider list component
    • Import necessary Shadcn/ui components
    • Import useLlmProviderStore hook
    • Import necessary types
    
  - COMPONENT_STRUCTURE:
    export function LlmProviderList() {
      const { providers, isLoading, error, loadProviders } = useLlmProviderStore();
      
      // Load providers on mount
      useEffect(() => {
        loadProviders(currentUserId); // Get from auth context
      }, []);
      
      // Loading state
      if (isLoading) {
        return <ProviderListSkeleton />;
      }
      
      // Error state
      if (error) {
        return <Alert variant="destructive">...</Alert>;
      }
      
      // Empty state
      if (providers.length === 0) {
        return <EmptyProviderState />;
      }
      
      // List rendering
      return (
        <div className="space-y-4">
          {providers.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      );
    }

CREATE src/renderer/components/llm-provider-card.tsx:
  - IMPLEMENT: Individual provider card
    • Use Card component from Shadcn/ui
    • Display provider name prominently
    • Show provider type with Badge component
    • Indicate if default with special styling
    • Show active/inactive status
    • Never display actual API key
    
  - STRUCTURE:
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{provider.name}</CardTitle>
          <Badge variant={provider.isActive ? "default" : "secondary"}>
            {provider.type}
          </Badge>
        </div>
        <CardDescription>
          {provider.isDefault && "Default Provider"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          API Key: ••••••••
          {provider.baseUrl && <div>Custom URL configured</div>}
        </div>
      </CardContent>
    </Card>

CREATE Loading skeleton component:
  - IMPLEMENT: ProviderListSkeleton
    • Use Skeleton component
    • Match the structure of actual cards
    • Show 2-3 skeleton cards
    
CREATE Empty state component:
  - IMPLEMENT: EmptyProviderState
    • Clear message: "No LLM providers configured"
    • Suggestion to add first provider
    • Optional button to navigate to creation form
```

### Phase 4: Page Integration
```
UPDATE src/renderer/app/settings/llm-providers.tsx:
  - MODIFY: Page from TASK-001
  - ADD: Import LlmProviderList component
  - STRUCTURE:
    • Page title and description
    • LlmProviderForm (from TASK-001)
    • Divider or spacing
    • Section title "Your Providers"
    • LlmProviderList component
    
  - LAYOUT:
    export default function LlmProvidersPage() {
      return (
        <div className="container max-w-4xl py-8">
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold">LLM Providers</h1>
              <p className="text-muted-foreground">
                Configure your AI model providers
              </p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Add Provider</CardTitle>
              </CardHeader>
              <CardContent>
                <LlmProviderForm />
              </CardContent>
            </Card>
            
            <div>
              <h2 className="text-2xl font-semibold mb-4">
                Your Providers
              </h2>
              <LlmProviderList />
            </div>
          </div>
        </div>
      );
    }
```

### Phase 5: Real-time Updates
```
UPDATE src/renderer/store/llm-provider-store.ts:
  - MODIFY: createProvider action
  - AFTER: Successful creation
  - ADD: Immediate list refresh
    • Call loadProviders to get updated list
    • Or optimistically add new provider to state
    
  - ENSURE: List updates without page refresh
  - PATTERN:
    createProvider: async (input) => {
      set({ isLoading: true, error: null });
      try {
        const result = await window.api.llmProviders.create(input);
        if (result.success) {
          // Refresh the list to show new provider
          await get().loadProviders(input.userId);
          return result.data;
        }
      } catch (error) {
        set({ error: error.message });
      } finally {
        set({ isLoading: false });
      }
    }
```

## Validation Checkpoints

### Checkpoint 1: Backend Functionality
```
VALIDATE_BACKEND:
  - TEST: Service returns provider list
  - VERIFY: API keys are not exposed
  - CHECK: Sorting is correct (newest first)
  - CONFIRM: User filtering works properly
```

### Checkpoint 2: Frontend State Management
```
VALIDATE_STORE:
  - TEST: loadProviders updates state
  - VERIFY: Loading states work correctly
  - CHECK: Error handling displays messages
  - CONFIRM: List refreshes after creation
```

### Checkpoint 3: UI Components
```
VALIDATE_UI:
  - VIEW: Provider cards display correctly
  - CHECK: Loading skeletons appear
  - TEST: Empty state shows when no providers
  - VERIFY: API keys are masked/hidden
```

### Checkpoint 4: Integration
```
VALIDATE_INTEGRATION:
  - CREATE: New provider via form
  - VERIFY: List updates immediately
  - CHECK: All provider details shown correctly
  - TEST: Multiple providers display properly
```

## Use Cases & Examples

### Example Data/Input
```typescript
// Example provider list from backend
const exampleProviderList = [
  {
    id: "uuid-1",
    userId: "current-user",
    name: "Production OpenAI",
    type: "openai",
    apiKey: "encrypted-string", // Never shown in UI
    baseUrl: null,
    isDefault: true,
    isActive: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "uuid-2",
    userId: "current-user",
    name: "DeepSeek Development",
    type: "deepseek",
    apiKey: "encrypted-string",
    baseUrl: "https://api.deepseek.com",
    isDefault: false,
    isActive: true,
    createdAt: new Date("2024-01-14"),
    updatedAt: new Date("2024-01-14"),
  },
];

// How it appears in UI
// Card 1: "Production OpenAI" | OpenAI badge | "Default Provider"
// Card 2: "DeepSeek Development" | DeepSeek badge | Custom URL indicator
```

### Common Scenarios
1. **First View**: User navigates to see their providers after initial setup
2. **After Creation**: List updates to show newly added provider
3. **Multiple Providers**: User manages several providers for different models
4. **Checking Configuration**: User verifies which provider is set as default

### Edge Cases & Error Scenarios
- **No Providers**: Show helpful empty state with action prompt
- **Loading Failure**: Display error with retry option
- **Slow Loading**: Show skeleton cards during fetch
- **Many Providers**: List should scroll nicely with consistent spacing

## Troubleshooting Guide

### Common Issues

#### List Not Updating
```
PROBLEM: New provider doesn't appear after creation
SOLUTION: 
  - Check store's createProvider calls loadProviders
  - Verify userId is consistent between calls
  - Check React component re-renders on state change

PROBLEM: List shows stale data
SOLUTION:
  - Ensure useEffect dependency array is correct
  - Verify store subscription in component
  - Check if providers array is properly updated
```

#### UI Display Issues
```
PROBLEM: Cards layout is broken
SOLUTION:
  - Check Tailwind classes are applied correctly
  - Verify Card component imports from Shadcn/ui
  - Ensure proper spacing with space-y classes

PROBLEM: Loading skeleton doesn't match cards
SOLUTION:
  - Update skeleton structure to match card layout
  - Use same spacing and sizing classes
  - Test with slow network to verify appearance
```

#### State Management Issues
```
PROBLEM: Loading state stuck on true
SOLUTION:
  - Check finally block in async actions
  - Verify all code paths set isLoading to false
  - Look for errors preventing state updates

PROBLEM: Error state not clearing
SOLUTION:
  - Reset error at start of actions
  - Clear error on successful operations
  - Provide user action to dismiss errors
```

### Debug Commands
```bash
# Check store state in DevTools
npm run dev
# Console: useLlmProviderStore.getState()

# Verify IPC calls
# Console: window.api.llmProviders.list('user-id')

# Test component isolation
# Temporarily hardcode provider data in component

# Check React DevTools for re-renders
# Install React DevTools extension
```

## Dependencies & Prerequisites

### Required Files/Components
- [x] LLM provider schema and service (TASK-001)
- [x] IPC handlers for listing (TASK-001)
- [x] Provider store with basic structure (TASK-001)
- [x] Shadcn/ui Card, Badge, Skeleton components
- [x] Authentication context for userId

### Required Patterns/Conventions
- [x] Zustand store patterns established
- [x] Component structure conventions
- [x] Card-based UI patterns
- [x] Loading and error state handling

### Environment Setup
- [x] Development server running
- [x] Database with provider table
- [x] At least one provider for testing
- [x] React DevTools for debugging (optional)

---

## Task Completion Checklist

- [ ] Backend service returns sanitized provider list
- [ ] Frontend store loads and manages provider state
- [ ] List component displays providers correctly
- [ ] Loading skeleton shows during fetch
- [ ] Empty state appears when no providers
- [ ] API keys are never exposed in UI
- [ ] List updates when new provider is added
- [ ] Error states are handled gracefully
- [ ] UI is responsive and well-styled
- [ ] No TypeScript or linting errors

**Final Validation**: Run `npm run quality:check` and ensure all automated checks pass.

**Delivers**: After completing this task, users can view all their configured LLM providers in a clean list interface, with proper loading states and real-time updates when adding new providers.