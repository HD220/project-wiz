# Refatoração do LlamaWorker para LlamaChatSession

## Objetivo

Refatorar o `llama-worker.ts` para usar exclusivamente o `LlamaChatSession` para todas as interações de geração de texto.

## Principais Mudanças

### 1. Importações

- Adicionados tipos específicos do node-llama-cpp
- Importação direta de `LlamaChatSession`, `LlamaChatSessionOptions`, etc.

### 2. Método `loadModel`

- Aceita diretamente um objeto `LlamaModelOptions`
- Usa `fileInsights.modelSize` para obter informações do modelo
- Maior flexibilidade e compatibilidade com a API atual

### 3. Método `ensureChatSession`

- Criação flexível da sessão de chat
- Suporte a opções avançadas como prompt de sistema
- Uso de `contextSequence` conforme recomendado na documentação

### 4. Método `generateText`

- Unificação dos métodos de geração de texto
- Suporte a prompt simples e sequências de chat
- Tratamento inteligente de diferentes tipos de mensagens
- Passagem direta de todas as opções do LlamaChatSession

### 5. Tratamento de Entrada

- Suporte a entrada como string ou array de `ChatHistoryItem`
- Configuração automática do histórico de chat
- Seleção inteligente do prompt baseado no tipo da última mensagem

## Benefícios da Refatoração

- Código mais limpo e moderno
- Maior flexibilidade na geração de texto
- Suporte completo às funcionalidades do LlamaChatSession
- Melhor manutenibilidade

## Próximos Passos

- Testes abrangentes
- Documentação detalhada
- Monitoramento de performance
