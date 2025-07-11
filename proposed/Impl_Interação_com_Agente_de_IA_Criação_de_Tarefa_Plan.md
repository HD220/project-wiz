# Plano de Implementação Detalhado: Caso de Uso 2 - Interação com Agente de IA (Criação de Tarefa)

## 1. Visão Geral do Caso de Uso

Este documento detalha o plano de implementação para o caso de uso "Interação com Agente de IA (Criação de Tarefa)", conforme descrito em `proposed/Detailed_Use_Cases.md`. O objetivo é permitir que o usuário interaja com agentes de IA através de um canal de comunicação, e que esses agentes possam identificar a necessidade de criar novas tarefas no backlog do projeto, além de enviar confirmações e atualizações de progresso.

## 2. Análise da Base de Código Existente e Identificação de Gaps

A análise da base de código revelou que existem módulos fundamentais que servirão de base para este caso de uso, mas a orquestração e a inteligência para a criação autônoma de tarefas pelos agentes são os principais gaps.

### Componentes Existentes:

*   **Módulo `agent-runtime` (`src/main/kernel/agent-runtime`):**
    *   `agent-runtime.manager.ts`: Gerencia agentes ativos, verifica novas tarefas e executa ferramentas. É o coração da execução de agentes.
    *   `agent-tool-executor.service.ts`: Permite que agentes executem comandos como `readFile`, `writeFile`, `executeShell`, `listDirectory` dentro do contexto de um projeto. Isso é crucial para a interação do agente com o ambiente do projeto.
    *   `agent.worker.ts`: Contém a lógica para a execução do agente, inicialização de ferramentas e tratamento de resultados de chamadas de ferramentas.
*   **Módulo `task-management` (`src/main/modules/task-management`):**
    *   `task-queue.service.ts`: Gerencia o ciclo de vida das tarefas (salvar, obter próxima, atualizar status, etc.).
    *   `task.entity.ts`: Define a entidade `Task` com propriedades como `projectId`, `status`, `createdAt`, `updatedAt`.
    *   `drizzle-task.repository.ts` e `schema.ts`: Responsáveis pela persistência das tarefas no banco de dados.
*   **Módulo `communication` (`src/main/modules/communication`):**
    *   `channel.entity.ts`: Define a entidade `Channel` com `projectId`.
    *   `schema.ts`: Define a tabela `channels`.
    *   `real-time-events.service.ts`: Possui `notifyNewMessage`, indicando capacidade de comunicação em tempo real.
*   **Módulo `llm-integration` (`src/main/modules/llm-integration`):**
    *   Comandos e queries para gerenciar configurações de LLM (`save-llm-config`, `get-llm-config`, etc.). Essencial para a capacidade de raciocínio dos agentes.
*   **Módulo `persona-management` (`src/main/modules/persona-management`):**
    *   Comandos e queries para criação e recuperação de personas. Contém exemplos de agentes (`code-reviewer.agent.ts`, `user-assistant.agent.ts`).
    *   `schema.ts`: Define a tabela `personas`.
*   **Módulo `filesystem-tools` (`src/main/modules/filesystem-tools`):** Fornece comandos/queries para `readFile`, `writeFile`, `listDirectory`, `searchFileContent`, que são ferramentas que os agentes podem utilizar.
*   **Módulo `git-integration` (`src/main/modules/git-integration`):** Fornece comandos como `cloneRepository`, `initializeRepository`, `pullRepository` e `GitWorktreeService` para gerenciar worktrees Git, que podem ser usados por agentes para isolar ambientes de trabalho.
*   **Frontend (`src/renderer`):**
    *   `components/chat/message-component.tsx`: Componente de mensagem de chat.
    *   `features/direct-messages/components/chat-window.tsx`, `message-input.tsx`: Componentes para mensagens diretas, que podem ser adaptados para interação com agentes.
    *   `hooks/use-ipc-mutation.hook.ts`, `use-ipc-query.hook.ts`: Hooks genéricos para comunicação IPC, fundamentais para a interação frontend-backend.

### Gaps Identificados:

1.  **Processamento e Roteamento de Mensagens:**
    *   **Identificação de Agentes:** A lógica para detectar menções a agentes (e.g., `@DevAgent`) em mensagens de chat e rotear a mensagem para o agente correto não está implementada.
    *   **Análise de Intenção (NLU):** A capacidade de um agente de IA interpretar a mensagem do usuário para entender a intenção (e.g., "criar funcionalidade de login") e extrair informações relevantes (e.g., "login" como funcionalidade) é um gap crucial. Isso exigirá integração mais profunda com o módulo `llm-integration`.
    *   **Contexto da Conversa:** Manter o contexto da conversa para que os agentes possam responder de forma coerente e contínua.
