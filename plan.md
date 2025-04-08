# Plano de Refatoração do Mock do Electron e Teste de Integração

**Objetivo:** Refatorar o mock do Electron em `src/core/__mocks__/electron.ts` e atualizar o teste de integração `src/core/__tests__/integration/worker.integration.test.ts` para corrigir erros de TypeScript e garantir o funcionamento correto dos testes.

**Plano Detalhado:**

1.  **Refatorar o mock do Electron:**
    *   Garantir que o mock do Electron em `src/core/__mocks__/electron.ts` exporte todas as propriedades e métodos necessários, incluindo `app` e `ipcMain`.
    *   Adicionar a definição de `app` ao mock do Electron.
        ```typescript
        const app = {
          getPath: jest.fn().mockReturnValue('/test/path'),
          whenReady: jest.fn().mockResolvedValue(undefined),
        };
        ```
    *   Adicionar a função `whenReady` ao mock do `app`.
2.  **Atualizar o teste de integração (`src/core/__tests__/integration/worker.integration.test.ts`):**
    *   Remover a importação `import electron from 'electron';` (linha 2).
    *   Usar `jest.mock('electron', () => require('../../__mocks__/electron').default);` no início do arquivo de teste para mockar o módulo `electron`.
    *   Remover todas as linhas de atribuição `ipcMain = electron.ipcMain;` e `app = electron.app;` dentro do `beforeAll` (linhas 28-473).
    *   Remover as linhas `const electron = require("electron");` (linhas 454 e 465) dentro do `beforeAll`.
    *   Atualizar o `beforeAll` para obter as propriedades mockadas do Electron a partir do módulo mockado e configurar o mock do `whenReady` corretamente.
        ```typescript
        beforeAll(() => {
          const electron = require('electron');
          ipcMain = electron.ipcMain;
          app = electron.app;
          (app.whenReady as jest.Mock).mockImplementation(() => Promise.resolve());
        });
        ```
3.  **Verificar o mock do `WorkerService`:** Garantir que o mock do `WorkerService` esteja funcionando como esperado.
4.  **Executar os testes:** Executar os testes de integração para verificar se o mock está funcionando corretamente e se os erros de TypeScript foram resolvidos.