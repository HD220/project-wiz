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
    *   Representam as ações que o sistema pode realizar (ex: `CreateNewProjectUseCase`, `AssignTaskToAIAgentUseCase`, `EnqueueJobUseCase`).
    *   São independentes de frameworks e da UI. A UI (ou outro trigger) chama um caso de uso e recebe um resultado.
    *   Dependem de abstrações (interfaces) para interagir com a camada de infraestrutura (ex: `IJobRepository`).

*   **Interfaces de Repositório (Ports) (`repositories/`):**
    *   Definem os contratos (interfaces TypeScript) para as operações de persistência de dados e operações de fila.
    *   Exemplos: `IJobRepository` (para persistência de `Job`s e operações de fila), `IProjectRepository`, `IUserRepository`.
    *   Permitem que os Casos de Uso e Serviços de Domínio permaneçam independentes das tecnologias de banco de dados específicas. As implementações concretas residem na camada de Infraestrutura.
    *   **`IJobRepository` (ex: `src/domain/repositories/i-job.repository.ts`):** Esta interface é central para a persistência de `Job`s e para o sistema de filas. Ela define métodos para criar, buscar, e atualizar `Job`s, incluindo a lógica de lock e transição de estado necessária para a fila.
        ```typescript
        // src/domain/repositories/i-job.repository.ts
        import { Job } from '../entities/job.entity';
        // JobStatusVO e BackoffOptions seriam importados se usados diretamente aqui,
        // mas a lógica de backoff agora está mais implícita no 'save'.

        export interface IJobRepository {
          // Adiciona um novo job à persistência. Usado principalmente pelo EnqueueJobUseCase.
          add(job: Job): Promise<void>;

          // Salva o estado atual de uma instância de Job (que foi modificada em memória).
          // Este método é usado para criar jobs (se o ID não existir e lockToken não for relevante),
          // ou para atualizar jobs existentes (status, data, attempts, result, error, delayUntil).
          // Se 'lockToken' for fornecido, ele DEVE ser validado contra o lock atual do job
          // se o job estiver em um estado que implica estar locado (ex: ACTIVE).
          // A implementação deste método lida com a lógica de transição de estado final na persistência
          // (ex: se job.props.status é FAILED e job.props.attempts < job.props.maxAttempts,
          // pode aplicar backoff e salvar como PENDING/DELAYED com novo delayUntil).
          // Libera o lock se o job atingir um estado terminal (COMPLETED, FAILED sem retentativas).
          save(job: Job, lockToken?: string): Promise<void>;

          // Busca um job pelo ID.
          findById(jobId: string): Promise<Job | null>;

          // Encontra o próximo job pendente (status PENDING ou DELAYED com delayUntil passado)
          // para uma fila específica, aplica um lock (registrando workerId e lockToken na persistência
          // com um tempo de expiração), e retorna o job e o lockToken.
          findNextPending(queueName: string, workerId: string): Promise<{ job: Job; lockToken: string } | null>;

          // (Opcional, se a lógica de liberação de lock não for totalmente coberta pelo save)
          // releaseLock(jobId: string, lockToken: string): Promise<void>;
        }
        ```

*   **Serviços de Domínio (`services/`):**
    *   Contêm lógica de negócios significativa que não se encaixa naturalmente em uma única entidade ou que orquestra interações complexas. São stateless e suas dependências são injetadas.

        *   **`AIAgentExecutionService` (ex: `src/domain/services/agent/ai-agent-execution.service.ts`):**
            Este serviço é crucial para a funcionalidade dos Agentes de IA. Ele não é o `AIAgent` (que é uma entidade de configuração/perfil), mas o orquestrador que executa a lógica de um agente para processar um `Job`.
            **Responsabilidades:**
            -   Fornecer a função `jobProcessor` que será executada pelos `Worker`s dedicados às filas de Agentes de IA. Este serviço atua como a ponte entre a lógica de negócios específica dos agentes e o sistema de filas genérico.
            -   Utilizar o `payload` do `Job` (ou `job.name`/`job.data`) para identificar e carregar a configuração do `AIAgent` apropriado (via `IAIAgentRepository`).
            -   Dentro da função `jobProcessor` que ele fornece:
                -   Orquestrar a interação com o `ILLMService` (passando o perfil do agente, mensagens, ferramentas).
                -   Executar ferramentas através do `IToolRegistry`.
                -   Gerenciar o estado da tarefa do agente, chamando `job.updateJobData()` para modificar o estado do job em memória, e então usando o `queueClient` recebido (que é um parâmetro do `jobProcessor`) para chamar `queueClient.saveJob(job, workerToken)` para persistir essas alterações de dados (se for um ponto de salvamento intermediário).
                -   Para operações avançadas na fila (ex: adiar um job), o `jobProcessor` chamará primeiro um método de preparação na entidade `Job` (ex: `job.prepareForDelay(timestamp)`), que atualiza o estado do `Job` em memória. Em seguida, o `jobProcessor` lançará um erro específico (ex: `DelayedError`) para sinalizar essa intenção ao `Worker`. O `Worker` é então responsável por persistir o estado preparado do `Job` através do `queueClient.saveJob(job, workerToken)`.
            **Dependências (Injetadas via Construtor no `AIAgentExecutionService`):** `ILLMService`, `IToolRegistry`, `IAIAgentRepository`.

            **Função `jobProcessor` Fornecida pelo Serviço:**
            O `AIAgentExecutionService` teria um método que retorna (ou cujo corpo é) a função `jobProcessor`. Esta função teria a assinatura `async (job: Job): Promise<any>`.
            Exemplo conceitual da lógica interna desta função `jobProcessor`:
            ```typescript
            // Dentro do AIAgentExecutionService, ou um método que ele retorna:
            // async function agentJobProcessor(
            //   this: AIAgentExecutionService, // 'this' se for um método da classe
            //   job: Job // Recebe apenas a instância do Job
            // ): Promise<any> {
            //   const agentId = job.payload.agentId || this.defaultAgentId;
            //   const agentProfile = await this.aiAgentRepository.findById(agentId);
            //   if (!agentProfile) {
            //     // O Worker irá capturar este erro, chamar job.fail(), e persistir.
            //     throw new Error(`AIAgent profile ${agentId} not found for job ${job.id}.`);
            //   }

            //   const taskInput = job.payload.taskInput || job.payload.goal;
            //   let conversationHistory = job.props.data?.conversationHistory || [];
            //   let currentStep = job.props.data?.currentStep || 'initial_processing';

            //   console.log(`[AIAgentExecutionService/jobProcessor] Job ${job.id}, Agent ${agentProfile.name}, Step ${currentStep}`);

            //   if (currentStep === 'initial_processing') {
            //     console.log(`[AIAgentExecutionService/jobProcessor] Job ${job.id}: Executando etapa inicial.`);
            //     const llmResponse = `LLM output for initial step of '${taskInput}'`;
            //     conversationHistory.push({role: 'user', content: taskInput});
            //     conversationHistory.push({role: 'assistant', content: llmResponse});
            //     currentStep = 'tool_execution'; // Próximo passo
            //     // Modifica o job em memória. O Worker persistirá o estado final do job (COMPLETED ou FAILED)
            //     // ou estados específicos como DELAYED se um erro apropriado for lançado.
            //     job.updateJobData({ conversationHistory, currentStep, intermediateData: "data_from_initial_step" });
            //     console.log(`[AIAgentExecutionService/jobProcessor] Job ${job.id} data updated in memory.`);
            //     // Não há chamada para persistência aqui. Se uma persistência intermediária fosse CRÍTICA
            //     // antes de prosseguir para uma longa operação de 'tool_execution', o design precisaria
            //     // de um erro customizado tipo 'IntermediateSaveRequiredError' que o Worker entenderia,
            //     // salvaria o job, e então talvez re-enfileiraria o job para a próxima etapa ('tool_execution').
            //     // Para este exemplo, vamos assumir que 'tool_execution' é a próxima etapa lógica.
            //   }

            //   if (currentStep === 'tool_execution') {
            //     console.log(`[AIAgentExecutionService/jobProcessor] Job ${job.id}: Executando etapa de ferramentas e preparando para delay.`);
            //     // ...lógica de execução de ferramenta...
            //     currentStep = 'final_processing_after_delay'; // Estado esperado após o delay
            //     const delayUntil = new Date(Date.now() + 10000); // Adia por 10 segundos
            //     console.log(`[AIAgentExecutionService/jobProcessor] Job ${job.id} preparando para adiamento até ${delayUntil.toISOString()}`);
            //     // Modifica o job em memória para o estado DELAYED e informa data/hora.
            //     job.prepareForDelay(delayUntil);
            //     job.updateJobData({ conversationHistory, currentStep, toolOutput: "output_from_tool", awaitingDelayConfirmation: true });
            //     // Lança o erro para sinalizar ao Worker.
            //     // O Worker irá capturar DelayedError e então chamar queueClient.saveJob(job, lockToken).
            //     throw new DelayedError('Job processing requires a delay before final step.');
            //   }

            //   if (currentStep === 'final_processing_after_delay') {
            //     console.log(`[AIAgentExecutionService/jobProcessor] Job ${job.id} resumindo para processamento final.`);
            //     // ...lógica de processamento final...
            //     const finalOutput = "Final output of the agent's task after all steps.";
            //     job.updateJobData({ conversationHistory, currentStep, finalOutput, awaitingDelayConfirmation: undefined });
            //     // Retorna o resultado. O Worker chamará job.complete(finalOutput) e
            //     // então persistirá o job como COMPLETED.
            //     return finalOutput;
            //   }

            //   // Se chegou aqui, pode ser um job que completa após a etapa inicial, ou estado inesperado.
            //   if (job.props.data?.currentStep === 'tool_execution') { // Indica que completou após 'initial_processing'
            //     const resultAfterInitial = job.props.data?.intermediateData || "Completed after initial step";
            //     // O Worker chamará job.complete() com este resultado.
            //     return resultAfterInitial;
            //   }
            //   // Se não se encaixa em nenhum fluxo esperado, lança um erro.
            //   // O Worker irá capturar, chamar job.fail(), e persistir.
            //   throw new Error(`Job ${job.id} is in an unexpected state: ${currentStep}`);
            // }
            ```
        *   **Outros Serviços de Domínio:** Poderiam existir outros serviços de domínio se lógicas complexas que não se encaixam em entidades ou casos de uso específicos fossem identificadas. No momento, o `AIAgentExecutionService` é o principal exemplo.

