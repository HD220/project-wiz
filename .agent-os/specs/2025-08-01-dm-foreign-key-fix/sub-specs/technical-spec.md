# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-01-dm-foreign-key-fix/spec.md

## Technical Requirements

### Foreign Key Constraint Analysis
- Examine the `dm_participants` table schema and its foreign key relationships
- Identify which foreign key constraint is failing (likely `participant_id` → `users.id`)
- Analyze the database schema to understand the expected data flow and constraints
- Review current transaction isolation and rollback behavior

### User ID Resolution and Validation
- Replace "current-user-id" placeholder with actual authenticated user ID from session
- Implement pre-validation of all participant IDs before database transaction begins
- Add user existence checking query before attempting DM creation
- Ensure proper handling of user authentication context in DM creation flow

### Database Transaction Improvements
- Wrap entire DM creation process in proper database transaction with error handling
- Implement proper rollback behavior when foreign key constraints fail
- Add comprehensive logging for transaction steps and failure points
- Ensure atomic operations for conversation and participant creation

### Error Handling and Logging Enhancement
- Replace generic "FOREIGN KEY constraint failed" with specific error messages
- Log detailed information about which participant IDs are invalid
- Provide user-friendly error messages in API responses
- Add structured error responses with error codes for frontend handling

### DM Service Logic Updates
- Update DMService.create method to include participant validation step
- Modify IPC handler for dm:create to properly extract authenticated user ID
- Add input sanitization and validation before database operations
- Implement proper TypeScript typing for all participant ID parameters

### Authentication Integration
- Ensure DM creation properly accesses current user session
- Validate that authenticated user has permission to create DMs with specified participants
- Handle edge cases where user session might be invalid or expired during DM creation
- Add proper authentication middleware checks before DM operations

### Testing and Validation Requirements
- Add unit tests for participant ID validation logic
- Create integration tests for complete DM creation flow
- Test foreign key constraint scenarios with invalid participant IDs
- Verify proper error handling and transaction rollback behavior
- Test edge cases with missing users, inactive users, and authentication failures