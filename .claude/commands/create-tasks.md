# Create Tasks from PRP

> Analyze a PRP README.md deeply and generate detailed, self-contained task files based on the universal task template

## Usage

```bash
/create-tasks prps/{prp-folder}/README.md
```

## Process Overview

The command will:
1. **Deep Analysis** of the PRP README.md to understand requirements, context, and implementation details
2. **Task Breakdown** into logical, executable units following established patterns
3. **Task Generation** using the universal template with complete context
4. **File Creation** at `prps/{prp-folder}/tasks/{task-name}.md`

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

### 3. Task Decomposition Strategy

**DECOMPOSE** the PRP into logical implementation phases:

```yaml
decomposition_framework:
  phase_1_data:
    - database_schema_design
    - migration_creation
    - type_definitions
    
  phase_2_core:
    - service_layer_implementation
    - business_logic_development
    - data_access_patterns
    
  phase_3_integration:
    - ipc_handler_creation
    - api_exposure_setup
    - main_process_registration
    
  phase_4_frontend:
    - store_implementation
    - component_development
    - routing_setup
    
  phase_5_testing:
    - unit_test_creation
    - integration_testing
    - end_to_end_validation

complexity_analysis:
  simple_tasks: {Can be completed in 1-2 hours}
  moderate_tasks: {Require 3-4 hours with validation}
  complex_tasks: {Need 5+ hours, multiple validations}
```

## Task Generation Process

### 1. Context Preparation

For each task, prepare complete context by:

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

### 2. Template Population

Using `@prps/00-miscellaneous/prp-task.md`, populate:

```yaml
template_population:
  meta_information:
    id: "TASK-{incremental_number}"
    title: "{Specific, actionable task title}"
    source_document: "{prp_folder}/README.md"
    priority: "{high|medium|low based on PRP dependencies}"
    estimated_effort: "{1-5 hours based on complexity}"
    tech_stack: "{Project-specific technologies}"
    domain_context: "{Bounded context area}"
    project_type: "desktop"
  
  complete_context:
    project_architecture: "{Actual project structure}"
    technology_specific: "{Fill with real project tech stack}"
    existing_patterns: "{Real code patterns from codebase}"
    project_conventions: "{Actual naming and coding conventions}"
    validation_commands: "{Real commands from project setup}"
  
  implementation_steps:
    - "{Customized phases based on task type}"
    - "{Real file paths and commands}"
    - "{Actual validation steps}"
  
  validation_checkpoints:
    - "{Project-specific validation commands}"
    - "{Real test commands and expectations}"
  
  use_cases_examples:
    - "{Realistic examples from PRP context}"
    - "{Domain-specific scenarios}"
  
  troubleshooting:
    - "{Technology-specific common issues}"
    - "{Project-specific debug commands}"
```

### 3. Task File Creation

For each identified task:

```bash
CREATE prps/{prp-folder}/tasks/{task-name}.md:
  - POPULATE: Universal template with complete context
  - CUSTOMIZE: Implementation phases for specific task type
  - INCLUDE: Real file paths, commands, and patterns
  - VALIDATE: Template completeness and accuracy
```

## Task Naming Convention

Tasks should follow this naming pattern:
- `{phase}-{component}-{action}.md`
- Examples:
  - `01-database-schema-setup.md`
  - `02-agent-service-implementation.md`
  - `03-ipc-handlers-creation.md`
  - `04-frontend-store-integration.md`
  - `05-ui-components-development.md`

## Quality Assurance

### Pre-Generation Validation
- [ ] PRP README.md completely analyzed
- [ ] Project context intelligence gathered
- [ ] Task decomposition strategy defined
- [ ] Dependencies and prerequisites identified

### Post-Generation Validation
- [ ] All tasks are self-contained
- [ ] Complete context included in each task
- [ ] Real project patterns and commands used
- [ ] Implementation steps are specific and actionable
- [ ] Validation checkpoints are executable
- [ ] Troubleshooting guides are technology-specific

### Task Completeness Check
Each generated task must include:
- [ ] Filled meta information (no placeholders)
- [ ] Complete project context
- [ ] Real implementation steps with actual file paths
- [ ] Executable validation commands
- [ ] Domain-specific examples and use cases
- [ ] Technology-specific troubleshooting

## Output Structure

```
prps/{prp-folder}/tasks/
├── 01-database-schema-setup.md
├── 02-service-layer-implementation.md
├── 03-ipc-handlers-creation.md
├── 04-frontend-integration.md
├── 05-testing-validation.md
└── README.md (task index and dependencies)
```

## Success Criteria

- [ ] All major PRP components broken down into implementable tasks
- [ ] Each task is completely self-contained
- [ ] Real project context and patterns included
- [ ] Implementation steps are specific and actionable
- [ ] Validation commands are executable
- [ ] Task dependencies clearly defined
- [ ] No placeholders remain in generated tasks

**Remember**: Each task should be implementable by an LLM without requiring additional context or documentation lookups.