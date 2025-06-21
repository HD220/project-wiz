# 01: Estrutura de Diretórios Proposta

A seguir, é apresentada a proposta para a organização de diretórios dentro da pasta `src/`. Esta estrutura visa refletir a separação de camadas da Clean Architecture e facilitar a navegação e localização dos diferentes componentes do sistema. Para simplificar inicialmente, focaremos em três camadas principais (`domain`, `infrastructure`, `shared`), omitindo uma camada `application` de nível superior, cujas responsabilidades (como DTOs ou orquestração de casos de uso muito complexos) podem ser distribuídas.

```
src/
├── domain/                     # Lógica de negócios pura, independente de frameworks
│   ├── entities/               # Entidades de negócio (ex: Job, Project, User, AIAgent)
│   │   ├── value-objects/      # Objetos de Valor (ex: EmailVO, JobIdVO, TaskStatusVO)
│   │   ├── job.entity.ts
│   │   └── ai-agent.entity.ts  # AIAgent como DTO/Configuração
│   ├── use-cases/              # Casos de uso da aplicação
│   │   ├── job/                # Agrupado por funcionalidade/entidade principal
│   │   │   ├── dtos/           # (Opcional: DTOs para este caso de uso)
│   │   │   ├── enqueue-job.use-case.ts
│   │   │   └── ...
│   │   ├── project/
│   │   │   └── create-project.use-case.ts
│   │   └── agent/              # Casos de uso relacionados a agentes (ex: configurar agente)
│   ├── repositories/           # Interfaces (Ports) para os repositórios de dados
│   │   ├── i-job.repository.ts # Interface consolidada para persistência de Jobs e operações de fila
│   │   └── i-ai-agent.repository.ts
│   └── services/               # Serviços de domínio
│       └── agent/
│           └── ai-agent-execution.service.ts # Contém a lógica do jobProcessor dos agentes
│
├── infrastructure/             # Implementações concretas, frameworks, ferramentas
│   ├── persistence/            # Lógica de persistência de dados
│   │   ├── drizzle/            # Implementação com Drizzle ORM
│   │   │   ├── repositories/   # Implementações concretas dos repositórios
│   │   │   │   └── job.repository.ts # Implementa IJobRepository
│   │   │   │   └── ai-agent.repository.ts # Implementa IAIAgentRepository
│   │   │   ├── mappers/        # (Opcional) Mapeadores entre entidades e modelos de DB
│   │   │   ├── schema.ts       # Esquemas do Drizzle para as tabelas do DB
│   │   │   └── migrations/     # Arquivos de migração do Drizzle
│   │   └── queue/              # Implementação do QueueClient
│   │       └── queue.client.ts # Implementa IQueueClient, usa IJobRepository
│   │   └── database.ts         # Configuração da conexão com o banco de dados
│   │
│   ├── ui/react/               # Código específico do React
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/           # Serviços da UI (chamadas à API Electron)
│   │   ├── contexts/
│   │   ├── routes/
│   │   ├── assets/
│   │   └── styles/
│   │
│   ├── electron/               # Lógica específica do Electron
│   │   ├── main.ts             # Ponto de entrada do processo principal
│   │   ├── preload.ts
│   │   └── ipc-handlers/       # Manipuladores de eventos IPC
│   │
│   ├── services/               # Clientes para serviços externos (LLM, Embedding, Logging)
│   │   └── llm/
│   │       └── deepseek.service.ts # Exemplo de implementação de ILLMService
│   │
│   ├── workers/                # Implementações dos Workers genéricos
│   │   └── generic.worker.ts   # Worker genérico que recebe IQueueClient e jobProcessor
│   │
│   └── ioc/                    # Configuração da Injeção de Dependência
│       ├── inversify.config.ts
│       └── types.ts
│
├── shared/                     # Código utilitário compartilhado entre camadas
│   ├── utils/
│   ├── types/                  # Tipos TypeScript comuns, não específicos de domínio
│   ├── dtos/                   # (Opcional: DTOs globais/compartilhados)
│   └── constants/
│
└── main.ts                     # (Legado) A ser refatorado/removido
```

**Considerações Adicionais:**

*   **DTOs (Data Transfer Objects):** Se os Casos de Uso precisarem de estruturas de dados específicas para entrada/saída que diferem das entidades do domínio, esses DTOs podem ser colocados dentro dos respectivos diretórios dos casos de uso (ex: `src/domain/use-cases/job/dtos/enqueue-job.dto.ts`) ou em uma pasta `src/shared/dtos/` se forem amplamente reutilizáveis.
*   **`mappers` em `persistence`:** Se a estrutura das entidades de domínio divergir significativamente dos esquemas do banco de dados, uma camada de mapeadores pode ser útil para converter entre os dois.
*   **Testes:** Diretórios de teste (ex: `__tests__` ou arquivos `*.spec.ts`, `*.test.ts`) seriam colocados próximos aos arquivos que testam, ou em um diretório `tests/` na raiz do projeto, espelhando a estrutura de `src/`.
*   **`AIAgentExecutionService`:** Localizado em `src/domain/services/agent/`, este serviço encapsula a lógica de execução de tarefas de IA, fornecendo a função `jobProcessor` para os `Worker`s dos agentes. A entidade `AIAgent` em `src/domain/entities/` serve como o DTO de configuração/perfil para este serviço.
*   **`QueueClient` e `Worker`:** O `QueueClient` (`infrastructure/persistence/queue/`) é uma fachada para o `IJobRepository` para uma fila específica. O `Worker` genérico (`infrastructure/workers/`) usa o `QueueClient` e um `jobProcessor`.
