# Universal Task Template - Pattern-Based Implementation Guide

> Auto-contained tasks with complete context and patterns for LLM implementation across any project/repository

## Meta Information

```yaml
id: TASK-007
title: Agent Configuration - Enhanced Implementation
description: Add advanced agent editing, model parameter tuning, and configuration management
source_document: prps/sistema-agentes-ai/README.md
priority: medium
estimated_effort: 2.5 hours
dependencies: [TASK-003, TASK-004]
tech_stack: [Electron, React, TypeScript, SQLite, Drizzle ORM]
domain_context: Agent System - Configuration Management
project_type: desktop
feature_level: enhanced
delivers_value: User can edit agents and fine-tune AI model parameters for optimal performance
```

## Primary Goal

**Enable users to edit existing agents and configure advanced AI model parameters for personalized agent behavior**

### Success Criteria
- [ ] User can edit agent name, role, backstory, and goals
- [ ] Model parameters (temperature, max tokens, etc.) can be fine-tuned
- [ ] Agent system prompt can be customized
- [ ] Configuration changes are validated before saving
- [ ] Agent status can be managed (active/inactive)
- [ ] Configuration templates for common agent types

## Complete Context

### Project Architecture Context
```
project-wiz/
├── src/
│   ├── main/                    # Backend (Electron main process)
│   │   ├── agents/              # Agent bounded context
│   │   │   ├── agents.schema.ts # From TASK-003 (add config fields)
│   │   │   ├── agent.service.ts # Enhanced with update methods
│   │   │   ├── agent.handlers.ts # New update/config handlers
│   │   │   ├── agent.types.ts   # Enhanced configuration types
│   │   │   └── agent-config.service.ts # NEW - Config validation
│   │   └── main.ts              # Handler registration
│   └── renderer/                # Frontend (React)
│       ├── app/                 # Agent management pages
│       │   └── agents/
│       │       └── [agentId]/
│       │           ├── edit.tsx # NEW - Agent editing page
│       │           └── settings.tsx # NEW - Configuration page
│       ├── components/          # Enhanced agent components
│       │   ├── agent-edit-form.tsx # NEW
│       │   └── model-config-form.tsx # NEW
│       └── store/               # Enhanced agent store
```

### Technology-Specific Context
```yaml
configuration_system:
  validation: Real-time form validation with Zod schemas
  persistence: Optimistic updates with rollback on failure
  templates: Predefined configurations for common agent types
  
model_parameters:
  temperature: 0.0-2.0 (creativity control)
  max_tokens: 100-4000 (response length)
  top_p: 0.1-1.0 (nucleus sampling)
  frequency_penalty: -2.0-2.0 (repetition reduction)
  presence_penalty: -2.0-2.0 (topic diversity)
  
agent_management:
  status_control: Active/inactive agent status
  configuration_history: Track configuration changes
  validation_rules: Ensure valid parameter ranges
  template_system: Predefined configurations
```

### Existing Code Patterns
```typescript
// Pattern 1: Agent Update Service
// Follow existing service patterns with validation
export class AgentService {
  static async update(
    id: string, 
    updates: UpdateAgentInput,
    userId: string
  ): Promise<SelectAgent> {
    const db = getDatabase();
    
    // Verify ownership
    const existing = await this.findById(id);
    if (!existing || existing.ownerId !== userId) {
      throw new Error("Agent not found or access denied");
    }
    
    // Validate configuration
    const validatedData = await AgentConfigService.validateConfig(updates);
    
    const [updated] = await db
      .update(agentsTable)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(eq(agentsTable.id, id))
      .returning();
      
    return updated;
  }
}

// Pattern 2: Model Configuration Validation
// Ensure parameter ranges are valid for each provider
export class AgentConfigService {
  static async validateConfig(config: ModelConfig): Promise<ModelConfig> {
    const schema = this.getConfigSchema(config.provider);
    return schema.parse(config);
  }
  
  private static getConfigSchema(provider: ProviderType) {
    const baseSchema = z.object({
      temperature: z.number().min(0).max(2),
      maxTokens: z.number().min(1).max(4000),
      topP: z.number().min(0.1).max(1).optional(),
    });
    
    // Provider-specific constraints
    switch (provider) {
      case 'openai':
        return baseSchema.extend({
          frequencyPenalty: z.number().min(-2).max(2).optional(),
          presencePenalty: z.number().min(-2).max(2).optional(),
        });
      case 'deepseek':
        return baseSchema; // More basic parameters
      default:
        return baseSchema;
    }
  }
}

// Pattern 3: Advanced Form Management
// Multi-step form with validation and preview
const AgentEditForm = () => {
  const form = useForm<UpdateAgentInput>({
    resolver: zodResolver(updateAgentSchema),
    mode: "onChange", // Real-time validation
  });
  
  const { mutate: updateAgent, isLoading } = useMutation({
    mutationFn: (data: UpdateAgentInput) => agentStore.updateAgent(agentId, data),
    onSuccess: () => {
      toast.success("Agent updated successfully");
      router.push(`/agents/${agentId}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
