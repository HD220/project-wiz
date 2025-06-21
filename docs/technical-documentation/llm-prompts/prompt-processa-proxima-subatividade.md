# Prompt para "Processa Próxima SubAtividade Pendente"

Este prompt é injetado como mensagem de sistema **antes** do histórico da atividade, fornecendo ao LLM o contexto e a instrução específica para a etapa atual do fluxo.

````markdown
**CONTEXTO DA TAREFA ATUAL:**
Você está agora na fase de execução, processando a sub-tarefa "[currentSubtaskDetails.description]" da atividade `[chosenActivity.id]`. Seu objetivo é realizar a ação mais apropriada para completar esta sub-tarefa.

**DADOS DISPONÍVEIS:**

- **Atividade/Sub-tarefa a Ser Processada:**
  ```json
  [chosenActivity_and_currentSubtaskDetails_placeholder]
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

1.  Determine a ação específica necessária para completar esta sub-tarefa (chamar uma ferramenta, enviar uma mensagem, etc.).
2.  Se for uma chamada de ferramenta, formate o JSON da ferramenta.
3.  Se for uma mensagem, formule o conteúdo e o destinatário.
4.  Se for uma atualização puramente interna (ex: marcar um passo como feito sem interação externa), indique `No External Action`.

**FORMATO DE RESPOSTA (Obrigatório):**

```

\<thought\>
[Sua justificativa para a ação escolhida. Como esta ação avança a sub-tarefa?]
\</thought\>
\<activity\_update\>
{
// JSON da atualização da atividade, ex: {"status": "AWAITING\_TOOL\_OUTPUT"}
}
\</activity\_update\>
[Escolha UMA das opções abaixo:]
\<tool\_code\>
[JSON da chamada da ferramenta]
\</tool\_code\>
OU
\<message\_to\_user\>
[Mensagem para o usuário]
\</message\_to\_user\>
OU
\<message\_to\_agent\>
[ID\_DO\_AGENTE]: [Mensagem para outro agente]
\</message\_to\_agent\>
OU
\<no\_external\_action/\>
```
````