### 3.2. Camada de Aplicação (`src/application`) - Opcional
(Conteúdo existente da Seção 3.2)

### 3.3. Camada de Infraestrutura (`src/infrastructure`)
(Conteúdo existente da Seção 3.3, garantindo que `DrizzleJobRepository` implementa `IJobRepository` e referências a `IJobRepository` são usadas no lugar de `IQueueRepository` ou `IJobQueueService`)

### 3.4. Camada de Apresentação (`src/presentation`) - Opcional
(Conteúdo existente da Seção 3.4)

### 3.5. Fluxo de Dependências
A regra de dependência é um princípio fundamental da Clean Architecture e será estritamente seguida. Ela dita que as dependências do código fonte só podem apontar para **dentro**.

- **Camadas Externas Dependem de Camadas Internas:**
    - A camada de Infraestrutura depende da camada de Domínio (através de interfaces/ports).
    - A camada de Apresentação (se usada) dependeria da camada de Aplicação ou Domínio.
    - A camada de Aplicação (se usada) depende da camada de Domínio.
- **Camada de Domínio Não Depende de Ninguém:** A camada de Domínio (Entidades, Casos de Uso, Interfaces de Repositório) não tem conhecimento das camadas externas. Ela é o núcleo independente do sistema.

Isso significa que alterações em camadas externas (como a troca de um banco de dados na Infraestrutura ou uma mudança na UI na Apresentação) não devem impactar a camada de Domínio. Para alcançar isso, utilizamos **Interfaces (Ports)** definidas na camada de Domínio, que são implementadas por **Adaptadores** na camada de Infraestrutura. A Injeção de Dependência é usada para fornecer as implementações concretas (Adaptadores) para os Casos de Uso e Serviços de Domínio sem que eles conheçam as classes concretas.

Este fluxo garante que a lógica de negócios central permaneça pura, testável e isolada de preocupações tecnológicas específicas.

## 4. Injeção de Dependência (DI) com InversifyJS

A Injeção de Dependência (DI) será um pilar central da nova arquitetura, e utilizaremos a biblioteca InversifyJS para implementá-la. A DI nos permite desacoplar componentes, facilitar a testabilidade (permitindo mocks e stubs) e gerenciar o ciclo de vida das dependências de forma centralizada.

Classes que representam serviços de domínio, casos de uso, implementações de repositório e alguns componentes de infraestrutura (como clientes de serviços externos ou o `LoggerService`) serão registradas no container InversifyJS e terão suas dependências injetadas via construtor.

### 4.1. Configuração do Container (`infrastructure/ioc/inversify.config.ts`)

Um arquivo de configuração central, por exemplo `src/infrastructure/ioc/inversify.config.ts`, será responsável por definir os *bindings* (associações) entre as abstrações (interfaces) e suas implementações concretas.

