# Proposta Arquitetural e de Implementação: Project Wiz

**Data:** 10 de julho de 2025

### 1. Introdução e Visão Geral

Este documento estabelece as diretrizes arquiteturais e de implementação para o Project Wiz, uma aplicação desktop inovadora que atua como uma "fábrica de software autônoma" utilizando Agentes de IA. Nosso objetivo é construir um sistema robusto, manutenível, escalável e com uma excelente Experiência do Desenvolvedor (DX), aderindo aos mais altos padrões de qualidade de software.

A arquitetura proposta segue os princípios de **Clean Architecture** e **Domain-Driven Design (DDD)**, com uma clara separação de responsabilidades e o uso do padrão **CQRS (Command Query Responsibility Segregation)**.

#### 1.1. Tecnologias Chave

*   **ElectronJS:** Framework para aplicações desktop multiplataforma.
*   **React:** Biblioteca para construção da interface do usuário.
*   **TypeScript:** Linguagem de programação para tipagem estática e robustez.
*   **Tailwind CSS:** Framework CSS utilitário para estilização.
*   **Node.js:** Ambiente de execução para o Processo Principal.
*   **SQLite com Drizzle ORM:** Banco de dados leve e ORM tipado.
*   **@tanstack/react-query:** Gerenciamento de estado assíncrono no frontend.
*   **Zod:** Validação de esquemas e tipagem.
*   **LLMs (OpenAI, DeepSeek):** Integração com modelos de linguagem grandes.

### 2. Arquitetura do Sistema

O Project Wiz é uma aplicação Electron, o que implica em dois processos principais: o **Processo Principal (Main Process)** e o **Processo de Renderização (Renderer Process)**.

#### 2.1. Processo Principal (Main Process)

É o "cérebro" da aplicação, responsável pela lógica de negócio, orquestração, acesso a dados e comunicação com serviços externos.

*   **Camadas (Clean Architecture):**
    *   **Domain Layer:** Contém a lógica de negócio central, entidades, agregados, value objects e serviços de domínio. É independente de qualquer tecnologia externa.
    *   **Application Layer:** Define os casos de uso (Use Cases) da aplicação, orquestrando as operações do domínio. Contém `Commands`, `Queries` e seus respectivos `Handlers`.
    *   **Infrastructure Layer:** Implementa as interfaces definidas nas camadas internas. Inclui adaptadores para banco de dados (repositórios), clientes de API (LLMs), sistema de arquivos, etc.
    *   **Presentation/IPC Layer:** Responsável pela comunicação com o Renderer Process via IPC. Contém os handlers IPC que recebem requisições do frontend e despacham para o `CqrsDispatcher`.

#### 2.2. Processo de Renderização (Renderer Process)

É a interface do usuário (UI), responsável por renderizar os componentes, capturar interações do usuário e enviar requisições ao Processo Principal via IPC.

*   **Camadas:**
    *   **UI Components:** Componentes React que compõem a interface visual.
    *   **Features:** Agrupamento de componentes e lógica de UI por funcionalidade.
    *   **Hooks:** Hooks React customizados para encapsular lógica de UI e interação com o Main Process.
    *   **Services/Utils:** Funções utilitárias e serviços específicos do frontend.

#### 2.3. Camada Compartilhada (`src/shared`)

Contém definições de tipos e interfaces que são compartilhadas entre o Main e o Renderer Process, garantindo a segurança de tipo na comunicação IPC. **Não deve conter lógica de negócio ou implementações.**

### 3. Estrutura de Diretórios e Organização de Arquivos

A estrutura de diretórios reflete a arquitetura modular e as camadas da Clean Architecture, promovendo clareza e separação de responsabilidades.

