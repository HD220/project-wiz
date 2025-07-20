# Create Tasks from PRP

> Analyze a PRP README.md deeply and generate evolutionary micro-features as self-contained tasks that deliver incremental functional value

## Usage

```bash
/create-tasks prps/{prp-folder}/README.md
```

## Process Overview

The command will:
1. **Deep Analysis** of the PRP README.md to understand the complete feature requirements
2. **Evolutionary Breakdown** into micro-features that deliver end-to-end functionality
3. **Task Generation** with complete backend→integration→frontend flow for each micro-feature
4. **Progressive Complexity** starting simple and incrementally adding sophistication
5. **File Creation** at `prps/{prp-folder}/tasks/{task-name}.md`

## Analysis Framework

### 1. PRP Content Extraction

**READ** the PRP README.md to extract:

```yaml
prp_metadata:
  title: {Extract main PRP title/purpose}
  goal: {Primary objective statement}
  why: {Business justification and impact}
  what: {User-facing capabilities and features}
  success_criteria: {Measurable outcomes}
  
requirements_analysis:
  core_features: [List of main features to implement]
  technical_components: [Database schemas, services, handlers, UI components]
  integrations: [External services, APIs, libraries]
  dependencies: [Prerequisites and blockers]
  
context_analysis:
  referenced_docs: [Documentation URLs and file references]
  existing_patterns: [Code patterns to follow from referenced files]
  architecture_context: [Bounded contexts, directory structure]
  validation_commands: [Test, lint, build commands mentioned]
```

### 2. Project Context Intelligence

**ANALYZE** the current codebase to understand:

```yaml
project_intelligence:
  tech_stack:
    database: {Analyze schema files for ORM pattern}
    backend: {Identify service/handler patterns}
    frontend: {Identify component/store patterns}
    testing: {Find test files and patterns}
    build_tools: {Extract from package.json and config files}
  
  code_patterns:
    service_layer: {Extract from existing service files}
    ipc_handlers: {Extract from existing handler files}
    database_schema: {Extract from schema files}
    frontend_stores: {Extract from store files}
    component_structure: {Extract from component files}
  
  conventions:
    naming: {File, variable, class naming patterns}
    imports: {Import organization from existing files}
    error_handling: {Error patterns from existing code}
    validation: {Validation patterns and commands}
```

### 3. Evolutionary Micro-Feature Strategy

**DECOMPOSE** the PRP into progressive micro-features that deliver functional value:

```yaml
evolutionary_approach:
  principle: "Each task delivers a complete, working micro-feature with full stack implementation"
  
  micro_feature_levels:
    level_1_mvp:
      description: "Minimal viable feature - basic CRUD with simple UI"
      includes:
        - Minimal database schema (1-2 tables)
        - Basic service with essential operations
        - Simple IPC handler registration
        - Basic UI component with minimal styling
        - Simple store integration
      value: "User can immediately use the basic feature"
    
    level_2_enhanced:
      description: "Enhanced feature - adds validation, error handling, UX improvements"
      includes:
        - Schema refinements and validations
        - Service layer error handling and edge cases
        - Enhanced UI with loading states and feedback
        - Proper form validation
        - Basic optimistic updates
      value: "Feature becomes production-ready with good UX"
    
    level_3_advanced:
      description: "Advanced feature - adds performance, security, advanced UX"
      includes:
        - Schema optimizations and indexes
        - Service layer caching and performance
        - Advanced UI interactions and animations
        - Real-time updates if applicable
        - Advanced state management patterns
      value: "Feature becomes highly polished and performant"

  progression_example:
    feature: "Agent Management"
    micro_feature_1:
      title: "Basic Agent Creation"
      delivers: "User can create and view agents with name/description"
      stack: "agents table → createAgent service → create-agent handler → AgentForm component"
      
    micro_feature_2:
      title: "Agent Configuration"
      delivers: "User can configure agent with model selection and parameters"
      stack: "agent_configs table → configureAgent service → configure-agent handler → AgentConfig component"
      
    micro_feature_3:
      title: "Agent Execution"
      delivers: "User can execute agent and see results"
      stack: "agent_runs table → executeAgent service → execute-agent handler → AgentRunner component"

complexity_mapping:
  micro_mvp: {1-2 hours - delivers basic functionality}
  micro_enhanced: {2-3 hours - adds polish and robustness}
  micro_advanced: {3-4 hours - adds sophistication}
```

## Micro-Feature Implementation Pattern

