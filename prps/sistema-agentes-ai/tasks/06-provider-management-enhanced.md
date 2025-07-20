# Universal Task Template - Pattern-Based Implementation Guide

> Auto-contained tasks with complete context and patterns for LLM implementation across any project/repository

## Meta Information

```yaml
id: TASK-006
title: Provider Management - Enhanced Implementation
description: Add provider editing, testing, validation, and advanced management features
source_document: prps/sistema-agentes-ai/README.md
priority: medium
estimated_effort: 3 hours
dependencies: [TASK-001, TASK-002, TASK-005]
tech_stack: [Electron, React, TypeScript, SQLite, Drizzle ORM, AI SDK]
domain_context: Agent System - LLM Provider Management
project_type: desktop
feature_level: enhanced
delivers_value: User can fully manage LLM providers with validation, testing, and editing
```

## Primary Goal

**Enhance LLM provider management with editing capabilities, API key testing, validation, and production-ready UX**

### Success Criteria
- [ ] User can edit existing provider configurations
- [ ] API keys can be tested before saving
- [ ] Form validates provider settings and connectivity
- [ ] Default provider can be set and switched
- [ ] Inactive providers can be toggled active/inactive
- [ ] Provider deletion with safety checks
- [ ] Export/import provider configurations (optional)

## Complete Context

### Project Architecture Context
```
project-wiz/
├── src/
│   ├── main/                    # Backend (Electron main process)
│   │   ├── agents/              # Agent bounded context
│   │   │   └── llm-providers/   # Enhanced provider management
│   │   │       ├── llm-providers.schema.ts # From TASK-001
│   │   │       ├── llm-provider.service.ts # Enhanced with update/delete
│   │   │       ├── llm-provider.handlers.ts # New update/test handlers
│   │   │       └── llm-provider.types.ts # Enhanced validation types
│   │   └── main.ts              # Handler registration
│   └── renderer/                # Frontend (React)
│       ├── app/                 # Enhanced provider pages
│       │   └── settings/
│       │       └── llm-providers/
│       │           ├── index.tsx # List with management actions
│       │           ├── [id]/    # NEW - Provider detail/edit pages
│       │           │   ├── edit.tsx
│       │           │   └── index.tsx
│       │           └── new.tsx  # From TASK-001
│       ├── components/          # Enhanced provider components
│       └── store/               # Enhanced provider store
```

### Technology-Specific Context
```yaml
validation_enhancements:
  - API connectivity testing using AI SDK test calls
  - Provider configuration validation
  - Real-time form feedback
  - Network error handling
  
backend_enhancements:
  - Update provider service methods
  - Test API connectivity service
  - Provider usage tracking
  - Safe deletion with dependency checks
  
frontend_enhancements:
  - Advanced form states (editing, testing, saving)
  - Confirmation dialogs for destructive actions
  - Provider status management interface
  - Bulk operations and filters
```

### Existing Code Patterns
```typescript
// Pattern 1: Service Update Methods
// Follow existing patterns with optimistic updates
export class LlmProviderService {
  static async update(id: string, updates: UpdateProviderInput): Promise<SelectLlmProvider> {
    const db = getDatabase();
    
    // Handle API key encryption if updated
    const data = { ...updates };
    if (updates.apiKey) {
      data.apiKey = await this.encryptApiKey(updates.apiKey);
    }
    
    const [updated] = await db
      .update(llmProvidersTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(llmProvidersTable.id, id))
      .returning();
      
    if (!updated) throw new Error("Provider not found");
    return updated;
  }
}

// Pattern 2: API Testing Pattern
// Test provider connectivity without storing
export class ProviderTestService {
  static async testConnection(config: ProviderTestConfig): Promise<TestResult> {
    try {
      const model = this.createModelFromConfig(config);
      const result = await generateText({
        model,
        prompt: "Test connection",
        maxTokens: 10,
      });
      
      return { success: true, response: result.text };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Pattern 3: Enhanced Form Validation
// Multi-step validation with async testing
const providerFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["openai", "deepseek", "anthropic"]),
  apiKey: z.string().min(1, "API key is required"),
  baseUrl: z.string().url().optional().or(z.literal("")),
}).refine(async (data) => {
  // Async validation with connectivity test
  const testResult = await testProviderConnection(data);
  return testResult.success;
}, {
  message: "API key or configuration is invalid",
  path: ["apiKey"],
});
```

