# ADR-0018: Persistência do Estado da Sessão do Controle de Sessões LLM

## Status

- 🟢 **Aceito**

---

## Contexto

O sistema de controle de sessões LLM requer a capacidade de pausar, cancelar, restaurar e exibir o status de sessões de geração de texto. Para garantir a continuidade e integridade dessas operações, é necessário persistir o estado da sessão, permitindo que o usuário retome sessões mesmo após reiniciar a aplicação.

Duas abordagens principais foram consideradas para a persistência do estado da sessão:
- **Local Storage** (armazenamento local do navegador)
- **Arquivo** (persistência no sistema de arquivos, preferencialmente via banco de dados já adotado)

---

## Decisão

A persistência do estado da sessão do controle de sessões LLM será realizada em **arquivo**, utilizando preferencialmente o mecanismo já adotado para histórico de conversas (SQLite via Drizzle). A lógica de persistência ficará centralizada no backend/main process, garantindo robustez, integridade e alinhamento arquitetural.

---

## Consequências

**Positivas:**
- Centralização da lógica de persistência no backend/main process.
- Maior robustez e integridade dos dados de sessão.
- Facilidade para futuras integrações, backup e restauração.
- Alinhamento com Clean Architecture e práticas já adotadas no projeto.
- Permite integração transparente entre frontend e backend via IPC.

**Negativas:**
- Requer implementação de contratos e adaptadores de infraestrutura.
- Demanda testes e documentação adicionais.

---

## Alternativas Consideradas

- **Local Storage** — simples de implementar no frontend, mas limitado ao contexto do navegador/renderer, não cobre múltiplos usuários/janelas e não é robusto para backup/restauração.
- **Arquivo (SQLite/Drizzle ou JSON)** — permite persistência robusta e transacional, alinhada à arquitetura já adotada.

---

## Links Relacionados

- [ISSUE-0072 - Persistência do estado da sessão LLM](../../issues/backlog/improvement/ISSUE-0072-Definir-e-implementar-processo-deploy/README.md)