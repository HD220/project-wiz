# ADR 0001: Implementação de ADRs para registro de decisões arquiteturais

## Status

Aceito

## Contexto

- O projeto está crescendo em complexidade e tomando decisões arquiteturais importantes
- Há necessidade de documentar essas decisões para manter consistência e histórico
- Decisões atuais estão espalhadas em issues, PRs ou apenas na memória dos desenvolvedores
- ADRs (Architectural Decision Records) são uma prática consolidada para este propósito

## Decisão

- Implementar um sistema de ADRs baseado no formato MADR (Markdown Architectural Decision Records)
- Armazenar ADRs na pasta `docs/adr/`
- Usar o template padrão criado em `docs/templates/adr/template.md`
- Registrar decisões significativas retroativamente quando necessário
- Atualizar o system-prompt para incluir diretrizes sobre quando criar ADRs

## Consequências

**Positivas:**

- Melhor rastreabilidade e documentação de decisões
- Contexto preservado para futuros desenvolvedores
- Maior consistência arquitetural
- Facilita onboarding de novos membros

**Negativas:**

- Sobrecarga inicial para documentar decisões existentes
- Necessidade de disciplina para manter atualizado

## Alternativas consideradas

- **Manter status quo (issues e documentação esparsa)**
  - Rejeitado por não fornecer visão clara do histórico de decisões
- **Usar outra ferramenta de documentação**
  - Rejeitado por adicionar complexidade desnecessária

## Links relacionados

- [Template de ADR](docs/templates/adr/template.md)
- [Atualização do system-prompt](.roo/system-prompt-developer)