```

### Project-Specific Conventions
```yaml
configuration_patterns:
  - Real-time validation with immediate feedback
  - Optimistic updates with error rollback
  - Configuration presets and templates
  - Parameter constraints based on provider
  - Change tracking and history

form_patterns:
  - Multi-section forms with progressive disclosure
  - Parameter sliders with visual feedback
  - Real-time preview of configuration changes
  - Validation errors with helpful suggestions
  - Save/cancel with confirmation dialogs

agent_status_management:
  - Clear status indicators and controls
  - Graceful status transitions
  - Impact warnings for status changes
  - Bulk operations for multiple agents
```

### Validation Commands
```bash
npm run type-check       # TypeScript validation
npm run lint             # ESLint checks
npm run quality:check    # All quality checks
```

## Implementation Steps

### Phase 1: Enhanced Agent Schema and Types
```
UPDATE src/main/agents/agents.schema.ts:
  - ENHANCE: Add configuration fields to agentsTable
    ```typescript
    export const agentsTable = sqliteTable("agents", {
      // ... existing fields from TASK-003 ...
      
      // Enhanced configuration fields
      temperature: real("temperature").notNull().default(0.7),
      maxTokens: integer("max_tokens").notNull().default(2000),
      topP: real("top_p").default(1.0),
      frequencyPenalty: real("frequency_penalty").default(0.0),
      presencePenalty: real("presence_penalty").default(0.0),
      
      // Management fields
      isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
      configVersion: integer("config_version").notNull().default(1),
      lastConfigUpdate: integer("last_config_update", { mode: "timestamp" }),
      
      // Template and categorization
      template: text("template"), // "developer", "assistant", "reviewer", etc.
      category: text("category").default("general"),
    });
    ```

UPDATE src/main/agents/agent.types.ts:
  - ADD: Enhanced configuration types
    ```typescript
    export interface ModelConfig {
      temperature: number; // 0.0-2.0
      maxTokens: number; // 100-4000
      topP?: number; // 0.1-1.0
      frequencyPenalty?: number; // -2.0-2.0 (OpenAI only)
      presencePenalty?: number; // -2.0-2.0 (OpenAI only)
    }
    
    export interface UpdateAgentInput {
      name?: string;
      role?: string;
      backstory?: string;
      goal?: string;
      systemPrompt?: string;
      modelConfig?: ModelConfig;
      isActive?: boolean;
      template?: string;
      category?: string;
    }
    
    export interface AgentTemplate {
      id: string;
      name: string;
      description: string;
      defaultConfig: {
        role: string;
        backstory: string;
        goal: string;
        modelConfig: ModelConfig;
      };
      category: string;
    }
    
    export const updateAgentSchema = z.object({
      name: z.string().min(1, "Name is required").optional(),
      role: z.string().min(1, "Role is required").optional(),
      backstory: z.string().min(10, "Backstory too short").optional(),
      goal: z.string().min(5, "Goal too short").optional(),
      systemPrompt: z.string().optional(),
      modelConfig: z.object({
        temperature: z.number().min(0).max(2),
        maxTokens: z.number().min(100).max(4000),
        topP: z.number().min(0.1).max(1).optional(),
        frequencyPenalty: z.number().min(-2).max(2).optional(),
        presencePenalty: z.number().min(-2).max(2).optional(),
      }).optional(),
      isActive: z.boolean().optional(),
      template: z.string().optional(),
      category: z.string().optional(),
    });
    ```

