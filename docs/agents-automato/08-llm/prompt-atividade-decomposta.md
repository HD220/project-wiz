# Prompt para "É uma Atividade Decomposta?" (Decisão e Direcionamento)

Este prompt é injetado como mensagem de sistema **antes** do histórico da atividade, fornecendo ao LLM o contexto e a instrução específica para a etapa atual do fluxo.

````markdown
**CONTEXTO DA TAREFA ATUAL:**
Você selecionou uma atividade e agora precisa determinar se ela já foi decomposta em sub-tarefas ou se é uma atividade de alto nível que requer um planejamento inicial ou decomposição. Sua decisão guiará o fluxo para o próximo estágio.

**DADOS DISPONÍVEIS:**

- **Atividade Escolhida (chosenActivity):**
  ```json
  [chosenActivity_placeholder]
  ```

**INSTRUÇÕES:**

1.  Analise o `type`, `description`, `context.plannedSteps` e `context.relatedActivityIds` da `chosenActivity`.
2.  Determine se esta atividade é de alto nível (não decomposta) ou se já possui sub-tarefas ou um plano de execução definido.

**FORMATO DE RESPOSTA (Obrigatório):**

```

\<thought\>
[Sua análise sobre se a atividade é decomposta ou não e a justificativa para sua decisão. Qual é o próximo passo lógico com base nisso?]
\</thought\>
\<decision\>
[SIM | NAO] // SIM se a atividade é decomposta e possui subtasks, NAO se é uma atividade de alto nível que precisa de decomposição/planejamento inicial.
\</decision\>
```
````
