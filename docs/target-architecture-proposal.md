# Proposta de Arquitetura Alvo para o Sistema

## 1. Introdução

Este documento descreve a proposta de uma nova arquitetura para o sistema "project-wiz". O objetivo principal desta refatoração é modernizar a base de código, melhorar a Experiência do Desenvolvedor (DX), aumentar a manutenibilidade, testabilidade e escalabilidade do sistema a longo prazo.

A análise inicial do sistema revelou uma arquitetura emergente com alguns desafios:
- **Ausência de Injeção de Dependência (DI):** Apesar da biblioteca InversifyJS estar presente, ela não é utilizada, levando à instanciação manual de dependências, o que dificulta a substituição de componentes e o gerenciamento do ciclo de vida das dependências.
- **Múltiplos Componentes de Backend Desconectados:** Identificamos uma simulação de agente PO/CTO ativa e um sistema de Worker/Job mais robusto que não parecem estar integrados entre si nem totalmente conectados à UI principal de forma clara.
- **Clareza Arquitetural:** A separação de responsabilidades entre diferentes partes do sistema (domínio, aplicação, infraestrutura) pode ser significativamente melhorada.

A nova arquitetura visa resolver esses pontos, fornecendo uma estrutura coesa e bem definida que facilitará o desenvolvimento de novas funcionalidades e a manutenção do código existente. Os benefícios esperados incluem:
- **Maior Produtividade do Desenvolvedor:** Código mais fácil de entender, modificar e testar.
- **Redução de Bugs:** Tipagem forte, DI e separação clara de responsabilidades ajudam a prevenir erros.
- **Facilidade de Manutenção:** Componentes desacoplados podem ser atualizados ou substituídos com menor impacto no restante do sistema.
- **Melhor Escalabilidade:** Uma arquitetura modular permite que o sistema cresça de forma mais organizada.

## 2. Princípios da Nova Arquitetura

A nova arquitetura será guiada pelos seguintes princípios fundamentais:

1.  **Clean Architecture (Arquitetura Limpa):**
    *   **Independência de Frameworks:** O código de domínio e as regras de negócio não dependerão de frameworks de UI, banco de dados ou outros detalhes de infraestrutura.
    *   **Testabilidade:** As regras de negócio podem ser testadas sem UI, banco de dados, servidor web ou qualquer elemento externo.
    *   **Independência de UI:** A UI pode mudar facilmente, sem alterar o resto do sistema.
    *   **Independência de Banco de Dados:** O tipo de banco de dados pode ser trocado sem afetar as regras de negócio.
    *   **Regra de Dependência:** As dependências de código fonte só podem apontar para dentro. Nada em um círculo interno pode saber qualquer coisa sobre algo em um círculo externo.

2.  **Object Calisthenics:**
    *   Um conjunto de 9 regras de "exercício" para design de código orientado a objetos que promovem código limpo, legível e de fácil manutenção. Essas regras serão detalhadas e exemplificadas em uma seção posterior. O foco é em classes pequenas, coesas e com responsabilidades bem definidas.

3.  **Injeção de Dependência (DI) com InversifyJS:**
    *   Utilizaremos InversifyJS para gerenciar as dependências entre os componentes do sistema.
    *   Isso promoverá o desacoplamento, facilitará a substituição de implementações e melhorará a testabilidade, permitindo o uso de mocks/stubs para dependências externas.

4.  **Developer Experience (DX):**
    *   A arquitetura deve ser intuitiva e fácil para os desenvolvedores entenderem e trabalharem.
    *   Boas práticas de nomenclatura, estrutura de diretórios clara e documentação (como este artefato) são essenciais.

5.  **Domain-Driven Design (DDD) - Elementos:**
    *   Embora não seja uma implementação completa de DDD, utilizaremos conceitos como Entidades ricas em comportamento e Value Objects para modelar o domínio de forma mais eficaz.

6.  **Single Responsibility Principle (SRP):**
    *   Cada classe ou módulo deve ter uma, e somente uma, razão para mudar.

7.  **Don't Repeat Yourself (DRY):**
    *   Evitar a duplicação de código sempre que possível.

## 3. Arquitetura em Camadas (Baseada em Clean Architecture)

A arquitetura do "project-wiz" será organizada em camadas, seguindo os princípios da Clean Architecture. Esta abordagem promove a separação de responsabilidades, melhora a testabilidade e a manutenibilidade, e garante que a lógica de negócios central seja independente de detalhes de infraestrutura e UI. As camadas principais são: Domínio, Aplicação (opcional), Infraestrutura e Apresentação (opcional). O fluxo de dependências será estritamente gerenciado, sempre apontando para o interior, em direção à camada de Domínio.

### 3.1. Camada de Domínio (`src/domain`)
A camada de Domínio é o coração do software. Ela contém a lógica de negócios pura e é completamente independente de qualquer detalhe de infraestrutura ou UI.

*   **Entidades (`entities/`):**
    *   Representam os objetos de negócio fundamentais do sistema (ex: `Job`, `Project`, `User`, `AIAgent`, `Task`).
    *   Encapsulam tanto o estado (atributos) quanto o comportamento (métodos) que opera sobre esse estado.
    *   São persistentes, ou seja, seu ciclo de vida geralmente transcende uma única operação.
    *   Seguirão os princípios de Object Calisthenics, sendo pequenas e coesas.
    *   Utilizarão Value Objects para atributos primitivos (ex: `EmailVO` em vez de `string` para email).
    *   Não terão conhecimento sobre como são persistidas ou apresentadas.

*   **Casos de Uso (Use Cases / Interactors) (`use-cases/`):**
    *   Implementam as regras de negócio específicas da aplicação, orquestrando o fluxo de dados entre as entidades e os repositórios.
    *   Representam as ações que o sistema pode realizar (ex: `CreateNewProjectUseCase`, `AssignTaskToAIAgentUseCase`).
    *   São independentes de frameworks e da UI. A UI (ou outro trigger) chama um caso de uso e recebe um resultado.
    *   Dependem de abstrações (interfaces) para interagir com a camada de infraestrutura (ex: `IJobRepository`).

*   **Interfaces de Repositório (Ports) (`repositories/`):**
    *   Definem os contratos (interfaces TypeScript) para as operações de persistência de dados.
    *   Exemplos: `IJobRepository`, `IProjectRepository`, `IUserRepository`.
    *   Permitem que os Casos de Uso e Serviços de Domínio permaneçam independentes das tecnologias de banco de dados específicas. As implementações concretas residem na camada de Infraestrutura.

*   **Serviços de Domínio (`services/`):**
    *   Contêm lógica de negócios significativa que não se encaixa naturalmente em uma única entidade.
    *   Operam sobre múltiplas entidades ou coordenam comportamentos complexos do domínio.
    *   São stateless (sem estado próprio), e suas dependências (outros serviços, repositórios) são injetadas.
    *   Exemplo: Um serviço que determina a prioridade de um `Job` com base em múltiplas regras de negócio e no estado de outros `Jobs` ou `Projects`.

### 3.2. Camada de Aplicação (`src/application`) - Opcional
Esta camada é opcional e, em muitos projetos, suas responsabilidades podem ser incorporadas pela camada de Domínio (especificamente pelos Casos de Uso) ou pela camada de Infraestrutura (no que tange à adaptação de dados para a UI). Se utilizada, ela serve como um intermediário e pode conter:

*   **DTOs (Data Transfer Objects) (`dtos/`):**
    *   Objetos simples usados para transferir dados entre camadas, especialmente entre os Casos de Uso e a camada de apresentação (UI) ou os Handlers IPC.
    *   Ajudam a desacoplar a estrutura interna das entidades do domínio dos dados expostos para o exterior.
    *   Podem incluir validação de dados de entrada/saída.

*   **Orquestração de Casos de Uso Complexos:**
    *   Se uma funcionalidade da aplicação requer a coordenação de múltiplos Casos de Uso de forma sequencial ou condicional, essa lógica de orquestração pode residir aqui.
    *   Pode também lidar com a tradução entre DTOs e os modelos de entrada/saída dos Casos de Uso.

