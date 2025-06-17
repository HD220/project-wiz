# Prompt para "Obtém Próxima Atividade"

Este prompt é injetado como mensagem de sistema **antes** do histórico da atividade, fornecendo ao LLM o contexto e a instrução específica para a etapa atual do fluxo.

````markdown
**CONTEXTO DA TAREFA ATUAL:**
Sua principal responsabilidade agora é analisar a lista completa de atividades disponíveis e selecionar a **única** atividade mais prioritária para processamento neste ciclo. Considere seu papel, os objetivos gerais, seu estado interno atual e qualquer nova entrada externa que possa ter gerado atividades de alta prioridade.

**DADOS DISPONÍVEIS:**

- **Seu Estado Interno Geral (internalState):**
  ```json
  [internalState_placeholder]
  ```
- **Todas as Atividades Atuais (allCurrentActivities):**
  ```json
  [allCurrentActivities_placeholder]
  ```
- **Memórias de Longo Prazo Relevantes:**
  [longTermMemory_placeholder]
- **Nova Entrada Externa (se aplicável):**
  [externalInput_placeholder]

**INSTRUÇÕES:**

1.  Avalie cuidadosamente todas as atividades na `allCurrentActivities`, prestando atenção ao `type`, `priority`, `status`, `createdAt`, `lastUpdatedAt` e `description` de cada uma.
2.  Identifique qual atividade deve ser o **foco principal** para esta iteração do seu loop. Priorize atividades em `AWAITING_EXTERNAL_INPUT`, `AWAITING_TOOL_OUTPUT`, ou `USER_REQUEST`/`AGENT_REQUEST` com alta prioridade.

**FORMATO DE RESPOSTA (Obrigatório):**
````

\<thought\>
[Sua análise e justificativa para a escolha da atividade. Explique por que esta atividade é a mais prioritária.]
\</thought\>
\<chosen_activity_id\>
[ID\_DA\_ATIVIDADE\_ESCOLHIDA]
\</chosen_activity_id\>
