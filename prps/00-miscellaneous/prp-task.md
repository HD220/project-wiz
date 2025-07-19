# Universal Task Template - Pattern-Based Implementation Guide

> Auto-contained tasks with complete context and patterns for LLM implementation across any project/repository

## Meta Information

```yaml
id: TASK-{NUMBER}
title: {Concise Action Description}
source_document: {Source document/issue/requirement}
priority: high|medium|low
estimated_effort: {1-5 hours}
dependencies: [list of prerequisite tasks]
tech_stack: [specific technologies: React, Python, Go, etc.]
domain_context: {feature/module/component area}
project_type: {web|mobile|desktop|api|library|cli}
```

## Primary Goal

**Single sentence describing the main objective of this task**

### Success Criteria
- [ ] Specific measurable outcome 1
- [ ] Specific measurable outcome 2
- [ ] All tests pass (if applicable)
- [ ] Code follows project conventions
- [ ] Documentation updated (if needed)

## Complete Context

### Project Architecture Context
```
{PROJECT_ROOT}/
├── {source_code_dir}/           # Main source directory
│   ├── {feature_area}/          # Feature/domain organization
│   │   ├── {entity}.{ext}       # Core implementation files
│   │   ├── {entity}.test.{ext}  # Test files
│   │   └── {entity}.types.{ext} # Type definitions
│   ├── {shared_dir}/            # Shared utilities
│   └── {config_dir}/            # Configuration files
├── {test_dir}/                  # Test directory (if separate)
├── {docs_dir}/                  # Documentation
└── {build_config_files}         # Build/config files
```

### Technology-Specific Context
```yaml
# Fill in relevant sections based on project tech stack

database:
  type: {SQL|NoSQL|File-based|None}
  orm_framework: {Prisma|Drizzle|TypeORM|Sequelize|SQLAlchemy|etc}
  schema_location: {path/to/schema/files}
  migration_command: {command to run migrations}

backend:
  framework: {Express|FastAPI|Django|Gin|Spring|etc}
  language: {TypeScript|Python|Go|Java|etc}
  api_pattern: {REST|GraphQL|tRPC|gRPC}
  auth_method: {JWT|Session|OAuth|etc}

frontend:
  framework: {React|Vue|Angular|Svelte|etc}
  state_management: {Redux|Zustand|Vuex|Context|etc}
  routing: {React Router|Next.js|Vue Router|etc}
  styling: {CSS|Tailwind|Styled Components|etc}

testing:
  unit_framework: {Jest|Vitest|pytest|Go test|etc}
  integration_framework: {Cypress|Playwright|Supertest|etc}
  test_command: {npm test|pytest|go test|etc}

build_tools:
  package_manager: {npm|yarn|pnpm|pip|go mod|cargo|etc}
  bundler: {Webpack|Vite|Rollup|Parcel|etc}
  linter: {ESLint|Pylint|golangci-lint|clippy|etc}
  formatter: {Prettier|Black|gofmt|rustfmt|etc}
```

### Existing Code Patterns
```{language}
// Pattern 1: {Pattern Name - e.g., Service Layer, Repository, Factory}
// Example: Service class with static methods and error handling
// Follow: class {Entity}Service { static async method() { ... } }

// Pattern 2: {Pattern Name - e.g., Error Handling, Data Validation, API Response}  
// Example: Standard IPC response format with try/catch in handlers
// Follow: { success: boolean, data?: T, error?: string }

// Pattern 3: {Pattern Name - e.g., Testing, Configuration, Component Structure}
// Example: Test files co-located with implementation files
// Follow: {entity}.test.{ext} alongside {entity}.{ext}

// Add more pattern descriptions as needed for the specific project
```

### Project-Specific Conventions
```yaml
naming_conventions:
  files: {kebab-case|camelCase|PascalCase|snake_case}
  variables: {camelCase|snake_case}
  constants: {SCREAMING_SNAKE_CASE|camelCase}
  classes: {PascalCase|snake_case}
  functions: {camelCase|snake_case}

import_organization:
  - {external libraries first}
  - {internal shared modules}
  - {relative imports last}
  - {use absolute imports when: always|never|for shared modules}

code_organization:
  - {single responsibility per file}
  - {co-locate related files}
  - {separate concerns by: feature|layer|type}

error_handling:
  pattern: {exceptions|error objects|result types}
  logging: {console|structured logging|external service}
```

