# Plano de Implementação Ultra-Detalhado: Reescrita do Project Wiz (Revisão 2)

**Filosofia:** Este plano é um contrato de implementação. Cada passo deve ser seguido à risca para garantir a integridade da arquitetura e a funcionalidade do sistema. O foco é em clareza, previsibilidade e qualidade.

---

## **Fase 0: Fundação e Arquitetura Central (Esqueleto da Aplicação)**

**Objetivo:** Construir a espinha dorsal da aplicação. Ao final desta fase, teremos um aplicativo Electron que abre, com comunicação IPC funcional, logging e tratamento de erros prontos para serem usados pelos módulos de negócio.

*   [ ] **0.1. Validação do Ambiente de Build**
    *   **Dependências:** Nenhuma.
    *   **Descrição:** Confirmar que as ferramentas de build (Vite, Electron Forge) estão configuradas corretamente e contornar erros de build existentes para prosseguir.
    *   **Como Fazer:**
        1.  No arquivo `src/main/main.ts`, comente temporariamente todas as importações e chamadas de código que estão causando erros de build. O objetivo é ter um ponto de partida que compile.
        2.  Execute `npm run build`.
    *   **Verificação:** O comando é concluído sem erros, gerando a estrutura de saída na pasta `out/`.

*   [ ] **0.2. Sistema de Logging (Pino.js)**
    *   **Dependências:** Nenhuma.
    *   **Descrição:** Configurar um logger centralizado para ser injetado em toda a aplicação.
    *   **Como Fazer:**
        1.  Crie o arquivo `src/main/logger.ts`.
        2.  Adicione o seguinte código para configurar o Pino:
            ```typescript
            import pino from 'pino';
            const transport = pino.transport({
              target: 'pino-pretty',
              options: { colorize: true }
            });
            export const logger = pino(transport);
            ```
    *   **Verificação:** Em `src/main/main.ts`, importe e use `logger.info('Aplicação iniciada.')`. O log deve aparecer no console ao rodar `npm start`.

*   [ ] **0.3. Sistema de Tratamento de Erros**
    *   **Dependências:** Nenhuma.
    *   **Descrição:** Validar que as classes de erro personalizadas em `src/main/errors/` estão prontas para uso.
    *   **Verificação:** As classes `BaseError`, `DomainError`, etc., podem ser importadas sem erros.

*   [ ] **0.4. Camada de Comunicação IPC Tipada**
    *   **Dependências:** Nenhuma.
    *   **Descrição:** Definir os "contratos" de comunicação entre o Frontend (Renderer) e o Backend (Main).
    *   **Verificação:** Os arquivos em `src/shared/ipc-types/` não contêm erros de compilação.

*   [ ] **0.5. Kernel da Aplicação (CQRS e Event Bus)**
    *   **Dependências:** 0.2, 0.3.
    *   **Descrição:** Implementar os dispatchers centrais que orquestram a lógica de negócio.
    *   **Verificação:** As classes `CqrsDispatcher` e `EventBus` são implementadas e podem ser instanciadas em `src/main/bootstrap.ts` sem erros.

---

## **Fase 1: Camada de Persistência de Dados (Drizzle ORM com Schemas Modulares)**

**Objetivo:** Definir e criar o banco de dados, adotando a co-localização dos schemas dentro de seus respectivos módulos.

*   [ ] **1.1. Configurar Drizzle para Múltiplos Schemas**
    *   **Dependências:** Fase 0.
    *   **Descrição:** Ajustar a configuração do Drizzle para encontrar arquivos de schema em todo o projeto.
    *   **Arquivo:** `drizzle.config.ts`
    *   **Como Fazer:** Modifique a propriedade `schema` para usar um padrão glob.
        ```typescript
        export default {
          // ... outras configs
          schema: './src/main/modules/**/persistence/schema.ts', // Padrão para encontrar schemas
          out: './src/main/persistence/migrations',
        } satisfies Config;
        ```
    *   **Verificação:** A configuração é salva sem erros.

