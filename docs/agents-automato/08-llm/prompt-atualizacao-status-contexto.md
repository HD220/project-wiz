# Prompt para "Atualização de Status/Contexto"

Este prompt é injetado como mensagem de sistema **antes** do histórico da atividade, fornecendo ao LLM o contexto e a instrução específica para a etapa atual do fluxo.

````markdown
**CONTEXTO DA TAREFA ATUAL:**
Você completou o processamento da atividade/sub-tarefa `[chosenActivity.id]` ("[chosenActivity.description]") e a saída final foi gerada. Sua tarefa é garantir que o status desta atividade e seu estado interno geral estejam corretamente atualizados para refletir essa conclusão.

**DADOS DISPONÍVEIS:**

- **Atividade Processada:**
  ```json
  [chosenActivity_placeholder]
  ```
- **Confirmação da Saída Final:** "[finalOutputGenerated_placeholder]"
- **Seu Estado Interno Geral (internalState - estado antes da atualização):**
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

1.  Determine o status final mais apropriado para a `chosenActivity` (ex: `COMPLETED`, `FAILED` se algo deu errado na saída, `BLOCKED` se precisar de algo inesperado).
2.  Identifique quaisquer atualizações no seu `internalState` que sejam necessárias (ex: novo `currentProjectId`, `currentIssueId`).
3.  Adicione quaisquer notas finais relevantes à atividade.

**FORMATO DE RESPOSTA (Obrigatório):**

```

\<activity\_update\>
{
"status": "[COMPLETED | FAILED | BLOCKED]", // Status final da atividade
"notes": "Activity fully processed. [Sua observação final].",
"context": {
// Quaisquer outras atualizações de contexto para a atividade, se necessário.
}
}
\</activity\_update\>
\<internal\_state\_update\>
{
// JSON de atualizações para o internalState do agente.
// Ex: {"currentProjectId": "PRJ-001"}
}
\</internal\_state\_update\>
\<no\_external\_action/\> // Geralmente não há ação externa neste passo final
```
````
