# Project Wiz

## Sistema de Tools

O Project Wiz possui um sistema modular de Tools que permite aos agentes realizar operações específicas. As principais características incluem:

### Tools Implementadas

1. **MemoryTool**
   - Armazenamento persistente de informações
   - Busca semântica usando RAG
   - Operações: Write, Delete, Search

2. **TaskTool** (em desenvolvimento)
   - Gerenciamento de tarefas e subtarefas
   - Validação de workflows
   - Integração com sistema de filas

### Arquitetura

- **Camada Core**: Interfaces e contratos (`src/core/ports/tools`)
- **Camada Infrastructure**: Implementações concretas (`src/infrastructure/tools`)
- **Testes**: Cobertura abrangente com Vitest

### Documentação

- [Arquitetura das Tools](docs/design/tools-architecture.md)
- [Plano de Implementação](docs/plan/tools-implementation.md)

## Como Contribuir

1. Siga os padrões de Clean Architecture
2. Mantenha cobertura de testes acima de 80%
3. Documente todas as novas features

```typescript
// Exemplo de uso da MemoryTool
const memoryTool = new SqliteMemoryTool(db, vectorStore);
await memoryTool.write({
  content: 'Exemplo de conteúdo',
  metadata: { source: 'README' }
});