### Validation Commands
```bash
# Customize these commands based on your project's setup
{build_command}          # e.g., npm run build, cargo build, go build
{lint_command}           # e.g., npm run lint, pylint src/, golangci-lint run
{format_command}         # e.g., npm run format, black ., gofmt -w .
{type_check_command}     # e.g., npm run type-check, mypy ., go vet
{test_command}           # e.g., npm test, pytest, go test ./...
{integration_test_cmd}   # e.g., npm run test:e2e, pytest tests/integration
{quality_check_cmd}      # Combined command if available
```

## Implementation Steps

> Focus on following established patterns rather than creating complete implementations
> Customize these phases based on your project's architecture and requirements

### Phase 1: Data Layer (if applicable)
```
READ {existing_data_files}:
  - UNDERSTAND: Current data structure and relationships
  - IDENTIFY: Naming conventions and data types
  - NOTE: Persistence patterns and constraints

CREATE/UPDATE {path_to_data_schema}:
  - FOLLOW_PATTERN: {path_to_similar_schema}
  - DESIGN_SCHEMA:
    • Use project's standard data types and naming
    • Follow existing table/collection patterns
    • Apply project's validation and constraint patterns
    • Example approaches:
      - SQL: Follow existing table structure patterns
      - NoSQL: Use consistent document schemas
      - ORM: Apply existing entity relationship patterns
  
  - VALIDATE: {schema_validation_command}
  - IF_FAIL: Check syntax and existing data conflicts

MIGRATE_DATA (if applicable):
  - RUN: {migration_command}
  - VALIDATE: {migration_verification_command}
  - IF_FAIL: Resolve migration conflicts or data issues
```

### Phase 2: Core Logic Layer
```
CREATE {path_to_core_file}:
  - FOLLOW_PATTERN: {path_to_similar_implementation}
  - DESIGN_LOGIC:
    • Apply project's service/business logic patterns
    • Use established error handling approaches
    • Follow project's input validation patterns
    • Implement using project's architectural style:
      - Service classes: Follow existing service method signatures
      - API endpoints: Use consistent route handler patterns
      - Data access: Apply repository/data access patterns
      - Business rules: Follow domain logic organization
  
  - FOLLOW: Project naming conventions and patterns
  - VALIDATE: {type_check_command}
  - IF_FAIL: Check imports, dependencies, and type definitions
```

### Phase 3: Integration Layer (if applicable)
```
CREATE {path_to_integration_file}:
  - DESIGN_INTEGRATION:
    • Follow project's API/route structure patterns
    • Use established middleware and handler patterns
    • Apply consistent configuration and setup approaches
    • Integration patterns to follow:
      - API routes: Match existing route organization and response formats
      - Event handlers: Use project's event handling patterns
      - External services: Follow established client setup patterns
      - Dependency injection: Use project's registration patterns
  
  - VALIDATE: {integration_test_command}
  - IF_FAIL: Check configuration and connection setup

UPDATE {main_application_file}:
  - FIND: {registration_pattern}
  - ADD: {new_integration_registration}
  - VALIDATE: {build_command}
```

### Phase 4: User Interface Layer (if applicable)
```
CREATE {path_to_ui_component}:
  - FOLLOW_PATTERN: {path_to_similar_component}
  - DESIGN_UI:
    • Use project's component structure and organization
    • Apply established styling and theming patterns
    • Follow project's prop validation and typing patterns
    • UI patterns to follow:
      - Components: Match existing component architecture and naming
      - Forms: Use project's form validation and submission patterns
      - State: Apply consistent state management approaches
      - Styling: Follow project's CSS/styling methodology
  
  - FOLLOW: Component architecture patterns
  - VALIDATE: {ui_build_command}

CREATE {path_to_state_management}:
  - DESIGN_STATE:
    • Follow project's state management patterns and structure
    • Use established data flow and update patterns
    • Apply consistent action/mutation patterns if applicable
  
  - VALIDATE: {type_check_command}

UPDATE {routing_configuration}:
  - ADD: {new_route_definition}
  - VALIDATE: {routing_verification_command}
```

