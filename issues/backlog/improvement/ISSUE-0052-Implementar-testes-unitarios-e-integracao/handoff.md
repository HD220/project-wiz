## Handoff

Este documento detalha os passos para implementar testes unitários e de integração para o projeto.

### 1. Escopo dos Testes

- **Core (WorkerService):**
  - Testes unitários para verificar a lógica interna do `WorkerService`, como:
    - Inicialização correta do worker process.
    - Comunicação com o worker process através do `IPCManager`.
    - Gerenciamento de modelos carregados (carregar, descarregar, limpar modelos antigos).
    - Monitoramento de uso de memória.
  - Testes de integração para verificar a interação do `WorkerService` com outros serviços do core.
- **Frontend (Componentes e Hooks):**
  - Testes unitários para verificar a lógica e o comportamento individual de cada componente da UI, como:
    - Renderização correta com diferentes props.
    - Interação com o usuário (cliques, entradas de texto, etc.).
    - Atualização do estado do componente.
  - Testes unitários para verificar a lógica dos hooks, como o `useLLM`:
    - Verificar se o hook retorna os valores corretos.
    - Verificar se o hook lida com erros corretamente.
    - Verificar se o hook faz as chamadas corretas para o backend.

### 2. Configuração do Ambiente de Testes

- Verificar a configuração do Jest (arquivo `jest.config.ts`).
- Garantir que as dependências necessárias estejam instaladas (`@testing-library/react`, `@testing-library/jest-dom`, etc.).

### 3. Implementação dos Testes

- Criar arquivos de teste para os componentes e serviços identificados.
- Escrever testes unitários para verificar a lógica individual de cada componente/serviço.
- Escrever testes de integração para verificar a interação entre diferentes componentes/serviços.

### 4. Documentação

- Atualizar a documentação sobre a estratégia de testes (`docs/testing-strategy.md`) para incluir detalhes sobre os testes unitários e de integração.
