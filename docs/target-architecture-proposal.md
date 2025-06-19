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
    *   Definem os contratos (interfaces TypeScript) para as operações de persistência de dados e operações de fila.
    *   Exemplos: `IQueueRepository` (para Jobs e operações de fila), `IProjectRepository`, `IUserRepository`.
    *   Permitem que os Casos de Uso e Serviços de Domínio permaneçam independentes das tecnologias de banco de dados específicas. As implementações concretas residem na camada de Infraestrutura.
    *   **`IQueueRepository` (ex: `src/domain/repositories/i-queue.repository.ts`):** Esta interface é central para o sistema de filas. Ela define métodos para CRUD de `Job`s e para operações de estado da fila que exigem `workerToken` e gerenciamento de locks.
        ```typescript
     // src/domain/repositories/i-queue.repository.ts
     import { Job } from '../entities/job.entity';
     import { JobStatusVO } from '../entities/value-objects/job-status.vo'; // Supondo que JobStatusVO seja importável

     export interface JobData {
       [key: string]: any;
     }

     // Opções para backoff em caso de falha e retentativa
     export interface BackoffOptions {
        type: 'exponential' | 'fixed';
        delay: number;
     }

     export interface IQueueRepository {
       // Cria um novo job na fila. Usado pelo EnqueueJobUseCase.
       // Não lida com locks, pois o job é novo.
       add(job: Job): Promise<void>;

       // Busca um job pelo ID.
       findById(jobId: string): Promise<Job | null>;

       // Encontra o próximo job pendente (status PENDING ou DELAYED com delayUntil passado)
       // para uma fila específica, aplica um lock, e retorna o job e um lockToken.
       // workerId é registrado para identificar quem tem o lock.
       findNextPending(queueName: string, workerId: string): Promise<{ job: Job; lockToken: string } | null>;

       // Persiste o estado ATIVO de um job após o Worker pegá-lo.
       // Valida o lockToken.
       markJobActive(jobId: string, attempts: number, processedAt: Date, workerToken: string): Promise<void>;

       // Atualiza o campo 'data' de um job. Chamado pelo jobProcessor.
       // Valida o lockToken.
       updateJobData(jobId: string, data: JobData, workerToken: string): Promise<void>;

       // Move um job para o estado DELAYED. Chamado pelo jobProcessor.
       // Valida o lockToken, atualiza status, delayUntil, e libera o lock.
       requestMoveToDelayed(jobId: string, workerToken: string, delayUntilTimestamp: number): Promise<void>;

       // Move um job para o estado WAITING_CHILDREN. Chamado pelo jobProcessor.
       // Valida o lockToken, atualiza status, e libera o lock.
       // Retorna true se o job foi movido para espera, false se não há filhos pendentes (job pode ser completado).
       requestMoveToWaitingChildren(jobId: string, workerToken: string): Promise<boolean>;

       // Marca um job como COMPLETED. Chamado pelo Worker.
       // Valida o lockToken, atualiza status, result, finishedAt, e libera o lock.
       completeJob(jobId: string, result: any, workerToken: string): Promise<void>;

       // Marca um job como FAILED ou o re-enfileira para retentativa com backoff. Chamado pelo Worker.
       // Valida o lockToken. Se houver retentativas, atualiza status para PENDING/DELAYED,
       // calcula novo delayUntil com base na estratégia de backoff, e incrementa attempts.
       // Se não houver mais tentativas, atualiza status para FAILED. Libera o lock.
       // Retorna o novo estado do job (status, delayUntil, attempts) para o Worker atualizar sua instância em memória.
       failJob(
         jobId: string,
         error: string,
         currentAttempts: number,
         maxAttempts: number,
         backoffOptions: BackoffOptions | undefined, // Config de backoff do job
         workerToken: string
       ): Promise<{ newStatus: JobStatusVO; newDelayUntil?: Date; newAttempts: number }>;
     }
        ```

