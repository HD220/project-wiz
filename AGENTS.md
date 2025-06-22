# Guia para Agentes LLM Trabalhando no Repositório Project Wiz

Bem-vindo, colega Agente LLM! Este documento é seu guia para entender e contribuir com o codebase do Project Wiz. Nosso objetivo é construir uma aplicação robusta, manutenível e de alta qualidade, e sua colaboração inteligente é fundamental.

## 1. Visão Geral do Projeto

O Project Wiz é uma aplicação desktop ElectronJS com frontend em React e backend/core em Node.js/TypeScript. Seu propósito é automatizar tarefas de desenvolvimento de software usando agentes de IA (como você!). Os agentes são configurados via "Personas", processam "Jobs" (tarefas) de uma fila, e utilizam "Tools" para interagir com o sistema e o ambiente de desenvolvimento.

**Leia com Atenção:**
*   **Documentação Funcional Canônica:** `docs/funcional/` - Descreve O QUE o sistema faz.
*   **Documentação Técnica Principal:** `docs/tecnico/` - Descreve COMO o sistema é construído.
    *   `docs/tecnico/arquitetura.md`: Detalha a Clean Architecture e as camadas.
    *   `docs/tecnico/requisitos.md`: Lista os Requisitos Funcionais e Não Funcionais.
    *   `docs/tecnico/guia_de_estilo_visual.md`: Para qualquer trabalho de frontend.
    *   `docs/tecnico/casos-de-uso/`: Detalha os principais fluxos de interação.
    *   `docs/tecnico/plano_refatoracao_codigo_fase5.md`: O plano que estamos seguindo para esta reescrita.

## 2. Princípios Arquiteturais Mandatórios

Aderência estrita aos seguintes princípios é crucial:

*   **(Conteúdo Detalhado a Ser Adicionado Aqui)**
    *   Clean Architecture
    *   Object Calisthenics (Todas as 9 regras)
    *   SOLID, DRY, KISS

## 3. Estrutura do Código (`src_refactored/` durante a Fase 5, depois `src/`)

*   **(Conteúdo Detalhado a Ser Adicionado Aqui)**
    *   `core/domain/`: Entidades, Value Objects, Portas de Repositório.
    *   `core/application/`: Casos de Uso, Serviços de Aplicação, DTOs, Portas para Adaptadores.
    *   `infrastructure/`: Implementações de Portas (Repositórios Drizzle, Adaptadores de Tools, LLM, Fila, etc.), DI.
    *   `presentation/` (ou `infrastructure/electron` e `infrastructure/frameworks/react`): Código da UI React, setup Electron, Handlers IPC.
    *   `shared/`: Utilitários e tipos compartilhados (ex: `Result` type).

## 4. Tecnologias Chave

*   **(Conteúdo Detalhado a Ser Adicionado Aqui - Referenciar `package.json` e `docs/tecnico/arquitetura.md`)**

## 5. Fluxo de Trabalho de Desenvolvimento

*   **(Conteúdo Detalhado a Ser Adicionado Aqui)**
    *   Implementação orientada ao domínio.
    *   TDD/Testes unitários e de integração (Vitest).
    *   Commits pequenos e incrementais.
    *   Linting (`npm run lint`).

## 6. Object Calisthenics em Detalhe (Como Aplicar)

*   **(Conteúdo Detalhado e Exemplos a Serem Adicionados Aqui para cada uma das 9 regras)**
    1.  Um Nível de Indentação por Método.
    2.  Não Use a Palavra-Chave `else`.
    3.  Encapsule Todos os Tipos Primitivos e Strings (Value Objects).
    4.  Coleções de Primeira Classe.
    5.  Apenas Um Ponto Por Linha (Lei de Demeter).
    6.  Não Abrevie.
    7.  Mantenha Todas as Entidades Pequenas.
    8.  Nenhuma Classe Com Mais de Duas Variáveis de Instância.
    9.  Sem Getters/Setters/Propriedades (para comportamento).

## 7. Tratamento de Erros

*   **(Conteúdo Detalhado a Ser Adicionado Aqui - Uso do `Result` type, `DomainError`)**

## 8. Trabalhando com Código Legado (Durante a Fase 5)

*   Consulte `src/` e `src2/` para entendimento da lógica existente.
*   Implemente TODO o novo código em `src_refactored/`.
*   Não copie código legado diretamente sem garantir que ele adere 100% à nova arquitetura e a TODOS os princípios (especialmente Object Calisthenics). Priorize a reescrita.

## 9. Commits e Submissão de Trabalho

*   **(Conteúdo Detalhado a Ser Adicionado Aqui - Convenções de commit, branches)**

*(Este guia será progressivamente detalhado.)*
