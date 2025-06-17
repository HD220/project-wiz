# Casos de Uso do Sistema

Este documento descreve os principais casos de uso para o sistema de agentes autônomos e processamento de jobs, detalhando as interações entre os usuários, o sistema e seus componentes internos.

## 1. Iniciar uma Nova Tarefa (Criação de Activity/Job)

**Descrição:** Um usuário ou outro componente do sistema inicia uma nova tarefa que requer processamento assíncrono ou a atenção de um agente autônomo. Esta tarefa é encapsulada como uma "Activity" (ou "Job" em termos de persistência).

**Ator Primário:** Usuário (via interface), Outro Componente do Sistema.

**Pré-condição:** O sistema está operacional.

**Fluxo Principal:**

1.  O Ator Primário envia uma requisição para iniciar a nova tarefa, fornecendo um payload com dados e, opcionalmente, tipo de atividade, prioridade e dependências.
2.  O `ProcessJobService` recebe e valida a requisição.
3.  Uma nova entidade `Job` (representando a `Activity`) é criada com atributos como ID, tipo, descrição, payload, status inicial (`pending` ou `waiting`), e o `ActivityContext` é inicializado dentro do campo `data` da Job.
4.  A `Job`/`Activity` é adicionada à `Queue` (Fila) e persistida.
5.  A `Queue` notifica o `WorkerPool` se a `Job` está pronta para execução (`pending`).
6.  O sistema confirma ao Ator Primário a criação e enfileiramento da tarefa.

**Pós-condição:** Uma nova `Job`/`Activity` está no sistema, persistida e aguardando processamento na `Queue`.

**Fluxos Alternativos:**
*   **Validação Falha:** Se a requisição for inválida, o `ProcessJobService` a rejeita e informa o Ator Primário.

## 2. Processar uma Activity/Job (Loop do Agente)

**Descrição:** Um `Worker` obtém uma `Job`/`Activity` da `Queue` e a entrega a um `AutonomousAgent` para processamento, ativando o ciclo de raciocínio e ação do agente.

**Ator Primário:** Worker.

**Pré-condições:**
*   `Jobs`/`Activities` com status `pending` existem na `Queue`.
*   `Workers` estão disponíveis no `WorkerPool`.

**Fluxo Principal:**

1.  Um `Worker` disponível pega uma `Job` da `Queue`.
2.  A `Queue` marca a `Job` como `executing`.
3.  O `Worker` invoca o `AutonomousAgent` com a `Job`.
4.  O `AutonomousAgent` inicia seu loop:
    *   Carrega seu estado global (`AgentInternalState`) e o contexto da `Job` (`ActivityContext`).
    *   Usa um LLM (com o estado global e o contexto da `Job`) para decidir a próxima ação.
    *   Atualiza o `ActivityContext` (notas, passos planejados).
    *   Se a ação envolve uma `Task` ou `Tool`, invoca o `IAgentService`.
    *   O `IAgentService` (via `TaskFactory`) instancia e executa a `Task`.
    *   A `Task` interage com `Tools` e/ou `LLMs`.
    *   O resultado da `Task` retorna ao `AutonomousAgent`.
    *   O `AutonomousAgent` atualiza novamente o `ActivityContext` com o resultado e reflexões.
    *   O Agente determina se a `Activity` está completa para este ciclo.
5.  O `AutonomousAgent` retorna um resultado ao `Worker` (resultado final, `undefined` se incompleto, ou lança exceção em caso de erro).
6.  O `Worker` notifica a `Queue` para atualizar o status da `Job` (`finished`, `delayed`, ou trata falha).
7.  A `Job` termina seu ciclo se `finished` ou `failed`, ou retorna a `pending` após um `delay`.

**Pós-condição:** O status da `Job`/`Activity` é atualizado na `Queue`. O `ActivityContext` é atualizado.

**Fluxos Alternativos:**
*   **LLM Requer Informação Adicional:** Agente cria sub-atividade de coleta de informação ou envia mensagem. Job é marcada como `delayed` ou `blocked`.
*   **Erro no Agente/Task:** Worker captura exceção e notifica a Queue. Queue aplica política de retentativa ou marca Job como `failed`.

## 3. Gerenciar Dependências de Activities/Jobs

**Descrição:** A `Queue` assegura que uma `Job`/`Activity` com dependências (`depends_on`) só seja processada após a conclusão de todas as suas dependências.

**Ator Primário:** Queue.

**Fluxo Principal:**

1.  Ao adicionar uma `Job` com dependências, a `Queue` verifica o status das dependências.
2.  Se alguma dependência não estiver `finished`, a nova `Job` fica com status `waiting`.
3.  Quando uma `Job` se torna `finished`, a `Queue` verifica as `Jobs` dependentes.
4.  Se todas as dependências de uma `Job` em `waiting` estão `finished`, seu status muda para `pending`.
5.  Opcionalmente, resultados das dependências podem ser injetados na `Job` que estava aguardando.

**Pós-condição:** `Jobs`/`Activities` são processadas respeitando suas dependências.

## 4. Lidar com Falhas e Retentativas

**Descrição:** O sistema gerencia falhas durante o processamento, aplicando uma política de retentativa.

**Ator Primário:** Queue (notificada pelo Worker).

**Fluxo Principal:**

1.  `Worker` captura exceção do `AutonomousAgent` ou `Task`.
2.  `Worker` notifica a `Queue` sobre a falha.
3.  `Queue` verifica `attempts` vs `max_attempts`.
4.  Se `attempts < max_attempts`: incrementa `attempts`, calcula `delay` (backoff exponencial), status muda para `delayed`.
5.  Se `attempts >= max_attempts`: status muda para `failed`. Detalhes do erro podem ser registrados.

**Pós-condição:** `Job`/`Activity` com falha é re-agendada (status `delayed`) ou marcada como `failed`.

## 5. Persistir e Carregar Estado do Agente (`AgentInternalState`)

**Descrição:** O `AgentInternalState` é persistido para manter o contexto global do Agente entre sessões.

**Ator Primário:** AutonomousAgent, Repositório do Agente.

**Fluxo Principal:**

1.  **Persistência:** `AutonomousAgent` decide salvar `AgentInternalState` (pós-tarefa, periodicamente) e invoca o Repositório para armazená-lo.
2.  **Carregamento:** Ao instanciar/ativar um `AutonomousAgent`, ele solicita seu `AgentInternalState` ao Repositório, que o recupera e desserializa.

**Pós-condição:** `AgentInternalState` é salvo/carregado, permitindo continuidade.

## 6. Utilizar Tools e LLMs (dentro de uma Task)

**Descrição:** Uma `Task`, parte do processamento de uma `Activity`, interage com `Tools` e/ou `LLMs`.

**Ator Primário:** Task.

**Pré-condições:** `Task` instanciada com dados da `Job`/`Activity` e `Tools`.

**Fluxo Principal:**

1.  `Task` inicia execução.
2.  Usa dados de entrada (`Job.payload`, `Job.data.context`).
3.  Interage com `Tools` externas (ex: `fileSystemTool.readFile()`).
4.  Interage com `LLM` (via `ai-sdk` ou adapter), fornecendo prompt com `ActivityContext` e definições de `Tools`.
5.  LLM pode decidir usar uma `Tool`.
6.  `Task` recebe resultado da `Tool`/`LLM`.
7.  `Task` processa e retorna resultado ao `IAgentService`.

**Pós-condição:** `Task` executa sua lógica e retorna um resultado.

**Fluxos Alternativos:**
*   **Falha na Tool/LLM:** `Task` captura o erro e o retorna ou lança exceção tratável.
