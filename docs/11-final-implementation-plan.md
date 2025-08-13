# Plano Final de Implementação - Versão Definitiva

## Resumo das Correções Aplicadas

1. ✅ `simple-git` em vez de exec/child_process
2. ✅ Tabela `jobs` (não llm_jobs)
3. ✅ Git gerenciado pelo sistema (GitManager)
4. ✅ Providers/API keys do banco de dados
5. ✅ Imports no topo dos arquivos
6. ✅ **Memória normalizada com tabelas de ligação**

## FASE 1: Processadores de Jobs

### 1.1 Dispatcher Processor

**Arquivo: `src/worker/processors/dispatcher-processor.ts`**

```typescript
import { generateObject } from "ai";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { QueueClient } from "@/shared/services/queue-client";
import { loadProvider } from "../llm/provider-load";
import { getDatabase } from "@/shared/config/database";
import { usersTable } from "@/main/schemas/user.schema";
import { projectMembersTable } from "@/main/schemas/project-member.schema";
import { providersTable } from "@/main/schemas/provider.schema";
import type { JobFunction, Job } from "../queue/job.types";

export interface DispatcherJobData {
  messageId: string;
  messageContent: string;
  projectId: string;
  channelId: string;
  authorId: string;
}

export const dispatcherProcessor: JobFunction<DispatcherJobData, any> = async (
  job: Job<DispatcherJobData>,
) => {
  const db = getDatabase();
  const { messageContent, projectId, authorId } = job.data;

  // Get project agents
  const projectAgents = await db
    .select({
      user: usersTable,
    })
    .from(projectMembersTable)
    .innerJoin(usersTable, eq(projectMembersTable.userId, usersTable.id))
    .where(
      and(
        eq(projectMembersTable.projectId, projectId),
        eq(usersTable.type, "agent"),
      ),
    );

  // Get cheapest provider for dispatcher (e.g., deepseek)
  const dispatcherProvider = await db
    .select()
    .from(providersTable)
    .where(eq(providersTable.name, "deepseek"))
    .get();

  if (!dispatcherProvider) {
    throw new Error("Dispatcher provider not configured");
  }

  const model = loadProvider(
    dispatcherProvider.name,
    "deepseek-chat",
    dispatcherProvider.apiKey,
  );

  const result = await generateObject({
    model,
    prompt: `Message: "${messageContent}"
    Available agents: ${projectAgents
      .map((a) => `${a.user.name} (${a.user.id}): ${a.user.email}`)
      .join(", ")}
    Author: ${authorId}
    
    Decide who should respond to this message.`,
    schema: z.object({
      selectedUsers: z
        .array(z.string())
        .describe("Agent IDs who should respond"),
      waitForUser: z
        .boolean()
        .optional()
        .describe("Should wait for human response first"),
      delaySeconds: z.number().optional().default(15),
    }),
  });

  // Create management jobs for selected agents
  const managementQueue = new QueueClient("management");

  for (const agentId of result.object.selectedUsers) {
    await managementQueue.add({
      agentId,
      projectId,
      messageId: job.data.messageId,
      type: "analyze_message",
      delay: result.object.waitForUser ? result.object.delaySeconds * 1000 : 0,
    });
  }

  return result.object;
};
```

### 1.2 Management Processor

**Arquivo: `src/worker/processors/management-processor.ts`**

