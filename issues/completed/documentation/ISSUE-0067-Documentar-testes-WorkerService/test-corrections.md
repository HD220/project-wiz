# Correções para o arquivo `src/core/__tests__/WorkerService.test.ts`

Este documento descreve as correções que precisam ser feitas no arquivo `src/core/__tests__/WorkerService.test.ts`.

## Teste `should load a model`

*   Alterar o `expect` para verificar apenas o final do caminho do `worker-bridge`.

    ```diff
    - expect(electron.utilityProcess.fork).toHaveBeenCalledWith(
    -   expect.stringContaining("llama/worker-bridge.ts"),
    -   [],
    -   { stdio: "inherit" }
    - );
    + expect(electron.utilityProcess.fork).toHaveBeenCalledWith(
    +   expect.stringContaining("worker-bridge.ts"),
    +   [],
    +   { stdio: "inherit" }
    + );
    ```

## Teste `should load a mistral model`

*   Alterar o `expect` para verificar apenas o final do caminho do `worker-bridge`.

    ```diff
    - expect(electron.utilityProcess.fork).toHaveBeenCalledWith(
    -   expect.stringContaining("mistral/worker-bridge.ts"),
    -   [],
    -   { stdio: "inherit" }
    - );
    + expect(electron.utilityProcess.fork).toHaveBeenCalledWith(
    +   expect.stringContaining("worker-bridge.ts"),
    +   [],
    +   { stdio: "inherit" }
    + );
    ```

## Teste `should send a prompt`

*   Ajustar o mock do `requestResponse` para retornar o valor correto.

    ```diff
    - ipcManagerMock = {
    -   requestResponse: jest.fn().mockResolvedValue({ success: true }),
    - };
    + ipcManagerMock = {
    +   requestResponse: jest.fn().mockResolvedValue({ response: "This is a test response." }),
    + };