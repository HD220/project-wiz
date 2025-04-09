# Refatorar PromptManager: extrair hook e componentes

## Contexto
O componente `PromptManager.tsx` possui quase 200 linhas, misturando lógica de controle, operações CRUD, exportação/importação, geração de link e renderização condicional, violando princípios de Clean Code e Clean Architecture.

## Problemas
- Função muito longa
- Muitas responsabilidades
- Mistura lógica de negócio com UI
- Dificuldade de manutenção e testes

## Objetivos
- Melhorar legibilidade e manutenibilidade
- Separar responsabilidades
- Facilitar testes unitários
- Preparar para separar lógica da UI

## Recomendações
- Extrair um hook `usePromptManager` para gerenciar:
  - Estado global (prompts, loading, erros, mensagens)
  - Operações CRUD
  - Exportação/importação
  - Geração de link
- Dividir renderização em componentes menores:
  - Toolbar e mensagens
  - Lista de prompts
  - Formulário de criação/edição
- Mover funções utilitárias para arquivos separados
- Manter interface clara entre hook e componentes

## Escopo
- Apenas refatoração estrutural
- Não alterar funcionalidades
- Não mover lógica para camada de aplicação ainda (será feito em outra issue)

## Critérios de aceitação
- `PromptManager` deve ter menos de 50 linhas
- Hook `usePromptManager` criado e utilizado
- Renderização dividida em componentes menores
- Funcionalidade preservada