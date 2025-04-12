# Handoff - ISSUE-0245

**Status:** Em andamento  
**Responsável:** Code Mode (Roo)  
**Data de início:** 2025-04-12  
**Ação:** Refatoração do utilitário `sidebar-items.tsx` para separar dados de navegação da lógica de apresentação, conforme Clean Architecture (ADR-0012).

---

## Progresso e decisões

- Analisado o arquivo `src/client/lib/sidebar-items.tsx` e identificada violação de clean code: mistura de dados (rotas) com lógica de apresentação (JSX, ícones, tradução).
- Refatorado `sidebar-items.tsx` para conter apenas dados puros e serializáveis: `to` (rota), `labelKey` (chave de tradução), `iconId` (identificador do ícone).
- Removidas todas as referências a JSX, React, ícones e funções de tradução do utilitário.
- Atualizada a tipagem para refletir apenas os dados.
- Atualizada a camada de apresentação (`src/client/components/sidebar.tsx`) para:
  - Mapear `iconId` para o componente de ícone correspondente.
  - Traduzir `labelKey` usando o sistema de i18n (`i18n._(labelKey)`).
  - Passar o JSX correto para o componente `SidebarLink`.
- Garantida aderência às regras de Clean Code e Clean Architecture (ADR-0012).
- Não foram realizadas alterações fora do escopo da issue.

---

## Próximos passos

- Validar visualmente e funcionalmente a sidebar após a refatoração.
- Se necessário, ajustar testes ou documentação relacionada.

---