### Phase 5: Testing Layer
```
CREATE {path_to_unit_tests}:
  - DESIGN_TESTS:
    • Follow project's testing patterns and structure
    • Use established mocking and setup patterns
    • Apply consistent test organization and naming
    • Test patterns to follow:
      - Test structure: Match existing describe/it organization
      - Assertions: Use project's preferred assertion library
      - Mocking: Follow established mock patterns for dependencies
      - Coverage: Target core functionality, edge cases, error scenarios
  
  - VALIDATE: {unit_test_command}
  - EXPECT: All tests pass

CREATE {path_to_integration_tests} (if needed):
  - DESIGN_INTEGRATION_TESTS:
    • Test component interactions using project patterns
    • Follow established integration test setup and teardown
    • Use project's preferred integration testing approaches
  
  - VALIDATE: {integration_test_command}
  - EXPECT: All tests pass

CREATE {path_to_e2e_tests} (if needed):
  - DESIGN_E2E_TESTS:
    • Follow project's end-to-end testing patterns
    • Use established user workflow testing approaches
    • Apply consistent page object or testing utility patterns
  
  - VALIDATE: {e2e_test_command}
  - EXPECT: All scenarios pass
```

## Validation Checkpoints

### Checkpoint 1: Data Layer
```
VALIDATE_DATA_LAYER:
  - RUN: {schema_validation_command}
  - EXPECT: Schema validation passes without errors
  - RUN: {migration_command} (if applicable)
  - EXPECT: Data migrations applied successfully
  - CHECK: Data structure matches requirements
```

### Checkpoint 2: Core Logic
```
VALIDATE_CORE_LOGIC:
  - RUN: {type_check_command}
  - EXPECT: No type/compilation errors
  - RUN: {lint_command}
  - EXPECT: No linting errors
  - TEST: Core functionality with unit tests
```

### Checkpoint 3: Integration
```
VALIDATE_INTEGRATION:
  - RUN: {build_command}
  - EXPECT: Build succeeds without errors
  - TEST: Integration points work correctly
  - CHECK: External dependencies respond as expected
  - VERIFY: Configuration is properly loaded
```

### Checkpoint 4: User Interface (if applicable)
```
VALIDATE_UI:
  - RUN: {ui_build_command}
  - NAVIGATE: To new interface elements
  - TEST: User interactions work as expected
  - TEST: Data displays correctly
  - TEST: Error handling provides clear feedback
```

### Checkpoint 5: End-to-End
```
VALIDATE_E2E:
  - RUN: {quality_check_cmd}
  - EXPECT: All automated checks pass
  - TEST: Complete workflows from start to finish
  - TEST: Data persistence and consistency
  - VERIFY: Performance meets requirements
```

## Use Cases & Examples

### Example Data/Input
```{language}
// Example input data structure (simplified for pattern reference)
const example{Entity}Input = {
  // Describe expected input format and key fields
  // Reference project's standard data types and patterns
  // Example: { name: string, email: string, preferences: UserPrefs }
};

// Expected output structure (pattern description)
const expected{Entity}Output = {
  // Describe output format including generated fields
  // Reference project's response patterns and conventions
  // Example: { id: string, ...input, createdAt: Date, status: EntityStatus }
};
```

### Common Scenarios
1. **{Primary Use Case}**: {Description of main functionality}
2. **{Secondary Use Case}**: {Description of important alternative flow}
3. **{Edge Use Case}**: {Description of boundary condition}
4. **{Error Use Case}**: {Description of error handling scenario}

### Business Rules & Constraints
- **{Rule 1}**: {Description of business logic constraint}
- **{Rule 2}**: {Description of validation requirement}
- **{Rule 3}**: {Description of workflow constraint}

### Edge Cases & Error Scenarios
- **Invalid Input**: {Specific validation errors and responses}
- **Resource Conflicts**: {Concurrent access, uniqueness violations}
- **External Dependencies**: {Network failures, service unavailability}
- **Performance Limits**: {Large data sets, timeout scenarios}

