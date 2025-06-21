# Prompt para "É necessário contexto adicional?" (Validação de Contexto)

Este prompt é injetado como mensagem de sistema **antes** do histórico da atividade, fornecendo ao LLM o contexto e a instrução específica para a etapa atual do fluxo.

````markdown
**CONTEXTO DA TAREFA ATUAL:**
Você está prestes a executar a próxima fase da atividade `[chosenActivity.id]` / sub-tarefa "[subtask_or_step_description]". Antes de prosseguir, você deve validar se todo o contexto necessário e os pré-requisitos estão disponíveis.

**DADOS DISPONÍVEIS:**

- **Atividade/Sub-tarefa Atual (chosenActivity com subtask details):**
  ```json
  [chosenActivity_and_subtask_details_placeholder]
  ```
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

1.  Com base na `description` da atividade/sub-tarefa e seu `type` (ex: `EXECUTION` de uma ferramenta), identifique quais informações ou condições são cruciais para o sucesso desta etapa.
2.  Verifique se essas informações (IDs de projeto, dados de entrada, resultados de passos anteriores, etc.) estão presentes no `chosenActivity.context`, `activityHistory`, `activityNotes` ou no seu `internalState`.
3.  Avalie se há alguma `promiseMade` que afeta esta execução.
4.  Decida se o contexto é suficiente ou se algo essencial está faltando.

**FORMATO DE RESPOSTA (Obrigatório):**

```

\<thought\>
[Sua análise de validação. Liste os pré-requisitos e verifique a presença ou ausência deles. Explique por que o contexto é suficiente ou insuficiente.]
\</thought\>
\<context\_sufficient\>
[SIM | NAO]
\</context\_sufficient\>
\<missing\_information\>
[Se NAO, descreva exatamente qual informação está faltando e como ela impede o avanço. Se SIM, deixe vazio.]
\</missing\_information\>
```
````
