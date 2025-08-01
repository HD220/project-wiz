# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-01-conversation-ui-fixes/spec.md

## Technical Requirements

- **Modal State Management**: Implement proper modal close and navigation on successful conversation creation using TanStack Router navigation
- **Real-time UI Updates**: Use TanStack Query mutations with optimistic updates for immediate message display
- **Input Field Management**: Clear message input and show sending states using controlled React state
- **Layout Constraints**: Apply CSS containment and overflow handling to sidebar conversation list
- **Avatar Consistency**: Ensure consistent avatar source and styling between conversation list and header components
- **Custom Scrolling**: Replace browser scroll with shadcn ScrollArea component in conversation view
- **Theme Consistency**: Apply consistent background colors using Tailwind CSS classes between sidebar and header
- **Indicator Positioning**: Fix CSS positioning and z-index for project selection indicators
- **Component Re-rendering**: Implement proper dependency arrays and state updates to trigger UI refreshes
- **Navigation Handling**: Use TanStack Router's navigate function for programmatic routing after conversation creation