# Prompt para "Coleta de Contexto"

Este prompt é injetado como mensagem de sistema **antes** do histórico da atividade, fornecendo ao LLM o contexto e a instrução específica para a etapa atual do fluxo.

````markdown
**CONTEXTO DA TAREFA ATUAL:**
A atividade `[chosenActivity.id]` com a descrição "[chosenActivity.description]" está bloqueada porque a seguinte informação está faltando: "[missingInformation]". Sua tarefa é decidir a melhor forma de coletar esta informação.

**DADOS DISPONÍVEIS:**

- **Atividade Bloqueada (chosenActivity):**
  ```json
  [chosenActivity_placeholder]
  ```
- **Informação Faltante:** "[missingInformation_placeholder]"
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

1.  Com base na `missingInformation` e no seu papel, determine o método mais eficaz para obtê-la. Isso pode ser:
    - Fazer uma pergunta ao usuário.
    - Fazer uma pergunta a outro agente.
    - Consultar uma ferramenta ou banco de dados (se houver ferramenta para isso).
    - Criar uma sub-atividade `INFORMATION_GATHERING`.
2.  Formule a ação necessária para obter a informação.

**FORMATO DE RESPOSTA (Obrigatório):**

```

\<thought\>
[Sua análise sobre a melhor forma de coletar a informação, considerando as ferramentas e canais de comunicação disponíveis.]
\</thought\>
\<activity\_update\>
[JSON da atualização da atividade, ex: {"status": "BLOCKED", "blockingActivityId": "new\_info\_gathering\_activity\_id"}]
\</activity\_update\>
\<action\_to\_gather\_info\>
[Escolha UMA das opções abaixo:]
\<message\_to\_user\>
[Mensagem para o usuário solicitando a informação.]
\</message\_to\_user\>
OU
\<message\_to\_agent\>
[ID\_DO\_AGENTE]: [Mensagem para outro agente solicitando a informação.]
\</message\_to\_agent\>
OU
\<tool\_code\>
[JSON da chamada da ferramenta para coletar informação.]
\</tool\_code\>
OU
\<new\_sub\_activity\>
[JSON da nova sub-atividade de tipo INFORMATION\_GATHERING.]
\</new\_sub\_activity\>
\</action\_to\_gather\_info\>
```
````
