# 04: Execução de Tarefas por Agentes de IA

Este documento detalha como a lógica específica para a execução de tarefas por Agentes de Inteligência Artificial (IA) é arquitetada e como ela interage com o subsistema de fila de jobs genérico descrito em [`03-queue-subsystem.md`](./03-queue-subsystem.md).

## 4.1. Visão Geral

Os Agentes de IA são consumidores especializados do subsistema de filas. As tarefas destinadas a eles são enfileiradas como `Job`s genéricos. A lógica que interpreta esses jobs e executa as operações de IA reside em componentes específicos do domínio dos agentes, principalmente o `AIAgentExecutionService` e a função `jobProcessor` que ele fornece.

## 4.2. Entidade `AIAgent` (Configuração/Perfil do Agente)

A entidade `AIAgent` define o perfil, as capacidades e a configuração de um agente de IA específico. Ela não contém a lógica de execução em si, mas atua como um objeto de dados (DTO) ou configuração que é utilizado pelo `AIAgentExecutionService`.

*   **Definição Detalhada:** Veja [`02-domain-layer.md#212-entidade-aiagent-exemplo-detalhado---configuraçãodto`](./02-domain-layer.md#212-entidade-aiagent-exemplo-detalhado---configuraçãodto).
*   **Atributos Chave:** `id`, `name`, `roleDescription` (para o prompt do sistema), `modelId`, `provider`, `temperature`, `availableTools`.
*   **Persistência:** As configurações dos `AIAgent`s são persistidas através da interface `IAIAgentRepository`.

## 4.3. `AIAgentExecutionService` (Serviço de Domínio)

Este serviço é o orquestrador central para a execução de tarefas por Agentes de IA.

**Localização:** `src/domain/services/agent/ai-agent-execution.service.ts`

**Responsabilidades:**
*   Fornecer a função `jobProcessor` específica que será executada pelos `Worker`s dedicados às filas de Agentes de IA.
*   Utilizar o `payload` do `Job` (que pode conter um `agentId` ou metadados da tarefa) para carregar a configuração do `AIAgent` apropriado via `IAIAgentRepository`.
*   Orquestrar a interação com o `ILLMService` (passando o perfil do agente, histórico da conversa, ferramentas disponíveis) e o `IToolRegistry` (para executar `tool-calls` do LLM).

**Dependências (Injetadas via Construtor no `AIAgentExecutionService`):**
*   `ILLMService`: Para comunicação com os modelos de linguagem.
*   `IToolRegistry`: Para acesso e execução das ferramentas disponíveis para os agentes.
*   `IAIAgentRepository`: Para carregar os perfis/configurações dos `AIAgent`s.

**Método Principal (Exemplo Conceitual):**
O `AIAgentExecutionService` teria um método para fornecer o `jobProcessor` configurado.
```typescript
// Dentro da classe AIAgentExecutionService
// constructor(
//   @inject(TYPES.ILLMService) private llmService: ILLMService,
//   @inject(TYPES.IToolRegistry) private toolRegistry: IToolRegistry,
//   @inject(TYPES.IAIAgentRepository) private aiAgentRepository: IAIAgentRepository
// ) {}

public getJobProcessorForAgent(agentId: string): (job: Job) => Promise<any> {
  // Retorna uma função 'jobProcessor' que tem acesso ao 'this' do AIAgentExecutionService
  // e ao agentId para carregar o perfil do agente específico.
  // O jobProcessor opera apenas na entidade Job em memória.
  return async (job: Job): Promise<any> => {
    // 'this' aqui se refere à instância de AIAgentExecutionService
    const agentProfile = await this.aiAgentRepository.findById(agentId);
    if (!agentProfile) {
      throw new Error(`AIAgent profile ${agentId} not found for job ${job.id}.`);
    }

    const taskInput = job.payload.taskInput || job.payload.goal || ''; // Dados específicos da tarefa
    let conversationHistory = job.props.data?.conversationHistory || [];
    let currentStep = job.props.data?.currentStep || 'initial_processing';

    console.log(`[AIAgentExecutionService/jobProcessor] Job ${job.id}, Agent ${agentProfile.props.name}, Step ${currentStep}`);
    // Adiciona a entrada do usuário atual ao histórico da conversa, se aplicável.
    // A lógica exata de como taskInput se relaciona com conversationHistory pode variar.
    // Por exemplo, para um novo job, taskInput pode ser a primeira mensagem 'user'.
    // Para um job que continua, o taskInput pode já estar implícito no conversationHistory vindo de job.props.data.
    // Este exemplo assume que taskInput é algo a ser adicionado ou que inicia a conversa.
    if (taskInput) { // Apenas adiciona se houver um taskInput explícito para esta execução
        conversationHistory.push({ role: 'user', content: taskInput });
    }


    // --- Início da Lógica de Interação com LLM e Ferramentas ---
    // (Esta é uma simulação de um loop de pensamento/ação do agente)

    let llmResponseText = '';
    let needsToolCall = false;
    let toolCallDetails: any = null; // Estrutura de um tool_call do LLM

    // Exemplo de uma chamada inicial ao LLM ou continuação
    if (currentStep === 'initial_processing' || currentStep === 'continue_processing') {
        const llmResultStream = await this.llmService.streamText({ // Assumindo que ILLMService tem streamText
            modelId: agentProfile.props.modelId,
            systemPrompt: agentProfile.props.roleDescription,
            temperature: agentProfile.props.temperature,
            tools: this.toolRegistry.getToolDefinitions(agentProfile.props.availableTools),
            messages: conversationHistory, // Passa o histórico atual
        });

        for await (const part of llmResultStream.fullStream) { // Assumindo que fullStream é o nome correto
            if (part.type === 'text-delta') {
                llmResponseText += part.textDelta;
            } else if (part.type === 'tool-call') { // Assumindo que 'tool-call' é o tipo correto
                needsToolCall = true;
                toolCallDetails = part; // Ex: { toolName, toolCallId, args }
                break;
            }
        }

        conversationHistory.push({
            role: 'assistant',
            content: needsToolCall ? null : llmResponseText,
            toolCalls: needsToolCall ? [toolCallDetails] : undefined
        });

        currentStep = needsToolCall ? 'tool_execution_pending' : 'llm_response_complete';
        job.updateJobData({ conversationHistory, currentStep });
        // O Worker persistirá este Job atualizado (com novo histórico e step) quando o jobProcessor retornar ou lançar um erro.
        // O jobProcessor NÃO chama o QueueClient ou IQueueRepository diretamente.
    }

    // Exemplo de execução de ferramenta (se indicada pelo LLM)
    if (currentStep === 'tool_execution_pending' && needsToolCall && toolCallDetails) {
        const toolExecutionResult = await this.toolRegistry.executeTool(toolCallDetails.toolName, toolCallDetails.args);
        conversationHistory.push({
            role: 'tool',
            toolCallId: toolCallDetails.toolCallId,
            toolName: toolCallDetails.toolName,
            content: JSON.stringify(toolExecutionResult)
        });

        currentStep = 'continue_processing';
        job.updateJobData({ conversationHistory, currentStep });
        // O Worker persistirá o estado atualizado. O jobProcessor não faz chamadas de persistência.
        // Para uma conversa contínua, o LLM seria chamado novamente aqui com o novo histórico.
        // (Lógica de chamada ao LLM omitida por brevidade, mas seguiria o padrão acima).
    }

    // --- Fim da Lógica de Interação ---

    // Exemplo de como o jobProcessor sinaliza um adiamento para o Worker:
    if (job.payload.someConditionToDelay) {
      job.updateJobData({ conversationHistory, currentStep: 'about_to_delay' }); // Salva estado atual em memória
      job.prepareForDelay(new Date(Date.now() + (job.payload.delayDuration || 60000))); // Prepara o job em memória
      throw new DelayedError('Task requires a specific delay based on its logic.'); // Sinaliza ao Worker
    }

    // Exemplo de como o jobProcessor sinaliza espera por filhos:
    if (job.payload.someConditionToWaitForChildren) {
      job.updateJobData({ conversationHistory, currentStep: 'about_to_wait_children' });
      job.prepareToWaitForChildren(); // Prepara o job em memória
      // A lógica para verificar se realmente precisa esperar (ex: se há filhos)
      // estaria aqui ou na entidade Job. Se não precisar esperar, não lança o erro.
      // Ex: if (job.hasActualPendingChildren()) { throw new WaitingChildrenError('Task must wait.'); }
      throw new WaitingChildrenError('Task created sub-tasks and must wait.'); // Sinaliza ao Worker
    }

    // Se chegou ao final do processamento normal para esta execução
    if (currentStep === 'final_processing' || currentStep === 'llm_response_complete') {
        return llmResponseText || "Task completed successfully by agent."; // Resultado final
    } else if (currentStep === 'tool_execution_pending' && !needsToolCall) {
        // LLM não pediu ferramenta, mas estávamos esperando uma. Pode ser um estado final.
        return llmResponseText || "Task completed after initial LLM response (no tool call).";
    } else if (currentStep === 'continue_processing') {
        // O job foi salvo após uma execução de ferramenta e precisa ser processado novamente pelo LLM.
        // Lançar um erro específico pode instruir o Worker a re-enfileirar imediatamente.
        // Ou, se o Worker for projetado para reprocessar automaticamente jobs em certos estados,
        // apenas retornar aqui pode ser suficiente se o estado for salvo.
        // Para este exemplo, vamos assumir que o jobProcessor deve retornar um resultado ou lançar um erro de "estado final".
        // Se o objetivo é continuar, o jobProcessor deveria ter feito outra chamada LLM.
        // Se não, isso pode ser um estado inesperado ou uma lógica de fluxo incompleta no exemplo.
        return llmResponseText || "Processing continued, awaiting next LLM call or completion.";
    }


    // Se o fluxo chegar aqui, algo inesperado ocorreu, ou o job não atingiu um estado final.
    // Dependendo da lógica do agente, pode ser necessário um loop mais explícito ou
    // mais estados para gerenciar conversas multi-turn complexas.
    // Por segurança, lançar um erro se não houver um resultado claro.
    throw new Error(`Job ${job.id} ended in an unresolved state: ${currentStep}. Final LLM text: "${llmResponseText}"`);
  };
}
```

## 4.4. Refatoração da Simulação PO/CTO

A lógica da simulação de diálogo entre o Product Owner (PO) e o CTO, anteriormente em `src/infrastructure/frameworks/electron/main/agent/`, agora se encaixa neste modelo de execução de agentes:

*   **PO e CTO como Configurações de `AIAgent`:** Seriam definidos dois perfis de `AIAgent`, um para o PO e outro para o CTO, cada um com seu `roleDescription`, `modelId`, e `availableTools` apropriados.
*   **Interação via Jobs:** Uma interação entre eles seria uma sequência de `Job`s.
    1.  Um `Job` inicial (ex: com `jobName: "AIAgentTask"`, `payload: { agentId: "PO_ID", taskInput: "Mensagem inicial do CTO" }`) é enfileirado para o agente PO.
    2.  O `jobProcessor` do PO processa este job. Sua resposta (resultado do job) pode ser o texto da mensagem do PO.
    3.  Uma lógica externa (ou o próprio `jobProcessor` do PO, se projetado para isso) então cria um novo `Job` para o agente CTO, usando a resposta do PO como `taskInput` no `payload`.
    4.  Este ciclo se repetiria.
*   **Lógica de Loop:** O loop `while(true)` da simulação original não existe mais centralmente. Cada `Job` é processado individualmente pelo `Worker` e pelo `jobProcessor` do agente. A continuidade da "conversa" é gerenciada pela criação de jobs subsequentes.

Esta abordagem torna a funcionalidade de agente mais genérica, robusta e integrada com o sistema de filas, permitindo interações complexas e assíncronas entre múltiplos agentes ou entre um usuário e um agente.
```