```typescript
import { generateText, tool } from "ai";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { QueueClient } from "@/shared/services/queue-client";
import { loadProvider } from "../llm/provider-load";
import { getDatabase } from "@/shared/config/database";
import { messagesTable } from "@/main/schemas/message.schema";
import { agentsTable } from "@/main/schemas/agent.schema";
import { providersTable } from "@/main/schemas/provider.schema";
import { jobsTable } from "../schemas/job.schema";
import type { JobFunction, Job } from "../queue/job.types";

export interface ManagementJobData {
  agentId: string;
  projectId: string;
  messageId?: string;
  type: "analyze_message" | "periodic_checkin" | "review_project";
  context?: any;
}

export const managementProcessor: JobFunction<ManagementJobData, any> = async (
  job: Job<ManagementJobData>,
) => {
  const db = getDatabase();
  const { agentId, projectId, messageId, type } = job.data;

  // Get agent with provider
  const agent = await db
    .select({
      agent: agentsTable,
      provider: providersTable,
    })
    .from(agentsTable)
    .innerJoin(providersTable, eq(agentsTable.providerId, providersTable.id))
    .where(eq(agentsTable.userId, agentId))
    .get();

  if (!agent) throw new Error(`Agent ${agentId} not found`);

  // Get message context if available
  let context = "";
  if (messageId) {
    const message = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.id, messageId))
      .get();
    context = message?.content || "";
  }

  // Management tools (no code execution)
  const tools = {
    createTask: tool({
      description: "Create a work task for development",
      parameters: z.object({
        description: z.string(),
        priority: z.number().default(10),
      }),
      execute: async ({ description, priority }) => {
        const workQueue = new QueueClient("work");
        const result = await workQueue.add(
          {
            agentId,
            projectId,
            description,
            parentJobId: job.id,
          },
          { priority },
        );
        return { taskId: result.jobId };
      },
    }),

    sendMessage: tool({
      description: "Send message to project channel",
      parameters: z.object({
        content: z.string(),
      }),
      execute: async ({ content }) => {
        await db.insert(messagesTable).values({
          id: crypto.randomUUID(),
          content,
          authorId: agentId,
          ownerId: projectId,
          channelId: job.data.context?.channelId || "general",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        return { sent: true };
      },
    }),

    reviewProjectStatus: tool({
      description: "Review current project status",
      parameters: z.object({}),
      execute: async () => {
        const activeJobs = await db
          .select()
          .from(jobsTable)
          .where(eq(jobsTable.status, "active"));

        return {
          activeJobsCount: activeJobs.length,
          projectId,
        };
      },
    }),
  };

  // Use agent's configured model
  const model = loadProvider(
    agent.provider.name,
    agent.agent.model,
    agent.provider.apiKey,
  );

  const result = await generateText({
    model,
    system: `You are ${agent.agent.name}, ${agent.agent.role}. ${agent.agent.backstory}`,
    prompt: `Type: ${type}\nContext: ${context}\n\nAnalyze and decide what tasks to create.`,
    tools,
    maxSteps: 1,
  });

  return result;
};
```

### 1.3 Work Processor

**Arquivo: `src/worker/processors/work-processor.ts`**