*   **Serviços de Aplicação:**
    *   Tarefas que não são puramente lógica de domínio, mas também não são detalhes de infraestrutura. Por exemplo, enviar uma notificação após a conclusão de um caso de uso (onde o envio da notificação em si é um serviço de infraestrutura, mas a decisão de enviá-la pode ser uma regra de aplicação).

Para este projeto, inicialmente, tentaremos manter os Casos de Uso na camada de Domínio o mais abrangentes possível, minimizando a necessidade de uma camada de Aplicação separada, a menos que a complexidade da transferência de dados ou orquestração de fluxos se mostre significativa.

### 3.3. Camada de Infraestrutura (`src/infrastructure`)
A camada de Infraestrutura contém todas as implementações concretas e detalhes tecnológicos. Ela depende da camada de Domínio (através das interfaces/ports), mas o Domínio não depende dela. É onde o "mundo real" se conecta à lógica de negócios.

*   **Persistência (`infrastructure/persistence/`):**
    *   Implementações concretas das interfaces de repositório definidas no Domínio (ex: `DrizzleJobRepository` implementando `IJobRepository`).
    *   Utilizará Drizzle ORM para interagir com o banco de dados SQLite.
    *   Incluirá os esquemas do Drizzle, configurações de conexão com o banco de dados e scripts de migração.

*   **Interface do Usuário (UI) (`infrastructure/ui/react/`):**
    *   A aplicação React, incluindo:
        *   `main.tsx`: Ponto de entrada da UI.
        *   `pages/`: Componentes que representam as diferentes telas/rotas da aplicação, gerenciados pelo TanStack Router.
        *   `components/`: Componentes React reutilizáveis.
        *   `hooks/`: Hooks React customizados para lógica de UI.
        *   `services/`: Serviços específicos da UI (ex: para formatar dados para exibição, ou encapsular chamadas à API do Electron via `window.api`).
        *   Gerenciamento de estado da UI (se necessário, usando Zustand, Redux, ou Context API).
    *   Configuração de internacionalização (LinguiJS) e estilização (TailwindCSS).

*   **Lógica Específica do Electron (`infrastructure/electron/`):**
    *   `main.ts`: O ponto de entrada do processo principal do Electron. Responsável por criar janelas, gerenciar o ciclo de vida da aplicação e inicializar o container de DI.
    *   `preload.ts`: Script que expõe funcionalidades do backend (via IPC) de forma segura para a UI React (`window.api`).
    *   `ipc-handlers/`: Diretório contendo os manipuladores para os canais IPC. Estes handlers obterão instâncias de Casos de Uso do container de DI e executarão a lógica de negócios solicitada pela UI.

*   **Clientes de Serviços Externos (`infrastructure/services/`):**
    *   Implementações concretas para interagir com APIs ou serviços de terceiros.
    *   Exemplo: `DeepSeekLLMService` implementando uma interface `ILLMService` definida no Domínio para interagir com a API do DeepSeek.
    *   Outros serviços como embedding, logging, etc.

*   **Configuração de Injeção de Dependência (`infrastructure/ioc/`):**
    *   `inversify.config.ts`: Arquivo central para configurar o container InversifyJS. Define todos os bindings (como interfaces mapeiam para classes concretas e seus escopos).
    *   `types.ts`: Define os símbolos (identificadores de tipo) usados para a injeção de dependências.

### 3.4. Camada de Apresentação (`src/presentation`) - Opcional
Esta camada atua como um intermediário entre os Casos de Uso (Domínio/Aplicação) e a UI (Infraestrutura). Sua principal responsabilidade é adaptar os dados do formato dos Casos de Uso para um formato que seja facilmente consumível pela UI, e vice-versa.

*   **Presenters / ViewModels:**
    *   Classes ou funções que recebem dados dos Casos de Uso e os transformam em um modelo de visualização (ViewModel) adequado para uma tela ou componente específico.
    *   Podem lidar com formatação de datas, números, tradução de códigos para strings amigáveis, etc.
    *   Também podem receber dados da UI e transformá-los no formato esperado pelos Casos de Uso.

Em aplicações React, a lógica de apresentação muitas vezes é incorporada diretamente nos componentes React (especialmente com o uso de hooks customizados) ou em seletores de estado (se usando bibliotecas como Redux/Zustand). A necessidade de uma camada de Apresentação separada e formal (`src/presentation`) será avaliada com base na complexidade. Se a lógica de transformação de dados para a UI se tornar extensa e começar a poluir os componentes React, a introdução desta camada pode ser benéfica para manter os componentes focados apenas na renderização.

### 3.5. Fluxo de Dependências

A Regra de Dependência é um princípio fundamental da Clean Architecture e será estritamente seguida:

*   **As dependências de código fonte só podem apontar para dentro.**
*   Isso significa que as camadas externas dependem das camadas internas, mas as camadas internas não sabem nada sobre as camadas externas.
    *   A camada de **Infraestrutura** depende da camada de **Domínio** (e da camada de Aplicação, se existir). Ela implementa as interfaces definidas no Domínio.
    *   A camada de **Aplicação** (se existir) depende da camada de **Domínio**. Ela orquestra os Casos de Uso e Entidades do Domínio.
    *   A camada de **Domínio** não depende de nenhuma outra camada. Ela é o núcleo independente.

*   **Mecanismo de Inversão de Dependência:** Para permitir que o Domínio chame funcionalidades definidas na Infraestrutura (como persistência de dados), usamos o Princípio da Inversão de Dependência (DIP). O Domínio define interfaces (ports), e a Infraestrutura fornece implementações concretas dessas interfaces. A Injeção de Dependência (com InversifyJS) será o mecanismo para "conectar" essas implementações às interfaces em tempo de execução, sem que o Domínio precise conhecer as classes concretas da Infraestrutura.

Este fluxo garante que a lógica de negócios central permaneça isolada de mudanças em detalhes tecnológicos como banco de dados, frameworks de UI ou APIs de terceiros, aumentando a manutenibilidade e testabilidade do sistema.

## 4. Injeção de Dependência (DI) com InversifyJS

A Injeção de Dependência (DI) é um padrão de design crucial que promove o desacoplamento entre os componentes do software. Em vez de um objeto criar suas próprias dependências ou buscá-las ativamente, as dependências são fornecidas (injetadas) de uma fonte externa (um container de DI). Isso torna o código mais modular, testável e fácil de manter.

Neste projeto, utilizaremos a biblioteca **InversifyJS** para implementar a DI. InversifyJS é um container de DI leve e poderoso para aplicações JavaScript e TypeScript, que usa decoradores para gerenciar dependências.

Os principais benefícios que buscamos com InversifyJS são:
- **Desacoplamento:** Classes não precisam conhecer as implementações concretas de suas dependências, apenas suas interfaces.
- **Testabilidade:** Facilita a substituição de dependências por mocks ou stubs em testes unitários.
- **Configuração Centralizada:** As "ligações" (bindings) entre interfaces e suas implementações concretas são definidas em um local central, o container de DI.
- **Gerenciamento do Ciclo de Vida:** InversifyJS pode gerenciar o ciclo de vida dos objetos que cria (ex: singleton, transitório).

### 4.1. Configuração do Container (`infrastructure/ioc/inversify.config.ts`)
O coração do InversifyJS é o `Container`. Um arquivo, tipicamente localizado em `src/infrastructure/ioc/inversify.config.ts`, será responsável por criar e configurar este container.

**Exemplo de Estrutura (`inversify.config.ts`):**

