# Decisão Final da Arquitetura

## Contexto e Decisão

**Contexto Real Identificado:**

- I/O bound operations (chamadas HTTP para LLM APIs)
- Volume baixo de mensagens
- Processamento background (não real-time)
- Não CPU intensivo

**Decisão Final: Abordagem Simplificada BullMQ-Inspired**

## Arquitetura Final Definida

### 1. Worker Strategy

**Single Worker com utilityProcess.fork:**

```typescript
// src/main/workers/worker-manager.ts
export class WorkerManager {
  private worker: Electron.UtilityProcess | null = null;

  startWorker() {
    this.worker = utilityProcess.fork("./dist/worker/worker.js", [], {
      serviceName: "llm-worker",
    });

    // Auto-restart on crash
    this.worker.on("exit", () => {
      setTimeout(() => this.startWorker(), 1000);
    });
  }
}
```

**Por que não worker pool:**

- I/O bound = worker idle durante HTTP calls
- Volume baixo = single worker suficiente
- Jobs são **sequenciais** - uma por vez
- Se precisar paralelismo = spawn mais workers na mesma fila
- Simplicidade = menos moving parts

### 2. Queue Strategy

**SQLite-based BullMQ-inspired Queue:**

```typescript
// src/worker/features/llm-jobs/llm-jobs.service.ts
export class JobQueue {
  private pollInterval = 100; // 100ms - responsivo mas não excessivo

  async processJobs() {
    while (this.running) {
      const job = await this.getNextJob();
      if (job) {
        // Process job sequentially - wait for completion
        await this.processJob(job);
      } else {
        // No jobs available - wait before next poll
        await this.delay(this.pollInterval);
      }
    }
  }

  private async getNextJob(): Promise<Job | null> {
    // Simple SQLite query - no complex locking needed
    return db
      .select()
      .from(jobsTable)
      .where(
        and(eq(jobsTable.status, "waiting"), eq(jobsTable.dependency_count, 0)),
      )
      .orderBy(desc(jobsTable.priority), asc(jobsTable.created_at))
      .limit(1)
      .get();
  }
}
```

**Features BullMQ essenciais:**

- Job status lifecycle
- Priority handling
- Retry mechanism
- Job dependencies
- Error handling

**Features BullMQ removidas:**

- Complex worker pools
- High-frequency polling
- Advanced monitoring
- Enterprise features

### 3. Communication Strategy

**Database-Only Communication:**

```typescript
// Main Process -> Worker (via database)
export class JobSubmissionService {
  async submitJob(name: string, data: any, opts: JobOptions = {}) {
    await db.insert(jobsTable).values({
      id: generateId(),
      name,
      data: JSON.stringify(data),
      opts: JSON.stringify(opts),
      status: "waiting",
      priority: opts.priority || 0,
      created_at: Date.now(),
    });

    // No IPC needed - worker will poll
  }
}

// Worker -> Main Process (via database + optional events)
export class JobProcessor {
  async completeJob(jobId: string, result: any) {
    await db
      .update(jobsTable)
      .set({
        status: "completed",
        result: JSON.stringify(result),
        finished_on: Date.now(),
      })
      .where(eq(jobsTable.id, jobId));

    // Optional: emit event for real-time UI updates
    this.emit("job-completed", { jobId, result });
  }
}
```

## Specs que Precisam de Alteração

### ✅ Specs Corretos (Não precisam alteração)

- `spec.md` - User stories e escopo corretos
- `spec-lite.md` - Resumo correto
- `database-schema.md` - Schema BullMQ está correto
- `build-system-spec.md` - Estrutura de build está correta

### 🔄 Specs que Precisam Ajuste

#### 1. `bullmq-architecture-spec.md`

**Alterações necessárias:**

- Simplificar implementação do Worker class
- Remover worker pool complexity
- Ajustar performance expectations
- Focar em I/O bound patterns

#### 2. `technical-spec.md`

**Já ajustado**, mas revisar:

- Performance requirements ✅ (já ajustado)
- Worker requirements ✅ (já ajustado)
- Communication patterns ✅ (correto)

#### 3. `tasks.md`

**Alterações necessárias:**

- Ajustar expectativas de complexity
- Focar em implementação simples
- Remover referências a pools

## Integração Main Process ↔ Worker

### Main Process Responsibilities

```typescript
// src/main/features/llm-jobs/llm-job-queue.service.ts
export class LLMJobQueueService {
  // Submit jobs to queue
  async addJob(
    name: string,
    data: JobData,
    opts?: JobOptions,
  ): Promise<string> {
    const jobId = generateId();

    await db.insert(jobsTable).values({
      id: jobId,
      name,
      data: JSON.stringify(data),
      opts: JSON.stringify(opts || {}),
      status: "waiting",
      priority: opts?.priority || 0,
      created_at: Date.now(),
    });

    return jobId;
  }

  // Monitor job status
  async getJobStatus(jobId: string): Promise<JobStatus> {
    const job = await db
      .select()
      .from(jobsTable)
      .where(eq(jobsTable.id, jobId))
      .get();

    return {
      id: job.id,
      status: job.status,
      progress: job.progress,
      result: job.result ? JSON.parse(job.result) : null,
      error: job.failed_reason,
    };
  }

  // Poll for completed jobs (for UI updates)
  async pollCompletedJobs(): Promise<Job[]> {
    return db
      .select()
      .from(jobsTable)
      .where(
        and(
          eq(jobsTable.status, "completed"),
          isNull(jobsTable.processed_by_ui), // Not yet processed by UI
        ),
      );
  }
}
```