```typescript
import { generateText, tool } from "ai";
import { z } from "zod";
import { eq } from "drizzle-orm";
import path from "path";
import fs from "fs/promises";
import { QueueClient } from "@/shared/services/queue-client";
import { loadProvider } from "../llm/provider-load";
import { getDatabase } from "@/shared/config/database";
import { agentsTable } from "@/main/schemas/agent.schema";
import { providersTable } from "@/main/schemas/provider.schema";
import { jobsTable } from "../schemas/job.schema";
import { MemoryService } from "../services/memory.service";
import { gitManager } from "../services/git-manager";
import type { JobFunction, Job } from "../queue/job.types";

export interface WorkJobData {
  agentId: string;
  projectId: string;
  description: string;
  parentJobId?: string;
  worktreePath?: string;
}

export const workProcessor: JobFunction<WorkJobData, any> = async (
  job: Job<WorkJobData>,
) => {
  const db = getDatabase();
  const { agentId, projectId, description, parentJobId } = job.data;

  // Get agent with provider
  const agent = await db
    .select({
      agent: agentsTable,
      provider: providersTable,
    })
    .from(agentsTable)
    .innerJoin(providersTable, eq(agentsTable.providerId, providersTable.id))
    .where(eq(agentsTable.userId, agentId))
    .get();

  if (!agent) throw new Error(`Agent ${agentId} not found`);

  // Get or create worktree (system managed)
  let worktreePath = job.data.worktreePath;
  if (!worktreePath) {
    if (parentJobId) {
      // Inherit parent's worktree
      const parentJob = await db
        .select()
        .from(jobsTable)
        .where(eq(jobsTable.id, parentJobId))
        .get();

      if (parentJob?.result) {
        const parentResult = JSON.parse(parentJob.result);
        worktreePath = parentResult.data?.worktreePath;
      }
    } else {
      // Create new worktree for main job
      worktreePath = await gitManager.createWorktree(projectId, job.id);
    }
  }

  // Work tools (no direct git access)
  const tools = {
    readFile: tool({
      description: "Read file content",
      parameters: z.object({
        filePath: z.string(),
      }),
      execute: async ({ filePath }) => {
        const fullPath = path.join(worktreePath!, filePath);
        const content = await fs.readFile(fullPath, "utf-8");
        return content;
      },
    }),

    writeFile: tool({
      description: "Write file content",
      parameters: z.object({
        filePath: z.string(),
        content: z.string(),
      }),
      execute: async ({ filePath, content }) => {
        const fullPath = path.join(worktreePath!, filePath);
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, content);
        return { written: true, path: filePath };
      },
    }),

    listFiles: tool({
      description: "List files in directory",
      parameters: z.object({
        dirPath: z.string().default("."),
      }),
      execute: async ({ dirPath }) => {
        const fullPath = path.join(worktreePath!, dirPath);
        const files = await fs.readdir(fullPath);
        return files;
      },
    }),

    createChildJobs: tool({
      description: "Create subtasks",
      parameters: z.object({
        tasks: z.array(
          z.object({
            description: z.string(),
            agentId: z.string().optional(),
          }),
        ),
      }),
      execute: async ({ tasks }) => {
        // Pause parent job
        await db
          .update(jobsTable)
          .set({ status: "paused" })
          .where(eq(jobsTable.id, job.id));

        // Create child jobs
        const workQueue = new QueueClient("work");
        const childJobs = [];

        for (const task of tasks) {
          const result = await workQueue.add({
            agentId: task.agentId || agentId,
            projectId,
            description: task.description,
            parentJobId: job.id,
            worktreePath,
          });
          childJobs.push(result.jobId);
        }

        return { childJobs, parentPaused: true };
      },
    }),

    addNote: tool({
      description: "Add temporary note",
      parameters: z.object({
        content: z.string(),
      }),
      execute: async ({ content }) => {
        const currentJob = await db
          .select()
          .from(jobsTable)
          .where(eq(jobsTable.id, job.id))
          .get();

        const notes = currentJob?.result
          ? JSON.parse(currentJob.result).notes || []
          : [];
        notes.push({ content, timestamp: Date.now() });

        await db
          .update(jobsTable)
          .set({ result: JSON.stringify({ notes }) })
          .where(eq(jobsTable.id, job.id));

        return { noted: true };
      },
    }),

    saveMemory: tool({
      description: "Save knowledge to memory",
      parameters: z.object({
        content: z.string(),
        level: z.enum(["agent", "team", "project"]),
      }),
      execute: async ({ content, level }) => {
        const memoryId = await MemoryService.save(content, level, agentId, {
          agentId: level === "agent" ? agentId : undefined,
          projectId: level !== "agent" ? projectId : undefined,
        });
        return { saved: true, memoryId };
      },
    }),
  };

  // Load relevant memories for context
  const memories = await MemoryService.getRelevantMemories(agentId, projectId);

  // Use agent's model
  const model = loadProvider(
    agent.provider.name,
    agent.agent.model,
    agent.provider.apiKey,
  );

  const result = await generateText({
    model,
    system: `You are ${agent.agent.name}, ${agent.agent.role}. ${agent.agent.backstory}
    
    Relevant memories:
    - Personal: ${memories.agent.map((m) => m.content).join("; ")}
    - Team: ${memories.team.map((m) => m.content).join("; ")}
    - Project: ${memories.project.map((m) => m.content).join("; ")}`,
    prompt: `Task: ${description}
    
    Complete this task by reading and writing files as needed.`,
    tools,
    maxSteps: 1,
  });

  // System handles git operations after completion
  if (!parentJobId && result.finishReason === "stop") {
    await gitManager.commitChanges(
      worktreePath!,
      `Job ${job.id}: Task completed`,
    );

    // Queue merge job
    const systemQueue = new QueueClient("system");
    await systemQueue.add({
      type: "merge_worktree",
      jobId: job.id,
      worktreePath,
      projectId,
    });
  }

  return {
    ...result,
    worktreePath,
  };
};
```

