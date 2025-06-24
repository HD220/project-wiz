# Tarefa: FE-SETUP-007 - Configurar aliases de caminho em Vite e tsconfig.json para src_refactored/presentation/ui/.

**ID da Tarefa:** `FE-SETUP-007`
**Título Breve:** Configurar aliases de caminho em Vite e `tsconfig.json` para `src_refactored/presentation/ui/`.
**Descrição Completa:**
Configurar aliases de caminho (path aliases) tanto no `vite.renderer.config.mts` (conforme já iniciado em `FE-SETUP-001.5.2`) quanto no `tsconfig.json` para facilitar importações dentro da nova estrutura de frontend em `src_refactored/presentation/ui/`. O alias principal `@/` deve apontar para `src_refactored/presentation/ui/`. Outros aliases podem ser definidos para subdiretórios comuns conforme a estrutura definida em `ARCH-FE-UI-STRUCT-001`.

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-SETUP-001.6, ARCH-FE-UI-STRUCT-001`
**Complexidade (1-5):** `1`
**Prioridade (P0-P4):** `P1` (Melhora a DX e manutenibilidade)
**Responsável:** `Frontend` (Originalmente, mas Jules pode iniciar)
**Branch Git Proposta:** `feat/fe-setup-aliases`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Aliases de caminho configurados em `vite.renderer.config.mts` (seção `resolve.alias`).
- Aliases de caminho correspondentes configurados em `tsconfig.json` (seção `compilerOptions.paths`).
- O alias `@/` resolve para `src_refactored/presentation/ui/`.
- Outros aliases propostos (ex: `@/components/common`, `@/features/project`, `@/hooks`, `@/lib`, `@/services`, `@/config`, `@/styles`, `@/assets`, `@/types`) resolvidos corretamente para seus respectivos subdiretórios dentro de `presentation/ui/`.
- Importações usando os novos aliases funcionam corretamente no código e são reconhecidas pelo TypeScript e pelo Vite.

---

## Notas/Decisões de Design
- Ex: `@/components/common`, `@/features/project`, `@/hooks` (globais), `@/lib`, `@/services`, `@/config`, `@/styles`, `@/assets`, `@/types` todos apontando para subdiretórios de `presentation/ui/`. O alias `@/` apontará para `presentation/ui/`. (Nota original da tarefa)
- Garantir que as configurações no Vite e no `tsconfig.json` sejam consistentes.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
