# Fluxo Conceitual do Backend: Ciclo de Vida de um Job

Este documento descreve o ciclo de vida típico de um `Job` (Atividade) dentro do Project Wiz, delineando como diferentes componentes do backend interagem em alto nível para processar tarefas. Um "Agente" aqui se refere à lógica autônoma que utiliza uma configuração de "Persona" para interagir com um LLM.

1.  **Interação do Usuário e Análise Inicial pelo Agente:**
    *   O usuário interage com um Agente (atuando com uma `Persona`) via frontend, descrevendo uma necessidade ou objetivo para um `Project` específico.
    *   O Agente, usando sua `Persona Core Logic` e o `LLM`, analisa a solicitação para entender a intenção e os requisitos principais.

2.  **Planejamento, Definição de Pronto e Proposta ao Usuário:**
    *   O Agente opera dentro da `caminho_working_directory` definida para o `Project`. Antes de iniciar modificações de código, o Agente utiliza `GitTools` para criar um novo branch específico para o `Job` ou conjunto de `Sub-Jobs` (ex: `feature/job-123`), a partir do branch principal do projeto, assegurando o isolamento das alterações.
    *   O Agente elabora um plano de alto nível, que pode incluir a decomposição da solicitação em múltiplos `Sub-Jobs` (que serão `Jobs` formais com `parent_job_id`).
    *   Crucialmente, o Agente define os `validationCriteria` (Definição de Pronto) para o `Job` principal (ou para o conjunto de `Sub-Jobs`) ANTES de iniciar a execução detalhada.
    *   **Ponto de Verificação com o Usuário:** O Agente apresenta seu plano e a Definição de Pronto ao usuário via chat: "Entendi que você precisa X. Meu plano é Y, que envolverá os seguintes Sub-Jobs: Y1, Y2. O resultado final será Z, conforme estes critérios. Você aprova esta abordagem?"
    *   O usuário aprova ou sugere modificações. Se aprovado, o Agente prossegue.

3.  **Criação e Enfileiramento de Jobs/Sub-Jobs:**
    *   Com base no plano aprovado, o Agente cria formalmente o `Job` principal e/ou os `Sub-Jobs` necessários, preenchendo seus detalhes (incluindo o `queue_name` apropriado para cada um, tipo, payload inicial, `depends_on_job_ids` entre Sub-Jobs, `parent_job_id`).
    *   Esses `Jobs` são submetidos pelo Agente à `Queue` (Sistema de Gerenciamento de Jobs). A `Queue` (inspirada no BullMQ, com persistência SQLite) os armazena (com seu `queue_name`) e gerencia suas dependências e status.

4.  **Agente (Worker) Solicita e Processa Job/Sub-Job da Fila:**
    *   O Agente (atuando em seu loop "Worker" e configurado para ouvir uma ou mais `queue_name`s) solicita à `Queue` o próximo `Job` ou `Sub-Job` elegível de uma das filas que monitora e que lhe foi atribuído.
    *   Ao receber um `Job/Sub-Job` (que terá um `queue_name`), o Agente carrega seu `AgentInternalState` e o `ActivityContext` específico daquele `Job/Sub-Job`.

5.  **Raciocínio e Planejamento Detalhado (LLM via Persona):**
    *   Para o `Job/Sub-Job` atual, o Agente formula um prompt para o `LLM` (usando a `Persona` configurada), visando detalhar os passos de execução, identificar `Tools` a serem usadas, ou gerar artefatos parciais.

6.  **Execução de Task/Tool (Dentro da `working_directory` do Projeto, no branch do Job):**
    *   O Agente, instruído pelo `LLM`, executa `Tasks` (objetivos/prompts para o LLM) e `Tools` (ex: `readFileTool`, `writeFileTool`, `executeTerminalCommandTool`, `searchAndReplaceInFileTool`, `applyDiffTool`, `GitTools` como `gitAddTool`, `gitCommitTool`).
    *   Todas as operações de arquivo e comandos são executados no contexto da `working_directory` do `Project`, no branch específico criado para o `Job`.
    *   Falhas em `Tools` são capturadas; o Agente pode tentar novamente, usar alternativas, ou se encontrar dificuldades persistentes, aplicar "regras de ouro" (dividir o problema, reavaliar, ou pedir ajuda ao usuário como último recurso).

7.  **Atualização de Contexto:**
    *   Resultados, erros, logs e aprendizados são registrados no `ActivityContext` do `Job/Sub-Job`. Informações relevantes podem ser promovidas ao `AgentInternalState` (conhecimento geral ou específico do projeto).

8.  **Iteração e Replanejamento (para o `Job/Sub-Job` atual):**
    *   O Agente continua o ciclo de Raciocínio/Planejamento, Execução e Atualização de Contexto até que o objetivo do `Job/Sub-Job` atual seja alcançado.

9.  **Auto-Validação do `Job/Sub-Job`:**
    *   Ao final de cada `Sub-Job` (ou do `Job` principal, se não houver decomposição), o Agente realiza a auto-validação contra os `validationCriteria` definidos para ele.
    *   Se falhar, retorna ao passo de replanejamento/correção para aquele `Job/Sub-Job`.

10. **Conclusão e Atualização de Status na Fila:**
    *   Após a conclusão bem-sucedida (e validada) de um `Job` ou `Sub-Job`, o Agente atualiza seu status na `Queue` para "finished". Se falhar de forma irrecuperável, atualiza para "failed".

11. **Entrega de Resultados e Notificação (para o Job Principal):**
    *   Quando o `Job` principal (e todos os seus `Sub-Jobs` dependentes) são concluídos:
        *   O Agente usa `GitTools` para commitar as alterações realizadas na `working_directory` do `Project` (no branch específico do `Job`) com uma mensagem apropriada.
        *   Opcionalmente (configurável), o Agente pode fazer push do branch do `Job` para o repositório remoto.
        *   O Agente notifica o usuário (via chat no Frontend) sobre a conclusão, informando o nome do branch, um resumo das alterações, e o resultado da auto-validação. Pode também oferecer um `diff` das alterações.
    *   O `ActivityContext` final e os artefatos são armazenados. A `Queue` emite eventos que atualizam a UI.

Este ciclo de vida enfatiza a autonomia do Agente no planejamento e execução, a importância da `working_directory` do `Project` e de branches Git específicos do `Job` para operações de código, a decomposição de tarefas em `Sub-Jobs`, e a entrega de valor através de práticas Git.
