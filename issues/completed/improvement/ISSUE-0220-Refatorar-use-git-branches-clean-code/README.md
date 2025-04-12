# Refatorar use-git-branches para Clean Code

## Arquivo alvo
`src/client/hooks/use-git-branches.ts`

## Problemas identificados

- **Funções internas aninhadas:** As funções `fetchBranches`, `createBranch`, `switchBranch` e `deleteBranch` são implementadas como callbacks aninhados dentro do hook, dificultando a leitura, manutenção e testabilidade.
- **Múltiplas responsabilidades:** O hook centraliza diversas operações (listar, criar, trocar, deletar branches), violando o princípio da responsabilidade única (SRP).
- **Baixa testabilidade:** O uso direto de `execute` dentro das funções internas dificulta a testabilidade isolada dessas operações.
- **Tratamento de selectedRepo:** O parâmetro `selectedRepo` pode ser `null`, exigindo checagem repetida em vários pontos do código, o que reduz a clareza e aumenta a chance de erros.

## Refatoração necessária

- Extrair a lógica de cada operação (`fetchBranches`, `createBranch`, `switchBranch`, `deleteBranch`) para hooks ou funções menores e reutilizáveis.
- Simplificar o tratamento de `selectedRepo`, reduzindo checagens repetidas e tornando o código mais robusto.
- Melhorar a testabilidade isolando dependências externas (como `execute`).
- Garantir que cada função tenha uma única responsabilidade e nomes descritivos.

## Critérios de aceitação

- O código deve seguir os princípios de Clean Code e Clean Architecture definidos no projeto.
- Funções internas devem ser extraídas e testáveis isoladamente.
- O tratamento de `selectedRepo` deve ser centralizado e simplificado.
- O hook deve ser mais legível, modular e de fácil manutenção.