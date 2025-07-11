# Plano de Implementação Ultra-Detalhado: Reescrita do Project Wiz (Revisão 4)

**Filosofia:** Este plano é um contrato de implementação. Cada passo deve ser seguido à risca para garantir a integridade da arquitetura e a funcionalidade do sistema. O foco é em clareza, previsibilidade e qualidade, com exemplos e fluxos detalhados para eliminar ambiguidades.

---

## **Fase 0: Fundação e Arquitetura Central (Esqueleto da Aplicação)**

**Objetivo:** Construir a espinha dorsal da aplicação. Ao final desta fase, teremos um aplicativo Electron que abre, com comunicação IPC funcional, logging e tratamento de erros prontos para serem usados pelos módulos de negócio.

*   [ ] **0.1. Validação do Ambiente de Build**
    *   **Complexidade:** Baixa
    *   **Descrição:** Confirmar que as ferramentas de build (Vite, Electron Forge) estão configuradas corretamente.
    *   **Verificação:** `npm run build` é concluído sem erros.

*   [ ] **0.2. Sistema de Logging (Pino.js)**
    *   **Complexidade:** Baixa
    *   **Arquivo:** `src/main/logger.ts`
    *   **Descrição:** Configurar um logger centralizado para ser injetado em toda a aplicação.
    *   **Verificação:** `logger.info('...')` em `src/main/main.ts` aparece no console.

*   [ ] **0.3. Sistema de Tratamento de Erros**
    *   **Complexidade:** Baixa
    *   **Arquivos:** `src/main/errors/*.error.ts`
    *   **Descrição:** Validar que as classes de erro personalizadas estão prontas para uso.
    *   **Verificação:** As classes podem ser importadas sem erros.

*   [ ] **0.4. Camada de Comunicação IPC Tipada**
    *   **Complexidade:** Média
    *   **Descrição:** Definir os "contratos" de comunicação entre o Frontend (Renderer) e o Backend (Main).
    *   **Sub-tarefas:**
        *   [ ] **0.4.1. Definir Canais e Payloads**
            *   **Arquivos:** `src/shared/ipc-types/ipc-channels.ts`, `src/shared/ipc-types/ipc-payloads.ts`
            *   **Como Fazer (Exemplo):**
                ```typescript
                // ipc-channels.ts
                export const IPC_CHANNELS = { PROJECTS: { CREATE: 'projects:create' } };

                // ipc-payloads.ts
                export interface CreateProjectRequestPayload { name: string; directory: string; }
                export interface CreateProjectResponsePayload { id: string; name: string; }
                ```
        *   [ ] **0.4.2. Definir Contratos**
            *   **Arquivo:** `src/shared/ipc-types/ipc-contracts.ts`
            *   **Como Fazer (Exemplo):**
                ```typescript
                import { CreateProjectRequestPayload, CreateProjectResponsePayload } from './ipc-payloads';

                export interface IpcContract {
                  'projects:create': {
                    request: CreateProjectRequestPayload;
                    response: CreateProjectResponsePayload;
                  };
                }
                ```
    *   **Verificação:** Os tipos são exportados e não contêm erros de compilação.

*   [ ] **0.5. Kernel da Aplicação (CQRS e Event Bus)**
    *   **Complexidade:** Média
    *   **Descrição:** Implementar os dispatchers centrais que orquestram a lógica de negócio.
    *   **Sub-tarefas:**
        *   [ ] **0.5.1. Implementar `CqrsDispatcher`**
            *   **Arquivo:** `src/main/kernel/cqrs-dispatcher.ts`
            *   **Como Fazer:** Implementar a classe com métodos `registerCommand`, `registerQuery`, `dispatchCommand`, e `dispatchQuery`. Usar `Map` para armazenar os handlers.
        *   [ ] **0.5.2. Implementar `EventBus`**
            *   **Arquivo:** `src/main/kernel/event-bus.ts`
            *   **Como Fazer:** Implementar a classe com métodos `subscribe` e `publish` usando um `Map` para os listeners.
    *   **Verificação:** As classes são implementadas e podem ser instanciadas em `src/main/bootstrap.ts`.

---

## **Fase 1: Camada de Persistência de Dados (Drizzle ORM com Schemas Modulares)**

**Objetivo:** Definir e criar o banco de dados, adotando a co-localização dos schemas dentro de seus respectivos módulos.

