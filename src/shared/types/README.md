# Shared Types Structure

This directory contains TypeScript type definitions shared between the main process and renderer process.

## Current Structure

### Core Types (Recommended)

- `message-core.types.ts` - Central message types
- `project-core.types.ts` - Core project types
- `agent-core.types.ts` - Core agent types
- `llm-provider-core.types.ts` - Core LLM provider types
- `user-core.types.ts` - Core user types

### Legacy Types (Backwards Compatibility)

- `common.ts` - Common utility types
- `auth.types.ts` - Authentication types
- `calendar.types.ts` - Calendar types
- `electron.types.ts` - Electron-specific types
- `page-info.types.ts` - Page information types
- `settings.types.ts` - Settings types

### Domain-Specific Types (Legacy)

- `domains/` - Domain-specific types (deprecated, use core types instead)

## Usage

```typescript
// Recommended - Use core types
import { BaseMessage, ChannelMessage } from "@/shared/types/message-core.types";
import { ProjectDto } from "@/shared/types/project-core.types";

// Also valid - Use central export
import { BaseMessage, ProjectDto } from "@/shared/types";
```

## Migration Notes

The types structure was simplified to follow "flat is better than nested" principle. Core types are now at the top level for better discoverability and maintenance.

Domain-specific types in the `domains/` directory are still available for backwards compatibility but should be gradually migrated to the core types.