### End-to-End Stack Flow

Each micro-feature task must implement the complete flow:

```yaml
complete_flow_pattern:
  1_backend_foundation:
    - Database schema creation/update
    - Type definitions and exports
    - Service layer with business logic
    - Data validation schemas
    
  2_integration_layer:
    - IPC handler implementation
    - API exposure in preload
    - Type definitions for IPC
    - Main process registration
    
  3_frontend_implementation:
    - Zustand store creation/update
    - UI component development
    - Route integration if needed
    - User interaction flow
    
  4_validation_testing:
    - Manual testing steps
    - Type checking validation
    - Lint compliance
    - Feature demonstration

micro_feature_example:
  task: "Create Project Feature - MVP"
  
  backend:
    files:
      - src/main/project/projects.schema.ts (basic schema)
      - src/main/project/project.service.ts (create method)
    delivers: "Database can store projects"
    
  integration:
    files:
      - src/main/project/project.handlers.ts (create handler)
      - src/renderer/preload.ts (expose API)
      - src/renderer/window.d.ts (type definitions)
    delivers: "Frontend can call backend"
    
  frontend:
    files:
      - src/renderer/store/project-store.ts (state management)
      - src/renderer/components/create-project-form.tsx (UI)
      - src/renderer/app/projects/new.tsx (route)
    delivers: "User can create projects through UI"
    
  result: "Complete working feature: User clicks button → form appears → submits → project saved → UI updates"
```

## Task Generation Process

### 1. Context Preparation

For each micro-feature, prepare complete context by:

```yaml
context_preparation:
  project_analysis:
    - READ package.json for tech stack details
    - READ CLAUDE.md for project-specific patterns
    - ANALYZE existing schema files for database patterns
    - EXTRACT service patterns from similar implementations
    - IDENTIFY validation commands from project setup
  
  pattern_extraction:
    - FIND similar existing implementations
    - EXTRACT code patterns and conventions
    - IDENTIFY integration points
    - MAP dependencies and prerequisites
```

### 2. Evolutionary Task Design

Design micro-features that build upon each other:

```yaml
evolutionary_design:
  identify_core_value:
    question: "What is the minimal feature that delivers user value?"
    example: "User can create a project with just a name"
    
  map_progression:
    mvp: "What's the simplest working version?"
    enhanced: "What makes it production-ready?"
    advanced: "What makes it delightful?"
    
  ensure_completeness:
    backend: "Schema + Service + Types"
    integration: "Handler + API + Registration"
    frontend: "Store + Component + Route"
    validation: "Works end-to-end"

feature_progression_template:
  mvp_characteristics:
    - Minimal fields (only required)
    - Basic operations (create/read)
    - Simple UI (form + list)
    - Basic feedback (success/error)
    
  enhanced_characteristics:
    - Full field set
    - Complete CRUD operations
    - Validation and error handling
    - Loading states and optimistic updates
    - Proper user feedback
    
  advanced_characteristics:
    - Performance optimizations
    - Advanced interactions
    - Real-time updates
    - Batch operations
    - Advanced filtering/search
```

### 3. Template Population

Using `@prps/00-miscellaneous/prp-task.md`, populate each micro-feature:

```yaml
template_population:
  meta_information:
    id: "TASK-{incremental_number}"
    title: "{Feature} - {Level} Implementation"
    description: "Implement {specific micro-feature} with complete backend→frontend flow"
    source_document: "{prp_folder}/README.md"
    priority: "{based on feature dependency chain}"
    estimated_effort: "{1-4 hours for complete micro-feature}"
    tech_stack: "{Electron, React, TypeScript, SQLite, Drizzle}"
    domain_context: "{Bounded context area}"
    feature_level: "{mvp|enhanced|advanced}"
    delivers_value: "{What user can do after this task}"
  
  complete_context:
    previous_tasks: "{List tasks this builds upon}"
    feature_state: "{Current state of the feature}"
    next_evolution: "{What comes after this task}"
    
  implementation_flow:
    backend_phase:
      - "Create/update schema in {domain}/schema.ts"
      - "Implement service method in {domain}.service.ts"
      - "Add validation schemas with Zod"
      
    integration_phase:
      - "Create IPC handler in {domain}.handlers.ts"
      - "Expose API in preload.ts"
      - "Add types to window.d.ts"
      - "Register handler in main.ts"
      
    frontend_phase:
      - "Create/update Zustand store"
      - "Build UI component with Shadcn/ui"
      - "Integrate with TanStack Router"
      - "Connect store to component"
      
    validation_phase:
      - "Test complete flow: UI → IPC → Service → Database"
      - "Run npm run type-check"
      - "Run npm run lint"
      - "Manual feature testing"
  
  deliverable_checklist:
    - "[ ] User can perform {specific action}"
    - "[ ] Data persists in database"
    - "[ ] UI provides feedback"
    - "[ ] Feature works end-to-end"
    - "[ ] No TypeScript errors"
    - "[ ] Code follows patterns"
```