## FASE 2: Serviços Auxiliares

### 2.1 Git Manager

**Arquivo: `src/worker/services/git-manager.ts`**

```typescript
import simpleGit, { SimpleGit } from "simple-git";
import path from "path";
import { getLogger } from "@/shared/services/logger/config";

const logger = getLogger("git-manager");

export class GitManager {
  private projectsDir: string;

  constructor() {
    this.projectsDir =
      process.env.PROJECTS_DIR || path.join(process.cwd(), "projects");
  }

  async createWorktree(projectId: string, jobId: string): Promise<string> {
    const projectPath = path.join(this.projectsDir, projectId);
    const worktreePath = path.join(projectPath, ".worktrees", jobId);

    const git: SimpleGit = simpleGit(projectPath);
    await git.raw(["worktree", "add", worktreePath, "-b", `job-${jobId}`]);

    logger.info(`Created worktree for job ${jobId}`);
    return worktreePath;
  }

  async removeWorktree(worktreePath: string): Promise<void> {
    const git: SimpleGit = simpleGit(path.dirname(path.dirname(worktreePath)));
    await git.raw(["worktree", "remove", worktreePath]);

    logger.info(`Removed worktree at ${worktreePath}`);
  }

  async commitChanges(worktreePath: string, message: string): Promise<boolean> {
    const git: SimpleGit = simpleGit(worktreePath);

    const status = await git.status();
    if (status.files.length === 0) {
      return false;
    }

    await git.add(".");
    await git.commit(message);
    logger.info(`Committed changes: ${message}`);
    return true;
  }

  async mergeToMain(projectPath: string, jobBranch: string): Promise<void> {
    const git: SimpleGit = simpleGit(projectPath);

    await git.checkout("main");
    await git.merge([jobBranch]);
    await git.branch(["-d", jobBranch]);

    logger.info(`Merged ${jobBranch} to main`);
  }

  async getConflicts(worktreePath: string): Promise<string[]> {
    const git: SimpleGit = simpleGit(worktreePath);
    const status = await git.status();
    return status.conflicted;
  }
}

export const gitManager = new GitManager();
```

### 2.2 Memory Service (Normalizado)

**Arquivo: `src/worker/services/memory.service.ts`**