```
project-wiz/
├── src/
│   ├── main/                   # Código do Processo Principal (Node.js/Electron)
│   │   ├── bootstrap.ts        # Ponto de entrada e inicialização da aplicação
│   │   ├── kernel/             # Componentes centrais do sistema (CQRS Dispatcher, Event Bus, IPC Utility)
│   │   │   ├── cqrs-dispatcher.ts
│   │   │   ├── event-bus.ts
│   │   │   ├── ipc-handler-utility.ts # Factory para handlers IPC
│   │   │   └── domain/         # Tipos e interfaces de domínio globais (ex: BaseEntity)
│   │   │       └── base.entity.ts
│   │   ├── modules/            # Módulos de domínio (Bounded Contexts)
│   │   │   ├── <module-name>/  # Ex: project-management, llm-integration, persona-management
│   │   │   │   ├── index.ts    # Ponto de entrada do módulo (para carregamento automático)
│   │   │   │   ├── application/
│   │   │   │   │   ├── commands/   # Definições de comandos e seus handlers
│   │   │   │   │   ├── queries/    # Definições de queries e seus handlers
│   │   │   │   │   └── services/   # Serviços de aplicação (Use Cases)
│   │   │   │   ├── domain/         # Entidades, Value Objects, Agregados, Serviços de Domínio
│   │   │   │   │   ├── <entity>.entity.ts
│   │   │   │   │   ├── <value-object>.vo.ts
│   │   │   │   │   └── <domain-service>.service.ts
│   │   │   │   ├── infrastructure/ # Implementações de interfaces externas (ex: LLM clients)
│   │   │   │   │   └── <llm-client>.ts
│   │   │   │   ├── persistence/    # Implementações de repositórios
│   │   │   │   │   ├── <entity>.repository.ts
│   │   │   │   │   └── drizzle-<entity>.repository.ts # Implementação Drizzle
│   │   │   │   └── ipc-handlers/   # Handlers IPC específicos do módulo (usar factory)
│   │   │   │       └── <module>.ipc-handlers.ts
│   │   │   └── ...
│   │   ├── persistence/        # Configuração global de persistência (Drizzle, migrações)
│   │   │   ├── db.ts           # Configuração da conexão com o banco de dados
│   │   │   ├── schema.ts       # Esquema global do banco de dados
│   │   │   ├── base.repository.ts # Classe base genérica para repositórios Drizzle
│   │   │   └── migrations/     # Arquivos de migração do banco de dados
│   │   ├── config/             # Configurações globais do Main Process
│   │   ├── utils/              # Funções utilitárias globais do Main Process
│   │   └── errors/             # Definições de classes de erro customizadas
│   │       └── application.error.ts
│   │       └── domain.error.ts
│   │       └── infrastructure.error.ts
│   │       └── not-found.error.ts
│   │       └── validation.error.ts
│   ├── renderer/               # Código do Processo de Renderização (React UI)
│   │   ├── app/                # Componentes principais da aplicação React (layout, rotas)
│   │   ├── components/         # Componentes React reutilizáveis (UI Kit, shadcn/ui)
│   │   │   └── ui/             # Componentes de UI genéricos (botões, inputs, etc.)
│   │   ├── features/           # Módulos de funcionalidades da UI (agrupamento de componentes por feature)
│   │   │   ├── <feature-name>/ # Ex: project-list, persona-creation-wizard
│   │   │   │   ├── components/ # Componentes específicos da feature
│   │   │   │   ├── hooks/      # Hooks específicos da feature
│   │   │   │   └── index.ts    # Ponto de entrada da feature
│   │   │   └── ...
│   │   ├── hooks/              # Hooks React customizados globais (ex: useIpcQuery, useIpcMutation)
│   │   │   ├── use-ipc-query.hook.ts
│   │   │   └── use-ipc-mutation.hook.ts
│   │   ├── lib/                # Funções utilitárias globais do Renderer Process
│   │   ├── styles/             # Estilos globais (Tailwind CSS)
│   │   └── assets/             # Imagens, ícones, etc.
│   ├── shared/                 # Código compartilhado entre Main e Renderer (APENAS TIPOS E INTERFACES)
│   │   ├── common/             # Tipos comuns (ex: IEntity, IRepository)
│   │   ├── ipc-types/          # Definições de tipos para comunicação IPC
│   │   │   ├── ipc-channels.ts # Canais IPC (enum ou const)
│   │   │   ├── ipc-contracts.ts # Contratos de interface para IPC (parâmetros, retornos)
│   │   │   └── ipc-payloads.ts # Tipos de payloads para IPC
│   │   └── domain-types/       # Tipos de domínio compartilhados (ex: ProjectDTO)
│   │       └── project.dto.ts
│   └── tests/                  # Testes de unidade e integração
```

### 4. Nomenclatura e Convenções de Código

A consistência na nomenclatura é crucial para a legibilidade e manutenibilidade do código.

