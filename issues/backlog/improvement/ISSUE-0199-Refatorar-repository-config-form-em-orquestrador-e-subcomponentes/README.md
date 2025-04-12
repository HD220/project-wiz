# Refactor repository-config-form into orchestrator and subcomponents

## Description

- The original `RepositoryConfigForm` component violated clean code principles (over 100 lines, multiple responsibilities, prop drilling, code duplication).
- Refactored to extract:
  - `RepositoryUrlField` for the URL input.
  - `AutomationSwitch` for each automation block.
  - `useRepositoryAutomation` custom hook to centralize switch logic.
- Main component now orchestrates UI, is under 50 lines, and all interfaces/props are documented in English.
- Improved cohesion, modularity, and testability.
- No changes to tests.