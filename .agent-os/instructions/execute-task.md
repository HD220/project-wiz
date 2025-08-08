---
description: Rules to execute a task and its sub-tasks using Agent OS
globs:
alwaysApply: false
version: 2.0
encoding: UTF-8
---

# Task Execution Rules

## Overview

Execute a specific task along with its sub-tasks systematically following development best practices.

<pre_flight_check>
  EXECUTE: @.agent-os/instructions/meta/pre-flight.md
</pre_flight_check>


<process_flow>

<step number="1" name="task_understanding">

### Step 1: Task Understanding

Read and analyze the given parent task and all its sub-tasks from tasks.md to gain complete understanding of what needs to be built.

<task_analysis>
  <read_from_tasks_md>
    - Parent task description
    - All sub-task descriptions
    - Task dependencies
    - Expected outcomes
  </read_from_tasks_md>
</task_analysis>

<instructions>
  ACTION: Read the specific parent task and all its sub-tasks
  ANALYZE: Full scope of implementation required
  UNDERSTAND: Dependencies and expected deliverables
  NOTE: Implementation requirements for each sub-task
</instructions>

</step>

<step number="2" name="technical_spec_review">

### Step 2: Technical Specification Review

Search and extract relevant sections from technical-spec.md to understand the technical implementation approach for this task.

<selective_reading>
  <search_technical_spec>
    FIND sections in technical-spec.md related to:
    - Current task functionality
    - Implementation approach for this feature
    - Integration requirements
    - Performance criteria
  </search_technical_spec>
</selective_reading>

<instructions>
  ACTION: Search technical-spec.md for task-relevant sections
  EXTRACT: Only implementation details for current task
  SKIP: Unrelated technical specifications
  FOCUS: Technical approach for this specific feature
</instructions>

</step>

<step number="3" subagent="context-fetcher" name="best_practices_review">

### Step 3: Best Practices Review

Use the context-fetcher subagent to retrieve relevant sections from @.agent-os/standards/best-practices.md that apply to the current task's technology stack and feature type.

<selective_reading>
  <search_best_practices>
    FIND sections relevant to:
    - Task's technology stack
    - Feature type being implemented
    - Development approaches needed
    - Code organization patterns
  </search_best_practices>
</selective_reading>

<instructions>
  ACTION: Use context-fetcher subagent
  REQUEST: "Find best practices sections relevant to:
            - Task's technology stack: [CURRENT_TECH]
            - Feature type: [CURRENT_FEATURE_TYPE]
            - Development approaches needed
            - Code organization patterns"
  PROCESS: Returned best practices
  APPLY: Relevant patterns to implementation
</instructions>

</step>

<step number="4" subagent="context-fetcher" name="code_style_review">

### Step 4: Code Style Review

Use the context-fetcher subagent to retrieve relevant code style rules from @.agent-os/standards/code-style.md for the languages and file types being used in this task.

<selective_reading>
  <search_code_style>
    FIND style rules for:
    - Languages used in this task
    - File types being modified
    - Component patterns being implemented
    - Code style guidelines
  </search_code_style>
</selective_reading>

<instructions>
  ACTION: Use context-fetcher subagent
  REQUEST: "Find code style rules for:
            - Languages: [LANGUAGES_IN_TASK]
            - File types: [FILE_TYPES_BEING_MODIFIED]
            - Component patterns: [PATTERNS_BEING_IMPLEMENTED]
            - Code style guidelines"
  PROCESS: Returned style rules
  APPLY: Relevant formatting and patterns
</instructions>

</step>

<step number="5" name="task_execution">

### Step 5: Task and Sub-task Execution

Execute the parent task and all sub-tasks in order following development best practices.

<typical_task_structure>
  <first_subtask>Setup [feature] structure</first_subtask>
  <middle_subtasks>Implementation steps</middle_subtasks>
  <final_subtask>Verify implementation complete</final_subtask>
</typical_task_structure>

<execution_order>
  <subtask_1_setup>
    IF sub-task 1 is "Setup [feature] structure":
      - Create necessary files and directories
      - Define interfaces and types
      - Set up basic structure
      - Mark sub-task 1 complete
  </subtask_1_setup>

  <middle_subtasks_implementation>
    FOR each implementation sub-task (2 through n-1):
      - Implement the specific functionality
      - Ensure TypeScript compliance
      - Follow established patterns and conventions
      - Refactor for code quality
      - Mark sub-task complete
  </middle_subtasks_implementation>

  <final_subtask_verification>
    IF final sub-task is "Verify implementation complete":
      - Review implementation against requirements
      - Run TypeScript type-check
      - Ensure all functionality works as expected
      - Mark final sub-task complete
  </final_subtask_verification>
</execution_order>

<implementation_management>
  <setup_phase>
    - Define structure in first sub-task
    - Create necessary files and interfaces
    - Establish foundation for implementation
  </setup_phase>
  <development_phase>
    - Build functionality incrementally
    - Maintain TypeScript compliance throughout
    - Follow established patterns and conventions
  </development_phase>
</implementation_management>

<instructions>
  ACTION: Execute sub-tasks in their defined order
  RECOGNIZE: First sub-task typically sets up structure
  IMPLEMENT: Middle sub-tasks build functionality
  VERIFY: Final sub-task ensures implementation complete
  UPDATE: Mark each sub-task complete as finished
</instructions>

</step>

<step number="6" name="type_check_verification">

### Step 6: TypeScript Type Check

Run npm run type-check to verify TypeScript compliance for the implemented task and fix any type errors.

<instructions>
  ACTION: Run npm run type-check
  VERIFY: All TypeScript types are correct for implemented code
  FIX: Any type errors related to the current task
  ENSURE: Type safety compliance before marking task complete
</instructions>

<type_check_process>
  <command>npm run type-check</command>
  <focus>errors related to current task implementation</focus>
  <fix_approach>
    - Review each type error in task-related files
    - Fix type mismatches and missing type definitions
    - Update interfaces for new functionality
    - Re-run until task-related type errors are resolved
  </fix_approach>
</type_check_process>

</step>

<step number="7" name="task_status_updates">

### Step 7: Task Status Updates

Update the tasks.md file immediately after completing each task to track progress.

<update_format>
  <completed>- [x] Task description</completed>
  <incomplete>- [ ] Task description</incomplete>
  <blocked>
    - [ ] Task description
    ⚠️ Blocking issue: [DESCRIPTION]
  </blocked>
</update_format>

<blocking_criteria>
  <attempts>maximum 3 different approaches</attempts>
  <action>document blocking issue</action>
  <emoji>⚠️</emoji>
</blocking_criteria>

<instructions>
  ACTION: Update tasks.md after each task completion
  MARK: [x] for completed items immediately
  DOCUMENT: Blocking issues with ⚠️ emoji
  LIMIT: 3 attempts before marking as blocked
</instructions>

</step>

</process_flow>