*   **Geral:**
    *   **Arquivos e Pastas:** `kebab-case` (ex: `my-component.tsx`, `user-settings/`).
    *   **Variáveis e Funções:** `camelCase` (ex: `userName`, `calculateTotal`).
    *   **Classes e Tipos (Interfaces, Enums):** `PascalCase` (ex: `UserEntity`, `IUserRepository`, `UserRole`).
    *   **Constantes Globais:** `SCREAMING_SNAKE_CASE` (ex: `API_KEY`, `DEFAULT_TIMEOUT`).
    *   **Booleans:** Prefixo `is`, `has`, `can` (ex: `isActive`, `hasPermission`, `canEdit`).
    *   **Evitar Underscores (`_`):** Não utilizar underscores em nomes de variáveis, funções ou propriedades, exceto para propriedades privadas de classes (ex: `private _internalValue`).

*   **Específicos da Arquitetura:**
    *   **Entidades de Domínio:** Sufixo `.entity.ts` (ex: `project.entity.ts`).
    *   **Value Objects:** Sufixo `.vo.ts` (ex: `address.vo.ts`).
    *   **Serviços de Domínio:** Sufixo `.service.ts` (ex: `user-authentication.service.ts`).
    *   **Comandos:** Sufixo `.command.ts` (ex: `create-project.command.ts`).
    *   **Queries:** Sufixo `.query.ts` (ex: `get-project-by-id.query.ts`).
    *   **Handlers (Comando/Query):** Sufixo `.handler.ts` (ex: `create-project.handler.ts`).
    *   **Repositórios:** Sufixo `.repository.ts` (ex: `project.repository.ts`). Interfaces com `I` prefixo (ex: `IProjectRepository`).
    *   **Implementações de Repositórios:** Prefixo do ORM/Tecnologia (ex: `drizzle-project.repository.ts`).
    *   **DTOs (Data Transfer Objects):** Sufixo `.dto.ts` (ex: `create-project.dto.ts`).
    *   **Hooks React:** Prefixo `use` e sufixo `.hook.ts` (ex: `use-ipc-query.hook.ts`).
    *   **IPC Handlers (Main):** Sufixo `.ipc-handlers.ts` (ex: `project.ipc-handlers.ts`).

### 5. Padrões de Design e Implementação

#### 5.1. Clean Architecture e DDD

*   **Separação de Camadas:** Rigorosa separação entre Domínio, Aplicação, Infraestrutura e Apresentação. Dependências sempre fluem de fora para dentro.
*   **Entidades e Agregados:** Entidades com identidade e ciclo de vida, Agregados como unidades transacionais.
*   **Value Objects:** Objetos imutáveis que representam conceitos descritivos.
*   **Serviços de Domínio:** Lógica de negócio que não pertence a uma entidade específica.
*   **Casos de Uso (Application Services):** Orquestram a lógica de negócio, recebendo DTOs e interagindo com o domínio e repositórios.

#### 5.2. CQRS (Command Query Responsibility Segregation)

*   **Comandos:** Representam intenções de mudança de estado (ex: `CreateProjectCommand`). São imutáveis e contêm apenas os dados necessários.
*   **Queries:** Representam intenções de leitura de dados (ex: `GetProjectByIdQuery`). São imutáveis e contêm apenas os critérios de busca.
*   **Handlers:** Classes que implementam a lógica para um Comando ou Query específico.
*   **`CqrsDispatcher`:** Um componente central (`src/main/kernel/cqrs-dispatcher.ts`) que recebe Comandos/Queries e os encaminha para seus respectivos Handlers.

**Exemplo de Uso (Main Process):**

```typescript
// application/commands/create-project.command.ts
interface ICreateProjectCommand {
  name: string;
  description?: string;
}

// application/commands/create-project.handler.ts
import type { ICommandHandler } from '@kernel/cqrs-dispatcher';
import type { IProjectRepository } from '@modules/project-management/persistence/project.repository';
import { Project } from '@modules/project-management/domain/project.entity';

class CreateProjectHandler implements ICommandHandler<ICreateProjectCommand, Project> {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async execute(command: ICreateProjectCommand): Promise<Project> {
    const { name, description } = command; // Preferir desestruturação
    const project = Project.create(name, description);
    await this.projectRepository.save(project);
    return project;
  }
}

// ipc-handlers/project.ipc-handlers.ts (usando a factory proposta)
import { createIpcHandler } from '@kernel/ipc-handler-utility';
import { IpcChannels } from '@shared/ipc-types/ipc-channels';
import type { ICreateProjectCommand } from '@modules/project-management/application/commands/create-project.command';
import type { CqrsDispatcher } from '@kernel/cqrs-dispatcher';

export function registerProjectIpcHandlers(cqrsDispatcher: CqrsDispatcher) {
  createIpcHandler(IpcChannels.PROJECT_CREATE, cqrsDispatcher, (payload: ICreateProjectCommand) =>
    cqrsDispatcher.dispatchCommand(payload)
  );
}
```

