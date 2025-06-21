# Fluxo de Trabalho Operacional para Agentes

Este documento descreve um conjunto de diretrizes operacionais padrão, originadas de `.roo/rules/rules.md`, que podem servir como base para o design de prompts de alto nível para os Agentes do Project Wiz ou para definir o comportamento de agentes que gerenciam outras tarefas complexas.

Estas etapas visam garantir que um Agente processe suas atribuições de forma metódica e eficaz.

## 1. Coleta de Contexto (Context Gathering)

*   **Diretriz Original:** Inicie coletando todo o contexto necessário. Utilize ferramentas como `read_file` ou `search_files` para compreender exaustivamente a solicitação do usuário e os fatores ambientais relevantes (ex: estrutura do repositório, documentação existente).
*   **Aplicação em Prompts/Agentes:** Ao projetar um Agente, seu prompt inicial ou lógica de processamento deve instruí-lo a primeiro reunir todas as informações pertinentes antes de prosseguir para o planejamento ou execução. Isso pode envolver a leitura de arquivos especificados, a busca por palavras-chave no projeto, ou a análise de documentação relacionada.

## 2. Planejamento Estratégico (Strategic Planning)

*   **Diretriz Original:** Após a aquisição de contexto suficiente, formule um plano detalhado e executável para abordar a tarefa do usuário.
    *   **Validar Pré-requisitos:** Analise criticamente todas as etapas propostas do plano. Identifique e resolva quaisquer conflitos potenciais com a documentação existente, organização do código ou estrutura do repositório. Ajuste o plano conforme necessário para garantir a viabilidade e prevenir regressões.
*   **Aplicação em Prompts/Agentes:** O Agente deve ser instruído a, após coletar informações, gerar um plano de ação passo a passo. Este plano deve ser internamente validado (ou apresentado ao usuário para validação) antes da execução, especialmente para tarefas complexas. O Agente deve considerar as restrições e o estado atual do projeto.

## 3. Decomposição e Delegação de Tarefas (Task Decomposition & Delegation)

*   **Diretriz Original:** Quebre o plano validado em subtarefas lógicas e independentes.
    *   Para cada subtarefa, delegue-a usando a ferramenta `new_task`.
    *   **Seleção de Modo:** Sempre selecione o modo especializado mais apropriado para o objetivo específico da subtarefa.
    *   **Instruções Abrangentes para Subtarefas:** O parâmetro `message` de `new_task` **deve** conter:
        *   **Contexto Completo:** Inclua todas as informações relevantes da tarefa pai ou de subtarefas anteriores necessárias para que o modo delegado opere autonomamente.
        *   **Escopo Claro:** Defina explicitamente o que a subtarefa **deve** realizar e do que **não deve** se desviar. Seja específico. Por exemplo: se precisar que um arquivo seja criado, peça "crie o arquivo xyz, na localização yxy"; se precisar que o retorno da atividade tenha informações específicas, informe; se tiver que seguir uma determinada ação, informe.
        *   **Sinal de Conclusão:** Instrua a subtarefa a sinalizar sua conclusão usando a ferramenta `attempt_completion`. O parâmetro `result` de `attempt_completion` **deve** fornecer um resumo conciso, completo e factual do resultado, servindo como o registro definitivo do trabalho concluído para o projeto.
*   **Aplicação em Prompts/Agentes:** Esta é uma capacidade avançada. Um Agente "gerente" poderia ser projetado para decompor um Job principal em Jobs menores e delegá-los a outros Agentes (ou a si mesmo em sequência) usando um sistema similar ao `new_task`. Os prompts para essas subtarefas devem ser auto-contidos e muito específicos. A ferramenta `TaskTool` dos Agentes do Project Wiz parece ter funcionalidades relacionadas.

## 4. Monitoramento de Progresso e Refinamento Adaptativo (Progress Monitoring & Adaptive Refinement)

*   **Diretriz Original:** Monitore e gerencie continuamente o progresso de todas as subtarefas delegadas.
    *   Após a conclusão da subtarefa, analise meticulosamente seus resultados. Com base no resultado, determine os passos subsequentes.
    *   **Replanejamento Dinâmico:** Melhore iterativamente o fluxo de trabalho geral e o plano com base nos resultados das subtarefas concluídas. Esteja preparado para ajustar a direção do plano se novas informações ou desafios surgirem.
*   **Aplicação em Prompts/Agentes:** Um Agente deve ser capaz de acompanhar o status dos Jobs que delegou ou das etapas de seu próprio plano. Se uma etapa falhar ou o resultado não for o esperado, o Agente deve ser capaz de replanejar, talvez tentando uma abordagem diferente, solicitando esclarecimentos, ou reportando a falha.

## 5. Síntese Final (Final Synthesis)

*   **Diretriz Original:** Uma vez que **todas** as subtarefas sejam concluídas com sucesso, sintetize seus resultados individuais em uma visão geral abrangente. Forneça um resumo claro e detalhado de todas as realizações relacionadas à solicitação inicial do usuário.
*   **Aplicação em Prompts/Agentes:** Ao final de um Job complexo (especialmente um que envolveu múltiplas etapas ou subtarefas), o Agente deve ser instruído a gerar um relatório final ou um resumo que consolide os resultados, as ações tomadas e o estado final do trabalho.

Adotar um fluxo de trabalho estruturado como este pode aumentar significativamente a confiabilidade e a eficácia dos Agentes de IA no Project Wiz.
