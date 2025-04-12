# Mover utilitários genéricos de src/client/lib/utils.ts para src/shared/utils conforme Clean Architecture

## Description

The file `src/client/lib/utils.ts` contains generic utility functions that do not depend on UI, domain, or infrastructure layers. According to [ADR-0012 (Clean Architecture for LLM modules)](../../../docs/adr/ADR-0012-Clean-Architecture-LLM.md), these utilities should be moved to `src/shared/utils` to centralize reusable helpers and avoid cross-layer dependencies.

This improvement aims to:
- Ensure all generic, non-layer-specific utilities are located in `src/shared/utils`.
- Eliminate cross-layer dependencies and improve code organization.
- Align the project structure with Clean Architecture principles as defined in ADR-0012.

## Traceability

- **Project Rules:** See `.roo/rules/rules.md` (Clean Code Principles, Clean Architecture, folder structure, and separation of concerns).
- **ADR Reference:** [ADR-0012 - Clean Architecture for LLM modules](../../../docs/adr/ADR-0012-Clean-Architecture-LLM.md).

## Acceptance Criteria

- All generic utilities from `src/client/lib/utils.ts` are moved to `src/shared/utils`.
- No UI, domain, or infrastructure-specific logic remains in the shared utilities.
- All imports are updated accordingly.
- The change is documented in the issue handoff and summary.

## Type

improvement