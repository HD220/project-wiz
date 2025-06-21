# UC-001: Usuário Solicita Tarefa a um Agente IA

**ID:** UC-001
**Nome do Caso de Uso:** Usuário Solicita Tarefa a um Agente IA
**Ator Principal:** Usuário
**Nível:** Usuário-Meta (User Goal)
**Prioridade:** Alta

## Descrição Breve:
Este caso de uso descreve como um usuário interage com um Agente IA (configurado por uma Persona) para solicitar a execução de uma tarefa. O Agente IA analisa a solicitação, planeja a execução (potencialmente criando Jobs e Sub-Jobs), e pode pedir aprovação do usuário antes de iniciar o trabalho.

## Pré-condições:
1.  O usuário está autenticado no sistema Project Wiz.
2.  Existe pelo menos um Projeto configurado e selecionado/ativo.
3.  Existe pelo menos uma Persona (Agente IA) configurada e disponível.
4.  O sistema de Fila de Jobs está operacional.
5.  A integração com o LLM está configurada e operacional para a Persona selecionada.

## Fluxo Principal (Caminho Feliz):
1.  **Usuário Inicia Interação:**
    *   O Usuário seleciona uma Persona (Agente IA) na interface do Project Wiz (UI).
    *   O Usuário envia uma mensagem de chat para a Persona selecionada, descrevendo a necessidade ou objetivo da tarefa (ex: "Refatore o arquivo `utils.py` para seguir PEP8 e adicione docstrings").
2.  **Sistema Encaminha Solicitação:**
    *   A UI envia a mensagem do usuário para o backend (via IPC).
    *   O backend direciona a mensagem para a lógica do Agente IA correspondente à Persona.
3.  **Agente IA Analisa Solicitação:**
    *   O Agente IA (sua `PersonaCoreLogic`) utiliza o LLM configurado para analisar a mensagem do usuário.
    *   A análise considera o `AgentInternalState` da Persona e o contexto do projeto atual.
4.  **Agente IA Planeja Execução:**
    *   Com base na análise, o LLM (sob a direção da Persona) propõe um plano de ação.
    *   O plano pode incluir:
        *   A criação de um Job principal para a tarefa.
        *   A definição de critérios de validação ("Definição de Pronto" / `validationCriteria`) para o Job principal.
        *   A decomposição do Job principal em uma série de Sub-Jobs menores e gerenciáveis, com suas próprias `validationCriteria` e dependências.
5.  **Agente IA Solicita Aprovação do Plano (Opcional, mas recomendado):**
    *   O Agente IA utiliza uma `Tool` de comunicação (`SendMessageToUserTool`) para apresentar o plano de Jobs/Sub-Jobs e a "Definição de Pronto" ao Usuário via chat.
    *   O Agente IA aguarda a aprovação do Usuário.
6.  **Usuário Aprova Plano:**
    *   O Usuário revisa o plano e a "Definição de Pronto" apresentada pelo Agente IA.
    *   O Usuário envia uma mensagem de aprovação via chat.
7.  **Agente IA Cria Jobs:**
    *   Após receber a aprovação (ou se a aprovação não for um passo obrigatório para esta Persona/tarefa), o Agente IA:
        *   Cria o Job principal em sua fila nomeada (`queueName`).
        *   Cria os Sub-Jobs planejados em sua fila, estabelecendo as dependências necessárias entre eles e com o Job principal.
        *   Define o status do Job principal como `waiting_children` (se Sub-Jobs foram criados) ou `pending`.
8.  **Sistema Enfileira Jobs:**
    *   Os Jobs e Sub-Jobs criados pelo Agente são adicionados à Fila de Jobs e persistidos.
9.  **Agente IA Informa Início (Opcional):**
    *   O Agente IA pode enviar uma mensagem ao Usuário informando que o trabalho foi iniciado.

## Fluxos Alternativos:

*   **FA-001: Usuário Não Aprova o Plano:**
    *   Se o Agente IA solicita aprovação (Passo 5) e o Usuário não aprova ou solicita modificações:
        1.  O Usuário envia feedback ou um plano alternativo.
        2.  O Agente IA retorna ao Passo 3 (Análise) para reavaliar a solicitação com o novo input.
        3.  O ciclo de planejamento e aprovação se repete.
        4.  Se não houver acordo, o Agente IA pode informar que não pode prosseguir e o caso de uso termina sem a criação dos Jobs.

*   **FA-002: Agente IA Decide Não Criar Job:**
    *   No Passo 4, o Agente IA (via LLM) pode determinar que a solicitação não é clara, é inviável, ou está fora de seu escopo.
    *   O Agente IA informa ao Usuário a razão pela qual não pode prosseguir e o caso de uso termina.

*   **FA-003: Erro na Comunicação com LLM ou Criação de Job:**
    *   Se ocorrer um erro durante a análise (Passo 3), planejamento (Passo 4) ou criação de Jobs (Passo 7):
        1.  O sistema registra o erro.
        2.  O Agente IA tenta informar o Usuário sobre a falha.
        3.  O caso de uso pode terminar, ou o Agente pode tentar uma estratégia de recuperação (ex: re-tentar a chamada ao LLM).

## Pós-condições:

*   **Sucesso:**
    *   Um ou mais Jobs (Job principal e possíveis Sub-Jobs) são criados e enfileirados na fila do Agente IA.
    *   O Job principal está em estado `pending` ou `waiting_children`.
    *   O Usuário foi informado (se aplicável) sobre o plano e o início do processamento.
*   **Falha:**
    *   Nenhum Job é criado, ou Jobs parcialmente criados são cancelados/marcados como falha.
    *   O Usuário é informado sobre a impossibilidade de processar a solicitação.

## Requisitos Especiais:
*   A interface de chat deve ser responsiva.
*   A lógica do Agente IA para análise e planejamento deve ser robusta.
*   O sistema de Fila de Jobs deve ser capaz de lidar com a criação e o enfileiramento de Jobs e Sub-Jobs com suas dependências.

## Relacionamento com Outros Casos de Uso:
*   Este caso de uso precede **UC-002: Agente IA Processa um Job**.
*   Pode interagir com **UC-004: Usuário Gerencia Personas** (para seleção da Persona).
*   Pode interagir com **UC-003: Usuário Gerencia Projetos** (para definição do contexto do projeto).

---
**Nota:** Este caso de uso foca na interação inicial e no desencadeamento do trabalho. O processamento detalhado dos Jobs pelo Agente é coberto em UC-002.