2.  **Criação de Tarefas por Agentes:**
    *   **Decisão do Agente:** A lógica para um agente decidir *quando* e *como* criar uma nova tarefa com base na interação do usuário é um gap. Isso envolve o raciocínio do agente (possivelmente via LLM) para transformar uma solicitação em uma tarefa estruturada.
    *   **Formulação da Tarefa:** Agentes precisam ser capazes de preencher os detalhes da tarefa (título, descrição, prioridade, etc.) antes de interagir com o `task-management` module.
3.  **Fluxo de Execução do Agente:**
    *   **Orquestração de Tarefas Complexas:** Embora o `agent-runtime` forneça a base para a execução de ferramentas, a capacidade de um agente de quebrar uma tarefa complexa em sub-passos, executar esses sub-passos usando as ferramentas disponíveis e gerenciar o estado da execução é um gap significativo. Isso pode envolver a implementação de um "loop de raciocínio" para o agente.
    *   **Relato de Progresso:** A lógica para os agentes enviarem atualizações de progresso e status para o canal de comunicação do projeto conforme a tarefa avança precisa ser implementada.
4.  **Integração do Canal de Comunicação:**
    *   A integração das mensagens dos agentes (confirmações, atualizações) nos canais de comunicação específicos do projeto precisa ser desenvolvida. Isso inclui o envio de mensagens do backend para o frontend em tempo real.
5.  **Interação Frontend:**
    *   A interface de chat precisa ser aprimorada para exibir mensagens de agentes de forma diferenciada e talvez permitir interações específicas (e.g., botões de ação).
    *   Implementar a funcionalidade de menção de agentes (`@AgenteNome`).

## 3. Plano de Implementação Detalhado

### 3.1. Modificações no Backend (`src/main`)

**Objetivo:** Habilitar agentes a processar mensagens, criar tarefas e reportar progresso.

**Arquivos a Modificar/Criar:**

*   `src/main/modules/communication/application/commands/send-message-to-channel.command.ts` (Novo)
*   `src/main/modules/communication/application/commands/send-message-to-channel.handler.ts` (Novo)
*   `src/main/modules/communication/index.ts` (Registro do novo comando)
*   `src/main/modules/agent-interaction/` (Novo módulo para orquestração de interação com agentes)
    *   `application/commands/process-user-message.command.ts` (Novo)
    *   `application/commands/process-user-message.handler.ts` (Novo)
    *   `domain/agent-message-processor.service.ts` (Novo)
    *   `domain/agent-task-creator.service.ts` (Novo)
    *   `infrastructure/` (IPC handlers para o novo módulo)
*   `src/main/modules/task-management/application/commands/create-task.command.ts` (Se não existir, ou estender)
*   `src/main/modules/task-management/application/commands/create-task.handler.ts` (Se não existir, ou estender)
*   `src/main/kernel/agent-runtime/agent.worker.ts` (Modificar para incluir lógica de raciocínio e criação de tarefas)
*   `src/main/kernel/agent-runtime/agent-runtime.manager.ts` (Modificar para roteamento de mensagens)

**Passos:**

1.  **Criar Comando para Enviar Mensagens para Canal (`communication` module):**
    *   Este comando permitirá que os agentes (e outras partes do sistema) enviem mensagens para um canal específico do projeto.

    ```typescript
    // src/main/modules/communication/application/commands/send-message-to-channel.command.ts
    import { ICommand } from "@/main/kernel/cqrs-dispatcher";

    export interface ISendMessageToChannelCommandPayload {
      projectId: string;
      channelId: string;
      senderId: string; // ID do agente ou usuário
      content: string;
      isAgentMessage?: boolean; // Para diferenciar mensagens de agentes
    }

    export class SendMessageToChannelCommand implements ICommand<ISendMessageToChannelCommandPayload> {
      readonly type = "SendMessageToChannelCommand";
      constructor(public payload: ISendMessageToChannelCommandPayload) {}
    }

    // src/main/modules/communication/application/commands/send-message-to-channel.handler.ts
    import { ICommandHandler } from "@/main/kernel/cqrs-dispatcher";
    import { SendMessageToChannelCommand, ISendMessageToChannelCommandPayload } from "./send-message-to-channel.command";
    import { IMessageRepository } from "@/main/modules/communication/domain/message.repository"; // Crie este repositório se não existir
    import { Message } from "@/main/modules/communication/domain/message.entity"; // Crie esta entidade se não existir
    import { RealTimeEventsService } from "@/main/kernel/real-time-events.service";
    import { ApplicationError } from "@/main/errors/application.error";

    export class SendMessageToChannelCommandHandler implements ICommandHandler<SendMessageToChannelCommand, Message> {
      constructor(
        private readonly messageRepository: IMessageRepository,
        private readonly realTimeEventsService: RealTimeEventsService,
      ) {}

      async handle(command: SendMessageToChannelCommand): Promise<Message> {
        try {
          const { projectId, channelId, senderId, content, isAgentMessage } = command.payload;
          const message = Message.create({ projectId, channelId, senderId, content, isAgentMessage });
          await this.messageRepository.save(message);
          await this.realTimeEventsService.notifyNewMessage(channelId, message); // Notificar frontend
          return message;
        } catch (error) {
          throw new ApplicationError(`Failed to send message to channel: ${(error as Error).message}`);
        }
      }
    }
    ```
    *   Registrar este comando e handler em `src/main/modules/communication/index.ts`.

