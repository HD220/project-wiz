# Plano de Implementação Ultra-Detalhado: Reescrita do Project Wiz (Revisão 3)

**Filosofia:** Este plano é um contrato de implementação. Cada passo deve ser seguido à risca para garantir a integridade da arquitetura e a funcionalidade do sistema. O foco é em clareza, previsibilidade e qualidade.

---

## **Fase 0: Fundação e Arquitetura Central (Esqueleto da Aplicação)**

**Objetivo:** Construir a espinha dorsal da aplicação. Ao final desta fase, teremos um aplicativo Electron que abre, com comunicação IPC funcional, logging e tratamento de erros prontos para serem usados pelos módulos de negócio.

*   [ ] **0.1. Validação do Ambiente de Build**
    *   **Complexidade:** Baixa
    *   **Dependências:** Nenhuma.
    *   **Descrição:** Confirmar que as ferramentas de build (Vite, Electron Forge) estão configuradas corretamente e contornar erros de build existentes para prosseguir.
    *   **Como Fazer:**
        1.  No arquivo `src/main/main.ts`, comente temporariamente todas as importações e chamadas de código que estão causando erros de build. O objetivo é ter um ponto de partida que compile.
        2.  Execute `npm run build`.
    *   **Verificação:** O comando é concluído sem erros, gerando a estrutura de saída na pasta `out/`.

*   [ ] **0.2. Sistema de Logging (Pino.js)**
    *   **Complexidade:** Baixa
    *   **Dependências:** Nenhuma.
    *   **Descrição:** Configurar um logger centralizado para ser injetado em toda a aplicação.
    *   **Verificação:** Em `src/main/main.ts`, importe e use `logger.info('Aplicação iniciada.')`. O log deve aparecer no console ao rodar `npm start`.

*   [ ] **0.3. Sistema de Tratamento de Erros**
    *   **Complexidade:** Baixa
    *   **Dependências:** Nenhuma.
    *   **Descrição:** Validar que as classes de erro personalizadas em `src/main/errors/` estão prontas para uso.
    *   **Verificação:** As classes `BaseError`, `DomainError`, etc., podem ser importadas sem erros.

*   [ ] **0.4. Camada de Comunicação IPC Tipada**
    *   **Complexidade:** Média
    *   **Dependências:** Nenhuma.
    *   **Descrição:** Definir os "contratos" de comunicação entre o Frontend (Renderer) e o Backend (Main).
    *   **Sub-tarefas:**
        *   [ ] **0.4.1. Definir Canais IPC:** No arquivo `src/shared/ipc-types/ipc-channels.ts`, criar um objeto `IPC_CHANNELS` com chaves para cada módulo (ex: `PROJECTS`, `AGENTS`).
        *   [ ] **0.4.2. Definir Payloads:** No arquivo `src/shared/ipc-types/ipc-payloads.ts`, criar interfaces TypeScript para os dados de requisição e resposta de cada canal (ex: `CreateProjectRequestPayload`, `ProjectResponsePayload`).
        *   [ ] **0.4.3. Definir Contratos:** No arquivo `src/shared/ipc-types/ipc-contracts.ts`, criar uma interface `IpcContract` para cada canal, unindo os tipos de Request e Response.
    *   **Verificação:** Os arquivos em `src/shared/ipc-types/` não contêm erros de compilação e os tipos podem ser importados no Main e no Renderer.

*   [ ] **0.5. Kernel da Aplicação (CQRS e Event Bus)**
    *   **Complexidade:** Média
    *   **Dependências:** 0.2, 0.3.
    *   **Descrição:** Implementar os dispatchers centrais que orquestram a lógica de negócio.
    *   **Sub-tarefas:**
        *   [ ] **0.5.1. Implementar `CqrsDispatcher`:** No arquivo `src/main/kernel/cqrs-dispatcher.ts`, criar a classe com um `Map` para `commandHandlers` e um para `queryHandlers`. Implementar os métodos `registerCommand`, `registerQuery`, `dispatchCommand`, e `dispatchQuery`.
        *   [ ] **0.5.2. Implementar `EventBus`:** No arquivo `src/main/kernel/event-bus.ts`, criar a classe com um `Map` para `listeners`. Implementar os métodos `subscribe` e `publish`.
    *   **Verificação:** As classes são implementadas e podem ser instanciadas em `src/main/bootstrap.ts` sem erros.

