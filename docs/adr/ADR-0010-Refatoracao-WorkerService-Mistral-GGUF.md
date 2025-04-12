# ADR-0010: Refatoração do WorkerService para Suporte a Modelos Mistral (GGUF) com node-llama-cpp

## Status

- 🔴 **Rejeitado**

---

## Contexto

Foi proposta a refatoração do `WorkerService` para suportar modelos Mistral (GGUF) usando `node-llama-cpp`, garantindo o uso de `utilityProcess.fork` e evitando a criação de um worker para cada modelo. O objetivo era melhorar a eficiência no carregamento e gerenciamento de múltiplos modelos, reduzindo consumo de recursos e aumentando a escalabilidade.

Após análise, a equipe decidiu **não implementar** essa funcionalidade neste momento, priorizando outras features no roadmap atual.

---

## Decisão

A proposta de refatoração do `WorkerService` para suporte a múltiplos modelos GGUF com gerenciamento dinâmico foi rejeitada. O time optou por manter a arquitetura atual e focar em demandas mais prioritárias.

---

## Consequências

- Não haverá suporte dedicado a múltiplos modelos GGUF via gerenciamento dinâmico no `WorkerService`.
- O consumo de recursos e escalabilidade permanecem conforme a arquitetura vigente.
- Redução de complexidade e esforço de implementação neste momento.

---

## Alternativas Consideradas

- **Criar um worker para cada modelo** — descartado devido ao alto consumo de recursos e baixa escalabilidade.
- **Usar um pool de workers** — descartado pela complexidade adicional no gerenciamento do pool e distribuição das tarefas.
- **Implementar gerenciamento dinâmico de modelos em um único worker** — rejeitado por não ser prioridade no momento.

---

## Links Relacionados

- [ISSUE-0103 - Refatoração WorkerService para Mistral GGUF](../../issues/completed/improvement/ISSUE-0103-Refatorar-WorkerService-Mistral-GGUF/README.md)