2.  **Criar Módulo `agent-interaction`:**
    *   Este módulo será responsável por receber mensagens do frontend, processá-las, identificar agentes, e orquestrar a criação de tarefas.

    ```typescript
    // src/main/modules/agent-interaction/application/commands/process-user-message.command.ts
    import { ICommand } from "@/main/kernel/cqrs-dispatcher";

    export interface IProcessUserMessageCommandPayload {
      projectId: string;
      channelId: string;
      userId: string;
      messageContent: string;
    }

    export class ProcessUserMessageCommand implements ICommand<IProcessUserMessageCommandPayload> {
      readonly type = "ProcessUserMessageCommand";
      constructor(public payload: IProcessUserMessageCommandPayload) {}
    }

    // src/main/modules/agent-interaction/application/commands/process-user-message.handler.ts
    import { ICommandHandler, CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
    import { ProcessUserMessageCommand, IProcessUserMessageCommandPayload } from "./process-user-message.command";
    import { AgentMessageProcessorService } from "@/main/modules/agent-interaction/domain/agent-message-processor.service";
    import { AgentTaskCreatorService } from "@/main/modules/agent-interaction/domain/agent-task-creator.service";
    import { SendMessageToChannelCommand } from "@/main/modules/communication/application/commands/send-message-to-channel.command";
    import { ListPersonasQuery } from "@/main/modules/persona-management/application/queries/list-personas.query";
    import { Persona } from "@/main/modules/persona-management/domain/persona.entity";
    import { ApplicationError } from "@/main/errors/application.error";

    export class ProcessUserMessageCommandHandler implements ICommandHandler<ProcessUserMessageCommand, void> {
      constructor(
        private readonly cqrsDispatcher: CqrsDispatcher,
        private readonly agentMessageProcessorService: AgentMessageProcessorService,
        private readonly agentTaskCreatorService: AgentTaskCreatorService,
      ) {}

      async handle(command: ProcessUserMessageCommand): Promise<void> {
        const { projectId, channelId, userId, messageContent } = command.payload;

        try {
          // 1. Identificar menções a agentes
          const allPersonas = await this.cqrsDispatcher.dispatchQuery<ListPersonasQuery, Persona[]>(new ListPersonasQuery());
          const mentionedAgents = this.agentMessageProcessorService.identifyAgentMentions(messageContent, allPersonas);

          if (mentionedAgents.length > 0) {
            for (const agent of mentionedAgents) {
              // 2. Processar mensagem para o agente específico (usando LLM)
              const agentResponse = await this.agentMessageProcessorService.processMessageForAgent(
                agent.id, // ID da persona
                messageContent,
                projectId,
                channelId,
              );

              // 3. Se o agente identificar uma tarefa, criar
              if (agentResponse.shouldCreateTask) {
                const task = await this.agentTaskCreatorService.createTaskFromAgentResponse(
                  projectId,
                  agentResponse.taskDetails,
                );
                await this.cqrsDispatcher.dispatchCommand(new SendMessageToChannelCommand({
                  projectId, channelId, senderId: agent.id, content: `Entendido. Criei a tarefa '${task.title}' no backlog.`,
                  isAgentMessage: true,
                }));
                // Iniciar execução da tarefa pelo agente (próximo passo do fluxo)
                // await this.cqrsDispatcher.dispatchCommand(new StartAgentTaskExecutionCommand({ taskId: task.id, agentId: agent.id }));
              } else {
                // 4. Enviar resposta do agente de volta ao canal
                await this.cqrsDispatcher.dispatchCommand(new SendMessageToChannelCommand({
                  projectId, channelId, senderId: agent.id, content: agentResponse.responseMessage,
                  isAgentMessage: true,
                }));
              }
            }
          } else {
            // Se nenhuma menção, talvez um agente padrão ou apenas registrar a mensagem
            // Ou, se a mensagem for ambígua, um agente pode pedir mais informações
            await this.cqrsDispatcher.dispatchCommand(new SendMessageToChannelCommand({
              projectId, channelId, senderId: "system", content: "Não entendi a quem você se refere. Por favor, mencione um agente (ex: @DevAgent).",
              isAgentMessage: true,
            }));
          }
        } catch (error) {
          throw new ApplicationError(`Failed to process user message: ${(error as Error).message}`);
        }
      }
    }

    // src/main/modules/agent-interaction/domain/agent-message-processor.service.ts
    import { Persona } from "@/main/modules/persona-management/domain/persona.entity";
    import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
    import { GetLlmConfigQuery } from "@/main/modules/llm-integration/application/queries/get-llm-config.query";
    import { OpenAILLMAdapter } from "@/main/modules/llm-integration/infrastructure/openai-llm.adapter"; // Exemplo
    import { LLMService } from "@/main/modules/llm-integration/application/services/llm-service";

    export class AgentMessageProcessorService {
      private llmService: LLMService; // Injetar ou instanciar

      constructor(private readonly cqrsDispatcher: CqrsDispatcher) {
        // Exemplo de inicialização, idealmente injetado
        this.llmService = new LLMService(new OpenAILLMAdapter(), this.cqrsDispatcher);
      }

      identifyAgentMentions(message: string, personas: Persona[]): Persona[] {
        const mentioned: Persona[] = [];
        for (const persona of personas) {
          if (message.includes(`@${persona.name}`)) {
            mentioned.push(persona);
          }
        }
        return mentioned;
      }

      async processMessageForAgent(
        agentId: string,
        messageContent: string,
        projectId: string,
        channelId: string,
      ): Promise<{ shouldCreateTask: boolean; taskDetails?: any; responseMessage: string }> {
        // Lógica para usar LLM para analisar a mensagem e decidir se uma tarefa deve ser criada
        // Exemplo simplificado: chamar LLM com o prompt e a mensagem
        const llmConfig = await this.cqrsDispatcher.dispatchQuery(new GetLlmConfigQuery({ provider: "openai", model: "gpt-4" }));
        if (!llmConfig) {
          return { shouldCreateTask: false, responseMessage: "Erro: Configuração LLM não encontrada." };
        }

        const prompt = `O usuário disse: "${messageContent}". Com base nisso, você, como ${agentId}, deve decidir se uma nova tarefa de desenvolvimento precisa ser criada. Se sim, forneça o título e uma descrição detalhada da tarefa em formato JSON: { "shouldCreateTask": true, "taskDetails": { "title": "", "description": "", "priority": "medium" } }. Caso contrário, forneça uma resposta amigável em texto: { "shouldCreateTask": false, "responseMessage": "" }.`;

        const llmResponse = await this.llmService.generateText(llmConfig, prompt);

        try {
          const parsedResponse = JSON.parse(llmResponse);
          return parsedResponse;
        } catch (e) {
          return { shouldCreateTask: false, responseMessage: "Desculpe, tive um problema ao processar sua solicitação." };
        }
      }
    }

    // src/main/modules/agent-interaction/domain/agent-task-creator.service.ts
    import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
    import { CreateTaskCommand } from "@/main/modules/task-management/application/commands/create-task.command";
    import { Task } from "@/main/modules/task-management/domain/entities/task.entity";

    export class AgentTaskCreatorService {
      constructor(private readonly cqrsDispatcher: CqrsDispatcher) {}

      async createTaskFromAgentResponse(projectId: string, taskDetails: any): Promise<Task> {
        const command = new CreateTaskCommand({
          projectId,
          title: taskDetails.title,
          description: taskDetails.description,
          priority: taskDetails.priority || "medium",
          status: "pending", // Status inicial
        });
        const task = await this.cqrsDispatcher.dispatchCommand<CreateTaskCommand, Task>(command);
        return task;
      }
    }
    ```
    *   Registrar comandos e handlers do módulo `agent-interaction` em `src/main/index.ts` ou em um novo `src/main/modules/agent-interaction/index.ts`.
    *   Criar IPC handlers para `ProcessUserMessageCommand` para que o frontend possa enviar mensagens de usuário para o backend.