---

## **Fase 1: Camada de Persistência de Dados (Drizzle ORM com Schemas Modulares)**

**Objetivo:** Definir e criar o banco de dados, adotando a co-localização dos schemas dentro de seus respectivos módulos.

*   [ ] **1.1. Configurar Drizzle para Múltiplos Schemas**
    *   **Complexidade:** Baixa
    *   **Dependências:** Fase 0.
    *   **Descrição:** Ajustar a configuração do Drizzle para encontrar arquivos de schema em todo o projeto.
    *   **Verificação:** A configuração em `drizzle.config.ts` é salva sem erros.

*   [ ] **1.2. Definição de Esquemas de Tabela Modulares**
    *   **Complexidade:** Média
    *   **Dependências:** 1.1.
    *   **Descrição:** Criar um arquivo `schema.ts` dentro da pasta `persistence` de cada módulo relevante.
    *   **Sub-tarefas:**
        *   [ ] **1.2.1. Criar diretórios de persistência:** Para cada módulo em `src/main/modules/`, criar a subpasta `persistence`.
        *   [ ] **1.2.2. Definir Schema `project-management`:** No arquivo `.../project-management/persistence/schema.ts`, definir as tabelas `projects`, `channels`, `sprints`, `issues`, e `sprint_issues`.
        *   [ ] **1.2.3. Definir Schema `persona-management`:** No arquivo `.../persona-management/persistence/schema.ts`, definir a tabela `agents`.
        *   [ ] **1.2.4. Definir Schema `forum`:** No arquivo `.../forum/persistence/schema.ts`, definir a tabela `messages`.
        *   [ ] **1.2.5. Definir Schema `task-management`:** Criar um novo módulo `task-management` e em `.../task-management/persistence/schema.ts`, definir a tabela `tasks`.
    *   **Verificação:** Cada arquivo `schema.ts` é criado no local correto e não contém erros de tipo.

*   [ ] **1.3. Gerar e Aplicar Migrações**
    *   **Complexidade:** Baixa
    *   **Dependências:** 1.2.
    *   **Descrição:** Gerar uma única migração consolidada a partir de todos os schemas modulares.
    *   **Verificação:** `npm run db:studio` abre e mostra todas as tabelas de todos os módulos.

---

## **Fase 2: Módulos de Negócio e Ferramentas (Backend)**

**Objetivo:** Implementar a lógica de negócio de cada módulo, agora com seus próprios schemas e repositórios.

*   [ ] **2.1. Implementar Módulos de Ferramentas (`filesystem-tools`, `git-integration`)**
    *   **Complexidade:** Média
    *   **Dependências:** Fase 0.
    *   **Descrição:** Criar os casos de uso para interagir com o sistema de arquivos e Git.
    *   **Sub-tarefas:**
        *   [ ] **2.1.1. `filesystem-tools`:** Criar os comandos/queries para `WriteFile`, `ReadFile`, `CreateDirectory` e seus respectivos handlers na pasta `application/` do módulo.
        *   [ ] **2.1.2. `git-integration`:** Criar os comandos para `GitInit`, `GitClone`, `GitAdd`, `GitCommit` e seus handlers. Os handlers usarão `child_process` para executar os comandos do Git.
    *   **Verificação:** Os comandos e queries podem ser chamados pelo `CqrsDispatcher` e executam as operações esperadas.

*   [ ] **2.2. Implementar Módulo `project-management`**
    *   **Complexidade:** Média
    *   **Dependências:** 2.1, Fase 1.
    *   **Descrição:** Implementar o fluxo de criação e listagem de projetos.
    *   **Sub-tarefas:**
        *   [ ] **2.2.1. Criar `ProjectRepository`:** No arquivo `.../persistence/project.repository.ts`, criar a classe que estende um `BaseRepository` e importa os schemas de `./schema.ts`.
        *   [ ] **2.2.2. Implementar `CreateProject` Command:** O handler do comando orquestrará chamadas para os casos de uso de `git-integration` e `filesystem-tools`, e usará o `ProjectRepository` para salvar o resultado.
        *   [ ] **2.2.3. Implementar `ListProjects` Query:** O handler usará o `ProjectRepository` para buscar os dados do banco.
        *   [ ] **2.2.4. Criar e Registrar IPC Handlers:** No arquivo `.../infrastructure/project.ipc.ts`, criar os handlers que recebem as chamadas da UI, despacham para o `CqrsDispatcher` e retornam o resultado.
    *   **Verificação:** É possível criar e listar projetos via IPC.

