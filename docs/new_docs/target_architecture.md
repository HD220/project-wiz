# Proposta de Arquitetura Alvo para o Sistema "project-wiz"

## 1. Introdução

Este documento descreve a proposta de uma nova arquitetura para o sistema "project-wiz". O objetivo principal é modernizar a base de código, melhorar a Experiência do Desenvolvedor (DX), e aumentar a manutenibilidade, testabilidade e escalabilidade do sistema. A análise inicial revelou desafios como a ausência do uso de Injeção de Dependência (apesar da presença da biblioteca InversifyJS), a existência de múltiplos componentes de backend desconectados e a necessidade de maior clareza arquitetural na separação de responsabilidades.

A nova arquitetura visa resolver esses pontos, estabelecendo uma estrutura coesa que facilitará o desenvolvimento e a manutenção. Os benefícios esperados são:

* **Maior Produtividade do Desenvolvedor:** Código mais fácil de entender, modificar e testar.
* **Redução de Bugs:** Tipagem forte, DI e separação clara de responsabilidades ajudam a prevenir erros.
* **Facilidade de Manutenção:** Componentes desacoplados podem ser atualizados ou substituídos com menor impacto no sistema.
* **Melhor Escalabilidade:** Uma arquitetura modular permite que o sistema cresça de forma organizada.

## 2. Princípios e Visão Geral da Arquitetura

A nova arquitetura será guiada por um conjunto de princípios fundamentais para garantir um código limpo, legível e de fácil manutenção. A estrutura será organizada em camadas, seguindo o modelo da **Clean Architecture**, que promove a separação de responsabilidades e garante que a lógica de negócios central seja independente de detalhes de infraestrutura e UI.

### 2.1. Princípios Fundamentais

1.  **Clean Architecture (Arquitetura Limpa):**
    * **Independência de Frameworks:** O código de domínio e as regras de negócio não dependerão de frameworks de UI, banco de dados ou outros detalhes de infraestrutura.
    * **Testabilidade:** As regras de negócio podem ser testadas sem UI, banco de dados, servidor web ou qualquer elemento externo.
    * **Independência de UI e Banco de Dados:** A UI e o tipo de banco de dados podem ser trocados sem afetar as regras de negócio.
    * **Regra de Dependência:** As dependências de código fonte só podem apontar para dentro. Nada em um círculo interno pode saber qualquer coisa sobre algo em um círculo externo.

2.  **Object Calisthenics:** Um conjunto de 9 regras para design de código orientado a objetos que promovem classes pequenas, coesas e com responsabilidades bem definidas.

3.  **Injeção de Dependência (DI) com InversifyJS:** Utilização do InversifyJS para gerenciar as dependências, promovendo desacoplamento e melhorando a testabilidade.

4.  **Developer Experience (DX):** A arquitetura deve ser intuitiva, com boas práticas de nomenclatura, estrutura de diretórios clara e documentação.

5.  **Domain-Driven Design (DDD) - Elementos:** Utilização de conceitos como Entidades ricas em comportamento e Value Objects para modelar o domínio.

6.  **Single Responsibility Principle (SRP):** Cada classe ou módulo deve ter uma, e somente uma, razão para mudar.

7.  **Don't Repeat Yourself (DRY):** Evitar a duplicação de código.

### 2.2. Visão Geral das Camadas

A arquitetura será organizada em três camadas principais: Domínio, Infraestrutura e Apresentação/Aplicação (opcionais). O fluxo de dependências será estritamente gerenciado, sempre apontando para o interior, em direção à camada de Domínio.

* A **Camada de Domínio** é o coração do software, contendo a lógica de negócios pura.
* A **Camada de Infraestrutura** contém todas as implementações concretas e detalhes tecnológicos, como banco de dados, UI e clientes de serviços externos.
* As **Camadas de Aplicação e Apresentação** são intermediárias opcionais para orquestração e adaptação de dados.

## 3. Arquitetura em Camadas Detalhada

### 3.1. Camada de Domínio (`src/domain`)

É o coração do software, contendo a lógica de negócios pura e independente de detalhes externos.

* **Entidades (`entities/`):** Representam os objetos de negócio fundamentais (`Job`, `Project`, `AIAgent`). Encapsulam estado e comportamento, seguem os princípios de Object Calisthenics e utilizam Value Objects (ex: `EmailVO` em vez de `string`). Não têm conhecimento sobre como são persistidas ou apresentadas.