### 4. Task File Creation

For each micro-feature evolution:

```bash
CREATE prps/{prp-folder}/tasks/{sequence}-{feature}-{level}.md:
  - POPULATE: Template with complete end-to-end flow
  - ENSURE: Backend → Integration → Frontend completeness
  - VERIFY: Each task delivers working functionality
  - VALIDATE: User value is immediately accessible
```

## Task Naming Convention

Tasks should follow evolutionary micro-feature naming:
- `{sequence}-{feature}-{level}.md`
- Pattern: `01-create-project-mvp.md` → `02-create-project-enhanced.md` → `03-create-project-advanced.md`

Examples by feature evolution:
```
Project Management Evolution:
  01-create-project-mvp.md         # Basic project creation
  02-list-projects-mvp.md          # View all projects
  03-project-details-mvp.md        # View single project
  04-update-project-enhanced.md    # Edit with validation
  05-delete-project-enhanced.md    # Delete with confirmation
  06-project-search-advanced.md    # Advanced filtering

Agent System Evolution:
  01-create-agent-mvp.md           # Basic agent creation
  02-list-agents-mvp.md            # View agents list
  03-configure-agent-enhanced.md   # Model configuration
  04-execute-agent-enhanced.md     # Run agent tasks
  05-agent-history-advanced.md     # Execution history
```

## Quality Assurance

### Pre-Generation Validation
- [ ] PRP feature goals clearly understood
- [ ] Micro-feature progression mapped (MVP → Enhanced → Advanced)
- [ ] Each task delivers immediate user value
- [ ] Feature dependencies identified and ordered

### Micro-Feature Validation
Each task must deliver:
- [ ] Complete backend implementation (schema + service)
- [ ] Full integration layer (handler + API exposure)
- [ ] Working frontend (UI + state management)
- [ ] End-to-end functionality user can immediately use
- [ ] Clear value proposition stated

### Post-Generation Validation
- [ ] Tasks follow evolutionary progression
- [ ] Each task builds on previous functionality
- [ ] Complete stack implementation in each task
- [ ] Real file paths and working code patterns
- [ ] Validation demonstrates working feature
- [ ] User can see immediate results

### Task Completeness Check
Each generated task must include:
- [ ] Clear "delivers value" statement
- [ ] Complete backend→integration→frontend flow
- [ ] Specific implementation steps for all layers
- [ ] Working validation that proves functionality
- [ ] Connection to previous and next tasks
- [ ] No isolated components - always full features

## Output Structure

```
prps/{prp-folder}/tasks/
├── 01-create-agent-mvp.md          # User can create basic agents
├── 02-list-agents-mvp.md           # User can view all agents
├── 03-agent-details-mvp.md         # User can view agent details
├── 04-configure-agent-enhanced.md  # User can configure agent models
├── 05-execute-agent-enhanced.md    # User can run agents
├── 06-agent-history-advanced.md    # User can view execution history
└── README.md (feature progression map)
```

### Task Progression Example

```markdown
# Feature: Agent Management

## MVP Phase (Tasks 1-3)
After completion, user can:
- Create agents with name and description
- View list of all agents
- Click to see agent details

## Enhanced Phase (Tasks 4-5)
After completion, user can:
- Configure agent with AI models
- Set agent parameters
- Execute agents and see results
- Handle errors gracefully

## Advanced Phase (Task 6+)
After completion, user can:
- View complete execution history
- Filter and search executions
- Export results
- Batch operations
```

## Success Criteria

- [ ] Each task delivers a complete, working micro-feature
- [ ] Users see immediate value after each task completion
- [ ] Features evolve from simple to sophisticated
- [ ] Complete backend→frontend implementation in every task
- [ ] Clear progression path from MVP to Advanced
- [ ] No isolated technical tasks - only functional features
- [ ] Tasks can be completed independently but build on each other

**Remember**: Each task must deliver immediate, perceptible value to the user through a complete, working feature implementation.