*   **Serviços de Domínio (`services/`):**
    *   Contêm lógica de negócios significativa que não se encaixa naturalmente em uma única entidade.
    *   Operam sobre múltiplas entidades ou coordenam comportamentos complexos do domínio.
    *   São stateless (sem estado próprio), e suas dependências (outros serviços, repositórios) são injetadas.
    *   Exemplo: Um serviço que determina a prioridade de um `Job` com base em múltiplas regras de negócio e no estado de outros `Jobs` ou `Projects`.

        *   **`AIAgentExecutionService` (ex: `src/domain/services/agent/ai-agent-execution.service.ts`):**
            Este serviço é crucial para a funcionalidade dos Agentes de IA. Ele não é o `AIAgent` (que é uma entidade de configuração/perfil), mas o orquestrador que executa a lógica de um agente para processar um `Job`.
            **Responsabilidades:**
            -   Fornecer a função `jobProcessor` que será executada pelos `Worker`s dedicados às filas de Agentes de IA. Este serviço atua como a ponte entre a lógica de negócios específica dos agentes e o sistema de filas genérico.
            -   Utilizar o `payload` do `Job` (ou `job.name`/`job.data`) para identificar e carregar a configuração do `AIAgent` apropriado (via `IAIAgentRepository`).
            -   Dentro da função `jobProcessor` que ele fornece:
                -   Orquestrar a interação com o `ILLMService` (passando o perfil do agente, mensagens, ferramentas).
                -   Executar ferramentas através do `IToolRegistry`.
                -   Gerenciar o estado da tarefa do agente, chamando `job.updateJobData()` para modificar o estado do job em memória, e então usando o `queueClient` recebido (que é um parâmetro do `jobProcessor`) para chamar `queueClient.updateJobData(job.id, job.props.data, workerToken)` para persistir essas alterações de dados.
                -   Para operações avançadas na fila (ex: adiar um job), o `jobProcessor` chamará primeiro um método de preparação na entidade `Job` (ex: `job.prepareForDelay(timestamp)`), que atualiza o estado do `Job` em memória. Em seguida, o `jobProcessor` lançará um erro específico (ex: `DelayedError`) para sinalizar essa intenção ao `Worker`. O `Worker` é então responsável por persistir o estado preparado do `Job` através do `queueClient`.
            **Dependências (Injetadas via Construtor no `AIAgentExecutionService`):** `ILLMService`, `IToolRegistry`, `IAIAgentRepository`.

            **Função `jobProcessor` Fornecida pelo Serviço:**
            O `AIAgentExecutionService` teria um método que retorna (ou cujo corpo é) a função `jobProcessor`. Esta função teria a assinatura `async (job: Job, workerToken: string, queueClient: IQueueClient): Promise<any>`.
            Exemplo conceitual da lógica interna desta função `jobProcessor`:
            ```typescript
            // Dentro do AIAgentExecutionService, ou um método que ele retorna:
            // async function agentJobProcessor(
            //   this: AIAgentExecutionService, // 'this' se for um método da classe
            //   job: Job,
            //   workerToken: string,
            //   queueClient: IQueueClient // Recebe o IQueueClient do Worker
            // ): Promise<any> {
            //   const agentId = job.payload.agentId || this.defaultAgentId;
            //   const agentProfile = await this.aiAgentRepository.findById(agentId);
            //   if (!agentProfile) {
            //     // Se o perfil não for encontrado, o job deve falhar imediatamente.
            //     // O Worker tratará essa exceção.
            //     throw new Error(`AIAgent profile ${agentId} not found for job ${job.id}.`);
            //   }

            //   const taskInput = job.payload.taskInput || job.payload.goal;
            //   // job.data já conteria o estado salvo da última execução (se houver)
            //   // A entidade Job já foi carregada pelo Worker via queueClient.getNextJob()

            //   let conversationHistory = job.props.data?.conversationHistory || [];
            //   let currentStep = job.props.data?.currentStep || 'initial_processing';

            //   console.log(`[AIAgentExecutionService/jobProcessor] Job ${job.id}, Agent ${agentProfile.name}, Step ${currentStep}`);

            //   if (currentStep === 'initial_processing') {
            //     console.log(`[AIAgentExecutionService/jobProcessor] Job ${job.id}: Executando etapa inicial.`);
            //     // ... lógica inicial, talvez uma chamada LLM ...
            //     const llmResponse = `LLM output for initial step of '${taskInput}'`; // Simulado
            //     conversationHistory.push({role: 'user', content: taskInput}); // Adiciona input do usuário ao histórico
            //     conversationHistory.push({role: 'assistant', content: llmResponse});
            //     currentStep = 'tool_execution';

            //     // Atualizar dados do job em memória
            //     job.updateJobData({ conversationHistory, currentStep });
            //     // Persistir os dados atualizados via QueueClient
            //     await queueClient.updateJobData(job.id, job.props.data, workerToken);
            //     console.log(`[AIAgentExecutionService/jobProcessor] Job ${job.id} data updated, new step: ${currentStep}`);
            //   }

            //   if (currentStep === 'tool_execution') {
            //     console.log(`[AIAgentExecutionService/jobProcessor] Job ${job.id}: Executando etapa de ferramentas.`);
            //     // ... lógica de execução de ferramenta baseada na resposta do LLM ...
            //     // Exemplo: const toolResult = await this.toolRegistry.executeTool(...);
            //     // conversationHistory.push({role: 'tool', content: toolResult});
            //     currentStep = 'final_processing'; // Avança para a próxima etapa

            //     // Adiar o job antes da etapa final, como exemplo
            //     const delayUntil = Date.now() + 10000; // Adiar por 10 segundos
            //     console.log(`[AIAgentExecutionService/jobProcessor] Job ${job.id} preparando para adiamento até ${new Date(delayUntil).toISOString()}`);

            //     // 1. Preparar o estado do Job em memória para o adiamento
            //     job.prepareForDelay(new Date(delayUntil));
            //     // 2. (Opcional) Atualizar os dados do job (que podem incluir o currentStep) ANTES de sinalizar o adiamento
            //     job.updateJobData({ conversationHistory, currentStep, awaitingDelayConfirmation: true });
            //     await queueClient.updateJobData(job.id, job.props.data, workerToken); // Persiste os dados antes do throw

            //     // 3. Lançar DelayedError para sinalizar ao Worker
            //     throw new DelayedError('Job processing requires a delay before final step.');
            //   }

            //   if (currentStep === 'final_processing') {
            //     // Esta etapa seria executada APÓS o Worker re-enfileirar e processar o job adiado.
            //     // O job.data.awaitingDelayConfirmation poderia ser verificado e removido.
            //     console.log(`[AIAgentExecutionService/jobProcessor] Job ${job.id} resumindo para processamento final.`);
            //     // ... lógica final, talvez outra chamada LLM ...
            //     const finalOutput = "Final output of the agent's task after all steps.";
            //     // conversationHistory.push({role: 'assistant', content: finalOutput}); // Adicionar ao histórico

            //     // Atualizar dados finais do job
            //     // job.updateJobData({ conversationHistory, currentStep, finalOutput, awaitingDelayConfirmation: undefined });
            //     // await queueClient.updateJobData(job.id, job.props.data, workerToken); // Persistir dados finais

            //     return finalOutput; // Resultado final para o Worker marcar o job como COMPLETED
            //   }

            //   // Se o job tiver um estado/etapa inesperado
            //   throw new Error(`Job ${job.id} is in an unexpected step: ${currentStep}`);
            // }
            ```
        *   **Outros Serviços de Domínio:** Como o `JobPriorityService` mencionado anteriormente, se necessário.

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
    *   Implementações concretas das interfaces de repositório definidas no Domínio (ex: `DrizzleQueueRepository` implementando `IQueueRepository`).
    *   Utilizará Drizzle ORM para interagir com o banco de dados SQLite.
    *   Incluirá os esquemas do Drizzle, configurações de conexão com o banco de dados e scripts de migração.
    *   **Sistema de Filas Local (Inspirado em BullMQ, com Persistência em SQLite):**
        A camada de infraestrutura (`infrastructure/persistence/queue/`) será responsável por uma implementação customizada de um sistema de filas assíncronas. Este sistema é um componente fundamental e genérico, projetado para ser utilizável por qualquer parte da aplicação que necessite de processamento de tarefas desacoplado e robusto, não se limitando aos Agentes de IA.

        **Princípios e Funcionalidades Chave:**
        *   **Implementação Local, Sem Dependências Externas:** O sistema será construído internamente, utilizando **SQLite** para persistência (via Drizzle ORM) de todos os dados dos jobs e estados de fila. Não haverá dependências de bibliotecas de mensageria externas (Redis, RabbitMQ, BullMQ etc.).
        *   **Inspiração no BullMQ:** Embora customizado, o design da API e as funcionalidades serão fortemente inspirados pelo BullMQ para fornecer capacidades ricas e familiares.
        *   **Jobs como Unidade de Trabalho:** A entidade `Job` (Seção 6.1) representa a unidade de trabalho, contendo `id`, `queueName`, `name` (tipo de job), `payload`, `status`, `attempts`, `maxAttempts`, `data` (para dados customizados do processador), `priority`, `delayUntil`, `parentId`, etc.
        *   **Filas Nomeadas (`queueName`):** Jobs são categorizados e processados em filas específicas, identificadas por um `queueName`.
        *   **Workers Genéricos:** Os `Worker`s (Seção 8.2) são componentes da infraestrutura que monitoram uma `queueName` e executam uma função `jobProcessor` fornecida para cada job retirado da fila.
        *   **Gerenciamento Avançado de Estado do Job:** Suporte aos estados: `PENDING`, `ACTIVE`, `COMPLETED`, `FAILED`, `DELAYED`, `WAITING_CHILDREN`.
        *   **Operações de Job (via `IQueueRepository` e `Job`):**
            *   A interação do `jobProcessor` com o estado avançado da fila (adiar, esperar filhos, etc.) será mediada pela `IQueueRepository` (implementação em `infrastructure/persistence/queue/DrizzleQueueRepository.ts`).
            *   A entidade `Job` poderá ter métodos como `updateData(data: any)` para modificar seu estado em memória (`props.data`), que então será persistido pelo `jobProcessor` através de uma chamada a `queueRepository.save(job)`.
        *   **Opções de Job Configuráveis:** Suporte para `attempts`, `backoff` (estratégias de retentativa), `priority`, `delay` inicial.
        *   **Locks de Job e `workerToken`:** A `IQueueRepository` gerenciará locks nos jobs ativos para garantir que um job seja processado por apenas um worker por vez. O `workerToken` (fornecido pelo `Worker` ao `jobProcessor`) será necessário para autorizar operações sensíveis na `IQueueRepository` (ex: `requestMoveToDelayed`, `requestMoveToWaitingChildren`, `completeJob`, `failJob`).
        *   **Jobs Filhos (Parent/Child):** Suporte para estruturar jobs hierarquicamente.

        A implementação concreta (`DrizzleQueueRepository`) usará Drizzle para interagir com o SQLite, gerenciando os locks e o `workerToken` para garantir a integridade das operações. O `jobProcessor` invocará os métodos da `IQueueRepository` e, se apropriado (ex: após `requestMoveToDelayed`), lançará erros como `DelayedError` para sinalizar ao `Worker`. Para facilitar a interação dos `Worker`s com filas específicas, um objeto `QueueClient` (descrito na Seção 8.3) pode ser usado para encapsular o `queueName` e as chamadas ao `IQueueRepository`.

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
        *   **Workers de Agentes (`infrastructure/workers/` ou dentro de `infrastructure/electron/`):** Implementações dos `Worker`s genéricos dedicados a uma fila. Cada worker monitora uma fila específica (identificada por `queueName`), retira `Job`s, gera um `workerToken`, e executa uma função `jobProcessor` que lhe foi fornecida em sua configuração. Para jobs de agentes de IA, esta função `jobProcessor` é fornecida pelo `AIAgentExecutionService` (da camada de domínio) e contém a lógica específica do agente. O `Worker` também gerencia o ciclo de vida do job na fila com base no resultado do `jobProcessor` (incluindo tratamento de `DelayedError`, `WaitingChildrenError`). A inicialização e o gerenciamento desses workers ocorrerão no processo principal do Electron.

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

        // --- Bindings para Serviços de Domínio/Aplicação ---
        import { AIAgentExecutionService } from '@/domain/services/agent/ai-agent-execution.service'; // Ajustar caminho conforme estrutura final
        import { IAIAgentExecutionService } from '@/domain/services/agent/i-ai-agent-execution.service'; // Interface
        container.bind<IAIAgentExecutionService>(TYPES.IAIAgentExecutionService).to(AIAgentExecutionService).inSingletonScope(); // Ou inTransientScope() se fizer sentido

        import { JobQueueService } from '@/infrastructure/persistence/queue/job-queue.service'; // Ajustar caminho
        import { IJobQueueService } from '@/domain/repositories/i-job-queue.service'; // Ou domain/services/
        container.bind<IJobQueueService>(TYPES.IJobQueueService).to(JobQueueService).inSingletonScope();

        // Nota sobre Workers:
        // Os `AgentWorker`s (da camada de infraestrutura, ex: `infrastructure/workers/agent.worker.ts`)
        // são instanciados e configurados programaticamente pelo `AgentLifecycleService` (ver Seção 8.3),
        // que é parte da lógica de inicialização no processo principal do Electron.
        // O `AgentLifecycleService` obteria o `IAIAgentExecutionService` e outras dependências
        // (como `IJobRepository`) do container DI. Em seguida, para cada `AIAgent` configurado,
        // ele instancia um `AgentWorker`, passando o `queueName` do agente e a função `jobProcessor`
        // específica (obtida do `IAIAgentExecutionService`, possivelmente um método vinculado ou
        // uma função curried com o `AIAgentId` ou `AIAgentProps` já configurados).
        // As dependências diretas do `AgentWorker` (como `IJobRepository`) também podem ser passadas
        // pelo `AgentLifecycleService` após serem resolvidas do container.

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
  // Job Processors (Removidos ou comentados se a lógica está no AIAgent.processJob)
  // TextGenerationJobProcessor: Symbol.for('TextGenerationJobProcessor'),
  // CodeGenerationJobProcessor: Symbol.for('CodeGenerationJobProcessor'),

  // Workers (Geralmente instanciados programaticamente, não injetados como tipo único)
  // AgentWorker: Symbol.for('AgentWorker'),

  // Serviços de Domínio/Aplicação para Agentes
  IAIAgentExecutionService: Symbol.for('IAIAgentExecutionService'),
  IJobQueueService: Symbol.for('IJobQueueService'),       // Para interações avançadas com a fila
  // IAIAgentDomainService: Symbol.for('IAIAgentDomainService'), // Se a abordagem de serviço for usada -> substituído/renomeado para IAIAgentExecutionService
  // Fábricas
  // JobProcessorFactory: Symbol.for('JobProcessorFactory'), // Removido se job processors não são mais registrados individualmente
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

