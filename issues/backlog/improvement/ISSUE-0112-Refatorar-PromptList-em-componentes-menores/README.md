# Refatorar PromptList em componentes menores

## Contexto
O componente `PromptList.tsx` possui cerca de 80 linhas, misturando filtro, toolbar e renderização da lista, violando princípios de responsabilidade única.

## Problemas
- Função um pouco longa
- Responsabilidades múltiplas
- Dificuldade de manutenção e testes

## Objetivos
- Melhorar legibilidade e manutenibilidade
- Separar responsabilidades
- Facilitar testes unitários

## Recomendações
- Extrair componentes menores para:
  - Toolbar de ações e busca (`PromptListToolbar`)
  - Lista de prompts (`PromptListItems`)
  - Item individual (`PromptListItem`)
- Manter interface clara entre componentes filhos e a lista principal

## Escopo
- Apenas refatoração estrutural
- Não alterar funcionalidades
- Não adicionar comentários ou testes

## Critérios de aceitação
- `PromptList` deve ter menos de 50 linhas
- Cada parte deve estar em componente próprio
- Funcionalidade preservada