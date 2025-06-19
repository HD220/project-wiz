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
    conversationHistory.push({ role: 'user', content: taskInput }); // Exemplo, pode variar

    // --- Início da Lógica de Interação com LLM e Ferramentas ---
    // (Esta é uma simulação de um loop de pensamento/ação do agente)

    let llmResponseText = '';
    let needsToolCall = false;
    let toolCallDetails: any = null; // Estrutura de um tool_call do LLM

    // Exemplo de uma chamada inicial ao LLM
    if (currentStep === 'initial_processing') {
        const llmResultStream = await this.llmService.streamText({
            modelId: agentProfile.props.modelId,
            systemPrompt: agentProfile.props.roleDescription,
            temperature: agentProfile.props.temperature,
            tools: this.toolRegistry.getToolDefinitions(agentProfile.props.availableTools), // Definições para o LLM
            messages: conversationHistory,
        });

        for await (const part of llmResultStream.fullStream) {
            if (part.type === 'text-delta') {
                llmResponseText += part.textDelta;
            } else if (part.type === 'tool-call') {
                needsToolCall = true;
                toolCallDetails = part; // { toolName, toolCallId, args }
                break;
            }
        }
        conversationHistory.push({ role: 'assistant', content: needsToolCall ? null : llmResponseText, toolCalls: needsToolCall ? [toolCallDetails] : undefined });
        job.updateJobData({ conversationHistory, currentStep: needsToolCall ? 'tool_execution_pending' : 'llm_response_complete' });
        // O Worker persistirá este Job atualizado via QueueClient.saveJob()
        // Se o jobProcessor precisar persistir dados *antes* de uma operação de fila (delay/wait)
        // ou antes de uma longa chamada de ferramenta, ele NÃO o faz. Ele apenas atualiza job.data.
        // A persistência ocorre no Worker após o jobProcessor retornar/lançar erro.
    }

    // Exemplo de execução de ferramenta (se indicada pelo LLM)
    if (job.props.data?.currentStep === 'tool_execution_pending' && needsToolCall) {
        const toolExecutionResult = await this.toolRegistry.executeTool(toolCallDetails.toolName, toolCallDetails.args);
        conversationHistory.push({ role: 'tool', toolCallId: toolCallDetails.toolCallId, toolName: toolCallDetails.toolName, content: JSON.stringify(toolExecutionResult) });

        // Nova chamada ao LLM com o resultado da ferramenta
        // (Omitido por brevidade, mas seguiria um fluxo similar ao de cima)
        llmResponseText = "LLM response after tool execution."; // Simulado
        conversationHistory.push({ role: 'assistant', content: llmResponseText });
        job.updateJobData({ conversationHistory, currentStep: 'final_processing' });
    }

    // --- Fim da Lógica de Interação ---

    // Exemplo de como o jobProcessor sinaliza um adiamento para o Worker:
    if (job.payload.someConditionToDelay) {
      job.prepareForDelay(new Date(Date.now() + (job.payload.delayDuration || 60000)));
      // job.updateJobData({ ... }); // Salvar qualquer estado relevante antes de adiar
      throw new DelayedError('Task requires a specific delay based on its logic.');
    }

    // Exemplo de como o jobProcessor sinaliza espera por filhos:
    if (job.payload.someConditionToWaitForChildren) {
      job.prepareToWaitForChildren();
      // job.updateJobData({ ... });
      throw new WaitingChildrenError('Task created sub-tasks and must wait.');
    }

    // Se chegou ao final do processamento normal
    if (job.props.data?.currentStep === 'final_processing' || job.props.data?.currentStep === 'llm_response_complete') {
        return llmResponseText || "Task completed successfully by agent."; // Resultado final
    }

    // Se o fluxo chegar aqui, algo inesperado ocorreu.
    throw new Error(`Job ${job.id} reached an unknown state in agent processing.`);
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