Com o container configurado e os tipos definidos, as classes podem ser marcadas como `@injectable()` para serem gerenciadas pelo container e terem suas dependências injetadas via construtor usando `@inject(TYPES.NomeDoSimbolo)`.

**Exemplo com `AIAgentExecutionService`:**

Este serviço é central para a execução da lógica dos agentes de IA. Ele recebe todas as dependências necessárias para orquestrar a interação com LLMs, ferramentas, e o sistema de filas.

```typescript
// Exemplo conceitual: src/domain/services/agent/ai-agent-execution.service.ts
import { injectable, inject } from 'inversify';
import { TYPES } from '@/infrastructure/ioc/types';
import { IAIAgentRepository } from '@/domain/repositories/i-ai-agent.repository';
import { IQueueRepository } from '@/domain/repositories/i-queue.repository'; // Alterado
import { ILLMService } from '@/domain/services/i-llm.service';
import { IToolRegistry } from '@/domain/services/i-tool-registry.service';
import { Job } from '@/domain/entities/job.entity';
import { AIAgent } from '@/domain/entities/ai-agent.entity'; // A entidade de configuração
// Importar CoreMessage, DelayedError, WaitingChildrenError se necessário

export interface IAIAgentExecutionService {
  getJobProcessorForAgent(agentId: string): (job: Job, workerToken: string) => Promise<any>;
  // Ou, alternativamente, um método que executa diretamente:
  // processAgentJob(agentId: string, job: Job, workerToken: string): Promise<any>;
}

@injectable()
export class AIAgentExecutionService implements IAIAgentExecutionService {
  constructor(
    @inject(TYPES.IAIAgentRepository) private aiAgentRepository: IAIAgentRepository,
    @inject(TYPES.IQueueRepository) private queueRepository: IQueueRepository, // Alterado
    @inject(TYPES.ILLMService) private llmService: ILLMService,
    @inject(TYPES.IToolRegistry) private toolRegistry: IToolRegistry
  ) {}

  // Opção 1: Retornar uma função jobProcessor configurada para um agente específico
  public getJobProcessorForAgent(agentId: string): (job: Job, workerToken: string) => Promise<any> {
    return async (job: Job, workerToken: string): Promise<any> => {
      const agentProfile = await this.aiAgentRepository.findById(agentId);
      if (!agentProfile) {
        throw new Error(`AIAgent profile ${agentId} not found for job ${job.id}.`);
      }

      // Lógica de processamento do job do agente (interação com LLM, ferramentas, etc.)
      // Esta é a lógica que antes estava esboçada em AIAgent.processJob
      console.log(`[AIAgentExecutionService] Processing job ${job.id} for agent ${agentProfile.name} (Token: ${workerToken.substring(0,8)})`);

      const taskInput = job.payload.taskInput || job.payload.goal;
      let conversationHistory = job.data?.conversationHistory || [];
      // Adicionar taskInput ao histórico, etc.

      // Exemplo de interação com LLM
      // const llmResult = await this.llmService.streamText({
      //   modelId: agentProfile.props.modelId,
      //   systemPrompt: agentProfile.props.roleDescription,
      //   // ...
      //   messages: conversationHistory,
      //   tools: this.toolRegistry.getTools(agentProfile.props.availableTools),
      // });
      // ... (processar stream, executar ferramentas via this.toolRegistry)

      // Exemplo de atualização de dados do job
      // job.updateJobData({ conversationHistory, currentStep: 'llm_processed' });
      // await this.queueRepository.save(job); // Alterado para queueRepository

      // Exemplo de adiamento do job
      // if (conditionToDelay) {
      //   job.setToBeDelayed(new Date(Date.now() + delayDuration));
      //   await this.queueRepository.save(job); // Salva o estado pretendido
      //   await this.queueRepository.requestMoveToDelayed(job.id, workerToken, job.props.delayUntil!); // Alterado para queueRepository
      //   throw new DelayedError('Job processing delayed by agent logic.');
      // }

      const finalResult = { message: `Job ${job.id} processed for agent ${agentProfile.name}. Output: Example result.`};
      // job.updateJobData({ finalResult }); // Salvar resultado final nos dados do job
      // await this.queueRepository.save(job); // Alterado para queueRepository

      return finalResult;
    };
  }

  // Opção 2: Método que executa diretamente (Worker passaria agentId) - menos flexível para o Worker genérico
  // public async processAgentJob(agentId: string, job: Job, workerToken: string): Promise<any> {
  //    // Lógica similar à de cima
  // }
}
```

**Obtendo e Usando o `jobProcessor` no `AgentLifecycleService` (Conceitual):**

O `AgentLifecycleService` (mencionado na Seção 8.3), ao inicializar os `Worker`s, faria algo assim:

