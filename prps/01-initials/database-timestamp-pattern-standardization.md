# Database Timestamp Pattern Standardization

## Executive Summary

Standardize timestamp column definitions across all database models to use a single, consistent pattern. Currently, the codebase uses two different SQL timestamp patterns, creating unnecessary complexity and potential timezone issues.

## Context and Motivation

The database schema uses inconsistent timestamp patterns:

**Pattern A:** `sql\`CURRENT_TIMESTAMP\`` (used in 8+ files)

- Files: user.model.ts, auth.model.ts, project.model.ts, conversation.model.ts
- Standard SQL approach

**Pattern B:** `sql\`(strftime('%s', 'now'))\`` (used in 3+ files)

- Files: llm-provider.model.ts, agent.model.ts
- SQLite-specific Unix timestamp approach

This inconsistency creates confusion, makes date comparisons complex, and violates the CLAUDE.md principle of following established patterns.

## Scope

### Included:

- Audit all `*.model.ts` files for timestamp column definitions
- Choose single standard pattern (recommend `CURRENT_TIMESTAMP`)
- Generate database migration to update existing columns
- Update all model files to use consistent pattern
- Verify all timestamp-dependent queries work correctly

### Not Included:

- Changing existing timestamp data formats in database
- Frontend date handling changes
- Timezone localization features
- Historical data migration (focus on new schema consistency)

## Expected Impact

- **Users:** No direct impact - timestamps continue working as expected
- **Developers:**
  - Consistent pattern across all models
  - Simplified date/time queries and comparisons
  - Reduced cognitive load when working with timestamps
  - Easier database debugging and maintenance
- **System:**
  - Consistent timestamp handling across all tables
  - Simplified migration scripts for future timestamp changes

## Success Criteria

- All `*.model.ts` files use identical timestamp column pattern
- Database migration successfully updates existing schema
- All existing timestamp-dependent functionality works unchanged
- New models automatically follow standardized pattern
- Documentation updated to reflect timestamp standards
