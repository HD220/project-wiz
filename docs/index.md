# Índice de Documentação - Project Wiz

## Visão Geral

- [Contexto do Projeto](./project-context.md) - Visão geral e objetivos
- [README](../README.md) - Introdução ao projeto
- [Histórico de Mudanças](../CHANGES.md) - Registro de versões

## Documentação Técnica

### Arquitetura

- [Visão Arquitetural](./architecture.md) - Diagramas e decisões
- [Sistema de Plugins](./plugin-system.md) - Extensibilidade do projeto
- [Configurações TS/Vite](./ts-vite-config.md) - Setup do ambiente

### Componentes

- [UI Components](./ui-components.md) - Componentes de interface
- [Model Management](./model-management.md) - Gerenciamento de modelos LLM
- [Core Services](./core-services.md) - Serviços principais

## Guias

### Para Usuários

- [Guia do Usuário](./user-guide.md) - Como usar o produto
- [Configuração Inicial](./setup-guide.md) - Primeiros passos

### Para Desenvolvedores

- [Fluxo de Desenvolvimento](./development.md) - Processos e padrões
- [Estratégia de Testes](./testing-strategy.md) - Abordagem de testes
- [Otimização de Memória](./memory-optimization.md) - Boas práticas

## Referência

- [Status da Documentação](./documentation-status.md) - Cobertura atual
- [Dívida Técnica](./technical-debt.md) - Itens pendentes
- [Decisões Arquiteturais](./decisions.md) - ADRs importantes
- [Glossário](./glossary.md) - Terminologia do projeto
- [Padrões de Código](./coding-standards.md) - Convenções e boas práticas

## Manutenção do Índice

Este arquivo deve ser atualizado sempre que:

1. Nova documentação for adicionada
2. Documentação existente for movida/renomeada
3. A estrutura de documentação for alterada

Verifique periodicamente os links com:

```bash
npm run check-links
```
