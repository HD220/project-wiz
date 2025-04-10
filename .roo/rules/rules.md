# Project Definitions and Accepted ADRs

This file consolidates the **core definitions, accepted architectural decisions (ADRs), conventions, and standards** for the project. It serves as the **single source of truth** for all modes and contributors.

---

## Accepted ADRs Summary

- **ADR-0001:** Formal process to record architectural decisions via ADRs.
- **ADR-0002:** Use of **shadcn-ui** as the UI component library.
- **ADR-0003:** **Do not use JSDoc** for code documentation.
- **ADR-0004:** Standardized structure for technical documentation.
- **ADR-0005:** Folder structure for Electron.
- **ADR-0008:** Naming conventions for **LLM services**.
- **ADR-0009:** Use of **TanStack Router** with **Drizzle ORM**.
- **ADR-0012:** Adopt **Clean Architecture** principles for LLM modules.
- **ADR-0013:** Refactor dashboard to support **dynamic data**.
- **ADR-0014:** Store conversation history using **SQLite + Drizzle**.
- **ADR-0015:** Use **kebab-case** naming for files and folders.
- **ADR-0016:** Efficient management of **streams** in LlmService requests.
- **ADR-0017:** Governance process for ADRs.
- **ADR-0018:** All source code, including variable names, function names, comments, and internal messages, **must be written in English**.

---

# General Principles for All Modes

- Communicate clearly, concisely, and objectively.
- Clarify ambiguities by asking questions before proceeding.
- Use available tools (`read_file`, `search_files`, etc.) to gather sufficient context.
- Document important decisions, assumptions, and reasoning.
- Justify your choices and suggest next steps when appropriate.
- Prioritize simplicity, maintainability, and alignment with the task scope.
- Follow clean code principles, security best practices, and project conventions.
- Keep issues and ADRs updated to reflect decisions and progress.
- Work **only** on what was explicitly requested; create issues for anything outside the scope.
- Facilitate collaboration by providing clear, actionable outputs.
- **Attention:** When creating a new task with `new_task`, **the current context information is NOT automatically shared**.
- Only what is **explicitly included in the `new_task` message** or **referenced via files/documents** will be available to the new task.
- Therefore, **always provide all necessary data explicitly in the `new_task` message** to ensure the new task has full context.

---

# CLEAN CODE PRINCIPLES

1. **Use descriptive names**
   - Variables should clearly reveal their purpose.
   - Functions should clearly describe what they do.
   - Avoid abbreviations and single-letter names.

2. **Keep functions small**
   - Each function should do only one thing.
   - Limit function size to less than 20 lines.
   - Minimize the number of parameters (maximum 3 or 4).
   - If a function exceeds 50 lines, create a `new_task` requesting refactoring.

3. **Follow SOLID principles**
   - **S**ingle Responsibility: one reason to change.
   - **O**pen/Closed: open for extension, closed for modification.
   - **L**iskov Substitution: subtypes should be substitutable.
   - **I**nterface Segregation: specific interfaces, not generic ones.
   - **D**ependency Inversion: depend on abstractions.

4. **Ensure code is testable**
   - Prefer pure functions.
   - Decouple components to facilitate testing.
   - Consider edge cases.

5. **Apply the DRY principle**
   - Extract repeated code into reusable functions.
   - Create utilities for common operations.
   - Avoid copy-pasting code.

---

# ADRs (Architecture Decision Records)

- **What they are:** Documents that record important architectural decisions, justifying choices and impacts.
- **Location:** Must be stored in the `docs/adr/` folder.
- **Naming convention:**
  - Name as `ADR-XXXX-Short-Description.md`, where `XXXX` is a 4-digit sequential number.
  - Example: `ADR-0007-Implement-TanStack-Router-Drizzle.md`
- **Best practices:**
  - Each ADR should be clear, objective, and contain context, decision, alternatives, and consequences.
  - Update or create new ADRs whenever a relevant architectural decision is made or changed.
  - Avoid duplicate IDs and maintain sequential order.

---

# ISSUES STRUCTURE

- **General organization:**

```plaintext
issues/
├── backlog/            # Items to be worked on in the future
│   └── [type]/         # bug, feature, improvement, documentation, etc.
├── working/            # Items in progress
│   └── [type]/         # bug, feature, improvement, etc.
│       └── ISSUE-XXXX-Short-Description/
│           ├── README.md        # Issue body, detailed description
│           ├── handoff.md       # Handoff documentation and progress
│           └── other files      # Attachments, images, documents
├── completed/          # Finished items
│   └── [type]/         # bug, feature, improvement, etc.
└── summary.md          # Overall status summary
```

- **Recommended flow:**
  - Create issues in the backlog, categorizing by type.
  - When starting work, move to `working`.
  - When finished, move to `completed`.
  - Always update `handoff.md` with progress, decisions, and next steps.
  - Keep `summary.md` synchronized with the overall status.

- **Best practices:**
  - Use clear and descriptive titles.
  - Provide as much detail as possible in `README.md`.
  - Document decisions, difficulties, and progress in `handoff.md`.
  - Attach relevant files to the issue folder.
  - Create specific issues for bugs, improvements, features, and documentation to facilitate tracking.

---

# Summary

- Work only on what was explicitly requested.
- Create issues for everything outside the scope.
- Document architectural decisions via ADRs.
- Keep issues organized and updated.
- Follow clean code principles to ensure quality and maintainability.