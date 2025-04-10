# Documentação dos Contratos, Interfaces e Value Objects da Camada Domain

## Value Objects e Contratos de Prompt

### `PromptParameter`

Representa a definição de um parâmetro utilizado em um prompt.

- **type**: Tipo do parâmetro. Pode ser `'string'`, `'number'`, `'boolean'`, `'date'` ou `'enum'`.
- **required**: Indica se o parâmetro é obrigatório (`true`) ou opcional (`false` ou ausente).
- **enum**: Lista de valores permitidos, utilizada quando o tipo é `'enum'`.

---

### `PromptParameters`

Um dicionário onde a chave é o nome do parâmetro e o valor é um objeto `PromptParameter` que define suas características.

Utilizado para descrever todos os parâmetros que um prompt pode aceitar.

---

### `PromptValues`

Um dicionário que associa o nome do parâmetro ao seu valor preenchido.

Os valores podem ser `string`, `number`, `boolean`, `Date` ou `undefined` (quando não preenchido).

---

### `Prompt`

Representa um prompt parametrizado.

- **text**: Texto base do prompt, que pode conter placeholders para os parâmetros.
- **parameters**: (Opcional) Conjunto de parâmetros (`PromptParameters`) que podem ser utilizados no prompt.

---

## Value Object de Streaming

### `StreamChunk`

Representa um fragmento de texto gerado durante o processo de streaming de uma resposta do modelo LLM.

- **content**: Texto parcial gerado pelo modelo.
- **isFinal**: Indica se este fragmento é o último da resposta (`true`) ou se ainda haverá mais fragmentos (`false`).

---

## Contratos de Dados de Prompt

### `PromptValidationConfig`

Define as regras e limites para validação de prompts.

- **maxPrompts**: Quantidade máxima de prompts permitidos.
- **maxContentLength**: Tamanho máximo do conteúdo do prompt.
- **maxVariables**: Número máximo de variáveis permitidas em um prompt.
- **forbiddenWords**: Lista de palavras proibidas no conteúdo do prompt.

---

### `VariableData`

Representa uma variável que pode ser utilizada dentro de um prompt.

- **id**: (Opcional) Identificador único da variável.
- **name**: Nome da variável.
- **type**: Tipo da variável (`string`, `number`, `boolean`, `date` ou `enum`).
- **required**: Indica se a variável é obrigatória.
- **defaultValue**: (Opcional) Valor padrão da variável.
- **options**: (Opcional) Lista de opções permitidas, usada quando o tipo é `enum`.

---

### `PromptData`

Representa um prompt completo com suas variáveis e metadados.

- **id**: (Opcional) Identificador único do prompt.
- **name**: Nome do prompt.
- **content**: Texto do prompt, que pode conter placeholders para variáveis.
- **variables**: Lista de variáveis (`VariableData`) utilizadas no prompt.
- **isDefault**: (Opcional) Indica se este prompt é o padrão.
- **isShared**: (Opcional) Indica se o prompt está compartilhado com outros usuários.
- **sharedLink**: (Opcional) Link para compartilhamento do prompt.

---

## Ports de Histórico de Conversas e Mensagens

### `ConversationHistoryPort`

Contrato para operações relacionadas ao gerenciamento de conversas.

- **getConversations()**: Retorna a lista de conversas existentes.
- **createConversation(title?)**: Cria uma nova conversa com título opcional.
- **deleteConversation(conversationId)**: Remove uma conversa pelo seu identificador.
- **renameConversation(conversationId, newTitle)**: Renomeia uma conversa existente.

---

### `MessageHistoryPort`

Contrato para operações relacionadas às mensagens dentro de uma conversa.

- **getMessages(conversationId)**: Retorna todas as mensagens de uma conversa específica.
- **addMessage(conversationId, role, content)**: Adiciona uma nova mensagem à conversa, informando o papel (`user` ou `assistant`) e o conteúdo.

---

### `HistoryExportPort`

Contrato para exportação do histórico de conversas e mensagens.

- **exportHistory(format)**: Exporta o histórico no formato especificado (`json` ou `csv`). Pode retornar um `Blob`, uma string ou `null` caso não haja dados.

---

## Port de Gerenciamento de Modelos

### `ModelManagementPort`

Contrato para gerenciamento do ciclo de vida dos modelos LLM.

- **downloadModel(options)**: Realiza o download de um modelo a partir das opções fornecidas. Retorna o caminho do arquivo baixado.
- **loadModel(modelPath, options?)**: Carrega o modelo localizado no caminho especificado, com opções adicionais opcionais.
- **unloadModel(modelPath)**: Descarrega o modelo da memória.
- **isModelLoaded(modelPath)**: Verifica se o modelo está carregado na memória, retornando `true` ou `false`.

---

## Ports de Worker Service

### `ModelLoaderPort`

Contrato para carregar e descarregar um modelo LLM no worker.

- **loadModel(options)**: Carrega o modelo com as opções fornecidas.
- **unloadModel()**: Descarrega o modelo atualmente carregado.

---

### `ModelDownloaderPort`

Contrato para baixar um modelo LLM.

- **downloadModel(options)**: Realiza o download do modelo com as opções especificadas. Retorna o caminho do arquivo baixado.

---

### `ContextManagerPort`

Contrato para criação do contexto de execução do modelo.

- **createContext(options?)**: Cria um contexto para execução do modelo, com opções opcionais.

---

### `PromptExecutorPort`

Contrato para execução de prompts no worker.

- **prompt(prompt, options?)**: Executa o prompt fornecido com as opções especificadas. Retorna a resposta gerada pelo modelo.

---

### `WorkerEventPort`

Contrato para escuta de eventos emitidos pelo worker.

- **on('response', listener)**: Escuta eventos de resposta gerada pelo modelo.
- **on('error', listener)**: Escuta eventos de erro ocorridos durante o processamento.
- **on('progress', listener)**: Escuta eventos de progresso do processamento, geralmente percentual.

---

## Ports de Bridge LLM

### `BridgeModelLoaderPort`

Contrato para carregamento de um modelo LLM via bridge.

- **loadModel(modelPath)**: Carrega o modelo localizado no caminho especificado.

---

### `BridgePromptExecutorPort`

Contrato para execução de prompts via bridge, com suporte a streaming.

- **prompt(prompt)**: Executa o prompt fornecido e retorna a resposta completa como string.
- **promptStream(prompt, onChunk)**: Executa o prompt fornecido e retorna os fragmentos da resposta via callback `onChunk`. Retorna um objeto com método `cancel()` para interromper o streaming.

---

## Ports de Serviço LLM

### `LlmModelLoaderPort`

Contrato para carregamento de um modelo LLM.

- **loadModel(modelPath)**: Carrega o modelo localizado no caminho especificado.

---

### `LlmPromptExecutorPort`

Contrato para execução de prompts e streaming com callback.

- **prompt(prompt)**: Executa o prompt fornecido e retorna a resposta completa como string.
- **promptStream(prompt, onChunk)**: Executa o prompt fornecido e envia os fragmentos da resposta via callback `onChunk`. Retorna uma Promise que é resolvida quando o streaming é concluído.

---