## Troubleshooting Guide

### Common Issues by Technology

#### Build/Compilation Issues
```
PROBLEM: Build fails with {common_error_pattern}
SOLUTION: 
  - Check for {specific_check_1}
  - Verify {specific_check_2}
  - Ensure {specific_check_3}

PROBLEM: Dependency conflicts
SOLUTION:
  - Run {dependency_update_command}
  - Check {dependency_file} for version conflicts
  - Clear cache with {cache_clear_command}
```

#### Runtime Issues
```
PROBLEM: Application fails to start
SOLUTION:
  - Check {configuration_file} for correct settings
  - Verify {environment_variable} is set
  - Review logs in {log_location}

PROBLEM: Feature not working as expected
SOLUTION:
  - Test with minimal example
  - Check network/database connectivity
  - Verify input data format and types
```

#### Integration Issues
```
PROBLEM: External service integration fails
SOLUTION:
  - Verify API credentials and endpoints
  - Check network connectivity and firewalls
  - Test with {service_testing_tool}

PROBLEM: Data consistency issues
SOLUTION:
  - Check transaction boundaries
  - Verify concurrency handling
  - Test rollback scenarios
```

### Debug Commands
```bash
# Language/Framework specific debugging
{debug_command_1}        # e.g., verbose logging, debug mode
{debug_command_2}        # e.g., profiling, performance analysis
{debug_command_3}        # e.g., step debugging, breakpoints

# Infrastructure debugging
{infrastructure_debug_1} # e.g., database connection test
{infrastructure_debug_2} # e.g., network connectivity test
{infrastructure_debug_3} # e.g., service health checks
```

## Dependencies & Prerequisites

### Required Files/Components
- [ ] {Essential file 1}: `{path/to/file1}`
- [ ] {Essential file 2}: `{path/to/file2}`
- [ ] {Configuration file}: `{path/to/config}`

### Required Patterns/Conventions
- [ ] {Pattern 1}: {Description of required pattern}
- [ ] {Pattern 2}: {Description of architectural constraint}
- [ ] {Pattern 3}: {Description of coding standard}

### Environment Setup
- [ ] {Environment requirement 1}
- [ ] {Environment requirement 2}
- [ ] {Development tool requirement}
- [ ] {External service requirement}

---

## Task Completion Checklist

- [ ] All implementation phases completed according to plan
- [ ] All validation checkpoints passed successfully  
- [ ] Edge cases and error scenarios tested and handled
- [ ] Code follows established project conventions and patterns
- [ ] Tests written and passing (unit, integration, e2e as applicable)
- [ ] Documentation updated to reflect changes (if needed)
- [ ] No compilation, linting, or type errors
- [ ] Performance requirements met
- [ ] Security considerations addressed
- [ ] Code reviewed (if team process requires)

**Final Validation**: Run `{quality_check_cmd}` and ensure all automated checks pass.

---

## Template Usage Instructions

### How to Use This Template

1. **Copy this template** for each new task
2. **Fill in all placeholders** `{...}` with project-specific information
3. **Customize phases** based on your project's architecture
4. **Update validation commands** to match your build system
5. **Add project-specific patterns** and examples
6. **Remove irrelevant sections** (e.g., UI layer for backend-only tasks)

### Placeholder Reference

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{language}` | Programming language | typescript, python, go, java |
| `{framework}` | Main framework | React, FastAPI, Spring Boot |
| `{entity}` | Main entity/feature name | User, Product, Order |
| `{command}` | Shell command | npm run test, python manage.py test |
| `{path}` | File or directory path | src/components, api/routes |

### Adaptation Examples

**For a Python Django API task:**
- `{language}` → `python`
- `{build_command}` → `python manage.py check`
- `{test_command}` → `pytest`
- `{lint_command}` → `flake8 . && black --check .`

**For a Go microservice task:**
- `{language}` → `go`
- `{build_command}` → `go build ./...`
- `{test_command}` → `go test ./...`
- `{lint_command}` → `golangci-lint run`

**For a React frontend task:**
- `{language}` → `typescript`
- `{build_command}` → `npm run build`
- `{test_command}` → `npm test`
- `{lint_command}` → `npm run lint`