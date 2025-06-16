# Use Cases: Sistema de Agentes Autônomos e Processamento de Jobs

Este documento descreve os principais casos de uso para o sistema de agentes autônomos e processamento de jobs, detalhando as interações entre os usuários, o sistema e seus componentes internos.

## 1. Iniciar uma Nova Tarefa (Criação de Activity)

**Descrição:** Um usuário ou outro componente do sistema inicia uma nova tarefa que requer processamento assíncrono ou a atenção de um agente autônomo.

**Ator Primário:** Usuário (via interface), Outro Componente do Sistema.

**Pré-condição:** O sistema está operacional.

**Fluxo Principal:**

1.  O Ator Primário envia uma requisição para iniciar uma nova tarefa, fornecendo um payload com os dados necessários e, opcionalmente, um tipo de atividade, prioridade e dependências.
2.  O `ProcessJobService` recebe a requisição.
3.  O `ProcessJobService` valida o payload e os parâmetros fornecidos.
4.  O `ProcessJobService` cria uma nova entidade `Job` (que representa a `Activity` inicial), preenchendo seus atributos (id, type, description, payload, status='pending', etc.) e inicializando o `ActivityContext` dentro de `Job.data`.
5.  O `ProcessJobService` adiciona a nova `Job`/`Activity` à `Queue` através do `QueueService`/`JobRepository`.
6.  A `Queue` persiste a `Job`/`Activity` no banco de dados.
7.  A `Queue` notifica o `WorkerPool` sobre a nova `Job` disponível (se estiver no status `pending`).
8.  O sistema confirma ao Ator Primário que a tarefa foi iniciada (Job/Activity criada e enfileirada).

**Pós-condição:** Uma nova `Job`/`Activity` é criada no sistema, persistida no banco de dados e adicionada à `Queue` com status `pending` (ou `waiting` se tiver dependências não resolvidas).

**Fluxos Alternativos:**

- **3a. Validação Falha:** Se o payload ou os parâmetros forem inválidos, o `ProcessJobService` rejeita a requisição e retorna um erro ao Ator Primário.

## 2. Processar uma Activity (Loop do Agente)

**Descrição:** Um `Worker` obtém uma `Job`/`Activity` da `Queue` e a entrega a um `AutonomousAgent` para processamento, desencadeando o loop de raciocínio e ação do agente.

**Ator Primário:** Worker.

**Pré-condições:**

- Existem `Jobs`/`Activities` no status `pending` na `Queue`.
- Há `Workers` disponíveis no `WorkerPool`.

**Fluxo Principal:**

1.  Um `Worker` disponível no `WorkerPool` solicita uma `Job` da `Queue`.
2.  A `Queue` seleciona a `Job` de maior prioridade no status `pending` (ou que passou do `delayed` ou teve dependências resolvidas) e a entrega ao `Worker`.
3.  A `Queue` atualiza o status da `Job` para `executing`.
4.  O `Worker` invoca o método `processActivity(job: Job)` do `AutonomousAgent`, passando a `Job` completa (incluindo o `ActivityContext` em `Job.data`).
5.  Dentro do `AutonomousAgent`, o loop de raciocínio é iniciado:
    - O Agente carrega seu `AgentInternalState` e o `ActivityContext` da `Job`.
    - O Agente usa um LLM, fornecendo o `AgentInternalState` e o `ActivityContext` como contexto, para raciocinar sobre a próxima ação.
    - O LLM decide a próxima ação (ex: chamar uma Tool, enviar mensagem, atualizar plano).
    - O Agente atualiza o `ActivityContext` da `Job` (ex: adiciona notas, atualiza `plannedSteps`).
    - Se a ação decidida for executar uma `Task`/Tool, o Agente invoca o `IAgentService` com os detalhes da `Task` (nome da Tool, argumentos).
    - O `IAgentService` usa o `TaskFactory` para instanciar a `Task` apropriada.
    - A `Task` executa sua lógica, interagindo com `Tools` e/ou `LLMs` conforme necessário.
    - O resultado da `Task` é retornado ao `IAgentService`, que o retorna ao `AutonomousAgent`.
    - O Agente atualiza o `ActivityContext` da `Job` novamente com o resultado da `Task` e suas reflexões (`activityHistory`, `activityNotes`).
    - O Agente decide se a `Activity` está completa para este ciclo de processamento.
6.  O `AutonomousAgent` retorna um resultado para o `Worker`:
    - Se a `Activity` não estiver completa para este ciclo (precisa de mais passos, aguardando algo), o Agente retorna `undefined` ou `null`.
    - Se a `Activity` estiver completa, o Agente retorna o resultado final.
    - Se ocorrer um erro não tratado, o Agente lança uma exceção.