GENERATE and APPLY database migration:
  - RUN: npm run db:generate
  - REVIEW: Generated SQL for new configuration fields
  - APPLY: npm run db:migrate
```

### Phase 2: Configuration Service and Templates
```
CREATE src/main/agents/agent-config.service.ts:
  - IMPLEMENT: Configuration management and templates
    ```typescript
    export class AgentConfigService {
      
      static getDefaultTemplates(): AgentTemplate[] {
        return [
          {
            id: "frontend-developer",
            name: "Frontend Developer",
            description: "React/TypeScript specialist for UI development",
            defaultConfig: {
              role: "Frontend Developer",
              backstory: "Expert in React, TypeScript, and modern CSS. Passionate about creating beautiful, accessible user interfaces with clean, maintainable code.",
              goal: "Build pixel-perfect UIs and enhance user experience",
              modelConfig: {
                temperature: 0.7,
                maxTokens: 2500,
                topP: 0.9,
                frequencyPenalty: 0.1,
                presencePenalty: 0.1,
              },
            },
            category: "development",
          },
          {
            id: "code-reviewer",
            name: "Code Reviewer",
            description: "Focuses on code quality and best practices",
            defaultConfig: {
              role: "Senior Code Reviewer",
              backstory: "Experienced developer with deep knowledge of software architecture, design patterns, and best practices. Values clean code and maintainability.",
              goal: "Ensure code quality, security, and adherence to best practices",
              modelConfig: {
                temperature: 0.4, // More focused and deterministic
                maxTokens: 3000,
                topP: 0.8,
                frequencyPenalty: 0.2,
                presencePenalty: 0.1,
              },
            },
            category: "quality",
          },
          {
            id: "project-manager",
            name: "Project Manager",
            description: "Organizes tasks and manages project workflows",
            defaultConfig: {
              role: "Project Manager",
              backstory: "Experienced in agile methodologies, task organization, and team coordination. Focuses on clear communication and efficient workflows.",
              goal: "Organize tasks, track progress, and facilitate team collaboration",
              modelConfig: {
                temperature: 0.6,
                maxTokens: 2000,
                topP: 0.9,
                frequencyPenalty: 0.0,
                presencePenalty: 0.2,
              },
            },
            category: "management",
          },
          {
            id: "creative-assistant",
            name: "Creative Assistant",
            description: "Helps with brainstorming and creative solutions",
            defaultConfig: {
              role: "Creative Assistant",
              backstory: "Imaginative and innovative thinker who loves exploring new ideas and creative solutions. Great at brainstorming and thinking outside the box.",
              goal: "Generate creative ideas and help solve problems innovatively",
              modelConfig: {
                temperature: 1.2, // High creativity
                maxTokens: 2500,
                topP: 0.95,
                frequencyPenalty: 0.3,
                presencePenalty: 0.4,
              },
            },
            category: "creative",
          },
        ];
      }
      
      static validateModelConfig(
        config: ModelConfig, 
        providerType: ProviderType
      ): ModelConfig {
        const constraints = this.getProviderConstraints(providerType);
        
        return {
          temperature: Math.max(
            constraints.temperature.min, 
            Math.min(constraints.temperature.max, config.temperature)
          ),
          maxTokens: Math.max(
            constraints.maxTokens.min,
            Math.min(constraints.maxTokens.max, config.maxTokens)
          ),
          topP: config.topP ? Math.max(0.1, Math.min(1.0, config.topP)) : undefined,
          frequencyPenalty: config.frequencyPenalty ? 
            Math.max(-2.0, Math.min(2.0, config.frequencyPenalty)) : undefined,
          presencePenalty: config.presencePenalty ?
            Math.max(-2.0, Math.min(2.0, config.presencePenalty)) : undefined,
        };
      }
      
      private static getProviderConstraints(providerType: ProviderType) {
        const constraints = {
          openai: {
            temperature: { min: 0, max: 2 },
            maxTokens: { min: 1, max: 4000 },
            supportsFrequencyPenalty: true,
            supportsPresencePenalty: true,
          },
          deepseek: {
            temperature: { min: 0, max: 2 },
            maxTokens: { min: 1, max: 4000 },
            supportsFrequencyPenalty: false,
            supportsPresencePenalty: false,
          },
          anthropic: {
            temperature: { min: 0, max: 1 },
            maxTokens: { min: 1, max: 4000 },
            supportsFrequencyPenalty: false,
            supportsPresencePenalty: false,
          },
        };
        
        return constraints[providerType] || constraints.openai;
      }
      
      static generateSystemPrompt(agent: Partial<SelectAgent>): string {
        const basePrompt = `You are ${agent.name}, a ${agent.role}.

