# AGENT INSTRUCTIONS FOR PROJECT WIZ

**Critical Note on Adherence to Standards:**

This document, along with the detailed Architectural Decision Records (ADRs) in `docs/reference/adrs/`, the `docs/reference/software-architecture.md` (in Portuguese), and the comprehensive `docs/developer/coding-standards.md` (in Portuguese), form the complete set of guidelines for Project Wiz development.

**A deep understanding, proactive adherence, and meticulous application of ALL defined standards are mandatory.** The goal is an exemplary codebase. Superficial or incomplete application of these standards will be considered inadequate. You are expected to actively consult all provided documentation to ensure your work aligns perfectly with these directives.

## 1. Project Overview

Project Wiz is an ElectronJS desktop application with a React frontend and a Node.js/TypeScript backend/core. Before starting ANY task, internalize these guidelines.

## 2. Core Architectural & Development Mandates

### 2.1. Clean Architecture

*   **Concept:** Code is organized into concentric layers (Domain, Application, Infrastructure) with a strict inward flow of dependencies.
*   **Primary Document:** For a complete understanding of the architecture, components, layers, technologies, and data flows, you **MUST** consult:
    *   `docs/reference/software-architecture.md` (Portuguese)

### 2.2. Foundational Design Principles

*   Strict adherence to **Clean Architecture** principles (details in `docs/reference/software-architecture.md`).
*   Full application of all 9 **Object Calisthenics** principles (refer to ADR-016 for specifics in Project Wiz).
*   Adherence to general design principles like **SOLID, DRY, KISS, YAGNI** (practical examples in `coding-standards.md`).
*   **Domain Layer Validation:** Entities and Value Objects self-validate using Zod. Use Cases rely on this internal validation. (Details in ADR-010).
*   **Standardized Use Case Response:** Use Cases use the `UseCaseWrapper` and return `IUseCaseResponse` for consistent output and error handling. (Details in ADR-008, ADR-012, ADR-014).

### 2.3. Master Coding Standards Document

*   **The SINGLE SOURCE OF TRUTH** for all specific coding rules, style, formatting, linting, naming conventions (including **universal kebab-case for ALL file and folder names in `src_refactored/`**), and technology-specific best practices (TypeScript, React, Electron, etc.) is:
    *   **➡️ `docs/developer/coding-standards.md` (Portuguese)**
*   **Mandatory Consultation:** Strict adherence to this document is required for all development. It supersedes any other style guidelines.

## 3. Key Technologies

Consult `package.json` and `docs/reference/software-architecture.md` (Portuguese) for the complete list. Key technologies include: TypeScript, Node.js, ElectronJS, React, Vite, Tailwind CSS, TanStack Router, LinguiJS, Zod, InversifyJS, SQLite, Drizzle ORM, AI SDK, Vitest. (See ADRs 015, 017-019, 023-027, 029).

## 4. Controlled Modifications (Dependencies, Configurations, Code Organization)

For new dependencies, significant configuration changes, or major structural code reorganizations:
*   **Formal ADR Process Required:**
    1.  Conduct prior analysis and research.
    2.  Create a new ADR in `docs/reference/adrs/` documenting the proposal.
    3.  Request user approval for the ADR.
    4.  Implement **only after** the ADR is approved.

## 5. Working with Legacy Code

*   Legacy code in `src/` and `src2/` is for consultation only. **DO NOT MODIFY.**
*   **ALL NEW CODE MUST BE IN `src_refactored/`.**
*   Adaptation of legacy code to `src_refactored/` must align with all new principles; rewriting is preferred.
*   Consult `docs/developer/adaptation-plan.md` (Portuguese) for refactoring guidance within `src_refactored/`.

## 6. Key Expectations for ALL Code Work (New & Modifications)

*   **Full ADR Adherence:** Strictly implement decisions from all relevant ADRs for your task.
*   **`software-architecture.md` Alignment:** Respect defined architectural layers and patterns.
*   **`coding-standards.md` Compliance:** This is paramount. Follow all rules within this document.
*   **Immutability:** Enforce for Entities (new instances on change) and VOs (ADR-010).
*   **Error Handling:** Use `CoreError` hierarchy; wrap external errors (ADR-014).
*   **Testing:** New/modified code requires new/updated tests (ADR-029).
*   **Security:** Apply all relevant security guidelines (ADR-030, ADR-023, ADR-024).
*   **Logging:** Use injected `ILogger`; no `console.*` (ADR-013).
*   **Naming & Casing:** Clear English names for identifiers. **Universal `kebab-case` for all file and folder names in `src_refactored/`** (ADR-028, ADR-027).
*   **Commits:** Small, atomic, semantic commit messages (ADR-028).

## 7. How to Interpret Standards & Use Documentation (Your Workflow)

1.  **This Document (`GEMINI.md`):** Your high-level agent-specific guide and starting point.
2.  **Architectural Decision Records (ADRs) (`docs/reference/adrs/*.md`):** The *'Why'* – formal decisions and rationale. Consult for specific standards.
3.  **`docs/reference/software-architecture.md` (Portuguese):** The *'Big Picture'* – overall architecture, layers, components.
4.  **`docs/developer/coding-standards.md` (Portuguese):** The *'How-To'* – your primary practical guide for implementation details, examples, and all specific coding rules.
5.  **`docs/developer/adaptation-plan.md` (Portuguese):** The *'Refactoring Guide'* for `src_refactored/`.
6.  **Workflow:**
    *   Understand task requirements.
    *   Review this document (`GEMINI.md`).
    *   Identify and thoroughly read relevant ADRs.
    *   Consult `software-architecture.md` for architectural context.
    *   **Crucially, consult `coding-standards.md` for detailed implementation guidance.**
    *   Implement and test rigorously according to ALL standards.
    *   **If anything is unclear or seems contradictory, DO NOT GUESS. Ask for clarification.**

Remember, the goal is to create an exemplary codebase. Think carefully about each design and implementation decision.
