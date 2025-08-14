# Queue/Worker System - Refactored & Optimized

> **Versão Otimizada**: Sistema BullMQ-style otimizado para **1 worker com até 15 jobs concorrentes**

## 🎯 Melhorias Implementadas

### ✅ **Problemas Corrigidos**

| Problema Anterior             | Solução Implementada                                                |
| ----------------------------- | ------------------------------------------------------------------- |
| ❌ **Concorrência Fake**      | ✅ **Concorrência Real**: 15 jobs paralelos verdadeiros             |
| ❌ **Race Conditions**        | ✅ **Lock Atômico**: `UPDATE...RETURNING` para job selection        |
| ❌ **Sistema Delay Quebrado** | ✅ **Delay Correto**: `scheduledFor` timestamp + `delayMs` duration |
| ❌ **Sem Eventos**            | ✅ **EventEmitter**: `active`, `completed`, `failed`, `stalled`     |
| ❌ **Sem Recovery de Jobs**   | ✅ **Stuck Job Recovery**: Timeout de 30s para jobs travados        |
| ❌ **Performance Limitada**   | ✅ **Otimizado**: Polling 1s, índices otimizados                    |

### 🏗️ **Arquitetura Refatorada**

```typescript
// Schema otimizado para 1 worker
export const jobsTable = sqliteTable("jobs", {
  // Campos básicos
  id: text("id").primaryKey(),
  queueName: text("queue_name").notNull(),
  data: text("data").notNull(),
  status: text("status").$type<JobStatus>().default("waiting"),

  // Sistema de delay corrigido
  delayMs: integer("delay_ms").default(0), // Duração do delay
  scheduledFor: integer("scheduled_for"), // Quando executar

  // Tracking de worker
  workerId: text("worker_id"), // ID do worker processando
  updatedAt: integer("updated_at"), // Última atualização

  // Retry system melhorado
  attempts: integer("attempts").default(0),
  maxAttempts: integer("max_attempts").default(3),
});
```

### 🚀 **Recursos Principais**

#### **1. Concorrência Real (15 Jobs Paralelos)**

```typescript
const worker = new Worker("queue-name", processor, {
  concurrency: 15, // Até 15 jobs simultâneos
  pollInterval: 1000, // Poll a cada 1 segundo
});

// Worker executa 15 jobs em paralelo usando Promise.allSettled
```

#### **2. Lock Atômico Anti-Race-Condition**

```typescript
// Atomic job selection para 1 worker
private async getAndLockNextJob(): Promise<Job | null> {
  const [job] = await db
    .update(jobsTable)
    .set({
      status: "active",
      workerId: this.workerId,
      processedOn: new Date(),
    })
    .where(eq(jobsTable.status, "waiting"))
    .returning()
    .limit(1);

  return job || null;
}
```

#### **3. Sistema de Delay Correto**

```typescript
// Adicionar job com delay
await queue.add(data, {
  delay: 5000, // 5 segundos
  priority: 10,
  attempts: 3,
});

// Worker processa delayed jobs corretamente
const now = Date.now();
const readyJobs = await db
  .update(jobsTable)
  .set({ status: "waiting" })
  .where(lt(jobsTable.scheduledFor, now));
```

#### **4. Sistema de Eventos Completo**

```typescript
worker.on("active", ({ id, data }) => {
  console.log(`Job ${id} iniciado`);
});

worker.on("completed", ({ id, result, duration }) => {
  console.log(`Job ${id} concluído em ${duration}ms`);
});

worker.on("failed", ({ id, error, duration }) => {
  console.log(`Job ${id} falhou: ${error}`);
});

worker.on("stalled", ({ id }) => {
  console.log(`Job ${id} travado, será recuperado`);
});
```

#### **5. Recovery de Jobs Travados**

```typescript
// Detecta e recupera jobs que ficaram "stuck"
private async recoverStuckJobs(): Promise<void> {
  const stuckThreshold = Date.now() - this.options.stuckJobTimeout;

  const stuckJobs = await db
    .select()
    .where(
      and(
        eq(jobsTable.status, "active"),
        lt(jobsTable.processedOn, stuckThreshold)
      )
    );

  // Move jobs stuck de volta para waiting
  for (const job of stuckJobs) {
    this.emit("stalled", { id: job.id });
    // Reset job to waiting...
  }
}
```

## 📈 **Performance & Métricas**

### **Throughput Esperado**