```typescript
// No AgentLifecycleService (lógica de inicialização)
// const agentExecutionService = container.get<IAIAgentExecutionService>(TYPES.IAIAgentExecutionService);
// const queueRepository = container.get<IQueueRepository>(TYPES.IQueueRepository); // Alterado
// const aiAgentRepository = container.get<IAIAgentRepository>(TYPES.IAIAgentRepository);
// // ... outras dependências globais para workers

// Para cada AIAgentConfig carregado do aiAgentRepository:
//   const agentConfig = ... // AIAgentProps
//   const specificJobProcessor = agentExecutionService.getJobProcessorForAgent(agentConfig.id);
//
//   const worker = new AgentWorker(
//     agentConfig.queueName, // queueName da config do agente
//     specificJobProcessor,
//     queueRepository, // Passando IQueueRepository para o Worker
//     // ... outras dependências que o Worker precisa (ex: LoggerService)
//   );
//   worker.start();
```
Isso demonstra como o `AIAgentExecutionService` atua como uma fábrica ou provedor para a lógica de processamento específica do agente, que é então executada por `Worker`s genéricos. A entidade `AIAgent` (Seção 6.2) agora serve primariamente como o DTO de configuração/perfil para o agente.

## 5. Proposta de Organização de Diretórios Detalhada

A seguir, é apresentada a proposta para a organização de diretórios dentro da pasta `src/`. Esta estrutura visa refletir a separação de camadas da Clean Architecture, simplificada para três camadas principais (`domain`, `infrastructure`, `shared`), e facilitar a navegação e localização dos diferentes componentes do sistema.

```
src/
├── domain/
│   ├── entities/
│   │   ├── value-objects/
│   │   ├── job.entity.ts
│   │   └── ai-agent.entity.ts
│   ├── use-cases/
│   │   ├── job/
│   │   │   ├── dtos/ (Opcional: DTOs para este caso de uso)
│   │   │   ├── create-job.use-case.ts
│   │   │   └── ...
│   │   ├── project/
│   │   └── agent/ (Casos de uso relacionados a agentes)
│   ├── repositories/ (Interfaces/Ports)
│   └── services/
│       ├── agent/
│       │   └── ai-agent.service.ts (Se AIAgent.processJob for externalizado para um serviço)
│       └── job-priority.service.ts
│
├── infrastructure/
│   ├── persistence/
│   │   └── drizzle/
│   │       ├── repositories/ (Implementações)
│   │       ├── mappers/
│   │       ├── schema.ts
│   │       └── migrations/
│   │   └── database.ts
│   ├── ui/react/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/ (Serviços da UI)
│   │   ├── contexts/
│   │   ├── routes/
│   │   ├── assets/
│   │   └── styles/
│   ├── electron/
│   │   ├── main.ts
│   │   ├── preload.ts
│   │   └── ipc-handlers/
│   ├── services/ (Clientes para LLMs, Embedding, Logging)
│   │   └── llm/
│   │       └── deepseek.service.ts
│   ├── workers/ # Adicionado
│   │   └── agent.worker.ts
│   └── ioc/
│       ├── inversify.config.ts
│       └── types.ts
│
├── shared/
│   ├── utils/
│   ├── types/ (Tipos TypeScript comuns)
│   ├── dtos/ (Opcional: DTOs globais/compartilhados)
│   └── constants/
│
└── main.ts (Legado)
```

**Considerações Adicionais:**

*   **DTOs (Data Transfer Objects):** Se os Casos de Uso precisarem de estruturas de dados específicas para entrada/saída que diferem das entidades do domínio, esses DTOs podem ser colocados dentro dos respectivos diretórios dos casos de uso (ex: `src/domain/use-cases/job/dtos/create-job.dto.ts`) ou em uma pasta `src/shared/dtos/` se forem amplamente reutilizáveis entre diferentes partes da aplicação. Inicialmente, a camada `src/application` foi omitida para simplificar a estrutura de três camadas principais (`domain`, `infrastructure`, `shared`).
*   **`mappers` em `persistence`:** Se a estrutura das entidades de domínio divergir significativamente dos esquemas do banco de dados, uma camada de mapeadores pode ser útil para converter entre os dois.
*   **Testes:** Diretórios de teste (ex: `__tests__` ou arquivos `*.spec.ts`, `*.test.ts`) seriam colocados próximos aos arquivos que testam, ou em um diretório `tests/` na raiz do projeto, espelhando a estrutura de `src/`.
*   **`AIAgentService`:** Se a lógica de `AIAgent.processJob` se tornar muito complexa ou se beneficiar de ser um serviço injetável separado da entidade `AIAgent` (que se tornaria mais um DTO de configuração), este serviço (`AIAgentService`) residiria em `src/domain/services/agent/`.

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
  private static readonly VALID_STATUSES = [
    'PENDING', 'ACTIVE', 'COMPLETED', 'FAILED',
    'DELAYED', 'WAITING_CHILDREN' // Adicionados
  ] as const;
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
  id: string; // Deveria ser JobIdVO
  name: string; // Tipo de job, usado para rotear para o jobProcessor correto
  queueName: string; // Nome da fila à qual o job pertence
  payload: any; // Dados específicos da tarefa, fornecidos pelo cliente da fila
  data?: any; // Dados internos do jobProcessor, atualizáveis durante a execução
  status: JobStatusVO;
  attempts: number;
  maxAttempts: number;
  priority?: number;
  delayUntil?: Date;
  processedAt?: Date;
  finishedAt?: Date;
  result?: any;
  error?: string;
  parentId?: string; // JobIdVO - Para jobs filhos
  createdAt: Date;
  updatedAt: Date;
}

export class Job {
  private props: JobProps;

  private constructor(props: JobProps) {
    this.props = props;
  }

