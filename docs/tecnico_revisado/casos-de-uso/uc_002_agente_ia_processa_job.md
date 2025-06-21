# UC-002: Agente IA Processa um Job

**ID:** UC-002
**Nome do Caso de Uso:** Agente IA Processa um Job
**Ator Principal:** Agente IA (Worker/Job Processor)
**Nível:** Sistema (System Task)
**Prioridade:** Crítica

## Descrição Breve:
Este caso de uso descreve o processo pelo qual um Agente IA (atuando como um Worker para sua fila) pega um Job elegível de sua fila e o executa. Isso envolve interação com o LLM, uso de Ferramentas (`Tools`), gerenciamento de contexto (`ActivityContext` e `AgentInternalState`), e atualização do status do Job.

## Pré-condições:
1.  Existe um Job no estado `pending` (ou `delayed` cujo `delayedUntil` passou, ou `waiting` cujas dependências foram satisfeitas) na fila nomeada (`queueName`) do Agente IA.
2.  O Agente IA (Worker) está ativo e monitorando sua fila.
3.  A integração com o LLM está configurada e operacional para a Persona do Agente.
4.  O `ToolRegistry` está populado com as `Tools` habilitadas para a Persona.
5.  O `AgentInternalState` da Persona está acessível.

## Fluxo Principal (Caminho Feliz):
1.  **Agente IA Obtém Job da Fila:**
    *   O Agente IA (Worker) consulta o `QueueService` para obter o próximo Job elegível de sua `queueName`.
    *   O `QueueService` marca o Job como `active` e o entrega ao Agente.
2.  **Agente IA Prepara Contexto de Execução:**
    *   O Agente IA carrega (ou inicializa, se for a primeira vez) o `ActivityContext` associado ao Job.
    *   O Agente IA carrega seu `AgentInternalState` para fornecer contexto de longo prazo.
3.  **Agente IA Determina Próxima Ação (Ciclo de Raciocínio e Ação):**
    *   O Agente IA (sua `PersonaCoreLogic`) formula um prompt para o LLM. O prompt inclui:
        *   O objetivo do Job/Sub-Job (do `payload` do Job).
        *   O `ActivityContext` atual (histórico de interações, notas, resultados parciais).
        *   Informações relevantes do `AgentInternalState`.
        *   Descrições das `Tools` habilitadas.
    *   O Agente IA envia o prompt ao `ILLMService`.
4.  **LLM Processa e Retorna Decisão/Resultado:**
    *   O LLM processa o prompt e retorna uma resposta. A resposta pode ser:
        *   Conteúdo gerado (ex: código, texto).
        *   Um plano de passos intermediários.
        *   Uma solicitação para executar uma `Tool` específica com determinados argumentos.
        *   Uma indicação de que o Job/Sub-Job está concluído.
5.  **Agente IA Executa Ação com Base na Resposta do LLM:**
    *   **Se LLM solicitou uma `Tool`:**
        1.  O Agente IA invoca a `Tool` solicitada através do `IToolRegistry`, passando os argumentos fornecidos pelo LLM.
        2.  A `Tool` é executada (ex: lê um arquivo, executa um comando no terminal, salva uma anotação).
        3.  O resultado da `Tool` (sucesso, dados ou erro) é retornado ao Agente IA.
        4.  O Agente IA atualiza o `ActivityContext` com a chamada da `Tool` e seu resultado.
        5.  O Agente IA retorna ao Passo 3 (Ciclo de Raciocínio) com o novo contexto.
    *   **Se LLM gerou conteúdo:**
        1.  O Agente IA armazena o conteúdo gerado no `ActivityContext` (ex: em `activityNotes` ou como um resultado parcial).
        2.  O Agente IA retorna ao Passo 3 (Ciclo de Raciocínio) para determinar a próxima ação (ex: salvar o conteúdo em um arquivo usando uma `Tool`, validar o conteúdo, etc.).
    *   **Se LLM indicou conclusão ou um passo significativo do plano:**
        1.  O Agente IA atualiza o `ActivityContext` com o progresso.
        2.  O Agente IA pode prosseguir para o Passo 6 (Auto-Validação).
