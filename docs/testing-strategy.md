# Estratégia de Testes - Project Wiz

## Visão Geral

Atualmente, o projeto não possui uma suíte de testes automatizados implementada. A validação de qualidade é feita através de:

1. **Testes manuais** realizados pelos desenvolvedores
2. **Code reviews** entre pares
3. **Verificação funcional** antes de cada release

## Processo de Teste Atual

1. **Pré-commit**:
   - Verificação manual das alterações
   - Testes básicos de funcionalidade

2. **Pré-release**:
   - Checklist de testes manuais
   - Validação cruzada entre desenvolvedores

3. **Pós-release**:
   - Monitoramento de erros em produção
   - Feedback dos usuários

## Próximos Passos

Planejamos implementar testes automatizados seguindo esta priorização:

1. **Testes Unitários** (Jest):
   - Componentes isolados
   - Funções utilitárias

2. **Testes de Integração**:
   - Comunicação entre módulos
   - Fluxos principais

3. **Testes E2E** (Playwright):
   - Fluxos completos do usuário
   - Casos de uso críticos

## Referências

- [Guia de Estilo](../style-guide.md)
- [Documentação de Desenvolvimento](../development.md)

**Última Atualização**: 2025-04-16
