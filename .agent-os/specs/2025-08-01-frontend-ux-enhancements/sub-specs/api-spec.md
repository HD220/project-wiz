# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-08-01-frontend-ux-enhancements/spec.md

## Endpoints

### POST /api/dm/unarchive

**Purpose:** Restore an archived conversation to active status
**Parameters:** 
- `conversationId` (string): The ID of the conversation to unarchive
**Response:** 
```typescript
{
  success: boolean;
  conversation?: ConversationWithLastMessage;
  error?: string;
}
```
**Errors:** 
- `CONVERSATION_NOT_FOUND`: Conversation ID does not exist
- `CONVERSATION_NOT_ARCHIVED`: Conversation is not in archived state
- `UNAUTHORIZED`: User does not have permission to unarchive this conversation

### GET /api/messages/unread-count

**Purpose:** Get unread message count for conversations
**Parameters:**
- `conversationIds` (string[]): Array of conversation IDs to check
- `userId` (string): User ID to check unread status for
**Response:**
```typescript
{
  success: boolean;
  unreadCounts?: Record<string, number>; // conversationId -> unread count
  error?: string;
}
```
**Errors:**
- `INVALID_USER_ID`: User ID is invalid or not found
- `INVALID_CONVERSATION_IDS`: One or more conversation IDs are invalid

### POST /api/messages/mark-read

**Purpose:** Mark messages as read for a user in a conversation
**Parameters:**
- `conversationId` (string): The conversation ID
- `userId` (string): The user marking messages as read
- `upToMessageId` (string, optional): Mark all messages up to this ID as read
**Response:**
```typescript
{
  success: boolean;
  markedCount?: number; // Number of messages marked as read
  error?: string;
}
```
**Errors:**
- `CONVERSATION_NOT_FOUND`: Conversation does not exist
- `UNAUTHORIZED`: User does not have access to this conversation

### GET /api/projects/{projectId}/members

**Purpose:** Get real project members and agents
**Parameters:**
- `projectId` (string): The project ID to get members for
**Response:**
```typescript
{
  success: boolean;
  members?: Array<{
    id: string;
    name: string;
    avatar?: string;
    role: string;
    type: 'user' | 'agent';
    status: 'active' | 'inactive' | 'busy';
    lastActive?: Date;
  }>;
  error?: string;
}
```
**Errors:**
- `PROJECT_NOT_FOUND`: Project ID does not exist
- `UNAUTHORIZED`: User does not have access to this project

## Controllers

### DMController.unarchive
- **Action:** `unarchive`
- **Business Logic:** 
  - Validate conversation exists and is archived
  - Check user permissions for conversation
  - Update conversation `archivedAt` field to `null`
  - Return updated conversation data
- **Error Handling:** Comprehensive validation and permission checking

### MessageController.getUnreadCounts
- **Action:** `getUnreadCounts`
- **Business Logic:**
  - Query unread message counts per conversation for specified user
  - Use efficient database queries with proper indexes
  - Return aggregated unread counts by conversation
- **Error Handling:** Validate user permissions for each conversation

### MessageController.markAsRead
- **Action:** `markAsRead`
- **Business Logic:**
  - Insert or update read status records for user/conversation
  - Handle batch updates for performance
  - Update conversation-level read timestamps
- **Error Handling:** Handle concurrent read status updates gracefully

### ProjectController.getMembers
- **Action:** `getMembers`
- **Business Logic:**
  - Fetch actual project members from database
  - Include both human users and AI agents
  - Aggregate status information from multiple sources
  - Apply proper privacy and permission filters
- **Error Handling:** Handle missing member data gracefully with fallbacks

## Integration Points

- **Existing DM Service:** Extend current DM conversation management
- **Message Service:** Integrate with existing message querying and management
- **Project Service:** Connect with current project and team management
- **Event System:** Emit events for real-time UI updates
- **Authentication:** Use existing user authentication and authorization patterns