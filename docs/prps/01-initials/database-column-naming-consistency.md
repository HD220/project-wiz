# Database Column Naming Consistency

## Executive Summary

Standardize database column naming to use consistent snake_case convention across all tables. Currently, there's a mixed pattern where most columns use snake_case but some use camelCase, creating query complexity and violating naming conventions.

## Context and Motivation

Database schema analysis reveals naming inconsistency:

**✅ Correct Pattern (majority):**

- `created_at`, `updated_at`, `user_id`, `project_id`
- Used in: users, projects, agents, llm_providers, conversations

**❌ Inconsistent Pattern:**

- `agentId` in `src/main/features/conversation/conversation.model.ts:16`
- Breaks snake_case convention established in CLAUDE.md
- Creates confusion in query writing

**Problems Created:**

- Developers must remember which tables use which naming pattern
- Query complexity when joining tables with different conventions
- Violates established database naming standards
- Makes ORM queries less predictable

## Scope

### Included:

- Audit all `*.model.ts` files for column naming patterns
- Create database migration to rename inconsistent columns
- Update all TypeScript types and interfaces affected by column changes
- Update service layer queries that reference renamed columns
- Verify all existing functionality works with new column names

### Not Included:

- Changing established snake_case columns that are already correct
- Frontend property name changes (TypeScript types will handle mapping)
- API response format changes (maintain existing API contracts)

## Expected Impact

- **Users:** No direct impact - all functionality preserved through proper migration
- **Developers:**
  - Consistent naming convention across entire database
  - Predictable column names following established patterns
  - Simplified query writing and debugging
  - Reduced cognitive load when working with database
- **System:**
  - Consistent database schema following naming standards
  - Improved maintainability of database-related code

## Success Criteria

- All database columns follow snake_case convention consistently
- Database migration successfully renames inconsistent columns
- All service layer queries updated to use new column names
- TypeScript types properly reflect new column names
- All existing functionality works unchanged after migration
