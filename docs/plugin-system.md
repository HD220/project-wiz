# Plugin System Architecture

## Overview

Extensibility system for Project Wiz allowing:

- Dynamic loading of new LLM models
- UI/UX extensions
- Integration with external services

Key Benefits:
✅ Isolated execution
✅ Version management
✅ Hot reloading
✅ Execution timeout (5s)
✅ Permission control

## Technical Specification

### Plugin Interface

```typescript
interface Plugin {
  // Metadata
  name: string;
  version: string;
  description?: string;

  // Lifecycle methods
  init(config: PluginConfig): Promise<void>;
  register(registry: ServiceRegistry): Promise<void>;
  execute(method: string, params: unknown): Promise<unknown>;
  teardown(): Promise<void>;

  // Optional
  onError?(error: Error): void;
}
```

### Service Registry

```typescript
interface ServiceRegistry {
  getService<T>(name: string): T | undefined;
  registerService(name: string, service: unknown): void;
  requireService<T>(name: string): T;
}
```

### Manifest Format (plugin.json)

```json
{
  "$schema": "./plugin-schema.json",
  "name": "llama-extension",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "dependencies": {
    "required": ["llm-service@^2.0.0"],
    "optional": ["filesystem-access"]
  },
  "permissions": ["networking", "storage"],
  "capabilities": ["llm", "ui-extension"]
}
```

## Development Guide

### 1. Creating a New Plugin

```bash
npx create-project-wiz-plugin my-plugin
```

### 2. Project Structure

```
my-plugin/
├── src/
│   ├── index.ts      # Plugin entrypoint
│   └── services/     # Optional service implementations
├── tests/
├── plugin.json       # Manifest file
└── package.json
```

### 3. Implementation Example

```typescript
import { Plugin } from "project-wiz-plugin-sdk";

export default class MyPlugin implements Plugin {
  async init(config) {
    // Initialize resources
  }

  async register(registry) {
    registry.registerService("my-service", {
      async process(data) {
        return transform(data);
      },
    });
  }

  // ...other methods
}
```

## Examples

### 1. LLM Plugin

```typescript
class LlamaPlugin implements Plugin {
  private model: LlamaModel;

  async init() {
    this.model = await loadModel();
  }

  async execute(method, params) {
    switch (method) {
      case "generate":
        return this.model.generate(params.prompt);
      // ...other methods
    }
  }
}
```

### 2. UI Extension

```typescript
class ThemePlugin implements Plugin {
  async register(registry) {
    const uiService = registry.requireService<UIService>("ui");
    uiService.registerTheme({
      name: "midnight",
      colors: {
        /* ... */
      },
    });
  }
}
```

## Best Practices

- Isolate plugin business logic
- Handle errors gracefully
- Document public APIs
- Version compatibility
- Security considerations

### Security Features

1. **Execution Timeout**: All plugin operations automatically timeout after 5 seconds
2. **Worker Isolation**: Plugins run in dedicated worker threads
3. **Resource Limits**: Memory and CPU constraints (coming in v2.0)
