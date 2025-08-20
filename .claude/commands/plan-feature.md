---
allowed-tools: Glob(*), Grep(*), Read(*), LS(*), Bash(find:*), Bash(grep:*)
argument-hint: Descrição detalhada da feature a ser implementada
description: Planejamento completo de implementação de feature com análise de codebase
---

# ULTRATHINK - Feature Implementation Planning

## Feature Description

$ARGUMENTS

## Codebase Context

- Current directory structure: !`find src -type f -name "*.ts" -o -name "*.tsx" | head -20`
- Database schemas: !`find src/main/schemas -name "*.schema.ts" | xargs ls -la`
- Existing IPC handlers: !`find src/main/ipc -name "invoke.ts" | head -10`
- Current routes: !`find src/renderer/app/routes -name "*.tsx" | head -10`
- Shared types: !`find src/shared/types -name "*.ts" | head -10`

## Your ULTRATHINK Planning Workflow

### STEP 1: FEATURE UNDERSTANDING & CLARIFICATION

1. **Analyze the feature description** provided above
2. **Self-assess confidence level (0-10)** on understanding the requirements
   - If confidence < 8, **ASK CLARIFYING QUESTIONS** such as:
     - What specific user actions should trigger this feature?
     - What data needs to be displayed/collected?
     - Are there performance/scale requirements?
     - How should this integrate with existing features?
     - What are the success criteria?
3. **Extract core requirements** and list them clearly

### STEP 2: CODEBASE ANALYSIS & REFACTORING ASSESSMENT

1. **Search for similar patterns** in the existing codebase
2. **Identify potential code duplication** or opportunities for abstraction
3. **Check if this feature will create a "rule of 3"** (third repetition requiring abstraction)
4. **Assess need for refactoring** before implementation
5. **Follow CLAUDE.md guidelines** - verify compliance with project standards

### STEP 3: DATA FLOW & ARCHITECTURE DESIGN

Apply **YAGNI (You Aren't Gonna Need It)** and **KISS (Keep It Simple, Stupid)** principles:

1. **Define minimum viable data model**:
   - What entities/tables are ACTUALLY needed now?
   - What fields are REQUIRED vs nice-to-have?
   - What relationships are essential?

2. **Map data flow** (be specific):
   - User input → Validation → Storage
   - Database → API → UI display
   - What queries/mutations are needed?

3. **UI/UX considerations**:
   - What information must be displayed?
   - What user interactions are required?
   - How does it fit with existing UI patterns?

### STEP 4: IMPLEMENTATION BREAKDOWN

1. **Database changes** (if any):
   - Schema modifications
   - Migration requirements
   - Index considerations

2. **Backend implementation**:
   - IPC handlers needed
   - Business logic services
   - Authentication/authorization

3. **Frontend implementation**:
   - Components to create/modify
   - Hooks for state management
   - Routes and navigation

4. **Integration requirements**:
   - API calls structure
   - Form validations
   - Error handling

### STEP 5: FINAL IMPLEMENTATION PLAN

Present a **step-by-step implementation plan** that:

1. **Prioritizes simplicity** over premature optimization
2. **Follows existing code patterns** from the codebase
3. **Includes only what's needed now** (YAGNI principle)
4. **Maintains consistency** with CLAUDE.md standards
5. **Provides clear deliverables** for each step

## Critical Reminders

- **NO PREMATURE ABSTRACTION**: Only abstract when you have 3+ similar implementations
- **FOLLOW CLAUDE.md**: Strict adherence to project conventions
- **SIMPLE DATA MODEL**: Only fields that are actually used
- **INCREMENTAL APPROACH**: Build minimum viable feature first
- **CONSISTENT PATTERNS**: Follow existing codebase patterns

Now, begin your ULTRATHINK analysis and planning process.
