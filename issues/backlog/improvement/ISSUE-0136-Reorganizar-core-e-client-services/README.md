# ISSUE-0136 - Reorganizar core e client services

## Diagnóstico Consolidado

- A pasta **`src/core/services/`** mistura responsabilidades de **domínio**, **aplicação** e **infraestrutura**, contrariando Clean Architecture.
- A pasta **`src/client/services/`** contém integrações diretas (ex: acesso a storage, detecção de tema), aumentando o acoplamento da UI com infraestrutura.
- No **mobile**, integrações específicas estão acopladas às telas, dificultando manutenção, testes e evolução independente da interface.
- Essa estrutura gera **alto acoplamento**, **baixa coesão** e **dificuldade para testes unitários**, além de prejudicar a clareza arquitetural e escalabilidade futura.

## Riscos e Impactos Negativos

- **Dificuldade para evoluir funcionalidades** sem quebrar outras partes do sistema.
- **Aumento do esforço para testes automatizados**, pois as dependências não estão isoladas.
- **Risco de violações de princípios SOLID**, especialmente Inversão de Dependência e Responsabilidade Única.
- **Dificuldade para substituir integrações** (ex: backend, serviços externos) sem grandes refatorações.
- **Baixa clareza para novos desenvolvedores** entenderem a arquitetura e responsabilidades.

## Objetivos

- **Separar claramente** responsabilidades de **domínio**, **aplicação** e **infraestrutura** no core.
- **Isolar integrações diretas** no client, transformando-as em **adapters** ou **gateways** desacoplados da UI.
- **Modularizar integrações mobile**, separando lógica da UI.
- **Facilitar testes unitários e de integração**, promovendo injeção de dependências e mocks.
- **Melhorar clareza arquitetural**, alinhando com Clean Architecture e ADRs.

## Recomendações Iniciais

- Reorganizar `src/core/services/` em:
  - `src/core/domain/services/` (regras de negócio puras)
  - `src/core/application/services/` (coordenação de casos de uso)
  - `src/core/infrastructure/adapters/` (implementações técnicas)
- Extrair integrações do client para:
  - `src/client/adapters/` ou `src/client/gateways/`
  - UI deve depender de interfaces, não de implementações concretas
- No mobile:
  - Extrair integrações para módulos próprios
  - UI deve consumir interfaces, facilitando mocks e testes
- Atualizar documentação e ADRs conforme necessário.

## Prioridade

**Alta** — Refatoração crítica para garantir escalabilidade, testabilidade e alinhamento arquitetural.

## Links Relacionados

- [ADR-0008 - Clean Architecture LLM](../../../../docs/adr/ADR-0008-Clean-Architecture-LLM.md)
- [ISSUE-0135 - Isolar integrações Electron e eliminar dependências cruzadas](../ISSUE-0135-Isolar-integracoes-Electron-e-eliminar-dependencias-cruzadas/README.md)