*   [ ] **1.1. Configurar Drizzle para Múltiplos Schemas**
    *   **Complexidade:** Baixa
    *   **Arquivo:** `drizzle.config.ts`
    *   **Como Fazer:** Alterar a propriedade `schema` para `'./src/main/modules/**/persistence/schema.ts'`.
    *   **Verificação:** A configuração é salva sem erros.

*   [ ] **1.2. Definição de Esquemas de Tabela Modulares**
    *   **Complexidade:** Média
    *   **Descrição:** Criar um arquivo `schema.ts` dentro da pasta `persistence` de cada módulo relevante.
    *   **Sub-tarefas:**
        *   [ ] **1.2.1. Criar diretórios `persistence`:** Para cada módulo em `src/main/modules/`, criar a subpasta `persistence`.
        *   [ ] **1.2.2. Definir Schemas:** Criar um arquivo `schema.ts` em cada pasta `persistence` e definir as tabelas relevantes para aquele módulo.
    *   **Verificação:** Cada arquivo `schema.ts` é criado no local correto e não contém erros de tipo.

*   [ ] **1.3. Gerar e Aplicar Migrações**
    *   **Complexidade:** Baixa
    *   **Verificação:** `npm run db:studio` abre e mostra todas as tabelas de todos os módulos.

---

## **Fase 2: Módulos de Negócio e Ferramentas (Backend)**

**Objetivo:** Implementar a lógica de negócio de cada módulo, agora com seus próprios schemas e repositórios.

*   [ ] **2.1. Implementar Módulo `project-management`**
    *   **Complexidade:** Média
    *   **Descrição:** Implementar o fluxo de criação e listagem de projetos.
    *   **Sub-tarefas:**
        *   [ ] **2.1.1. Criar `CreateProject` Command e Handler**
            *   **Arquivos:**
                *   `src/main/modules/project-management/application/commands/create-project.command.ts`
                *   `src/main/modules/project-management/application/commands/create-project.handler.ts`
            *   **Como Fazer (Handler):**
                ```typescript
                // create-project.handler.ts
                export class CreateProjectHandler implements ICommandHandler<CreateProjectCommand, string> {
                  constructor(private readonly projectRepo: ProjectRepository) {}
                  async execute(command: CreateProjectCommand): Promise<string> {
                    // Lógica para criar diretório (chamar outro command)
                    // Lógica para git init (chamar outro command)
                    const project = Project.create({ name: command.name, ... });
                    await this.projectRepo.save(project);
                    return project.id;
                  }
                }
                ```
        *   [ ] **2.1.2. Criar `ProjectRepository`**
            *   **Arquivo:** `src/main/modules/project-management/persistence/project.repository.ts`
            *   **Como Fazer:** A classe deve importar o schema de `./schema.ts` e usar o Drizzle para implementar métodos como `save`, `findById`, `listAll`.
        *   [ ] **2.1.3. Criar e Registrar IPC Handler**
            *   **Arquivo:** `src/main/modules/project-management/infrastructure/project.ipc.ts`
            *   **Fluxo de Dados:** `UI -> ipcRenderer.invoke('projects:create', payload) -> [Main Process] -> project.ipc.ts -> cqrsDispatcher.dispatchCommand(new CreateProjectCommand(payload)) -> CreateProjectHandler -> ProjectRepository -> DB`.
    *   **Verificação:** É possível criar e listar projetos via IPC.

---

## **Fase 3: Arquitetura de Execução de Agentes (Workers e Filas)**

**Objetivo:** Construir o sistema de execução de tarefas assíncrono e isolado para os agentes.

*   [ ] **3.1. Implementar Sistema de Fila de Tarefas**
    *   **Complexidade:** Alta
    *   **Descrição:** Criar um serviço que gerencia uma fila de tarefas para cada agente, persistida no banco de dados.
    *   **Sub-tarefas:**
        *   [ ] **3.1.1. Criar Módulo `task-queue`:** Estruturar as pastas `application`, `domain`, `persistence`.
        *   [ ] **3.1.2. Criar `TaskQueueRepository`:** Implementar métodos para `enqueue` (inserir no DB), `dequeue` (buscar e remover/marcar como em progresso), e `getTasksByAgentId`.
        *   [ ] **3.1.3. Criar `TaskQueueService`:** Na camada de aplicação, criar um serviço que usa o repositório para expor a lógica de enfileiramento.
    *   **Verificação:** O serviço consegue adicionar e recuperar tarefas do banco de dados de forma transacional.

