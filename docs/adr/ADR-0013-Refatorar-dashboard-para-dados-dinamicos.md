# ADR-0013: Refatorar Dashboard para Buscar Dados Dinamicamente via IPC

## Status

- 🟢 **Aceito**

---

## Contexto

O componente `dashboard.tsx` utilizava valores fixos (hardcoded) para exibir métricas como número de issues, PRs, arquivos gerados, status do modelo e atividades recentes. Isso limitava a utilidade do dashboard, que não refletia o estado real do sistema.

---

## Decisão

Refatorar o componente `dashboard.tsx` para buscar todos os dados dinamicamente, utilizando integração IPC com o backend Electron. Serão criados canais IPC específicos para cada métrica, e o backend será responsável por fornecer os dados, integrando-se com serviços internos ou externos conforme necessário.

---

## Consequências

- O dashboard refletirá o estado real do sistema, melhorando a experiência do usuário.
- A arquitetura baseada em IPC mantém a separação entre frontend e backend.
- Inicialmente, os dados podem ser mockados no backend para facilitar a implementação incremental.
- Futuramente, os handlers podem ser expandidos para buscar dados reais de APIs externas ou serviços internos.

---

## Alternativas Consideradas

- **Utilizar API REST HTTP** — descartado para manter integração via IPC.
- **Manter dados fixos** — descartado por não atender aos requisitos de atualização dinâmica.

---

## Links Relacionados

- [ISSUE-0138 - Refatorar dashboard para dados dinâmicos](../../issues/backlog/improvement/ISSUE-0138-Refatorar-dashboard-para-dados-dinamicos/README.md)