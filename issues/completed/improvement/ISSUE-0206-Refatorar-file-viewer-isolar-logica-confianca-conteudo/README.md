# Refatorar file-viewer: isolar lógica de confiança do conteúdo

## Descrição

O componente `src/client/components/file-viewer.tsx` atualmente mistura lógica de domínio/aplicação (verificação de "isContentTrusted") com a camada de apresentação. Essa abordagem viola os princípios de Clean Architecture, dificultando a manutenção, testabilidade e evolução do código.

## Problema

- A lógica de verificação de confiança do conteúdo (`isContentTrusted`) está implementada diretamente no componente de apresentação.
- Isso acopla regras de negócio à interface, contrariando a separação de responsabilidades recomendada.
- Torna mais difícil testar a lógica de confiança de forma isolada e dificulta a reutilização.

## Recomendação

- Extrair a lógica de verificação de confiança do conteúdo para um hook dedicado (ex: `useContentTrust`) ou um serviço específico.
- O componente deve consumir apenas o resultado dessa lógica, mantendo-se focado na apresentação.
- Garantir que a lógica extraída seja facilmente testável e reutilizável.

## Benefícios Esperados

- Melhor separação de responsabilidades (SRP).
- Maior aderência à Clean Architecture.
- Facilidade de manutenção e testes.
- Possibilidade de reutilização da lógica de confiança em outros contextos.

## Critérios de Aceite

- Nenhuma lógica de domínio (ex: `isContentTrusted`) deve permanecer no componente de apresentação.
- A lógica deve estar isolada em um hook ou serviço.
- O componente deve consumir apenas o resultado da verificação.
- Cobertura de testes para a lógica extraída.

## Relacionados

- Clean Architecture (ver ADR-0012)
- SRP (Single Responsibility Principle)
- src/client/components/file-viewer.tsx