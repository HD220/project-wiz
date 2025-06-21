# Agent Architecture

## Component Diagram

```mermaid
classDiagram
    class Job {
        +id: string
        +name: string
        +payload: any
        +data: any
        +result: any
        +status: JobStatus
        +depends_on: string[]
        +max_attempts: number
        +attempts: number
        +priority: number
    }

    class FQueue {
        +addJob(job: Job): void
        +getNextJob(agentId: string): Job|null
        +updateJobStatus(jobId: string, status: JobStatus): void
        +persist(): void
    }

    class Worker {
        -agent: Agent
        -queue: FQueue
        +start(): void
        +processJob(job: Job): void
    }

    class Agent {
        +tools: Tool[]
        +process(job: Job): Promise<any>
    }

    class Task {
        +job: Job
        +tools: Tool[]
        +execute(): Promise<any>
    }

    class Tool {
        <<interface>>
        +name: string
        +description: string
        +execute(params: any): Promise<any>
    }

    FQueue "1" -- "*" Job: manages
    Worker "1" -- "1" FQueue: listens to
    Worker "1" -- "1" Agent: delegates to
    Agent "1" -- "*" Tool: uses
    Agent "1" -- "1" Task: creates
    Task "1" -- "*" Tool: uses
```

## Sequence Diagram

```mermaid
sequenceDiagram
    participant Client
    participant FQueue
    participant Worker
    participant Agent
    participant Task

    Client->>FQueue: addJob(job)
    Worker->>FQueue: getNextJob()
    FQueue-->>Worker: job
    Worker->>Agent: process(job)
    Agent->>Task: new(job)
    Task->>Tool: execute()
    Tool-->>Task: result
    Task-->>Agent: result
    Agent-->>Worker: result
    Worker->>FQueue: updateJobStatus(job.id, SUCCESS)
    FQueue-->>Client: notify(job.id, SUCCESS)
```

## Key Interfaces

### Job Interface
```typescript
interface Job {
  id: string;
  name: string;
  payload: any;
  data: any;
  result: any;
  status: 'waiting' | 'delayed' | 'success' | 'failed' | 'executing';
  depends_on: string[];
  max_attempts: number;
  attempts: number;
  priority: number;
  delay: number;
  max_retry_delay: number;
  retry_delay: number;
}
```

### Tool Interface
```typescript
interface Tool {
  name: string;
  description: string;
  parameters: z.ZodTypeAny;
  execute(params: any): Promise<any>;
}
```

### Agent Interface
```typescript
abstract class Agent {
  protected tools: Tool[] = [];
  
  constructor(protected queue: FQueue) {}

  abstract process(job: Job): Promise<any>;

  registerTool(tool: Tool): void {
    this.tools.push(tool);
  }
}
```

### FQueue Interface
```typescript
interface FQueue {
  addJob(job: Omit<Job, 'id' | 'status' | 'attempts'>): Promise<Job>;
  getNextJob(agentId: string): Promise<Job | null>;
  updateJobStatus(jobId: string, status: Job['status'], result?: any): Promise<void>;
}