*   [ ] **2.3. Implementar Módulos `persona-management` e `llm-integration`**
    *   **Complexidade:** Média
    *   **Dependências:** Fase 1.
    *   **Sub-tarefas:**
        *   [ ] **2.3.1. `persona-management`:** Criar o `AgentRepository` e o comando `CreateAgent`.
        *   [ ] **2.3.2. Lógica do Agente "Built-in":** Em `src/main/bootstrap.ts`, adicionar uma lógica que verifica e cria o agente assistente na primeira inicialização.
        *   [ ] **2.3.3. `llm-integration`:** Criar um `LlmClient` em `.../infrastructure/llm.client.ts` que usa `@ai-sdk` para se comunicar com as APIs externas, lendo as chaves do `.env`.
    *   **Verificação:** Agentes são criados no DB. O cliente LLM consegue se comunicar com a API externa.

---

## **Fase 3: Arquitetura de Execução de Agentes (Workers e Filas)**

**Objetivo:** Construir o sistema de execução de tarefas assíncrono e isolado para os agentes, conforme os requisitos.

*   [ ] **3.1. Implementar Sistema de Fila de Tarefas**
    *   **Complexidade:** Alta
    *   **Dependências:** Fase 1 (Tabela `tasks`).
    *   **Descrição:** Criar um serviço que gerencia uma fila de tarefas para cada agente, persistida no banco de dados.
    *   **Sub-tarefas:**
        *   [ ] **3.1.1. Criar Módulo `task-queue`:** Estruturar as pastas `application`, `domain`, `persistence`.
        *   [ ] **3.1.2. Criar `TaskQueueRepository`:** Implementar métodos para `enqueue` (inserir no DB), `dequeue` (buscar e remover/marcar como em progresso), e `getTasksByAgentId`.
        *   [ ] **3.1.3. Criar `TaskQueueService`:** Na camada de aplicação, criar um serviço que usa o repositório para expor a lógica de enfileiramento de forma segura.
    *   **Verificação:** O serviço consegue adicionar e recuperar tarefas do banco de dados de forma transacional e segura.

*   [ ] **3.2. Criar o Worker do Agente (`agent.worker.ts`)**
    *   **Complexidade:** Alta
    *   **Dependências:** Fase 2.
    *   **Descrição:** Criar o script que será executado em uma `worker_thread`. Este script representa um agente em execução.
    *   **Sub-tarefas:**
        *   [ ] **3.2.1. Setup do Worker:** No arquivo `src/main/kernel/agent-runtime/agent.worker.ts`, importar `workerData` e `parentPort` de `worker_threads`.
        *   [ ] **3.2.2. Injeção de Dependência no Worker:** O worker precisará de sua própria instância do `CqrsDispatcher` e outras dependências. A forma mais simples é recriá-las no escopo do worker.
        *   [ ] **3.2.3. Lógica de Processamento de Tarefa:** Implementar a função principal do worker que recebe a tarefa, usa o `LlmClient` para decompor a tarefa, usa o `CqrsDispatcher` para executar as ferramentas, e `parentPort.postMessage` para reportar o progresso/resultado.
    *   **Verificação:** O script do worker pode ser iniciado via `new Worker()` e pode comunicar-se com o processo pai através de `postMessage`.

