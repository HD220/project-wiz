# Changelog

## [1.0.0] - 2025-03-29

### Added
- Implementação da classe `LlamaWorker` para gerenciamento de modelos LLM
- Métodos `handleChatCompletionForTextMessage` e `handleChatCompletionMessage` para processamento de mensagens
- Suporte a inicialização e destruição de modelos via `initializeModel` e `dispose`
- Tratamento de erros e mensagens via MessagePortMain do Electron

### Changed
- Refatoração da tipagem das mensagens e respostas
- Melhorias na estrutura de comunicação entre processos

### Fixed
- Correções na tipagem dos métodos e interfaces
- Tratamento adequado de erros nas operações assíncronas