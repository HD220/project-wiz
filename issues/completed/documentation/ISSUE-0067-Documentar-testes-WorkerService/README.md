# ISSUE-0067: Documentar testes do WorkerService

## Descrição

Esta issue tem como objetivo documentar os testes implementados para o `WorkerService`. Os testes cobrem a inicialização, carregamento/descarga de modelos, envio de prompts, tratamento de erros e diferentes tipos de modelos.

## Estrutura dos testes

Os testes estão estruturados em blocos `describe` que agrupam testes relacionados a uma funcionalidade específica do `WorkerService`. Dentro de cada bloco `describe`, são utilizados blocos `it` para definir casos de teste individuais.

Os testes utilizam mocks para isolar o `WorkerService` de dependências externas, como o Electron e os modelos de LLM. Os mocks são criados utilizando a biblioteca `jest`. A configuração dos mocks do Electron simula o comportamento dos métodos `BrowserWindow`, `app`, `ipcMain` e `utilityProcess`, permitindo testar a lógica do `WorkerService` sem a necessidade de um ambiente Electron real. O `IPCManager` também é mockado para simular a comunicação entre o `WorkerService` e o processo worker.

Exemplo de estrutura de teste:

```typescript
describe("WorkerService", () => {
  let workerService: WorkerService;

  beforeEach(() => {
    workerService = new WorkerService();
  });

  it("should create a WorkerService instance", () => {
    expect(workerService).toBeInstanceOf(WorkerService);
  });
});
```

Exemplo de mock do Electron:

```typescript
jest.mock('electron', () => {
  const electron = {
    BrowserWindow: jest.fn().mockImplementation(() => {
      return {
        loadURL: jest.fn(),
        on: jest.fn(),
        webContents: {
          openDevTools: jest.fn(),
        },
      };
    }) as any,
    app: {
      on: jest.fn(),
      getPath: jest.fn(),
    } as any,
    ipcMain: {
      on: jest.fn(),
      handle: jest.fn(),
      removeHandler: jest.fn(),
    } as any,
    utilityProcess: {
      fork: jest.fn().mockReturnValue({
        postMessage: jest.fn(),
        on: jest.fn(),
        kill: jest.fn(),
      } as any),
    },
    MessageChannelMain: jest.fn(() => {
      return {
        port1: {
          start: jest.fn(),
          postMessage: jest.fn(),
          on: jest.fn(),
          close: jest.fn(),
        },
        port2: {
          start: jest.fn(),
          postMessage: jest.fn(),
          on: jest.fn(),
          close: jest.fn(),
        },
      };
    }) as any,
  };
  return electron;
});
```

## Casos de teste cobertos

Os testes cobrem os seguintes casos:

*   Inicialização do `WorkerService`
*   Carregamento e descarga de modelos
*   Envio de prompts para o worker
*   Tratamento de erros durante o envio de prompts
*   Testes com diferentes tipos de modelos (e.g., `LlamaCpp`)

## Utilização de mocks

Os testes utilizam mocks para isolar o `WorkerService` de dependências externas, como o Electron e os modelos de LLM. Os mocks são criados utilizando a biblioteca `jest`.

## Executando os testes

Para executar os testes, utilize o seguinte comando:

```bash
npm test
```

## Próximos passos