#### 5.3. Injeção de Dependência (DI)

*   **Princípio:** As dependências são "injetadas" nas classes (geralmente via construtor) em vez de serem criadas internamente.
*   **Benefícios:** Baixo acoplamento, maior testabilidade, flexibilidade para trocar implementações.
*   **Implementação:** Utilizar um container de DI leve ou, para simplicidade inicial, gerenciar as dependências manualmente no `bootstrap.ts` e passá-las para os construtores.

#### 5.4. Padrão Repositório e `BaseRepository`

*   **Princípio:** Abstrair a lógica de persistência de dados, permitindo que a camada de domínio e aplicação trabalhe com coleções de objetos, sem se preocupar com os detalhes do banco de dados.
*   **`BaseRepository` Genérico:**
    *   Uma classe abstrata (`src/main/persistence/base.repository.ts`) que encapsula operações CRUD comuns para Drizzle ORM.
    *   Recebe o schema Drizzle e a instância do DB.
    *   Define um método abstrato `mapToDomainEntity(row: TSchema): TEntity` para mapeamento.

**Exemplo de `BaseRepository` (simplificado):**

```typescript
// src/main/persistence/base.repository.ts
import type { SQLiteTableWith
  , InferInsertModel, InferSelectModel } from 'drizzle-orm/sqlite-core';
import type { BaseEntity } from '@kernel/domain/base.entity';
import type { NodeSQLiteDatabase } from 'drizzle-orm/node-sqlite';
import { eq } from 'drizzle-orm';

export abstract class BaseRepository<TEntity extends BaseEntity, TSchema extends SQLiteTableWith
> {
  protected constructor(
    protected db: NodeSQLiteDatabase<any>,
    protected schema: TSchema
  ) {}

  protected abstract mapToDomainEntity(row: InferSelectModel<TSchema>): TEntity;

  async findById(id: string): Promise<TEntity | null> {
    const [result] = await this.db.select().from(this.schema).where(eq(this.schema.id, id)).limit(1);
    return result ? this.mapToDomainEntity(result) : null; // Preferir desestruturação
  }

  async save(entity: TEntity): Promise<void> {
    await this.db.insert(this.schema).values(entity.toPersistence() as InferInsertModel<TSchema>)
      .onConflictDoUpdate({ target: this.schema.id, set: entity.toPersistence() as InferInsertModel<TSchema> });
  }
  // ... outros métodos CRUD
}

// src/main/modules/project-management/persistence/drizzle-project.repository.ts
import { BaseRepository } from '@persistence/base.repository';
import { Project } from '@modules/project-management/domain/project.entity';
import { projects } from '@persistence/schema'; // Seu schema Drizzle
import type { IProjectRepository } from './project.repository';
import type { NodeSQLiteDatabase } from 'drizzle-orm/node-sqlite';
import type { InferSelectModel } from 'drizzle-orm/sqlite-core';

export class DrizzleProjectRepository extends BaseRepository<Project, typeof projects> implements IProjectRepository {
  constructor(db: NodeSQLiteDatabase<any>) {
    super(db, projects);
  }

  protected mapToDomainEntity(row: InferSelectModel<typeof projects>): Project {
    return Project.fromPersistence(row); // Método estático na entidade para recriação
  }
  // ... métodos específicos do Project
}
```

#### 5.5. Comunicação IPC Otimizada

*   **Factory `createIpcHandler` (Main Process):**
    *   Uma função utilitária (`src/main/kernel/ipc-handler-utility.ts`) para padronizar o registro de handlers IPC.
    *   Encapsula o `ipcMain.handle`, `try/catch` e a formatação da resposta (`{ success: true, data }` ou `{ success: false, error }`).

*   **Hooks `useIpcQuery` e `useIpcMutation` (Renderer Process):**
    *   Hooks React customizados (`src/renderer/hooks/`) que utilizam `@tanstack/react-query`.
    *   Abstraem a chamada `window.electronIPC.invoke`, o gerenciamento de estados (`isLoading`, `isError`, `data`) e o parsing da resposta IPC.

**Exemplo de Uso (Renderer Process):**