```typescript
import 'reflect-metadata'; // Deve ser importado uma vez no ponto de entrada da aplicação
import { Container } from 'inversify';
import { TYPES } from './types';

// Importações das Interfaces (Abstrações)
import { IJobRepository } from '@/domain/repositories/i-job.repository';
import { IUserRepository } from '@/domain/repositories/i-user.repository';
import { ILLMService } from '@/domain/services/i-llm.service';
import { CreateJobUseCase } from '@/domain/use-cases/job/create-job.use-case';
// ... outras interfaces e casos de uso

// Importações das Implementações Concretas
import { DrizzleJobRepository } from '@/infrastructure/persistence/drizzle/job.repository';
import { DrizzleUserRepository } from '@/infrastructure/persistence/drizzle/user.repository';
import { DeepSeekLLMService } from '@/infrastructure/services/deepseek.service';
// ... outras implementações

// Criação do Container
const container = new Container();

// --- Bindings para Repositórios ---
container.bind<IJobRepository>(TYPES.IJobRepository).to(DrizzleJobRepository).inSingletonScope();
container.bind<IUserRepository>(TYPES.IUserRepository).to(DrizzleUserRepository).inSingletonScope();

// --- Bindings para Serviços Externos ---
container.bind<ILLMService>(TYPES.ILLMService).to(DeepSeekLLMService).inSingletonScope();

// --- Bindings para Casos de Uso ---
// Casos de Uso geralmente são transitórios, a menos que tenham estado interno gerenciável
container.bind<CreateJobUseCase>(TYPES.CreateJobUseCase).to(CreateJobUseCase).inTransientScope();
// ... outros casos de uso

// --- Bindings para Handlers IPC (se eles forem classes injetáveis) ---
// Exemplo:
// import { JobHandlers } from '@/infrastructure/electron/ipc-handlers/job.handlers';
// container.bind<JobHandlers>(TYPES.JobHandlers).to(JobHandlers).inSingletonScope();


export { container };
```

**Principais Pontos da Configuração:**

*   **`reflect-metadata`:** Esta biblioteca é um requisito do InversifyJS e deve ser importada uma vez, geralmente no ponto de entrada principal da aplicação que inicializa o container (ex: `src/infrastructure/electron/main.ts`).
*   **`Container`:** Instância principal do InversifyJS.
*   **`bind<Interface>(TYPE).to(Implementation)`:** É como registramos uma dependência. Diz ao container: "Quando alguém pedir por `Interface` (identificada pelo símbolo `TYPE`), forneça uma instância de `Implementation`".
*   **Escopos (`inSingletonScope()`, `inTransientScope()`):**
    *   `inSingletonScope()`: Garante que apenas uma instância da dependência seja criada e reutilizada em toda a aplicação. Ideal para repositórios, serviços stateless, ou configurações.
    *   `inTransientScope()`: Cria uma nova instância da dependência cada vez que ela é solicitada. Geralmente usado para Casos de Uso ou classes que mantêm estado por operação.
    *   `inRequestScope()`: (Menos comum em backends Electron, mais para servidores web) Cria uma instância por "requisição".

Este arquivo `inversify.config.ts` será o local central para gerenciar como todas as principais dependências do sistema são construídas e conectadas.
### 4.2. Definição de Tipos/Símbolos (`infrastructure/ioc/types.ts`)
Para que o InversifyJS possa identificar unicamente os diferentes tipos de dependências que queremos injetar (especialmente interfaces, já que elas não existem em tempo de execução no JavaScript), usamos símbolos. Um arquivo, tipicamente `src/infrastructure/ioc/types.ts`, é usado para definir esses símbolos.

**Exemplo de Estrutura (`types.ts`):**

```typescript
const TYPES = {
  // Repositórios
  IJobRepository: Symbol.for('IJobRepository'),
  IUserRepository: Symbol.for('IUserRepository'),
  IProjectRepository: Symbol.for('IProjectRepository'),
  // Adicionar outras interfaces de repositório aqui

  // Serviços de Domínio/Aplicação/Infraestrutura
  ILLMService: Symbol.for('ILLMService'),
  IEmbeddingService: Symbol.for('IEmbeddingService'),
  // Adicionar outras interfaces de serviço aqui

  // Casos de Uso
  CreateJobUseCase: Symbol.for('CreateJobUseCase'),
  CreateProjectUseCase: Symbol.for('CreateProjectUseCase'),
  AssignTaskToAIAgentUseCase: Symbol.for('AssignTaskToAIAgentUseCase'),
  // Adicionar outros casos de uso aqui

  // Handlers IPC (se forem classes injetáveis)
  JobHandlers: Symbol.for('JobHandlers'),
  ProjectHandlers: Symbol.for('ProjectHandlers'),
  // Adicionar outros handlers aqui

  // Outras dependências específicas
  DatabaseConnection: Symbol.for('DatabaseConnection'), // Exemplo, se a conexão do DB for injetada
};

export { TYPES };
```

**Uso dos Símbolos:**
Estes símbolos são usados tanto no arquivo `inversify.config.ts` (para registrar os bindings) quanto nas classes que recebem injeções (usando o decorador `@inject(TYPES.AlgumSimbolo)`). `Symbol.for('NomeDoSimbolo')` cria um símbolo global único, o que é útil para evitar colisões e garantir que o mesmo símbolo seja usado em diferentes partes da aplicação.
### 4.3. Exemplos de Uso (`@injectable`, `@inject`)
Com o container configurado e os tipos definidos, podemos usar os decoradores do InversifyJS para tornar as classes gerenciáveis pelo container e para injetar suas dependências.

**Tornando uma Classe Injetável (`@injectable()`):**
Qualquer classe que precise ter dependências injetadas nela, ou que precise ser injetada em outras classes, deve ser marcada com o decorador `@injectable()`.

```typescript
// Exemplo: Implementação de um Repositório
// src/infrastructure/persistence/drizzle/job.repository.ts
import { injectable, inject } from 'inversify';
import { TYPES } from '@/infrastructure/ioc/types';
import { IJobRepository } from '@/domain/repositories/i-job.repository';
import { Job } from '@/domain/entities/job.entity';
// Suponha que 'DrizzleClient' seja um tipo para o cliente DB (ex: db de drizzle/index.ts)
// e que ele também seja gerenciado por DI (ou passado de outra forma)
// import { DrizzleClient } from './drizzle-client';

@injectable()
export class DrizzleJobRepository implements IJobRepository {
  private readonly db; //: DrizzleClient;

  // Exemplo de injeção de outra dependência (se necessário)
  // constructor(@inject(TYPES.DatabaseConnection) db: DrizzleClient) {
  //   this.db = db;
  // }
  constructor() {
    // Em um cenário real, o cliente Drizzle (db) seria injetado
    // ou a classe DrizzleJobRepository receberia a instância do 'db'
    // de forma que não o crie internamente, para melhor testabilidade.
    // Por simplicidade neste exemplo, vamos omitir a injeção do db aqui,
    // mas na implementação final, ele viria do container ou seria passado.
    // this.db = require('@/infrastructure/services/drizzle').db; // Evitar isso na prática
  }

  async findById(id: string): Promise<Job | null> {
    // Lógica para buscar job usando this.db
    console.log(`Buscando Job com ID: ${id} (implementação pendente)`);
    return null;
  }

  async save(job: Job): Promise<void> {
    // Lógica para salvar job usando this.db
    console.log(`Salvando Job: ${job.name} (implementação pendente)`);
  }
  // ... outros métodos da interface
}
```

**Injetando Dependências (`@inject()`):**
As dependências são declaradas no construtor da classe e marcadas com o decorador `@inject(TYPES.NomeDoSimbolo)`.

```typescript
// Exemplo: Um Caso de Uso
// src/domain/use-cases/job/create-job.use-case.ts
import { injectable, inject } from 'inversify';
import { TYPES } from '@/infrastructure/ioc/types';
import { IJobRepository } from '@/domain/repositories/i-job.repository';
import { Job } from '@/domain/entities/job.entity';

interface CreateJobInput {
  name: string;
  // ... outros campos necessários
}

@injectable()
export class CreateJobUseCase {
  private jobRepository: IJobRepository;

  constructor(
    @inject(TYPES.IJobRepository) jobRepository: IJobRepository
  ) {
    this.jobRepository = jobRepository;
  }

  async execute(input: CreateJobInput): Promise<Job> {
    // Validação da entrada (pode ser um Value Object ou validação aqui)
    const job = Job.create({ name: input.name /* ...outros dados */ }); // Supõe um método estático na entidade
    await this.jobRepository.save(job);
    return job;
  }
}
```

**Obtendo Instâncias do Container:**
No ponto de entrada da aplicação ou em locais estratégicos (como na criação dos Handlers IPC), você obterá instâncias do container:

```typescript
// Exemplo em src/infrastructure/electron/main.ts ou em um handler IPC
import { container } from '@/infrastructure/ioc/inversify.config';
import { TYPES } from '@/infrastructure/ioc/types';
import { CreateJobUseCase } from '@/domain/use-cases/job/create-job.use-case';

// ...

// Em um handler IPC, por exemplo:
// ipcMain.handle('usecase:create-job', async (event, jobData) => {
//   const createJobUseCase = container.get<CreateJobUseCase>(TYPES.CreateJobUseCase);
//   return await createJobUseCase.execute(jobData);
// });
```

