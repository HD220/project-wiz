# Handoff – ISSUE-0191: Exportação dupla em componentes

**Data:** 2025-04-12  
**Responsável:** Code Mode (Roo)

## Ação Realizada
- Removida a exportação dupla (default + nomeada) dos componentes:
  - `src/client/components/ui/auto-update-switch.tsx`
  - `src/client/components/ui/config-slider.tsx`
  - `src/client/components/ui/model-select.tsx`
- Padronizado para exportação única nomeada em todos os arquivos citados.
- Todos os imports desses componentes já utilizavam a forma nomeada, não sendo necessária nenhuma alteração adicional nos pontos de uso.

## Justificativa
- Alinhamento com as melhores práticas de exportação de componentes React.
- Conformidade com **ADR-0012** (Clean Architecture) e **SDR-0001** (padrão de código).
- Eliminação de possíveis warnings e inconsistências de importação.

## Registro de Movimentação
- [2025-04-12] Issue movida de `backlog/improvement` para `completed/improvement` após conclusão da padronização.

## Próximos Passos
- Nenhuma ação pendente. Issue finalizada.