### Worker Process Responsibilities

```typescript
// src/worker/worker.ts
import { JobProcessor } from "./features/llm-jobs/llm-jobs.service";

const processor = new JobProcessor();

async function main() {
  console.log("LLM Worker started");

  // Start job processing loop
  await processor.start();
}

main().catch(console.error);

// src/worker/features/llm-jobs/llm-jobs.service.ts
export class JobProcessor {
  private running = false;
  private pollInterval = 100; // 100ms for responsive processing

  async start() {
    this.running = true;

    while (this.running) {
      try {
        const job = await this.getNextJob();
        if (job) {
          // Process job sequentially - one at a time
          await this.processJob(job);
        } else {
          // No jobs found - wait before next poll
          await this.delay(this.pollInterval);
        }
      } catch (error) {
        console.error("Job processing error:", error);
        await this.delay(this.pollInterval);
      }
    }
  }

  private async processJob(job: Job) {
    // Mark as active
    await this.markJobActive(job.id);

    try {
      // Execute job - blocks until completion
      const result = await this.executeJob(job);
      await this.markJobCompleted(job.id, result);
    } catch (error) {
      await this.markJobFailed(job.id, error);
    }

    // Job completed - immediately poll for next job (no delay)
  }

  private async executeJob(job: Job): Promise<any> {
    const jobData = JSON.parse(job.data);

    switch (job.name) {
      case "process-message":
        return await this.processMessage(jobData);
      case "analyze-code":
        return await this.analyzeCode(jobData);
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }

  private async processMessage(data: any): Promise<any> {
    // Make HTTP call to LLM provider
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${data.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: data.model,
        messages: data.messages,
      }),
    });

    return await response.json();
  }
}
```

### Integration Patterns

**1. Job Submission (Main → Worker):**

```typescript
// From chat component
const jobId = await window.api.llmJobQueue.addJob(
  "process-message",
  {
    userId: "user123",
    message: "Hello AI",
    conversationId: "conv456",
  },
  {
    priority: 100,
  },
);
```

**2. Status Monitoring (Main ← Worker):**

```typescript
// Poll for updates
const status = await window.api.llmJobQueue.getJobStatus(jobId);

// Or real-time updates (optional)
window.api.llmJobQueue.onJobCompleted((jobId, result) => {
  updateUI(jobId, result);
});
```

**3. Error Handling:**

```typescript
// Worker reports errors via database
await this.markJobFailed(jobId, error);

// Main process can query failed jobs
const failedJobs = await llmJobQueue.getFailedJobs();
```

## Resumo da Decisão Final

### ✅ Arquitetura Escolhida:

- **Single Worker**: utilityProcess.fork
- **Simple Queue**: SQLite com BullMQ-inspired features
- **Database Communication**: Sem IPC complexo
- **Fast Polling**: 100ms intervals
- **I/O Focus**: Otimizado para HTTP calls

### 🎯 Próximos Passos:

1. Ajustar `bullmq-architecture-spec.md` para simplicidade
2. Atualizar `tasks.md` com expectations corretos
3. Começar implementação com abordagem simplificada
4. Focar em fazer funcionar primeiro, otimizar depois

## Scaling para Paralelismo (Futuro)

### Quando Precisar de Concorrência:

```typescript
// src/main/workers/worker-manager.ts
export class WorkerManager {
  private workers: Electron.UtilityProcess[] = [];
  private maxWorkers = 3; // Based on system needs

  async scaleWorkers(targetCount: number) {
    // Spawn multiple workers processing same queue
    while (this.workers.length < targetCount) {
      const worker = utilityProcess.fork("./dist/worker/worker.js", [], {
        serviceName: `llm-worker-${this.workers.length}`,
      });
      this.workers.push(worker);
    }
  }
}
```

### Como Múltiplos Workers Funcionam:

- **Mesma fila SQLite** - todos workers consultam mesma tabela
- **Atomic job selection** - SQLite garante que apenas um worker pega cada job
- **Processamento paralelo** - cada worker processa job sequencialmente
- **No coordination needed** - workers são independentes

### Atomic Job Selection:

```sql
-- Worker A e Worker B fazem isso simultaneamente
-- Apenas um consegue pegar o job
BEGIN TRANSACTION;
UPDATE jobs
SET status = 'active', worker_id = 'worker-1'
WHERE id = (
  SELECT id FROM jobs
  WHERE status = 'waiting'
  ORDER BY priority DESC, created_at ASC
  LIMIT 1
);
COMMIT;
```

**Esta é nossa decisão final consolidada!**