3.  **Estender/Criar Comando de Criação de Tarefa (`task-management` module):**
    *   Verificar se `src/main/modules/task-management/application/commands/create-task.command.ts` e seu handler existem. Se não, criá-los. Se sim, garantir que aceitem `projectId`, `title`, `description`, `priority`, `status`.

    ```typescript
    // src/main/modules/task-management/application/commands/create-task.command.ts
    import { ICommand } from "@/main/kernel/cqrs-dispatcher";

    export interface ICreateTaskCommandPayload {
      projectId: string;
      title: string;
      description?: string;
      priority?: 'low' | 'medium' | 'high';
      status?: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
      assignedToAgentId?: string;
      dueDate?: Date;
    }

    export class CreateTaskCommand implements ICommand<ICreateTaskCommandPayload> {
      readonly type = "CreateTaskCommand";
      constructor(public payload: ICreateTaskCommandPayload) {}
    }

    // src/main/modules/task-management/application/commands/create-task.handler.ts
    import { ICommandHandler } from "@/main/kernel/cqrs-dispatcher";
    import { CreateTaskCommand, ICreateTaskCommandPayload } from "./create-task.command";
    import { ITaskRepository } from "@/main/modules/task-management/domain/task.repository";
    import { Task } from "@/main/modules/task-management/domain/entities/task.entity";
    import { ApplicationError } from "@/main/errors/application.error";

    export class CreateTaskCommandHandler implements ICommandHandler<CreateTaskCommand, Task> {
      constructor(private readonly taskRepository: ITaskRepository) {}

      async handle(command: CreateTaskCommand): Promise<Task> {
        try {
          const task = Task.create({
            projectId: command.payload.projectId,
            title: command.payload.title,
            description: command.payload.description,
            priority: command.payload.priority || "medium",
            status: command.payload.status || "pending",
            assignedToAgentId: command.payload.assignedToAgentId,
            dueDate: command.payload.dueDate,
          });
          await this.taskRepository.save(task);
          return task;
        } catch (error) {
          throw new ApplicationError(`Failed to create task: ${(error as Error).message}`);
        }
      }
    }
    ```

