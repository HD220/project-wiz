# Schema de Memória Normalizado

## Estrutura com Tabelas de Ligação

### Tabela Principal de Memória

**Arquivo: `src/main/schemas/memory.schema.ts`**
```typescript
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { usersTable } from "./user.schema";
import { projectsTable } from "./project.schema";

// Main memory table - just the content
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
  })
);

// Agent personal memory
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
  })
);

// Team shared memory
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
  })
);

// Project global memory
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
  })
);
```

## Service para Gerenciar Memória

**Arquivo: `src/worker/services/memory.service.ts`**
```typescript
import { getDatabase } from '@/shared/config/database';
import { 
  memoryTable, 
  agentMemoryTable, 
  teamMemoryTable, 
  projectMemoryTable 
} from '@/main/schemas/memory.schema';
import { eq, and, desc } from 'drizzle-orm';
import { getLogger } from '@/shared/services/logger/config';

const logger = getLogger('memory-service');

export type MemoryLevel = 'agent' | 'team' | 'project';

export class MemoryService {
  /**
   * Save memory at specified level
   */
  static async save(
    content: string,
    level: MemoryLevel,
    createdBy: string,
    context: {
      agentId?: string;
      projectId?: string;
    }
  ): Promise<string> {
    const db = getDatabase();
    
    // Create the memory record
    const memoryId = crypto.randomUUID();
    await db.insert(memoryTable).values({
      id: memoryId,
      content,
      createdBy,
      createdAt: new Date(),
    });
    
    // Create the appropriate relation
    switch (level) {
      case 'agent':
        if (!context.agentId) {
          throw new Error('agentId required for agent memory');
        }
        await db.insert(agentMemoryTable).values({
          memoryId,
          agentId: context.agentId,
        });
        break;
        
      case 'team':
        if (!context.projectId) {
          throw new Error('projectId required for team memory');
        }
        await db.insert(teamMemoryTable).values({
          memoryId,
          projectId: context.projectId,
        });
        break;
        
      case 'project':
        if (!context.projectId) {
          throw new Error('projectId required for project memory');
        }
        await db.insert(projectMemoryTable).values({
          memoryId,
          projectId: context.projectId,
        });
        break;
    }
    
    logger.info(`Saved ${level} memory: ${memoryId}`);
    return memoryId;
  }
  
  /**
   * Get memories by level
   */
  static async getByLevel(
    level: MemoryLevel,
    context: {
      agentId?: string;
      projectId?: string;
    },
    limit = 10
  ): Promise<Array<{ id: string; content: string; createdAt: Date }>> {
    const db = getDatabase();
    
    let query;
    
    switch (level) {
      case 'agent':
        if (!context.agentId) {
          throw new Error('agentId required to fetch agent memory');
        }
        query = db
          .select({
            id: memoryTable.id,
            content: memoryTable.content,
            createdAt: memoryTable.createdAt,
          })
          .from(memoryTable)
          .innerJoin(agentMemoryTable, eq(agentMemoryTable.memoryId, memoryTable.id))
          .where(eq(agentMemoryTable.agentId, context.agentId))
          .orderBy(desc(memoryTable.createdAt))
          .limit(limit);
        break;
        
      case 'team':
        if (!context.projectId) {
          throw new Error('projectId required to fetch team memory');
        }
        query = db
          .select({
            id: memoryTable.id,
            content: memoryTable.content,
            createdAt: memoryTable.createdAt,
          })
          .from(memoryTable)
          .innerJoin(teamMemoryTable, eq(teamMemoryTable.memoryId, memoryTable.id))
          .where(eq(teamMemoryTable.projectId, context.projectId))
          .orderBy(desc(memoryTable.createdAt))
          .limit(limit);
        break;
        
      case 'project':
        if (!context.projectId) {
          throw new Error('projectId required to fetch project memory');
        }
        query = db
          .select({
            id: memoryTable.id,
            content: memoryTable.content,
            createdAt: memoryTable.createdAt,
          })
          .from(memoryTable)
          .innerJoin(projectMemoryTable, eq(projectMemoryTable.memoryId, memoryTable.id))
          .where(eq(projectMemoryTable.projectId, context.projectId))
          .orderBy(desc(memoryTable.createdAt))
          .limit(limit);
        break;
    }
    
    return await query;
  }
  
  /**
   * Get all relevant memories for an agent in a project
   */
  static async getRelevantMemories(
    agentId: string,
    projectId: string,
    limit = 30
  ): Promise<{
    agent: Array<{ id: string; content: string; createdAt: Date }>;
    team: Array<{ id: string; content: string; createdAt: Date }>;
    project: Array<{ id: string; content: string; createdAt: Date }>;
  }> {
    const [agentMemories, teamMemories, projectMemories] = await Promise.all([
      this.getByLevel('agent', { agentId }, limit / 3),
      this.getByLevel('team', { projectId }, limit / 3),
      this.getByLevel('project', { projectId }, limit / 3),
    ]);
    
    return {
      agent: agentMemories,
      team: teamMemories,
      project: projectMemories,
    };
  }
}
```