**Exemplo de Configuração do Container:**
```typescript
// src/infrastructure/ioc/inversify.config.ts
import { Container } from 'inversify';
import { TYPES } from './types';

// --- Repositórios ---
// Exemplo com DrizzleJobRepository (implementação concreta)
// import { DrizzleJobRepository } from '@/infrastructure/persistence/drizzle/job.repository'; // Ajustar caminho conforme estrutura final
// import { IJobRepository } from '@/domain/repositories/i-job.repository';
// container.bind<IJobRepository>(TYPES.IJobRepository).to(DrizzleJobRepository).inSingletonScope();

// Exemplo com InMemoryJobRepository (para desenvolvimento/testes)
import { InMemoryJobRepository } from '@/infrastructure/persistence/in-memory/in-memory-job.repository'; // Ajustar caminho
import { IJobRepository } from '@/domain/repositories/i-job.repository';
container.bind<IJobRepository>(TYPES.IJobRepository).to(InMemoryJobRepository).inSingletonScope();


import { InMemoryAIAgentRepository } from '@/infrastructure/persistence/in-memory/in-memory-ai-agent.repository'; // Ajustar caminho
import { IAIAgentRepository } from '@/domain/repositories/i-ai-agent.repository';
container.bind<IAIAgentRepository>(TYPES.IAIAgentRepository).to(InMemoryAIAgentRepository).inSingletonScope();


// --- Serviços de Domínio ---
import { AIAgentExecutionService } from '@/domain/services/agent/ai-agent-execution.service';
import { IAIAgentExecutionService } from '@/domain/services/agent/i-ai-agent-execution.service'; // Se uma interface for definida
container.bind<IAIAgentExecutionService>(TYPES.IAIAgentExecutionService).to(AIAgentExecutionService).inSingletonScope();
// Ou, se não houver interface para AIAgentExecutionService, pode-se registrar a classe diretamente:
// container.bind<AIAgentExecutionService>(TYPES.AIAgentExecutionService).toSelf().inSingletonScope();


// --- Serviços de Infraestrutura (Exemplos) ---
// import { RealLLMService } from '@/infrastructure/services/llm/real-llm.service'; // Ajustar caminho
// import { ILLMService } from '@/domain/services/llm/i-llm.service'; // Supondo que a interface está no domínio
// container.bind<ILLMService>(TYPES.ILLMService).to(RealLLMService).inSingletonScope();

// import { DiskToolRegistry } from '@/infrastructure/services/tools/disk-tool.registry'; // Ajustar caminho
// import { IToolRegistry } from '@/domain/services/tools/i-tool.registry'; // Supondo que a interface está no domínio
// container.bind<IToolRegistry>(TYPES.IToolRegistry).to(DiskToolRegistry).inSingletonScope();

// import { ConsoleLoggerService } from '@/infrastructure/services/logging/console-logger.service'; // Ajustar caminho
// import { ILoggerService } from '@/domain/services/logging/i-logger.service'; // Supondo que a interface está no domínio
// container.bind<ILoggerService>(TYPES.ILoggerService).to(ConsoleLoggerService).inSingletonScope();


// --- Casos de Uso (Use Cases) ---
import { EnqueueJobUseCase } from '@/domain/use-cases/job/enqueue-job.use-case';
container.bind<EnqueueJobUseCase>(TYPES.EnqueueJobUseCase).toSelf().inRequestScope(); // Casos de uso geralmente são inRequestScope

// Adicionar outros bindings para Casos de Uso, Repositórios e Serviços conforme necessário...

// Nota sobre Workers e QueueClients:
// Os `AgentWorker`s (da camada de infraestrutura, ex: `infrastructure/workers/agent.worker.ts`)
// e os `QueueClient`s (ex: `infrastructure/persistence/queue/queue.client.ts`)
// são tipicamente instanciados e configurados programaticamente pelo `AgentLifecycleService`
// (ver Seção 8.3), que é parte da lógica de inicialização no processo principal do Electron.

// O `AgentLifecycleService` obteria as seguintes dependências do container DI:
// 1. `IJobRepository`: Para passar ao construtor de cada `QueueClient`.
// 2. `IAIAgentExecutionService`: Para obter a função `jobProcessor` específica para cada agente.
// 3. `LoggerService` (e quaisquer outras dependências diretas do Worker, como `TYPES.ILoggerService`).

// Em seguida, para cada `AIAgent` configurado, o `AgentLifecycleService`:
// a. Cria uma instância de `QueueClient`, passando o `queueName` do agente e a instância de `IJobRepository`.
// b. Obtém a função `jobProcessor` do `IAIAgentExecutionService` (ex: `agentExecutionService.getJobProcessorForAgent(agentId)`).
// c. Cria uma instância de `AgentWorker`, passando o `workerId`, a instância de `QueueClient`, a função `jobProcessor`, e o `LoggerService`.

export { container };
```
**Escopos de Ciclo de Vida:**
*   `inSingletonScope()`: Uma única instância do serviço/repositório é criada e compartilhada durante todo o ciclo de vida da aplicação. Adequado para repositórios e serviços stateless.
*   `inTransientScope()`: Uma nova instância é criada toda vez que a dependência é solicitada.
*   `inRequestScope()`: (Menos comum em aplicações Electron backend, mais em servidores web) Uma nova instância por "requisição". Para Casos de Uso, `inTransientScope()` ou `inRequestScope()` (se houver um conceito de "requisição" no fluxo IPC) são geralmente apropriados para garantir que cada execução do caso de uso seja isolada.

### 4.2. Definição de Tipos/Símbolos (`infrastructure/ioc/types.ts`)

Para evitar o uso de strings literais para identificar os bindings (o que é propenso a erros), definiremos constantes simbólicas (Symbols) em um arquivo `types.ts`.

```typescript
// src/infrastructure/ioc/types.ts
const TYPES = {
  // --- Repositórios ---
  IJobRepository: Symbol.for('IJobRepository'),
  IAIAgentRepository: Symbol.for('IAIAgentRepository'),
  // Adicionar outros repositórios aqui (ex: IProjectRepository, IUserRepository)

  // --- Serviços de Domínio ---
  IAIAgentExecutionService: Symbol.for('IAIAgentExecutionService'),
  // Adicionar outros serviços de domínio aqui

  // --- Serviços de Infraestrutura ---
  ILLMService: Symbol.for('ILLMService'),
  IToolRegistry: Symbol.for('IToolRegistry'),
  ILoggerService: Symbol.for('ILoggerService'),
  // Adicionar outros serviços de infraestrutura aqui

  // --- Casos de Uso ---
  EnqueueJobUseCase: Symbol.for('EnqueueJobUseCase'),
  // Adicionar outros casos de uso aqui

  // --- Outros ---
  // Ex: Electron specific services like MainWindowProvider, etc.
};

export { TYPES };
```
O `Symbol.for()` cria um Symbol global. Se diferentes partes do código precisarem referenciar o mesmo Symbol (por exemplo, um módulo define o binding, outro injeta), usar `Symbol.for()` garante que o mesmo Symbol seja usado.

### 4.3. Exemplos de Uso (`@injectable`, `@inject`)

Classes que devem ser gerenciadas pelo container InversifyJS e ter dependências injetadas precisam ser decoradas com `@injectable()`. Suas dependências são então injetadas no construtor usando o decorador `@inject(TYPE)` e o tipo/símbolo correspondente.

**Exemplo - Serviço de Domínio (`AIAgentExecutionService`):**
O `AIAgentExecutionService` (Seção 3.1) é um bom exemplo de um serviço de domínio que depende de outras abstrações (como `IAIAgentRepository`, `ILLMService`, `IToolRegistry`).

