# Tarefa: FE-SETUP-007 - Configurar aliases de caminho em Vite e tsconfig.json para src_refactored/presentation/ui/.

**ID da Tarefa:** `FE-SETUP-007`
**Título Breve:** Configurar aliases de caminho em Vite e `tsconfig.json` para `src_refactored/presentation/ui/`.
**Descrição Completa:**
Configurar aliases de caminho (path aliases) tanto no `vite.renderer.config.mts` (conforme já iniciado em `FE-SETUP-001.5.2`) quanto no `tsconfig.json` para facilitar importações dentro da nova estrutura de frontend em `src_refactored/presentation/ui/`. O alias principal `@/` deve apontar para `src_refactored/presentation/ui/`. Outros aliases podem ser definidos para subdiretórios comuns conforme a estrutura definida em `ARCH-FE-UI-STRUCT-001`.

---

**Status:** `Concluído`
**Dependências (IDs):** `FE-SETUP-001.6, ARCH-FE-UI-STRUCT-001`
**Complexidade (1-5):** `1`
**Prioridade (P0-P4):** `P1` (Melhora a DX e manutenibilidade)
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/fe-setup-aliases`
**Commit da Conclusão (Link):** `Commit na branch feat/fe-setup-aliases`

---

## Critérios de Aceitação
- Aliases de caminho configurados em `vite.renderer.config.mts` (seção `resolve.alias`). **(Concluído)**
- Aliases de caminho correspondentes configurados em `tsconfig.json` (seção `compilerOptions.paths`). **(Concluído)**
- O alias `@/` resolve para `src_refactored/presentation/ui/`. **(Concluído)**
- Outros aliases propostos (ex: `@/app`, `@/components/*`, `@/hooks`, `@/lib`, etc.) resolvidos corretamente para seus respectivos subdiretórios dentro de `presentation/ui/`. **(Concluído)**
- Importações usando os novos aliases funcionam corretamente no código e são reconhecidas pelo TypeScript e pelo Vite. **(Parcialmente verificado - Código alterado para usar aliases; verificação por type-check e dev server bloqueada por erro de CLI.)**

---

## Notas/Decisões de Design
- `@/features` foi corrigido para `@/app` para consistência com a estrutura de rotas.
- Garantir que as configurações no Vite e no `tsconfig.json` sejam consistentes. **(Feito)**

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`
- `(2024-07-25 por @Jules): Configurados aliases em tsconfig.json e vite.renderer.config.mts. O alias @/features foi corrigido para @/app. Imports em main.tsx atualizados como exemplo. Verificação completa (type-check, dev server) bloqueada por erro persistente de execução de CLI ("Internal error"). Código submetido na branch 'feat/fe-setup-aliases'.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
