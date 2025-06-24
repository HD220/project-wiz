# Tarefa: FE-SETUP-003 - Instalar e configurar Tanstack Router.

**ID da Tarefa:** `FE-SETUP-003`
**Título Breve:** Instalar e configurar Tanstack Router.
**Descrição Completa:**
Instalar a biblioteca Tanstack Router (React Location foi o predecessor, mas o TanStack Router é o sucessor) e configurar a estrutura de roteamento base para a nova aplicação frontend. Isso inclui a configuração da geração do `routeTree.gen.ts` e a criação da estrutura inicial de arquivos de rota em `src_refactored/presentation/ui/`.

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-SETUP-001.6`
**Complexidade (1-5):** `2`
**Prioridade (P0-P4):** `P0` (Essencial para navegação)
**Responsável:** `Frontend` (Originalmente, mas Jules pode iniciar)
**Branch Git Proposta:** `feat/fe-setup-tanstack-router`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Pacotes do TanStack Router (`@tanstack/react-router`, `@tanstack/router-vite-plugin`) instalados.
- Plugin do Vite para TanStack Router configurado em `vite.renderer.config.mts` (conforme `FE-SETUP-001.5.3`).
- Estrutura de diretórios para rotas criada (ex: `src_refactored/presentation/ui/routes/` ou `pages/`).
- Arquivo raiz de rotas (ex: `__root.tsx`) criado.
- Geração do `routeTree.gen.ts` funcionando.
- Uma rota de exemplo simples (ex: `/`) renderizando um componente placeholder.

---

## Notas/Decisões de Design
- Configurar `routeTree.gen.ts` e estrutura de rotas base em `presentation/ui/`. (Nota original da tarefa)

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
