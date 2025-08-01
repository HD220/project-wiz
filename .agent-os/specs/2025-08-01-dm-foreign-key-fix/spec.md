# Spec Requirements Document

> Spec: DM Creation Foreign Key Constraint Fix  
> Created: 2025-08-01
> Status: Planning

## Overview

Fix critical foreign key constraint violation occurring during DM conversation creation that prevents users from creating new direct message conversations. The error occurs when inserting DM participants due to invalid or non-existent user IDs, specifically the "current-user-id" placeholder being used instead of actual user IDs.

## User Stories

### DM Creation Failure Resolution

As a user, I want to create new direct message conversations successfully, so that I can start private conversations with other users and AI agents without encountering database errors.

**Current Broken Workflow**: User attempts to create DM → System tries to insert participants with invalid IDs → Foreign key constraint fails → User sees error and cannot create conversation.

**Fixed Workflow**: User attempts to create DM → System validates all participant IDs exist → System inserts conversation and participants successfully → User can immediately start messaging in new conversation.

### Robust User ID Validation

As a developer, I want the system to properly validate user IDs before database operations, so that foreign key constraints are never violated and users receive meaningful error messages for invalid operations.

**Workflow**: System receives DM creation request → System validates all participant IDs exist in users table → System provides clear error messages for invalid IDs → System only proceeds with database operations when all IDs are valid.

## Spec Scope

1. **Foreign Key Constraint Analysis** - Investigate the exact cause of the foreign key violation in DM participant insertion
2. **User ID Validation Logic** - Implement proper validation to ensure all participant IDs exist before database operations
3. **Placeholder ID Resolution** - Replace "current-user-id" placeholder with actual authenticated user ID
4. **Database Transaction Safety** - Ensure DM creation operations are properly wrapped in transactions with rollback capability
5. **Error Handling Improvement** - Provide meaningful error messages for invalid participant IDs or missing users

## Out of Scope

- Major DM conversation feature changes
- UI/UX improvements beyond error messaging
- Performance optimizations
- Migration of existing broken DM conversations
- Changes to foreign key constraint definitions

## Expected Deliverable

1. **Functional DM Creation** - Users can successfully create DM conversations with valid participant IDs without foreign key errors
2. **Proper ID Validation** - System validates all user IDs before attempting database operations
3. **Meaningful Error Messages** - Users receive clear feedback when attempting to create DMs with invalid participants
4. **Transaction Safety** - DM creation operations properly handle failures with appropriate rollback behavior