Background: ${agent.backstory}

Current Goal: ${agent.goal}

Instructions:
- Stay true to your role and background
- Be helpful, professional, and knowledgeable
- Provide specific, actionable advice when possible
- Ask clarifying questions when needed
- Maintain consistency with your established personality`;

        return agent.systemPrompt || basePrompt;
      }
    }
    ```
```

### Phase 3: Enhanced Agent Service
```
UPDATE src/main/agents/agent.service.ts:
  - ADD: Configuration update methods
    ```typescript
    export class AgentService {
      // ... existing methods from TASK-003 ...
      
      static async updateConfiguration(
        id: string,
        updates: UpdateAgentInput,
        userId: string
      ): Promise<SelectAgent> {
        const db = getDatabase();
        
        // Get current agent and verify ownership
        const current = await this.findById(id);
        if (!current || current.ownerId !== userId) {
          throw new Error("Agent not found or access denied");
        }
        
        // Get provider for validation
        const provider = await LlmProviderService.findById(current.providerId);
        if (!provider) {
          throw new Error("Agent's LLM provider not found");
        }
        
        // Validate model configuration if provided
        let validatedModelConfig = current.modelConfig;
        if (updates.modelConfig) {
          const parsedCurrentConfig = JSON.parse(current.modelConfig);
          const mergedConfig = { ...parsedCurrentConfig, ...updates.modelConfig };
          const validatedConfig = AgentConfigService.validateModelConfig(
            mergedConfig, 
            provider.type as ProviderType
          );
          validatedModelConfig = JSON.stringify(validatedConfig);
        }
        
        // Generate system prompt if personality changed
        let systemPrompt = current.systemPrompt;
        if (updates.role || updates.backstory || updates.goal) {
          const updatedAgent = { ...current, ...updates };
          systemPrompt = AgentConfigService.generateSystemPrompt(updatedAgent);
        }
        
        const updateData = {
          ...updates,
          modelConfig: validatedModelConfig,
          systemPrompt: updates.systemPrompt || systemPrompt,
          configVersion: current.configVersion + 1,
          lastConfigUpdate: new Date(),
          updatedAt: new Date(),
        };
        
        const [updated] = await db
          .update(agentsTable)
          .set(updateData)
          .where(eq(agentsTable.id, id))
          .returning();
          
        if (!updated) throw new Error("Failed to update agent");
        return updated;
      }
      
      static async toggleStatus(
        id: string, 
        userId: string
      ): Promise<SelectAgent> {
        const db = getDatabase();
        
        const current = await this.findById(id);
        if (!current || current.ownerId !== userId) {
          throw new Error("Agent not found or access denied");
        }
        
        const [updated] = await db
          .update(agentsTable)
          .set({ 
            isActive: !current.isActive,
            updatedAt: new Date() 
          })
          .where(eq(agentsTable.id, id))
          .returning();
          
        return updated;
      }
      
      static async applyTemplate(
        id: string,
        templateId: string,
        userId: string
      ): Promise<SelectAgent> {
        const template = AgentConfigService.getDefaultTemplates()
          .find(t => t.id === templateId);
          
        if (!template) {
          throw new Error("Template not found");
        }
        
        const updates: UpdateAgentInput = {
          role: template.defaultConfig.role,
          backstory: template.defaultConfig.backstory,
          goal: template.defaultConfig.goal,
          modelConfig: template.defaultConfig.modelConfig,
          template: templateId,
          category: template.category,
        };
        
        return this.updateConfiguration(id, updates, userId);
      }
      
      static getConfigurationHistory(agentId: string): ConfigurationChange[] {
        // Future enhancement: track configuration changes
        // For now, return empty array
        return [];
      }
    }
    ```

