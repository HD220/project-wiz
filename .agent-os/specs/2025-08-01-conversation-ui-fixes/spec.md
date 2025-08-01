# Spec Requirements Document

> Spec: Conversation UI Fixes
> Created: 2025-08-01
> Status: Planning

## Overview

Fix critical UI/UX issues in the conversation interface that prevent proper workflow and create frustrating user experience. These fixes address modal behavior, real-time updates, layout overflow, avatar consistency, scrolling, and visual styling issues.

## User Stories

### Conversation Creation Flow
As a user, I want to create a new conversation and be immediately redirected to it with the modal automatically closing, so that I can start chatting without manual intervention.

The current workflow fails when a conversation is successfully created - the modal remains open, the sidebar doesn't update, and users aren't redirected to the new conversation. Only when manually closing the modal does the sidebar refresh, breaking the expected flow.

### Real-time Chat Updates
As a user, I want my messages to appear immediately after sending them with proper UI feedback, so that I can have a natural conversation experience.

Currently, after typing and sending messages, the interface doesn't update to show the sent message, doesn't clear the input field, and doesn't show sending status. Users must click elsewhere or change screens to see their messages appear.

### Sidebar Layout Stability
As a user, I want the conversation list to remain stable and accessible regardless of message length, so that I can always create new conversations and navigate existing ones.

When the last message in a conversation is very long, the sidebar expands beyond its bounds, hiding the conversation list and pushing the "new conversation" button out of the clickable area.

## Spec Scope

1. **Modal Auto-close** - Automatically close conversation creation modal on success and redirect to new conversation
2. **Real-time Message Updates** - Show sent messages immediately with proper input clearing and sending indicators
3. **Sidebar Layout Constraints** - Prevent conversation list overflow and maintain button accessibility
4. **Avatar Consistency** - Ensure consistent avatar display between conversation list and conversation header
5. **Custom Scrolling** - Replace browser scroll with shadcn scroll components in conversation view
6. **Header Styling** - Match conversation header background color with sidebar theme
7. **Project Selection Indicator** - Fix truncated project selection indicators

## Out of Scope

- Performance optimizations for large conversation lists
- Advanced message formatting or rich text features
- Notification systems for new messages
- Keyboard shortcuts for navigation

## Expected Deliverable

1. Conversation creation modal closes automatically and redirects to new conversation
2. Messages appear immediately after sending with proper UI feedback
3. Sidebar maintains stable layout regardless of message content length
4. Consistent avatar display across all conversation interfaces
5. Smooth custom scrolling in conversation views
6. Consistent visual styling between sidebar and conversation header
7. Fully visible project selection indicators