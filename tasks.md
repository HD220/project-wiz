Here is a detailed checklist of tasks based on the provided code audit report, organized by phases, functionalities, and layers, with a logical and sequential order, considering dependencies.

### Project Wiz Code Audit Remediation Checklist

**Overall Goal:** Reduce code complexity, improve maintainability, enhance security, and optimize developer experience.

---

#### **Phase 1: Critical Fixes & Immediate Impact (Weeks 1-2)**

This phase focuses on addressing critical issues, security vulnerabilities, and major code duplications with the highest business impact and quick wins.

**1. Security Vulnerability - Encryption Key (Critical)**

- [ ] Update `src/main/features/agent/llm-provider/llm-provider.service.ts` (lines 14-15) to remove the fallback for `ENCRYPTION_KEY`.
- [ ] Ensure `process.env["ENCRYPTION_KEY"]` is explicitly checked, and the application exits if it's not defined.

**2. Over-Engineered Memory System Simplification (Critical YAGNI Violation)**

- [ ] Refactor `src/main/features/agent/memory/memory.service.ts` to remove unnecessary complexity.
- [ ] Reduce `memory.service.ts` from 470+ lines to an estimated 50-100 lines.
- [ ] Implement a simplified `store` method in `SimplifiedMemoryService` for basic memory storage.
- [ ] Implement a simplified `retrieve` method in `SimplifiedMemoryService` to fetch memories ordered by creation date.
- [ ] Remove all unused relevance scoring factors (15+ factors) and complex algorithms (e.g., `calculateRelevanceScore`).
- [ ] Remove unused memory relation system (200+ lines).
- [ ] Remove auto-pruning functionality if not required.

**3. Duplicate Agent Chat Services Merging (Critical DRY Violation)**

- [ ] Merge `src/main/features/conversation/agent-chat.service.ts` and `src/main/features/conversation/agent-chat-with-memory.service.ts` into a single unified service.
- [ ] Create a single `AgentChatService` class.
- [ ] Implement a `generateResponse` method with an optional `useMemory` flag to conditionally include memory logic.
- [ ] Remove the redundant service file after merging.

**4. `useEffect` Violations for Form Loading (High Priority)**

- [ ] Review `src/renderer/features/agent/components/agent-form.tsx` (lines 75-79) and other files for `useEffect` violations related to form state management.
- [ ] Replace `useEffect` logic with `defaultValues` in `useForm` from `react-hook-form`.
- [ ] Apply this fix to all 6 identified instances of `useEffect` violations.

---

#### **Phase 2: Architectural & Consistency Improvements (Next Month)**

This phase focuses on standardizing patterns, improving code reusability, and optimizing database interactions.

**1. Generic CRUD Service Implementation (High Priority)**

- [ ] Create an abstract `CrudService` class to encapsulate common CRUD operations (`create`, `findById`, `update`, `delete`).
- [ ] Define abstract `table` property within `CrudService`.
- [ ] Refactor existing services (e.g., `ProjectService`) to extend `CrudService`.
- [ ] Eliminate ~75% of CRUD code duplication across services (identified as 8 instances).

**2. Centralized Constants File (Medium Priority)**

- [ ] Create a dedicated constants file (e.g., `constants/ai-defaults.ts`).
- [ ] Extract all "magic numbers" (e.g., `temperature: 0.7`, `maxTokens: 4000`, `daysSinceAccess / 30`) into named constants within this file.
- [ ] Replace hardcoded values with references to these constants in all 20+ identified instances.

**3. Authentication Middleware for IPC Handlers (Medium Priority)**

- [ ] Create a generic `withAuth` middleware function in `middleware/auth.ts`.
- [ ] Encapsulate the `AuthService.getActiveSession()` check within this middleware.
- [ ] Apply this `withAuth` middleware to all 8+ IPC handlers that currently duplicate authentication checks.

**4. N+1 Query Optimization for Conversations (Performance Improvement)**

- [ ] Refactor `src/main/features/conversation/conversation.service.ts` (lines 94-108).
- [ ] Replace the inefficient approach of fetching all messages and filtering in JavaScript.
- [ ] Implement SQL window functions (e.g., `ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ... DESC)`) to retrieve conversations with their latest message efficiently.

**5. Standardize Data Loading Patterns (DX Critical)**

