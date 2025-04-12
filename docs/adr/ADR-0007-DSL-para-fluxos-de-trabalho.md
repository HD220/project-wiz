# ADR-0007: DSL para fluxos de trabalho

## Status

- 🔴 **Rejeitado**

---

## Contexto

Foi discutida a possibilidade de definir uma DSL (Domain Specific Language) para representar fluxos de trabalho que automatizariam tarefas de desenvolvimento, visando facilitar a criação, edição e execução desses fluxos. A proposta incluía o uso de formatos como JSON ou YAML para definição dos fluxos.

---

## Decisão

Após análise, a equipe decidiu **não implementar** uma DSL para fluxos de trabalho neste momento, priorizando outras funcionalidades no roadmap do projeto. A complexidade adicional e o esforço de manutenção não se justificam frente às prioridades atuais.

---

## Consequências

- Não haverá uma DSL dedicada para fluxos de trabalho no projeto.
- O foco permanece nas funcionalidades já priorizadas.
- Redução de complexidade e esforço de manutenção.

---

## Alternativas Consideradas

- Implementar uma DSL baseada em JSON ou YAML — rejeitado por não ser prioridade e aumentar a complexidade.
- Manter o fluxo de trabalho manual ou com scripts simples — mantido como abordagem atual.

---

## Links Relacionados

- [Discussão original sobre DSL para fluxos de trabalho](../../issues/backlog/feature/ISSUE-0033-Implementar-fluxos-de-trabalho/README.md)