Seguindo esses padrões, o InversifyJS ajudará a criar um sistema bem estruturado, onde as dependências são claramente definidas e gerenciadas externamente, facilitando a evolução e o teste do software.

## 5. Proposta de Organização de Diretórios Detalhada

A seguir, é apresentada a proposta para a organização de diretórios dentro da pasta `src/`. Esta estrutura visa refletir a separação de camadas da Clean Architecture e facilitar a navegação e localização dos diferentes componentes do sistema.

```
src/
├── domain/                     # Lógica de negócios pura, independente de frameworks
│   ├── entities/               # Entidades de negócio (ex: Job, Project, User, AIAgent)
│   │   ├── value-objects/      # Objetos de Valor (ex: EmailVO, JobIdVO, TaskStatusVO)
│   │   ├── job.entity.ts
│   │   └── ...
│   ├── use-cases/              # Casos de uso da aplicação
│   │   ├── job/                # Agrupado por funcionalidade/entidade principal
│   │   │   ├── create-job.use-case.ts
│   │   │   └── get-job-details.use-case.ts
│   │   ├── project/
│   │   │   └── create-project.use-case.ts
│   │   └── ...
│   ├── repositories/           # Interfaces (Ports) para os repositórios de dados
│   │   ├── i-job.repository.ts
│   │   └── i-project.repository.ts
│   └── services/               # Serviços de domínio (lógica de negócio que não cabe em uma entidade)
│       └── job-priority.service.ts
│
├── application/                # (Opcional) Regras de negócio da aplicação, DTOs
│   ├── dtos/                   # Data Transfer Objects (se necessário para casos de uso)
│   │   ├── job.dto.ts
│   │   └── ...
│   └── services/               # Serviços de aplicação (orquestração, etc.)
│
├── infrastructure/             # Implementações concretas, frameworks, ferramentas
│   ├── persistence/            # Lógica de persistência de dados
│   │   ├── drizzle/            # Implementação com Drizzle ORM
│   │   │   ├── repositories/   # Implementações concretas dos repositórios
│   │   │   │   ├── job.repository.ts
│   │   │   │   └── user.repository.ts
│   │   │   ├── mappers/        # (Opcional) Mapeadores entre entidades de domínio e modelos de DB
│   │   │   ├── schema.ts       # Esquemas do Drizzle para as tabelas do DB
│   │   │   └── migrations/     # Arquivos de migração do Drizzle
│   │   └── database.ts         # Configuração da conexão com o banco de dados
│   │
│   ├── ui/                     # Interface do Usuário
│   │   └── react/              # Código específico do React
│   │       ├── main.tsx        # Ponto de entrada da aplicação React
│   │       ├── App.tsx         # Componente raiz da aplicação (com RouterProvider, etc.)
│   │       ├── pages/          # Componentes de página (associados a rotas)
│   │       │   ├── project/
│   │       │   │   └── ProjectDetailsPage.tsx
│   │       │   └── HomePage.tsx
│   │       ├── components/       # Componentes React reutilizáveis
│   │       │   ├── common/       # Componentes genéricos (Button, Input, Modal)
│   │       │   └── job/          # Componentes específicos para a funcionalidade de Job
│   │       │       └── JobList.tsx
│   │       ├── hooks/            # Hooks React customizados
│   │       ├── services/         # Serviços específicos da UI (chamadas à API Electron, formatação)
│   │       ├── contexts/         # (Opcional) Contextos React para estado global simples
│   │       ├── routes/           # Configuração de rotas (TanStack Router)
│   │       │   └── routeTree.gen.ts # Arquivo gerado pelo TanStack Router
│   │       ├── assets/           # Imagens, fontes, etc.
│   │       └── styles/           # CSS global, temas (Tailwind config aqui ou na raiz)
│   │
│   ├── electron/               # Lógica específica do Electron
│   │   ├── main.ts             # Ponto de entrada do processo principal do Electron
│   │   ├── preload.ts          # Script de preload para a ponte Main <-> Renderer
│   │   └── ipc-handlers/       # Manipuladores de eventos IPC
│   │       ├── job.handlers.ts
│   │       ├── project.handlers.ts
│   │       └── index.ts          # (Opcional) Para agregar e exportar handlers
│   │
│   ├── services/               # Clientes para serviços externos
│   │   ├── llm/                # Serviços relacionados a LLMs
│   │   │   └── deepseek.service.ts
│   │   ├── embedding/
│   │   │   └── embedding.service.ts
│   │   └── logging/
│   │       └── logger.service.ts
│   │
│   └── ioc/                    # Configuração da Injeção de Dependência
│       ├── inversify.config.ts # Configuração do container InversifyJS
│       └── types.ts            # Definição dos símbolos (TYPES) para DI
│
├── shared/                     # Código utilitário compartilhado entre camadas
│   ├── utils/                  # Funções utilitárias genéricas (datas, strings, etc.)
│   ├── types/                  # Tipos TypeScript comuns, não específicos de domínio
│   └── constants/              # Constantes globais
│
└── main.ts                     # (Legado) Ponto de entrada original do backend.
                                # Sua lógica será refatorada e distribuída
                                # principalmente para `infrastructure/electron/main.ts`
                                # e para os casos de uso e serviços no domínio.
```

**Considerações Adicionais:**

*   **`src/application`:** Esta camada é marcada como opcional. Se os DTOs e a orquestração de casos de uso forem simples, podem ser incorporados diretamente nos casos de uso do domínio ou nos handlers/UI.
*   **`mappers` em `persistence`:** Se a estrutura das entidades de domínio divergir significativamente dos esquemas do banco de dados, uma camada de mapeadores pode ser útil para converter entre os dois.
*   **Testes:** Diretórios de teste (ex: `__tests__` ou `*.spec.ts`, `*.test.ts`) seriam colocados próximos aos arquivos que testam, ou em um diretório `tests/` na raiz, espelhando a estrutura de `src/`. (Embora a criação de testes formais tenha sido despriorizada pelo usuário, a estrutura deve permitir isso).

Esta organização de diretórios visa fornecer uma separação clara de responsabilidades, tornando o sistema mais fácil de entender, manter e escalar.

## 6. Entidades e Casos de Uso Chave (Exemplos Detalhados)

Nesta seção, apresentamos exemplos mais detalhados de como algumas entidades de domínio e casos de uso chave seriam estruturados na nova arquitetura. Os exemplos visam ilustrar a aplicação dos princípios de Clean Architecture, Object Calisthenics e o uso de Injeção de Dependência. O código apresentado é um pseudocódigo/exemplo conceitual em TypeScript para fins ilustrativos.

### 6.1. Exemplo de Entidade: `Job`
A entidade `Job` representa uma unidade de trabalho a ser processada no sistema, possivelmente por um agente de IA ou um worker.

**Localização:** `src/domain/entities/job.entity.ts`

**Princípios Aplicados:**
*   **Encapsulamento:** O estado interno do `Job` (como `status`, `attempts`) é privado e só pode ser modificado através de métodos que representam comportamentos de negócio (ex: `start`, `complete`, `fail`).
*   **Value Objects:** IDs, nomes, status e outros atributos primitivos seriam representados por Value Objects (ex: `JobId`, `JobName`, `JobStatusVO`) para garantir validade e significado. (Omitido no exemplo abaixo por brevidade, mas seriam usados).
*   **Pequenas Entidades:** A classe foca apenas nas responsabilidades diretas de um Job.
*   **Sem Setters Públicos:** O estado é alterado por comportamentos.

**Exemplo Conceitual:**

