# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-07-31-critical-error-fixes/spec.md

## Technical Requirements

### Agent Creation Transaction Fix

- Investigate Drizzle ORM transaction functions in agent.service.ts
- Ensure transaction callbacks return values, not promises
- Implement proper async/await patterns within transactions
- Fix toast notifications to only show on actual errors

### Conversation Creation Error Handling

- Audit conversation creation flow in main process IPC handlers
- Implement proper try/catch blocks with standardized IpcResponse<T>
- Add error logging to identify root cause of unhandled rejections
- Ensure all promises are properly awaited or caught

### Modal Accessibility Implementation

- Import VisuallyHidden component from @radix-ui/react-visually-hidden
- Add DialogTitle wrapped in VisuallyHidden to all Dialog components
- Create standard pattern for modal titles that maintains UI while adding accessibility
- Update dialog.tsx component to provide proper title prop handling

### Error Pattern Audit

- Search codebase for similar transaction patterns that might have same issue
- Identify other areas where promises might not be properly handled
- Standardize error handling patterns across main process services
- Ensure consistent toast notification patterns

## Implementation Approach

1. **Database Layer**: Fix transaction functions to follow Drizzle ORM best practices
2. **IPC Layer**: Implement standardized error handling using existing IpcResponse pattern
3. **UI Layer**: Add accessibility compliance without changing visual design
4. **Logging**: Enhance error logging to distinguish between actual errors and false positives