```typescript
// src/domain/services/agent/ai-agent-execution.service.ts
import { injectable, inject } from 'inversify';
import { TYPES } from '@/infrastructure/ioc/types';
import { IAIAgentRepository } from '@/domain/repositories/i-ai-agent.repository';
import { ILLMService } from '@/domain/services/llm/i-llm.service'; // Supondo interface no domínio
import { IToolRegistry } from '@/domain/services/tools/i-tool.registry'; // Supondo interface no domínio
import { Job } from '@/domain/entities/job.entity';
// import { IQueueClient } from '@/domain/interfaces/i-queue.client'; // Não mais necessário aqui
// IAIAgentExecutionService como interface para este serviço, se definida

@injectable()
export class AIAgentExecutionService /* implements IAIAgentExecutionService */ {
  private aiAgentRepository: IAIAgentRepository;
  private llmService: ILLMService;
  private toolRegistry: IToolRegistry;

  constructor(
    @inject(TYPES.IAIAgentRepository) aiAgentRepository: IAIAgentRepository,
    @inject(TYPES.ILLMService) llmService: ILLMService,
    @inject(TYPES.IToolRegistry) toolRegistry: IToolRegistry
  ) {
    this.aiAgentRepository = aiAgentRepository;
    this.llmService = llmService;
    this.toolRegistry = toolRegistry;
  }

  public getJobProcessorForAgent(agentId: string): (job: Job) => Promise<any> {
    // Lógica para obter ou construir a função jobProcessor específica para o agentId.
    // Esta função agora tem a assinatura (job: Job) => Promise<any>.
    // Ela usará this.aiAgentRepository, this.llmService, this.toolRegistry internamente.
    // Exemplo simplificado:
    return async (job: Job): Promise<any> => {
      const agentProfile = await this.aiAgentRepository.findById(agentId);
      if (!agentProfile) {
        throw new Error(`AIAgent profile ${agentId} not found for job ${job.id}.`);
      }
      // ... lógica do jobProcessor como detalhado na Seção 3.1 ...
      // Ex: interagir com this.llmService, this.toolRegistry, modificar job.props.data,
      // e lançar DelayedError ou retornar um resultado.
      // Este jobProcessor NÃO interage com QueueClient ou IJobRepository diretamente.
      console.log(`Processing job ${job.id} for agent ${agentProfile.props.name} using LLM ${this.llmService.constructor.name}`);
      job.updateJobData({ processedBy: agentProfile.props.name });
      if (job.props.name === 'test-delay-job') {
        job.prepareForDelay(new Date(Date.now() + 5000));
        throw new Error('DelayedError: Test delay for job.'); // Simula DelayedError
      }
      return { success: true, data: job.props.data };
    };
  }

  // ... outros métodos do serviço ...
}
```

**Exemplo - Implementação de Repositório (`InMemoryJobRepository`):**
Uma implementação de repositório, como `InMemoryJobRepository`, também é `@injectable()` mas geralmente não possui dependências `@inject` em seu construtor (a menos que dependa de um cliente de banco de dados de baixo nível que também seja gerenciado por DI, o que é menos comum para implementações em memória).

```typescript
// src/infrastructure/persistence/in-memory/in-memory-job.repository.ts
import { injectable } from 'inversify';
import { IJobRepository } from '@/domain/repositories/i-job.repository';
import { Job } from '@/domain/entities/job.entity';
import { JobStatus } from '@/domain/value-objects/job-status.vo'; // Exemplo

@injectable()
export class InMemoryJobRepository implements IJobRepository {
  private jobs: Job[] = [];
  private locks: Map<string, { workerId: string, expiresAt: number }> = new Map();

  async add(job: Job): Promise<void> {
    this.jobs.push(job);
    console.log(`[InMemoryJobRepository] Job ${job.id} added. Total jobs: ${this.jobs.length}`);
  }

  async save(job: Job, lockToken?: string): Promise<void> {
    // ... lógica de save, incluindo validação de lockToken se fornecido ...
    // e liberação de lock para estados terminais.
    const index = this.jobs.findIndex(j => j.id === job.id);
    if (index !== -1) {
      this.jobs[index] = job;
      console.log(`[InMemoryJobRepository] Job ${job.id} saved with status ${job.status}`);
    } else {
      // Comportamento de 'add' se o job não existir? Ou lançar erro?
      // Para este exemplo, se não encontrar, adiciona (embora 'add' seja o método preferido para novos).
      this.jobs.push(job);
      console.warn(`[InMemoryJobRepository] Job ${job.id} not found for save, added instead.`);
    }
    // Lógica de liberação de lock simplificada:
    if (job.status === JobStatus.COMPLETED || (job.status === JobStatus.FAILED && !job.canRetry())) {
        if (this.locks.has(job.id) && this.locks.get(job.id)?.workerId === lockToken?.split(':')[0]) { // Validação de token simplificada
            this.locks.delete(job.id);
            console.log(`[InMemoryJobRepository] Lock released for job ${job.id}`);
        }
    }
  }

  async findById(jobId: string): Promise<Job | null> {
    return this.jobs.find(j => j.id === jobId) || null;
  }

  async findNextPending(queueName: string, workerId: string): Promise<{ job: Job; lockToken: string } | null> {
    // ... lógica para encontrar o próximo job pendente e aplicar lock ...
    const now = Date.now();
    const job = this.jobs.find(j =>
        j.props.queueName === queueName &&
        (j.status === JobStatus.PENDING || (j.status === JobStatus.DELAYED && j.props.delayUntil && j.props.delayUntil.getTime() <= now)) &&
        (!this.locks.has(j.id) || (this.locks.get(j.id)?.expiresAt ?? 0) < now) // Verifica se não está locado ou se o lock expirou
    );
    if (job) {
        const lockToken = `${workerId}:${Date.now() + 30000}`; // Token simples: workerId:expirationTimestamp
        this.locks.set(job.id, { workerId, expiresAt: Date.now() + 30000 }); // Lock por 30s
        console.log(`[InMemoryJobRepository] Job ${job.id} locked by ${workerId} with token ${lockToken}`);
        return { job: Job.clone(job), lockToken }; // Retorna um clone para evitar modificação direta do objeto em memória
    }
    return null;
  }
}
```
A utilização de DI com InversifyJS, conforme descrito, permitirá construir um sistema robusto, onde as dependências são claramente definidas e gerenciadas, facilitando a manutenção, a testabilidade e a evolução da arquitetura. O foco é em injetar dependências em serviços e repositórios que são então orquestrados pela lógica de inicialização da aplicação para montar componentes mais complexos como os `Worker`s.

## 5. Proposta de Organização de Diretórios Detalhada
(Conteúdo existente da Seção 5)

## 6. Entidades e Casos de Uso Chave (Exemplos Detalhados)

### 6.1. Exemplo de Entidade: `Job`
(Conteúdo existente da Seção 6.1, com `JobProps` e `Job.create` genéricos, e a subseção "Modificação do Estado do Job e Persistência via Worker/QueueClient" refletindo que `jobProcessor` usa `QueueClient` para chamar `saveJob` no `IJobRepository` após modificações em memória ou para sinalizar estados como `DELAYED`.)

### 6.2. Exemplo de Entidade: `AIAgent`
(Conteúdo existente da Seção 6.2, com `AIAgent` como DTO de configuração e `processJob` removido)

### 6.3. Exemplo de Caso de Uso: `CreateProjectUseCase`
(Conteúdo existente da Seção 6.3)

### 6.4. Exemplo de Caso de Uso: `EnqueueJobUseCase`
Este caso de uso é responsável por criar uma nova instância da entidade `Job` e adicioná-la à fila (persistência) através do `IJobRepository`.

**Localização:** `src/domain/use-cases/job/enqueue-job.use-case.ts`

**Interface de Entrada (`EnqueueJobInput`):**
```typescript
// src/domain/use-cases/job/enqueue-job.use-case.ts (ou em arquivo de tipos dedicado)
export interface EnqueueJobInput {
  queueName: string;      // Nome da fila à qual o job pertence
  jobName: string;        // Tipo/nome do job (para Job.props.name), ex: "ai-text-generation", "code-analysis"
  taskPayload: any;       // Dados específicos da tarefa para Job.props.payload (ex: { prompt: "...", agentId: "..." })
  priority?: number;       // Prioridade do job (ex: 1 = mais alta)
  delayUntil?: Date;       // Data e hora para adiar o processamento do job
  maxAttempts?: number;    // Número máximo de tentativas para o job
  parentId?: string;       // ID de um job pai, se este for um job filho
  initialJobData?: any;    // Dados iniciais para Job.props.data (estado interno, histórico, etc.)
}
```