7.  O `Worker` recebe o retorno do `AutonomousAgent`:
    - Se recebeu um resultado final, o `Worker` notifica a `Queue` para marcar a `Job` como `finished` com o resultado.
    - Se recebeu `undefined`/`null`, o `Worker` notifica a `Queue` para marcar a `Job` como `delayed` (para re-agendamento).
    - Se capturou uma exceção, o `Worker` notifica a `Queue` para lidar com a falha (retentativa ou status `failed`).
8.  A `Queue` atualiza o status da `Job` conforme notificado pelo `Worker`.
9.  Se a `Job` foi marcada como `finished` ou `failed`, o ciclo de processamento para essa `Job` termina. Se foi marcada como `delayed`, ela retornará ao status `pending` após o período de atraso.

**Pós-condição:** A `Job`/`Activity` teve seu status atualizado na `Queue` com base no resultado do processamento pelo `AutonomousAgent`. O `ActivityContext` dentro de `Job.data` pode ter sido atualizado.

**Fluxos Alternativos:**

- **5a. LLM Requer Informação Adicional:** Durante o raciocínio, o LLM determina que precisa de mais informações. O Agente pode decidir criar uma nova sub-atividade do tipo `INFORMATION_GATHERING` ou enviar uma mensagem ao usuário/outro agente. O Agente retorna `undefined` ou atualiza o status para `AWAITING_EXTERNAL_INPUT` ou `AWAITING_TOOL_OUTPUT`, e o Worker notifica a Queue para marcar a Job como `delayed` ou `blocked`.
- **5b. LLM Decide Enviar Mensagem:** O LLM decide que a próxima ação é enviar uma mensagem (ao usuário ou outro agente). O Agente utiliza um `CommunicationTool` (via `IAgentService`) ou um mecanismo de comunicação direta. O resultado da operação de envio é registrado no `activityHistory`. O Agente decide se a Activity continua ou está completa para este ciclo.
- **6a. Erro Durante o Processamento do Agente/Task:** Se uma exceção for lançada dentro do `AutonomousAgent` ou de uma `Task`, o `Worker` a captura. O `Worker` notifica a `Queue` sobre a falha. A `Queue` aplica a política de retentativa (incrementa `attempts`, calcula `retry_delay`, muda status para `delayed`) ou marca a `Job` como `failed` se o máximo de tentativas for atingido.

## 3. Gerenciar Dependências de Activities

**Descrição:** A `Queue` garante que uma `Job`/`Activity` com dependências (`depends_on`) só seja processada após todas as suas dependências estarem no status `finished`.

**Ator Primário:** Queue.

**Pré-condições:**

- Uma nova `Job`/`Activity` é adicionada à `Queue` com o campo `depends_on` preenchido.
- Uma `Job`/`Activity` que é dependência de outras muda seu status para `finished`.

**Fluxo Principal:**

1.  Quando uma `Job`/`Activity` é adicionada à `Queue` com `depends_on` especificado, a `Queue` verifica o status das `Jobs`/`Activities` listadas em `depends_on`.
2.  Se alguma das dependências não estiver no status `finished`, a `Queue` define o status da nova `Job`/`Activity` como `waiting`.
3.  A `Queue` mantém um registro das `Jobs`/`Activities` que dependem de cada `Job`.
4.  Quando uma `Job`/`Activity` muda seu status para `finished`, a `Queue` identifica todas as `Jobs`/`Activities` que dependem dela.
5.  Para cada `Job`/`Activity` dependente que está no status `waiting`, a `Queue` verifica se _todas_ as suas dependências agora estão `finished`.
6.  Se todas as dependências de uma `Job`/`Activity` em `waiting` estiverem `finished`, a `Queue` atualiza o status dessa `Job`/`Activity` para `pending`.
7.  Opcionalmente, a `Queue` pode injetar os resultados (`result`) das `Jobs`/`Activities` dependentes no `payload` ou `data` da `Job`/`Activity` que estava `waiting` antes de movê-la para `pending`.

**Pós-condição:** `Jobs`/`Activities` com dependências são processadas apenas após a conclusão de suas dependências.

## 4. Lidar com Falhas e Retentativas

**Descrição:** O sistema gerencia falhas durante o processamento de uma `Job`/`Activity` aplicando uma política de retentativa antes de marcá-la como falha permanente.

**Ator Primário:** Queue (com notificação do Worker).

**Pré-condições:**

- Uma `Job`/`Activity` está no status `executing`.
- O `AutonomousAgent` ou uma `Task` lança uma exceção durante o processamento.

**Fluxo Principal:**

