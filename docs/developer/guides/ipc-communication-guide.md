# Guia: Padrão de Comunicação IPC

Este guia documenta o padrão para a comunicação entre o processo principal (Main) e o de renderização (Renderer) no Project Wiz. Seguir este padrão é crucial para garantir clareza, segurança de tipo e manutenibilidade.

## Visão Geral da Estrutura

A comunicação IPC é definida no diretório `src/shared/ipc-types/` e é dividida em quatro arquivos principais:

1.  **`domain-types.ts`**: Contém as definições de interface para as entidades de domínio compartilhadas (ex: `IProject`, `IPersona`). Estes são os tipos de dados puros, sem qualquer relação com o transporte.

2.  **`ipc-channels.ts`**: Define um `enum` chamado `IpcChannel` que contém todos os nomes de canais IPC como constantes. Isso evita o uso de strings mágicas e garante a consistência dos nomes dos canais.

3.  **`ipc-payloads.ts`**: Define todas as interfaces para os payloads de `request` e `response` da comunicação. Por exemplo, `IpcProjectCreatePayload` e `IpcProjectCreateResponse`.

4.  **`ipc-contracts.ts`**: Este é o arquivo central que une tudo. Ele define uma única interface `IpcContracts` que mapeia cada canal do `IpcChannel` para seus respectivos tipos de payload de request e response. Ele serve como a fonte da verdade para a segurança de tipo em toda a comunicação.

## Como Adicionar um Novo Ponto de Comunicação IPC

Siga estes passos para adicionar um novo evento IPC (por exemplo, para obter um projeto por ID).

### Passo 1: Definir o Canal

Abra `src/shared/ipc-types/ipc-channels.ts` e adicione uma nova entrada ao enum `IpcChannel`.

```typescript
export enum IpcChannel {
  // ... outros canais
  PROJECT_GET_BY_ID = "project:get-by-id",
}
```

### Passo 2: Definir os Payloads

Abra `src/shared/ipc-types/ipc-payloads.ts` e defina as interfaces para o request e o response.

```typescript
// ... outros payloads

// Project Management Module
// ...
export interface IpcProjectGetByIdPayload {
  id: string;
}
export type IpcProjectGetByIdResponse = IpcResponse<IProject | undefined>;
```

### Passo 3: Definir o Contrato

Abra `src/shared/ipc-types/ipc-contracts.ts` e adicione a nova entrada à interface `IpcContracts`.

```typescript
// ... outras importações de payload
import {
  IpcProjectGetByIdPayload,
  IpcProjectGetByIdResponse,
} from "./ipc-payloads";

export interface IpcContracts {
  // ... outros contratos
  [IpcChannel.PROJECT_GET_BY_ID]: {
    request: IpcProjectGetByIdPayload;
    response: IpcProjectGetByIdResponse;
  };
}
```

### Passo 4: Implementar o Handler no Main Process

No módulo correspondente no processo principal (ex: `src/main/modules/project-management/ipc-handlers.ts`), adicione o handler para o novo canal.

```typescript
// ...
ipcMain.handle(
  IpcChannel.PROJECT_GET_BY_ID,
  async (event, payload: IpcProjectGetByIdPayload) => {
    // sua lógica aqui
  },
);
```

### Passo 5: Chamar o IPC no Renderer Process

No processo de renderização, use o `ipcRenderer` para invocar o canal com o payload correto.

```typescript
const project = await window.ipcRenderer.invoke(IpcChannel.PROJECT_GET_BY_ID, {
  id: "some-project-id",
});
```

Seguindo este padrão, garantimos que toda a comunicação IPC seja centralizada, previsível e totalmente type-safe.
