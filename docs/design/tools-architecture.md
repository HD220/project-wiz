# Arquitetura do Sistema de Tools

## Visão Geral

O sistema de tools permite que os agentes interajam com o ambiente e realizem tarefas específicas. As tools seguem os princípios da Clean Architecture, sendo divididas em:

1. **Camada Core**: Define interfaces e contratos
2. **Camada Infrastructure**: Implementações concretas
3. **Camada Application**: Integração com o sistema de agentes

## MemoryTool

### Diagrama de Componentes

```mermaid
classDiagram
    class MemoryTool {
        +write(params: MemoryWriteParams): Promise<MemoryWriteResult>
        +delete(params: MemoryDeleteParams): Promise<MemoryDeleteResult>
        +search(query: string, options?): Promise<MemoryRecord[]>
    }

    class MemoryRepository {
        +save(record: MemoryRecord): Promise<void>
        +delete(id: string): Promise<void>
        +search(query: string): Promise<MemoryRecord[]>
    }

    class VectorStore {
        +embed(text: string): Promise<number[]>
        +query(embedding: number[], options): Promise<SearchResult[]>
    }

    MemoryTool --> MemoryRepository
    MemoryTool --> VectorStore
```

### Fluxo de Operações

1. **Write**:
   - Validação dos parâmetros com Zod
   - Geração de embedding do conteúdo
   - Persistência no repositório
   - Indexação no vector store

2. **Search**:
   - Geração de embedding da query
   - Busca semântica no vector store
   - Recuperação dos registros completos
   - Ordenação por relevância

## TaskTool

(Será documentado após implementação da MemoryTool)

## Princípios de Implementação

- Tipagem estrita com TypeScript
- Validação de entrada com Zod
- Separação clara de responsabilidades
- Testabilidade
- Documentação completa