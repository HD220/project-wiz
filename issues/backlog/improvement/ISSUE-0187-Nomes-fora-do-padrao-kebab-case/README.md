# ISSUE-0187: Hooks e componentes com nomes fora do padrão kebab-case

## Descrição do problema
Foram identificados hooks e componentes com nomes de arquivos fora do padrão kebab-case, o que viola a convenção definida no projeto e dificulta a padronização, automação e manutenção do código.

### Exemplos concretos
- Arquivo: `src/client/hooks/useAuth.ts`
- Arquivo: `src/client/components/ui/AutoUpdateSwitch.tsx`
- Arquivo: `src/client/components/ui/ConfigSlider.tsx`
- Arquivo: `src/client/components/ui/ModelSelect.tsx`

## Recomendação de correção/refatoração
Renomear todos os arquivos de hooks e componentes para o padrão kebab-case, conforme definido em ADR-0015. Atualizar todos os imports no projeto para refletir os novos nomes.

## Justificativa
- **ADR-0015**: Uso obrigatório de kebab-case para nomes de arquivos e pastas.
- **SDR-0001**: Padronização e clareza no código-fonte.
- **Regras Gerais**: Facilita automação, busca e manutenção.

## Contexto para execução autônoma
- Renomear arquivos listados para kebab-case.
- Atualizar todos os imports e referências.
- Garantir que novos arquivos sigam o padrão.