# Handoff Técnico - ISSUE-0135

## Passos técnicos para isolar integrações Electron

1. **Mapear todas as chamadas e dependências atuais** relacionadas ao Electron no projeto
2. **Criar adapters específicos** para cada integração Electron dentro de `src/core/infrastructure/electron/adapters`
3. **Mover toda a lógica de infraestrutura Electron** para esses adapters, removendo qualquer código Electron do domínio e da aplicação
4. **Definir interfaces (ports)** para comunicação entre aplicação/domínio e os adapters Electron
5. **Utilizar injeção de dependência** para conectar os adapters às interfaces, facilitando mocks e testes
6. **Revisar o processo IPC** para garantir que está encapsulado nos adapters e não exposto diretamente ao frontend ou backend

## Estratégias para eliminar dependências cruzadas frontend-backend

- **Identificar dependências cruzadas** (imports, chamadas diretas, uso de tipos) entre frontend e backend
- **Definir contratos claros** via interfaces e DTOs para comunicação
- **Utilizar portas (ports)** para abstrair a comunicação, evitando chamadas diretas
- **Aplicar inversão de dependência** para que o frontend dependa apenas de interfaces, não de implementações do backend
- **Reorganizar o código** para garantir que frontend e backend fiquem em camadas separadas, comunicando-se apenas via interfaces

## Dependências e pré-requisitos

- Conhecimento da estrutura Clean Architecture adotada ([ADR-0008](../../../docs/adr/ADR-0008-Clean-Architecture-LLM.md))
- Leitura das ADRs relacionadas à estrutura Electron ([ADR-0005](../../../docs/adr/ADR-0005-Estrutura-de-Pastas-Electron.md))
- Mapeamento completo das integrações Electron existentes
- Identificação das dependências cruzadas atuais

## Recomendações para validação pós-refatoração

- **Testes unitários** para os adapters Electron, garantindo isolamento
- **Testes de integração** para comunicação frontend-backend via interfaces
- **Revisão de arquitetura** para confirmar que não há mais dependências cruzadas
- **Verificação de que a lógica de domínio e aplicação** está livre de código Electron ou infraestrutura
- **Atualização da documentação** refletindo a nova arquitetura

## Referências

- Clean Architecture (Robert C. Martin)
- [ADR-0008 - Clean Architecture LLM](../../../docs/adr/ADR-0008-Clean-Architecture-LLM.md)
- [docs/architecture.md](../../../docs/architecture.md)