# Error Handling Migration Plan

This document maps all files that need to be updated to implement the standardized error handling patterns defined in `docs/developer/error-handling-patterns.md`.

## Overview

**Goal**: Standardize error handling across the entire application using generic helpers while maintaining type safety and improving user experience.

**Status**: 🔄 In Progress

---

## Phase 1: Create Helper Files ✅

| File                                        | Status      | Description                                        |
| ------------------------------------------- | ----------- | -------------------------------------------------- |
| `src/main/utils/ipc-handler.ts`             | ⏳ Pending  | Generic IPC handler wrapper with automatic logging |
| `src/renderer/lib/api-mutation.ts`          | ⏳ Pending  | Generic mutation hooks with toast handling         |
| `src/renderer/lib/route-loader.ts`          | ⏳ Pending  | Route loader helpers for IpcResponse unwrapping    |
| `docs/developer/error-handling-patterns.md` | ✅ Complete | Documentation and usage examples                   |

---

## Phase 2: Critical Backend Issues (Fix First)

### 2.1 Handler/Preload Mismatches 🚨 CRITICAL

**Problem**: Some handlers use different channel names than preload API expects.

| Handler File                                       | Issue                                                               | Fix Required                  |
| -------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------- |
| `src/main/features/agent/memory/memory.handler.ts` | Uses `agent-memory:store` but preload expects `agent-memory:create` | ✅ Rename channel             |
| `src/main/features/agent/memory/memory.handler.ts` | Missing `agent-memory:retrieve` handler                             | ⏳ Add handler                |
| `src/renderer/preload.ts`                          | Defines 10+ memory methods not implemented                          | ⏳ Remove unused or implement |

### 2.2 Authentication Parameter Cleanup

**Problem**: Manual `userId` parameters when session should be used.

| Handler                    | Current Signature                             | Fixed Signature                |
| -------------------------- | --------------------------------------------- | ------------------------------ |
| `llm-providers:list`       | `(userId: string) => ...`                     | `() => ...` (get from session) |
| `llm-providers:setDefault` | `(providerId: string, userId: string) => ...` | `(providerId: string) => ...`  |
| `llm-providers:getDefault` | `(userId: string) => ...`                     | `() => ...`                    |
| `profile:getTheme`         | `(userId: string) => ...`                     | `() => ...`                    |
| `profile:updateTheme`      | `(userId: string, theme: Theme) => ...`       | `(theme: Theme) => ...`        |

---

## Phase 3: Backend Handler Migration

### 3.1 High Priority Handlers (Core Functionality)

#### Authentication Handlers 🔥 HIGH

**File**: `src/main/features/auth/auth.handler.ts`

- [ ] `auth:register` - Migrate to `createIpcHandler`
- [ ] `auth:login` - Migrate to `createIpcHandler`
- [ ] `auth:getCurrentUser` - Migrate to `createIpcHandler`
- [ ] `auth:logout` - Migrate to `createIpcHandler`
- [ ] `auth:isLoggedIn` - Migrate to `createIpcHandler`
- [ ] `auth:getActiveSession` - Migrate to `createIpcHandler`
- [ ] `auth:getUserById` - Migrate to `createIpcHandler`

**Impact**: Core authentication system - affects all users

#### Agent Handlers 🔥 HIGH

**File**: `src/main/features/agent/agent.handler.ts`

- [ ] `agents:create` - Migrate + remove manual auth checks
- [ ] `agents:update` - Migrate + remove manual auth checks
- [ ] `agents:delete` - Migrate + remove manual auth checks
- [ ] `agents:list` - Migrate + fix filter parameter handling
- [ ] `agents:get` - Migrate to `createIpcHandler`
- [ ] `agents:getWithProvider` - Migrate to `createIpcHandler`
- [ ] `agents:updateStatus` - Migrate to `createIpcHandler`

**Impact**: Most frequently used CRUD operations

#### LLM Provider Handlers 🔥 HIGH

**File**: `src/main/features/agent/llm-provider/llm-provider.handler.ts`

- [ ] `llm-providers:create` - Migrate + remove manual auth checks
- [ ] `llm-providers:list` - Migrate + remove userId parameter
- [ ] `llm-providers:getById` - Migrate to `createIpcHandler`
- [ ] `llm-providers:update` - Migrate to `createIpcHandler`
- [ ] `llm-providers:delete` - Migrate to `createIpcHandler`
- [ ] `llm-providers:setDefault` - Migrate + remove userId parameter
- [ ] `llm-providers:getDefault` - Migrate + remove userId parameter

**Impact**: Core AI functionality

#### Conversation Handlers 🔥 HIGH

**File**: `src/main/features/conversation/conversation.handler.ts`