```typescript
// src/renderer/hooks/use-ipc-query.hook.ts
import { useQuery } from '@tanstack/react-query';
import { IpcChannels } from '@shared/ipc-types/ipc-channels';
import type { UseQueryOptions } from '@tanstack/react-query';
import type { IpcResponse } from '@shared/ipc-types/ipc-contracts';

interface IUseIpcQueryOptions<TResult, TPayload> extends UseQueryOptions<TResult, Error> {
  channel: IpcChannels;
  payload?: TPayload;
}

export function useIpcQuery<TResult, TPayload = undefined>(
  options: IUseIpcQueryOptions<TResult, TPayload>
) {
  const { channel, payload, ...queryOptions } = options; // Preferir desestruturação

  return useQuery<TResult, Error>({
    queryKey: [channel, payload],
    queryFn: async () => {
      const response: IpcResponse<TResult> = await window.electronIPC.invoke(channel, payload);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Unknown IPC error');
      }
    },
    ...queryOptions,
  });
}

// src/renderer/features/project-management/components/project-list.tsx
import { useIpcQuery } from '@renderer/hooks/use-ipc-query.hook';
import { IpcChannels } from '@shared/ipc-types/ipc-channels';
import type { IProjectDTO } from '@shared/ipc-types/domain-types/project.dto';

function ProjectList() {
  const { data: projects, isLoading, error } = useIpcQuery<IProjectDTO[]>({ channel: IpcChannels.PROJECT_LIST_ALL });

  if (isLoading) return <div>Loading projects...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {projects?.map((project) => (
        <li key={project.id}>{project.name}</li>
      ))}
    </ul>
  );
}
```

#### 5.6. Tratamento de Erros Centralizado

*   **Hierarquia de Erros:** Definir classes de erro customizadas (`src/main/errors/`) que estendem `Error` para categorizar problemas (ex: `ApplicationError`, `DomainError`, `NotFoundError`, `ValidationError`).
*   **Propagação:** Erros devem ser lançados (`throw`) nas camadas internas e capturados e tratados nas camadas mais externas (Application Layer, IPC Handlers).
*   **IPC Handler:** A factory `createIpcHandler` será responsável por capturar esses erros, logá-los e formatar uma resposta de erro consistente para o frontend.

#### 5.7. Validação com Zod

*   **Entrada de Dados (DTOs):** Validar DTOs de entrada (para Comandos/Queries) usando Zod no Application Layer, antes de processar a lógica de negócio.
*   **Entidades de Domínio:** Utilizar Zod para validar a criação e o estado interno das entidades de domínio, garantindo a integridade dos dados.

#### 5.8. Logging

*   Implementar uma estratégia de logging consistente (ex: usando uma interface `ILogger` e uma implementação concreta que escreve para console ou arquivo).
*   Evitar `console.log` e `console.error` diretos, exceto em casos de depuração temporária.
*   Logs devem ser informativos, com níveis (info, warn, error) e contexto (módulo, função).

### 6. Boas Práticas e Princípios Orientadores

*   **DX (Developer Experience):** Priorizar a clareza, a automação de tarefas repetitivas e a facilidade de uso das APIs internas.
*   **KISS (Keep It Simple, Stupid):** Buscar a simplicidade nas soluções, evitando complexidade desnecessária.
*   **YAGNI (You Aren't Gonna Need It):** Não implementar funcionalidades ou abstrações que não são estritamente necessárias no momento.
*   **DRY (Don't Repeat Yourself):** Eliminar duplicação de código através de abstrações, funções utilitárias e padrões.
*   **SOLID:**
    *   **Single Responsibility Principle (SRP):** Cada classe/módulo deve ter uma única razão para mudar.
    *   **Open/Closed Principle (OCP):** Entidades de software devem ser abertas para extensão, mas fechadas para modificação.
    *   **Liskov Substitution Principle (LSP):** Objetos de uma superclasse devem poder ser substituídos por objetos de uma subclasse sem quebrar a aplicação.
    *   **Interface Segregation Principle (ISP):** Clientes não devem ser forçados a depender de interfaces que não usam.
    *   **Dependency Inversion Principle (DIP):** Módulos de alto nível não devem depender de módulos de baixo nível. Ambos devem depender de abstrações.
*   **Object Calisthenics:** Um conjunto de 9 regras para escrever código orientado a objetos mais limpo e manutenível (ex: uma classe por arquivo, sem `else`, sem getters/setters, etc.). Aplicar de forma pragmática.

### 7. Conclusão

Este documento serve como a base arquitetural e de implementação para o Project Wiz. Ao aderir a estas diretrizes, garantiremos um sistema robusto, escalável, manutenível e com uma excelente experiência de desenvolvimento. A consistência e a aplicação de padrões comprovados serão a chave para o sucesso a longo prazo do projeto.
