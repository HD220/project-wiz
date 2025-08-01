# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-01-frontend-ux-enhancements/spec.md

## Technical Requirements

### Conversation Unarchive Implementation
- Add `unarchive` API method to DM handler in main process (similar to existing `archive` method)
- Implement database update to set `archivedAt` field to `null` for conversation restoration
- Update `ConversationListItem` component to call unarchive API with proper error handling
- Add loading state management during unarchive operation
- Implement optimistic UI updates with rollback on failure

### Unread Message Logic
- Extend message database schema to track read status per user (if not already present)
- Implement `markAsRead` functionality when user opens conversation
- Add unread count calculation service method in MessageService
- Update conversation queries to include unread message counts
- Add visual indicators (dots, badges) to conversation list items for unread status
- Implement real-time unread status updates via existing event system

### Real Project Data Integration
- Identify all mock data usage in project-related components
- Update ProjectService to fetch actual project members from database
- Replace mock avatar URLs with real user avatar data or proper fallbacks
- Update member status indicators to use real agent/user status from database
- Ensure proper error handling for missing or unavailable member data

### Notification System Enhancement
- Extend EventBus integration to project sidebar components
- Implement notification aggregation logic for conversation updates
- Add visual notification indicators (badges, highlights) to project sidebar
- Integrate with existing agent status change events
- Implement notification dismissal and management functionality

### UI/UX Technical Details
- Follow existing shadcn/ui component patterns for all new UI elements
- Implement proper loading states using existing Button and UI component variants
- Add proper accessibility attributes for screen readers
- Use existing CSS custom properties for consistent spacing and colors
- Implement proper TypeScript typing for all new interfaces and API calls

### Error Handling and Performance
- Add comprehensive error boundaries for all new functionality
- Implement proper retry logic for failed API operations
- Use TanStack Query for caching and real-time data synchronization
- Add debouncing for real-time updates to prevent excessive re-renders
- Implement proper cleanup for event listeners and subscriptions