# Handoff - ISSUE-0187: Hooks e componentes com nomes fora do padrão kebab-case

## O que foi feito

- Todos os arquivos de hooks e componentes listados foram renomeados para o padrão kebab-case, conforme ADR-0015.
- Todos os imports e referências no projeto foram atualizados para refletir os novos nomes.

## Arquivos renomeados

- `src/client/hooks/useAuth.ts` → `use-auth.ts`
- `src/client/components/ui/AutoUpdateSwitch.tsx` → `auto-update-switch.tsx`
- `src/client/components/ui/ConfigSlider.tsx` → `config-slider.tsx`
- `src/client/components/ui/ModelSelect.tsx` → `model-select.tsx`

## Arquivos modificados

- `src/client/components/auth/AuthProvider.tsx` (import atualizado)
- `src/client/components/model-configuration.tsx` (imports atualizados)

## Validação

- Todos os arquivos seguem o padrão kebab-case.
- Todos os imports e referências foram revisados e atualizados.
- O projeto está padronizado conforme as regras de nomenclatura.

## Pendências

- Nenhuma. Issue concluída conforme escopo.