4.  **Modificar `agent.worker.ts` para Raciocínio e Execução de Tarefas:**
    *   O `agent.worker.ts` é onde a lógica de raciocínio do agente será implementada. Ele precisará:
        *   Receber a tarefa atribuída.
        *   Usar o LLM para planejar a execução da tarefa (quebrar em sub-passos, identificar ferramentas necessárias).
        *   Executar as ferramentas através do `AgentToolExecutorService`.
        *   Reportar o progresso e o status da tarefa de volta ao `task-management` e `communication` modules.

    ```typescript
    // src/main/kernel/agent-runtime/agent.worker.ts
    // ... imports existentes ...
    import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
    import { UpdateTaskStatusCommand } from "@/main/modules/task-management/application/commands/update-task-status.command"; // Criar se não existir
    import { SendMessageToChannelCommand } from "@/main/modules/communication/application/commands/send-message-to-channel.command";
    import { GetLlmConfigQuery } from "@/main/modules/llm-integration/application/queries/get-llm-config.query";
    import { LLMService } from "@/main/modules/llm-integration/application/services/llm-service";
    import { OpenAILLMAdapter } from "@/main/modules/llm-integration/infrastructure/openai-llm.adapter";

    interface WorkerData {
      taskId: string;
      projectId: string;
      agentId: string;
      projectPath: string;
      // ... outras propriedades ...
    }

    export class AgentWorker {
      private cqrsDispatcher: CqrsDispatcher; // Injetar ou instanciar
      private llmService: LLMService; // Injetar ou instanciar
      // ... outras propriedades ...

      constructor(private workerData: WorkerData) {
        this.cqrsDispatcher = new CqrsDispatcher(); // Exemplo, idealmente injetado
        this.llmService = new LLMService(new OpenAILLMAdapter(), this.cqrsDispatcher); // Exemplo
        // ... inicialização de outras propriedades ...
      }

      async startTaskExecution(): Promise<void> {
        const { taskId, projectId, agentId, projectPath } = this.workerData;

        try {
          // 1. Atualizar status da tarefa para 'in_progress'
          await this.cqrsDispatcher.dispatchCommand(new UpdateTaskStatusCommand({ taskId, status: "in_progress" }));
          await this.cqrsDispatcher.dispatchCommand(new SendMessageToChannelCommand({
            projectId, channelId: "general", senderId: agentId, content: `Iniciando a tarefa ${taskId}...`,
            isAgentMessage: true,
          }));

          // 2. Loop de raciocínio do agente (exemplo simplificado)
          let taskCompleted = false;
          while (!taskCompleted) {
            // Obter LLM config
            const llmConfig = await this.cqrsDispatcher.dispatchQuery(new GetLlmConfigQuery({ provider: "openai", model: "gpt-4" }));
            if (!llmConfig) {
              throw new Error("LLM config not found for agent reasoning.");
            }

            // Prompt para o LLM decidir a próxima ação
            const prompt = `Você é o agente ${agentId} trabalhando no projeto ${projectId}. A tarefa atual é ${taskId}. O que você deve fazer a seguir? Pense passo a passo. Se precisar de uma ferramenta, use o formato JSON: { "action": "tool_call", "toolName": "", "args": {} }. Se a tarefa estiver concluída, use: { "action": "task_complete", "message": "" }. Se precisar de mais informações do usuário, use: { "action": "request_info", "message": "" }.`;

            const llmResponse = await this.llmService.generateText(llmConfig, prompt);
            const agentDecision = JSON.parse(llmResponse); // Parsear a decisão do LLM

            if (agentDecision.action === "tool_call") {
              // Executar ferramenta
              const toolResult = await this.tools.executeTool(
                agentDecision.toolName,
                agentDecision.args,
                projectPath,
              );
              // Reportar resultado da ferramenta
              await this.cqrsDispatcher.dispatchCommand(new SendMessageToChannelCommand({
                projectId, channelId: "general", senderId: agentId, content: `Ferramenta ${agentDecision.toolName} executada. Resultado: ${JSON.stringify(toolResult)}`,
                isAgentMessage: true,
              }));
            } else if (agentDecision.action === "task_complete") {
              // Marcar tarefa como concluída
              await this.cqrsDispatcher.dispatchCommand(new UpdateTaskStatusCommand({ taskId, status: "completed" }));
              await this.cqrsDispatcher.dispatchCommand(new SendMessageToChannelCommand({
                projectId, channelId: "general", senderId: agentId, content: `Tarefa ${taskId} concluída: ${agentDecision.message}`,
                isAgentMessage: true,
              }));
              taskCompleted = true;
            } else if (agentDecision.action === "request_info") {
              // Solicitar mais informações ao usuário
              await this.cqrsDispatcher.dispatchCommand(new SendMessageToChannelCommand({
                projectId, channelId: "general", senderId: agentId, content: `Preciso de mais informações: ${agentDecision.message}`,
                isAgentMessage: true,
              }));
              // Pausar ou aguardar resposta do usuário
              taskCompleted = true; // Por enquanto, para sair do loop
            } else {
              throw new Error(`Ação desconhecida do agente: ${agentDecision.action}`);
            }
          }
        } catch (error) {
          // Reportar erro e marcar tarefa como falha
          await this.cqrsDispatcher.dispatchCommand(new UpdateTaskStatusCommand({ taskId, status: "failed" }));
          await this.cqrsDispatcher.dispatchCommand(new SendMessageToChannelCommand({
            projectId, channelId: "general", senderId: agentId, content: `Erro na tarefa ${taskId}: ${(error as Error).message}`,
            isAgentMessage: true,
          }));
          console.error(`Agent ${agentId} failed to execute task ${taskId}:`, error);
        }
      }
    }
    ```