* **Casos de Uso (Use Cases / Interactors) (`use-cases/`):** Implementam as regras de negócio específicas da aplicação, orquestrando o fluxo entre entidades e repositórios (ex: `CreateNewProjectUseCase`). São chamados pela UI (ou outro trigger) e dependem de abstrações (interfaces) para interagir com a camada de infraestrutura.

* **Interfaces de Repositório (Ports) (`repositories/`):** Definem os contratos (interfaces TypeScript) para as operações de persistência de dados e de fila (ex: `IQueueRepository`, `IProjectRepository`). Permitem que os Casos de Uso permaneçam independentes das tecnologias de banco de dados.

* **Serviços de Domínio (`services/`):** Contêm lógica de negócios que não se encaixa em uma única entidade. São stateless e operam sobre múltiplas entidades (ex: `AIAgentExecutionService`).

### 3.2. Camada de Infraestrutura (`src/infrastructure`)

Contém todas as implementações concretas e detalhes tecnológicos. Ela depende da camada de Domínio, mas o Domínio não depende dela.

* **Persistência (`persistence/`):** Implementações concretas das interfaces de repositório, utilizando Drizzle ORM para interagir com o banco de dados SQLite. Inclui esquemas, configurações e migrações. É aqui que reside a implementação do sistema de filas customizado.

* **Interface do Usuário (UI) (`ui/react/`):** A aplicação React, incluindo páginas, componentes, hooks e serviços específicos da UI.

* **Lógica Específica do Electron (`electron/`):** O processo principal (`main.ts`), o script de preload (`preload.ts`) e os manipuladores IPC (`ipc-handlers/`) que conectam a UI ao backend.

* **Clientes de Serviços Externos (`services/`):** Implementações concretas para interagir com APIs de terceiros, como o `DeepSeekLLMService` que implementa a interface `ILLMService`.

* **Workers (`workers/`):** Implementações dos workers genéricos que processam jobs de uma fila específica. A inicialização e gerenciamento ocorrem no processo principal do Electron.

* **Configuração de Injeção de Dependência (`ioc/`):** Arquivos `inversify.config.ts` e `types.ts` para configurar o container InversifyJS.

### 3.3. Camadas Opcionais: Aplicação e Apresentação

* **Camada de Aplicação (`src/application`):** Uma camada intermediária opcional para DTOs (Data Transfer Objects), orquestração de casos de uso complexos e serviços de aplicação (tarefas que não são nem domínio puro nem infraestrutura). Inicialmente, suas responsabilidades podem ser absorvidas por outras camadas.

* **Camada de Apresentação (`src/presentation`):** Outra camada intermediária opcional para adaptar dados dos Casos de Uso para um formato consumível pela UI (ViewModels/Presenters). Em aplicações React, essa lógica muitas vezes reside em hooks customizados ou nos próprios componentes.

### 3.4. Fluxo e Regra de Dependência

A Regra de Dependência é estritamente seguida: o código fonte só pode ter dependências apontando para dentro (Infraestrutura -> Aplicação -> Domínio). O Domínio permanece independente. Para que o Domínio possa invocar funcionalidades da Infraestrutura (como persistência), utiliza-se o Princípio da Inversão de Dependência (DIP): o Domínio define interfaces (ports) e a Infraestrutura fornece as implementações, que são conectadas em tempo de execução via Injeção de Dependência.

## 4. Sistema de Processamento Assíncrono (Jobs, Filas e Workers)

Um componente central da nova arquitetura é um sistema de filas assíncronas customizado, inspirado no BullMQ, mas implementado localmente com SQLite para persistência, sem dependências externas. Este sistema é genérico e robusto, projetado para processar tarefas de forma desacoplada.

### 4.1. Entidades Chave: `Job` e `AIAgent`

* **A Entidade `Job` (`domain/entities/job.entity.ts`):**
    Representa a unidade de trabalho do sistema. É uma entidade rica que encapsula seu estado (status, tentativas) e comportamento através de métodos (`startProcessing`, `complete`, `fail`), sem setters públicos. O estado é alterado como resultado de ações de negócio. A entidade `Job` é agnóstica à persistência; ela manipula seu estado em memória. A persistência é responsabilidade do Worker.

    * **Propriedades Principais (`JobProps`):** Inclui `id`, `queueName`, `name` (tipo de job), `payload` (dados da tarefa fornecidos na criação), `data` (dados internos do processador, atualizáveis durante a execução), `status` (um Value Object `JobStatusVO`), `attempts`, `maxAttempts`, `delayUntil`, etc.
    * **Comportamentos Internos:**
        * `updateJobData(newData)`: Permite que um processador atualize o campo `data` do job em memória.
        * `prepareForDelay(timestamp)`: Prepara o estado do job para ser adiado, alterando seu status e `delayUntil` em memória.
        * `prepareToWaitForChildren()`: Prepara o estado do job para aguardar a conclusão de jobs filhos.

