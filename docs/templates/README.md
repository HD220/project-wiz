# Documentação dos Templates

Este documento descreve os templates disponíveis na pasta `docs/templates/` e como utilizá-los.

## Propósito dos Templates

Os templates fornecem estruturas padronizadas para documentação do projeto, garantindo:

- Consistência na documentação
- Facilidade de criação de novos documentos
- Cobertura completa de informações importantes
- Alinhamento com boas práticas

## Templates Disponíveis

### 1. API Inventory (`api-inventory.md`)

**Propósito**: Rastrear todas as APIs do projeto, seu status e documentação.

**Quando usar**:

- Para inventariar APIs existentes
- Para planejar novas APIs
- Para acompanhar mudanças em APIs

**Exemplo de uso**:

```markdown
# API Inventory

## API Overview

| API Name | Version | Status | Last Updated | Owner |
| -------- | ------- | ------ | ------------ | ----- |
| User API | v1.2.0  | Active | 2025-04-01   | @dev1 |
```

### 2. Task Handoff (`task-handoff.md`)

**Propósito**: Documentar transferência de tarefas entre times/membros.

**Quando usar**:

- Ao passar trabalho para outra pessoa
- Ao assumir trabalho de outra pessoa
- Para documentar contexto importante

**Exemplo de uso**:

```markdown
# Task Handoff: User Authentication Refactor

## Current Status

Refatoração 70% completa, faltando integração com novo serviço de tokens.

## Next Steps

- Integrar com TokenService
- Atualizar testes
- Documentar mudanças
```

### 3. Documentation Status Dashboard (`documentation-status-dashboard.md`)

**Propósito**: Acompanhar o status geral da documentação do projeto.

**Quando usar**:

- Para revisões periódicas de documentação
- Para planejar esforços de documentação
- Para identificar áreas carentes

**Exemplo de uso**:

```markdown
# Documentation Status Dashboard

## Documentation Coverage

| Area          | Status      | Last Updated | Responsible |
| ------------- | ----------- | ------------ | ----------- |
| Core API      | 🟢 Complete | 2025-04-01   | @doc-team   |
| UI Components | 🟡 Partial  | 2025-03-15   | @frontend   |
```

## Processo para Novos Templates

1. **Proposta**: Descrever o propósito e estrutura proposta
2. **Revisão**: Discutir com a equipe de documentação
3. **Implementação**: Criar o template na pasta `/templates`
4. **Documentação**: Adicionar ao README.md dos templates
5. **Divulgação**: Comunicar à equipe sobre o novo template

## Melhores Práticas

- Use os templates como ponto de partida, adaptando conforme necessário
- Mantenha os templates atualizados com as necessidades do projeto
- Revise os templates periodicamente para melhorias
- Documente exemplos de uso para cada template
