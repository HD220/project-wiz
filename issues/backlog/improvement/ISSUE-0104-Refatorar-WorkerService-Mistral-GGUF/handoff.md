# Handoff - Refatoração WorkerService para Mistral GGUF

## Objetivo

Refatorar o WorkerService para suportar o modelo Mistral GGUF, seguindo os princípios da Clean Architecture, com separação clara entre domínio e infraestrutura.

---

## Abordagem adotada

### 1. **Definição dos Ports no Domínio**

- Foram mantidos os contratos existentes em `src/core/domain/ports/iworker-service.port.ts` e `imodel-manager.port.ts`.
- Eles abstraem carregamento, descarregamento, execução de prompts, download e gerenciamento de modelos.
- A aplicação depende **apenas desses ports**, sem acoplamento à infraestrutura.

### 2. **Criação do Adapter MistralGGUF**

- Criado em `src/core/infrastructure/llm/adapters/MistralGGUFAdapter.ts`.
- Implementa os ports do domínio.
- Isola toda a lógica específica do `node-llama-cpp` para modelos GGUF (como Mistral).
- Responsável por:
  - Download do modelo
  - Carregamento e descarregamento
  - Criação de contexto
  - Inicialização da sessão de chat
  - Execução de prompts

### 3. **Refatoração do WorkerServiceAdapter**

- Localizado em `src/core/infrastructure/worker/adapters/WorkerServiceAdapter.ts`.
- Atua como **façade/orquestrador**.
- Internamente instancia e delega para o `MistralGGUFAdapter`.
- Permite futura extensão para outros backends (ex: OpenAI, API REST) sem alterar a aplicação.
- Mantém a interface única para a aplicação, alinhada aos ports do domínio.

---

## Benefícios

- **Isolamento da infraestrutura**: a aplicação não conhece detalhes do `node-llama-cpp`.
- **Modularidade**: fácil adicionar suporte a outros modelos ou backends.
- **Testabilidade**: adapters podem ser mockados via interfaces do domínio.
- **Aderência à Clean Architecture**: dependências direcionadas da infraestrutura para o domínio.

---

## Próximos passos recomendados

- Implementar adapters para outros backends, se necessário.
- Criar testes unitários para os adapters.
- Evoluir os ports do domínio conforme surgirem novos requisitos.

---

## Estrutura final

```
src/core/domain/ports/
  iworker-service.port.ts
  imodel-manager.port.ts

src/core/infrastructure/llm/adapters/
  MistralGGUFAdapter.ts

src/core/infrastructure/worker/adapters/
  WorkerServiceAdapter.ts
```

---

## Status

Refatoração concluída e validada conforme critérios da issue.