```typescript
// src/domain/entities/value-objects/job-status.vo.ts
export class JobStatusVO {
  private static readonly VALID_STATUSES = ['PENDING', 'ACTIVE', 'COMPLETED', 'FAILED', 'DELAYED'] as const;
  readonly value: typeof JobStatusVO.VALID_STATUSES[number];

  private constructor(status: typeof JobStatusVO.VALID_STATUSES[number]) {
    this.value = status;
  }

  static create(status: string): JobStatusVO {
    if (!JobStatusVO.VALID_STATUSES.includes(status as any)) {
      throw new Error(`Invalid job status: ${status}`);
    }
    return new JobStatusVO(status as any);
  }

  is(status: string): boolean {
    return this.value === status;
  }
  // Outros métodos auxiliares para transição de status poderiam estar aqui ou na entidade Job.
}


// src/domain/entities/job.entity.ts
// import { JobIdVO } from './value-objects/job-id.vo'; // Exemplo de VO
// import { JobStatusVO } from './value-objects/job-status.vo';

export interface JobProps {
  id: string; // JobIdVO
  name: string;
  payload: any; // Dados específicos para a execução do job
  status: JobStatusVO;
  attempts: number;
  maxAttempts: number;
  result?: any;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  projectId?: string; // ProjectIdVO
  assignedToAgentId?: string; // AIAgentIdVO
}

export class Job {
  private props: JobProps;

  private constructor(props: JobProps) {
    this.props = props;
  }

  public static create(params: {
    id?: string; // Opcional, pode ser gerado
    name: string;
    payload: any;
    projectId?: string;
    maxAttempts?: number;
  }): Job {
    const now = new Date();
    const id = params.id || crypto.randomUUID(); // Usar UUID real
    return new Job({
      id,
      name: params.name,
      payload: params.payload,
      status: JobStatusVO.create('PENDING'),
      attempts: 0,
      maxAttempts: params.maxAttempts || 3,
      createdAt: now,
      updatedAt: now,
      projectId: params.projectId,
    });
  }

  // Getters para acesso controlado (apenas leitura do estado)
  get id(): string { return this.props.id; }
  get name(): string { return this.props.name; }
  get status(): string { return this.props.status.value; }
  get payload(): any { return this.props.payload; }
  get attempts(): number { return this.props.attempts; }


  // Comportamentos de Negócio
  public startProcessing(): void {
    if (!this.props.status.is('PENDING') && !this.props.status.is('DELAYED')) {
      throw new Error('Job cannot be started in its current state.');
    }
    this.props.status = JobStatusVO.create('ACTIVE');
    this.props.attempts += 1;
    this.props.updatedAt = new Date();
  }

  public complete(result: any): void {
    if (!this.props.status.is('ACTIVE')) {
      throw new Error('Job cannot be completed if not active.');
    }
    this.props.status = JobStatusVO.create('COMPLETED');
    this.props.result = result;
    this.props.updatedAt = new Date();
  }

  public fail(error: string): void {
    if (!this.props.status.is('ACTIVE')) {
      // Pode haver lógicas diferentes se falhar de outros estados
    }
    this.props.status = JobStatusVO.create('FAILED');
    this.props.error = error;
    this.props.updatedAt = new Date();

    if (this.props.attempts >= this.props.maxAttempts) {
      // Lógica para falha permanente, talvez mover para um status 'PERMANENTLY_FAILED'
      console.error(`Job ${this.id} failed permanently after ${this.props.attempts} attempts.`);
    }
  }

  public canRetry(): boolean {
    return this.props.status.is('FAILED') && this.props.attempts < this.props.maxAttempts;
  }

  public markAsPendingRetry(): void {
    if (!this.canRetry()) {
        throw new Error('Job cannot be marked for retry.');
    }
    this.props.status = JobStatusVO.create('PENDING'); // Ou 'DELAYED' com cálculo de delay
    this.props.updatedAt = new Date();
  }

  // Outros métodos como assignToAgent, setPriority, etc.
}
```
### 6.2. Exemplo de Entidade: `AIAgent`
A entidade `AIAgent` (ou um nome similar como `AIWorkerProfile`, `AIModelExecutor`) representaria a configuração e o estado de um agente de IA capaz de executar jobs ou tarefas.

**Localização:** `src/domain/entities/ai-agent.entity.ts`

**Princípios Aplicados:**
*   **Coesão:** Agrupa informações sobre a configuração do modelo de IA (ID do modelo, provedor), suas capacidades (ferramentas que pode usar) e seu estado atual (ex: ocupado, ocioso).
*   **Comportamento:** Poderia ter métodos para atribuir uma tarefa, verificar disponibilidade, ou atualizar suas configurações.

**Exemplo Conceitual:**

```typescript
// src/domain/entities/ai-agent.entity.ts

// Supondo Value Objects como AIAgentId, ModelProviderVO, LLMModelIdVO
// Supondo uma entidade Tool ou ToolDefinition

export interface AIAgentProps {
  id: string; // AIAgentIdVO
  name: string;
  roleDescription: string; // Descrição para o prompt do sistema
  modelId: string; // LLMModelIdVO (ex: "deepseek:deepseek-chat")
  provider: string; // ModelProviderVO (ex: "deepseek")
  temperature: number;
  availableTools: string[]; // Array de IDs ou nomes de ferramentas que o agente pode usar
  isActive: boolean;
  // Outras configurações específicas do agente
}

export class AIAgent {
  private props: AIAgentProps;

  private constructor(props: AIAgentProps) {
    this.props = props;
  }

  public static create(params: {
    name: string;
    roleDescription: string;
    modelId: string;
    provider: string;
    temperature?: number;
    availableTools?: string[];
  }): AIAgent {
    const id = crypto.randomUUID(); // Gerar ID
    return new AIAgent({
      id,
      name: params.name,
      roleDescription: params.roleDescription,
      modelId: params.modelId,
      provider: params.provider,
      temperature: params.temperature || 0.7,
      availableTools: params.availableTools || [],
      isActive: true,
    });
  }

  get id(): string { return this.props.id; }
  get name(): string { return this.props.name; }
  get modelId(): string { return this.props.modelId; }
  get roleDescription(): string { return this.props.roleDescription; }

  public updateConfiguration(updateData: Partial<Pick<AIAgentProps, 'temperature' | 'availableTools' | 'modelId'>>): void {
    this.props = { ...this.props, ...updateData };
    // Adicionar lógica de validação se necessário
  }

  public activate(): void {
    this.props.isActive = true;
  }

  public deactivate(): void {
    this.props.isActive = false;
  }

  public canExecuteJob(job: Job): boolean {
    // Lógica para verificar se o agente tem as capacidades/ferramentas necessárias para o job
    // Por exemplo, verificar se `job.requiredCapabilities` está contido em `this.props.availableTools`
    return this.props.isActive; // Simplificado
  }
}
```
### 6.3. Exemplo de Caso de Uso: `CreateProjectUseCase`
Este caso de uso seria responsável por criar um novo projeto no sistema.

**Localização:** `src/domain/use-cases/project/create-project.use-case.ts`

**Princípios Aplicados:**
*   **Injeção de Dependência:** Recebe a interface `IProjectRepository` (e outras dependências, se necessário) via construtor.
*   **Entrada/Saída Definidas:** Usa interfaces (ou tipos) para os dados de entrada e saída.
*   **Orquestração:** Cria a entidade `Project` e a persiste usando o repositório.

**Exemplo Conceitual:**

```typescript
// src/domain/use-cases/project/create-project.use-case.ts
import { injectable, inject } from 'inversify';
import { TYPES } from '@/infrastructure/ioc/types'; // Supondo que TYPES seja definido
import { IProjectRepository } from '@/domain/repositories/i-project.repository';
import { Project, ProjectProps } from '@/domain/entities/project.entity'; // Supondo a entidade Project

export interface CreateProjectInput {
  name: string;
  description?: string;
  userId: string; // Dono do projeto
}

export interface CreateProjectOutput {
  projectId: string;
  name: string;
  createdAt: Date;
}

@injectable()
export class CreateProjectUseCase {
  private projectRepository: IProjectRepository;

  constructor(
    @inject(TYPES.IProjectRepository) projectRepository: IProjectRepository
    // @inject(TYPES.IUserRepository) private userRepository: IUserRepository, // Exemplo de outra dependência
  ) {
    this.projectRepository = projectRepository;
  }

  async execute(input: CreateProjectInput): Promise<CreateProjectOutput> {
    // Validação: Verificar se o usuário existe (exemplo)
    // const user = await this.userRepository.findById(input.userId);
    // if (!user) {
    //   throw new Error('User not found');
    // }

    const project = Project.create({
      name: input.name,
      description: input.description,
      ownerUserId: input.userId, // Ajustar conforme a entidade Project
    });

    await this.projectRepository.save(project);

    return {
      projectId: project.id,
      name: project.name,
      createdAt: project.createdAt, // Supondo que a entidade tenha createdAt
    };
  }
}
```
### 6.4. Exemplo de Caso de Uso: `EnqueueJobUseCase`
Este caso de uso seria responsável por criar um novo `Job` e adicioná-lo a uma fila para processamento.

