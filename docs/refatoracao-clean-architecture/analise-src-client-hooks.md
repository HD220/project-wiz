# Análise da pasta `src/client/hooks`

## Mapeamento da pasta

- `llm-bridge.ts`: Ponte de comunicação com serviço LLM via MessagePort
- `use-history.ts`: Hook para gerenciar histórico de conversas e mensagens
- `use-llm.ts`: Hook para interagir com modelos LLM
- `use-mobile.ts`: Hook para detectar viewport mobile
- Subpasta `__tests__/` (não analisada)

---

## Arquivo: `llm-bridge.ts`

### Organização geral
- Define interface `ILlmBridge` e classe `LlmBridge` para comunicação IPC com serviço LLM.
- Gerencia requisições, streaming e cancelamento.
- Código coeso, focado na ponte IPC.

### Nomeação
- Nomes claros e descritivos para interface, classe, métodos e variáveis.

### Tamanho e responsabilidades
- Funções pequenas, únicas responsabilidades.
- Nenhuma função excede 20 linhas.

### Violações Clean Code
- Nenhuma violação detectada.

### Violações Clean Architecture
- Mistura infraestrutura (ponte IPC) na pasta de hooks React.
- **Sugestão:** mover para `src/core/infrastructure/worker` ou `src/client/infrastructure`.
- Extrair interface para `core/domain/ports`.

---

## Arquivo: `use-history.ts`

### Organização geral
- Hook React para CRUD de conversas/mensagens via `window.historyAPI`.
- Define interfaces locais.
- Expõe funções assíncronas com `useCallback`.

### Nomeação
- Nomes claros e descritivos.

### Tamanho e responsabilidades
- Funções pequenas e focadas.
- Hook com aproximadamente 180 linhas, poderia ser dividido para maior coesão.

### Violações Clean Code
- Nenhuma grave, mas hook grande demais.
- **Sugestão:** dividir em hooks menores (`useConversations`, `useMessages`).

### Violações Clean Architecture
- Acessa diretamente API de infraestrutura.
- **Sugestão:** extrair dependências para serviços injetáveis.

---

## Arquivo: `use-llm.ts`

### Organização geral
- Hook React para interagir com LLM via `ILlmBridge`.
- Define interfaces para opções e retorno.
- Usa `executeOperation` para padronizar erros e loading.

### Nomeação
- Nomes claros e descritivos.

### Tamanho e responsabilidades
- Funções pequenas e focadas.
- Hook com tamanho adequado (~65 linhas).

### Violações Clean Code
- Nenhuma.

### Violações Clean Architecture
- Depende diretamente da ponte de infraestrutura.
- Funções não implementadas (stubs).
- **Sugestão:** extrair dependências para serviços do domínio, dividir responsabilidades.

---

## Arquivo: `use-mobile.ts`

### Organização geral
- Hook simples para detectar viewport mobile.
- Código enxuto e focado.

### Nomeação
- Nomes claros.

### Tamanho e responsabilidades
- Função pequena, única responsabilidade.

### Violações Clean Code
- Nenhuma.

### Violações Clean Architecture
- Nenhuma.

---

## Resumo geral e recomendações

- **Separar infraestrutura da camada de hooks React.**
- **Mover `llm-bridge.ts` para infraestrutura.**
- **Extrair interfaces para domínio.**
- **Dividir hooks grandes em menores e mais coesos.**
- **Injetar dependências via contexto ou parâmetros, evitando acoplamento direto.**