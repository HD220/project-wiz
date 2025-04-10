# ADR-0008: Nomenclatura e Arquitetura dos Serviços LLM

## Status

Aceito

## Contexto

- Os serviços LLM atualmente usam termos como "Worker" que não refletem precisamente sua implementação via `utilityProcess.fork`
- A comunicação entre processos está implementada mas com nomenclatura confusa
- Necessidade de clareza conceitual entre:
  - Processos principais
  - Processos de serviço (utility processes)
  - Canais de comunicação

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

## Alternativas Consideradas

1. **Manter nomenclatura atual**
   - Rejeitado por perpetuar confusão conceitual

2. **Usar Web Workers**
   - Rejeitado por limitações técnicas no Electron

3. **Implementar como serviços separados**
   - Rejeitado por complexidade desnecessária

## Links Relacionados

- [Documentação utilityProcess](https://www.electronjs.org/docs/latest/api/utility-process)
- [Exemplo MessageChannelMain](https://github.com/electron/electron/blob/main/docs/api/message-channel-main.md)