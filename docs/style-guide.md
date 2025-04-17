# Guia de Estilo para Documentação

## Princípios Gerais

1. **Clareza**: Escreva de forma direta e objetiva
2. **Consistência**: Mantenha padrões uniformes em toda a documentação
3. **Acessibilidade**: Documente para diferentes níveis de conhecimento
4. **Atualização**: Mantenha a documentação sincronizada com o código

## Estrutura Padrão

### Documentos Técnicos
```markdown
# Título do Documento

## Visão Geral
[Contexto e propósito]

## Funcionalidades
[Lista de funcionalidades]

## Uso
[Como usar/implementar]

## Exemplos
[Código/exemplos de uso]

## Referências
[Links relacionados]
```

### ADRs (Architecture Decision Records)
```markdown
# [ID] - [Título Resumido]

## Status
[Proposto/Aceito/Depreciado]

## Contexto
[O problema/oportunidade]

## Decisão
[O que foi decidido]

## Consequências
[Impactos da decisão]
```

## Convenções de Formatação

1. **Títulos**: Use heading levels consistentemente
2. **Código**: Use blocos de código com syntax highlighting
3. **Links**: Sempre use links relativos para documentos internos
4. **Tabelas**: Use para comparações e listas estruturadas
5. **Listas**: Use listas numeradas para passos e não-ordenadas para features

## Boas Práticas

1. Atualize o documentation-status.md após mudanças
2. Vincule documentos relacionados
3. Inclua exemplos práticos
4. Documente tanto o "como" quanto o "porquê"
5. Revise periodicamente a documentação

## Template de Revisão

```markdown
# Revisão: [Nome do Documento]

## Alterações Propostas
1. [Item 1]
2. [Item 2]

## Status da Revisão
- [ ] Revisão Técnica
- [ ] Aprovação
- [ ] Implementação

## Histórico
- 2025-04-16: Criação do template