# ADR-0019: Protocolo Oficial do Modo Orchestrator

## Status

- 🟡 **Proposto**

---

## Contexto

O modo Orchestrator é um componente crítico do sistema, responsável por decompor tarefas complexas e coordenar outros modos especializados. Para garantir consistência e eficiência na execução de tarefas, é necessário estabelecer um protocolo oficial que defina:

1. O processo de decomposição hierárquica de tarefas
2. Os templates de comunicação padronizados
3. O fluxo de trabalho esperado

---

## Decisão

Estabelecer o seguinte protocolo oficial para o modo Orchestrator:

### 1. Decomposição Hierárquica Obrigatória
- Todo plano deve conter:
  - 1+ tarefas macro
  - Cada macro deve ser delegada para sub-orchestrator
  - Sub-orchestrators podem decompor ainda mais

### 2. Templates de Comunicação

#### Para Delegar Tarefas (`new_task`):
```markdown
[TASK]
Descrição clara e específica da tarefa

[RELEVANT COMPLETE CONTEXT]
Todo contexto necessário para executar a tarefa

[EXPECTED OUTPUT FILES] (Opcional)
Lista de arquivos/resultados esperados

[EXPECTED RETURN]
Formato esperado da resposta
```

#### Para Resultados (`attempt_completion`):
```markdown
[EXPECTED RETURN RESPONSE]
Resposta no formato solicitado

[ANY OTHER ADDITIONAL INFORMATION]
Qualquer informação relevante adicional

[SUGGESTIONS] (Opcional)
Recomendações para próximos passos
```

### 3. Fluxo de Trabalho
1. Recebe tarefa principal
2. Cria plano hierárquico
3. Para cada macro:
   - Envia para sub-orchestrator usando template
   - Aguarda retorno formatado
4. Consolida resultados

---

## Consequências

**Positivas:**
- Padronização da comunicação entre modos
- Maior clareza na decomposição de tarefas
- Melhor rastreabilidade de decisões

**Negativas:**
- Curva de aprendizado inicial para novos modos
- Necessidade de atualizar documentação existente

---

## Alternativas Consideradas

- **Manter processo ad-hoc** — Rejeitado por criar inconsistências na comunicação
- **Usar formatos livres** — Rejeitado por dificultar a automação e análise

---

## Links Relacionados

- [ADR-0004: Estrutura de Documentação](../adr/ADR-0004-Estrutura-de-Documentacao.md)
- [ADR-0017: Gerenciamento de Streams de Requisições LLM](../adr/ADR-0017-Gerenciamento-Streams-Requisicoes-LlmService.md)