### Project-Specific Conventions
```yaml
update_patterns:
  - Optimistic updates with rollback on failure
  - Confirmation dialogs for destructive actions
  - Form state management with proper validation
  - Loading states for async operations

provider_management:
  - Test connectivity before saving changes
  - Validate configuration changes
  - Handle default provider switching
  - Safe deletion with dependency checking

ui_enhancements:
  - Inline editing capabilities
  - Quick actions (test, toggle, delete)
  - Status indicators and badges
  - Confirmation modals with clear messaging
```

### Validation Commands
```bash
npm run type-check       # TypeScript validation
npm run lint             # ESLint checks
npm run quality:check    # All quality checks
npm run test             # Unit tests for services
```

## Implementation Steps

### Phase 1: Enhanced Backend Services
```
UPDATE src/main/agents/llm-providers/llm-provider.service.ts:
  - ADD: Enhanced CRUD operations
    ```typescript
    export class LlmProviderService {
      // ... existing methods from TASK-001
      
      static async update(
        id: string, 
        updates: UpdateProviderInput,
        userId: string
      ): Promise<SelectLlmProvider> {
        const db = getDatabase();
        
        // Verify ownership
        const existing = await this.findById(id);
        if (!existing || existing.userId !== userId) {
          throw new Error("Provider not found or access denied");
        }
        
        // Handle API key encryption if provided
        const data = { ...updates };
        if (updates.apiKey && updates.apiKey !== "••••••••") {
          data.apiKey = await this.encryptApiKey(updates.apiKey);
        } else {
          delete data.apiKey; // Don't update if masked
        }
        
        // If setting as default, unset other defaults
        if (updates.isDefault) {
          await db
            .update(llmProvidersTable)
            .set({ isDefault: false })
            .where(eq(llmProvidersTable.userId, userId));
        }
        
        const [updated] = await db
          .update(llmProvidersTable)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(llmProvidersTable.id, id))
          .returning();
          
        return updated;
      }
      
      static async delete(id: string, userId: string): Promise<void> {
        const db = getDatabase();
        
        // Check if provider is in use by agents
        const agentsUsingProvider = await db
          .select({ count: sql<number>`count(*)` })
          .from(agentsTable)
          .where(eq(agentsTable.providerId, id));
          
        if (agentsUsingProvider[0].count > 0) {
          throw new Error(
            `Cannot delete provider. ${agentsUsingProvider[0].count} agent(s) are using it.`
          );
        }
        
        // Verify ownership and delete
        const result = await db
          .delete(llmProvidersTable)
          .where(
            and(
              eq(llmProvidersTable.id, id),
              eq(llmProvidersTable.userId, userId)
            )
          )
          .returning();
          
        if (result.length === 0) {
          throw new Error("Provider not found or access denied");
        }
      }
      
      static async toggleActive(
        id: string, 
        userId: string
      ): Promise<SelectLlmProvider> {
        const db = getDatabase();
        
        const [current] = await db
          .select()
          .from(llmProvidersTable)
          .where(
            and(
              eq(llmProvidersTable.id, id),
              eq(llmProvidersTable.userId, userId)
            )
          )
          .limit(1);
          
        if (!current) throw new Error("Provider not found");
        
        const [updated] = await db
          .update(llmProvidersTable)
          .set({ 
            isActive: !current.isActive,
            updatedAt: new Date() 
          })
          .where(eq(llmProvidersTable.id, id))
          .returning();
          
        return updated;
      }
      
      static async setDefault(
        id: string, 
        userId: string
      ): Promise<SelectLlmProvider> {
        const db = getDatabase();
        
        return await db.transaction(async (tx) => {
          // Unset all defaults for user
          await tx
            .update(llmProvidersTable)
            .set({ isDefault: false })
            .where(eq(llmProvidersTable.userId, userId));
          
          // Set new default
          const [updated] = await tx
            .update(llmProvidersTable)
            .set({ isDefault: true, updatedAt: new Date() })
            .where(
              and(
                eq(llmProvidersTable.id, id),
                eq(llmProvidersTable.userId, userId)
              )
            )
            .returning();
            
          if (!updated) throw new Error("Provider not found");
          return updated;
        });
      }
      
      static async findById(id: string): Promise<SelectLlmProvider | null> {
        const db = getDatabase();
        
        const [provider] = await db
          .select()
          .from(llmProvidersTable)
          .where(eq(llmProvidersTable.id, id))
          .limit(1);
          
        return provider || null;
      }
    }
    ```

CREATE src/main/agents/llm-providers/provider-test.service.ts:
  - IMPLEMENT: Provider connectivity testing
    ```typescript
    export interface ProviderTestConfig {
      type: ProviderType;
      apiKey: string;
      baseUrl?: string;
      model?: string;
    }
    
    export interface TestResult {
      success: boolean;
      response?: string;
      error?: string;
      latency?: number;
    }
    
    export class ProviderTestService {
      static async testConnection(config: ProviderTestConfig): Promise<TestResult> {
        const startTime = Date.now();
        
        try {
          const model = this.createModelFromConfig(config);
          
          const result = await generateText({
            model,
            prompt: "Reply with 'OK' to confirm connection",
            maxTokens: 10,
            temperature: 0,
          });
          
          const latency = Date.now() - startTime;
          
          return {
            success: true,
            response: result.text.trim(),
            latency,
          };
        } catch (error) {
          const latency = Date.now() - startTime;
          
          let errorMessage = "Connection failed";
          if (error.name === 'AI_APICallError') {
            if (error.statusCode === 401) {
              errorMessage = "Invalid API key";
            } else if (error.statusCode === 429) {
              errorMessage = "Rate limit exceeded";
            } else if (error.statusCode === 404) {
              errorMessage = "Model or endpoint not found";
            } else {
              errorMessage = `API Error: ${error.message}`;
            }
          } else if (error.code === 'ENOTFOUND') {
            errorMessage = "Invalid base URL or network error";
          }
          
          return {
            success: false,
            error: errorMessage,
            latency,
          };
        }
      }
      
      private static createModelFromConfig(config: ProviderTestConfig) {
        const modelName = config.model || this.getDefaultModel(config.type);
        
        switch (config.type) {
          case 'openai':
            return openai(modelName, {
              apiKey: config.apiKey,
              baseURL: config.baseUrl,
            });
          case 'deepseek':
            return deepseek(modelName, {
              apiKey: config.apiKey,
              baseURL: config.baseUrl,
            });
          default:
            throw new Error(`Unsupported provider type: ${config.type}`);
        }
      }
      
      private static getDefaultModel(type: ProviderType): string {
        const defaults = {
          openai: 'gpt-4o-mini',
          deepseek: 'deepseek-chat',
          anthropic: 'claude-3-haiku-20240307',
        };
        return defaults[type];
      }
    }
    ```

UPDATE src/main/agents/llm-providers/llm-provider.types.ts:
  - ADD: Enhanced types for update operations
    ```typescript
    export interface UpdateProviderInput {
      name?: string;
      apiKey?: string;
      baseUrl?: string;
      isDefault?: boolean;
      isActive?: boolean;
    }
    
    export interface ProviderWithUsage extends SelectLlmProvider {
      agentCount: number;
      lastUsed?: Date;
    }
    
    export const updateProviderSchema = z.object({
      name: z.string().min(1, "Name is required").optional(),
      apiKey: z.string().min(1, "API key is required").optional(),
      baseUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
      isDefault: z.boolean().optional(),
      isActive: z.boolean().optional(),
    });
    ```
```

