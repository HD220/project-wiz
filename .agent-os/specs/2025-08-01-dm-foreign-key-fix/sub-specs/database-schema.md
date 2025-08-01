# Database Schema Analysis

This is the database schema analysis for the spec detailed in @.agent-os/specs/2025-08-01-dm-foreign-key-fix/spec.md

## Current Schema Assessment

### Foreign Key Constraint Issue Analysis

Based on the error logs, the failure occurs in the `dm_participants` table insert operation:

```sql
insert into "dm_participants" (
  "id", "dm_conversation_id", "participant_id", "is_active", 
  "deactivated_at", "deactivated_by", "created_at", "updated_at"
) values (?, ?, ?, ?, null, null, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), 
         (?, ?, ?, ?, null, null, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
```

### Problem Identification

The error "FOREIGN KEY constraint failed" indicates that one of these foreign key references is invalid:

1. **`dm_conversation_id` → `dm_conversations.id`**: Likely valid since conversation was just created
2. **`participant_id` → `users.id`**: **MOST LIKELY ISSUE** - "current-user-id" is not a valid UUID in users table

### Expected Schema Structure

```sql
-- DM Conversations table (working correctly)
CREATE TABLE dm_conversations (
  id TEXT PRIMARY KEY,
  name TEXT,
  -- other fields...
  FOREIGN KEY constraints appear to be working
);

-- DM Participants table (failing constraint)
CREATE TABLE dm_participants (
  id TEXT PRIMARY KEY,
  dm_conversation_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  -- other fields...
  FOREIGN KEY (dm_conversation_id) REFERENCES dm_conversations(id),
  FOREIGN KEY (participant_id) REFERENCES users(id)  -- THIS IS FAILING
);

-- Users table (reference target)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT,
  -- other fields...
  -- "current-user-id" is NOT a valid ID in this table
);
```

### Root Cause Analysis

The logs show these participant IDs being inserted:
- `"current-user-id"` - **INVALID**: This is a placeholder string, not a real user UUID
- `"23100b51-f882-417e-813e-c7aa0119d270"` - **MAY BE VALID**: Proper UUID format, but needs verification

### Required Schema Validation

No schema changes are needed. The current foreign key constraints are working correctly and should be maintained. The issue is in the application logic that passes invalid IDs.

### Verification Queries Needed

```sql
-- Check if users exist before DM creation
SELECT id FROM users WHERE id IN ('current-user-id', '23100b51-f882-417e-813e-c7aa0119d270') AND is_active = 1;

-- Verify foreign key constraint definition
PRAGMA foreign_key_list(dm_participants);

-- Check current foreign key enforcement
PRAGMA foreign_keys;
```

### Database Integrity Protection

The foreign key constraints are working as designed and protecting data integrity. The fix should be in the application layer, not the database schema.

### Recommended Database Operations

1. **Pre-validation Query**: Always check user existence before DM creation
2. **Transaction Safety**: Maintain current transaction pattern but with proper ID validation
3. **Constraint Enforcement**: Keep foreign key constraints enabled for data integrity
4. **Error Handling**: Catch and interpret foreign key constraint errors properly