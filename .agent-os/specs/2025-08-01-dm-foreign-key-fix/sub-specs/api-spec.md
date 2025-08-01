# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-08-01-dm-foreign-key-fix/spec.md

## Endpoints

### IPC: dm:create (FIXED)

**Purpose:** Create a new DM conversation with proper participant validation
**Parameters:**
```typescript
{
  participantIds: string[]; // Array of user IDs to include in conversation
  name?: string; // Optional conversation name
}
```
**Response:**
```typescript
{
  success: boolean;
  conversation?: {
    id: string;
    name: string;
    participants: Array<{
      id: string;
      userId: string;
      // other participant fields
    }>;
    // other conversation fields
  };
  error?: {
    code: string;
    message: string;
    details?: {
      invalidParticipantIds?: string[];
      missingParticipantIds?: string[];
    };
  };
}
```
**Errors:**
- `INVALID_PARTICIPANT_IDS`: One or more participant IDs are not valid UUIDs
- `PARTICIPANTS_NOT_FOUND`: One or more participant IDs do not exist in users table
- `INSUFFICIENT_PARTICIPANTS`: Less than 2 participants provided for conversation
- `AUTHENTICATION_REQUIRED`: User is not authenticated
- `DATABASE_ERROR`: Unexpected database operation failure

## Controllers

### DMController.create (ENHANCED)

**Action:** `create`
**Business Logic:**
1. **Authentication Check**: Verify user is authenticated and get real user ID
2. **Input Validation**: Validate participantIds array format and UUID structure  
3. **Participant Validation**: Query database to ensure all participant IDs exist and are active
4. **Permission Check**: Verify authenticated user can create DMs with specified participants
5. **Transaction Execution**: Create conversation and participants in atomic transaction
6. **Response Formation**: Return complete conversation data or detailed error information

**Error Handling:**
- Validate authentication before any database operations
- Pre-validate all participant IDs exist in users table
- Catch and interpret foreign key constraint errors with specific messages
- Provide rollback behavior for failed transactions
- Log detailed error information for debugging

### Enhanced Validation Flow

```typescript
// New validation sequence in DMController.create
async create(input: CreateDMInput, authenticatedUserId: string) {
  // 1. Replace any placeholder IDs with real authenticated user ID
  const resolvedParticipantIds = input.participantIds.map(id => 
    id === 'current-user-id' ? authenticatedUserId : id
  );
  
  // 2. Validate UUID format for all participant IDs
  const invalidUUIDs = resolvedParticipantIds.filter(id => !isValidUUID(id));
  if (invalidUUIDs.length > 0) {
    throw new ValidationError('INVALID_PARTICIPANT_IDS', { invalidParticipantIds: invalidUUIDs });
  }
  
  // 3. Check all participants exist in database
  const existingUsers = await UserService.findByIds(resolvedParticipantIds);
  const existingUserIds = existingUsers.map(user => user.id);
  const missingUserIds = resolvedParticipantIds.filter(id => !existingUserIds.includes(id));
  
  if (missingUserIds.length > 0) {
    throw new ValidationError('PARTICIPANTS_NOT_FOUND', { missingParticipantIds: missingUserIds });
  }
  
  // 4. Proceed with database transaction only after validation passes
  return await this.createDMTransaction(input, resolvedParticipantIds);
}
```

## Integration Points

### Authentication Service Integration
- **Current User Resolution**: Replace "current-user-id" with actual authenticated user ID
- **Session Validation**: Ensure user session is valid before DM operations
- **Permission Checking**: Validate user can create DMs with specified participants

### User Service Integration  
- **Bulk User Validation**: Add method to validate multiple user IDs exist
- **Active User Filtering**: Only allow DMs with active users
- **User Permission Checking**: Verify privacy settings allow DM creation

### Database Service Integration
- **Transaction Management**: Proper atomic operations with rollback capability
- **Foreign Key Error Handling**: Catch and interpret constraint violations
- **Comprehensive Logging**: Track all database operations and failures

### IPC Handler Updates
- **Error Response Formatting**: Structured error responses with specific error codes
- **Authentication Context**: Proper user session extraction and validation
- **Input Sanitization**: Clean and validate all input parameters before processing