# Roadmap de Refatoração para Clean Architecture

## Visão Geral
Refatoração do sistema para implementar Clean Architecture, com foco inicial nos serviços principais (gitService, WorkerService, ModelManager). Objetivos principais:

- Melhor separação de responsabilidades
- Maior testabilidade
- Flexibilidade para troca de implementações
- Documentação clara das decisões

## Etapas Planejadas

### Etapa 1: Refatoração gitService (Concluída)
- ✅ Interface IGitService no domínio
- ✅ Implementação ElectronGitService na infraestrutura
- ✅ Validação de parâmetros com Zod
- ✅ Tipagem IPC específica
- ✅ Tratamento centralizado de erros

**Status**: Concluído em 2025-04-17  
**Documentação**:  
- [ADR-0030](docs/architecture/decisions/adr-0030-refatoracao-gitservice.md)  
- [Guia de Validação](docs/refatoracao-clean-architecture/validacao-parametros.md)  
- [Tipagem IPC](docs/refatoracao-clean-architecture/tipagem-ipc.md)

### Etapa 2: Implementação de Use Cases (Em Revisão Final)
- ✅ Criação de GitUseCases.ts
- ✅ Implementação de casos de uso para operações Git
- ✅ Validação de parâmetros
- ✅ Testes unitários
- 🔄 Revisão final das implementações

**Status**: Em revisão final  
**Próximos passos**:  
- Incorporar feedback da revisão
- Atualizar documentação de casos de uso

### Etapa 3: Consolidação e Padronização (Planejada)
- 🔲 Padronização de interfaces
- 🔲 Documentação de padrões
- 🔲 Criação de templates
- 🔲 Atualização de guias de desenvolvimento

**Estimativa**: Início em 2025-04-20

## Histórico de Atualizações
- 2025-04-17: Conclusão da Etapa 1 e progresso na Etapa 2