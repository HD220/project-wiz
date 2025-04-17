# Arquitetura e Design Modernizado

## Visão Geral

O Project Wiz é uma aplicação Electron que utiliza React no frontend e Node.js no backend (com comunicação IPC). O objetivo é fornecer uma interface para automatizar tarefas de desenvolvimento usando LLMs.

### Metas Arquiteturais
1. **Extensibilidade:** Suportar diferentes modos e ferramentas
2. **Performance:** Execução eficiente de pipelines LLM
3. **Manutenibilidade:** Código bem documentado e testado
4. **Segurança:** Práticas seguras de autenticação e logs

## Diagrama de Contexto

```mermaid
graph TD
    A[project-wiz] -->|Integra com| B(GitHub API)
    A -->|Armazena em| C[(SQLite)]
    A -->|Autentica via| D(Autenticação Customizada)
    A -->|Notifica via| E(WorkerService)
    A -->|Modelos LLM via| F(ModelManager)
```

## Estrutura de Camadas

A arquitetura segue os princípios da **Clean Architecture** ([ADR-0012](adr/ADR-0012-Clean-Architecture-LLM.md)), com as seguintes camadas:

1. **Domain:** Entidades e regras de negócio puras
2. **Application:** Casos de uso e serviços
3. **Infrastructure:** Implementações concretas
4. **Client:** Componentes UI ([ui-components.md](ui-components.md))
5. **Shared:** Utilitários comuns

## Diagrama de Componentes

```mermaid
graph TB
    subgraph Frontend
        A1[React UI] -- IPC --> B1[Electron Main]
        A2[Hooks] --> A1
    end
    
    subgraph Backend
        B1 --> C1[Application]
        C1 --> C2[Domain]
        C1 --> C3[Infrastructure]
    end
    
    subgraph Services
        D1[WorkerService] --> C1
        D2[ModelManager] --> D1
        D3[PromptQueue] --> D1
        D4[LLM Providers] --> D2
    end
```

## Fluxos Principais

### 1. Execução de Prompts
```mermaid
sequenceDiagram
    participant U as Usuário
    participant F as Frontend
    participant B as Backend
    participant W as WorkerService
    
    U->>F: Envia prompt
    F->>B: IPC
    B->>W: Enfileira prompt
    W-->>B: Processa resposta
    B-->>F: IPC
    F-->>U: Exibe resposta
```

### 2. Download de Modelos
```mermaid
sequenceDiagram
    participant F as Frontend
    participant B as Backend
    participant M as ModelManager
    participant R as Repositório
    
    F->>B: Solicita modelo
    B->>M: Verifica cache
    alt Modelo ausente
        M->>R: Download
        R-->>M: Modelo
        M->>M: Armazena cache
    end
    M-->>B: Modelo carregado
```

## Módulos Principais

| Módulo | Responsabilidade |
|--------|----------------|
| Core | Gerenciamento de modos e ferramentas |
| Client | Interface do usuário e interações |
| Services | WorkerService, ModelManager, PromptQueue |

## Tecnologias Chave

- **Frontend:** Electron, React, TypeScript, Vite
- **Backend:** Node.js, Drizzle ORM, SQLite
- **LLM:** Mistral, Llama 2
- **Ferramentas:** Mermaid (diagramação)

## Padrões de Documentação

Todos os documentos seguem os padrões definidos em:
- [ADR-0020: Padrão de Documentação](architecture/decisions/adr-0020.md)
- [ADR-0021: Diagramação com Mermaid](architecture/decisions/adr-0021.md)

## Links Relacionados

- [Visão do Domínio](domain-overview.md)
- [Infraestrutura](infrastructure-overview.md)
- [Referência da API](api-reference.md)
- [Guia de Desenvolvimento](development.md)
