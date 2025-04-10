# ISSUE-0135 - Isolar integrações Electron e eliminar dependências cruzadas

## Diagnóstico do problema

Foram identificadas dependências cruzadas entre frontend e backend, contrariando os princípios da Clean Architecture adotados no projeto (ver [ADR-0008](../../../docs/adr/ADR-0008-Clean-Architecture-LLM.md)). Além disso, as integrações com Electron não estão devidamente isoladas, misturando lógica de infraestrutura com regras de domínio e aplicação.

Atualmente, há chamadas diretas e acoplamento excessivo entre camadas, o que dificulta a manutenção, os testes e a evolução da arquitetura.

## Riscos e impactos negativos

- **Aumento do acoplamento** entre frontend e backend, dificultando a evolução independente das camadas
- **Dificuldade para testar** componentes isoladamente, especialmente mocks e testes automatizados
- **Mistura de responsabilidades**, violando o princípio da separação de camadas
- **Maior risco de bugs** e regressões devido à complexidade e dependências ocultas
- **Dificuldade para substituir ou evoluir integrações Electron** sem afetar o domínio ou a aplicação

## Objetivos da issue

- Eliminar dependências cruzadas entre frontend e backend
- Isolar todas as integrações Electron em adapters e infraestrutura
- Reforçar a separação de camadas conforme Clean Architecture
- Facilitar testes unitários e integração
- Tornar a manutenção e evolução da arquitetura mais simples e segura

## Recomendações iniciais

- Criar **adapters específicos** para todas as integrações Electron, localizados em `src/core/infrastructure/electron/adapters`
- Definir **interfaces claras** para comunicação entre frontend e backend, via portas (ports)
- Remover chamadas diretas entre frontend e backend, substituindo por chamadas via interfaces
- Garantir que a infraestrutura Electron **não contenha lógica de domínio ou aplicação**
- Revisar e alinhar a arquitetura conforme [docs/architecture.md](../../../docs/architecture.md) e ADRs relacionados

## Prioridade

**Alta** — esta refatoração é fundamental para garantir a qualidade arquitetural do projeto.

## Links relacionados

- [ADR-0008 - Clean Architecture LLM](../../../docs/adr/ADR-0008-Clean-Architecture-LLM.md)
- [ADR-0005 - Estrutura de Pastas Electron](../../../docs/adr/ADR-0005-Estrutura-de-Pastas-Electron.md)
- [docs/architecture.md](../../../docs/architecture.md)
- Issues relacionadas:
  - `ISSUE-0108-Desacoplar-prompt-manager-da-infraestrutura`
  - `ISSUE-0106-Reestruturacao-Pastas-LLM`
  - `ISSUE-0134-Corrigir-violacoes-ADRs-existentes`