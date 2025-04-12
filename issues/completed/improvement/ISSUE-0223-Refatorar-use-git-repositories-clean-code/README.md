# Refatorar use-git-repositories para Clean Code

## Arquivo alvo
`src/client/hooks/use-git-repositories.ts`

## Problemas identificados

- **Múltiplos estados e responsabilidades:** O hook gerencia lista de repositórios, seleção e sincronização, acumulando responsabilidades e dificultando manutenção.
- **Baixa testabilidade:** O uso direto de `execute` dentro do hook dificulta a testabilidade isolada das funções auxiliares.
- **Checagem de selectedRepo:** A checagem de `selectedRepo` dentro de `refreshRepositories` pode ser melhorada e centralizada.
- **Seleção automática:** A lógica de seleção automática do primeiro repositório está acoplada ao hook, dificultando reutilização.

## Refatoração necessária

- Extrair funções auxiliares para facilitar testes e reutilização.
- Isolar a lógica de seleção automática do primeiro repositório em função ou hook separado.
- Centralizar e simplificar o tratamento de `selectedRepo`.
- Melhorar a modularidade e clareza do código, separando responsabilidades.

## Critérios de aceitação

- O código deve seguir os princípios de Clean Code e Clean Architecture definidos no projeto.
- Funções auxiliares devem ser extraídas e testáveis isoladamente.
- O tratamento de `selectedRepo` deve ser centralizado e simplificado.
- O hook deve ser mais legível, modular e de fácil manutenção.