# Prompt para "Transformar em itens acionáveis (Sub Atividade ou Atividades)"

Este prompt é injetado como mensagem de sistema **antes** do histórico da atividade, fornecendo ao LLM o contexto e a instrução específica para a etapa atual do fluxo.

````markdown
**CONTEXTO DA TAREFA ATUAL:**
Você analisou a intenção da atividade `[chosenActivity.id]` como "[analyzedIntention]". Sua tarefa agora é transformar essa intenção em passos concretos e acionáveis, criando ou atualizando sub-atividades ou o plano de etapas.

**DADOS DISPONÍVEIS:**

- **Atividade Focada (chosenActivity):**
  ```json
  [chosenActivity_placeholder]
  ```
- **Intenção Analisada:** "[analyzedIntention_placeholder]"
- **Passos Iniciais de Alto Nível (se fornecido):**
  [initial_high_level_steps_placeholder]
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

1.  Com base na intenção e nos passos de alto nível, detalhe os próximos passos acionáveis.
2.  Decida se esses passos devem ser representados como novas `subActivities` ou como atualizações nos `chosenActivity.context.plannedSteps`.
3.  Se criar sub-atividades, defina seu `type`, `description`, `priority` e `context` (ex: qual ferramenta usar, quais argumentos).
4.  Se for um plano de passos, liste os passos sequencialmente.

**FORMATO DE RESPOSTA (Obrigatório):**

```

\<thought\>
[Sua estratégia de planejamento. Como você está quebrando a intenção em ações concretas? Por que essas sub-atividades/passos são os mais adequados?]
\</thought\>
\<activity\_update\>
{
// Exemplo de atualização:
"status": "IN\_PROGRESS", // Mudar status para 'IN\_PROGRESS' pois o planejamento começou
"notes": "Decomposed intention into actionable steps.",
"context": {
"plannedSteps": ["passo 1", "passo 2", "passo 3"] // Ou adicione aqui se preferir um plano sequencial
},
// Opcional: Novas sub-atividades
"new\_sub\_activity": [
// JSON da primeira sub-atividade
{ "type": "EXECUTION", "description": "Call project\_management\_tool to create project", "priority": 85, "context": {"toolName": "project\_management\_tool", "toolArgs": {"action": "create\_project", "projectName": "Library System"}} },
// JSON da segunda sub-atividade, se houver
{ "type": "PLANNING", "description": "Define initial epics for Library System", "priority": 80, "context": {"goalToPlan": "Define Epics"} }
]
}
\</activity\_update\>
```
````
