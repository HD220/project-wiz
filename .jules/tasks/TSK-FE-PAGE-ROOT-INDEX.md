# Tarefa: FE-PAGE-ROOT-INDEX - Implementar index.tsx da raiz das páginas (lógica de redirect).

**ID da Tarefa:** `FE-PAGE-ROOT-INDEX`
**Título Breve:** Implementar `index.tsx` da raiz das páginas (lógica de redirect).
**Descrição Completa:**
Implementar o arquivo `index.tsx` na raiz do diretório de rotas (ex: `src_refactored/presentation/ui/routes/index.tsx`). Este arquivo geralmente contém lógica para redirecionar o usuário para uma página padrão apropriada (ex: para `/home` se não autenticado, ou para `/project` ou `/user/dashboard` se autenticado).

---

**Status:** `Concluído`
**Dependências (IDs):** `FE-SETUP-003` (Configuração do TanStack Router)
**Complexidade (1-5):** `1`
**Prioridade (P0-P4):** `P1` (Comportamento de entrada na aplicação)
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/fe-page-root-index`
**Commit da Conclusão (Link):** `(Link para o commit no branch feat/fe-page-root-index após o push)`

---

## Critérios de Aceitação
- Arquivo `index.tsx` criado na raiz do diretório de rotas (`src_refactored/presentation/ui/routes/index.tsx`). **(Concluído)**
- Implementa lógica de redirecionamento usando as APIs do TanStack Router (`<Navigate />`). **(Concluído)**
- Redireciona para a página pública padrão (definida como `/onboarding`) se o usuário não estiver autenticado (usando placeholder de autenticação). **(Concluído)**
- Placeholder para redirecionamento de usuário autenticado está presente. **(Concluído)**
- A lógica de verificação de autenticação é um placeholder (`const isAuthenticated = false;`). **(Concluído)**

---

## Notas/Decisões de Design
- A lógica de redirecionamento utiliza `<Navigate to="/onboarding" replace />` para usuários não autenticados.
- A verificação de autenticação é um placeholder (`const isAuthenticated = false;`) e precisará ser substituída por uma lógica real de autenticação.
- O componente foi exportado usando `createFileRoute('/')` para integração com o TanStack Router.
- O alvo de redirecionamento para usuários autenticados é atualmente um log, pois as rotas autenticadas ainda não foram definidas.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`
- `(Data Atual): Implementada e submetida a página raiz de índice com lógica de redirecionamento básica.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
