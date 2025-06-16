# Sub-sub-tarefa: Analisar diretório src/core/domain/entities/queue para arquivos obsoletos

## Descrição:

Analisar o conteúdo dos arquivos no diretório `src/core/domain/entities/queue` para identificar quais entidades ou Value Objects pertencem à implementação anterior do sistema de filas e devem ser considerados obsoletos para a nova arquitetura.

## Contexto:

Este diretório contém a definição da entidade `Queue` e seus Value Objects relacionados. É necessário determinar quais desses arquivos são incompatíveis com a nova arquitetura, onde a entidade `Queue` terá um papel específico no gerenciamento do ciclo de vida das Jobs/Activities.

## Specific Instructions:

1.  Navegue até o diretório `src/core/domain/entities/queue`.
2.  Examine cada arquivo `.ts` neste diretório.
3.  Com base na documentação da nova arquitetura ([docs/architecture-agents-workers-queue.md](docs/architecture-agents-workers-queue.md), [docs/architectural-design-workers-agents.md](docs/architectural-design-workers-agents.md)), determine se a entidade ou Value Object definido no arquivo é obsoleto ou se pode ser refatorado (o que será tratado em tarefas posteriores).
4.  Crie uma lista temporária dos caminhos dos arquivos neste diretório que são considerados obsoletos.

## Expected Deliverable:

Uma lista temporária dos caminhos dos arquivos obsoletos encontrados no diretório `src/core/domain/entities/queue`. Esta lista será consolidada em uma sub-sub-tarefa posterior.