CREATE src/main/agents/agent.handlers.ts:
  - ADD: Configuration management handlers
    ```typescript
    // Add to existing handlers from TASK-003
    
    ipcMain.handle(
      "agents:update-config",
      async (_, id: string, updates: UpdateAgentInput): Promise<IpcResponse> => {
        try {
          const userId = getCurrentUserId();
          const agent = await AgentService.updateConfiguration(id, updates, userId);
          return { success: true, data: agent };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update agent",
          };
        }
      }
    );
    
    ipcMain.handle(
      "agents:toggle-status",
      async (_, id: string): Promise<IpcResponse> => {
        try {
          const userId = getCurrentUserId();
          const agent = await AgentService.toggleStatus(id, userId);
          return { success: true, data: agent };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to toggle status",
          };
        }
      }
    );
    
    ipcMain.handle(
      "agents:apply-template",
      async (_, id: string, templateId: string): Promise<IpcResponse> => {
        try {
          const userId = getCurrentUserId();
          const agent = await AgentService.applyTemplate(id, templateId, userId);
          return { success: true, data: agent };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to apply template",
          };
        }
      }
    );
    
    ipcMain.handle(
      "agents:get-templates",
      async (): Promise<IpcResponse> => {
        try {
          const templates = AgentConfigService.getDefaultTemplates();
          return { success: true, data: templates };
        } catch (error) {
          return {
            success: false,
            error: "Failed to get templates",
          };
        }
      }
    );
    ```
```

### Phase 4: Frontend Configuration Components
```
UPDATE src/renderer/store/agent-store.ts:
  - ADD: Configuration management actions
    ```typescript
    interface AgentState {
      // ... existing state from TASK-003 ...
      templates: AgentTemplate[];
      isUpdating: boolean;
      
      // New actions
      updateAgentConfig: (id: string, updates: UpdateAgentInput) => Promise<void>;
      toggleAgentStatus: (id: string) => Promise<void>;
      applyTemplate: (id: string, templateId: string) => Promise<void>;
      loadTemplates: () => Promise<void>;
    }
    
    export const useAgentStore = create<AgentState>((set, get) => ({
      // ... existing state ...
      templates: [],
      isUpdating: false,
      
      updateAgentConfig: async (id: string, updates: UpdateAgentInput) => {
        set({ isUpdating: true, error: null });
        try {
          const result = await window.api.agents.updateConfig(id, updates);
          if (result.success) {
            set(state => ({
              agents: state.agents.map(a => a.id === id ? result.data : a),
              currentAgent: state.currentAgent?.id === id ? result.data : state.currentAgent,
              isUpdating: false,
            }));
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
      
      toggleAgentStatus: async (id: string) => {
        try {
          const result = await window.api.agents.toggleStatus(id);
          if (result.success) {
            set(state => ({
              agents: state.agents.map(a => a.id === id ? result.data : a),
            }));
          } else {
            throw new Error(result.error);
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : "Toggle failed" });
          throw error;
        }
      },
      
      applyTemplate: async (id: string, templateId: string) => {
        set({ isUpdating: true, error: null });
        try {
          const result = await window.api.agents.applyTemplate(id, templateId);
          if (result.success) {
            set(state => ({
              agents: state.agents.map(a => a.id === id ? result.data : a),
              currentAgent: state.currentAgent?.id === id ? result.data : state.currentAgent,
              isUpdating: false,
            }));
          } else {
            throw new Error(result.error);
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Template application failed",
            isUpdating: false 
          });
          throw error;
        }
      },
      
      loadTemplates: async () => {
        try {
          const result = await window.api.agents.getTemplates();
          if (result.success) {
            set({ templates: result.data });
          }
        } catch (error) {
          console.error("Failed to load templates:", error);
        }
      },
    }));
    ```