- [ ] `conversations:create` - Migrate + remove manual auth checks
- [ ] `conversations:getUserConversations` - Migrate + remove manual auth checks
- [ ] `messages:send` - Migrate + remove manual auth checks
- [ ] `messages:getConversationMessages` - Migrate + remove manual auth checks

**Impact**: Main chat functionality

### 3.2 Medium Priority Handlers

#### Project Handlers 🟡 MEDIUM

**File**: `src/main/features/project/project.handler.ts`

- [ ] `projects:create` - Migrate + remove manual auth checks
- [ ] `projects:findById` - Migrate to `createIpcHandler`
- [ ] `projects:listAll` - Migrate to `createIpcHandler`
- [ ] `projects:update` - Migrate to `createIpcHandler`
- [ ] `projects:archive` - Migrate to `createIpcHandler`

#### Memory Handlers 🟡 MEDIUM (Fix mismatches first)

**File**: `src/main/features/agent/memory/memory.handler.ts`

- [ ] Fix channel name: `agent-memory:store` → `agent-memory:create`
- [ ] Add missing `agent-memory:retrieve` handler
- [ ] `agent-memory:find-by-id` - Migrate to `createIpcHandler`
- [ ] `agent-memory:update` - Migrate to `createIpcHandler`
- [ ] `agent-memory:delete` - Migrate to `createIpcHandler`

### 3.3 Low Priority Handlers

#### User/Profile Handlers 🟢 LOW

**Files**: `src/main/features/user/user.handler.ts`, `src/main/features/user/profile.handler.ts`

- [ ] `user:listAvailableUsers` - Migrate + remove manual auth checks
- [ ] `profile:getTheme` - Migrate + remove userId parameter
- [ ] `profile:updateTheme` - Migrate + remove userId parameter

---

## Phase 4: Frontend Component Migration

### 4.1 High Priority Components (Frequent Mutations)

#### LLM Provider Form 🔥 HIGH

**File**: `src/renderer/features/llm-provider/components/provider-form.tsx`

- **Current**: `useMutation` with manual success/error handling
- **Target**: Replace with `useApiMutation`
- **Impact**: Provider creation/editing

#### Agent Components 🔥 HIGH

**Files**:

- `src/renderer/app/_authenticated/user/agents/new/index.tsx`
- `src/renderer/features/agent/components/agent-list.tsx`
- `src/renderer/app/_authenticated/user/agents/edit/$agentId/index.tsx`

**Changes**:

- [ ] Agent creation - Replace `useMutation` with `useApiMutation`
- [ ] Agent deletion - Replace `useMutation` with `useCrudMutation`
- [ ] Agent status toggle - Replace `useMutation` with `useApiMutation`
- [ ] Agent editing - Replace manual async/await with `useApiMutation`

#### Conversation Components 🔥 HIGH

**Files**:

- `src/renderer/features/conversation/components/create-conversation-dialog.tsx`
- `src/renderer/features/conversation/components/conversation-chat.tsx`

**Changes**:

- [ ] Conversation creation - Replace `useMutation` with `useApiMutation`
- [ ] Message sending - Replace `useMutation` with `useApiMutation`

### 4.2 Medium Priority Components

#### Provider Management 🟡 MEDIUM

**Files**:

- `src/renderer/features/llm-provider/components/provider-card.tsx`
- `src/renderer/app/_authenticated/user/settings/llm-providers/$providerId/edit/index.tsx`

**Changes**:

- [ ] Provider deletion - Replace `useMutation` with `useCrudMutation`
- [ ] Set default provider - Replace `useMutation` with `useApiMutation`
- [ ] Provider updates - Replace `useMutation` with `useApiMutation`

### 4.3 Low Priority Components

#### Project & Auth Forms 🟢 LOW

**Files**:

- `src/renderer/features/project/components/project-form.tsx`
- `src/renderer/features/auth/components/register-form.tsx`

**Changes**:

- [ ] Project creation - Replace manual async/await with `useApiMutation`
- [ ] User registration - Replace manual async/await with `useApiMutation`

---

## Phase 5: Route Loader Migration

### 5.1 High Priority Routes (Frequent Access)

#### Agent Routes 🔥 HIGH

**Files**:

- `src/renderer/app/_authenticated/user/agents/route.tsx`
- `src/renderer/app/_authenticated/user/agents/new/index.tsx`
- `src/renderer/app/_authenticated/user/agents/edit/$agentId/index.tsx`

**Changes**:

- [ ] Agent list with filters - Replace with `loadApiData`
- [ ] Provider list for new agent - Replace with `loadApiData`
- [ ] Agent + providers for edit - Replace with `loadApiDataParallel`

#### Provider Routes 🔥 HIGH

**File**: `src/renderer/app/_authenticated/user/settings/llm-providers/route.tsx`

- [ ] Provider list - Replace with `loadApiData`

### 5.2 Medium Priority Routes

