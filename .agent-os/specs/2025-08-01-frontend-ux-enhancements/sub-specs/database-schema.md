# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-08-01-frontend-ux-enhancements/spec.md

## Schema Analysis

### Current Message Schema Assessment
The existing `messagesTable` and `llmMessagesTable` schema needs to be evaluated for unread message tracking capabilities. Current schema may already support this through timestamps and user relationships.

### Potential Schema Changes

#### Option 1: Message Read Status Table (Recommended)
If comprehensive read status tracking is needed:

```sql
-- New table for tracking message read status per user
CREATE TABLE message_read_status (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(message_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_message_read_status_message_id ON message_read_status(message_id);
CREATE INDEX idx_message_read_status_user_id ON message_read_status(user_id);
CREATE INDEX idx_message_read_status_read_at ON message_read_status(read_at);
```

#### Option 2: Conversation Read Tracking (Simpler)
For simpler implementation using existing schema:

```sql
-- Add last_read_at to existing conversation participant relationships
-- This would require examining current conversation/DM schema structure
-- and potentially adding fields to track last read timestamp per user per conversation
```

### Migration Strategy

1. **Assessment Phase**: Examine current schema capabilities for read status tracking
2. **Minimal Changes**: Determine if existing timestamps can support unread logic
3. **Incremental Implementation**: Add schema changes only if current structure is insufficient
4. **Data Migration**: Ensure existing messages maintain consistent read status

### Schema Rationale

- **Foreign Key Constraints**: Maintain data integrity with CASCADE deletes
- **Composite Unique Index**: Prevent duplicate read status entries per user/message
- **Timestamp Tracking**: Enable read status history and analytics
- **Performance Indexes**: Optimize queries for unread message counts and status checks

The actual schema implementation should be determined after analyzing the current database structure and read status requirements.