*   [ ] **3.3. Implementar o `AgentRuntimeManager`**
    *   **Complexidade:** Alta
    *   **Dependências:** 3.1, 3.2.
    *   **Descrição:** Criar um serviço no processo principal que gerencia o ciclo de vida dos workers.
    *   **Sub-tarefas:**
        *   [ ] **3.3.1. Lógica de Polling/Monitoramento:** No arquivo `src/main/kernel/agent-runtime/agent-runtime.manager.ts`, criar um loop (`setInterval`) que periodicamente verifica as filas de tarefas usando o `TaskQueueService`.
        *   [ ] **3.3.2. Gerenciamento de Pool de Workers:** Manter um `Map` de `agentId` para `Worker` para rastrear os workers ativos.
        *   [ ] **3.3.3. Lógica de Despacho:** Quando uma nova tarefa é encontrada, o manager cria um novo `Worker`, passa os dados da tarefa via `workerData`, e adiciona o worker ao pool.
        *   [ ] **3.3.4. Gerenciamento de Ciclo de Vida:** Implementar a lógica para ouvir mensagens (`worker.on('message', ...)`), erros (`worker.on('error', ...)`), e a finalização do worker (`worker.on('exit', ...)`), removendo-o do pool quando terminar.
    *   **Verificação:** Ao adicionar uma tarefa a uma fila, um `worker_thread` é iniciado. As mensagens do worker são logadas pelo processo principal. O worker é removido do pool ao concluir.

---

## **Fase 4: Interface do Usuário (UI)**

**Objetivo:** Construir a interface em React e conectá-la ao backend.

*   [ ] **4.1. Construir Componentes de Layout Estático**
    *   **Complexidade:** Média
    *   **Sub-tarefas:**
        *   [ ] **4.1.1. Criar Componentes de Layout:** `AppLayout`, `Sidebar`, `MainContent`, `ChatPane`.
        *   [ ] **4.1.2. Estilizar com Tailwind CSS:** Aplicar classes de utilitário para replicar o visual do Discord.
        *   [ ] **4.1.3. Usar Dados Mocados:** Popular os componentes com dados falsos para validar o layout.
    *   **Verificação:** A UI é renderizada com dados mocados e é visualmente correta.

*   [ ] **4.2. Conectar a UI ao Backend**
    *   **Complexidade:** Alta
    *   **Sub-tarefas:**
        *   [ ] **4.2.1. Criar Hooks de Comunicação:** Criar `useIpcQuery` e `useIpcMutation` para encapsular a lógica de `window.electron.ipcRenderer.invoke` e o gerenciamento de estado (loading, error).
        *   [ ] **4.2.2. Implementar Fluxo de Projetos:** Usar os hooks para chamar os canais IPC de `project-management` e popular a lista de projetos.
        *   [ ] **4.2.3. Implementar Criação de Tarefas:** Criar um formulário na UI que, ao ser submetido, chama o canal IPC para enfileirar uma nova tarefa para um agente.
        *   [ ] **4.2.4. Implementar Chat em Tempo Real:** Usar `useEffect` para registrar um listener com `window.electron.ipcRenderer.on`. Quando uma mensagem de progresso do worker chegar do Main Process, atualizar o estado do chat para exibir a nova mensagem.
    *   **Verificação:** A UI reflete o estado real do backend. Criar uma tarefa na UI a envia para a fila do agente correto e o progresso é exibido no chat.

---

## **Fase 5: Testes e Garantia de Qualidade Final**

**Objetivo:** Assegurar a qualidade e a robustez do sistema completo.

*   [ ] **5.1. Escrever Testes de Integração de Ponta a Ponta**
    *   **Complexidade:** Alta
    *   **Sub-tarefas:**
        *   [ ] **5.1.1. Configurar Ambiente de Teste:** Usar Vitest com um banco de dados de teste em memória ou um arquivo de banco de dados separado que é limpo antes de cada execução.
        *   [ ] **5.1.2. Testar Fluxo de Criação:** Escrever um teste que chama o `CreateProjectCommand` e verifica se os dados corretos foram salvos no DB e os diretórios criados.
        *   [ ] **5.1.3. Testar Fluxo de Execução de Agente:** Escrever o teste mais complexo: (1) criar um projeto/agente, (2) enfileirar uma tarefa, (3) verificar se o `AgentRuntimeManager` inicia um worker, (4) espiar (`spyOn`) os comandos do `CqrsDispatcher` para garantir que o worker chamou as ferramentas corretas, (5) verificar o resultado final no sistema de arquivos.
    *   **Verificação:** `npm test` é executado com sucesso.

*   [ ] **5.2. Revisão Final de Qualidade de Código**
    *   **Complexidade:** Baixa
    *   **Como Fazer:** Execute `npm run lint -- --fix` e `npm run type-check`.
    *   **Verificação:** Nenhum erro de lint ou tipo é reportado.