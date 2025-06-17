# Fluxo: O Loop do Agente Autônomo

O Agente Autônomo opera em um ciclo contínuo, iterando sobre as atividades e adaptando-se às necessidades. O "Loop Agente" representa graficamente esse fluxo, mostrando como o agente processa as atividades sob sua responsabilidade, desde a obtenção da próxima atividade até a atualização de seu status e contexto.

```mermaid
graph TD
    A[Início / Lista de Atividades] --> B(Obtém Próxima Atividade)

    B --> C{É uma Atividade Decomposta?}

    C -- Não --> F[Analise Intenção]

    C -- Sim --> D[Pega Próxima Subtask da]

    D --> E{É necessário contexto adicional?}

    E -- Sim --> G[Coleta de Contexto]
    G --> A % Retorna ao início para processar a atividade de coleta de contexto

    E -- Não --> F

    F --> H[Transformar em itens acionáveis (Sub Atividade ou Atividades)]

    H --> I[Processa Próxima SubAtividade Pendente]

    I --> J{A Subtask Atual precisa ser dividida em subtasks?}

    J -- Sim --> A % Novas subtasks são criadas, volta para a lista de atividades

    J -- Não --> K[Geração da Saída]

    K --> L[Atualização de Status/Contexto]

    L --> A % Loop contínuo do agente
```

## Início / Lista de Atividades

O agente inicia seu ciclo de operação, observando todas as atividades sob sua responsabilidade, gerenciadas pelo `ActivityManager`.

## Obtém Próxima Atividade

O agente consulta sua lista de atividades e, através de sua lógica de priorização (guiada pelo LLM), seleciona a atividade mais relevante e prioritária para focar neste ciclo. Novas entradas externas são transformadas em atividades de alta prioridade.

## É uma Atividade Decomposta?

Se a atividade escolhida for uma solicitação de alto nível que ainda não foi detalhada (ex: uma `USER_REQUEST` inicial), ela é direcionada para a etapa de "Analise Intenção" para ser interpretada e planejada. Se a atividade já possui um plano ou foi decomposta em sub-tarefas, o fluxo segue para "Pega Próxima Subtask da".

## Pega Próxima Subtask da

Para atividades decompostas, o agente identifica a próxima sub-tarefa ou o próximo passo no plano de execução a ser processado.

## É necessário contexto adicional?

Antes de executar uma ação, o agente valida se possui todas as informações e pré-requisitos necessários. Se algo estiver faltando, ele segue para "Coleta de Contexto". Se o contexto é suficiente, o agente avança para "Analise Intenção".

## Coleta de Contexto

O agente planeja e executa ações para obter as informações ausentes. Isso pode envolver uma nova interação com o usuário, outro agente ou uma ferramenta. Após a coleta, o ciclo retorna ao "Início" para reavaliar a lista de atividades.

## Analise Intenção

O agente (LLM) interpreta profundamente o propósito da atividade (ou sub-atividade) em foco, seus requisitos e os resultados esperados, considerando seu `activityHistory` e `activityNotes` específicos.

## Transformar em itens acionáveis (Sub Atividade ou Atividades)

Com base na intenção analisada, o agente realiza o planejamento concreto. Ele quebra o objetivo em passos executáveis, criando novas `subActivities` ou atualizando os `plannedSteps` na `Activity` principal.

## Processa Próxima SubAtividade Pendente

O agente executa a ação concreta para avançar na sub-tarefa. Isso pode ser uma chamada de ferramenta, o envio de uma mensagem para um usuário ou outro agente, ou uma atualização puramente interna. O resultado desta ação é adicionado ao `activityHistory` da atividade.

## A Subtask Atual precisa ser dividida em subtasks?

Após a execução, o agente reflete sobre o resultado. Se a sub-tarefa ainda é muito complexa ou se o resultado da execução indica a necessidade de mais decomposição ou novos passos, novas sub-tarefas são geradas e o ciclo retorna ao "Início" para que sejam priorizadas. Se a sub-tarefa foi concluída ou o próximo passo é uma saída direta, o fluxo segue para "Geração da Saída".

## Geração da Saída

O agente formula e envia a saída final para aquela etapa do processo. Isso pode ser uma mensagem para o usuário, outro agente, ou uma confirmação de que uma ferramenta gerou um resultado final.

## Atualização de Status/Contexto

O agente atualiza o status da atividade (ex: `COMPLETED`, `IN_PROGRESS`) e quaisquer aspectos relevantes do seu estado interno (`AgentInternalState`) para refletir o progresso.

## Fim / Loop Agente

O ciclo se completa e o agente retorna ao "Início" para pegar a próxima atividade, mantendo sua operação contínua e autônoma.