```typescript
import { getDatabase } from "@/shared/config/database";
import {
  memoryTable,
  agentMemoryTable,
  teamMemoryTable,
  projectMemoryTable,
} from "@/main/schemas/memory.schema";
import { eq, desc } from "drizzle-orm";
import { getLogger } from "@/shared/services/logger/config";

const logger = getLogger("memory-service");

export type MemoryLevel = "agent" | "team" | "project";

export class MemoryService {
  static async save(
    content: string,
    level: MemoryLevel,
    createdBy: string,
    context: {
      agentId?: string;
      projectId?: string;
    },
  ): Promise<string> {
    const db = getDatabase();
    const memoryId = crypto.randomUUID();

    // Create memory record
    await db.insert(memoryTable).values({
      id: memoryId,
      content,
      createdBy,
      createdAt: new Date(),
    });

    // Create appropriate relation
    switch (level) {
      case "agent":
        if (!context.agentId) throw new Error("agentId required");
        await db.insert(agentMemoryTable).values({
          memoryId,
          agentId: context.agentId,
        });
        break;

      case "team":
        if (!context.projectId) throw new Error("projectId required");
        await db.insert(teamMemoryTable).values({
          memoryId,
          projectId: context.projectId,
        });
        break;

      case "project":
        if (!context.projectId) throw new Error("projectId required");
        await db.insert(projectMemoryTable).values({
          memoryId,
          projectId: context.projectId,
        });
        break;
    }

    logger.info(`Saved ${level} memory: ${memoryId}`);
    return memoryId;
  }

  static async getByLevel(
    level: MemoryLevel,
    context: { agentId?: string; projectId?: string },
    limit = 10,
  ): Promise<Array<{ id: string; content: string; createdAt: Date }>> {
    const db = getDatabase();

    switch (level) {
      case "agent":
        if (!context.agentId) throw new Error("agentId required");
        return db
          .select({
            id: memoryTable.id,
            content: memoryTable.content,
            createdAt: memoryTable.createdAt,
          })
          .from(memoryTable)
          .innerJoin(
            agentMemoryTable,
            eq(agentMemoryTable.memoryId, memoryTable.id),
          )
          .where(eq(agentMemoryTable.agentId, context.agentId))
          .orderBy(desc(memoryTable.createdAt))
          .limit(limit);

      case "team":
        if (!context.projectId) throw new Error("projectId required");
        return db
          .select({
            id: memoryTable.id,
            content: memoryTable.content,
            createdAt: memoryTable.createdAt,
          })
          .from(memoryTable)
          .innerJoin(
            teamMemoryTable,
            eq(teamMemoryTable.memoryId, memoryTable.id),
          )
          .where(eq(teamMemoryTable.projectId, context.projectId))
          .orderBy(desc(memoryTable.createdAt))
          .limit(limit);

      case "project":
        if (!context.projectId) throw new Error("projectId required");
        return db
          .select({
            id: memoryTable.id,
            content: memoryTable.content,
            createdAt: memoryTable.createdAt,
          })
          .from(memoryTable)
          .innerJoin(
            projectMemoryTable,
            eq(projectMemoryTable.memoryId, memoryTable.id),
          )
          .where(eq(projectMemoryTable.projectId, context.projectId))
          .orderBy(desc(memoryTable.createdAt))
          .limit(limit);
    }
  }

  static async getRelevantMemories(
    agentId: string,
    projectId: string,
    limit = 30,
  ): Promise<{
    agent: Array<{ id: string; content: string; createdAt: Date }>;
    team: Array<{ id: string; content: string; createdAt: Date }>;
    project: Array<{ id: string; content: string; createdAt: Date }>;
  }> {
    const [agentMemories, teamMemories, projectMemories] = await Promise.all([
      this.getByLevel("agent", { agentId }, limit / 3),
      this.getByLevel("team", { projectId }, limit / 3),
      this.getByLevel("project", { projectId }, limit / 3),
    ]);

    return {
      agent: agentMemories,
      team: teamMemories,
      project: projectMemories,
    };
  }
}
```

## FASE 3: Schemas do Banco

### 3.1 Memory Schema (Normalizado)

**Arquivo: `src/main/schemas/memory.schema.ts`**

```typescript
import {
  sqliteTable,
  text,
  integer,
  index,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { usersTable } from "./user.schema";
import { projectsTable } from "./project.schema";

// Main memory table
export const memoryTable = sqliteTable(
  "memory",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    content: text("content").notNull(),
    createdBy: text("created_by")
      .notNull()
      .references(() => usersTable.id),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch('subsec') * 1000)`),
  },
  (table) => ({
    createdByIdx: index("memory_created_by_idx").on(table.createdBy),
    createdAtIdx: index("memory_created_at_idx").on(table.createdAt),
  }),
);

// Agent memory relation
export const agentMemoryTable = sqliteTable(
  "agent_memory",
  {
    memoryId: text("memory_id")
      .notNull()
      .references(() => memoryTable.id, { onDelete: "cascade" }),
    agentId: text("agent_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.memoryId, table.agentId] }),
    agentIdx: index("agent_memory_agent_idx").on(table.agentId),
  }),
);

// Team memory relation
export const teamMemoryTable = sqliteTable(
  "team_memory",
  {
    memoryId: text("memory_id")
      .notNull()
      .references(() => memoryTable.id, { onDelete: "cascade" }),
    projectId: text("project_id")
      .notNull()
      .references(() => projectsTable.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.memoryId, table.projectId] }),
    projectIdx: index("team_memory_project_idx").on(table.projectId),
  }),
);