*   [ ] **1.2. Definição de Esquemas de Tabela Modulares**
    *   **Dependências:** 1.1.
    *   **Descrição:** Criar um arquivo `schema.ts` dentro da pasta `persistence` de cada módulo relevante.
    *   **Sub-tarefas:**
        *   [ ] **1.2.1. Schema `project-management`:**
            *   **Arquivo:** `src/main/modules/project-management/persistence/schema.ts`
            *   **Conteúdo:** Definir as tabelas `projects`, `channels`, `sprints`, `issues`, `sprint_issues`.
        *   [ ] **1.2.2. Schema `persona-management`:**
            *   **Arquivo:** `src/main/modules/persona-management/persistence/schema.ts`
            *   **Conteúdo:** Definir a tabela `agents`.
        *   [ ] **1.2.3. Schema `forum` (Exemplo para mensagens):**
            *   **Arquivo:** `src/main/modules/forum/persistence/schema.ts`
            *   **Conteúdo:** Definir a tabela `messages`.
        *   [ ] **1.2.4. Schema `tasks` (Módulo próprio ou em `project-management`):**
            *   **Arquivo:** `src/main/modules/project-management/persistence/schema.ts` (ou um novo módulo `task-management`)
            *   **Conteúdo:** Definir a tabela `tasks`.
    *   **Verificação:** Cada arquivo `schema.ts` é criado no local correto e não contém erros de tipo.

*   [ ] **1.3. Gerar e Aplicar Migrações**
    *   **Dependências:** 1.2.
    *   **Descrição:** Gerar uma única migração consolidada a partir de todos os schemas modulares.
    *   **Como Fazer:**
        1.  Execute `npm run db:generate`.
        2.  Execute `npm run db:migrate`.
    *   **Verificação:** Execute `npm run db:studio`. A interface web do Drizzle Studio deve abrir e mostrar **todas** as tabelas de todos os módulos.

---

## **Fase 2: Módulos de Negócio e Ferramentas (Backend)**

**Objetivo:** Implementar a lógica de negócio de cada módulo, agora com seus próprios schemas e repositórios.

*   [ ] **2.1. Implementar Módulos de Ferramentas (`filesystem-tools`, `git-integration`)**
    *   **Dependências:** Fase 0.
    *   **Descrição:** Criar os casos de uso para interagir com o sistema de arquivos e Git.
    *   **Verificação:** Os comandos e queries podem ser chamados pelo `CqrsDispatcher` e executam as operações esperadas.

*   [ ] **2.2. Implementar Módulo `project-management`**
    *   **Dependências:** 2.1, Fase 1.
    *   **Descrição:** Implementar o fluxo de criação e listagem de projetos.
    *   **Sub-tarefas:**
        *   [ ] **2.2.1. Criar `ProjectRepository`:**
            *   **Arquivo:** `src/main/modules/project-management/persistence/project.repository.ts`
            *   **Como Fazer:** O repositório deve importar os schemas de seu próprio diretório (`./schema.ts`).
        *   [ ] **2.2.2. Implementar `CreateProject` Command e `ListProjects` Query.**
        *   [ ] **2.2.3. Criar e Registrar IPC Handlers** em `.../infrastructure/project.ipc.ts`.
    *   **Verificação:** É possível criar e listar projetos via IPC.

*   [ ] **2.3. Implementar Módulos `persona-management` e `llm-integration`**
    *   **Dependências:** Fase 1.
    *   **Verificação:** Agentes são criados no DB. O cliente LLM consegue se comunicar com a API externa.

---

## **Fase 3: Arquitetura de Execução de Agentes (Workers e Filas)**

**Objetivo:** Construir o sistema de execução de tarefas assíncrono e isolado para os agentes, conforme os requisitos.

*   [ ] **3.1. Implementar Sistema de Fila de Tarefas**
    *   **Dependências:** Fase 1 (Tabela `tasks`).
    *   **Descrição:** Criar um serviço que gerencia uma fila de tarefas para cada agente.
    *   **Como Fazer:**
        1.  Crie um novo módulo `task-queue` em `src/main/modules/task-queue/`.
        2.  Crie um `TaskQueueService` que possa adicionar (`enqueue`), remover (`dequeue`) e consultar tarefas do banco de dados, agrupadas por `assigned_agent_id`.
    *   **Verificação:** O serviço consegue gerenciar listas de tarefas por agente.