**Interface de Saída (`EnqueueJobOutput`):**
```typescript
// src/domain/use-cases/job/enqueue-job.use-case.ts (ou em arquivo de tipos dedicado)
export interface EnqueueJobOutput {
  jobId: string;
  status: string;         // Status inicial do job (ex: PENDING, DELAYED)
  queueName: string;
}
```

**Implementação do Caso de Uso:**
```typescript
// src/domain/use-cases/job/enqueue-job.use-case.ts
import { injectable, inject } from 'inversify';
import { TYPES } from '@/infrastructure/ioc/types'; // Supondo que TYPES.IJobRepository esteja definido
import { IJobRepository } from '@/domain/repositories/i-job.repository';
import { Job, JobStatus } from '@/domain/entities/job.entity'; // JobStatus importado se usado no retorno

@injectable()
export class EnqueueJobUseCase {
  constructor(
    @inject(TYPES.IJobRepository) private jobRepository: IJobRepository
  ) {}

  async execute(input: EnqueueJobInput): Promise<EnqueueJobOutput> {
    if (!input.queueName || input.queueName.trim().length === 0) {
      throw new Error('Queue name must be provided for enqueuing a job.');
    }
    if (!input.jobName || input.jobName.trim().length === 0) {
      throw new Error('Job name must be provided for enqueuing a job.');
    }
    // Validar taskPayload pode ser importante dependendo dos requisitos.
    // Aqui, assumimos que pode ser qualquer 'any', mas poderia ser mais estrito.
    if (input.taskPayload === undefined) {
      // Dependendo da lógica de negócios, pode ser permitido um payload vazio/nulo.
      // Por agora, vamos exigir que seja fornecido.
      console.warn('Task payload is undefined for job:', input.jobName, 'on queue:', input.queueName);
      // throw new Error('Task payload must be provided, even if an empty object.');
    }

    const job = Job.create({
      name: input.jobName,
      queueName: input.queueName,
      payload: input.taskPayload, // payload são os dados específicos da tarefa
      priority: input.priority,
      delayUntil: input.delayUntil,
      maxAttempts: input.maxAttempts,
      parentId: input.parentId,
      initialData: input.initialJobData, // initialData é para o campo Job.props.data
    });

    // Utiliza o método 'add' do IJobRepository, conforme definido na interface IJobRepository.
    // Este método é especificamente para adicionar novos jobs.
    // O método 'save' seria para atualizar jobs existentes que já foram retirados da fila por um Worker.
    await this.jobRepository.add(job);

    return {
      jobId: job.id,
      status: job.status, // Retorna o status atual do job (deve ser PENDING ou DELAYED)
      queueName: job.props.queueName,
    };
  }
}
```

**Notas sobre a Implementação:**
*   **Injeção de `IJobRepository`:** O caso de uso depende da abstração `IJobRepository` para persistir o job, permitindo que a implementação concreta da persistência seja trocada (ex: de em memória para Drizzle ORM) sem alterar o caso de uso.
*   **Criação da Entidade `Job`:** A entidade `Job` é criada usando o método estático `Job.create()`. Este método encapsula a lógica de inicialização do job, incluindo a definição do status inicial (geralmente `PENDING`, ou `DELAYED` se `delayUntil` for especificado).
*   **Persistência com `jobRepository.add()`:** O novo job é salvo usando `this.jobRepository.add(job)`. A interface `IJobRepository` (Seção 3.1) define `add(job: Job)` para adicionar novos jobs e `save(job: Job, lockToken?: string)` para atualizar jobs existentes que estão sendo processados por um Worker (e, portanto, podem exigir um `lockToken`).
*   **Validação de Entrada:** Inclui validações básicas para `queueName` e `jobName`. Validações mais complexas ou específicas do domínio podem ser adicionadas. A obrigatoriedade e o tipo de `taskPayload` e `initialJobData` também podem ser mais rigorosamente validados.
*   **Object Calisthenics:**
    *   **Um nível de indentação por método:** Atingido.
    *   **Não use a palavra-chave ELSE:** Atingido com guard clauses.
    *   **Encapsule todos os primitivos e Strings:** `EnqueueJobInput` e `EnqueueJobOutput` usam tipos primitivos, mas são DTOs. A entidade `Job` internamente pode usar Value Objects.
    *   **Coleções de primeira classe:** Não aplicável diretamente neste exemplo simples.
    *   **Um ponto por linha:** Atingido.
    *   **Não abrevie:** Nomes como `jobRepository`, `EnqueueJobInput` são descritivos.
    *   **Mantenha todas as entidades pequenas:** A classe `EnqueueJobUseCase` é pequena e focada.
    *   **Não mais que duas variáveis de instância:** `jobRepository` é a única variável de instância.
    *   **Sem getters/setters/properties:** Aplicável a entidades de domínio ricas; Casos de Uso podem ter construtores para DI.

Este caso de uso demonstra como a lógica de aplicação para enfileirar um novo job pode ser implementada de forma limpa, testável e alinhada com os princípios da arquitetura proposta.

## 7. Aplicação de Object Calisthenics
(Conteúdo existente da Seção 7)

## 8. Refatoração da Lógica Existente

### 8.1. Refatoração da Simulação de Agente PO/CTO
(Conteúdo existente da Seção 8.1)

### 8.2. Refatoração do Sistema WorkerService/Job
(Conteúdo existente da Seção 8.2, mas a subseção "`Worker` Genérico Dedicado a uma Fila" deve ser atualizada para o seguinte:)