* **A Entidade `AIAgent` (`domain/entities/ai-agent.entity.ts`):**
    Representa o perfil de configuração de um agente de IA. Com a refatoração, a lógica de execução é movida para fora da entidade, tornando-a um objeto de dados que define *o quê* e *como* um agente deve se comportar.

    * **Propriedades de Configuração (`AIAgentProps`):** Inclui `id`, `name`, `roleDescription` (para o prompt do sistema), `modelId`, `provider`, `temperature`, `availableTools`, etc. O `queueName` não é mais uma propriedade do agente, mas sim do job.
    * **Comportamento:** A entidade pode ter métodos para gerenciar sua configuração, como `updateConfiguration`, `activate`, ou `deactivate`. A lógica de processamento de um job (`processJob`) foi removida e agora reside no `AIAgentExecutionService`.

### 4.2. O Contrato de Persistência: `IQueueRepository`

Localizada em `src/domain/repositories/i-queue.repository.ts`, esta interface é o contrato central para todas as operações de persistência relacionadas a jobs e filas. Ela garante que os Casos de Uso e Serviços de Domínio sejam independentes da implementação do banco de dados.

* **Métodos Principais:**
    * `add(job: Job)`: Adiciona um novo job à fila.
    * `findById(jobId: string)`: Busca um job pelo seu ID.
    * `findNextPending(queueName: string)`: Encontra o próximo job pendente, aplica um lock e o retorna junto com um `lockToken`.
    * `markJobActive(...)`, `updateJobData(...)`: Atualizam o estado de um job ativo, validando o `lockToken`.
    * `requestMoveToDelayed(...)`, `requestMoveToWaitingChildren(...)`: Movem um job para estados de espera, liberando o lock.
    * `completeJob(...)`, `failJob(...)`: Finalizam um job (com sucesso ou falha), atualizando seu estado e liberando o lock. O `failJob` também gerencia a lógica de retentativas e backoff.

### 4.3. O Orquestrador: `AIAgentExecutionService`

Este serviço de domínio (`src/domain/services/agent/ai-agent-execution.service.ts`) é crucial. Ele atua como a ponte entre a lógica de negócios específica dos agentes e o sistema de filas genérico.

* **Responsabilidades:**
    * Fornecer a função `jobProcessor` que será executada pelos `Worker`s.
    * Utilizar o `payload` do `Job` para carregar a configuração do `AIAgent` apropriado.
    * Orquestrar a interação com o `ILLMService` e `IToolRegistry` dentro do `jobProcessor`.
    * Gerenciar o estado da tarefa, manipulando a entidade `Job` em memória e usando o `QueueClient` para persistir mudanças ou sinalizar operações de fila avançadas (como adiamento).
* **Dependências (Injetadas):** `ILLMService`, `IToolRegistry`, `IAIAgentRepository`.

### 4.4. O Executor: `Worker` Genérico

Um `Worker` (`infrastructure/workers/`) é um componente da infraestrutura que processa jobs de uma fila específica. Ele é configurado com um `IQueueClient` e uma função `jobProcessor`.

* **Responsabilidades do Ciclo de Vida do Job:**
    1.  **Monitorar e Obter Job:** Chama `queueClient.getNextJob()` em loop para obter um job e um `lockToken`.
    2.  **Marcar como Ativo:** Persiste o estado `ACTIVE` do job via `queueClient.markJobActive()`.
    3.  **Executar `jobProcessor`:** Invoca a função `jobProcessor` (fornecida pelo `AIAgentExecutionService`), passando o `job`, o `lockToken` e a instância do `queueClient`.
    4.  **Tratar Resultado:**
        * **Sucesso:** Se o `jobProcessor` retorna um resultado, chama `queueClient.completeJob()`.
        * **Erros de Controle de Fluxo (`DelayedError`, `WaitingChildrenError`):** Se o `jobProcessor` lança esses erros, o Worker entende que a operação de fila correspondente já foi sinalizada e apenas registra o evento. O `jobProcessor` primeiro prepara o estado do job em memória (ex: `job.prepareForDelay()`), lança o erro, e o Worker captura-o para chamar o método de persistência adequado no `queueClient`.
        * **Falhas Reais:** Se qualquer outra exceção ocorre, chama `queueClient.failJob()` para gerenciar retentativas ou falha permanente.
    5.  **Liberar Lock:** A liberação do lock é gerenciada pelos métodos do `queueClient` que finalizam ou pausam o job.

