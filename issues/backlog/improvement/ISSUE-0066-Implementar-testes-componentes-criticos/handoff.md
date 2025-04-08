# Handoff - Implementar testes para componentes críticos

## Configuração Inicial

A configuração do Jest já está adequada para testes de serviços e hooks. Verifique:

1. Dependências já instaladas (package.json):
```json
"@testing-library/react": "^13.4.0",
"@testing-library/jest-dom": "^5.16.5",
"@testing-library/user-event": "^14.4.3",
"@testing-library/react-hooks": "^8.0.1"
```

## Estrutura de Pastas

Manter testes junto aos arquivos testados:
```
src/core/services/
  WorkerService.ts
  WorkerService.test.ts
  llm/
    LLMService.ts
    LLMService.test.ts

src/client/hooks/
  use-llm.ts
  use-llm.test.ts
```

## Exemplos de Testes

### Teste de Serviço (WorkerService)
```typescript
import WorkerService from './WorkerService';
import { mockedWorker } from '../__mocks__/worker';

jest.mock('../events/bridge');

describe('WorkerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize workers correctly', async () => {
    const service = new WorkerService();
    await service.init();
    expect(service.workers.length).toBe(2);
  });

  it('should handle worker errors', async () => {
    const service = new WorkerService();
    jest.spyOn(service, 'startWorker').mockRejectedValue(new Error('Failed'));
    
    await expect(service.init()).rejects.toThrow('Failed to initialize workers');
  });
});
```

### Teste de Hook (useLLM)
```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useLLM } from './use-llm';
import { LLMService } from '../services/llm/LLMService';

jest.mock('../services/llm/LLMService');

describe('useLLM', () => {
  it('should return initial loading state', () => {
    const { result } = renderHook(() => useLLM());
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle successful completion', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useLLM());
    
    act(() => {
      result.current.sendPrompt('Test prompt');
    });

    await waitForNextUpdate();
    expect(result.current.response).toBe('Mock response');
  });
});
```

### Teste de Integração (IPC Bridge)
```typescript
import { ipcRenderer } from 'electron';
import { handleIPCRequests } from './bridge';

describe('IPC Bridge', () => {
  beforeAll(() => {
    // Mock IPC methods
    ipcRenderer.invoke = jest.fn().mockResolvedValue({});
  });

  it('should handle getModels request', async () => {
    const response = await handleIPCRequests({
      type: 'getModels',
      payload: null
    });
    
    expect(ipcRenderer.invoke).toHaveBeenCalledWith('get-models');
    expect(response).toEqual({ models: [] });
  });
});
```

## Boas Práticas

1. **Mocking**:
   - Criar mocks em `src/__mocks__/` para serviços externos
   - Usar `jest.mock()` para substituir implementações

2. **Testes Assíncronos**:
   - Usar `async/await` ou `waitForNextUpdate` para hooks
   - Testar estados de loading/error

3. **Edge Cases**:
   - Sempre testar cenários de erro
   - Testar limites e valores inválidos

4. **Cobertura**:
   - Focar em caminhos críticos primeiro
   - Usar `jest --coverage` para verificar

## Dicas

1. Para testar timers:
```typescript
jest.useFakeTimers();

it('should debounce requests', () => {
  const { result } = renderHook(() => useDebouncedSearch());
  
  act(() => {
    result.current.setQuery('test');
    jest.advanceTimersByTime(300);
  });

  expect(result.current.results).toEqual(['test result']);
});
```

2. Para mockar módulos:
```typescript
jest.mock('electron', () => ({
  ipcRenderer: {
    invoke: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn()
  }
}));
```

## Referências Úteis
- [Jest Mocking](https://jestjs.io/docs/mock-functions)
- [Testing Async Hooks](https://react-hooks-testing-library.com/)
- [Integration Testing](https://testing-library.com/docs/react-testing-library/intro/)