## Atualização no Work Processor

**Modificar tool saveMemory em `work-processor.ts`:**
```typescript
saveMemory: tool({
  description: 'Save knowledge to memory',
  parameters: z.object({
    content: z.string(),
    level: z.enum(['agent', 'team', 'project']),
  }),
  execute: async ({ content, level }) => {
    // Use the normalized memory service
    const memoryId = await MemoryService.save(
      content,
      level,
      agentId, // createdBy
      {
        agentId: level === 'agent' ? agentId : undefined,
        projectId: level !== 'agent' ? projectId : undefined,
      }
    );
    return { saved: true, memoryId };
  },
}),
```

## Vantagens da Normalização

### 1. **Flexibilidade**
- Fácil adicionar novos níveis de memória
- Pode compartilhar memória entre múltiplos agentes/projetos
- Permite queries complexas

### 2. **Performance**
- Índices específicos por tipo
- Joins eficientes
- Menos dados duplicados

### 3. **Integridade**
- CASCADE delete automático
- Constraints garantem consistência
- Impossível ter memória órfã

### 4. **Queries Otimizadas**

```typescript
// Buscar todas memórias de um agente
const agentMemories = await db
  .select()
  .from(memoryTable)
  .innerJoin(agentMemoryTable, eq(agentMemoryTable.memoryId, memoryTable.id))
  .where(eq(agentMemoryTable.agentId, agentId));

// Buscar memórias compartilhadas de um projeto
const sharedMemories = await db
  .select()
  .from(memoryTable)
  .innerJoin(teamMemoryTable, eq(teamMemoryTable.memoryId, memoryTable.id))
  .where(eq(teamMemoryTable.projectId, projectId));

// Contar memórias por tipo
const counts = await db
  .select({
    agent: count(agentMemoryTable.memoryId),
    team: count(teamMemoryTable.memoryId),
    project: count(projectMemoryTable.memoryId),
  })
  .from(memoryTable);
```

## Migration SQL

```sql
-- Main memory table
CREATE TABLE memory (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at INTEGER NOT NULL DEFAULT (unixepoch('subsec') * 1000)
);

-- Agent memory relation
CREATE TABLE agent_memory (
  memory_id TEXT NOT NULL REFERENCES memory(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (memory_id, agent_id)
);

-- Team memory relation
CREATE TABLE team_memory (
  memory_id TEXT NOT NULL REFERENCES memory(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  PRIMARY KEY (memory_id, project_id)
);

-- Project memory relation
CREATE TABLE project_memory (
  memory_id TEXT NOT NULL REFERENCES memory(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  PRIMARY KEY (memory_id, project_id)
);

-- Indexes for performance
CREATE INDEX memory_created_by_idx ON memory(created_by);
CREATE INDEX memory_created_at_idx ON memory(created_at);
CREATE INDEX agent_memory_agent_idx ON agent_memory(agent_id);
CREATE INDEX team_memory_project_idx ON team_memory(project_id);
CREATE INDEX project_memory_project_idx ON project_memory(project_id);
```

Esta estrutura normalizada é mais flexível, performática e mantém a integridade referencial adequada.