// Project memory relation
export const projectMemoryTable = sqliteTable(
  "project_memory",
  {
    memoryId: text("memory_id")
      .notNull()
      .references(() => memoryTable.id, { onDelete: "cascade" }),
    projectId: text("project_id")
      .notNull()
      .references(() => projectsTable.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.memoryId, table.projectId] }),
    projectIdx: index("project_memory_project_idx").on(table.projectId),
  }),
);
```

### 3.2 Jobs Schema (Renomeado)

**Modificar: `src/worker/schemas/job.schema.ts`**

```typescript
export const jobsTable = sqliteTable(
  "jobs", // Renamed from "llm_jobs"
  {
    // ... all existing fields remain the same ...
  },
  (table) => ({
    // Update index names
    queueProcessingIdx: index("jobs_queue_processing_idx").on(
      table.status,
      table.priority,
      table.createdAt,
    ),
    dependenciesIdx: index("jobs_dependencies_idx").on(
      table.parentJobId,
      table.dependencyCount,
    ),
    delayedIdx: index("jobs_delayed_idx").on(
      table.status,
      table.delay,
      table.createdAt,
    ),
    statusIdx: index("jobs_status_idx").on(table.status),
    nameIdx: index("jobs_name_idx").on(table.name),
    createdAtIdx: index("jobs_created_at_idx").on(table.createdAt),
    parentJobIdIdx: index("jobs_parent_job_id_idx").on(table.parentJobId),
  }),
);
```

## FASE 4: Integração

### 4.1 Job Router

**Arquivo: `src/worker/processors/job-router.ts`**

```typescript
import { getLogger } from "@/shared/services/logger/config";
import { dispatcherProcessor } from "./dispatcher-processor";
import { managementProcessor } from "./management-processor";
import { workProcessor } from "./work-processor";
import type { Job, JobFunction } from "../queue/job.types";

const logger = getLogger("job-router");

const processors: Record<string, JobFunction> = {
  dispatcher: dispatcherProcessor,
  management: managementProcessor,
  work: workProcessor,
};

export async function routeJob(job: Job): Promise<any> {
  const processor = processors[job.name];

  if (!processor) {
    logger.error(`Unknown job type: ${job.name}`);
    throw new Error(`No processor for job type: ${job.name}`);
  }

  logger.info(`Routing job ${job.id} to ${job.name} processor`);
  return processor(job);
}
```

### 4.2 Message Job Creator

**Arquivo: `src/main/services/message-job-creator.ts`**

```typescript
import { eventBus } from "@/shared/services/events/event-bus";
import { QueueClient } from "@/shared/services/queue-client";
import { getLogger } from "@/shared/services/logger/config";

const logger = getLogger("message-job-creator");

export class MessageJobCreator {
  private dispatcherQueue: QueueClient;

  constructor() {
    this.dispatcherQueue = new QueueClient("dispatcher");
  }

  initialize(): void {
    eventBus.on("message:created", async ({ message }) => {
      logger.info(`Creating dispatcher job for message ${message.id}`);

      try {
        await this.dispatcherQueue.add({
          messageId: message.id,
          messageContent: message.content,
          projectId: message.projectId,
          channelId: message.channelId,
          authorId: message.authorId,
        });
      } catch (error) {
        logger.error("Failed to create dispatcher job:", error);
      }
    });
  }
}
```

## Cronograma de Implementação

### Semana 1

- **Dia 1-2**: Implementar processadores (dispatcher, management, work)
- **Dia 3**: Implementar GitManager e MemoryService
- **Dia 4**: Criar schemas de memória e atualizar jobs
- **Dia 5**: Implementar job router e integração

### Semana 2

- **Dia 6**: Criar MessageJobCreator e conectar EventBus
- **Dia 7**: Testes de integração do fluxo completo
- **Dia 8**: Implementar hierarquia de jobs (pause/resume)
- **Dia 9**: Testes e correções
- **Dia 10**: Documentação e validação final

## Validação

### Checklist Final

- [ ] Tabela renomeada para `jobs`
- [ ] Memory com tabelas de ligação normalizadas
- [ ] Git gerenciado apenas pelo GitManager
- [ ] Providers do banco de dados
- [ ] simple-git em todas operações git
- [ ] Imports no topo dos arquivos
- [ ] Fluxo completo message → dispatcher → management → work

### Teste End-to-End

1. Criar projeto e adicionar agentes
2. Enviar mensagem
3. Verificar job dispatcher criada
4. Verificar jobs management criadas
5. Verificar job work criada
6. Verificar worktree criada
7. Verificar commit após conclusão

Este é o plano definitivo com todas as correções aplicadas.
