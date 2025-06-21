# ADR-003: Arquitetura de Comunicação IPC no Electron

## Status
**Proposto** - 15/06/2025

## Contexto
A aplicação Electron necessita de uma comunicação robusta e padronizada entre os processos Main (Node.js) e Renderer (Browser). Atualmente existem handlers IPC básicos, mas sem:
- Protocolo de mensagens bem definido
- Tipos de eventos categorizados
- Estrutura de dados consistente
- Mecanismos de sincronização claros

## Decisão
Implementar uma arquitetura IPC com as seguintes características:

### 1. Protocolo de Mensagens
Padronizar os nomes de canais IPC no formato:
```
[scope]:[entity]:[action]
```
Onde:
- `scope`: Define o contexto (query, command, event)
- `entity`: Entidade/domínio relacionado
- `action`: Ação específica

Exemplos:
- `query:user:get`
- `command:job:create`
- `event:job:updated`

### 2. Tipos de Eventos
Categorizar os eventos em 3 tipos principais:

#### a. Queries (Síncronas)
- Requisição-resposta imediata
- Usar `ipcRenderer.invoke()` / `ipcMain.handle()`
- Retornam Promise com os dados ou erro

#### b. Commands (Assíncronas)
- Disparam ações no main process
- Usar `ipcRenderer.send()` / `ipcMain.on()
- Não esperam resposta direta

#### c. Events (Pub/Sub)
- Notificações do main para renderer
- Usar `ipcRenderer.on() / ipcMain.emit()`
- Pode ser usado para atualizações de estado

### 3. Estrutura de Dados
Todas as mensagens devem seguir o formato:
```typescript
interface IpcMessage<T = any> {
  type: string; // Tipo da mensagem
  payload?: T; // Dados principais
  meta?: {
    timestamp: number;
    correlationId?: string; // Para rastreamento
    // Outros metadados
  };
}
```

### 4. Mecanismos de Sincronização
Implementar:
- **Correlation IDs**: Para rastrear requisições assíncronas
- **Ack/Nack**: Confirmação de recebimento
- **Timeouts**: Para queries síncronas
- **Retry Policies**: Para comunicações falhas

## Consequências
- **Positivas**:
  - Comunicação mais consistente e previsível
  - Melhor rastreabilidade
  - Mais fácil de manter e estender
- **Negativas**:
  - Necessidade de refatorar handlers existentes
  - Curva de aprendizado para novos desenvolvedores

## Implementação

### 1. API do Preload (preload.ts)
A API exposta via contextBridge deve seguir a interface ElectronAPI tipada, incluindo:

- Métodos para queries (requisição-resposta)
- Métodos para commands (ações sem resposta)
- Sistema de subscriptions para eventos
- Utilitários como geração de correlation IDs

### 2. IpcManager (main process)
Classe central para gerenciamento de handlers IPC no main process, com:

- Registro padronizado de handlers
- Emissão de eventos para todos os windows
- Tratamento centralizado de erros

### 3. Registro de Handlers
Exemplo de como registrar handlers usando o IpcManager para diferentes tipos de operações.

### 4. Guia de Uso
Exemplos concretos de uso tanto no renderer quanto no main process.