*   **`Worker` Genérico Dedicado a uma Fila:**
    Um `Worker` é um componente da camada de infraestrutura (`infrastructure/workers/`) responsável por processar jobs de uma fila específica. Ele é configurado com uma instância de `IQueueClient` (que representa a conexão a uma única fila nomeada, veja Seção 8.3) e uma função `jobProcessor` no momento de sua instanciação.

        **Responsabilidades do `Worker`:**
        1.  **Monitoramento e Retirada de Jobs da Fila Dedicada:**
            *   Executar um loop contínuo para verificar sua `IQueueClient` designada por novos `Job`s.
            *   Chamar `this.queueClient.getNextJob(this.workerId)` para obter o próximo `Job` pendente e um `lockToken` associado. O `lockToken` é gerado pela implementação do `IJobRepository` (via `QueueClient`) e é essencial para autorizar modificações subsequentes neste job específico. Se nenhum job estiver disponível, o worker aguarda/pausa.

        2.  **Início do Processamento do Job:**
            *   Uma vez que um `Job` e seu `lockToken` são obtidos:
                a.  O `Worker` chama `job.startProcessing()` na instância do `Job` (para atualizar seu estado em memória para `ACTIVE`, incrementar `attempts`, setar `processedAt`).
                b.  O `Worker` persiste este estado inicial imediatamente: `await this.queueClient.saveJob(job, lockToken);`. O método `saveJob` do `QueueClient` utilizará o `IJobRepository` para salvar o estado atual completo do `job`, validando o `lockToken`.

        3.  **Execução do `jobProcessor`:**
            *   Invocar a função `jobProcessor` configurada, passando apenas a instância do `Job`. O `jobProcessor` não necessita do `lockToken`, pois não interage diretamente com a persistência da fila para operações de mudança de estado que exijam autorização; ele modifica o `Job` em memória e sinaliza intenções (como delay) lançando erros específicos.
            ```typescript
            // Exemplo da chamada dentro do Worker:
            // const jobProcessor = this.configuredJobProcessor;
            // let jobProcessingError: Error | null = null;
            // let processingResult: any = null;
            // try {
            //   processingResult = await jobProcessor(job); // Passa apenas o job
            // } catch (error) {
            //   jobProcessingError = error;
            // }
            // // Lógica de tratamento de resultado/erro abaixo
            ```

        4.  **Tratamento de Resultado/Erro Pós-`jobProcessor` e Persistência Final:**
            *   Após a execução do `jobProcessor` (seja concluindo normalmente ou lançando uma exceção):
                *   **Se `DelayedError` foi lançado pelo `jobProcessor`:**
                    1.  O `Worker` captura `DelayedError`.
                    2.  Isso sinaliza que o `jobProcessor` já chamou `job.prepareForDelay(timestamp)` (atualizando o `job` em memória para o estado `DELAYED` e setando `delayUntil`).
                    3.  O `Worker` então persiste este estado preparado: `await this.queueClient.saveJob(job, lockToken);`.
                *   **Se `WaitingChildrenError` foi lançado pelo `jobProcessor`:**
                    1.  O `Worker` captura `WaitingChildrenError`.
                    2.  Isso sinaliza que o `jobProcessor` já chamou `job.prepareToWaitForChildren()` (atualizando o `job` em memória).
                    3.  O `Worker` persiste este estado: `await this.queueClient.saveJob(job, lockToken);`.
                *   **Se Nenhuma Exceção Especial foi Lançada (Conclusão Normal):**
                    1.  O `Worker` chama `job.complete(processingResult)` na instância do `Job`.
                    2.  O `Worker` chama `await this.queueClient.saveJob(job, lockToken)` para persistir o estado `COMPLETED` e o resultado.
                *   **Se Outra Exceção foi Lançada (Falha Real):**
                    1.  O `Worker` chama `job.fail(jobProcessingError.message)` na instância do `Job`.
                    2.  O `Worker` verifica `job.canRetry()`.
                        *   Se `true`: O `Worker` chama `job.markAsPendingRetry()`. Se a estratégia de backoff (definida no `Job` ou globalmente) exigir um adiamento, o `Worker` chama `job.prepareForDelay(timestampDeBackoffCalculado)` na instância do `Job`.
                        *   Se `false` (sem mais tentativas), o estado `FAILED` (já definido por `job.fail()`) é o final.
                    3.  Em todos os casos de falha, o `Worker` persiste o estado final do `Job`: `await this.queueClient.saveJob(job, lockToken);`.

        5.  **Liberação de Lock:** A implementação de `this.queueClient.saveJob(job, lockToken)` (que chama `IJobRepository.save`) é responsável por liberar o lock do job se o job atingiu um estado terminal (`COMPLETED`, `FAILED` sem retentativas) ou se foi movido para `DELAYED`/`PENDING` para retentativa.

        6.  **Ciclo de Vida:** O `Worker` deve ser iniciado e parado graciosamente.

    **Dependências do `Worker` (Fornecidas na Construção):**
    *   `workerId`: `string`
    *   `queueClient`: `IQueueClient`
    *   `jobProcessor`: `(job: Job) => Promise<any>`
    *   `LoggerService`: Para logging.

*   **Persistência da Fila:**
    *   A "fila" em si é conceitualmente representada pelos `Job`s no banco de dados com um `queueName` específico e um status `PENDING`. O `IJobRepository` precisará de métodos eficientes para consultar esses jobs. Esta abordagem de persistência é parte da implementação do sistema de filas local customizado, inspirado nos conceitos do BullMQ mas sem dependências externas, como descrito na Seção 3.3.

*   **Comunicação Externa Baseada em Eventos:**
    *   Conforme o feedback do usuário, a comunicação do agente (ou seja, do seu `jobProcessor`) com "coisas externas" (UI, outros agentes) pode ser baseada em eventos. Por exemplo, ao concluir um job, o `jobProcessor` poderia emitir um evento `JobCompletedEvent` que outras partes do sistema poderiam ouvir. Isso pode ser implementado com um `EventEmitter` ou um sistema de mensageria mais robusto, se necessário.

Esta arquitetura de worker/fila por agente permite um alto grau de isolamento e especialização. Cada agente pode ter seu próprio ritmo de processamento, conjunto de ferramentas e lógica de interação com LLM, gerenciados por seu `Worker` e `jobProcessor` dedicados. A lógica de `src/main.ts` (original) será, em grande parte, substituída por esta nova estrutura de `Worker`s e pelos respectivos `jobProcessor`s dos agentes.

### 8.3. Gerenciamento de Workers e Filas de Agentes
A arquitetura de Worker/Fila dedicada por agente requer um sistema para gerenciar o ciclo de vida e a configuração desses componentes.

*   **Objeto `QueueClient` (Interface para o Worker):**
    Para simplificar a interação do `Worker` com sua fila dedicada e para encapsular a lógica de acesso ao `IJobRepository` para um `queueName` específico, introduzimos o conceito de um `QueueClient`. Uma instância de `QueueClient` representa uma conexão operacional a uma única fila nomeada.

    **Localização Conceitual da Implementação:** `infrastructure/persistence/queue/queue.client.ts`
    **Interface (Exemplo):**
    ```typescript
    // domain/interfaces/i-queue.client.ts (ou um nome/localização similar para interfaces de infraestrutura se preferir)
    import { Job } from '@/domain/entities/job.entity';

    export interface IQueueClient {
      readonly queueName: string;
      // workerId é agora passado como parâmetro para getNextJob, não é mais uma propriedade da interface.

      // Obtém o próximo job disponível da fila associada, aplicando um lock.
      // O workerId é passado aqui para ser usado na lógica de lock do IJobRepository.
      // Retorna o job (no estado PENDING ou DELAYED) e um lockToken. Retorna null se não houver job.
      getNextJob(workerId: string): Promise<{ job: Job; lockToken: string } | null>;

      // Persiste o estado atual da instância do Job (modificada em memória) no banco de dados.
      // Este método é crucial e será usado pelo Worker para:
      // 1. Salvar o estado ACTIVE inicial do job (após job.startProcessing()).
      // 2. Salvar o estado final do job (COMPLETED, FAILED, ou PENDING/DELAYED para retentativas).
      // 3. Persistir o estado preparado de um job após o jobProcessor ter sinalizado
      //    uma intenção de adiamento ou espera (via DelayedError ou WaitingChildrenError).
      // A implementação em IJobRepository (chamada por este método via this.jobRepository.save)
      // deve validar o lockToken e lidar com a lógica de transição de estado da fila
      // (ex: liberar lock para estados terminais, atualizar delayUntil, etc.).
      saveJob(job: Job, lockToken: string): Promise<void>;
    }
    ```

    **Implementação Conceitual (`QueueClient`):**
    ```typescript
    // infrastructure/persistence/queue/queue.client.ts
    import { IQueueClient } from '@/domain/interfaces/i-queue.client';
    import { IJobRepository } from '@/domain/repositories/i-job.repository';
    import { Job } from '@/domain/entities/job.entity';

    export class QueueClient implements IQueueClient {
      public readonly queueName: string;
      // workerId não é mais uma propriedade da classe, é passado para getNextJob.
      private jobRepository: IJobRepository;

      constructor(
        queueName: string,
        // workerId: string, // Removido do construtor
        jobRepository: IJobRepository
      ) {
        this.queueName = queueName;
        this.jobRepository = jobRepository;
      }

      async getNextJob(workerId: string): Promise<{ job: Job; lockToken: string } | null> {
        // workerId é passado como parâmetro para findNextPending.
        return this.jobRepository.findNextPending(this.queueName, workerId);
      }

      async saveJob(job: Job, lockToken: string): Promise<void> {
        return this.jobRepository.save(job, lockToken);
      }
    }
    ```
    O `AgentLifecycleService` seria responsável por criar uma instância de `QueueClient` para cada agente/fila e passá-la para o `Worker` correspondente.

