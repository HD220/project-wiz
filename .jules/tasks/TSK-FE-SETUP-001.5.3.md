# Tarefa: FE-SETUP-001.5.3 - Ajustar vite.renderer.config.mts - Plugin TanStack Router.

**ID da Tarefa:** `FE-SETUP-001.5.3`
**Título Breve:** Ajustar `vite.renderer.config.mts` - Plugin TanStack Router.
**Descrição Completa:**
Ajustar a configuração do plugin Vite para o TanStack Router (anteriormente React Router) no arquivo `vite.renderer.config.mts`. Especificamente, atualizar as opções `routesDirectory` e `generatedRouteTree` para apontar para a nova localização dos arquivos de rota dentro de `src_refactored/presentation/ui/`.

---

**Status:** `Concluído`
**Dependências (IDs):** `FE-SETUP-001.1`
**Complexidade (1-5):** `1`
**Prioridade (P0-P4):** `P0`
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/fe-setup-vite-config`
**Commit da Conclusão (Link):** `Commit da Conclusão (Link)` (Nota: Link exato não estava no TASKS.md original)

---

## Critérios de Aceitação
- Configuração do plugin TanStack Router Vite atualizada em `vite.renderer.config.mts`.
- `routesDirectory` aponta para o diretório correto onde os arquivos de rota serão criados (ex: `src_refactored/presentation/ui/routes/` ou `src_refactored/presentation/ui/pages/` dependendo da convenção).
- `generatedRouteTree` aponta para o local correto onde o arquivo de árvore de rotas gerado deve ser salvo (ex: `src_refactored/presentation/ui/routeTree.gen.ts`).

---

## Notas/Decisões de Design
- `routesDirectory` e `generatedRouteTree` atualizados para `src_refactored/presentation/ui/`. (Nota original da tarefa, pode precisar de ajuste para um subdiretório específico como `routes` ou `pages`).

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
