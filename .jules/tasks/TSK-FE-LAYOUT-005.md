# Tarefa: FE-LAYOUT-005 - Implementar Layout Público.

**ID da Tarefa:** `FE-LAYOUT-005`
**Título Breve:** Implementar Layout Público
**Descrição Completa:**
Implementar um layout para as seções públicas da aplicação, como a página home (`/home`) ou a página de onboarding (`/onboarding`), se estas necessitarem de um layout visualmente distinto do layout raiz principal (`__root.tsx`). Se as páginas públicas puderem usar o layout raiz diretamente, esta tarefa pode envolver apenas a análise e a decisão documentada.

---

**Status:** `Concluído`
**Dependências (IDs):** `FE-LAYOUT-001` (Layout Raiz)
**Complexidade (1-5):** `2`
**Prioridade (P0-P4):** `P2`
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/fe-layout-public`
**Commit da Conclusão (Link):** `(Link para o commit no branch feat/fe-layout-public após o push)`

---

## Critérios de Aceitação
- Análise realizada para determinar se um layout público separado é necessário. **(Concluído - Decidido criar layout separado)**
- Se necessário, arquivo de layout para seções públicas criado (ex: `src_refactored/presentation/ui/routes/(public)/_layout.tsx`). **(Concluído)**
- O layout público contém os elementos visuais e estruturais apropriados para páginas não autenticadas. **(Concluído - Implementado layout simples centrado)**
- Se não for necessário um layout separado, esta decisão é documentada nas notas da tarefa.

---

## Notas/Decisões de Design
- Decidido criar um layout público separado em `src_refactored/presentation/ui/routes/(public)/_layout.tsx` para flexibilidade futura, mesmo que a implementação inicial seja simples.
- O layout público implementado é um container flex que centraliza o conteúdo, adequado para páginas de onboarding ou landing pages simples.
- Este layout herda os providers globais (ThemeProvider, QueryClientProvider) do `__root.tsx` layout.
- O layout foi exportado usando `createFileRoute` para integração com TanStack Router.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`
- `(Data Atual): Implementado e submetido o layout público básico.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
