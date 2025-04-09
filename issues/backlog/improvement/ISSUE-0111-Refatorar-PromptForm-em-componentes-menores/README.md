# Refatorar PromptForm em componentes menores

## Contexto
O componente `PromptForm.tsx` possui cerca de 90 linhas, misturando lógica de estado, validação e renderização de múltiplas seções, violando princípios de Clean Code.

## Problemas
- Função longa demais
- Responsabilidades múltiplas
- Dificuldade de manutenção e testes

## Objetivos
- Melhorar legibilidade e manutenibilidade
- Separar responsabilidades
- Facilitar testes unitários

## Recomendações
- Extrair componentes menores para:
  - Campo nome (`PromptNameInput`)
  - Campo descrição (`PromptDescriptionInput`)
  - Campo conteúdo (`PromptContentInput`)
  - Editor de variáveis (`VariablesSection`)
  - Pré-visualização (`PreviewSection`)
  - Botões (`FormActions`)
- Extrair função de validação para fora do componente
- Manter interface clara entre componentes filhos e o formulário principal

## Escopo
- Apenas refatoração estrutural
- Não alterar funcionalidades
- Não adicionar comentários ou testes

## Critérios de aceitação
- `PromptForm` deve ter menos de 50 linhas
- Cada seção deve estar em componente próprio
- Função de validação separada
- Funcionalidade preservada