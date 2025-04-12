# ISSUE-0191: Exportação dupla em componentes

## Descrição do problema
Foi identificado o uso de exportação dupla (exportação nomeada e default) em componentes, o que pode causar confusão, dificultar a manutenção e gerar inconsistências na importação dos componentes.

### Exemplo concreto
- Arquivo: `src/client/components/ui/AutoUpdateSwitch.tsx`
```tsx
export function AutoUpdateSwitch(props) { ... }
export default AutoUpdateSwitch;
```

## Recomendação de correção/refatoração
Padronizar para exportação única por arquivo, preferencialmente exportação nomeada, conforme as melhores práticas de organização de componentes React. Atualizar todos os imports para refletir a mudança.

## Justificativa
- **ADR-0012**: Clean Architecture — clareza e padronização na estrutura de código.
- **SDR-0001**: Facilita manutenção, automação e evita ambiguidade.

## Contexto para execução autônoma
- Remover exportação dupla dos componentes.
- Padronizar para exportação única (preferencialmente nomeada).
- Atualizar todos os imports e referências.