5.  **Modificar `agent-runtime.manager.ts` para Roteamento de Mensagens:**
    *   O `agent-runtime.manager.ts` precisará ser capaz de receber mensagens do frontend (via IPC) e despachar o `ProcessUserMessageCommand` para o novo módulo `agent-interaction`.

    ```typescript
    // src/main/kernel/agent-runtime/agent-runtime.manager.ts
    // ... imports existentes ...
    import { ProcessUserMessageCommand } from "@/main/modules/agent-interaction/application/commands/process-user-message.command";

    export class AgentRuntimeManager {
      // ... construtor e outras propriedades ...

      // Método para ser chamado via IPC do frontend
      async handleUserMessage(projectId: string, channelId: string, userId: string, messageContent: string): Promise<void> {
        await this.cqrsDispatcher.dispatchCommand(new ProcessUserMessageCommand({
          projectId, channelId, userId, messageContent,
        }));
      }

      // ... outros métodos ...
    }
    ```

### 3.2. Modificações no Frontend (`src/renderer`)

**Objetivo:** Permitir que o usuário interaja com agentes através da interface de chat e visualize as respostas dos agentes.

**Arquivos a Modificar:**

*   `src/renderer/features/direct-messages/components/chat-window.tsx`
*   `src/renderer/features/direct-messages/components/message-input.tsx`
*   `src/shared/ipc-types/ipc-channels.ts` (Adicionar novo canal IPC)
*   `src/shared/ipc-types/ipc-payloads.ts` (Adicionar novo payload IPC)
*   `src/renderer/hooks/use-ipc-mutation.hook.ts` (Para enviar mensagens de usuário)
*   `src/renderer/hooks/use-ipc-query.hook.ts` (Para receber mensagens de canal)