  public static create(params: {
    id?: string;
    name: string; // Tipo de job
    queueName: string;
    payload: any; // Dados específicos da tarefa
    maxAttempts?: number;
    priority?: number;
    delayUntil?: Date;
    parentId?: string;
    initialData?: any; // Estado inicial para o campo 'data'
  }): Job {
    const now = new Date();
    const id = params.id || crypto.randomUUID(); // Usar UUID real
    return new Job({
      id,
      name: params.name,
      queueName: params.queueName,
      payload: params.payload,
      status: JobStatusVO.create('PENDING'), // Default para PENDING
      attempts: 0,
      maxAttempts: params.maxAttempts || 3,
      priority: params.priority || 10,
      delayUntil: params.delayUntil,
      parentId: params.parentId,
      data: params.initialData,
      createdAt: now,
      updatedAt: now,
      // Certifique-se de que nenhum campo específico de domínio como projectId está sendo atribuído aqui
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

  // Outros métodos como assignToAgent, setPriority, etc., podem ser removidos se não forem genéricos.
  // Os métodos prepareForDelay e prepareToWaitForChildren são mantidos como exemplos de como
  // a entidade pode preparar seu estado internamente antes que o jobProcessor sinalize ao Worker.

    public updateJobData(newData: any): void {
      this.props.data = { ...(this.props.data || {}), ...newData };
      this.props.updatedAt = new Date();
      // Nenhuma chamada de persistência aqui.
    }

    public prepareForDelay(delayTargetTimestamp: Date): void {
      if (!this.props.status.is('ACTIVE')) {
        throw new Error('Job must be ACTIVE to be prepared for delay.');
      }
      this.props.status = JobStatusVO.create('DELAYED');
      this.props.delayUntil = delayTargetTimestamp;
      this.props.updatedAt = new Date();
      // Nenhuma chamada de persistência ou uso de workerToken aqui.
    }

    public prepareToWaitForChildren(): void {
      if (!this.props.status.is('ACTIVE')) {
        throw new Error('Job must be ACTIVE to be prepared to wait for children.');
      }
      this.props.status = JobStatusVO.create('WAITING_CHILDREN');
      this.props.updatedAt = new Date();
      // Nenhuma chamada de persistência ou uso de workerToken aqui.
    }
}
```

**Modificação do Estado do Job e Persistência via Worker/QueueClient:**

A entidade `Job` é responsável por manter seu estado e dados intrínsecos. Seus métodos permitem que o `jobProcessor` modifique este estado *em memória*. A persistência dessas alterações e a execução de operações de fila que requerem autorização (como adiar um job ou marcá-lo como esperando por filhos) são orquestradas pelo `Worker` através do `QueueClient`, utilizando o `workerToken`.

*   **`updateJobData(newData: any): void`** (Método na Entidade `Job`)
    *   **Propósito:** Permitir que o `jobProcessor` modifique o campo `data` da instância do `Job` que está sendo processada (em memória).
    *   **Lógica na Entidade (Reiterada):**
        ```typescript
        public updateJobData(newData: any): void {
          this.props.data = { ...(this.props.data || {}), ...newData };
          this.props.updatedAt = new Date();
        }
        ```
    *   **Fluxo no `jobProcessor`:**
        1.  `job.updateJobData(meusNovosDados);`
        2.  (Opcional, mas recomendado) O `jobProcessor` pode então imediatamente solicitar a persistência desses dados se for um ponto de salvamento intermediário: `await queueClient.updateJobData(job.id, job.props.data, workerToken);` (Este método no `QueueClient` usaria o `IQueueRepository` para persistir os dados do `job`).

*   **Sinalizando Intenção de Adiar ou Esperar (Exemplo com `prepareForDelay`):**
    O `jobProcessor` utiliza métodos na entidade `Job` para preparar o estado desejado em memória. Em seguida, lança um erro específico para sinalizar essa intenção ao `Worker`. O `Worker` então persiste o estado preparado do `Job` usando o `QueueClient`.

    *   **Método na Entidade `Job` (Exemplo para Adiar - Reiterado):**
        ```typescript
        public prepareForDelay(delayTargetTimestamp: Date): void {
          if (!this.props.status.is('ACTIVE')) { // Só pode adiar um job ativo
            throw new Error('Job must be ACTIVE to be prepared for delay.');
          }
          // Validações adicionais podem ser aplicadas aqui.
          this.props.status = JobStatusVO.create('DELAYED'); // Muda o status em memória
          this.props.delayUntil = delayTargetTimestamp;
          this.props.updatedAt = new Date();
        }
        ```
    *   **Lógica no `jobProcessor`:**
        1.  Decide adiar o job e calcula `novoTimestamp`.
        2.  Chama `job.prepareForDelay(novoTimestamp);` (atualiza o `job` em memória).
        3.  Lança `new DelayedError("Job adiado pela lógica do processador");`.
    *   **Lógica no `Worker` (ao capturar `DelayedError`):**
        1.  `await this.queueClient.saveJob(job, lockToken);` (persiste o `job` que agora tem status `DELAYED` e `delayUntil` preenchidos). O `QueueClient` e `IQueueRepository` cuidam da lógica de lock e da atualização no DB. (Nota: `saveJob` é um método conceitual no `QueueClient` que internamente usaria `IQueueRepository.save(job)` e lidaria com o lock; ou o `Worker` usaria `queueClient.moveToDelayed(job.id, lockToken, job.props.delayUntil)` que já persistiria e atualizaria o estado.)

    Um fluxo similar se aplica para `prepareToWaitForChildren()` e `WaitingChildrenError`.

Essa abordagem assegura que a entidade `Job` permaneça um objeto de domínio focado em seu estado, sem conhecimento de `workerToken`s ou da mecânica de persistência da fila. O `jobProcessor` manipula a instância do `Job` em memória, e o `Worker`, em coordenação com o `QueueClient`, gerencia a persistência e as operações de fila autorizadas.
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
  // queueName: string; // REMOVIDO - agora é primariamente uma propriedade do Job
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
    // queueName: string; // REMOVIDO
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

  // O método processJob foi removido desta entidade.
  // A lógica de processamento de job agora reside no jobProcessor fornecido pelo AIAgentExecutionService (Seção 3.1).
}
```

**Considerações sobre a Entidade `AIAgent`:**

Com a lógica de processamento de job movida para o `AIAgentExecutionService`, a entidade `AIAgent` torna-se primariamente um objeto de dados de configuração (um perfil de agente). Ela define *o quê* e *como* um agente deve se comportar (modelo LLM, persona/prompt do sistema, ferramentas disponíveis, etc.), mas não *executa* diretamente o processamento do job.

O `AIAgentExecutionService` utiliza as informações da entidade `AIAgent` (carregada via `IAIAgentRepository`) para orquestrar a interação com o LLM e as ferramentas ao processar um job. As dependências como `ILLMService`, `IToolRegistry`, `IJobQueueService` e `IJobRepository` são gerenciadas pelo `AIAgentExecutionService` (e injetadas nele), não pela entidade `AIAgent`.
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
import { TYPES } from '@/infrastructure/ioc/types';
import { IProjectRepository } from '@/domain/repositories/i-project.repository';
import { Project } from '@/domain/entities/project.entity'; // Supondo que a entidade Project exista e tenha um método create e getters.
// import { IUserRepository } from '@/domain/repositories/i-user.repository'; // Exemplo se precisasse validar usuário

export interface CreateProjectInput {
  name: string;
  description?: string;
  ownerUserId: string; // ID do usuário que está criando/é dono do projeto
}

export interface CreateProjectOutput {
  projectId: string;
  name: string;
  ownerUserId: string;
  createdAt: Date;
}

@injectable()
export class CreateProjectUseCase {
  constructor(
    @inject(TYPES.IProjectRepository) private projectRepository: IProjectRepository
    // @inject(TYPES.IUserRepository) private userRepository: IUserRepository, // Exemplo
  ) {}

  async execute(input: CreateProjectInput): Promise<CreateProjectOutput> {
    // Exemplo de validação (poderia estar em um Value Object ou serviço de domínio)
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('Project name cannot be empty.');
    }

    // const owner = await this.userRepository.findById(input.ownerUserId);
    // if (!owner) {
    //   throw new Error(`User with id ${input.ownerUserId} not found.`);
    // }

    const project = Project.create({ // Supondo que Project.create receba estes params
      name: input.name,
      description: input.description,
      ownerUserId: input.ownerUserId,
    });

    await this.projectRepository.save(project);

    return {
      projectId: project.id,
      name: project.name,
      ownerUserId: project.ownerUserId, // Supondo que a entidade tenha esses getters
      createdAt: project.createdAt,
    };
  }
}
```
### 6.4. Exemplo de Caso de Uso: `EnqueueJobUseCase`
Este caso de uso seria responsável por criar um novo `Job` e adicioná-lo a uma fila para processamento.

**Localização:** `src/domain/use-cases/job/enqueue-job.use-case.ts`

**Princípios Aplicados:**
*   **Injeção de Dependência:** Recebe `IJobRepository`.
*   **Foco Único:** Sua responsabilidade é criar um `Job` com os parâmetros corretos e persisti-lo, o que efetivamente o "enfileira" para ser pego por um Worker.

**Exemplo Conceitual:**

```typescript
// src/domain/use-cases/job/enqueue-job.use-case.ts
import { injectable, inject } from 'inversify';
import { TYPES } from '@/infrastructure/ioc/types';
import { IQueueRepository } from '@/domain/repositories/i-queue.repository'; // Alterado
import { Job } from '@/domain/entities/job.entity';

export interface EnqueueJobInput {
  queueName: string; // Nome da fila de destino
  jobName: string;   // Tipo/nome do job (para Job.create e para o processador saber o que fazer)
  taskPayload: any;  // Dados específicos da tarefa que irão para o Job.payload
  priority?: number;
  delayUntil?: Date;
  maxAttempts?: number;
  parentId?: string;
  initialJobData?: any; // Dados iniciais para o campo Job.data (estado interno do processador)
}

export interface EnqueueJobOutput {
  jobId: string;
  status: string; // O status inicial do job (PENDING ou DELAYED)
  queueName: string;
}

@injectable()
export class EnqueueJobUseCase {
  constructor(
    @inject(TYPES.IQueueRepository) private queueRepository: IQueueRepository // Alterado
  ) {}

  async execute(input: EnqueueJobInput): Promise<EnqueueJobOutput> {
    if (!input.queueName || input.queueName.trim().length === 0) {
      throw new Error('Queue name must be provided.');
    }
    if (!input.jobName || input.jobName.trim().length === 0) {
      throw new Error('Job name must be provided.');
    }
    // O input.taskPayload é agora o que vai para o job.payload
    if (input.taskPayload === undefined) {
      // Permitir payload vazio (ex: {} ou null), mas não undefined se for obrigatório.
      // Para este exemplo, vamos considerar que pode ser opcional ou que a validação é mais complexa.
      // Se fosse obrigatório: throw new Error('Task payload must be provided.');
    }

    const job = Job.create({
      name: input.jobName,       // Usado para identificar o tipo de job/processador
      queueName: input.queueName,
      payload: input.taskPayload,  // Dados específicos da tarefa vão para o payload do Job
      priority: input.priority,
      delayUntil: input.delayUntil,
      maxAttempts: input.maxAttempts,
      parentId: input.parentId,
      initialData: input.initialJobData, // Para o campo 'data' do Job
    });

    await this.queueRepository.save(job); // Usando save, assumindo que IQueueRepository.save() lida com criação.

    return {
      jobId: job.id,
      status: job.status,
      queueName: job.props.queueName,
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
A simulação de diálogo entre o Product Owner (PO) e o CTO, atualmente em `src/infrastructure/frameworks/electron/main/agent/`, serviu como um protótipo valioso para interações com LLMs e o uso de ferramentas. Com a nova arquitetura de Worker/Fila por Agente (descrita na Seção 8.2), essa lógica será reestruturada e integrada de forma mais genérica e robusta.

*   **Conceito Central Mantido:** A ideia de Agentes de IA com personalidades distintas (perfis), capazes de realizar tarefas complexas, interagir com ferramentas e manter um diálogo (seja com um usuário ou outro agente via jobs intermediários) é central para o "project-wiz".

*   **Evolução da Simulação para Lógica no `AIAgent.processJob`:**
    *   A lógica de interação com o LLM, incluindo a construção de prompts do sistema (baseados no perfil do agente), o gerenciamento do histórico da conversa (específico do job), a chamada ao `ILLMService`, o processamento de `tool-calls` e a formatação da resposta final, que estava na classe `Activity` e no loop de `agent/index.ts` da simulação, será encapsulada principalmente dentro do método `processJob` da entidade `AIAgent` (ou de um `AIAgentService` associado), utilizando as configurações específicas do agente (perfil, modelo, ferramentas), conforme descrito na Seção 6.2.
    *   Se a interação PO/CTO for uma funcionalidade desejada, ela poderia ser um tipo de `Job` específico, e os `AIAgent`s configurados com as personas de PO e CTO executariam esses jobs usando seu método `processJob`.

*   **Entidade `AIAgent` no Domínio:**
    *   A entidade `AIAgent` (esboçada em 6.2) continua crucial. Ela define o perfil do agente (nome, papel/backstory para o prompt, ID do modelo LLM, ferramentas que pode usar, temperatura, etc.).
    *   Essas configurações do `AIAgent` são fundamentais para o comportamento do método `processJob` ao lidar com um `Job`.

*   **Ferramentas como Serviços Injetáveis:**
    *   As ferramentas (`writeFile`, `readFile`, `thought`, `finalAnswer` do `tool-set.ts` atual) serão refatoradas como classes/serviços que implementam uma interface comum `ITool` (ou interfaces mais específicas por tipo de ferramenta).
    *   Essas ferramentas serão injetadas no método `AIAgent.processJob` através do objeto de dependências (que inclui o `IToolRegistry`), gerenciado pelo container de DI e fornecido pelo `Worker`.
    *   Isso permite que diferentes agentes, através de seu método `processJob`, tenham acesso a diferentes conjuntos de ferramentas, conforme definido em sua configuração de `AIAgent` e disponibilizado pelo `IToolRegistry`.

*   **Interação entre Agentes via Jobs:**
    *   Se a interação direta entre dois agentes (como na simulação PO/CTO) for necessária, ela pode ser orquestrada através de `Job`s.
    *   Por exemplo, o Agente A (PO), ao concluir seu processamento de um `Job1`, poderia ter como resultado a criação de um `Job2` para o Agente B (CTO), com o output do `Job1` como input para o `Job2`. O `EnqueueJobUseCase` seria usado para colocar o `Job2` na fila do Agente B.

*   **Lógica de Loop nos `Worker`s:**
    *   O loop `while(true)` que existia na simulação (`agent/index.ts`) agora é responsabilidade de cada `Worker` dedicado, que constantemente verifica sua fila por novos `Job`s a serem processados pelo `jobProcessor` do seu agente.

*   **Persistência do Histórico da Conversa/Job:**
    *   O histórico da interação (mensagens trocadas com o LLM, `tool-calls` e `tool-results` durante o processamento de um `Job`) deve ser persistido. Isso pode ser feito:
        *   Serializando o histórico relevante no próprio `Job` (ex: em um campo `Job.executionLog` ou `Job.llmInteractionHistory`).
        *   Utilizando uma entidade separada como `JobExecutionRecord` ou `LLMInteractionLog` associada ao `Job`.
    *   Isso é crucial para depuração, auditoria e, potencialmente, para permitir que jobs de longa duração sejam resumidos ou que o LLM tenha contexto de interações passadas dentro do mesmo job. A classe `Activity` da simulação original tinha essa responsabilidade de manter o histórico para um "passo"; agora isso será parte do estado gerenciado durante a execução de um `jobProcessor`.

Ao refatorar a lógica da simulação desta maneira, ela deixa de ser um script isolado e se torna uma parte integral e reutilizável da capacidade do sistema de executar tarefas complexas através de Agentes de IA configuráveis e especializados, cada um operando dentro da robusta arquitetura de Worker/Fila.
### 8.2. Refatoração do Sistema WorkerService/Job
A lógica de processamento de job, antes concebida como um `jobProcessor` separado, agora é entendida como um método dentro da própria entidade `AIAgent` (ou um serviço de agente associado), conforme detalhado na Seção 6.2.
O sistema de `WorkerService` e `Job` (identificado no `src/main.ts` original e agora refinado com o feedback do usuário) é fundamental para o processamento assíncrono e a execução de tarefas pelos Agentes de IA. A refatoração focará em criar uma arquitetura robusta onde cada Agente de IA opera com sua própria fila e worker dedicado.

*   **Entidade `Job` no Domínio:**
    *   A entidade `Job` (como esboçada em 6.1) continua sendo a representação central de uma tarefa a ser executada, contendo `id`, `name`, `payload`, `status`, `attempts`, etc.

*   **Entidade `Queue` (ou `JobQueue`) no Domínio (Potencial):**
    *   Poderíamos introduzir uma entidade `Queue` se precisarmos gerenciar metadados ou configurações específicas por fila (ex: nome da fila, prioridade da fila, tipo de jobs que aceita).
    *   Alternativamente, uma fila pode ser simplesmente identificada por um `queueName` (string) associado a um `AIAgent`. A persistência dos jobs incluiria este `queueName`.

*   **Repositórios (`IJobRepository`, `IQueueRepository` - se `Queue` for uma entidade):**
    *   `IJobRepository`: Para salvar, buscar e atualizar `Job`s. Os métodos de busca incluiriam a capacidade de buscar jobs pendentes para um `queueName` específico.
    *   `IQueueRepository`: Se `Queue` for uma entidade, este repositório gerenciaria sua persistência.

*   **Caso de Uso para Enfileirar Jobs (`EnqueueJobUseCase`):**
    *   Como esboçado em 6.4, este caso de uso será responsável por criar uma instância de `Job` e persisti-la com o status `PENDING` (ou similar) e associá-la ao `queueName` do `AIAgent` apropriado.
    *   **Entrada:** `name`, `payload`, `targetAgentId` (ou `targetQueueName`), `priority`, etc.
    *   **Lógica:**
        1.  Validar `targetAgentId` (verificar se o agente existe e está ativo, obter seu `queueName`).
        2.  Criar a entidade `Job`.
        3.  Salvar o `Job` usando `IJobRepository` (que o associará ao `queueName` correto).

*   **`Worker` Genérico Dedicado a uma Fila:**
        Um `Worker` é um componente da camada de infraestrutura (`infrastructure/workers/`) responsável por processar jobs de uma fila específica. Ele é configurado com uma instância de `IQueueClient` (que representa a conexão a uma única fila nomeada, veja Seção 8.3) e uma função `jobProcessor` genérica no momento de sua instanciação (geralmente pelo `AgentLifecycleService` ou um serviço similar de gerenciamento de workers).

        **Responsabilidades do `Worker`:**
        1.  **Monitoramento e Retirada de Jobs da Fila Dedicada:**
            *   Executar um loop contínuo para verificar sua `IQueueClient` designada por novos `Job`s.
            *   Chamar `this.queueClient.getNextJob(this.workerId)` para obter o próximo `Job` pendente e um `lockToken` associado. Se nenhum job estiver disponível, o worker aguarda/pausa antes de tentar novamente.

        2.  **Início do Processamento do Job:**
            *   Uma vez que um `Job` é obtido:
                a.  Chamar `job.startProcessing()` na instância do `Job` (para atualizar seu estado em memória para `ACTIVE`, incrementar `attempts`, setar `processedAt`).
                b.  Persistir este estado `ACTIVE` imediatamente: `await this.queueClient.markJobActive(job.id, job.attempts, job.props.processedAt!, lockToken);`.

        3.  **Execução do `jobProcessor`:**
            *   Invocar a função `jobProcessor` configurada, passando a instância do `Job` (agora no estado `ACTIVE` e persistido), o `lockToken`, e a instância do `this.queueClient`.
            ```typescript
            // Exemplo da chamada dentro do Worker:
            // const jobProcessor = this.configuredJobProcessor;
            // try {
            //   const result = await jobProcessor(job, lockToken, this.queueClient);
            //   // Se chegou aqui, o jobProcessor concluiu sem lançar erros de controle de fluxo (DelayedError, etc.)
            //   // O jobProcessor NÃO chama job.complete() diretamente. Ele retorna o resultado.
            //   await this.queueClient.completeJob(job.id, result, lockToken);
            // } catch (error) {
            //   // ... tratamento de erro detalhado abaixo ...
            // }
            ```

        4.  **Tratamento de Resultado/Erro do `jobProcessor`:**
            *   **Conclusão Normal:** Se o `jobProcessor` retorna um valor (`resultFromProcessor`) sem lançar exceções de controle de fluxo:
                1.  O `Worker` chama `await this.queueClient.completeJob(job.id, resultFromProcessor, lockToken)` para persistir o estado `COMPLETED`, o resultado, e liberar o lock.
            *   **`DelayedError` Lançado pelo `jobProcessor`:**
                1.  O `Worker` captura `DelayedError`.
                2.  Isso sinaliza que o `jobProcessor` já utilizou `this.queueClient.moveToDelayed(...)` que, por sua vez, já persistiu o estado `DELAYED` e `delayUntil` do job e liberou o lock. O Worker apenas registra este evento.
            *   **`WaitingChildrenError` Lançado pelo `jobProcessor`:**
                1.  O `Worker` captura `WaitingChildrenError`.
                2.  Similar ao `DelayedError`, o `jobProcessor` já utilizou `this.queueClient.moveToWaitingChildren(...)`. O Worker apenas registra.
            *   **Outras Exceções (Falhas Reais):** Se o `jobProcessor` lança qualquer outra exceção:
                1.  O `Worker` chama `job.fail(error.message)` para atualizar o estado da instância do `Job` em memória (principalmente para ter o log de erro e o status FAILED tentativo).
                2.  O `Worker` então chama `await this.queueClient.failJob(job.id, error.message, job.attempts, job.props.maxAttempts, job.props.backoff, lockToken)`.
                    A implementação de `failJob` no `QueueClient` (usando `IQueueRepository`) determinará se o job deve ser reenfileirado (com status `PENDING` ou `DELAYED` e `delayUntil` atualizado conforme backoff) ou movido para `FAILED` permanentemente, e liberará o lock. O `Worker` pode usar o resultado de `failJob` para atualizar sua instância `job` em memória, se necessário.

        5.  **Liberação de Lock:** A responsabilidade de liberar o lock é primariamente dos métodos do `IQueueClient` (e por delegação, `IQueueRepository`) que finalizam um job (`completeJob`, `failJob`) ou o movem para um estado de espera (`moveToDelayed`, `moveToWaitingChildren`).

        6.  **Ciclo de Vida:** O `Worker` deve ser iniciado e parado graciosamente.

        **Dependências do `Worker` (Fornecidas na Construção):**
        *   `workerId`: `string` (Um identificador único para esta instância do worker)
        *   `queueClient`: `IQueueClient` (Instância configurada para a fila específica que este worker irá processar)
        *   `jobProcessor`: `(job: Job, workerToken: string, queueClient: IQueueClient) => Promise<any>` (A função que contém a lógica de processamento do job)
        *   `LoggerService`: Para logging.

*   **Persistência da Fila:**
    *   A "fila" em si é conceitualmente representada pelos `Job`s no banco de dados que têm um `queueName` específico e um status `PENDING`. O `IJobRepository` precisará de métodos eficientes para consultar esses jobs. Esta abordagem de persistência é parte da implementação do sistema de filas local customizado, inspirado nos conceitos do BullMQ mas sem dependências externas, como descrito na Seção 3.3.

*   **Comunicação Externa Baseada em Eventos:**
    *   Conforme o feedback do usuário, a comunicação do agente (ou seja, do seu `jobProcessor`) com "coisas externas" (UI, outros agentes) pode ser baseada em eventos. Por exemplo, ao concluir um job, o `jobProcessor` poderia emitir um evento `JobCompletedEvent` que outras partes do sistema poderiam ouvir. Isso pode ser implementado com um `EventEmitter` ou um sistema de mensageria mais robusto, se necessário.

Esta arquitetura de worker/fila por agente permite um alto grau de isolamento e especialização. Cada agente pode ter seu próprio ritmo de processamento, conjunto de ferramentas e lógica de interação com LLM, gerenciados por seu `Worker` e `jobProcessor` dedicados. A lógica de `src/main.ts` (original) será, em grande parte, substituída por esta nova estrutura de `Worker`s e pelos respectivos `jobProcessor`s dos agentes.

### 8.3. Gerenciamento de Workers e Filas de Agentes
A arquitetura de Worker/Fila dedicada por agente requer um sistema para gerenciar o ciclo de vida e a configuração desses componentes.

*   **Objeto `QueueClient` (Interface para o Worker):**
       Para simplificar a interação do `Worker` com sua fila dedicada e para encapsular a lógica de acesso ao `IQueueRepository` para um `queueName` específico, introduzimos o conceito de um `QueueClient`. Uma instância de `QueueClient` representa uma conexão operacional a uma única fila nomeada.

       **Localização Conceitual da Implementação:** `infrastructure/persistence/queue/queue.client.ts`
       **Interface (Exemplo):**
       ```typescript
       // domain/repositories/i-queue.client.ts (ou similar)
       import { Job } from '@/domain/entities/job.entity'; // Ajustar caminho
       import { JobData, BackoffOptions, JobStatusVO } from './i-queue.repository'; // Ajustar caminho

       export interface IQueueClient {
         readonly queueName: string;

         // Métodos para o Worker obter e finalizar jobs
         getNextJob(workerId: string): Promise<{ job: Job; lockToken: string } | null>;
         markJobActive(jobId: string, attempts: number, processedAt: Date, workerToken: string): Promise<void>;
         completeJob(jobId: string, result: any, workerToken: string): Promise<void>;
         failJob(
            jobId: string,
            error: string,
            currentAttempts: number,
            maxAttempts: number,
            backoffOptions: BackoffOptions | undefined,
            workerToken: string
         ): Promise<{ newStatus: JobStatusVO; newDelayUntil?: Date; newAttempts: number }>;

         // Métodos para o jobProcessor interagir com o job atual
         updateJobData(jobId: string, data: JobData, workerToken: string): Promise<void>;
         moveToDelayed(jobId: string, delayUntilTimestamp: number, workerToken: string): Promise<void>;
         moveToWaitingChildren(jobId: string, workerToken: string): Promise<boolean>;
       }
       ```

       **Implementação Conceitual (`QueueClient`):**
       ```typescript
       // infrastructure/persistence/queue/queue.client.ts
       // ... (importações como IQueueClient, IQueueRepository, Job, JobData, BackoffOptions, JobStatusVO) ...
       export class QueueClient implements IQueueClient {
         public readonly queueName: string;
         private queueRepository: IQueueRepository;

         constructor(
           queueName: string,
           queueRepository: IQueueRepository
         ) {
           this.queueName = queueName;
           this.queueRepository = queueRepository;
         }

         async getNextJob(workerId: string): Promise<{ job: Job; lockToken: string } | null> {
           return this.queueRepository.findNextPending(this.queueName, workerId);
         }

         async markJobActive(jobId: string, attempts: number, processedAt: Date, workerToken: string): Promise<void> {
            return this.queueRepository.markJobActive(jobId, attempts, processedAt, workerToken);
         }

         async completeJob(jobId: string, result: any, workerToken: string): Promise<void> {
           return this.queueRepository.completeJob(jobId, result, workerToken);
         }

         async failJob(
            jobId: string,
            error: string,
            currentAttempts: number,
            maxAttempts: number,
            backoffOptions: BackoffOptions | undefined,
            workerToken: string
         ): Promise<{ newStatus: JobStatusVO; newDelayUntil?: Date; newAttempts: number }> {
           return this.queueRepository.failJob(jobId, error, currentAttempts, maxAttempts, backoffOptions, workerToken);
         }

         async updateJobData(jobId: string, data: JobData, workerToken: string): Promise<void> {
           return this.queueRepository.updateJobData(jobId, data, workerToken);
         }

         async moveToDelayed(jobId: string, delayUntilTimestamp: number, workerToken: string): Promise<void> {
           return this.queueRepository.requestMoveToDelayed(jobId, workerToken, delayUntilTimestamp);
         }

         async moveToWaitingChildren(jobId: string, workerToken: string): Promise<boolean> {
           return this.queueRepository.requestMoveToWaitingChildren(jobId, workerToken);
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
            a.  Instanciar um `Worker`. Isso pode ser feito diretamente ou através de uma fábrica (`AgentWorkerFactory`) se a construção do Worker for complexa.
            b.  Instanciar um `Worker` (da classe `AgentWorker` da infraestrutura). O `AgentLifecycleService` (ou lógica de inicialização equivalente) será responsável por:
                i.  Obter a instância do `IAIAgentExecutionService` do container DI.
                ii. Para o `AIAgent` específico sendo configurado, chamar um método no `IAIAgentExecutionService` (ex: `getJobProcessorForAgent(agentIdOuConfig)`) para obter a função `jobProcessor` específica para aquele agente.
                iii. Obter outras dependências que o `Worker` possa precisar diretamente (ex: `LoggerService`) e a instância da `IQueueRepository` do container DI.
                iv. Configurar o `Worker` com:
                    *   Uma instância de `IQueueClient` (criada pelo `AgentLifecycleService`, configurada com o `queueName` do agente e a `IQueueRepository`).
                    *   A função `jobProcessor` obtida do `IAIAgentExecutionService`.
                    *   Outras dependências diretas que o `Worker` possa precisar (ex: `LoggerService`).
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

Para interações que envolvem tarefas assíncronas executadas pelos `Worker`s dos agentes (como solicitar a um agente para gerar um texto ou código), o fluxo seria:
1. A UI, através de `window.api.invoke`, chamaria um Handler IPC (ex: `ipcMain.handle('agent:enqueue-task', ...)`).
2. Este Handler IPC obteria uma instância do `EnqueueJobUseCase` (via DI).
3. O `EnqueueJobUseCase` criaria um `Job` com o payload da tarefa e o `queueName` do agente alvo, salvando-o no repositório.
4. O `Worker` dedicado àquele agente pegaria o `Job` de sua fila e executaria o `jobProcessor` correspondente.
5. Para notificar a UI sobre a conclusão do `Job` (ou atualizações de progresso), o sistema de eventos mencionado na Seção 8.2 seria utilizado. O `jobProcessor` (ou o `Worker`) emitiria eventos (ex: `job-completed:${jobId}`, `job-progress:${jobId}`). O processo principal do Electron (nos Handlers IPC ou em um serviço dedicado) ouviria esses eventos internos e poderia encaminhá-los para a UI usando `mainWindow.webContents.send(channel, data)`. A UI, por sua vez, usaria `window.api.on(channel, listener)` para receber essas atualizações.

## 10. (Opcional) Plano de Transição/Refatoração Incremental

A refatoração completa de um sistema é um esforço considerável. Embora o objetivo seja alcançar a arquitetura alvo descrita, uma abordagem incremental pode ser pragmática, dependendo dos recursos e do tempo disponíveis. Seguem algumas sugestões de como a transição poderia ser faseada:

*   **Fase 1: Fundações e DI (Concluída em Design):**
    *   Definição da arquitetura alvo (este documento).
    *   Configuração do container InversifyJS (`infrastructure/ioc`).

*   **Fase 2: Camada de Domínio e Persistência:**
    *   Implementar as entidades de domínio principais (ex: `Job`, `Project`, `AIAgent`, `User`) com Value Objects e comportamentos, seguindo Object Calisthenics.
    *   Definir as interfaces de repositório (`domain/repositories`).
    *   Implementar os repositórios concretos na camada de persistência (`infrastructure/persistence/drizzle`) e registrar no container DI.

*   **Fase 3: Casos de Uso e Lógica de Backend:**
    *   Implementar os Casos de Uso chave, injetando os repositórios.
    *   Refatorar os Handlers IPC (`infrastructure/electron/ipc-handlers`) para usar os Casos de Uso obtidos do container DI.
    *   Implementar a arquitetura de Worker/Fila por Agente, incluindo a lógica dos `jobProcessor`s e o `AgentLifecycleService`.

*   **Fase 4: Refatoração da UI (React):**
    *   Conectar a UI aos novos Handlers IPC.
    *   Refatorar componentes da UI para melhor alinhamento com os dados fornecidos pelos Casos de Uso (via DTOs, se usados).
    *   Aplicar princípios de componentização e gerenciamento de estado conforme necessário na UI.

*   **Fase 5: Iteração e Refinamento:**
    *   Revisar o sistema refatorado, identificar gargalos ou áreas para melhoria.
    *   Adicionar mais testes (se a decisão de não ter testes formais for reconsiderada).
    *   Continuar aplicando os princípios de Object Calisthenics e Clean Architecture em novos desenvolvimentos.

Esta abordagem permite entregar valor incrementalmente e gerenciar os riscos associados a uma grande refatoração. A priorização das fases pode ser ajustada conforme as necessidades do projeto.

## 11. Conclusão

Esta proposta de arquitetura alvo para o "project-wiz" visa estabelecer uma base sólida, manutenível e escalável para o futuro do sistema. Ao adotar os princípios da Clean Architecture, Object Calisthenics e Injeção de Dependência com InversifyJS, esperamos alcançar melhorias significativas na Experiência do Desenvolvedor (DX), na qualidade do código e na capacidade de evoluir o software de forma eficiente.

A estrutura em camadas, a clara separação de responsabilidades, o desacoplamento proporcionado pela DI e a ênfase em entidades de domínio ricas em comportamento permitirão que a equipe de desenvolvimento construa novas funcionalidades com maior confiança e menor atrito. A refatoração da lógica de backend existente para um sistema robusto de Worker/Fila por Agente pavimenta o caminho para um processamento assíncrono poderoso e especializado.

**Próximos Passos:**

1.  **Revisão e Aprovação:** A equipe e stakeholders devem revisar esta proposta e fornecer feedback.
2.  **Planejamento da Implementação:** Detalhar o backlog de tarefas para a refatoração, possivelmente seguindo o plano de transição incremental sugerido.
3.  **Execução da Refatoração:** Iniciar a implementação da nova arquitetura, começando pelas camadas de fundação (Domínio, Persistência, DI).
4.  **Comunicação Contínua:** Manter a comunicação aberta durante todo o processo de refatoração para alinhar expectativas e resolver desafios.

Acreditamos que o investimento nesta refatoração trará retornos significativos a longo prazo, resultando em um produto mais estável, flexível e agradável de se trabalhar.