*   **Configuração dos Agentes (`AIAgent`):**
    *   Como mencionado, a entidade `AIAgent` (persistida via `IAIAgentRepository`) conterá a configuração de cada agente, incluindo:
        *   Identificador do modelo LLM a ser usado.
        *   Perfil do agente (prompt do sistema, persona).
        *   Lista de ferramentas/capacidades disponíveis.
        *   O `queueName` da fila de jobs dedicada a este agente.
        *   Um identificador para o `jobProcessor` específico que este agente utiliza (ex: uma string tipo `text-generation-processor`, `code-analysis-processor`).

*   **Inicialização dos Workers:**
    *   No processo principal do Electron (`infrastructure/electron/main.ts`), durante a inicialização da aplicação (após a configuração do container DI), um `AgentLifecycleService` (ou similar) seria responsável por:
        1.  Carregar todas as configurações ativas de `AIAgent` do `IAIAgentRepository`.
        2.  Para cada `AIAgent` ativo:
            a.  Gerar um `workerUniqueId` para esta instância do Worker.
            b.  Instanciar um `Worker` (da classe `AgentWorker` da infraestrutura). O `AgentLifecycleService` (ou lógica de inicialização equivalente) será responsável por:
                i.  Obter a instância do `IAIAgentExecutionService` do container DI.
                ii. Para o `AIAgent` específico sendo configurado, chamar um método no `IAIAgentExecutionService` (ex: `getJobProcessorForAgent(agentConfig.id)`) para obter a função `jobProcessor` específica para aquele agente (assinatura: `(job: Job) => Promise<any>`).
                iii. Obter a instância da `IJobRepository` do container DI.
                iv. Criar uma instância de `QueueClient`: `new QueueClient(agentConfig.props.queueName, jobRepository)`. Note que `workerUniqueId` não é passado para o construtor do `QueueClient`.
                v.  Configurar o `Worker` com:
                    *   O `workerUniqueId` (este ID será usado pelo `Worker` ao chamar `this.queueClient.getNextJob(this.workerId)`).
                    *   A instância de `IQueueClient` criada.
                    *   A função `jobProcessor` obtida do `IAIAgentExecutionService`.
                    *   Outras dependências diretas que o `Worker` possa precisar (ex: `LoggerService`, obtida do DI).
            c.  Iniciar o loop de processamento do `Worker`.
    *   Os `Worker`s seriam instâncias de uma classe `AgentWorker` (da camada de infraestrutura), que encapsula a lógica de polling da fila e chamada ao método de processamento do agente.

*   **Criação e Gerenciamento de Filas (`Queues`):**
    *   As "filas" são conceituais e representadas por `Job`s no banco de dados com um `queueName` específico. Não necessariamente exigem uma tabela separada para `Queues` no DB, a menos que precisemos armazenar metadados específicos da fila (além do que está no `AIAgent`). A associação entre um `Worker` e o `queueName` que ele monitora é fundamental e de um para um.
    *   Ao criar um novo `AIAgent`, um `queueName` único seria gerado (ex: `agent-${agentId}-queue`) e armazenado na configuração do `AIAgent`. Este `queueName` seria usado para configurar o `Worker` dedicado a este agente.
    *   O `EnqueueJobUseCase` usaria o `targetAgentId` para buscar o `queueName` do `AIAgent` correspondente (ou o `queueName` seria fornecido diretamente ao caso de uso) para associar o `Job` a essa fila.

*   **Escalabilidade e Concorrência (Considerações Futuras):**
    *   Inicialmente, cada `Worker` pode processar um job por vez para um determinado agente.
    *   No futuro, se a concorrência por agente for necessária, um `AIAgent` poderia ter múltiplos `Worker`s associados à mesma `queueName`, ou o próprio `Worker` poderia ser capaz de executar múltiplos `jobProcessor`s em paralelo (usando, por exemplo, `Promise.all` ou `worker_threads` do Node.js se os `jobProcessor`s forem CPU-bound ou puderem se beneficiar de I/O não bloqueante de forma isolada). Isso adicionaria complexidade ao gerenciamento de estado dos jobs.

*   **Parada Graciosa:**
    *   O `AgentLifecycleService` também seria responsável por parar graciosamente todos os `Worker`s quando a aplicação Electron for encerrada, permitindo que jobs em processamento tentem finalizar antes de fechar. Cada `Worker` precisaria de um método `stop()` que sinalize seu loop para terminar após o job atual.

Este sistema de gerenciamento garante que os agentes possam ser configurados dinamicamente e que seus workers e filas associados sejam corretamente instanciados e operados como parte do ciclo de vida da aplicação.

## 9. Comunicação UI-Backend (IPC)
(Conteúdo existente da Seção 9)

## 10. (Opcional) Plano de Transição/Refatoração Incremental
A refatoração completa de um sistema existente para uma nova arquitetura é uma tarefa significativa. Abordá-la de forma incremental é crucial para gerenciar riscos, obter feedback contínuo e entregar valor progressivamente. Abaixo, uma sugestão de plano de transição:

**Fase 0: Preparação e Configuração Inicial (Sprint 0/1)**
1.  **Configurar InversifyJS:**
    *   Integrar InversifyJS e configurar o container de DI (`inversify.config.ts`, `types.ts`).
    *   Identificar e registrar alguns serviços básicos de infraestrutura (ex: `LoggerService`) como teste inicial.
2.  **Definir Estrutura de Diretórios:**
    *   Criar a estrutura de pastas base para `src/domain`, `src/application`, `src/infrastructure`, `src/presentation`.
3.  **Estabelecer Padrões de Código:**
    *   Configurar linters, formatadores (ESLint, Prettier) e um guia de estilo para garantir consistência.
    *   Definir padrões para nomenclatura de arquivos e classes.
4.  **Primeiros Componentes de Domínio:**
    *   Definir as interfaces chave de repositório, começando com `IJobRepository` e `IAIAgentRepository`.
    *   Criar as entidades `Job` e `AIAgent` iniciais, focando em atributos e comportamento essencial, sem persistência completa ainda.

**Fase 1: Implementação do Novo Sistema de Job/Worker (Sprints 1-3)**
*Objetivo: Ter um sistema de fila funcional com o novo `Worker` e `Job` para um tipo de agente.*
1.  **Implementar `IJobRepository`:**
    *   Criar a implementação concreta (ex: `DrizzleJobRepository` ou uma versão em memória para desenvolvimento inicial) para `IJobRepository`.
    *   Implementar os métodos `add`, `save`, `findById`, `findNextPending`. Focar na lógica de lock e transição de status.
2.  **Desenvolver Entidade `Job`:**
    *   Refinar a entidade `Job` com todos os métodos de manipulação de estado (`startProcessing`, `complete`, `fail`, `prepareForDelay`, etc.).
