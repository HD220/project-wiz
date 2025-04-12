# Refatorar use-github-token-manager para Clean Code e Testabilidade

## Arquivo alvo
`src/client/hooks/use-github-token-manager.ts`

## Problemas identificados

- **Violação do Princípio da Responsabilidade Única (SRP):**
  - Os callbacks `onSave` e `onRemove` misturam lógica de UI (toasts, loading), controle de estado e chamada de serviço.
  - Isso dificulta a manutenção e a compreensão do código.

- **Testabilidade prejudicada:**
  - A mistura de responsabilidades torna difícil isolar e testar cada parte da lógica.
  - Não é possível testar a validação do token ou o controle de loading de forma independente.

## O que precisa ser refatorado

- Extrair a lógica de toast e loading para funções auxiliares reutilizáveis.
- Separar a validação do token em uma função pura, sem dependências de UI.
- Isolar a atualização do status do token em uma função dedicada, facilitando o teste unitário.
- Garantir que cada função tenha uma única responsabilidade clara.

## Critérios de aceitação

- O hook deve ser modular, com funções puras para validação e atualização de status.
- A lógica de UI (toasts, loading) deve ser desacoplada da lógica de negócio.
- O código deve ser facilmente testável com mocks.
- Manter compatibilidade funcional com o comportamento atual.