# Build System and Directory Structure Specification

This specification details the build system configuration and directory structure for the three-process architecture.

## Directory Structure

```
src/
├── main/               # Electron main process (existing)
│   ├── features/
│   ├── database/
│   ├── utils/
│   ├── workers/        # Worker management (new)
│   └── main.ts
├── renderer/           # UI process (existing)
│   ├── app/
│   ├── components/
│   └── ...
└── worker/             # Job processing worker (new - same structure as main)
    ├── features/
    │   └── llm-jobs/
    │       ├── llm-jobs.model.ts
    │       ├── llm-jobs.service.ts
    │       └── llm-jobs.types.ts
    ├── database/
    │   ├── connection.ts         # Same pattern as main
    │   └── index.ts
    ├── utils/
    └── worker.ts                 # Worker entry point
```

## Build Configuration Files

### vite.worker.config.mts

Seguindo o mesmo padrão do `vite.main.config.mts`:

```typescript
import { defineConfig } from "vite";

export default defineConfig({
  // Same pattern as vite.main.config.mts
});
```

### forge.config.cts Updates

Worker configurado como plugin, mesmo padrão do renderer:

```typescript
// Update existing forge.config.cts - add worker plugin
plugins: [
  // existing plugins...
  {
    name: "@electron-forge/plugin-vite",
    config: {
      build: [
        // existing main config...
        {
          entry: "src/worker/worker.ts",
          config: "vite.worker.config.mts",
          target: "worker",
        },
      ],
    },
  },
];
```

## TypeScript Configuration

Worker usa o mesmo `tsconfig.json` compartilhado, como main e renderer já fazem.

## Database Connection

### Worker Database Connection

```typescript
// src/worker/database/connection.ts - Same pattern as main
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

const sqlite = new Database("project-wiz.db");
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite); // No schema option, same as main
```

### Model Definition

```typescript
// src/worker/features/llm-jobs/llm-jobs.model.ts - Same pattern as main features
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const llmJobsTable = sqliteTable("llm_jobs", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  data: text("data").notNull(),
  status: text("status", {
    enum: ["waiting", "active", "completed", "failed", "delayed", "paused"],
  }).default("waiting"),
  // ... rest of job queue schema
});
```

## Process Spawning

### Main Process Worker Spawning

```typescript
// src/main/workers/worker-manager.ts
import { utilityProcess } from "electron";
import { join } from "path";

export class WorkerManager {
  private workerProcess: Electron.UtilityProcess | null = null;

  startWorker() {
    const workerPath = join(__dirname, "../worker/worker.js");

    this.workerProcess = utilityProcess.fork(workerPath, [], {
      serviceName: "llm-worker",
      allowLoadingUnsignedLibraries: true,
    });

    this.workerProcess.on("exit", this.handleWorkerExit.bind(this));
  }

  private handleWorkerExit() {
    // Restart worker on crash
    setTimeout(() => this.startWorker(), 1000);
  }
}
```

## Build Process

Worker segue o mesmo padrão de build do main e renderer, usando as configurações Vite e Forge existentes.

## Dependency Management

Worker usa o mesmo `package.json` do projeto, mas apenas acessa suas próprias dependências necessárias.