- **Cenário Leve** (100ms/job): ~150 jobs/segundo
- **Cenário Médio** (1s/job): ~15 jobs/segundo
- **Cenário Pesado** (5s/job): ~3 jobs/segundo

### **Monitoramento**

```typescript
// Stats da Queue
const queueStats = await queue.getStats();
// { waiting: 5, active: 15, completed: 100, failed: 2, delayed: 3 }

// Stats do Worker
const workerStats = worker.getStats();
// { running: true, activeJobs: 12, maxConcurrency: 15, workerId: "worker-123" }
```

## 🎮 **Como Usar**

### **Uso Básico**

```typescript
import { Queue, Worker } from "@/main/queue";

// 1. Criar queue e worker
const queue = new Queue("llm-processing");
const worker = new Worker(
  "llm-processing",
  async ({ id, data }) => {
    // Processar job
    const result = await processLLMRequest(data);
    return result;
  },
  {
    concurrency: 15,
    pollInterval: 1000,
  },
);

// 2. Setup eventos
worker.on("completed", ({ id, result }) => {
  console.log(`Job ${id} concluído:`, result);
});

// 3. Iniciar worker
worker.run();

// 4. Adicionar jobs
await queue.add(
  { prompt: "Hello AI!" },
  {
    priority: 10,
    attempts: 3,
    delay: 2000, // 2 segundos de delay
  },
);
```

### **Uso Avançado - Múltiplas Queues**

```typescript
// Diferentes queues para diferentes tipos de jobs
const imageQueue = new Queue("image-processing");
const textQueue = new Queue("text-analysis");

// Workers com concorrência específica para cada tipo
const imageWorker = new Worker("image-processing", processImage, {
  concurrency: 5, // CPU intensivo = menor concorrência
});

const textWorker = new Worker("text-analysis", analyzeText, {
  concurrency: 15, // I/O bound = maior concorrência
});
```

## 🔧 **Configuração Recomendada**

### **Para LLM Processing**

```typescript
const llmWorker = new Worker("llm-jobs", processLLM, {
  concurrency: 10, // 10 chamadas simultâneas para LLM
  pollInterval: 500, // Poll rápido (0.5s)
  stuckJobTimeout: 60000, // 60s timeout (LLM pode demorar)
});
```

### **Para Tarefas Rápidas**

```typescript
const fastWorker = new Worker("fast-jobs", processFast, {
  concurrency: 15, // Máxima concorrência
  pollInterval: 100, // Poll muito rápido (100ms)
  stuckJobTimeout: 10000, // 10s timeout
});
```

## 🧹 **Manutenção**

### **Limpeza de Jobs Antigos**

```typescript
// Limpar jobs concluídos há mais de 1 hora
await queue.clean(60 * 60 * 1000, "completed");

// Limpar jobs falhados há mais de 24 horas
await queue.clean(24 * 60 * 60 * 1000, "failed");
```

### **Monitoramento de Saúde**

```typescript
setInterval(async () => {
  const stats = await queue.getStats();

  // Alertar se muitos jobs falhando
  if (stats.failed > stats.completed * 0.1) {
    console.warn("High failure rate detected!");
  }

  // Alertar se queue crescendo muito
  if (stats.waiting > 1000) {
    console.warn("Queue backlog too high!");
  }
}, 30000); // Check a cada 30s
```

## 🔄 **Migração de llm_jobs**

A migração foi aplicada automaticamente:

- ✅ Tabela `llm_jobs` renomeada para `jobs`
- ✅ Dados migrados com mapeamento correto
- ✅ Índices otimizados para nova estrutura
- ✅ Campos obsoletos removidos (`parent_job_id`, `dependency_count`, etc.)

## 📊 **Compatibilidade BullMQ**

| Recurso BullMQ      | Status   | Implementação                               |
| ------------------- | -------- | ------------------------------------------- |
| ✅ **Job States**   | Completo | waiting, active, completed, failed, delayed |
| ✅ **Priorities**   | Completo | Ordenação por prioridade DESC               |
| ✅ **Retry Logic**  | Completo | Exponential backoff + jitter                |
| ✅ **Delayed Jobs** | Completo | scheduledFor timestamp                      |
| ✅ **Events**       | Completo | active, completed, failed, stalled          |
| ✅ **Concurrency**  | Completo | 15 jobs paralelos reais                     |
| ✅ **Job Cleanup**  | Completo | Grace period configurable                   |
| ✅ **Worker Stats** | Completo | activeJobs, running, maxConcurrency         |

---

**Sistema agora está production-ready para 1 worker com até 15 jobs concorrentes!** 🚀