### Phase 2: Enhanced IPC Handlers
```
UPDATE src/main/agents/llm-providers/llm-provider.handlers.ts:
  - ADD: Enhanced provider management handlers
    ```typescript
    export function setupLlmProviderHandlers(): void {
      // ... existing handlers from TASK-001
      
      ipcMain.handle(
        "llm-providers:update",
        async (_, id: string, updates: UpdateProviderInput): Promise<IpcResponse> => {
          try {
            const userId = getCurrentUserId();
            const provider = await LlmProviderService.update(id, updates, userId);
            return { success: true, data: provider };
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : "Failed to update provider",
            };
          }
        }
      );
      
      ipcMain.handle(
        "llm-providers:delete",
        async (_, id: string): Promise<IpcResponse> => {
          try {
            const userId = getCurrentUserId();
            await LlmProviderService.delete(id, userId);
            return { success: true, data: null };
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : "Failed to delete provider",
            };
          }
        }
      );
      
      ipcMain.handle(
        "llm-providers:test",
        async (_, config: ProviderTestConfig): Promise<IpcResponse> => {
          try {
            const result = await ProviderTestService.testConnection(config);
            return { success: true, data: result };
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : "Test failed",
            };
          }
        }
      );
      
      ipcMain.handle(
        "llm-providers:toggle-active",
        async (_, id: string): Promise<IpcResponse> => {
          try {
            const userId = getCurrentUserId();
            const provider = await LlmProviderService.toggleActive(id, userId);
            return { success: true, data: provider };
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : "Failed to toggle provider",
            };
          }
        }
      );
      
      ipcMain.handle(
        "llm-providers:set-default",
        async (_, id: string): Promise<IpcResponse> => {
          try {
            const userId = getCurrentUserId();
            const provider = await LlmProviderService.setDefault(id, userId);
            return { success: true, data: provider };
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : "Failed to set default",
            };
          }
        }
      );
      
      ipcMain.handle(
        "llm-providers:get",
        async (_, id: string): Promise<IpcResponse> => {
          try {
            const provider = await LlmProviderService.findById(id);
            return { success: true, data: provider };
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : "Provider not found",
            };
          }
        }
      );
    }
    ```
```

