# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-01-project-creation-defaults/spec.md

## Technical Requirements

### Database Schema Analysis

**Current Project Creation Flow:**
- Projects created via `ProjectService.create()` 
- Channels created separately via `ProjectChannelService.create()`
- Project members managed via `project_members` table
- Channel members managed via `project_channel_members` table

**Required Schema Extensions:**
- No new tables needed
- Utilize existing foreign key relationships
- Ensure proper cascade behavior for member assignments

### 1. Enhanced Project Creation Service

**ProjectService.create() Enhancement:**
```typescript
interface CreateProjectWithDefaults {
  // Existing project data
  name: string;
  description?: string;
  userId: string; // Creating user
  
  // New automatic behaviors
  createGeneralChannel: boolean; // Always true
  addUserAsMember: boolean; // Always true  
  addDefaultAgent: boolean; // True if user has default agent
}
```

**Transaction-based Creation Process:**
1. Create project record
2. Add user as project member
3. Create "general" channel
4. Add user as general channel member
5. Identify and add default agent (if exists)
6. Add default agent as general channel member

### 2. Default Agent Identification

**Agent Selection Logic:**
- Query user's agents ordered by creation date (oldest first)
- Select first active agent as default
- Alternative: Add `isDefault` flag to agent table for explicit selection

**Default Agent Query:**
```typescript
const defaultAgent = await AgentService.getDefaultAgentForUser(userId);
// OR fallback to first active agent
const firstAgent = await AgentService.getFirstActiveAgentForUser(userId);
```

### 3. Atomic Transaction Implementation

**Database Transaction Structure:**
```typescript
await db.transaction(async (tx) => {
  // 1. Create project
  const project = await ProjectService.createInTransaction(tx, projectData);
  
  // 2. Add user as project member
  await ProjectMemberService.addInTransaction(tx, project.id, userId, 'owner');
  
  // 3. Create general channel
  const generalChannel = await ProjectChannelService.createInTransaction(tx, {
    projectId: project.id,
    name: 'general',
    description: 'General project discussion',
    isDefault: true
  });
  
  // 4. Add user as channel member  
  await ProjectChannelMemberService.addInTransaction(tx, generalChannel.id, userId);
  
  // 5. Handle default agent
  const defaultAgent = await AgentService.getDefaultAgentForUser(userId);
  if (defaultAgent) {
    await ProjectMemberService.addInTransaction(tx, project.id, defaultAgent.userId, 'agent');
    await ProjectChannelMemberService.addInTransaction(tx, generalChannel.id, defaultAgent.userId);
  }
  
  return { project, generalChannel, defaultAgent };
});
```

### 4. Service Layer Modifications

**Required Service Updates:**

**ProjectService:**
- Modify `create()` method to handle complete project setup
- Add transaction support for atomic operations
- Include member and channel creation in single service call

**ProjectChannelService:** 
- Add `createInTransaction()` method for atomic channel creation
- Support default channel metadata (isDefault flag)

**ProjectMemberService & ProjectChannelMemberService:**
- Add `addInTransaction()` methods for atomic member assignment
- Ensure proper error handling for constraint violations

### 5. Error Handling Strategy

**Transaction Rollback Scenarios:**
- Foreign key constraint violations
- Duplicate member assignments
- Channel creation failures
- Agent availability issues

**Error Recovery:**
- Complete transaction rollback on any failure
- Detailed error logging for debugging
- User-friendly error messages for UI display

### 6. Performance Considerations

**Optimization Strategies:**
- Single database transaction reduces round trips
- Batch member assignments where possible
- Lazy loading of agent data only when needed
- Index optimization on foreign key columns

**Memory Management:**
- Minimal data loading during transaction
- Immediate cleanup of temporary objects
- Efficient query patterns to reduce database load

### 7. Frontend Integration Requirements

**IPC Handler Updates:**
- Modify `projects:create` handler to return complete project structure
- Include general channel data in creation response
- Return member assignment status for UI updates

**Frontend Response Structure:**
```typescript
interface ProjectCreationResponse {
  project: Project;
  generalChannel: ProjectChannel;
  userMembership: ProjectMember;
  agentMembership?: ProjectMember;
  channelMemberships: ProjectChannelMember[];
}
```

### 8. Testing Requirements

**Unit Test Coverage:**
- Transaction rollback scenarios
- Default agent identification logic
- Member assignment validation
- Channel creation with proper relationships

**Integration Test Scenarios:**
- Complete project creation flow
- Agent assignment edge cases (no agents, multiple agents)
- Concurrent project creation stress testing
- Database constraint validation