CREATE src/renderer/components/model-config-form.tsx:
  - IMPLEMENT: Model parameter configuration form
    ```tsx
    interface ModelConfigFormProps {
      config: ModelConfig;
      providerType: ProviderType;
      onChange: (config: ModelConfig) => void;
      disabled?: boolean;
    }
    
    export function ModelConfigForm({ 
      config, 
      providerType, 
      onChange, 
      disabled 
    }: ModelConfigFormProps) {
      const constraints = getProviderConstraints(providerType);
      
      const updateConfig = (field: keyof ModelConfig, value: number) => {
        onChange({ ...config, [field]: value });
      };
      
      return (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Model Parameters</h3>
            <p className="text-sm text-muted-foreground">
              Fine-tune the AI model's behavior and response characteristics
            </p>
          </div>
          
          {/* Temperature Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="temperature">
                Temperature
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="ml-1 h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Controls randomness: 0 = focused, 2 = creative</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <span className="text-sm font-mono">{config.temperature}</span>
            </div>
            <Slider
              id="temperature"
              min={constraints.temperature.min}
              max={constraints.temperature.max}
              step={0.1}
              value={[config.temperature]}
              onValueChange={([value]) => updateConfig('temperature', value)}
              disabled={disabled}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Focused</span>
              <span>Balanced</span>
              <span>Creative</span>
            </div>
          </div>
          
          {/* Max Tokens Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="maxTokens">
                Max Tokens
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="ml-1 h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Maximum response length in tokens</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <span className="text-sm font-mono">{config.maxTokens}</span>
            </div>
            <Slider
              id="maxTokens"
              min={constraints.maxTokens.min}
              max={constraints.maxTokens.max}
              step={50}
              value={[config.maxTokens]}
              onValueChange={([value]) => updateConfig('maxTokens', value)}
              disabled={disabled}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Short</span>
              <span>Medium</span>
              <span>Long</span>
            </div>
          </div>
          
          {/* Advanced Parameters (OpenAI only) */}
          {constraints.supportsFrequencyPenalty && (
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Advanced Parameters
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 mt-4">
                {/* Frequency Penalty */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="frequencyPenalty">Frequency Penalty</Label>
                    <span className="text-sm font-mono">
                      {config.frequencyPenalty || 0}
                    </span>
                  </div>
                  <Slider
                    id="frequencyPenalty"
                    min={-2}
                    max={2}
                    step={0.1}
                    value={[config.frequencyPenalty || 0]}
                    onValueChange={([value]) => updateConfig('frequencyPenalty', value)}
                    disabled={disabled}
                  />
                </div>
                
                {/* Presence Penalty */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="presencePenalty">Presence Penalty</Label>
                    <span className="text-sm font-mono">
                      {config.presencePenalty || 0}
                    </span>
                  </div>
                  <Slider
                    id="presencePenalty"
                    min={-2}
                    max={2}
                    step={0.1}
                    value={[config.presencePenalty || 0]}
                    onValueChange={([value]) => updateConfig('presencePenalty', value)}
                    disabled={disabled}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      );
    }
    
    function getProviderConstraints(providerType: ProviderType) {
      // Same constraints as backend service
      const constraints = {
        openai: {
          temperature: { min: 0, max: 2 },
          maxTokens: { min: 100, max: 4000 },
          supportsFrequencyPenalty: true,
          supportsPresencePenalty: true,
        },
        deepseek: {
          temperature: { min: 0, max: 2 },
          maxTokens: { min: 100, max: 4000 },
          supportsFrequencyPenalty: false,
          supportsPresencePenalty: false,
        },
      };
      
      return constraints[providerType] || constraints.openai;
    }
    ```

