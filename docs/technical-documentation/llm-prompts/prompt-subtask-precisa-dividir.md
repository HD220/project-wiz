# Prompt para "A Subtask Atual precisa ser dividida em subtasks?" (Avaliação Pós-Execução)

Este prompt é injetado como mensagem de sistema **antes** do histórico da atividade, fornecendo ao LLM o contexto e a instrução específica para a etapa atual do fluxo.

````markdown
**CONTEXTO DA TAREFA ATUAL:**
Você acabou de processar a sub-tarefa/atividade `[chosenActivity.id]` (descrição: "[chosenActivity.description]"). O resultado da ação foi: [toolOutput_or_messageSentConfirmation_placeholder]. Sua tarefa é avaliar se esta atividade/sub-tarefa está completa, precisa de mais passos, ou se o planejamento atual precisa ser ajustado/decomposto ainda mais.

**DADOS DISPONÍVEIS:**

- **Atividade/Sub-tarefa Processada:**
  ```json
  [chosenActivity_placeholder]
  ```
- **Resultado da Ação Anterior:**
  [toolOutput_or_messageSentConfirmation_placeholder]
- **Análise do Passo Anterior:** "[analysisFromPreviousStep_placeholder]"
- **Seu Estado Interno Geral (internalState):**
  ```json
  [internalState_placeholder]
  ```
- **Histórico da Atividade (`activityHistory`):**
  ```json
  [activityHistory_placeholder]
  ```
- **Notas da Atividade (`activityNotes`):**
  [activityNotes_placeholder]

**INSTRUÇÕES:**

1.  Analise o `toolOutput` ou o resultado da mensagem.
2.  Compare o resultado com a `description` e os `plannedSteps` da atividade/sub-tarefa atual.
3.  Decida se esta sub-tarefa está realmente completa OU se ela revelou a necessidade de novos passos/sub-tarefas para atingir o objetivo principal da atividade.
4.  Se novos passos forem necessários, indique se eles serão novas sub-atividades ou apenas o próximo passo no plano existente.

**FORMATO DE RESPOSTA (Obrigatório):**

```

\<thought\>
[Sua reflexão pós-execução. O que o resultado significa? A sub-tarefa está concluída ou revelou novas necessidades? Por que sim ou não?]
\</thought\>
\<needs\_further\_decomposition\>
[SIM | NAO] // SIM se novos sub-passos/sub-atividades são necessários para completar o objetivo maior da atividade ou se a sub-tarefa precisa ser dividida ainda mais. NAO se a sub-tarefa está completa ou o próximo passo já está claro.
\</needs\_further\_decomposition\>
\<activity\_update\>
{
// JSON da atualização da atividade.
// Ex: {"status": "COMPLETED", "notes": "Subtask completed successfully."}
// Ex: {"status": "IN\_PROGRESS", "notes": "Subtask requires further decomposition."}
// Pode incluir "new\_sub\_activity" se SIM for a resposta, ou apenas atualizar o status.
}
\</activity\_update\>
```
````
