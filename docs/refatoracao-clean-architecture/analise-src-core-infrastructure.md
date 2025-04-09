# Análise da pasta `src/core/infrastructure`

## Introdução

Este documento apresenta uma análise detalhada da estrutura da pasta `src/core/infrastructure`, com foco em identificar violações aos princípios da Clean Architecture e Clean Code. O objetivo é orientar a refatoração para melhorar a separação de responsabilidades, clareza, manutenibilidade e alinhamento arquitetural.

---

## Mapa da pasta `src/core/infrastructure`

- **db/**
  - `promptRepository.ts`
  - `client.ts`
  - `schema.ts`
- **electron/**
  - `electron-worker-adapter.ts`
  - `history-service.ts`
  - `github-token-manager.ts`
  - `main.ts`
- **github/**
  - `GithubService.ts`
- **worker/**
  - `LlamaWorker.ts`

---

## Análise detalhada

### Pasta `db`

#### `promptRepository.ts`

- **Organização geral:**  
  Contém uma classe repositório para prompts, com cerca de 250 linhas, centralizando operações de persistência, validação e regras de negócio.

- **Nomeação:**  
  O nome da classe e do arquivo são adequados, refletindo sua responsabilidade principal (persistência de prompts).

- **Tamanho e responsabilidades:**  
  - Classe excessivamente grande.  
  - Métodos como `createPrompt` e `updatePrompt` são longos e acumulam múltiplas responsabilidades:  
    - Validação de dados  
    - Aplicação de regras de negócio  
    - Persistência no banco de dados

- **Violações de Clean Code:**  
  - Funções longas e complexas, dificultando leitura e manutenção.  
  - Acúmulo de responsabilidades em métodos únicos.  
  - Possível duplicação de lógica de validação e regras de negócio.

- **Violações de Clean Architecture:**  
  - O repositório depende diretamente da camada **application** (`SettingsService`), criando dependência invertida e acoplamento inadequado.  
  - Mistura de lógica de domínio e regras de negócio com persistência, que deveria ser isolada.

- **Sugestões de melhoria:**  
  - Extrair validações e regras de negócio para a camada **domain** ou **application**.  
  - Dividir métodos longos em funções menores e específicas.  
  - Tornar o repositório responsável apenas pela persistência pura.  
  - Remover dependências da camada application, invertendo a dependência via interfaces.  
  - Avaliar dividir a classe em múltiplos repositórios ou serviços especializados, se necessário.

---

#### `client.ts` e `schema.ts`

- **Organização geral:**  
  Arquivos de configuração do banco de dados e definição de esquema.

- **Nomeação:**  
  Adequada e descritiva.

- **Tamanho e responsabilidades:**  
  Pequenos, focados em configuração.

- **Violações:**  
  Nenhuma identificada.

- **Sugestões:**  
  Manter como estão.

---

### Pasta `electron`

#### `electron-worker-adapter.ts`

- **Organização geral:**  
  Classe `ElectronWorkerAdapter` atua como adaptador para comunicação com workers Electron.

- **Nomeação:**  
  Adequada.

- **Tamanho e responsabilidades:**  
  Bem segmentada, responsabilidade clara.

- **Violações:**  
  Nenhuma relevante.

- **Sugestões:**  
  Manter estrutura atual.

---

#### `history-service.ts`

- **Organização geral:**  
  Classe `HistoryServiceImpl` para gerenciamento do histórico.

- **Nomeação:**  
  Adequada.

- **Tamanho e responsabilidades:**  
  Responsabilidades claras, código coeso.

- **Violações:**  
  Nenhuma relevante.

- **Sugestões:**  
  Manter estrutura atual.

---

#### `github-token-manager.ts` e `main.ts`

- **Organização geral:**  
  Scripts simples para integração com GitHub e inicialização Electron.

- **Nomeação:**  
  Adequada.

- **Tamanho e responsabilidades:**  
  Pequenos, focados.

- **Violações:**  
  Nenhuma relevante.

- **Sugestões:**  
  Manter como estão.

---

### Pasta `github`

#### `GithubService.ts`

- **Organização geral:**  
  Serviço para integração com API do GitHub.

- **Nomeação:**  
  Adequada.

- **Tamanho e responsabilidades:**  
  Responsabilidade clara, integração externa.

- **Violações:**  
  Nenhuma relevante.

- **Sugestões:**  
  Manter estrutura atual.

---

### Pasta `worker`

#### `LlamaWorker.ts`

- **Organização geral:**  
  Adaptador para execução local de modelos LLM.

- **Nomeação:**  
  Adequada.

- **Tamanho e responsabilidades:**  
  Responsabilidade clara.

- **Violações:**  
  Nenhuma relevante.

- **Sugestões:**  
  Manter estrutura atual.

---

## Conclusão geral

- O **principal problema** está concentrado no arquivo `promptRepository.ts`, que viola princípios de Clean Code e Clean Architecture devido ao excesso de responsabilidades, métodos longos e dependências inadequadas.
- As demais partes da infraestrutura estão bem segmentadas, com responsabilidades claras e alinhadas à arquitetura proposta.
- A **prioridade de refatoração** deve ser:  
  1. Isolar validações e regras de negócio do `PromptRepository`.  
  2. Reduzir o tamanho e complexidade dos métodos.  
  3. Eliminar dependências da camada application na infraestrutura.  
  4. Manter e revisar pontualmente os demais arquivos para garantir aderência contínua aos princípios.

---

## Resumo

- **Foco da refatoração:** `src/core/infrastructure/db/promptRepository.ts`
- **Objetivo:** Tornar a infraestrutura desacoplada, simples e alinhada à Clean Architecture
- **Benefícios esperados:**  
  - Código mais limpo, modular e testável  
  - Separação clara entre domínio, aplicação e infraestrutura  
  - Facilidade para manutenção e evolução futura