CREATE src/renderer/app/agents/[agentId]/edit.tsx:
  - IMPLEMENT: Agent editing page
    ```tsx
    export default function EditAgentPage() {
      const { agentId } = useParams();
      const navigate = useNavigate();
      
      const { 
        agents, 
        templates, 
        isUpdating, 
        updateAgentConfig, 
        applyTemplate,
        loadTemplates 
      } = useAgentStore();
      
      const { providers } = useLlmProviderStore();
      
      const agent = agents.find(a => a.id === agentId);
      const agentProvider = providers.find(p => p.id === agent?.providerId);
      
      const [selectedTemplate, setSelectedTemplate] = useState<string>("");
      
      const form = useForm<UpdateAgentInput>({
        resolver: zodResolver(updateAgentSchema),
        defaultValues: {
          name: agent?.name || "",
          role: agent?.role || "",
          backstory: agent?.backstory || "",
          goal: agent?.goal || "",
          modelConfig: agent?.modelConfig ? JSON.parse(agent.modelConfig) : {
            temperature: 0.7,
            maxTokens: 2000,
          },
        },
      });
      
      useEffect(() => {
        loadTemplates();
      }, []);
      
      useEffect(() => {
        if (agent) {
          form.reset({
            name: agent.name,
            role: agent.role,
            backstory: agent.backstory,
            goal: agent.goal,
            modelConfig: JSON.parse(agent.modelConfig),
          });
        }
      }, [agent, form]);
      
      const onSubmit = async (data: UpdateAgentInput) => {
        if (!agent) return;
        
        try {
          await updateAgentConfig(agent.id, data);
          toast.success("Agent updated successfully");
          navigate(`/agents/${agent.id}`);
        } catch (error) {
          // Error handled by store
        }
      };
      
      const handleApplyTemplate = async () => {
        if (!agent || !selectedTemplate) return;
        
        try {
          await applyTemplate(agent.id, selectedTemplate);
          toast.success("Template applied successfully");
          setSelectedTemplate("");
        } catch (error) {
          // Error handled by store
        }
      };
      
      if (!agent) {
        return <div>Agent not found</div>;
      }
      
      return (
        <div className="container max-w-4xl py-8">
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Edit {agent.name}</h1>
                <p className="text-muted-foreground">
                  Customize agent personality and model parameters
                </p>
              </div>
              
              <Button variant="outline" asChild>
                <Link to={`/agents/${agent.id}`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Agent
                </Link>
              </Button>
            </div>
            
            {/* Templates Section */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Templates</CardTitle>
                <CardDescription>
                  Apply predefined configurations for common agent types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Choose a template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    onClick={handleApplyTemplate}
                    disabled={!selectedTemplate || isUpdating}
                  >
                    Apply Template
                  </Button>
                </div>
                
                {selectedTemplate && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    {templates.find(t => t.id === selectedTemplate)?.description}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Configuration Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Agent name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Frontend Developer" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="backstory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Backstory</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Agent's background and expertise..."
                              className="min-h-24"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="goal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Goal</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="What is this agent trying to achieve?"
                              className="min-h-20"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                
                {/* Model Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle>Model Configuration</CardTitle>
                    <CardDescription>
                      Fine-tune AI behavior for {agentProvider?.name} ({agentProvider?.type})
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="modelConfig"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <ModelConfigForm
                              config={field.value}
                              providerType={agentProvider?.type as ProviderType}
                              onChange={field.onChange}
                              disabled={isUpdating}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                
                {/* Actions */}
                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    disabled={isUpdating}
                    className="flex-1"
                  >
                    {isUpdating ? "Updating..." : "Save Changes"}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => navigate(`/agents/${agent.id}`)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      );
    }
    ```
```

### Phase 5: Enhanced Agent Cards with Configuration
```
UPDATE src/renderer/components/agent-card.tsx:
  - ENHANCE: Add configuration status and quick actions
    ```tsx
    export function AgentCard({ agent, onClick }: AgentCardProps) {
      const { toggleAgentStatus } = useAgentStore();
      
      const modelConfig = JSON.parse(agent.modelConfig);
      const configurationBadge = agent.template ? (
        <Badge variant="secondary" className="text-xs">
          {agent.template}
        </Badge>
      ) : null;
      
      return (
        <Card className="cursor-pointer transition-shadow hover:shadow-md">
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
                  <CardTitle className="text-lg flex items-center gap-2">
                    {agent.name}
                    {!agent.isActive && (
                      <Badge variant="outline" className="text-xs">
                        Inactive
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    {agent.role}
                    {configurationBadge}
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
                  <DropdownMenuItem asChild>
                    <Link to={`/agents/${agent.id}/edit`}>
                      <Settings className="mr-2 h-4 w-4" />
                      Configure
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => toggleAgentStatus(agent.id)}>
                    <Power className="mr-2 h-4 w-4" />
                    {agent.isActive ? "Deactivate" : "Activate"}
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem asChild>
                    <Link to={`/agents/${agent.id}/chat`}>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Chat
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {agent.backstory}
              </p>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Temperature:</span>
                  <span className="font-mono">{modelConfig.temperature}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Max Tokens:</span>
                  <span className="font-mono">{modelConfig.maxTokens}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{agent.provider.name} ({agent.provider.type})</span>
                <span>
                  {formatDistanceToNow(new Date(agent.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    ```

