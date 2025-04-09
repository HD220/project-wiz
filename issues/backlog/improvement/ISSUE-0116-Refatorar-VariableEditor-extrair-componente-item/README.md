# Refatorar VariableEditor: extrair componente para item

## Contexto
O componente `VariableEditor.tsx` possui cerca de 100 linhas, misturando manipulação da lista de variáveis e renderização de cada item, violando princípios de Clean Code.

## Problemas
- Função longa
- Responsabilidades múltiplas
- Mistura manipulação da lista com renderização detalhada
- Dificuldade de manutenção e testes

## Objetivos
- Melhorar legibilidade e manutenibilidade
- Separar responsabilidades
- Facilitar testes unitários

## Recomendações
- Extrair componente para item da variável (`VariableItemEditor`)
- Manter no componente principal apenas a manipulação da lista
- Manter interface clara entre componente pai e itens

## Escopo
- Apenas refatoração estrutural
- Não alterar funcionalidades
- Não adicionar comentários ou testes

## Critérios de aceitação
- `VariableEditor` deve ter menos de 50 linhas
- Item da variável extraído em componente próprio
- Funcionalidade preservada