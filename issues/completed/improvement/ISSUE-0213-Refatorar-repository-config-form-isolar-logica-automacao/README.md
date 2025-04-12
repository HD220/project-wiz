# Refatorar repository-config-form: isolar lógica de automação

## Contexto

O componente [`src/client/components/repository-config-form.tsx`](../../../src/client/components/repository-config-form.tsx) atualmente manipula diretamente lógica relacionada à automação de repositórios, misturando regras de domínio/aplicação com a camada de apresentação (UI).

Essa abordagem viola os princípios de Clean Architecture, dificultando a manutenção, a testabilidade e a evolução do código. A lógica de automação não deve residir em componentes de interface, mas sim ser isolada em hooks ou serviços dedicados.

## Problema

- Lógica de automação de repositório está acoplada à camada de apresentação.
- Dificulta a reutilização, manutenção e testes unitários.
- Fere o princípio de separação de responsabilidades (SRP) e Clean Architecture.

## Recomendação

- Isolar toda a lógica de automação de repositório atualmente presente no componente em um hook customizado (`useRepositoryAutomation`) ou serviço dedicado.
- O componente deve se limitar a orquestrar a UI e consumir o hook/serviço, sem conter regras de negócio ou automação.
- Garantir que a lógica extraída seja facilmente testável e reutilizável.

## Critérios de aceitação

- Nenhuma lógica de automação de repositório deve permanecer no componente de apresentação.
- Toda a lógica deve estar centralizada em um hook ou serviço dedicado, seguindo Clean Architecture.
- O componente deve consumir apenas a interface exposta pelo hook/serviço.

## Escopo

**Não implementar a refatoração neste momento.** Esta issue é apenas para planejamento e rastreamento da melhoria arquitetural.