**Localização:** `src/domain/use-cases/job/enqueue-job.use-case.ts`

**Princípios Aplicados:**
*   **Injeção de Dependência:** Recebe `IJobRepository` e, potencialmente, um `IJobQueueService` ou similar.
*   **Foco Único:** Sua responsabilidade é criar e enfileirar o job.

**Exemplo Conceitual:**

```typescript
// src/domain/use-cases/job/enqueue-job.use-case.ts
import { injectable, inject } from 'inversify';
import { TYPES } from '@/infrastructure/ioc/types';
import { IJobRepository } from '@/domain/repositories/i-job.repository';
// Poderia haver um IJobQueueService para abstrair a lógica de "enfileiramento"
// import { IJobQueueService } from '@/domain/services/i-job-queue.service';
import { Job } from '@/domain/entities/job.entity';

export interface EnqueueJobInput {
  name: string;
  payload: any;
  projectId?: string;
  // Outros parâmetros como prioridade, delay, etc.
}

export interface EnqueueJobOutput {
  jobId: string;
  status: string;
}

@injectable()
export class EnqueueJobUseCase {
  constructor(
    @inject(TYPES.IJobRepository) private jobRepository: IJobRepository
    // @inject(TYPES.IJobQueueService) private jobQueueService: IJobQueueService
  ) {}

  async execute(input: EnqueueJobInput): Promise<EnqueueJobOutput> {
    const job = Job.create({
      name: input.name,
      payload: input.payload,
      projectId: input.projectId,
    });

    // Na Clean Architecture, o repositório geralmente lida com a persistência.
    // Se "enfileirar" significa apenas salvar com status PENDING, o repositório é suficiente.
    // Se "enfileirar" envolve um sistema de filas externo (Redis, RabbitMQ),
    // então um IJobQueueService seria mais apropriado aqui para encapsular essa interação.
    // Por simplicidade, vamos assumir que salvar no repositório com status PENDING é "enfileirar".
    await this.jobRepository.save(job);

    // Exemplo se usasse um serviço de fila:
    // await this.jobQueueService.enqueue(job);

    return {
      jobId: job.id,
      status: job.status,
    };
  }
}
```

## 7. Aplicação de Object Calisthenics

Object Calisthenics é um conjunto de nove regras de "exercício" para escrever código orientado a objetos melhor. Elas ajudam a criar código mais legível, manutenível e com responsabilidades bem definidas. Aplicaremos estas regras em todo o desenvolvimento do domínio e, sempre que prático, nas outras camadas.

1.  **Um Nível de Indentação por Método:**
    *   **Explicação:** Métodos devem ter apenas um nível de indentação. Isso força a extração de lógica complexa para métodos menores e mais focados.
    *   **Aplicação Prática:** Em um Caso de Uso, se houver múltiplos `if`s aninhados para validação, cada bloco de validação pode ser extraído para um método privado.
        ```typescript
        // Mau:
        // class ProcessOrderUseCase {
        //   execute(order) {
        //     if (order.isValid) {
        //       if (order.hasInventory) {
        //         // ...
        //       }
        //     }
        //   }
        // }

        // Bom:
        // class ProcessOrderUseCase {
        //   execute(order) {
        //     this.ensureOrderIsValid(order);
        //     this.ensureInventoryIsAvailable(order);
        //     // ...
        //   }
        //   private ensureOrderIsValid(order) { /* ... */ }
        //   private ensureInventoryIsAvailable(order) { /* ... */ }
        // }
        ```
        No nosso exemplo `Job.entity.ts`, métodos como `startProcessing` ou `fail` devem evitar múltiplos `if`s aninhados, extraindo condições para métodos privados ou usando early returns.

2.  **Não Use a Palavra-Chave `ELSE`:**
    *   **Explicação:** O uso de `else` pode muitas vezes ser substituído por `return` antecipado (early return), polimorfismo ou outras construções que tornam o fluxo de controle mais claro.
    *   **Aplicação Prática:**
        ```typescript
        // Mau:
        // function checkAccess(user) {
        //   if (user.isAdmin) {
        //     return true;
        //   } else {
        //     return false;
        //   }
        // }

        // Bom (early return):
        // function checkAccess(user) {
        //   if (user.isAdmin) {
        //     return true;
        //   }
        //   return false;
        // }
        ```
        No método `Job.fail()`, se houvesse diferentes lógicas para diferentes status antes da falha, poderíamos usar early returns para cada condição em vez de `if-else if-else`.

3.  **Envolva Todos os Primitivos e Strings em Value Objects:**
    *   **Explicação:** Tipos primitivos (string, number, boolean) e Strings muitas vezes não carregam significado de negócio. Envolvê-los em classes pequenas (Value Objects) adiciona semântica, validação e comportamento.
    *   **Aplicação Prática:** Em vez de `job.status: string`, teremos `job.status: JobStatusVO`. Em vez de `user.email: string`, teremos `user.email: EmailVO`.
        *   O `JobStatusVO` (como esboçado anteriormente) validaria se o status é um dos permitidos (`PENDING`, `ACTIVE`, etc.) e poderia conter métodos como `isPending()`.
        *   Um `EmailVO` validaria o formato do email em sua construção.

4.  **Coleções de Primeira Classe (First-Class Collections):**
    *   **Explicação:** Se uma classe contém uma coleção (array, lista, map), crie uma classe dedicada para essa coleção. Essa nova classe encapsulará todos os comportamentos relacionados à manipulação e consulta da coleção.
    *   **Aplicação Prática:** Se um `Project` tivesse uma lista de `Jobs`, em vez de `project.jobs: Job[]`, poderíamos ter `project.jobs: JobList`, onde `JobList` teria métodos como `getActiveJobs()`, `getFailedJobs()`, `addJob(job: Job)`.
        ```typescript
        // class JobList {
        //   private jobs: Job[];
        //   constructor(initialJobs: Job[] = []) { this.jobs = initialJobs; }
        //   add(job: Job): void { /* ... */ }
        //   getFailedJobs(): Job[] { /* ... */ }
        // }
        ```

5.  **Um Ponto por Linha (Law of Demeter - Forma Estrita):**
    *   **Explicação:** Um método só deve chamar métodos de objetos que são:
        1.  O próprio objeto (`this`).
        2.  Parâmetros do método.
        3.  Objetos que ele cria/instancia.
        4.  Dependências diretas do objeto (variáveis de instância).
        Evita encadeamentos longos como `a.getB().getC().doSomething()`.
    *   **Aplicação Prática:** Em um Caso de Uso, em vez de `job.getProject().getOwner().getEmail()`, o `Job` poderia ter um método `getOwnerEmail()` que encapsula essa navegação, ou o Caso de Uso obteria o `Project` e depois o `Owner` separadamente se precisasse de ambos.

6.  **Não Abrevie:**
    *   **Explicação:** Use nomes completos e descritivos para classes, métodos e variáveis. Abreviações podem economizar digitação, mas custam clareza.
    *   **Aplicação Prática:** `IJobRepository` em vez de `IJobRepo`. `CreateProjectUseCase` em vez de `CrtPrjUC`.

7.  **Mantenha Todas as Entidades Pequenas (Máximo 50 Linhas):**
    *   **Explicação:** Classes devem ser pequenas e focadas em uma única responsabilidade. Um limite de linhas (ex: 50 ou 100) é um guia para forçar essa coesão.
    *   **Aplicação Prática:** Se a entidade `Job` começar a ter muitas responsabilidades (ex: lógica de notificação, lógica de agendamento complexa, etc.), essas responsabilidades seriam extraídas para classes separadas (Serviços de Domínio ou outras Entidades). O nosso exemplo de `Job.entity.ts` já é relativamente conciso.