*   [ ] **3.2. Criar o Worker do Agente (`agent.worker.ts`)**
    *   **Dependências:** Fase 2.
    *   **Descrição:** Criar o script que será executado em uma `worker_thread`. Este script representa um agente em execução.
    *   **Arquivo:** `src/main/kernel/agent-runtime/agent.worker.ts`
    *   **Como Fazer:**
        1.  O worker receberá o `agentId` e os dados da tarefa através de `workerData`.
        2.  Ele instanciará as dependências necessárias (como o `CqrsDispatcher` e o cliente LLM).
        3.  Ele conterá a lógica principal de "pensamento" do agente: decompor a tarefa, escolher ferramentas (chamar comandos/queries via dispatcher) e executar.
        4.  Ele usará `parentPort.postMessage()` para enviar atualizações de progresso, resultados ou erros de volta para o processo principal.
    *   **Verificação:** O script do worker pode ser iniciado e pode receber dados.

*   [ ] **3.3. Implementar o `AgentRuntimeManager`**
    *   **Dependências:** 3.1, 3.2.
    *   **Descrição:** Criar um serviço no processo principal que gerencia o ciclo de vida dos workers.
    *   **Arquivo:** `src/main/kernel/agent-runtime/agent-runtime.manager.ts`
    *   **Como Fazer:**
        1.  O `AgentRuntimeManager` irá monitorar as filas de tarefas (usando o `TaskQueueService`).
        2.  Quando uma nova tarefa aparecer na fila de um agente, o manager irá:
            a.  Verificar se já existe um worker para aquele agente.
            b.  Se não, criar um novo `Worker`: `new Worker('./path/to/agent.worker.js', { workerData: { agentId, task } })`.
            c.  Ouvir por mensagens do worker (`worker.on('message', ...)`).
        3.  Ele será responsável por iniciar, parar e gerenciar o pool de workers.
    *   **Verificação:** Ao adicionar uma tarefa a uma fila de um agente, um `worker_thread` é iniciado para processá-la. As mensagens do worker são recebidas pelo processo principal.

---

## **Fase 4: Interface do Usuário (UI)**

**Objetivo:** Construir a interface em React e conectá-la ao backend.

*   [ ] **4.1. Construir Componentes de Layout Estático**
    *   **Verificação:** A UI é renderizada com dados mocados.

*   [ ] **4.2. Conectar a UI ao Backend**
    *   **Sub-tarefas:**
        *   [ ] **4.2.1. Criar Hooks de Comunicação (`useIpcQuery`, `useIpcMutation`).**
        *   [ ] **4.2.2. Listar Projetos e Canais.**
        *   [ ] **4.2.3. Criar Projetos e Tarefas (enviando para as filas dos agentes).**
        *   [ ] **4.2.4. Implementar Chat em Tempo Real (recebendo atualizações dos workers via Event Bus -> IPC).**
    *   **Verificação:** A UI reflete o estado real do backend. Criar uma tarefa na UI a envia para a fila do agente correto.

---

## **Fase 5: Testes e Garantia de Qualidade Final**

**Objetivo:** Assegurar a qualidade e a robustez do sistema completo.

*   [ ] **5.1. Escrever Testes de Integração de Ponta a Ponta**
    *   **Como Fazer:** Escreva um teste que simula o fluxo completo:
        1.  Cria um projeto e um agente via `CqrsDispatcher`.
        2.  Adiciona uma tarefa à fila do agente usando o `TaskQueueService`.
        3.  Verifica se o `AgentRuntimeManager` inicia um worker.
        4.  Verifica (espiando o `CqrsDispatcher` ou o sistema de arquivos) se o worker executou a ação correta.
    *   **Verificação:** `npm test` é executado com sucesso.

*   [ ] **5.2. Revisão Final de Qualidade de Código**
    *   **Como Fazer:** Execute `npm run lint -- --fix` e `npm run type-check`.
    *   **Verificação:** Nenhum erro de lint ou tipo é reportado.