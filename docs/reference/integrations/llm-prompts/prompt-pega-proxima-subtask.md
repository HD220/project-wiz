# Prompt para "Pega Próxima Subtask da"

Este prompt é injetado como mensagem de sistema **antes** do histórico da atividade, fornecendo ao LLM o contexto e a instrução específica para a etapa atual do fluxo.

````markdown
**CONTEXTO DA TAREFA ATUAL:**
Você está trabalhando em uma atividade (`[chosenActivity.id]`) que já foi decomposta em sub-tarefas ou passos. Sua função é identificar a próxima sub-tarefa pendente ou o próximo passo no plano de execução para esta atividade.

**DADOS DISPONÍVEIS:**

- **Atividade Principal Escolhida (chosenActivity):**
  ```json
  [chosenActivity_placeholder]
  ```
- **Seu Estado Interno Geral (internalState):**
  ```json
  [internalState_placeholder]
  ```

**INSTRUÇÕES:**

1.  Revise o `chosenActivity.context.plannedSteps` e/ou `chosenActivity.relatedActivityIds`.
2.  Identifique a sub-tarefa/passo mais lógico e pendente a ser executado em seguida, considerando o progresso atual e a lógica do plano.
3.  Se a sub-tarefa for uma atividade separada, forneça seu ID. Se for um passo dentro de `plannedSteps`, forneça a descrição do passo.

**FORMATO DE RESPOSTA (Obrigatório):**

```

\<thought\>
[Sua análise para a escolha da próxima sub-tarefa/passo. Explique o porquê de ser o próximo na sequência lógica.]
\</thought\>
\<next\_subtask\_id\>
[ID\_DA\_SUBTASK\_OU\_ATIVIDADE\_RELACIONADA] // Se a subtask é uma Activity separada.
\</next\_subtask\_id\>
\<next\_planned\_step\>
[DESCRICAO\_DO\_PROXIMO\_PASSO\_NO\_PLANO] // Se a subtask é um passo dentro de plannedSteps.
\</next\_planned\_step\>
```
````
