# Changelog

## [1.2.0] - 2025-06-15
### Added
- Padronização da estrutura Result para todas as operações IPC:
  - `Result<T, E>` com métodos utilitários (ok, err, isOk, isErr)
  - Exemplo:
    ```typescript
    const result = await ipcService.invoke('some-operation');
    if (result.isOk()) {
      // Tratar sucesso
    } else {
      // Tratar erro
    }
    ```
- Serializador customizado para comunicação IPC:
  - Suporte a tipos complexos (Date, Error, custom classes)
  - Exemplo:
    ```typescript
    // Envio
    await ipcService.invoke('save-data', { date: new Date() });
    
    // Recebimento
    const result = await ipcService.invoke('get-data');
    // result.date é uma instância de Date
    ```
- Sistema de retry automático para operações IPC:
  - Configuração de tentativas e delay exponencial
  - Exemplo:
    ```typescript
    ipcService.configureRetry({
      maxAttempts: 3,
      delayMs: 1000,
      retryableErrors: ['ECONNRESET', 'ETIMEDOUT']
    });
    ```

### Changed
- Melhorias no tratamento de datas na comunicação IPC:
  - Serialização/deserialização automática de objetos Date
  - Suporte a fusos horários e formatação consistente
- Padronização de erros IPC com códigos e mensagens claras

### Fixed
- Correção na serialização de erros customizados
- Tratamento adequado de conexões perdidas

### Migration Notes
- Atualizações necessárias para consumidores da API IPC:
  - Todas as chamadas agora retornam `Result<T, E>`
  - Erros devem ser tratados via `result.isErr()`
  - Objetos Date não precisam mais de conversão manual

### Minimum Requirements
- Electron v25+
- Node.js v18+
- TypeScript v5+

## [1.1.0] - 2025-05-30
### Added
- Novos métodos na interface IQueueRepository:
  - `markJobAsStarted(id: string): Promise<void>`
  - `markJobAsDelayed(id: string, delayUntil: Date): Promise<void>`
- Suporte a estados adicionais de jobs no WorkerService
- Atualização do método getNextJob para retornar Result<Job | null>

### Changed
- WorkerService agora marca jobs como iniciados antes do processamento
- WorkerService usa markJobAsDelayed para jobs com retry
- Melhor tratamento de erros no DrizzleQueueRepository

### Fixed
- Corrigida a lógica de seleção de jobs considerando estados adicionais
- Implementação de wrapper de transações no DrizzleQueueRepository:
  - Garantia de atomicidade nas operações de persistência
  - Tratamento de erros com rollback automático
  - Métodos afetados:
    - `save(job: Job): Promise<void>`
    - `markJobAsCompleted(id: string): Promise<void>`
    - `markJobAsFailed(id: string, error: Error): Promise<void>`
  - Referência ao [ADR-002](./docs/adr/002-transaction-pattern.md) sobre padrão de transações