### Phase 3: Enhanced Frontend Store
```
UPDATE src/renderer/store/llm-provider-store.ts:
  - ENHANCE: Store with full CRUD operations
    ```typescript
    interface LlmProviderState {
      providers: SelectLlmProvider[];
      currentProvider: SelectLlmProvider | null;
      isLoading: boolean;
      isTesting: boolean;
      isUpdating: boolean;
      error: string | null;
      testResult: TestResult | null;
      
      // Actions
      createProvider: (input: CreateProviderInput) => Promise<SelectLlmProvider>;
      updateProvider: (id: string, updates: UpdateProviderInput) => Promise<SelectLlmProvider>;
      deleteProvider: (id: string) => Promise<void>;
      testProvider: (config: ProviderTestConfig) => Promise<TestResult>;
      toggleActive: (id: string) => Promise<void>;
      setDefault: (id: string) => Promise<void>;
      loadProvider: (id: string) => Promise<void>;
      loadProviders: (userId: string) => Promise<void>;
      clearTestResult: () => void;
    }
    
    export const useLlmProviderStore = create<LlmProviderState>((set, get) => ({
      providers: [],
      currentProvider: null,
      isLoading: false,
      isTesting: false,
      isUpdating: false,
      error: null,
      testResult: null,
      
      updateProvider: async (id: string, updates: UpdateProviderInput) => {
        set({ isUpdating: true, error: null });
        try {
          const result = await window.api.llmProviders.update(id, updates);
          if (result.success) {
            set(state => ({
              providers: state.providers.map(p => 
                p.id === id ? result.data : p
              ),
              currentProvider: state.currentProvider?.id === id 
                ? result.data 
                : state.currentProvider,
              isUpdating: false,
            }));
            return result.data;
          } else {
            throw new Error(result.error);
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Update failed",
            isUpdating: false 
          });
          throw error;
        }
      },
      
      deleteProvider: async (id: string) => {
        set({ error: null });
        try {
          const result = await window.api.llmProviders.delete(id);
          if (result.success) {
            set(state => ({
              providers: state.providers.filter(p => p.id !== id),
              currentProvider: state.currentProvider?.id === id 
                ? null 
                : state.currentProvider,
            }));
          } else {
            throw new Error(result.error);
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : "Delete failed" });
          throw error;
        }
      },
      
      testProvider: async (config: ProviderTestConfig) => {
        set({ isTesting: true, testResult: null, error: null });
        try {
          const result = await window.api.llmProviders.test(config);
          if (result.success) {
            set({ testResult: result.data, isTesting: false });
            return result.data;
          } else {
            throw new Error(result.error);
          }
        } catch (error) {
          const errorResult = {
            success: false,
            error: error instanceof Error ? error.message : "Test failed",
          };
          set({ 
            testResult: errorResult,
            error: errorResult.error,
            isTesting: false 
          });
          return errorResult;
        }
      },
      
      toggleActive: async (id: string) => {
        try {
          const result = await window.api.llmProviders.toggleActive(id);
          if (result.success) {
            set(state => ({
              providers: state.providers.map(p => 
                p.id === id ? result.data : p
              ),
            }));
          } else {
            throw new Error(result.error);
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : "Toggle failed" });
          throw error;
        }
      },
      
      setDefault: async (id: string) => {
        try {
          const result = await window.api.llmProviders.setDefault(id);
          if (result.success) {
            set(state => ({
              providers: state.providers.map(p => ({
                ...p,
                isDefault: p.id === id,
              })),
            }));
          } else {
            throw new Error(result.error);
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : "Set default failed" });
          throw error;
        }
      },
      
      loadProvider: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = await window.api.llmProviders.get(id);
          if (result.success) {
            set({ currentProvider: result.data, isLoading: false });
          } else {
            throw new Error(result.error);
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Load failed",
            isLoading: false 
          });
        }
      },
      
      clearTestResult: () => set({ testResult: null, error: null }),
      
      // ... other existing methods
    }));
    ```

UPDATE src/renderer/preload.ts:
  - ADD: Enhanced API methods
    ```typescript
    llmProviders: {
      create: (input) => ipcRenderer.invoke("llm-providers:create", input),
      list: (userId) => ipcRenderer.invoke("llm-providers:list", userId),
      get: (id) => ipcRenderer.invoke("llm-providers:get", id),
      update: (id, updates) => ipcRenderer.invoke("llm-providers:update", id, updates),
      delete: (id) => ipcRenderer.invoke("llm-providers:delete", id),
      test: (config) => ipcRenderer.invoke("llm-providers:test", config),
      toggleActive: (id) => ipcRenderer.invoke("llm-providers:toggle-active", id),
      setDefault: (id) => ipcRenderer.invoke("llm-providers:set-default", id),
    }
    ```
```