- [ ] **API Layer:** Ensure all API calls are abstracted through dedicated API classes (e.g., `AgentAPI`).
- [ ] **TanStack Query Hooks:** Ensure all data fetching in renderer processes uses `useQuery` or similar TanStack Query hooks.
- [ ] **Component Usage:** Components should consume data solely from TanStack Query hooks, avoiding direct `window.api` calls.
- [ ] Migrate all identified mixed data loading patterns (direct `window.api` calls in loaders or `useQuery` functions) to the unified pattern.

**6. Frontend Feature Structure Completion (DX Critical)**

- [ ] Ensure all `renderer/features/` subdirectories (e.g., `project/`, `user/`) have a consistent structure including: `components/`, `api/`, `hooks/`, `store/` (if needed), `feature.queries.ts`, and `use-feature.hook.ts`.
- [ ] Populate currently empty directories (e.g., `renderer/store/`, `renderer/services/`, `project/components/`).

**7. Create Reusable Form Component Library (DX Critical)**

- [ ] Develop a reusable `JsonField` component or similar abstraction to handle repetitive and complex JSON field logic found in `src/renderer/features/agent/components/agent-form.tsx` (lines 259-284).
- [ ] Create a directory for reusable form components (e.g., `components/form/`).
- [ ] Abstract common form patterns like `model-config-field.tsx` and `provider-select-field.tsx`.

---

#### **Phase 3: Quality, Consistency & Documentation (Next 2-3 Months)**

This phase focuses on refining the codebase, ensuring consistency, and improving the overall developer experience through better tooling and documentation.

**1. Database Schema Improvements (Medium Priority)**

- [ ] Add `ownerId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE` to the `projects` table to establish project ownership.
- [ ] Standardize timestamp formats across all tables (e.g., consistently use `CURRENT_TIMESTAMP` or `(strftime('%s', 'now'))`).
- [ ] Add any missing performance indexes identified (though current indexing is strong).

**2. Logging Standardization (Medium Priority)**

- [ ] Replace all `console.log` statements (found in 20+ files) with a dedicated logger service.
- [ ] Implement structured logging for better traceability and analysis.
- [ ] Add performance metrics logging where appropriate.

**3. Type Organization and Import Consistency (Medium Priority)**

- [ ] Move all type definitions to dedicated `.types.ts` files within their respective features.
- [ ] Ensure consistent import patterns, importing types exclusively from `.types.ts` files.
- [ ] Remove type imports directly from service files (e.g., `import type { SendAgentMessageInput } from "@/main/features/conversation/agent-chat.service";` should become `from "@/main/features/conversation/conversation.types";`).

**4. API Documentation Generation (DX High Priority)**

- [ ] Implement an automated process (e.g., npm script) to generate documentation for `window.api` interfaces.

**5. Development Guidelines Enforcement (DX High Priority)**

- [ ] Implement ESLint rules to prevent direct `window.api` calls within components.
- [ ] Add ESLint rules for consistent file naming conventions.
- [ ] Update documentation (e.g., CLAUDE.md) to reflect and reinforce new architectural and coding guidelines.

**6. Developer Scaffolding Tools (DX High Priority)**

- [ ] Create npm scripts or CLI tools for generating new features (e.g., `npm run generate:feature [name]`).
- [ ] Create tools for generating new components within existing features (e.g., `npm run generate:component [feature]/[name]`).

---

#### **Phase 4: Ongoing Maintenance & Automation (Backlog/Continuous Improvement)**

This phase involves implementing advanced features, performance monitoring, and automating code quality checks.

**1. Advanced Memory Features (Low Priority/On-Demand)**

- [ ] Implement complex relevance scoring, memory relations, and auto-pruning algorithms _only when specific requirements arise_.

**2. Comprehensive Performance Monitoring (Low Priority)**

- [ ] Add IPC performance logging.
- [ ] Implement database query performance tracking.
- [ ] Set up memory usage monitoring.

**3. Code Quality Automation (Low Priority)**

- [ ] Integrate SonarQube or CodeClimate for continuous code quality tracking and technical debt monitoring.
- [ ] Implement Git hooks for pre-commit or pre-push quality checks (e.g., linting, type checking).
- [ ] Set up automated technical debt tracking and reporting.

**4. Testing (General - Ongoing)**

- [ ] Work towards increasing test coverage to >80% for all critical components and features.

---

#### **General Code Clean-up & Refinement (Ongoing)**

- [ ] Remove commented-out code segments.
- [ ] Standardize error messages (consistency in language and context).
