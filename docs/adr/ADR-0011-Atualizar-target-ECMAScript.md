# ADR-0011: Migração para ES Modules e Atualização do Target ECMAScript

## Status

- 🔴 **Rejeitado**

---

## Contexto

Foi proposta a migração do projeto para ES Modules (ESM) e atualização do target ECMAScript para `ESNext`, visando melhor compatibilidade com o ecossistema JavaScript moderno, desempenho aprimorado e acesso a novas funcionalidades da linguagem.

Após análise, a equipe decidiu **não implementar** essa migração neste momento, priorizando outras demandas do roadmap e considerando possíveis impactos de compatibilidade e esforço de refatoração.

---

## Decisão

A proposta de migração para ES Modules e atualização do target ECMAScript foi rejeitada. O projeto permanecerá utilizando `commonjs` e `ES2020` até que haja uma necessidade crítica ou mudança de contexto.

---

## Consequências

- O projeto continuará utilizando `commonjs` e `ES2020` como padrão.
- Não haverá necessidade de refatoração de imports/exports ou ajustes em ferramentas de build.
- Possíveis limitações em relação a novas funcionalidades do JavaScript moderno permanecem.

---

## Alternativas Consideradas

- **Migrar para ES Modules e ESNext** — rejeitado por não ser prioridade e pelo risco de incompatibilidade com dependências.
- **Manter configuração atual** — mantido por simplicidade e estabilidade.

---

## Links Relacionados

- [ISSUE-0111 - Proposta de migração para ES Modules](../../issues/backlog/improvement/ISSUE-0111-Refatorar-PromptForm-em-componentes-menores/README.md)