**Passos:**

1.  **Atualizar Tipos IPC:**
    *   Adicionar um novo canal IPC para mensagens de usuário para agentes.

    ```typescript
    // src/shared/ipc-types/ipc-channels.ts
    export enum IpcChannel {
      // ... canais existentes ...
      AGENT_INTERACTION_PROCESS_MESSAGE = "agent-interaction:process-message",
      COMMUNICATION_NEW_MESSAGE = "communication:new-message", // Para mensagens em tempo real do backend
    }

    // src/shared/ipc-types/ipc-payloads.ts
    export interface IpcAgentInteractionProcessMessagePayload {
      projectId: string;
      channelId: string;
      userId: string;
      messageContent: string;
    }

    export interface IpcCommunicationNewMessagePayload {
      projectId: string;
      channelId: string;
      message: any; // Entidade Message completa
    }
    ```

2.  **Modificar `chat-window.tsx` e `message-input.tsx`:**
    *   No `message-input.tsx`, ao enviar uma mensagem, verificar se há menções a agentes. Se houver, enviar a mensagem para o novo canal `AGENT_INTERACTION_PROCESS_MESSAGE`.
    *   No `chat-window.tsx`, usar `useIpcQuery` para escutar o canal `COMMUNICATION_NEW_MESSAGE` e exibir as mensagens recebidas (incluindo as dos agentes).
    *   Aprimorar a exibição de mensagens para diferenciar mensagens de usuários e agentes (e.g., avatares, cores diferentes).

    ```typescript
    // src/renderer/features/direct-messages/components/message-input.tsx
    // ... imports ...
    import { useIpcMutation } from "@/renderer/hooks/use-ipc-mutation.hook";
    import { IpcChannel } from "@/shared/ipc-types/ipc-channels";
    import { IpcAgentInteractionProcessMessagePayload } from "@/shared/ipc-types/ipc-payloads";

    interface MessageInputProps {
      // ... props existentes ...
      projectId: string; // Novo: ID do projeto atual
      channelId: string; // Novo: ID do canal atual
      userId: string; // Novo: ID do usuário logado
    }

    const MessageInput: React.FC<MessageInputProps> = ({
      // ... props existentes ...
      projectId, channelId, userId
    }) => {
      const [newMessage, setNewMessage] = useState("");

      const { mutate: processAgentMessage } = useIpcMutation<void, Error, IpcAgentInteractionProcessMessagePayload>({
        channel: IpcChannel.AGENT_INTERACTION_PROCESS_MESSAGE,
        onSuccess: () => setNewMessage(""),
        onError: (err) => console.error("Failed to send message to agent:", err),
      });

      const handleSendMessage = () => {
        if (!newMessage.trim()) return;

        // Lógica para detectar menções a agentes (simplificado)
        const agentMentionRegex = /@(\w+)/g;
        const mentions = newMessage.match(agentMentionRegex);

        if (mentions && mentions.length > 0) {
          // Se houver menções, enviar para o processador de mensagens do agente
          processAgentMessage({
            projectId, channelId, userId, messageContent: newMessage,
          });
        } else {
          // Caso contrário, enviar como mensagem normal (se houver um handler para isso)
          // Exemplo: sendMessage({ senderId: userId, receiverId: channelId, content: newMessage });
          console.warn("Mensagem sem menção de agente. Implementar envio de mensagem normal.");
        }
        setNewMessage("");
      };

      return (
        // ... JSX do input de mensagem ...
      );
    };
    ```

    ```typescript
    // src/renderer/features/direct-messages/components/chat-window.tsx
    // ... imports ...
    import { useIpcQuery } from "@/renderer/hooks/use-ipc-query.hook";
    import { IpcChannel } from "@/shared/ipc-types/ipc-channels";
    import { IpcCommunicationNewMessagePayload } from "@/shared/ipc-types/ipc-payloads";
    import { IMessage } from "@/shared/ipc-types/domain-types"; // Definir IMessage

    interface ChatWindowProps {
      // ... props existentes ...
      projectId: string; // Novo: ID do projeto atual
      channelId: string; // Novo: ID do canal atual
      currentUserId: string; // Novo: ID do usuário logado
    }

    const ChatWindow: React.FC<ChatWindowProps> = ({
      // ... props existentes ...
      projectId, channelId, currentUserId
    }) => {
      const [messages, setMessages] = useState<IMessage[]>([]); // Estado para armazenar mensagens

      // Escutar por novas mensagens em tempo real
      useIpcQuery<IMessage[]>({ // Pode ser um hook customizado para real-time events
        channel: IpcChannel.COMMUNICATION_NEW_MESSAGE,
        onSuccess: (newMessage: IMessage) => {
          if (newMessage.channelId === channelId) {
            setMessages((prev) => [...prev, newMessage]);
          }
        },
        // Não há payload para queries de real-time events, o evento é disparado pelo backend
      });

      // ... useEffect para carregar mensagens históricas (se necessário) ...

      return (
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-2 ${message.senderId === currentUserId ? "text-right" : "text-left"}`}
              >
                <span
                  className={`inline-block p-2 rounded-lg ${message.isAgentMessage ? "bg-blue-200 text-blue-800" : "bg-gray-200 text-gray-800"}`}
                >
                  {message.content}
                </span>
              </div>
            ))}
          </div>
          <MessageInput projectId={projectId} channelId={channelId} userId={currentUserId} />
        </div>
      );
    };
    ```

### 3.3. Testes e Verificação

**Objetivo:** Garantir que a interação com agentes e a criação de tarefas funcionem corretamente.

**Passos:**

1.  **Testes Unitários:**
    *   Testar `SendMessageToChannelCommand` e seu handler.
    *   Testar `ProcessUserMessageCommand` e seu handler, mockando as dependências (LLMService, PersonaRepository, TaskRepository).
    *   Testar `AgentMessageProcessorService` (identificação de menções, processamento de mensagens com LLM mockado).
    *   Testar `AgentTaskCreatorService`.
    *   Testar a lógica de raciocínio do agente em `agent.worker.ts` (mockando LLM e ferramentas).

2.  **Testes de Integração (Manual/E2E):**
    *   Iniciar a aplicação.
    *   Criar um novo projeto.
    *   No canal de comunicação do projeto, digitar uma mensagem mencionando um agente (e.g., `@DevAgent, precisamos de uma funcionalidade de login`).
    *   Verificar se o agente responde no canal.
    *   Verificar se uma nova tarefa é criada no backlog do projeto (se a intenção for reconhecida).
    *   Testar diferentes tipos de solicitações para o agente (criação de tarefa, perguntas gerais).
    *   Simular erros na execução do agente (e.g., ferramenta falha) e verificar se o agente reporta o erro e o status da tarefa é atualizado.

## 4. Considerações Adicionais

*   **LLM Prompt Engineering:** A qualidade da interação do agente dependerá fortemente dos prompts enviados ao LLM. Será necessário um trabalho contínuo de engenharia de prompt para refinar o comportamento do agente.
*   **Gerenciamento de Contexto:** Para conversas mais complexas, o agente precisará de um mecanismo mais sofisticado para gerenciar o histórico da conversa e o contexto do projeto.
*   **Ferramentas do Agente:** A lista de ferramentas disponíveis para os agentes (`agent-tool-executor.service.ts`) pode ser expandida conforme a necessidade, permitindo que os agentes interajam com mais partes do sistema (e.g., sistema de issues, base de código, documentação).
*   **Segurança:** Garantir que as ações dos agentes sejam restritas ao escopo do projeto e que não possam executar comandos arbitrários que comprometam o sistema.
*   **Feedback Visual:** Melhorar o feedback visual na UI para indicar quando um agente está "pensando" ou executando uma tarefa.
*   **Persistência de Mensagens:** As mensagens do canal devem ser persistidas no banco de dados para que o histórico da conversa seja mantido.

Este plano detalha as modificações necessárias para implementar o caso de uso "Interação com Agente de IA (Criação de Tarefa)", cobrindo tanto o frontend quanto o backend, e incluindo considerações sobre testes e boas práticas.
