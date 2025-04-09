# Refatorar PromptPreview: extrair hook e componentes

## Contexto
O componente `PromptPreview.tsx` possui cerca de 90 linhas, misturando lógica assíncrona para geração do preview e renderização dinâmica de inputs, violando princípios de Clean Code.

## Problemas
- Função longa
- Responsabilidades múltiplas
- Mistura lógica assíncrona com UI
- Dificuldade de manutenção e testes

## Objetivos
- Melhorar legibilidade e manutenibilidade
- Separar responsabilidades
- Facilitar testes unitários

## Recomendações
- Extrair um hook `usePromptPreview` para:
  - Gerar o preview de forma assíncrona
  - Gerenciar estado do preview
- Extrair componente para inputs dinâmicos (`PromptVariableInputs`)
- Manter interface clara entre hook, inputs e preview

## Escopo
- Apenas refatoração estrutural
- Não alterar funcionalidades
- Não adicionar comentários ou testes

## Critérios de aceitação
- `PromptPreview` deve ter menos de 50 linhas
- Hook `usePromptPreview` criado e utilizado
- Inputs dinâmicos extraídos em componente próprio
- Funcionalidade preservada