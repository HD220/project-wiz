# ISSUE-0118 - Refatorar `repository-settings.tsx` em subcomponentes e hooks

---

## Contexto

O componente `src/client/components/repository-settings.tsx` possui cerca de 330 linhas e concentra múltiplas responsabilidades, contrariando o plano de Clean Architecture documentado em `docs/refatoracao-clean-architecture/README.md` e ADR-0008. Outras partes do plano já foram aplicadas, restando esta como a maior pendência.

---

## Problema

Atualmente, o componente mistura:

- Listagem e seleção de repositórios
- Configurações gerais
- Configurações de automações
- Gerenciamento de tokens
- Gerenciamento de permissões

Isso dificulta manutenção, testes e evolução.

---

## Objetivo

Dividir o componente em subcomponentes menores e hooks dedicados, mantendo as funcionalidades intactas, para melhorar legibilidade, modularidade e aderência à Clean Architecture.

---

## Critérios de Aceitação

- [ ] Extrair **cada seção funcional** em um **subcomponente React** independente, por exemplo:
  - `<RepositoryList />`
  - `<RepositoryGeneralSettings />`
  - `<RepositoryAutomations />`
  - `<RepositoryTokens />`
  - `<RepositoryPermissions />`
- [ ] Extrair **lógicas de estado, efeitos e manipulação de dados** para **hooks customizados** em `src/client/hooks/`, como:
  - `useRepositoryList`
  - `useRepositorySettings`
  - `useRepositoryAutomations`
  - `useRepositoryTokens`
  - `useRepositoryPermissions`
- [ ] O componente principal deve apenas orquestrar os subcomponentes, sem conter lógica complexa.
- [ ] Manter todas as funcionalidades existentes, sem regressões.
- [ ] Melhorar a legibilidade e facilitar manutenção futura.
- [ ] Atualizar imports e integrações conforme necessário.
- [ ] Seguir princípios Clean Code: funções pequenas, nomes descritivos, SOLID, DRY.
- [ ] Garantir que o código resultante seja facilmente testável.

---

## Benefícios

- Código mais limpo, modular e compreensível
- Facilidade para manutenção e evolução
- Facilidade para criação de testes unitários
- Alinhamento com o plano de Clean Architecture

---

## Prioridade

**Alta** — maior pendência do plano de refatoração.

---

## Notas

- Consultar documentação em `docs/refatoracao-clean-architecture/`
- Seguir padrões definidos nas ADRs, especialmente ADR-0008
- Documentar decisões e pontos de atenção no handoff da issue

---

## Status

**Backlog**