*   [ ] **3.2. Criar o Worker do Agente (`agent.worker.ts`)**
    *   **Complexidade:** Alta
    *   **Descrição:** Criar o script que será executado em uma `worker_thread`.
    *   **Arquivo:** `src/main/kernel/agent-runtime/agent.worker.ts`
    *   **Como Fazer:**
        ```typescript
        import { parentPort, workerData } from 'worker_threads';

        async function run() {
          const { agentId, task } = workerData;
          // Recriar dependências essenciais aqui (CQRS, etc.)
          parentPort?.postMessage({ status: 'starting', taskId: task.id });

          // Lógica de pensamento do agente...
          // Ex: const result = await cqrsDispatcher.dispatchCommand(...);

          parentPort?.postMessage({ status: 'completed', taskId: task.id, result });
        }
        run();
        ```
    *   **Verificação:** O script do worker pode ser iniciado e comunicar-se com o processo pai.

*   [ ] **3.3. Implementar o `AgentRuntimeManager`**
    *   **Complexidade:** Alta
    *   **Descrição:** Criar um serviço no processo principal que gerencia o ciclo de vida dos workers.
    *   **Arquivo:** `src/main/kernel/agent-runtime/agent-runtime.manager.ts`
    *   **Fluxo de Dados:** `Loop -> taskQueueService.checkForNewTasks() -> Se nova tarefa -> new Worker() -> worker.on('message', (msg) => eventBus.publish('agent:progress', msg))`
    *   **Verificação:** Ao adicionar uma tarefa a uma fila, um `worker_thread` é iniciado. As mensagens do worker são recebidas pelo processo principal.

---

## **Fase 4: Interface do Usuário (UI)**

**Objetivo:** Construir a interface em React e conectá-la ao backend.

*   [ ] **4.1. Construir Componentes de Layout Estático**
    *   **Complexidade:** Média
    *   **Verificação:** A UI é renderizada com dados mocados e é visualmente correta.

*   [ ] **4.2. Conectar a UI ao Backend**
    *   **Complexidade:** Alta
    *   **Sub-tarefas:**
        *   [ ] **4.2.1. Criar Hooks de Comunicação**
            *   **Arquivo:** `src/renderer/hooks/use-ipc-query.hook.ts`
            *   **Como Fazer (Exemplo):**
                ```typescript
                import { useState, useEffect } from 'react';
                export function useIpcQuery(channel, args) {
                  const [data, setData] = useState(null);
                  const [isLoading, setIsLoading] = useState(false);
                  useEffect(() => {
                    setIsLoading(true);
                    window.electron.ipcRenderer.invoke(channel, args)
                      .then(setData)
                      .finally(() => setIsLoading(false));
                  }, [channel, JSON.stringify(args)]);
                  return { data, isLoading };
                }
                ```
        *   [ ] **4.2.2. Implementar Fluxos de Dados Reais:** Substituir dados mocados por chamadas aos hooks `useIpcQuery` e `useIpcMutation`.
        *   [ ] **4.2.3. Implementar Escuta de Eventos em Tempo Real**
            *   **Fluxo de Dados:** `Worker -> parentPort.postMessage -> AgentRuntimeManager -> eventBus.publish -> [IPC Bridge] -> webContents.send('agent-progress', data) -> UI -> ipcRenderer.on('agent-progress', ...)`
    *   **Verificação:** A UI reflete o estado real do backend. O progresso do agente é exibido no chat.

---

## **Fase 5: Testes e Garantia de Qualidade Final**

**Objetivo:** Assegurar a qualidade e a robustez do sistema completo.

*   [ ] **5.1. Escrever Testes de Integração de Ponta a Ponta**
    *   **Complexidade:** Alta
    *   **Descrição:** Criar testes que simulam o fluxo completo do usuário, incluindo a execução de agentes.
    *   **Verificação:** `npm test` é executado com sucesso.

*   [ ] **5.2. Revisão Final de Qualidade de Código**
    *   **Complexidade:** Baixa
    *   **Verificação:** `npm run lint -- --fix` e `npm run type-check` são executados sem erros.
