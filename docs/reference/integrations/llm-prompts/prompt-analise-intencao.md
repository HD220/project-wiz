# Prompt para "Analise Intenção"

Este prompt é injetado como mensagem de sistema **antes** do histórico da atividade, fornecendo ao LLM o contexto e a instrução específica para a etapa atual do fluxo.

````markdown
**CONTEXTO DA TAREFA ATUAL:**
Você está analisando a atividade `[chosenActivity.id]` com a descrição "[chosenActivity.description]". Esta atividade tem [chosenActivity.type] e está [chosenActivity.status]. Seu objetivo agora é aprofundar a compreensão da intenção por trás desta atividade e o que precisa ser alcançado.

**DADOS DISPONÍVEIS:**

- **Atividade Focada (chosenActivity):**
  ```json
  [chosenActivity_placeholder]
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

1.  Com base em toda a informação disponível, articule claramente a intenção principal e os resultados esperados para esta atividade.
2.  Identifique quaisquer sub-objetivos ou requisitos implícitos.
3.  Se a atividade não foi decomposta previamente (como uma `USER_REQUEST`), comece a pensar nos passos de alto nível para atingir essa intenção.

**FORMATO DE RESPOSTA (Obrigatório):**

```

\<thought\>
[Sua análise detalhada da intenção. O que o usuário/sistema realmente quer? Quais são os objetivos primários e secundários?]
\</thought\>
\<analyzed\_intention\>
[Descrição clara e concisa da intenção principal e dos resultados esperados.]
\</analyzed\_intention\>
\<initial\_high\_level\_steps\>
[Se esta for uma atividade não decomposta, liste os primeiros 2-3 passos de alto nível que você imagina para cumpri-la. Se já tiver sub-tarefas, reitere o próximo passo planejado ou a meta da sub-tarefa.]
\</initial\_high\_level\_steps\>
```
````