6.  **Agente IA Realiza Auto-Validação (Se Aplicável):**
    *   Se o Job/Sub-Job atingiu um ponto de conclusão ou se `validationCriteria` foram definidos:
        1.  O Agente IA compara o estado atual do trabalho ou os resultados obtidos com os `validationCriteria` (pode usar o LLM para esta avaliação).
        2.  O resultado da validação é armazenado no `ActivityContext` (`validationResult`).
        3.  Se a validação falhar, o Agente IA pode retornar ao Passo 3 para tentar corrigir, ou mover para tratamento de erro (Fluxo Alternativo FA-001).
7.  **Agente IA Conclui o Job:**
    *   Se o Job/Sub-Job foi executado com sucesso e passou na auto-validação (se houver):
        1.  O Agente IA atualiza o `AgentInternalState` com quaisquer aprendizados relevantes do `ActivityContext`.
        2.  O Agente IA notifica o `QueueService` que o Job foi `completed`, fornecendo o resultado final.
8.  **Sistema Atualiza Status do Job:**
    *   O `QueueService` atualiza o status do Job para `completed` e armazena seu resultado.
    *   Se este Job era uma dependência para outros Jobs, o `QueueService` verifica se esses Jobs dependentes podem agora se tornar `pending`.
    *   Se este Job era um Sub-Job, o `QueueService` verifica se o Job pai (`parentJobId`) pode sair do estado `waiting_children`.
    *   O sistema pode notificar o Usuário (via UI) sobre a conclusão do Job.

## Fluxos Alternativos:

*   **FA-001: Erro na Execução da Tool ou Resposta do LLM:**
    1.  Se a execução de uma `Tool` falha, ou o LLM retorna um erro ou resposta inutilizável:
    2.  O Agente IA registra o erro no `ActivityContext`.
    3.  O Agente IA pode tentar uma estratégia de recuperação (ex: re-tentar a `Tool`, re-formular o prompt para o LLM, usar uma `Tool` alternativa).
    4.  Se a recuperação falhar após algumas tentativas internas, o Agente IA notifica o `QueueService` que o Job `failed`. O sistema de retentativas da Fila (conforme RF-JOB-009) pode então ser acionado. Se todas as retentativas da Fila falharem, o Job é marcado como falha permanente.
    5.  O Agente pode notificar o Usuário sobre a falha.

*   **FA-002: Job Requer Atraso (Delay):**
    1.  Durante o processamento (Passo 5), o Agente IA (ou o LLM) pode determinar que o Job precisa ser pausado e retomado mais tarde (ex: aguardar um recurso externo).
    2.  O Agente IA invoca `job.moveToDelayed(delayUntilTimestamp)` em seu `ActivityContext`.
    3.  O Agente IA notifica o `QueueService`, que atualiza o status do Job para `delayed` e define o `delayedUntil`.
    4.  O processamento do Job é interrompido. O Agente IA fica livre para processar outros Jobs.

*   **FA-003: Job Precisa Aguardar Sub-Jobs (Filhos):**
    1.  Se o Agente IA (durante o processamento de um Job principal) criou Sub-Jobs (conforme UC-001) e precisa aguardar sua conclusão:
    2.  O Agente IA invoca `job.moveToWaitingChildren()` em seu `ActivityContext`.
    3.  O Agente IA notifica o `QueueService`, que atualiza o status do Job principal para `waiting_children`.
    4.  O processamento do Job principal é interrompido.

## Pós-condições:

*   **Sucesso:**
    *   O Job é marcado como `completed` na Fila.
    *   O resultado do Job é armazenado.
    *   O `ActivityContext` é totalmente populado com o histórico da execução.
    *   O `AgentInternalState` pode ter sido atualizado.
    *   Jobs dependentes ou pais podem ter seus status atualizados.
*   **Falha:**
    *   O Job é marcado como `failed` na Fila (após esgotar retentativas da Fila, se aplicável).
    *   Detalhes do erro são registrados no `ActivityContext` e/ou logs do sistema.

## Requisitos Especiais:
*   O `ActivityContext` deve ser detalhado o suficiente para permitir a depuração e o reinício (se possível) de Jobs.
*   A interação com o LLM e as `Tools` deve ser eficiente para evitar longos tempos de bloqueio.
*   O Agente IA deve ser resiliente a falhas temporárias de `Tools` ou LLMs.

---
**Nota:** Este caso de uso representa o "motor" principal da autonomia do Agente. Ele pode ser invocado recursivamente se um Job levar à criação de Sub-Jobs que são então processados por este mesmo caso de uso.
