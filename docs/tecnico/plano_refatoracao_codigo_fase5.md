# Plano de Refatoração de Código - Fase 5

Este documento detalha o plano iterativo para a reescrita completa do código da aplicação (Fase 5), com foco na adesão à Clean Architecture, Object Calisthenics, e outras boas práticas definidas na documentação técnica.

## Objetivos Principais da Fase 5:
1.  Reescrever toda a aplicação a partir do zero em um novo diretório (`src_refactored/`).
2.  Garantir que a nova implementação do frontend seja visualmente idêntica à original, seguindo `docs/tecnico/guia_de_estilo_visual.md`.
3.  Assegurar que todo o código siga estritamente a arquitetura definida em `docs/tecnico/arquitetura.md`.
4.  Aplicar rigorosamente todas as 9 regras do Object Calisthenics e boas práticas gerais (SOLID, DRY, KISS, Código Limpo).
5.  Desenvolver testes unitários e de integração para garantir a correção e manutenibilidade do novo código.
6.  Após a conclusão e verificação da nova implementação, remover o código legado de `src/` e `src2/`.
7.  Mover o código refatorado de `src_refactored/` para `src/`.

## Estratégia de Implementação Iterativa:

A implementação será dividida nas seguintes sub-fases principais, abordando camada por camada, começando pelo domínio:

### Sub-fase 5.A: Implementação da Camada de Domínio (`src_refactored/core/domain/`)
   *   (Conteúdo detalhado a ser adicionado aqui, cobrindo Entidades, VOs, Portas de Repositório para cada agregado/módulo de domínio: Projetos, SourceCode, LLMProviderConfig, AgentPersonaTemplate, Agent, AgentInternalState, Jobs, ActivityContext, Tools, etc.)

### Sub-fase 5.B: Implementação da Camada de Aplicação (`src_refactored/core/application/`)
   *   (Conteúdo detalhado a ser adicionado aqui, cobrindo Casos de Uso, Serviços de Aplicação, DTOs/Schemas, Portas para Adaptadores da Infraestrutura)

### Sub-fase 5.C: Implementação da Camada de Infraestrutura (`src_refactored/infrastructure/`)
   *   (Conteúdo detalhado a ser adicionado aqui, cobrindo implementações de Repositórios (Drizzle), adaptadores de Fila, Worker Pool, adaptadores de Tools, adaptadores LLM, DI com InversifyJS)

### Sub-fase 5.D: Implementação da Camada de Apresentação (UI e Electron)
   *   **Frontend (React):** (`src_refactored/infrastructure/frameworks/react/`)
       *   (Conteúdo detalhado a ser adicionado aqui, cobrindo componentes de UI, páginas, stores, hooks, services IPC, estilização com Tailwind CSS conforme guia visual)
   *   **Electron Main/Preload:** (`src_refactored/presentation/electron/` ou `src_refactored/infrastructure/electron/`)
       *   (Conteúdo detalhado a ser adicionado aqui, cobrindo configuração do processo principal, preload scripts, manipuladores IPC que delegam para a camada de aplicação)

### Sub-fase 5.E: Testes
   *   (Conteúdo detalhado a ser adicionado aqui, especificando a abordagem para testes unitários, de integração e E2E para cada camada/componente)

### Sub-fase 5.F: Remoção de Código Legado e Migração
   *   (Conteúdo detalhado a ser adicionado aqui, especificando o processo de análise e remoção segura do código em `src/` e `src2/`, e a subsequente movimentação de `src_refactored/` para `src/`)

## Próximos Passos Imediatos (Conforme Plano Principal):
1.  Continuar a implementação da Camada de Domínio, começando pelas entidades e VOs restantes.

*(Este plano será progressivamente detalhado à medida que a implementação avança.)*