### 4.5. Facilitadores: `QueueClient` e `AgentLifecycleService`

* **`QueueClient`:** Um objeto da infraestrutura que encapsula as chamadas ao `IQueueRepository` para um `queueName` específico. Ele simplifica a API para o `Worker`, fornecendo métodos como `getNextJob`, `completeJob`, `updateJobData`, etc., para uma fila específica.
* **`AgentLifecycleService`:** Um serviço de inicialização no processo principal do Electron. Ele é responsável por:
    1.  Carregar as configurações de todos os `AIAgent`s.
    2.  Para cada agente, obter a função `jobProcessor` específica do `AIAgentExecutionService`.
    3.  Instanciar e configurar um `QueueClient` para a fila do agente.
    4.  Instanciar um `Worker` com o `QueueClient` e o `jobProcessor`.
    5.  Iniciar e, na finalização da aplicação, parar graciosamente todos os `Worker`s.

## 5. Injeção de Dependência com InversifyJS

A Injeção de Dependência (DI) com InversifyJS é um pilar da arquitetura para promover desacoplamento, testabilidade e configuração centralizada.

### 5.1. Configuração do Container (`infrastructure/ioc/inversify.config.ts`)

Um arquivo central cria e configura o container InversifyJS. É aqui que as "ligações" (bindings) entre interfaces e suas implementações concretas são definidas.

* **`bind<Interface>(TYPE).to(Implementation)`:** Mapeia uma abstração para sua implementação concreta.
* **Escopos:**
    * `inSingletonScope()`: Uma única instância é criada e reutilizada. Ideal para repositórios e serviços stateless.
    * `inTransientScope()`: Uma nova instância é criada a cada vez que é solicitada. Ideal para Casos de Uso.

### 5.2. Definição de Tipos/Símbolos (`infrastructure/ioc/types.ts`)

Para identificar unicamente as dependências (especialmente interfaces), usamos símbolos TypeScript definidos em um arquivo `types.ts`. Ex: `const TYPES = { IJobRepository: Symbol.for('IJobRepository'), ... };`.

### 5.3. Padrões de Uso (`@injectable`, `@inject`)

* **`@injectable()`:** Marca uma classe para que o container possa gerenciá-la e injetar dependências nela.
* **`@inject(TYPES.AlgumSimbolo)`:** Usado no construtor de uma classe para declarar uma dependência que será injetada pelo container.

**Exemplo de um Caso de Uso:**
```typescript
@injectable()
export class CreateProjectUseCase {
  constructor(
    @inject(TYPES.IProjectRepository) private projectRepository: IProjectRepository
  ) {}

  async execute(input: CreateProjectInput): Promise<CreateProjectOutput> {
    // ... lógica do caso de uso ...
    const project = Project.create(...);
    await this.projectRepository.save(project);
    return { ... };
  }
}
```

## 6. Comunicação UI-Backend e Casos de Uso

A comunicação entre a UI (React) e o backend (Electron) continuará usando IPC, mas será refatorada para utilizar a Injeção de Dependência.

### 6.1. Refatoração dos Handlers IPC

Em vez de instanciar dependências manualmente, os handlers IPC obterão instâncias de Casos de Uso diretamente do container DI. A abordagem recomendada é agrupar handlers relacionados em classes injetáveis.

* **Classe de Handler Exemplo (`UserHandlers`):**
    ```typescript
    @injectable()
    export class UserHandlers {
      constructor(
        @inject(TYPES.CreateUserUseCase) private createUserUseCase: CreateUserUseCase
      ) {}

      public registerHandlers(): void {
        ipcMain.handle('usecase:create-user', async (_event, data) => {
          return await this.createUserUseCase.execute(data);
        });
      }
    }
    ```
* **Inicialização:** No `main.ts` do Electron, após a configuração do container, as classes de handler são obtidas do container e seus métodos `registerHandlers()` são chamados.