#### Main App Routes 🟡 MEDIUM

**Files**:

- `src/renderer/app/_authenticated/route.tsx`
- `src/renderer/app/_authenticated/user/route.tsx`
- `src/renderer/app/_authenticated/project/$projectId/route.tsx`
- `src/renderer/app/_authenticated/user/dm/$conversationId/route.tsx`

**Changes**:

- [ ] Auth user check - Replace with `loadApiData`
- [ ] User data + conversations - Replace with `loadApiDataParallel`
- [ ] Project data - Replace with `loadApiData`
- [ ] Conversation + messages - Replace with `loadApiDataParallel`

### 5.3 Low Priority Routes

#### Settings & Project Routes 🟢 LOW

**Files**:

- `src/renderer/app/_authenticated/project/$projectId/index.tsx`
- `src/renderer/app/_authenticated/user/settings/llm-providers/$providerId/edit/index.tsx`

**Changes**:

- [ ] Project details - Replace with `loadApiData`
- [ ] Provider details - Replace with `loadApiData`

---

## Phase 6: Preload API Cleanup

### 6.1 Remove Unused Memory Methods

**File**: `src/renderer/preload.ts`

**Current unused methods** (defined but no handlers exist):

- [ ] `agentMemory.search`
- [ ] `agentMemory.getRecent`
- [ ] `agentMemory.getByConversation`
- [ ] `agentMemory.archive`
- [ ] `agentMemory.createRelation`
- [ ] `agentMemory.getRelated`
- [ ] `agentMemory.prune`
- [ ] `agentMemory.performMaintenance`
- [ ] `agentMemory.getStatistics`
- [ ] `agentMemory.runAutomatedMaintenance`

**Action**: Remove from preload or implement handlers if needed

### 6.2 Fix Method Name Mismatch

**File**: `src/renderer/preload.ts`

- [ ] Change `agentMemory.create` to match handler `agent-memory:store`
- [ ] OR change handler to match preload (preferred)

### 6.3 Update Window Types

**File**: `src/renderer/window.d.ts`

- [ ] Remove userId parameters from methods that will use session
- [ ] Update return types to match new handler signatures

---

## Migration Progress Tracking

### Backend Handlers

- [ ] **0/7** Authentication handlers migrated
- [ ] **0/7** Agent handlers migrated
- [ ] **0/7** LLM Provider handlers migrated
- [ ] **0/4** Conversation handlers migrated
- [ ] **0/5** Project handlers migrated
- [ ] **0/5** Memory handlers migrated
- [ ] **0/3** User/Profile handlers migrated

**Total Backend**: **0/38 handlers** migrated

### Frontend Components

- [ ] **0/6** High priority components migrated
- [ ] **0/3** Medium priority components migrated
- [ ] **0/2** Low priority components migrated

**Total Frontend**: **0/11 components** migrated

### Route Loaders

- [ ] **0/4** High priority routes migrated
- [ ] **0/4** Medium priority routes migrated
- [ ] **0/2** Low priority routes migrated

**Total Routes**: **0/10 routes** migrated

---

## Testing Strategy

After each migration:

1. **Unit Tests**: Ensure handler behavior unchanged
2. **Integration Tests**: Test frontend-backend communication
3. **Manual Testing**: Verify error messages and toast notifications
4. **Logging Verification**: Check logs for proper error reporting

---

## Rollback Plan

If issues arise:

1. **Incremental Migration**: Each file migrated individually
2. **Git History**: Easy to revert specific changes
3. **Backward Compatibility**: Old patterns work alongside new ones
4. **Feature Flags**: Can disable new helpers if needed

---

## Expected Benefits

After migration completion:

- ✅ **Consistent Error Logging**: All errors logged with context
- ✅ **Better User Experience**: Informative error messages via toast
- ✅ **Reduced Boilerplate**: ~70% less error handling code
- ✅ **Type Safety**: Full TypeScript inference maintained
- ✅ **Developer Experience**: Easier to add new features correctly
- ✅ **Maintainability**: Centralized error handling logic

---

## Risk Assessment

| Risk                    | Likelihood | Impact | Mitigation                         |
| ----------------------- | ---------- | ------ | ---------------------------------- |
| Breaking type inference | Low        | High   | Thorough testing of type examples  |
| Performance regression  | Very Low   | Medium | Helpers are compile-time only      |
| Developer adoption      | Medium     | Medium | Documentation + examples           |
| Complex edge cases      | Medium     | Low    | Gradual migration allows discovery |

---

## Next Steps

1. ✅ Create this migration plan
2. ⏳ Create helper files
3. ⏳ Start with authentication handlers (critical path)
4. ⏳ Migrate high-priority components
5. ⏳ Continue with systematic migration
6. ⏳ Update documentation and examples
7. ⏳ Final testing and validation
