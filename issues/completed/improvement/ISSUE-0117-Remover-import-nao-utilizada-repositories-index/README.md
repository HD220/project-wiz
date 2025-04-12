# Remover importação não utilizada em `repositories/index.tsx`

## Descrição
O arquivo `src/client/pages/repositories/index.tsx` importa o componente `Dashboard`, porém essa importação não é utilizada no código. Isso gera código morto, aumenta o ruído e pode confundir durante a manutenção.

## Critérios de aceitação
- Remover a importação do `Dashboard`
- Garantir que a página continue funcionando normalmente após a remoção
- Não alterar outras funcionalidades da página ou do projeto

## Classificação
- **Tipo:** melhoria
- **Status:** backlog
- **Prioridade:** baixa