3.  **Desenvolver `QueueClient`:**
    *   Implementar a classe `QueueClient` que utiliza `IJobRepository`.
4.  **Desenvolver `AIAgentExecutionService` (Parcial):**
    *   Implementar uma versão inicial do `AIAgentExecutionService` que possa fornecer um `jobProcessor` simples para um tipo de agente (ex: um "echo agent" que apenas registra o payload do job e o completa).
    *   Injetar dependências mockadas ou básicas por enquanto.
5.  **Desenvolver o `Worker` Genérico:**
    *   Implementar a classe `Worker` genérica, configurável com `IQueueClient` e `jobProcessor`.
    *   Implementar a lógica de loop, chamada ao `jobProcessor`, e tratamento de resultados/erros (incluindo `DelayedError`).
6.  **Implementar `EnqueueJobUseCase`:**
    *   Desenvolver o caso de uso para adicionar novos jobs à fila.
7.  **Configurar e Testar o Primeiro Agente/Worker:**
    *   No `main.ts` (ou `AgentLifecycleService`), configurar e iniciar um `Worker` para o "echo agent" usando o `jobProcessor` fornecido pelo `AIAgentExecutionService`.
    *   Testar o fluxo de enfileirar um job, o worker pegá-lo, processá-lo e o job ser marcado como `COMPLETED`.
8.  **Refatorar IPCHandlers para `EnqueueJobUseCase`:**
    *   Atualizar os IPCHandlers existentes que criam jobs para usar o novo `EnqueueJobUseCase`.

**Fase 2: Migração da Lógica de Agentes Existentes (Sprints 3-5)**
*Objetivo: Migrar a funcionalidade dos agentes PO/CTO existentes para o novo sistema de Worker/Job.*
1.  **Analisar e Decompor Agentes Atuais:**
    *   Mapear a lógica dos agentes PO/CTO atuais para a nova estrutura de `jobProcessor` dentro do `AIAgentExecutionService`.
    *   Identificar as ferramentas (`IToolRegistry`) e serviços (`ILLMService`) necessários.
2.  **Implementar `ILLMService` e `IToolRegistry`:**
    *   Criar implementações concretas e/ou adaptadores para os serviços LLM e ferramentas existentes.
    *   Integrá-los com o `AIAgentExecutionService`.
3.  **Refatorar/Reimplementar `jobProcessor`s:**
    *   Desenvolver os `jobProcessor`s específicos para os agentes PO/CTO dentro do `AIAgentExecutionService`, utilizando `ILLMService` e `IToolRegistry`.
4.  **Testar e Validar Agentes Refatorados:**
    *   Configurar os `Worker`s para esses agentes e testar exaustivamente.

**Fase 3: Refatoração da UI e Comunicação IPC (Sprints Contínuos)**
*Objetivo: Alinhar a UI com a nova arquitetura e usar DI nos IPCHandlers.*
1.  **Refatorar IPCHandlers:**
    *   Continuar a refatoração de todos os IPCHandlers para usar Casos de Uso ou Serviços de Domínio/Aplicação, injetando dependências via container DI.
2.  **(Opcional) Adotar Camada de Apresentação/Aplicação:**
    *   Se a UI se tornar complexa, introduzir DTOs, Presenters ou ViewModels para desacoplar a UI da lógica de domínio.
3.  **Revisar Fluxo de Dados UI-Backend:**
    *   Garantir que a comunicação entre UI e backend seja eficiente e siga os novos padrões arquiteturais.

**Fase 4: Refatoração Contínua e Melhorias (Contínuo)**
*Objetivo: Aplicar os princípios da nova arquitetura ao restante do código e realizar melhorias.*
1.  **Aplicar Object Calisthenics:**
    *   Revisar e refatorar classes existentes para aderir às regras de Object Calisthenics.
2.  **Identificar e Refatorar Dívida Técnica:**
    *   Priorizar e abordar outras áreas do código que não estão alinhadas com a nova arquitetura.
3.  **Expandir Cobertura de Testes:**
    *   Escrever testes unitários para Casos de Uso, Entidades e Serviços de Domínio.
    *   Escrever testes de integração para fluxos chave.

**Considerações Gerais:**
*   **Testes:** Acompanhar cada etapa de refatoração com a escrita de testes unitários e de integração.
*   **Branching Strategy:** Utilizar feature branches para cada etapa ou funcionalidade da refatoração.
*   **Revisão de Código:** Realizar revisões de código rigorosas para garantir a adesão à nova arquitetura.
*   **Comunicação:** Manter a equipe alinhada sobre as mudanças e o progresso.

Este plano é uma sugestão e pode ser adaptado conforme as prioridades e descobertas durante o processo de refatoração.

## 11. Conclusão

Esta proposta de arquitetura alvo para o sistema "project-wiz" visa estabelecer uma base sólida, manutenível e escalável para o futuro do projeto. Ao adotar princípios como Clean Architecture, Injeção de Dependência com InversifyJS, Object Calisthenics e uma clara separação de responsabilidades em camadas, esperamos colher benefícios significativos em termos de qualidade de código, produtividade do desenvolvedor e capacidade de evolução do sistema.

**Principais Benefícios Reafirmados:**
*   **Manutenibilidade Aprimorada:** A separação clara de preocupações e o baixo acoplamento facilitarão a compreensão, modificação e correção de bugs.
*   **Testabilidade Elevada:** A lógica de negócios no domínio será testável independentemente de UI ou infraestrutura, permitindo testes unitários mais robustos.
*   **Escalabilidade:** A arquitetura modular permitirá que o sistema cresça de forma organizada, adicionando novas funcionalidades ou adaptando as existentes com menor impacto.
*   **Melhor Experiência do Desenvolvedor (DX):** Uma base de código bem estruturada, juntamente com DI, tornará o desenvolvimento mais intuitivo e eficiente.
*   **Flexibilidade Tecnológica:** A abstração de detalhes de infraestrutura (como banco de dados) permitirá futuras mudanças tecnológicas com menor esforço.
*   **Integração Coesa:** O novo sistema de Worker/Job, integrado com a lógica de Agentes de IA através do `AIAgentExecutionService` e `QueueClient`, fornecerá uma plataforma unificada para processamento assíncrono.

**Próximos Passos:**
1.  **Revisão e Aprovação:** Apresentar esta proposta à equipe e stakeholders para feedback, discussão e aprovação formal.
2.  **Refinamento do Plano de Transição:** Detalhar ainda mais o plano de refatoração incremental (Seção 10) com estimativas de esforço e alocação de recursos para as primeiras fases.
3.  **Início da Fase 0:** Após a aprovação, iniciar a "Fase 0: Preparação e Configuração Inicial", que inclui a configuração do InversifyJS, a criação da estrutura de diretórios e o estabelecimento de padrões de código.
4.  **Desenvolvimento Iterativo:** Prosseguir com as fases subsequentes do plano de transição, priorizando a implementação do novo sistema de Job/Worker como base para a refatoração dos agentes existentes.
5.  **Monitoramento e Adaptação:** Acompanhar continuamente o progresso da refatoração, adaptando o plano conforme necessário com base nos aprendizados e desafios encontrados.

Acreditamos que o investimento na adoção desta arquitetura trará retornos valiosos a médio e longo prazo, resultando em um produto mais robusto, confiável e fácil de evoluir. Estamos à disposição para discutir quaisquer pontos desta proposta em maior detalhe.
