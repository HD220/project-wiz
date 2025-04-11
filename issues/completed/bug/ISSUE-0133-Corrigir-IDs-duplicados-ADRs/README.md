# ISSUE-0133 - Corrigir IDs duplicados nas ADRs

## Diagnóstico do problema

Foi identificado que as ADRs do projeto possuem IDs duplicados, especificamente nos números:

- **0005**
  - [ADR-0005-Estrutura-de-Pastas-Electron.md](../../../docs/adr/ADR-0005-Estrutura-de-Pastas-Electron.md)
  - [ADR-0005-Nao-implementar-sistema-de-plugins.md](../../../docs/adr/ADR-0005-Nao-implementar-sistema-de-plugins.md)
- **0006**
  - [ADR-0006-DSL-para-fluxos-de-trabalho.md](../../../docs/adr/ADR-0006-DSL-para-fluxos-de-trabalho.md)
  - [ADR-0006-Nomenclatura-Servicos-LLM.md](../../../docs/adr/ADR-0006-Nomenclatura-Servicos-LLM.md)
- **0007**
  - [ADR-0007-Implementacao-TanStack-Router-Drizzle.md](../../../docs/adr/ADR-0007-Implementacao-TanStack-Router-Drizzle.md)
  - [ADR-0007-Refatoracao-WorkerService-Mistral-GGUF.md](../../../docs/adr/ADR-0007-Refatoracao-WorkerService-Mistral-GGUF.md)
- **0008**
  - [ADR-0008-Atualizar-target-ECMAScript.md](../../../docs/adr/ADR-0008-Atualizar-target-ECMAScript.md)
  - [ADR-0008-Clean-Architecture-LLM.md](../../../docs/adr/ADR-0008-Clean-Architecture-LLM.md)

Essa duplicidade gera confusão, dificulta a rastreabilidade das decisões arquiteturais e pode causar interpretações conflitantes, especialmente porque algumas ADRs rejeitadas mantêm planos detalhados que podem ser erroneamente seguidos.

## Impactos na governança e rastreabilidade

- **Perda de unicidade:** IDs devem ser únicos para garantir rastreabilidade clara.
- **Risco de decisões conflitantes:** múltiplas ADRs com mesmo ID podem conter decisões divergentes.
- **Dificuldade de manutenção:** atualizações e referências cruzadas ficam ambíguas.
- **Governança comprometida:** dificulta a gestão do ciclo de vida das decisões (aceita, rejeitada, superseded).

## Objetivos da issue

- **Renumerar todas as ADRs para garantir unicidade dos IDs**
- **Atualizar todas as referências cruzadas e links afetados**
- **Padronizar o status das ADRs (aceita, rejeitada, superseded)**
- **Documentar governança para evitar duplicidade futura**

## Recomendações iniciais

- Definir uma sequência única e incremental para todas as ADRs.
- ADRs rejeitadas devem ser mantidas, mas com status explícito e IDs únicos.
- Atualizar links internos e externos que referenciem as ADRs renumeradas.
- Criar uma ADR de governança para o processo de criação, revisão e rejeição de ADRs, reforçando a unicidade dos IDs.
- Prioridade **alta** para evitar confusões futuras.

## Links relacionados

- [docs/adr/](../../../docs/adr/)
- Outras issues relacionadas à documentação e governança (adicionar conforme aplicável).