1.  O `Worker` captura uma exceção lançada durante a execução do `AutonomousAgent` ou de uma `Task`.
2.  O `Worker` notifica a `Queue` sobre a falha, possivelmente incluindo detalhes do erro.
3.  A `Queue` recebe a notificação de falha para a `Job`/`Activity` em `executing`.
4.  A `Queue` verifica o número atual de `attempts` e compara com `max_attempts`.
5.  Se `attempts` é menor que `max_attempts`:
    - A `Queue` incrementa `attempts`.
    - A `Queue` calcula o próximo `delay` usando a política de backoff exponencial (`((attempts+1) ** 2) * retry_delay`).
    - A `Queue` atualiza o status da `Job`/`Activity` para `delayed`, definindo o tempo de atraso calculado.
    - A `Queue` persiste as alterações.
6.  Se `attempts` é igual ou maior que `max_attempts`:
    - A `Queue` atualiza o status da `Job`/`Activity` para `failed`.
    - A `Queue` pode registrar os detalhes finais do erro no campo `data` ou `result` da `Job`.
    - A `Queue` persiste as alterações.

**Pós-condição:** Uma `Job`/`Activity` com falha é re-agendada para retentativa (status `delayed`) ou marcada como falha permanente (status `failed`).

## 5. Persistir e Carregar Estado do Agente

**Descrição:** O sistema persiste o `AgentInternalState` para que o Agente possa manter seu contexto global de negócio entre as sessões ou reinícios.

**Ator Primário:** AutonomousAgent, Repositório de Agente.

**Pré-condições:**

- O `AutonomousAgent` tem um estado interno que precisa ser salvo.
- O sistema está iniciando ou um Agente específico está sendo ativado.

**Fluxo Principal:**

1.  **Persistência:**
    - O `AutonomousAgent` decide que seu `AgentInternalState` precisa ser persistido (ex: após completar uma tarefa significativa, ou periodicamente).
    - O `AutonomousAgent` invoca o Repositório de Agente para salvar seu `AgentInternalState`.
    - O Repositório de Agente serializa o `AgentInternalState` e o armazena no banco de dados.
2.  **Carregamento:**
    - Quando um `AutonomousAgent` é instanciado ou ativado (ex: no início da aplicação, ou quando um Worker precisa processar uma Activity para um Agente específico), ele solicita seu estado ao Repositório de Agente.
    - O Repositório de Agente recupera o `AgentInternalState` persistido do banco de dados com base no ID do Agente.
    - O Repositório de Agente desserializa o estado e o retorna ao `AutonomousAgent`.
    - O `AutonomousAgent` carrega o estado recuperado em sua memória.

**Pós-condição:** O `AgentInternalState` é salvo ou carregado com sucesso, permitindo que o Agente mantenha seu contexto global.

## 6. Utilizar Tools e LLMs (dentro de uma Task)

**Descrição:** Uma `Task`, executada como parte do processamento de uma `Activity` pelo `AutonomousAgent`, interage com `Tools` externas e/ou um `LLM` para realizar uma ação específica.

**Ator Primário:** Task.

**Pré-condições:**

- Uma `Task` apropriada foi instanciada pelo `TaskFactory` com base na decisão do `AutonomousAgent`.
- A `Task` recebeu os dados necessários da `Job`/`Activity` e as `Tools` disponíveis.

**Fluxo Principal:**

1.  A `Task` inicia sua execução.
2.  A `Task` utiliza os dados de entrada (do `Job.payload` e `Job.data.context`) para determinar a ação a ser realizada.
3.  Se a `Task` precisa interagir com o mundo externo, ela invoca uma `Tool` injetada (ex: `fileSystemTool.readFile('path/to/file')`).
4.  Se a `Task` precisa de raciocínio ou geração de texto, ela interage com um `LLM` (via `ai-sdk` ou adapter LLM), fornecendo um prompt que pode incluir partes do `ActivityContext` e as definições das `Tools` disponíveis para o LLM.
5.  O `LLM` pode decidir usar uma das `Tools` fornecidas no prompt.
6.  A `Task` recebe o resultado da interação com a `Tool` ou o `LLM`.
7.  A `Task` processa o resultado e o retorna ao `IAgentService` (que o repassa ao `AutonomousAgent`).

**Pós-condição:** A `Task` executa sua lógica, possivelmente interagindo com `Tools` e `LLMs`, e retorna um resultado.

**Fluxos Alternativos:**

- **6a. Falha na Tool/LLM:** Se a interação com uma `Tool` ou `LLM` falhar (ex: erro de API, permissão negada), a `Task` deve capturar o erro e, idealmente, encapsulá-lo em um `Result.error` ou lançar uma exceção tratável pelo `Worker`.