UPDATE src/renderer/preload.ts:
  - ADD: Configuration API methods
    ```typescript
    agents: {
      // ... existing methods from TASK-003 ...
      updateConfig: (id, updates) => ipcRenderer.invoke("agents:update-config", id, updates),
      toggleStatus: (id) => ipcRenderer.invoke("agents:toggle-status", id),
      applyTemplate: (id, templateId) => ipcRenderer.invoke("agents:apply-template", id, templateId),
      getTemplates: () => ipcRenderer.invoke("agents:get-templates"),
    }
    ```
```

## Validation Checkpoints

### Checkpoint 1: Configuration Backend
```
VALIDATE_BACKEND:
  - TEST: Agent configuration update with model parameters
  - VERIFY: Parameter validation based on provider type
  - CHECK: Template application works correctly
  - CONFIRM: Status toggling updates database
```

### Checkpoint 2: Frontend Configuration
```
VALIDATE_FRONTEND:
  - TEST: Model parameter sliders update in real-time
  - VERIFY: Form validation prevents invalid values
  - CHECK: Template application updates form fields
  - CONFIRM: Configuration saves and persists
```

### Checkpoint 3: Integration Testing
```
VALIDATE_INTEGRATION:
  - EDIT: Agent configuration through UI
  - APPLY: Template and verify changes
  - TOGGLE: Agent status and verify effect
  - CHAT: With reconfigured agent to test behavior
```

## Use Cases & Examples

### Configuration Scenarios
1. **Fine-tuning Creativity**: User adjusts temperature for creative vs focused responses
2. **Template Application**: User applies "Code Reviewer" template for stricter responses
3. **Status Management**: User deactivates agents not currently needed
4. **Model Optimization**: User adjusts max tokens based on use case

### Example Configuration
```typescript
const optimizedDeveloperConfig = {
  temperature: 0.5, // Focused but flexible
  maxTokens: 3000, // Longer code explanations
  topP: 0.9, // Good diversity
  frequencyPenalty: 0.1, // Reduce repetition
  presencePenalty: 0.1, // Encourage topic variety
};
```

## Dependencies & Prerequisites

### Required Files/Components
- [x] Agent creation system (TASK-003)
- [x] Agent listing system (TASK-004)  
- [x] LLM provider system (TASK-001, TASK-002)
- [x] Shadcn/ui Slider, Collapsible, Tooltip components
- [x] Form validation with react-hook-form + Zod

### Required Patterns/Conventions
- [x] Service layer update patterns
- [x] Form validation and submission
- [x] Configuration management patterns
- [x] Template system architecture
- [x] Real-time parameter adjustment

---

## Task Completion Checklist

- [ ] Agent configuration fields added to schema
- [ ] Model parameter validation service implemented
- [ ] Template system with predefined configurations
- [ ] Agent editing form with parameter sliders
- [ ] Real-time validation and parameter constraints
- [ ] Template application functionality
- [ ] Agent status management (active/inactive)
- [ ] Enhanced agent cards show configuration
- [ ] No TypeScript or linting errors
- [ ] Configuration changes improve agent behavior

**Final Validation**: Run `npm run quality:check` and ensure all automated checks pass.

**Delivers**: After completing this task, users can fine-tune their agents with advanced model parameters, apply templates for quick configuration, and manage agent status for optimal performance.