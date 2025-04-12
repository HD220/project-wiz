# ADR-0008: Nomenclatura e Arquitetura dos Serviços LLM

## Status

- 🟢 **Aceito**

---

## Contexto

Os serviços LLM utilizavam termos como "Worker" que não refletiam precisamente sua implementação via `utilityProcess.fork`. A comunicação entre processos estava implementada, mas com nomenclatura confusa. Havia necessidade de clareza conceitual entre:
- Processos principais
- Processos de serviço (utility processes)
- Canais de comunicação

---

## Decisão

- Renomear componentes conforme nova nomenclatura:
  - `WorkerManager` → `ProcessManager`
  - `WorkerService` → `InferenceService`
  - `Worker` → `InferenceProcess`
- Reorganizar estrutura de pastas:
  ```
  src/core/services/llm/
  ├── core/          # Serviços principais
  ├── processes/     # Gerenciamento de processos
  ├── ipc/           # Comunicação entre processos
  └── interfaces.ts  # Contratos públicos
  ```
- Implementar comunicação baseada em:
  - `utilityProcess.fork` para processos filhos
  - `MessageChannelMain` para comunicação
  - Schemas Zod para validação

---

## Consequências

**Positivas:**
- Maior clareza conceitual
- Melhor organização do código
- Comunicação mais robusta
- Facilita adição de novos tipos de processos

**Negativas:**
- Refatoração necessária em vários arquivos
- Atualização da documentação existente
- Potencial quebra de compatibilidade temporária

---

## Alternativas Consideradas

- **Manter nomenclatura atual** — rejeitado por perpetuar confusão conceitual.
- **Usar Web Workers** — rejeitado por limitações técnicas no Electron.
- **Implementar como serviços separados** — rejeitado por complexidade desnecessária.

---

## Links Relacionados

- [Documentação utilityProcess (Electron)](https://www.electronjs.org/docs/latest/api/utility-process)
- [Exemplo MessageChannelMain (Electron)](https://github.com/electron/electron/blob/main/docs/api/message-channel-main.md)
- [ISSUE-0068 - Consolidação dos serviços LLM](../../issues/backlog/improvement/ISSUE-0068-Consolidacao-servicos-LLM/README.md)