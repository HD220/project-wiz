# Refatorar use-git-history para Clean Code

## Arquivo alvo
`src/client/hooks/use-git-history.ts`

## Problemas identificados

- **Múltiplas responsabilidades:** O hook centraliza tanto a busca do histórico quanto o gerenciamento de estados de loading e erro, violando o princípio da responsabilidade única (SRP).
- **Baixa testabilidade:** O uso direto de `execute` dentro do hook dificulta a testabilidade isolada da lógica de busca do histórico.
- **Checagem repetida de selectedRepo:** O tratamento de `selectedRepo` é feito de forma repetitiva, tornando o código mais verboso e sujeito a erros.

## Refatoração necessária

- Extrair a função `fetchHistory` para um utilitário ou hook separado, facilitando testes e reutilização.
- Simplificar o tratamento de `selectedRepo`, centralizando a lógica e reduzindo repetições.
- Melhorar a modularidade e clareza do código, separando responsabilidades.

## Critérios de aceitação

- O código deve seguir os princípios de Clean Code e Clean Architecture definidos no projeto.
- A lógica de busca do histórico deve ser isolada e testável.
- O tratamento de `selectedRepo` deve ser centralizado e simplificado.
- O hook deve ser mais legível, modular e de fácil manutenção.