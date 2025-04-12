# Refatorar git-commit-panel: isolar lógica de commit Git

## Problema

O componente `src/client/components/git-commit-panel.tsx` atualmente mistura lógica de domínio/aplicação (operações de commit Git) com a camada de apresentação (UI). Essa abordagem viola os princípios de Clean Architecture, dificultando a manutenção, testabilidade e evolução do código.

## Contexto

- O projeto adota Clean Architecture (ver ADR-0012), que recomenda separar lógica de domínio/aplicação da camada de apresentação.
- Outros componentes relacionados a Git já estão sendo refatorados para isolar lógica de domínio em hooks ou serviços dedicados.
- A manutenção de lógica de commit diretamente no componente pode gerar acoplamento excessivo, dificultando testes e reuso.

## Justificativa

- Facilitar a manutenção e evolução do componente.
- Melhorar a testabilidade, permitindo mocks e testes unitários da lógica de commit.
- Reduzir acoplamento entre UI e lógica de domínio.
- Alinhar o componente aos padrões arquiteturais do projeto.

## Critérios de Aceitação

- Toda a lógica de commit Git deve ser extraída do componente `git-commit-panel.tsx` e movida para um hook ou serviço dedicado (ex: `useGitCommit` ou `gitCommitService`).
- O componente deve se responsabilizar apenas pela apresentação e interação com o usuário.
- O novo hook/serviço deve ser testável de forma isolada.
- O código resultante deve seguir os princípios de Clean Code e Clean Architecture adotados no projeto.
- Documentar a refatoração no handoff.md da issue.

## Referências

- [ADR-0012 - Clean Architecture LLM](../../../docs/adr/ADR-0012-Clean-Architecture-LLM.md)
- [Exemplo de refatoração semelhante: ISSUE-0207](../ISSUE-0207-Refatorar-git-branches-panel-isolar-logica-branches/README.md)