### Phase 4: Enhanced Provider Components
```
UPDATE src/renderer/components/llm-provider-card.tsx:
  - ENHANCE: Add management actions to provider cards
    ```tsx
    interface LlmProviderCardProps {
      provider: SelectLlmProvider;
      onEdit?: (provider: SelectLlmProvider) => void;
      onDelete?: (provider: SelectLlmProvider) => void;
      onTest?: (provider: SelectLlmProvider) => void;
    }
    
    export function LlmProviderCard({ 
      provider, 
      onEdit, 
      onDelete, 
      onTest 
    }: LlmProviderCardProps) {
      const { toggleActive, setDefault } = useLlmProviderStore();
      
      return (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {provider.name}
                    {provider.isDefault && (
                      <Badge variant="secondary" className="text-xs">
                        Default
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    <Badge variant={provider.isActive ? "default" : "secondary"}>
                      {provider.type}
                    </Badge>
                  </CardDescription>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit?.(provider)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => onTest?.(provider)}>
                    <TestTube className="mr-2 h-4 w-4" />
                    Test Connection
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  {!provider.isDefault && (
                    <DropdownMenuItem onClick={() => setDefault(provider.id)}>
                      <Star className="mr-2 h-4 w-4" />
                      Set as Default
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem onClick={() => toggleActive(provider.id)}>
                    <Power className="mr-2 h-4 w-4" />
                    {provider.isActive ? "Deactivate" : "Activate"}
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(provider)}
                    className="text-destructive"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">API Key:</span>
                <span>••••••••</span>
              </div>
              
              {provider.baseUrl && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Custom URL:</span>
                  <span className="truncate max-w-32">{provider.baseUrl}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge 
                  variant={provider.isActive ? "default" : "secondary"}
                  className="text-xs"
                >
                  {provider.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    ```

CREATE src/renderer/components/provider-edit-dialog.tsx:
  - IMPLEMENT: Provider editing dialog
    ```tsx
    interface ProviderEditDialogProps {
      provider: SelectLlmProvider | null;
      open: boolean;
      onOpenChange: (open: boolean) => void;
    }
    
    export function ProviderEditDialog({ 
      provider, 
      open, 
      onOpenChange 
    }: ProviderEditDialogProps) {
      const { updateProvider, testProvider, isTesting, testResult } = useLlmProviderStore();
      
      const form = useForm<UpdateProviderInput>({
        resolver: zodResolver(updateProviderSchema),
        defaultValues: {
          name: provider?.name || "",
          apiKey: "••••••••", // Masked by default
          baseUrl: provider?.baseUrl || "",
          isDefault: provider?.isDefault || false,
          isActive: provider?.isActive || true,
        },
      });
      
      useEffect(() => {
        if (provider) {
          form.reset({
            name: provider.name,
            apiKey: "••••••••",
            baseUrl: provider.baseUrl || "",
            isDefault: provider.isDefault,
            isActive: provider.isActive,
          });
        }
      }, [provider, form]);
      
      const onSubmit = async (data: UpdateProviderInput) => {
        if (!provider) return;
        
        try {
          // Remove masked API key if not changed
          const updates = { ...data };
          if (updates.apiKey === "••••••••") {
            delete updates.apiKey;
          }
          
          await updateProvider(provider.id, updates);
          onOpenChange(false);
          toast.success("Provider updated successfully");
        } catch (error) {
          toast.error("Failed to update provider");
        }
      };
      
      const handleTest = async () => {
        if (!provider) return;
        
        const formData = form.getValues();
        const config: ProviderTestConfig = {
          type: provider.type as ProviderType,
          apiKey: formData.apiKey === "••••••••" 
            ? provider.apiKey 
            : formData.apiKey || "",
          baseUrl: formData.baseUrl,
        };
        
        await testProvider(config);
      };
      
      return (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Provider</DialogTitle>
              <DialogDescription>
                Update your LLM provider configuration
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="My OpenAI Provider" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input 
                            {...field} 
                            type="password"
                            placeholder="Enter new API key to change"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleTest}
                            disabled={isTesting}
                          >
                            {isTesting ? "Testing..." : "Test"}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {testResult && (
                  <Alert variant={testResult.success ? "default" : "destructive"}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>
                      {testResult.success ? "Connection Successful" : "Connection Failed"}
                    </AlertTitle>
                    <AlertDescription>
                      {testResult.success 
                        ? `Response: ${testResult.response} (${testResult.latency}ms)`
                        : testResult.error
                      }
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* ... other form fields ... */}
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Update Provider
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      );
    }
    ```

CREATE src/renderer/components/provider-delete-dialog.tsx:
  - IMPLEMENT: Safe deletion confirmation
    ```tsx
    interface ProviderDeleteDialogProps {
      provider: SelectLlmProvider | null;
      open: boolean;
      onOpenChange: (open: boolean) => void;
    }
    
    export function ProviderDeleteDialog({ 
      provider, 
      open, 
      onOpenChange 
    }: ProviderDeleteDialogProps) {
      const { deleteProvider } = useLlmProviderStore();
      const [isDeleting, setIsDeleting] = useState(false);
      
      const handleDelete = async () => {
        if (!provider) return;
        
        setIsDeleting(true);
        try {
          await deleteProvider(provider.id);
          onOpenChange(false);
          toast.success("Provider deleted successfully");
        } catch (error) {
          toast.error(error.message || "Failed to delete provider");
        } finally {
          setIsDeleting(false);
        }
      };
      
      return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Provider</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{provider?.name}"? 
                This action cannot be undone.
                {provider?.isDefault && (
                  <div className="mt-2 p-2 bg-yellow-100 rounded text-yellow-800">
                    This is your default provider. You'll need to set a new default.
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    }
    ```
```

### Phase 5: Enhanced Provider Management Page
```
UPDATE src/renderer/app/settings/llm-providers.tsx:
  - ENHANCE: Add management capabilities
    ```tsx
    export default function LlmProvidersPage() {
      const { providers, error } = useLlmProviderStore();
      const [editingProvider, setEditingProvider] = useState<SelectLlmProvider | null>(null);
      const [deletingProvider, setDeletingProvider] = useState<SelectLlmProvider | null>(null);
      const [testingProvider, setTestingProvider] = useState<SelectLlmProvider | null>(null);
      
      return (
        <div className="container max-w-6xl py-8">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">LLM Providers</h1>
                <p className="text-muted-foreground">
                  Manage your AI model providers and configurations
                </p>
              </div>
              
              <Button asChild>
                <Link to="/settings/llm-providers/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Provider
                </Link>
              </Button>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {providers.map((provider) => (
                <LlmProviderCard
                  key={provider.id}
                  provider={provider}
                  onEdit={setEditingProvider}
                  onDelete={setDeletingProvider}
                  onTest={setTestingProvider}
                />
              ))}
            </div>
            
            {providers.length === 0 && (
              <EmptyProviderState />
            )}
          </div>
          
          {/* Edit Dialog */}
          <ProviderEditDialog
            provider={editingProvider}
            open={!!editingProvider}
            onOpenChange={(open) => !open && setEditingProvider(null)}
          />
          
          {/* Delete Dialog */}
          <ProviderDeleteDialog
            provider={deletingProvider}
            open={!!deletingProvider}
            onOpenChange={(open) => !open && setDeletingProvider(null)}
          />
          
          {/* Test Dialog */}
          <ProviderTestDialog
            provider={testingProvider}
            open={!!testingProvider}
            onOpenChange={(open) => !open && setTestingProvider(null)}
          />
        </div>
      );
    }
    ```
```

## Validation Checkpoints

### Checkpoint 1: Backend Services
```
VALIDATE_BACKEND:
  - TEST: Provider update with encrypted API key
  - VERIFY: Safe deletion with dependency checking
  - CHECK: Default provider switching works
  - CONFIRM: API connectivity testing functions
```

### Checkpoint 2: Frontend Integration
```
VALIDATE_FRONTEND:
  - TEST: Edit provider through dialog
  - VERIFY: Test connection shows results
  - CHECK: Delete confirmation prevents accidents
  - CONFIRM: Provider status toggles work
```

### Checkpoint 3: User Experience
```
VALIDATE_UX:
  - EDIT: Provider without changing API key
  - TEST: Connection with invalid credentials
  - DELETE: Provider with safety confirmation
  - SWITCH: Default provider successfully
```

## Use Cases & Examples

### Enhanced Management Scenarios
1. **API Key Update**: User's OpenAI key expires, needs secure update
2. **Provider Testing**: User wants to verify new credentials work
3. **Default Switching**: User prefers DeepSeek over OpenAI for cost
4. **Safe Deletion**: User removes unused provider with confirmation

### Example Provider Configuration
```typescript
const enhancedProvider = {
  id: "provider-1",
  name: "Production OpenAI",
  type: "openai",
  apiKey: "encrypted-key",
  baseUrl: "https://api.openai.com/v1",
  isDefault: true,
  isActive: true,
  agentCount: 3, // Number of agents using this provider
  lastUsed: new Date("2024-01-15"),
};
```

## Dependencies & Prerequisites

### Required Files/Components
- [x] Basic provider system (TASK-001, TASK-002)
- [x] Agent system for dependency checking (TASK-003)
- [x] Shadcn/ui Dialog, DropdownMenu, Alert components
- [x] AI SDK for connectivity testing
- [x] Form validation with Zod

### Required Patterns/Conventions
- [x] Service layer CRUD patterns
- [x] IPC handler patterns with error handling
- [x] Form validation and submission
- [x] Confirmation dialogs for destructive actions
- [x] Loading states and error handling

---

## Task Completion Checklist

- [ ] Provider editing with masked API key handling
- [ ] API connectivity testing before saving
- [ ] Safe deletion with dependency checking
- [ ] Default provider switching functionality
- [ ] Active/inactive status toggling
- [ ] Enhanced UI with management actions
- [ ] Confirmation dialogs for safety
- [ ] Proper error handling and user feedback
- [ ] Form validation with real-time testing
- [ ] No TypeScript or linting errors

**Final Validation**: Run `npm run quality:check` and ensure all automated checks pass.

**Delivers**: After completing this task, users have a production-ready provider management system with editing, testing, validation, and safe deletion capabilities.