Isso desacopla os handlers das implementações concretas, melhora a testabilidade e a organização do código.

### 6.2. Exemplos de Casos de Uso

* **`EnqueueJobUseCase`:** Responsável por criar um `Job` e adicioná-lo à fila correta. Ele recebe um `queueName`, `jobName`, `taskPayload` e outras opções, cria a entidade `Job` e a persiste usando o `IQueueRepository`. Este é o principal ponto de entrada para iniciar tarefas assíncronas dos agentes.

* **`CreateProjectUseCase`:** Um caso de uso síncrono mais tradicional que cria uma entidade `Project` e a persiste, demonstrando o fluxo padrão para operações que não envolvem filas.

## 7. Diretrizes de Qualidade de Código (Object Calisthenics)

As seguintes regras serão aplicadas para promover um código mais limpo e manutenível:

1.  **Um Nível de Indentação por Método:** Força a extração de lógica para métodos menores.
2.  **Não Use a Palavra-Chave `ELSE`:** Incentiva o uso de *early returns* e polimorfismo, clarificando o fluxo.
3.  **Envolva Todos os Primitivos e Strings em Value Objects:** Adiciona semântica e validação a tipos primitivos (ex: `JobStatusVO` em vez de `string`).
4.  **Coleções de Primeira Classe:** Encapsula uma coleção e seus comportamentos em sua própria classe.
5.  **Um Ponto por Linha:** Limita o encadeamento de chamadas de método, seguindo a Lei de Demeter.
6.  **Não Abrevie:** Usa nomes completos e descritivos para classes, métodos e variáveis.
7.  **Mantenha Todas as Entidades Pequenas:** Força alta coesão, com um limite de linhas sugerido (ex: 50).
8.  **Nenhuma Classe com Mais de Duas Variáveis de Instância:** Uma regra desafiadora que força a modelagem de abstrações claras, incentivando a criação de objetos menores.
9.  **Sem Getters/Setters/Propriedades Públicas para Alteração de Estado:** O estado de um objeto deve ser modificado apenas por métodos que representam comportamentos de negócio explícitos (*Tell, Don't Ask*).

## 8. Estrutura de Diretórios Proposta

A estrutura de diretórios reflete a separação de camadas da Clean Architecture.

```
src/
├── domain/
│   ├── entities/
│   │   ├── value-objects/
│   │   ├── job.entity.ts
│   │   └── ai-agent.entity.ts
│   ├── use-cases/
│   ├── repositories/ (Interfaces/Ports)
│   └── services/
│       └── agent/
│
├── infrastructure/
│   ├── persistence/
│   │   └── drizzle/
│   │       ├── repositories/ (Implementações)
│   │       └── ...
│   ├── ui/react/
│   ├── electron/
│   │   ├── main.ts
│   │   ├── preload.ts
│   │   └── ipc-handlers/
│   ├── services/ (Clientes para LLMs, etc.)
│   ├── workers/
│   │   └── agent.worker.ts
│   └── ioc/
│       ├── inversify.config.ts
│       └── types.ts
│
├── shared/ (Utils, tipos comuns, DTOs globais)
│
└── main.ts (Legado)
```

## 9. Plano de Transição e Conclusão

A transição para a nova arquitetura pode ser realizada de forma incremental para gerenciar riscos e entregar valor continuamente.

* **Fase 1:** Definição da arquitetura e configuração das fundações de DI.
* **Fase 2:** Implementação da camada de Domínio e Persistência (entidades, interfaces, repositórios).
* **Fase 3:** Implementação dos Casos de Uso, refatoração dos Handlers IPC e construção do sistema Worker/Fila.
* **Fase 4:** Refatoração da UI para se conectar aos novos handlers.
* **Fase 5:** Iteração, refinamento e adição de mais testes.

### Conclusão

Esta proposta estabelece uma base sólida, manutenível e escalável para o "project-wiz". Ao adotar os princípios da Clean Architecture, Object Calisthenics e DI, esperamos alcançar melhorias significativas na DX, na qualidade do código e na capacidade de evoluir o software. A refatoração da lógica de backend para um sistema robusto de Worker/Fila por Agente pavimenta o caminho para um processamento assíncrono poderoso e especializado, permitindo que a equipe construa novas funcionalidades com maior confiança e menor atrito. Acreditamos que o investimento nesta refatoração trará retornos significativos a longo prazo.
```
