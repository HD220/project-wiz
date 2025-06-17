# Prompt para "Geração da Saída"

Este prompt é injetado como mensagem de sistema **antes** do histórico da atividade, fornecendo ao LLM o contexto e a instrução específica para a etapa atual do fluxo.

````markdown
**CONTEXTO DA TAREFA ATUAL:**
A atividade/sub-tarefa `[chosenActivity.id]` ([chosenActivity.description]) atingiu um ponto de conclusão ou requer uma saída direta (mensagem/resultado final). Seu objetivo é gerar a comunicação final ou a saída correspondente a esta etapa.

**DADOS DISPONÍVEIS:**

- **Atividade/Sub-tarefa Concluída/Saída:**
  ```json
  [chosenActivity_placeholder]
  ```
- **Resultado Final da Ação (se houver):**
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

1.  Com base na conclusão da atividade/sub-tarefa e no resultado final, formule a saída apropriada.
2.  Decida se é uma mensagem para o usuário, uma mensagem para outro agente, ou se a saída já foi gerada e este passo é apenas para confirmação.

**FORMATO DE RESPOSTA (Obrigatório):**

```

\<thought\>
[Sua análise sobre a saída a ser gerada. Qual é a mensagem mais eficaz ou o resultado mais relevante a ser comunicado neste ponto?]
\</thought\>
\<activity\_update\>
{
// JSON da atualização da atividade, ex: {"status": "COMPLETED", "notes": "Final output generated."}
}
\</activity\_update\>
[Escolha UMA das opções abaixo, ou \<no\_external\_action/\> se a saída já ocorreu e esta é apenas uma confirmação.]
\<message\_to\_user\>
[Mensagem final para o usuário.]
\</message\_to\_user\>
OU
\<message\_to\_agent\>
[ID\_DO\_AGENTE]: [Mensagem para outro agente com o resultado/próximo passo.]
\</message\_to\_agent\>
OU
\<no\_external\_action/\> // Se o output já foi a ferramenta anterior
```
````
