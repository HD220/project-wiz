# Fluxo Conceitual do Backend: Ciclo de Vida de um Job

Este documento descreve o ciclo de vida típico de um `Job` (Atividade) dentro do Project Wiz, delineando como diferentes componentes do backend interagem em alto nível para processar tarefas. Um "Agente" aqui se refere à lógica autônoma que utiliza uma configuração de "Persona" para interagir com um LLM.

1.  **Interação do Usuário e Decisão de Criação de Job pelo Agente:**
    *   O usuário interage com um Agente (atuando com uma configuração de `Persona`) através da interface frontend, descrevendo uma necessidade, objetivo ou solicitando uma tarefa complexa.
    *   O Agente, utilizando sua `Persona Core Logic` em conjunto com o `LLM`, analisa a solicitação do usuário.
    *   Com base nessa análise, o Agente decide se um ou mais `Jobs` são necessários para atender ao pedido. Se sim, o próprio Agente define os detalhes destes `Jobs` (ex: tipo de tarefa, `Input Data/Payload` inicial derivado da conversa, dependências potenciais com outros `Jobs` que ele gerencia, `parent_job_id` se for um sub-job de um Job maior do próprio Agente). O `Job` é atribuído ao próprio Agente que o criou.

2.  **Enfileiramento (Inspirado no BullMQ):**
    *   O(s) `Job`(s) criado(s) pelo Agente são submetidos ao Sistema de Gerenciamento de Jobs/Atividades (`Queue`).
    *   A `Queue`, projetada para robustez (ex: com persistência baseada em SQLite), armazena o `Job` com todos os seus detalhes. Define o status inicial (ex: "pendente" ou "aguardando" se existirem dependências).
    *   A `Queue` gerencia dependências de `Jobs`, retentativas (retries), agendamento potencial e emite eventos sobre mudanças de status. A prioridade pode ser influenciada por Agentes interagindo com seus próprios `Jobs`.

3.  **Agente (Worker) Solicita Job da Fila:**
    *   Cada Agente executa seu próprio loop de processamento assíncrono (sua instância "Worker"). Neste loop, o Agente ativamente solicita à `Queue` por `Jobs` que lhe foram atribuídos e que estão elegíveis para execução (dependências cumpridas, não agendados para futuro, etc.).
    *   A concorrência em nível de sistema é alcançada através de múltiplos Agentes operando seus loops de forma independente e simultânea.

4.  **Carregamento de Contexto pelo Agente:**
    *   Ao receber um `Job` da Fila, o Agente carrega:
        *   **`AgentInternalState`:** Sua memória global e persistente, incluindo seus objetivos gerais, aprendizados passados, uma lista de todas as suas atividades (`Jobs`), e conhecimento acumulado.
        *   **`ActivityContext`:** O contexto específico para *este* `Job`, incluindo o input inicial, o histórico de mensagens/interações desta tarefa (ex: `CoreMessages`), e quaisquer passos de planejamento ou resultados parciais anteriores.

5.  **Raciocínio e Planejamento (Interação LLM via Persona):**
    *   O Agente, utilizando seu `AgentInternalState` carregado e o `ActivityContext` do `Job` atual, formula um prompt para a `Persona` configurada. Este prompt instrui o Modelo de Linguagem Amplo (LLM) associado à `Persona`.
    *   A interação com o LLM visa: entender o objetivo do `Job`, decompô-lo em passos gerenciáveis (planejamento), definir `validationCriteria` (Definição de Pronto para a tarefa), ou decidir a próxima `Task` ou uso de `Tool` imediato.

6.  **Execução de Task/Tool:**
    *   Com base na resposta do LLM (moldada pela `Persona`), o Agente seleciona e aciona:
        *   Uma **`Task`**: Um objetivo específico ou prompt refinado direcionado ao LLM, que pode envolver planejamento adicional ou invocação direta de `Tool` pelo LLM.
        *   Uma **`Tool`**: Uma capacidade pré-desenvolvida (ex: acesso a arquivos, execução de código, comunicação com outro Agente através de uma `SendMessageToAgentTool`).
    *   Se a execução de uma `Tool` falhar, este erro é capturado no `ActivityContext`. O Agente pode decidir tentar novamente, usar uma `Tool` alternativa ou marcar o `Job` como falho com base nisso.

7.  **Atualização de Contexto:**
    *   Após cada execução (ou tentativa de execução) de `Task`/`Tool`, o Agente atualiza o `ActivityContext` para o `Job` atual.
    *   Isso inclui resultados, erros encontrados, logs de ações tomadas, novas informações aprendidas e progresso em direção ao objetivo do `Job`. Este contexto atualizado, incluindo o histórico de mensagens, é usado para interações subsequentes com o LLM.

8.  **Iteração e Replanejamento:**
    *   O Agente avalia o `ActivityContext` atualizado e seu plano geral.
    *   Se o objetivo principal do `Job` ainda não foi alcançado, ou se um passo falhou e uma nova abordagem é necessária, o Agente repete os passos 5 (Raciocínio/Planejamento), 6 (Execução de `Task`/`Tool`) e 7 (Atualização de Contexto). Este loop iterativo continua enquanto o Agente trabalha em seu plano.

9.  **Auto-Validação (Self-Validation):**
    *   Antes de considerar um `Job` completo, o Agente (guiado por sua `Persona`/LLM) pode realizar um passo de auto-validação usando os `validationCriteria` definidos no `ActivityContext`.
    *   O `validationResult` é registrado. Se a validação falhar, o Agente pode retornar ao passo 8 (Iteração e Replanejamento) para corrigir as deficiências.

10. **Conclusão/Atualização de Status do Job:**
    *   Uma vez que o Agente determina que os objetivos do `Job` foram atendidos (e a auto-validação foi bem-sucedida), ou se encontra um erro irrecuperável (ex: máximo de retentativas atingido, falha crítica de `Tool`, loop de planejamento insolúvel), ele finaliza o `Job`.
    *   O Agente atualiza o status final do `Job` na `Queue` (ex: "finished", "failed") e armazena o resultado detalhado, incluindo quaisquer erros, no `ActivityContext` e potencialmente em logs.

11. **Armazenamento de Resultados e Notificação:**
    *   O output final, artefatos ou resultados do `ActivityContext` são disponibilizados.
    *   A `Queue` emite um evento para o status final do `Job`, que pode acionar notificações para o usuário através do frontend ou para outros sistemas/Agentes dependentes.

Este ciclo de vida enfatiza uma abordagem centrada no Agente, onde cada Agente gerencia autonomamente seu fluxo de trabalho usando sua `Persona` configurada para interagir com LLMs e `Tools`, tudo orquestrado através de uma robusta Fila de `Jobs`.
