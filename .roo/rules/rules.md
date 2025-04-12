# Project General Rules and Governance

This document consolidates the core definitions, accepted architectural decisions (ADRs), governance decisions (GDRs), standards (SDRs), conventions, and rules for the project. It is the single source of truth for all contributors and modes.

---

## 1. Prohibited Actions (All Modes)

- Do not implement features, code, or documentation that was not explicitly requested.
- Do not bypass the ADR process for architectural changes.
- Do not change project scope or requirements without Product Owner approval.
- Do not use JSDoc for code documentation (see SDR-0002).
- Do not use languages other than English for code, comments, or internal messages (see SDR-0001).
- Do not modify files or areas outside your mode's explicit permissions.

---

## 2. Collaboration and Handoffs

- Always transfer tasks to the appropriate mode when a decision, implementation, or documentation is outside your scope.
- Provide all necessary context and documentation in handoff files (`handoff.md`) and issue descriptions.
- Use clear, concise, and objective language in all communications.
- Keep ADRs, issues, and documentation updated to reflect decisions and progress.
- **When an issue is completed, the responsible mode MUST move the entire issue folder from backlog or working to the appropriate issues/completed/[type]/ directory, preserving all documentation and history.**
- **This movement MUST be documented in the handoff.md of the issue, including date, responsible, action, and justification.**
- **A delivery is only considered complete after the issue has been moved to completed and the handoff.md updated.**

---

## 3. Accepted Architecture Decisions (ADRs)

- **ADR-0001:** Formal process to record architectural decisions via ADRs.
- **ADR-0002:** Use of shadcn-ui as the UI component library.
- **ADR-0004:** Standardized structure for technical documentation.
- **ADR-0005:** Folder structure for Electron.
- **ADR-0008:** Naming conventions for LLM services.
- **ADR-0009:** Use of TanStack Router with Drizzle ORM.
- **ADR-0012:** Adopt Clean Architecture principles for LLM modules.
- **ADR-0013:** Refactor dashboard to support dynamic data.
- **ADR-0014:** Store conversation history using SQLite + Drizzle.
- **ADR-0015:** Use kebab-case naming for files and folders.
- **ADR-0016:** Efficient management of streams in LlmService requests.

---

## 4. Accepted Governance Decisions (GDRs)

- **GDR-0001:** Governance process for ADRs.

---

## 5. Accepted Standards Decisions (SDRs)

- **SDR-0001:** All source code, including variable names, function names, comments, and internal messages, must be written in English.
- **SDR-0002:** Do not use JSDoc for code documentation.

---

## 6. General Principles for All Modes

- Communicate clearly, concisely, and objectively.
- Clarify ambiguities by asking questions before proceeding.
- Use available tools (`read_file`, `search_files`, etc.) to gather sufficient context.
- Document important decisions, assumptions, and reasoning.
- Justify your choices and suggest next steps when appropriate.
- Prioritize simplicity, maintainability, and alignment with the task scope.
- Follow clean code principles, security best practices, and project conventions.
- Keep issues and ADRs updated to reflect decisions and progress.
- Work only on what was explicitly requested; create issues for anything outside the scope.
- Facilitate collaboration by providing clear, actionable outputs.
- When searching for an issue or defining the next numbering, ALWAYS filter at the root of the issues folder.
- When creating a new task with `new_task`, the current context information is NOT automatically shared. Always provide all necessary data explicitly in the `new_task` message.

---

## 7. Clean Code Principles

1. **Use descriptive names**
   - Variables should clearly reveal their purpose.
   - Functions should clearly describe what they do.
   - Avoid abbreviations and single-letter names.

2. **Keep functions small**
   - Each function should do only one thing.
   - Limit function size to less than 20 lines.
   - Minimize the number of parameters (maximum 3 or 4).
   - Limit function 50 lines.

3. **Follow SOLID principles**
   - Single Responsibility: one reason to change.
   - Open/Closed: open for extension, closed for modification.
   - Liskov Substitution: subtypes should be substitutable.
   - Interface Segregation: specific interfaces, not generic ones.
   - Dependency Inversion: depend on abstractions.

4. **Ensure code is testable**
   - Prefer pure functions.
   - Decouple components to facilitate testing.
   - Consider edge cases.

5. **Apply the DRY principle**
   - Extract repeated code into reusable functions.
   - Create utilities for common operations.
   - Avoid copy-pasting code.

---

## 8. ADRs (Architecture Decision Records)

- **What they are:** Documents that record important architectural decisions, justifying choices and impacts.
- **Location:** Must be stored in the `docs/adr/` folder.
- **Naming convention:** Name as `ADR-XXXX-Short-Description.md`, where `XXXX` is a 4-digit sequential number (e.g., `ADR-0007-Implement-TanStack-Router-Drizzle.md`).
- **Best practices:** Each ADR should be clear, objective, and contain context, decision, alternatives, and consequences. Update or create new ADRs whenever a relevant architectural decision is made or changed. Avoid duplicate IDs and maintain sequential order.

---

## 9. Issues Structure

- **General organization:**
  ```
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
  - **A delivery is only considered complete after the issue has been moved to completed and the handoff.md updated.**
  - Keep `summary.md` synchronized with the overall status.

- **Best practices:**
  - Use clear and descriptive titles.
  - Provide as much detail as possible in `README.md`.
  - Document decisions, difficulties, and progress in `handoff.md`.
  - Attach relevant files to the issue folder.
  - Create specific issues for bugs, improvements, features, and documentation to facilitate tracking.

---

## 10. Tool Usage Best Practices

- Use ";" for multiple commands inline when using the command tool.
- If other tools fail, try using write_file as a fallback.

---

## 11. Glossary

- **ADR:** Architecture Decision Record
- **GDR:** Governance Decision Record
- **SDR:** Standards Decision Record
- **Backlog:** List of tasks/features to be worked on in the future
- **Handoff:** Documentation of progress and next steps when transferring a task
- **Scope:** The explicit boundaries of what is to be delivered or decided

---

## 12. Summary

- Work only on what was explicitly requested.
- Create issues for everything outside the scope.
- Document architectural decisions via ADRs.
- Keep issues organized and updated.
- Follow clean code principles to ensure quality and maintainability.