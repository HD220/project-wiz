# Handoff - ISSUE-0096 - Segregar interfaces e eliminar sobreposição IWorkerService / ModelManager

## Resumo da Segregação

Foi realizada a separação das responsabilidades conforme Clean Architecture, eliminando a sobreposição entre as interfaces de gerenciamento de modelos e operações de execução de prompts.

---

## Antes

- `src/core/domain/ports/iworker-service.port.ts` continha múltiplas interfaces misturadas:
  - Download de modelos
  - Carregamento/descarregamento de modelos
  - Criação de contexto
  - Execução de prompt
  - Eventos

- `src/core/domain/ports/imodel-manager.port.ts` também tinha métodos de gerenciamento de modelos, redundantes.

---

## Depois

### Interfaces segregadas no domínio:

- **`WorkerServicePort`** (`src/core/domain/ports/worker-service.port.ts`)
  - `createContext()`
  - `prompt()`
  - *Eventos removidos temporariamente (não suportados pelo adaptador atual)*

- **`ModelManagerPort`** (`src/core/domain/ports/model-manager.port.ts`)
  - `downloadModel()`
  - `loadModel()`
  - `unloadModel()`

### Adaptadores na infraestrutura:

- **`WorkerServiceAdapter`**
  - Implementa apenas `WorkerServicePort`
  - Responsável por criar contexto e executar prompts
  - Usa internamente `MistralGGUFAdapter`

- **`ModelManagerAdapter`**
  - Implementa apenas `ModelManagerPort`
  - Responsável por download, carregamento e descarregamento de modelos
  - Usa internamente `MistralGGUFAdapter`

---

## Observações

- O método `isModelLoaded` foi removido da interface `ModelManagerPort` por não ser suportado atualmente.
- O suporte a eventos no `WorkerServicePort` foi removido temporariamente, pois o `MistralGGUFAdapter` não expõe eventos.
- Recomenda-se criar uma issue futura para implementar forwarding de eventos no adaptador.

---

## Status

- Interfaces segregadas
- Adaptadores específicos criados
- Código limpo, testável e aderente à Clean Architecture
- Documentação atualizada