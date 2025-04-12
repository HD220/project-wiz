# ISSUE-0201: Consolidate and Centralize Utility Functions (dates, helpers, error handling)

## Description

- Centralize utility functions such as `formatDate`, error handling, and helpers into single files (e.g., `src/client/lib/utils.ts`, `src/client/lib/handle-error.ts`).
- Remove duplicated logic from hooks and components, replacing local implementations with calls to the centralized utilities.
- Document all utility functions in English, following the project standard.
- Ensure adherence to Clean Code and Clean Architecture principles.
- Do not implement or modify anything related to tests.

## Justification

- Eliminate code duplication.
- Facilitate maintenance and evolution.
- Ensure standardization and clarity.

## Acceptance Criteria

- All date and helper utility functions are centralized.
- No duplicated logic in hooks or components.
- Utility functions are documented in English.
- Changes and decisions are recorded in the issue's `handoff.md`.