# ISSUE-0069: Refatorar comunicação IPC para utilizar `contextBridge` corretamente

**Tipo:** Improvement

**Descrição:**
A comunicação IPC entre o processo principal e o worker deve ser refatorada para utilizar o `contextBridge` corretamente, garantindo a segurança e a integridade da aplicação.

**Prioridade:** Alta

**Critérios de Aceitação:**
* A comunicação IPC utiliza o `contextBridge` corretamente.
* A aplicação funciona como esperado após a refatoração.
* Não há regressões.