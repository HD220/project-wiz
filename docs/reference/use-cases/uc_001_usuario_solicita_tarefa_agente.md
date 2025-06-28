# UC-001: Usuário Solicita Tarefa a um Agente IA

**ID:** UC-001
**Nome do Caso de Uso:** Usuário Solicita Tarefa a um Agente IA
**Ator Principal:** Usuário
**Nível:** Usuário-Meta (User Goal)
**Prioridade:** Alta
**Referência Funcional:** [Introdução ao Project Wiz](../../../user/01-introduction.md), [Agent Operation Internals](../03-agent-operation-internals.md)

## Descrição Breve:
Este caso de uso descreve como um usuário interage com um Agente IA (configurado por um `AgentPersonaTemplate` e instanciado como `Agent`) para solicitar a execução de uma tarefa. O Agente IA analisa a solicitação, planeja a execução (potencialmente criando Jobs e Sub-Jobs), e pode pedir aprovação do usuário antes de iniciar o trabalho.

## Pré-condições:
1.  O usuário está autenticado no sistema Project Wiz.
2.  Existe pelo menos um Projeto configurado e selecionado/ativo.
3.  Existe pelo menos uma instância de `Agent` (baseada em um `AgentPersonaTemplate`) configurada e disponível, ou o sistema pode instanciar uma dinamicamente baseada em um `AgentPersonaTemplate` selecionado.
4.  O sistema de Fila de Jobs está operacional.
5.  A integração com o LLM está configurada e operacional para o `Agent` selecionado/instanciado.

## Fluxo Principal (Caminho Feliz):
1.  **Usuário Inicia Interação:**
    *   O Usuário seleciona um `AgentPersonaTemplate` ou uma instância de `Agent` pré-configurada na interface do Project Wiz (UI).
    *   O Usuário envia uma mensagem de chat para o Agente selecionado, descrevendo a necessidade ou objetivo da tarefa (ex: "Refatore o arquivo `utils.py` para seguir PEP8 e adicione docstrings").
2.  **Sistema Encaminha Solicitação:**
    *   A UI envia a mensagem do usuário para o backend (via IPC).
    *   O backend direciona a mensagem para a lógica do `GenericAgentExecutor` associado ao `Agent`.
3.  **Agente IA Analisa Solicitação:**
    *   O `GenericAgentExecutor` utiliza o LLM configurado para o `Agent` para analisar a mensagem do usuário.
    *   A análise considera o `AgentInternalState` (se aplicável) e o contexto do projeto atual.
4.  **Agente IA Planeja Execução:**
    *   Com base na análise, o LLM (sob a direção do `GenericAgentExecutor`) propõe um plano de ação.
    *   O plano pode incluir:
        *   A criação de um `Job` principal para a tarefa (usando `TaskManagerTool`).
        *   A definição de `validationCriteria` para o `Job` principal (armazenados no `ActivityContext` do Job).
        *   A decomposição do `Job` principal em uma série de Sub-Jobs menores, com suas próprias `validationCriteria` e dependências, também criados via `TaskManagerTool`.
5.  **Agente IA Solicita Aprovação do Plano (Opcional):**
    *   O `GenericAgentExecutor` (instruído pelo LLM) pode apresentar o plano de Jobs/Sub-Jobs e os `validationCriteria` ao Usuário via chat.
    *   O Agente IA aguarda a aprovação do Usuário.
6.  **Usuário Aprova Plano:**
    *   O Usuário revisa o plano e os `validationCriteria` apresentados.
    *   O Usuário envia uma mensagem de aprovação via chat.
7.  **Agente IA Cria Jobs:**
    *   Após receber a aprovação (ou se a aprovação não for um passo obrigatório), o Agente IA (via `TaskManagerTool` dentro do `GenericAgentExecutor`):
        *   Cria o `Job` principal em sua fila (`targetAgentRole` correspondente).
        *   Cria os Sub-Jobs planejados, estabelecendo as dependências necessárias.
8.  **Sistema Enfileira Jobs:**
    *   Os Jobs e Sub-Jobs criados são adicionados à Fila de Jobs (`IJobQueue`) e persistidos (`IJobRepository`).
9.  **Agente IA Informa Início (Opcional):**
    *   O Agente IA pode enviar uma mensagem ao Usuário informando que o trabalho foi iniciado.

## Fluxos Alternativos:

*   **FA-001: Usuário Não Aprova o Plano:**
    *   Se o Agente IA solicita aprovação (Passo 5) e o Usuário não aprova ou solicita modificações:
        1.  O Usuário envia feedback ou um plano alternativo.
        2.  O Agente IA (via `GenericAgentExecutor` e LLM) retorna ao Passo 3 (Análise) para reavaliar a solicitação.
        3.  O ciclo de planejamento e aprovação se repete.
        4.  Se não houver acordo, o Agente IA pode informar que não pode prosseguir e o caso de uso termina.

*   **FA-002: Agente IA Decide Não Criar Job:**
    *   No Passo 4, o Agente IA (via LLM) pode determinar que a solicitação não é clara, é inviável, ou está fora de seu escopo.
    *   O Agente IA informa ao Usuário a razão e o caso de uso termina.

*   **FA-003: Erro na Comunicação com LLM ou Criação de Job:**
    *   Se ocorrer um erro durante a análise (Passo 3), planejamento (Passo 4) ou criação de Jobs (Passo 7):
        1.  O sistema registra o erro.
        2.  O `GenericAgentExecutor` tenta informar o Usuário sobre a falha.
        3.  O caso de uso pode terminar, ou o Agente pode tentar uma estratégia de recuperação (ex: replanejamento, se o erro for do LLM).

## Pós-condições:

*   **Sucesso:**
    *   Um ou mais Jobs (Job principal e possíveis Sub-Jobs) são criados e enfileirados.
    *   O Job principal está em estado `PENDING` ou `WAITING` (se aguardando dependências).
    *   O Usuário foi informado (se aplicável) sobre o plano e o início do processamento.
*   **Falha:**
    *   Nenhum Job é criado, ou Jobs parcialmente criados são cancelados/marcados como falha.
    *   O Usuário é informado sobre a impossibilidade de processar a solicitação.

## Requisitos Especiais:
*   A interface de chat deve ser responsiva.
*   A lógica do `GenericAgentExecutor` e do LLM para análise e planejamento deve ser robusta.
*   O sistema de Fila de Jobs deve ser capaz de lidar com a criação e o enfileiramento de Jobs e Sub-Jobs com suas dependências.