8.  **Nenhuma Classe com Mais de Duas Variáveis de Instância:**
    *   **Explicação:** Esta é uma das regras mais desafiadoras. Força uma alta coesão, fazendo com que as classes modelem uma única abstração de forma muito clara. Muitas vezes, leva à criação de mais classes pequenas que encapsulam conceitos relacionados.
    *   **Aplicação Prática:** Para a entidade `Job`, que naturalmente tem muitas propriedades (`id`, `name`, `status`, `payload`, etc.), aplicar esta regra estritamente exigiria agrupar essas propriedades em objetos menores. Por exemplo, `JobDetails { name, payload }`, `JobState { status, attempts, result }`. A `Job` então conteria `id: JobIdVO` e `details: JobDetails`, `state: JobState`.
        Isso pode ser flexibilizado, mas o princípio é evitar classes que acumulam muitos campos diferentes sem um forte elo conceitual entre todos eles. No nosso `JobProps`, já temos um agrupamento.

9.  **Sem Getters/Setters/Propriedades Públicas para Alteração de Estado:**
    *   **Explicação:** O estado de um objeto só deve ser modificado através de métodos que representam comportamentos de negócio explícitos (Tell, Don't Ask). Getters para leitura de estado são permitidos, mas setters que simplesmente atribuem um valor a um campo são desencorajados.
    *   **Aplicação Prática:** Na nossa entidade `Job`:
        *   Temos getters como `job.id`, `job.status`.
        *   Não temos um `job.setStatus(newStatus)`. Em vez disso, temos `job.startProcessing()`, `job.complete(result)`, `job.fail(error)`, que alteram o status como um efeito colateral de um comportamento de negócio.

A aplicação disciplinada destas regras, especialmente no código de domínio, resultará em um sistema mais robusto, flexível e fácil de entender.

## 8. Refatoração da Lógica Existente

Durante a fase de investigação, identificamos duas principais áreas de lógica de backend existentes:
1.  Uma simulação de diálogo entre agentes (Product Owner e CTO) localizada em `src/infrastructure/frameworks/electron/main/agent/`.
2.  Um sistema mais genérico de `WorkerService` e `Job` (descrito no `src/main.ts` original, que parece não estar ativamente integrado).

Ambas as áreas contêm conceitos valiosos, mas precisam ser refatoradas e integradas à nova arquitetura para garantir consistência, manutenibilidade e o uso de Injeção de Dependência.

### 8.1. Refatoração da Simulação de Agente PO/CTO
A simulação de diálogo entre o Product Owner (PO) e o CTO, atualmente em `src/infrastructure/frameworks/electron/main/agent/`, demonstra a capacidade de interação com LLMs usando ferramentas. Para integrá-la à nova arquitetura, propomos as seguintes mudanças:

*   **Transformar em Funcionalidade de "Chat com Agentes de IA":** Em vez de uma simulação hardcoded entre PO e CTO, essa lógica pode evoluir para uma funcionalidade onde o usuário interage com diferentes personas de Agentes de IA configuráveis.

*   **Entidade `AIAgent` no Domínio:**
    *   A classe `AIAgent` (como esboçada anteriormente em 6.2) se tornará a representação central de um agente de IA. Ela definirá o perfil do agente (nome, papel, backstory, modelo LLM, ferramentas disponíveis, temperatura, etc.).
    *   As instâncias de `AIAgent` seriam configuráveis e persistidas (talvez via um `IAIAgentRepository`).

*   **Caso de Uso para Interação (`InteractWithAIAgentUseCase`):**
    *   Um novo caso de uso, por exemplo `InteractWithAIAgentUseCase`, seria criado no domínio.
    *   **Entrada:** ID do `AIAgent`, mensagem do usuário, histórico da conversa (opcional).
    *   **Dependências (Injetadas):**
        *   `IAIAgentRepository`: Para carregar a configuração do `AIAgent`.
        *   `ILLMService`: Para se comunicar com o modelo de linguagem (ex: DeepSeek).
        *   `IToolRegistry` (ou similar): Um serviço para acessar e executar as ferramentas que o `AIAgent` específico pode usar. As ferramentas (`writeFile`, `readFile`, `thought`, `finalAnswer` do `tool-set.ts` atual) seriam refatoradas como classes/serviços injetáveis e registradas neste registry.
    *   **Lógica:**
        1.  Carrega o `AIAgent` especificado.
        2.  Constrói o prompt do sistema com base no `AIAgent.roleDescription` e nas regras de interação (similar ao `activityPrompt()` atual).
        3.  Chama o `ILLMService` com a mensagem do usuário, histórico, prompt do sistema e as ferramentas disponíveis para o agente.
        4.  Processa a resposta do LLM, incluindo a execução de `tool-calls` através do `IToolRegistry`.
        5.  Retorna a resposta do agente (e quaisquer resultados de ferramentas) para o chamador (provavelmente um Handler IPC).

*   **Refatoração das Ferramentas:**
    *   As ferramentas atuais (`writeFile`, `readFile`, `thought`, `finalAnswer` de `tool-set.ts`) seriam transformadas em classes/serviços que implementam uma interface comum `ITool`.
    *   Elas seriam injetáveis e poderiam ter suas próprias dependências (ex: `FileSystemService` para `writeFile` e `readFile`).
    *   O `IToolRegistry` seria responsável por disponibilizar as instâncias corretas das ferramentas para o `InteractWithAIAgentUseCase`.

*   **Persistência das Conversas:**
    *   O histórico da conversa (atualmente gerenciado na classe `Activity`) precisaria ser persistido, talvez associado a uma sessão de chat ou a um `Project`. Uma nova entidade `Conversation` ou `ChatMessage` poderia ser criada.

*   **Remoção da Lógica de Loop Hardcoded:** O loop `while(true)` em `agent/index.ts` seria removido. A interação seria orientada por eventos (ex: usuário envia mensagem via UI).

Com essa refatoração, a funcionalidade de agente se torna mais genérica, configurável e alinhada com os princípios da Clean Architecture e DI.
### 8.2. Refatoração do Sistema WorkerService/Job
O sistema de `WorkerService` e `Job` (identificado no `src/main.ts` original) é fundamental para processamento assíncrono e tarefas de longa duração. Sua refatoração focará em integrá-lo com a DI e a nova estrutura de domínio.

*   **Entidade `Job` no Domínio:**
    *   A entidade `Job` (como esboçada em 6.1) será a representação central de uma tarefa a ser executada.

*   **Repositórios (`IJobRepository`, `IQueueRepository`):**
    *   Manteremos a necessidade de persistir `Job`s e, possivelmente, `Queue`s (se o conceito de múltiplas filas nomeadas for mantido). As interfaces serão definidas no domínio, e as implementações Drizzle na infraestrutura.

*   **Caso de Uso para Enfileirar Jobs (`EnqueueJobUseCase`):**
    *   Como esboçado em 6.4, este caso de uso criará uma instância de `Job` e a persistirá com o status `PENDING` (ou similar), efetivamente enfileirando-a.

*   **Serviço de Processamento de Jobs (`JobProcessingService` ou `BackgroundWorkerService`):**
    *   Este será um serviço na camada de aplicação ou infraestrutura, responsável por monitorar a "fila" de jobs pendentes.
    *   **Dependências (Injetadas):**
        *   `IJobRepository`: Para buscar jobs pendentes.
        *   `Container` (InversifyJS): Para resolver dinamicamente o Caso de Uso ou Serviço específico necessário para processar um determinado tipo de job.
        *   `IAIAgentRepository` e `ILLMService` (se jobs podem ser executados por Agentes de IA).
        *   `IToolRegistry` (se jobs executam ferramentas).
    *   **Lógica:**
        1.  Periodicamente (ou via algum mecanismo de notificação), busca por `Job`s com status `PENDING`.
        2.  Para cada `Job` encontrado:
            a.  Atualiza o status do `Job` para `ACTIVE` (via `job.startProcessing()` e `jobRepository.save(job)`).
            b.  Com base no `job.name` ou `job.payload.taskType`, determina qual Caso de Uso ou Serviço específico deve ser executado. Isso pode ser feito através de um registro de "handlers de job" ou obtendo o executor do container de DI.
            c.  Executa o Caso de Uso/Serviço, passando o `job.payload`.
            d.  Se sucesso, chama `job.complete(result)` e salva.
            e.  Se erro, chama `job.fail(errorInfo)`. Se `job.canRetry()`, marca para nova tentativa (`job.markAsPendingRetry()`) ou adia. Salva o job.
    *   Este serviço rodaria em background no processo principal do Electron.

*   **Tipos de Job e Executores:**
    *   Para diferentes tipos de `Job` (ex: "gerarCodigo", "analisarDocumento", "sumarizarTexto"), precisaremos de diferentes executores (Casos de Uso ou Serviços de Domínio/Aplicação).
    *   O `JobProcessingService` precisará de uma estratégia para mapear um `Job` ao seu executor correto. Isso pode ser via convenção de nomenclatura, um campo `taskType` no payload do job, ou um registro explícito.

*   **Integração com Agentes de IA:**
    *   Se um `Job` deve ser executado por um `AIAgent`, o `JobProcessingService` obteria uma instância do `AIAgent` (talvez ocioso ou com as capacidades corretas), e usaria o `InteractWithAIAgentUseCase` (ou um similar focado em execução de tasks) para delegar o trabalho ao agente. O payload do `Job` seria a "mensagem" ou "tarefa" para o agente.

Ao refatorar o sistema `WorkerService/Job` desta forma, ele se tornará uma parte robusta e bem integrada da arquitetura, capaz de lidar com diversas tarefas assíncronas de forma organizada e extensível. A lógica de `src/main.ts` (original) será, em grande parte, substituída por este novo serviço e pelos respectivos casos de uso.

## 9. Comunicação UI-Backend (IPC)

A comunicação entre a Interface do Usuário (UI, processo renderer do React) e o backend (processo principal do Electron) continuará a usar o mecanismo de Comunicação Inter-Processos (IPC) do Electron. A refatoração principal nesta área será como os Handlers IPC no processo principal são implementados, especificamente para utilizar o container de Injeção de Dependência (DI) para acessar os Casos de Uso.

**Contexto Atual (Pré-Refatoração):**
Atualmente, os handlers IPC (em `src/infrastructure/frameworks/electron/main/handlers.ts`) instanciam manualmente os Casos de Uso e Repositórios de que necessitam. Por exemplo:

```typescript
// Exemplo do handlers.ts atual (simplificado)
// ipcMain.handle("usecase:create-user", async (e, data) => {
//   const userRepository = new UserRepositoryDrizzle(db); // Instanciação manual
//   const llmProviderConfigRepository = new LLMProviderConfigRepositoryDrizzle(db); // Instanciação manual
//   const usecase = new CreateUserUseCase( // Instanciação manual
//     userRepository,
//     llmProviderConfigRepository
//   );
//   return await usecase.execute(data);
// });
```

Esta abordagem leva a um acoplamento mais forte e dificulta os testes e a manutenção.

**Proposta de Refatoração com DI:**

1.  **Handlers IPC como Classes Injetáveis (Opcional, mas Recomendado):**
    *   Em vez de ter um único arquivo `handlers.ts` com múltiplas funções `ipcMain.handle` soltas, podemos agrupar handlers relacionados em classes. Cada classe de handler seria marcada como `@injectable()` e suas dependências (Casos de Uso) seriam injetadas.

    **Exemplo Conceitual (`src/infrastructure/electron/ipc-handlers/user.handlers.ts`):**
    ```typescript
    import { injectable, inject } from 'inversify';
    import { ipcMain } from 'electron';
    import { TYPES } from '@/infrastructure/ioc/types';
    import { CreateUserUseCase, CreateUserInput } from '@/domain/use-cases/user/create-user.use-case'; // Supondo que CreateUserInput seja exportado
    import { GetUserUseCase } from '@/domain/use-cases/user/get-user.use-case'; // Exemplo

    @injectable()
    export class UserHandlers {
      constructor(
        @inject(TYPES.CreateUserUseCase) private createUserUseCase: CreateUserUseCase,
        @inject(TYPES.GetUserUseCase) private getUserUseCase: GetUserUseCase // Exemplo
      ) {}

      public registerHandlers(): void {
        ipcMain.handle('usecase:create-user', async (_event, data: CreateUserInput) => {
          return await this.createUserUseCase.execute(data);
        });

        ipcMain.handle('query:get-user', async (_event) => { // Supondo que GetUserUseCase não precise de input
          return await this.getUserUseCase.execute();
        });
        // Outros handlers relacionados a User
      }
    }
    ```

2.  **Registro e Inicialização dos Handlers no `electron/main.ts`:**
    *   No ponto de entrada do processo principal (`src/infrastructure/electron/main.ts`), após a configuração do container InversifyJS, obteríamos as instâncias das classes de Handler do container e chamaríamos um método `registerHandlers()` nelas.

    **Exemplo Conceitual (`src/infrastructure/electron/main.ts`):**
    ```typescript
    // ... outras importações
    import { container } from '@/infrastructure/ioc/inversify.config';
    import { TYPES } from '@/infrastructure/ioc/types';
    import { UserHandlers } from './ipc-handlers/user.handlers'; // Ajustar caminho se necessário
    // Importar outras classes de Handlers (ProjectHandlers, JobHandlers, etc.)

    // ... app.on('ready', async () => { ... })
    // Após createWindow() ou em um ponto adequado:

    function initializeIPCHandlers() {
      const userHandlers = container.get<UserHandlers>(TYPES.UserHandlers); // Supondo que UserHandlers esteja em TYPES
      userHandlers.registerHandlers();

      // const projectHandlers = container.get<ProjectHandlers>(TYPES.ProjectHandlers);
      // projectHandlers.registerHandlers();

      // ... registrar outros handlers
      console.log('IPC Handlers registered.');
    }

    // Chamar initializeIPCHandlers() quando o app estiver pronto,
    // geralmente após a criação da janela principal e configuração do container.
    // Exemplo: dentro de app.whenReady().then(() => { ... initializeIPCHandlers(); });
    // No nosso caso, pode ser após a chamada de `main()` da simulação de agente,
    // ou se a simulação for removida/integrada, após `createWindow()`.
    // Precisamos garantir que o container DI esteja configurado ANTES disso.
    // Se `initializeDatabase` e a configuração do container DI acontecerem em `app.on('ready')`,
    // então `initializeIPCHandlers` pode ser chamado logo depois.
    ```
    No `inversify.config.ts`, adicionaríamos:
    ```typescript
    // container.bind<UserHandlers>(TYPES.UserHandlers).to(UserHandlers).inSingletonScope();
    ```

3.  **Script de Preload (`preload.ts`) Permanece o Mesmo:**
    *   O script `src/infrastructure/electron/preload.ts` que expõe `window.api` (com `invoke`, `send`, `on`) não precisa de grandes alterações. Ele continuará a encaminhar as chamadas da UI para os canais IPC registrados no processo principal.

4.  **Chamadas na UI (React) Permanecem as Mesmas:**
    *   A UI continuará a usar `window.api.invoke('usecase:create-user', inputData)` da mesma forma. A mudança é interna ao processo principal, tornando-o mais limpo e testável.

**Benefícios desta Abordagem:**
*   **Desacoplamento:** Os handlers IPC não estão mais diretamente acoplados às implementações concretas dos Casos de Uso; eles dependem de abstrações resolvidas pelo container DI.
*   **Testabilidade:** As classes de Handler podem ser testadas unitariamente injetando Casos de Uso mocks.
*   **Organização:** Agrupar handlers por funcionalidade (ex: `UserHandlers`, `ProjectHandlers`) melhora a organização do código em comparação com um único arquivo `handlers.ts` extenso.
*   **Consistência:** Aplica o mesmo padrão de DI usado no restante do backend.

Esta refatoração da camada de comunicação IPC alinhará a interação UI-Backend com os princípios de design da nova arquitetura, tornando-a mais robusta e fácil de manter.

## 10. (Opcional) Plano de Transição/Refatoração Incremental

*(A ser preenchido: Sugestões de como a refatoração pode ser abordada em etapas.)*

## 11. Conclusão

*(A ser preenchido: Resumo dos benefícios e próximos passos após a aprovação desta proposta.)*
