# ISSUE-0190: Componentes atômicos soltos fora de `ui/` ou subpastas temáticas

## Descrição do problema
Componentes atômicos como `export-button.tsx` e `refresh-button.tsx` estão soltos na raiz de `src/client/components/`, quando deveriam estar agrupados em `ui/` ou subpastas temáticas, dificultando a padronização e reutilização.

### Exemplos concretos
- Arquivo: `src/client/components/export-button.tsx`
- Arquivo: `src/client/components/refresh-button.tsx`

## Recomendação de correção/refatoração
Mover componentes atômicos para o diretório `src/client/components/ui/` ou para subpastas temáticas apropriadas. Atualizar todos os imports e garantir que a estrutura reflita a separação entre componentes atômicos e de domínio.

## Justificativa
- **ADR-0002**: Uso de shadcn-ui como biblioteca de componentes UI.
- **ADR-0012**: Clean Architecture — separação clara de responsabilidades.
- **SDR-0001**: Organização modular e manutenção facilitada.

## Contexto para execução autônoma
- Mover os arquivos para `ui/` ou subpastas temáticas.
- Atualizar todos os imports e referências.
- Garantir que novos componentes atômicos sigam o padrão.