# 3. Camada Backend (Main Process)

**Versão:** 3.0  
**Status:** Design Final  
**Data:** 2025-01-17

---

## 🎯 Visão Geral do Backend

A camada de backend, executada no processo `main` do Electron, é o cérebro do Project Wiz. Ela é responsável pela lógica de negócio, persistência de dados e gerenciamento dos agentes de IA. A arquitetura é organizada em **Bounded Contexts** (Contextos Delimitados), um conceito do Domain-Driven Design (DDD), para garantir o isolamento e a clareza dos domínios de negócio.

---

## 1. Organização por Bounded Contexts e Aggregates

O backend é dividido em diretórios que representam os principais domínios da aplicação:

- **`user/`**: Gerencia tudo relacionado a usuários, autenticação e perfis.
- **`project/`**: Lida com projetos, canais, issues, fóruns, etc.
- **`agents/`**: Contém a lógica para os workers de IA, suas tarefas e filas.
- **`conversations/`**: Gerencia mensagens, canais e o roteamento de interações com agentes.

Dentro de cada Bounded Context, a lógica principal (`project.service.ts`, `project.handlers.ts`, `projects.schema.ts`) reside na raiz. Funcionalidades mais específicas são agrupadas em **Aggregates** (Agregados), como `project/channels/` ou `project/issues/`.

---

## 2. API Layer: Comunicação via IPC

A comunicação entre o frontend e o backend é feita exclusivamente via Electron IPC. Os handlers para essas chamadas estão localizados dentro dos diretórios de seus respectivos domínios/agregados.

**Exemplo de Handler de API:**

```typescript
// src/main/project/project.handlers.ts
import { ipcMain } from "electron";
import { ProjectService } from "@/main/project/project.service";

export function setupProjectHandlers(): void {
  ipcMain.handle("projects:create", async (_, data) => {
    return await ProjectService.create(data);
  });
}
```

---

## 3. Service Layer: Lógica de Negócio do Domínio

Os serviços são o coração de cada domínio/agregado e contêm as regras de negócio.

**Exemplo de Serviço:**

```typescript
// src/main/project/project.service.ts
import { db } from "@/main/database/connection";
import {
  projectsTable,
  CreateProjectInput,
  Project,
} from "@/main/project/projects.schema";
import { ChannelService } from "@/main/project/channels/channel.service";

export class ProjectService {
  static async create(input: CreateProjectInput): Promise<Project> {
    // ... lógica de negócio
    const [newProject] = await db.insert(projectsTable).values(input).returning();

    await ChannelService.createDefaultChannels(newProject.id);

    return newProject;
  }
}
```

---

## 4. Data Layer: Persistência com Drizzle ORM

A camada de dados é definida pelos arquivos `*.schema.ts` dentro de cada domínio/agregado e gerenciada centralmente pelo Drizzle ORM.

### Schema por Domínio/Agregado

Cada parte do domínio define seu próprio schema, seguindo a convenção de nomenclatura `*Table`.

**Exemplo de Schema Principal:**

```typescript
// src/main/project/projects.schema.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// A variável da tabela termina com o sufixo "Table"
export const projectsTable = sqliteTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  // ... outros campos
});

// Tipos são inferidos a partir da variável da tabela
export type Project = typeof projectsTable.$inferSelect;
export type NewProject = typeof projectsTable.$inferInsert;
```

**Exemplo de Schema Relacionado:**

```typescript
// src/main/project/issues/issues.schema.ts
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { projectsTable } from "@/main/project/projects.schema"; // Importa a tabela correta

export const issuesTable = sqliteTable("issues", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  // A referência usa a variável da tabela correta
  projectId: text("project_id").references(() => projectsTable.id),
});
```

### Consultas ao Banco

As consultas também devem usar as variáveis de tabela padronizadas.

```typescript
// Exemplo de query em um serviço
import { db } from "@/main/database/connection";
import { projectsTable } from "@/main/project/projects.schema";
import { eq } from "drizzle-orm";

async function findProjectById(id: string): Promise<Project | null> {
  const result = await db.query.projectsTable.findFirst({
    where: eq(projectsTable.id, id),
  });
  return result ?? null;
}
```
