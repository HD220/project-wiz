# Plano de Implementação da Refatoração do LlamaWorker

## Objetivo

Refatorar o `llama-worker.ts` para usar exclusivamente o `LlamaChatSession` para todas as interações de geração de texto, mantendo suporte completo às opções nativas da biblioteca node-llama-cpp.

## Etapas de Implementação

### 1. Modificação de Importações

```typescript
import {
  Llama,
  LlamaContext,
  LlamaModel,
  LlamaChatSession,
  LlamaChatPromptOptions,
  ChatMessage,
} from "node-llama-cpp";
```

### 2. Adição da Propriedade chatSession

```typescript
class LlamaWorker {
  private llamaInstance: Llama = null;
  private model: LlamaModel = null;
  private context: LlamaContext = null;
  private chatSession: LlamaChatSession = null;
  private port: MessagePortMain;
  private abortController: AbortController | null = null;
  private downloadAbortController: AbortController | null = null;

  // ... resto do código
}
```

### 3. Implementação do Método ensureChatSession

```typescript
/**
 * Garante que uma sessão de chat esteja disponível
 * @param systemPrompt Prompt de sistema opcional
 */
private async ensureChatSession(systemPrompt?: string) {
  if (!this.context) {
    throw new Error("Contexto não criado");
  }

  if (!this.chatSession) {
    this.chatSession = new LlamaChatSession({
      contextSequence: this.context.getSequence(),
      systemPrompt: systemPrompt
    });
  }
}
```

### 4. Modificação do Método createContext

```typescript
/**
 * Cria um contexto para geração de texto
 */
private async createContext() {
  if (!this.model) {
    throw new Error("Modelo não carregado");
  }

  try {
    this.sendInfo("Criando contexto...");
    this.context = await this.model.createContext();

    // Limpar a sessão de chat anterior, se existir
    if (this.chatSession) {
      this.chatSession = null;
    }

    this.sendInfo("Contexto criado com sucesso");
  } catch (error: any) {
    this.sendError("Erro ao criar contexto", error.message);
    throw error;
  }
}
```

### 5. Implementação do Método Unificado de Geração

```typescript
/**
 * Gera texto usando LlamaChatSession
 * @param input Texto de entrada ou mensagens de chat
 * @param options Opções de geração
 */
private async generateText(input: string | ChatMessage[], options?: any) {
  try {
    this.sendInfo("Gerando texto...");
    this.abortController = new AbortController();

    // Garantir que a sessão de chat existe
    await this.ensureChatSession(options?.systemPrompt);

    let fullText = "";

    // Preparar opções para o LlamaChatSession
    const promptOptions: LlamaChatPromptOptions = {
      // Passar todas as opções diretamente para manter compatibilidade com a API
      ...options,

      // Garantir que o signal e onTextChunk estejam configurados
      signal: this.abortController.signal,
      onTextChunk: (chunk: string) => {
        this.sendCompletionChunk(chunk);
        fullText += chunk;
      }
    };

    // Determinar se a entrada é um prompt simples ou mensagens de chat
    if (typeof input === 'string') {
      // Caso de prompt simples
      await this.chatSession.prompt(input, promptOptions);
    } else {
      // Caso de mensagens de chat
      // Definir o histórico de chat
      this.chatSession.setChatHistory(input.slice(0, -1));

      // Usar a última mensagem como prompt
      const lastMessage = input[input.length - 1];
      await this.chatSession.prompt(lastMessage.content, promptOptions);
    }

    // Calcular estatísticas aproximadas
    const inputSize = typeof input === 'string'
      ? input.length / 4
      : JSON.stringify(input).length / 4;

    this.sendCompletionDone(fullText, {
      promptTokens: inputSize,
      completionTokens: fullText.length / 4,
      totalTokens: (inputSize + fullText.length / 4)
    });

    this.sendInfo("Geração de texto concluída");
  } catch (error: any) {
    if (error.name === "AbortError") {
      this.sendInfo("Geração abortada pelo usuário");
    } else {
      this.sendError("Erro ao gerar texto", error.message);
      throw error;
    }
  }
}
```

### 6. Atualização do Método cleanup

```typescript
/**
 * Libera recursos ao encerrar o worker
 */
public cleanup() {
  this.abort();
  this.abortDownload();

  if (this.chatSession) {
    this.chatSession = null;
  }

  if (this.context) {
    this.context.dispose();
    this.context = null;
  }

  if (this.model) {
    this.model.dispose();
    this.model = null;
  }

  this.sendInfo("Recursos liberados");
  this.port.close();
}
```

### 7. Adaptação dos Handlers de Mensagens

```typescript
private async handleMessage(message: any) {
  switch (message.type) {
    case "init":
      await this.initialize(message.options);
      break;
    case "load_model":
      await this.loadModel(message.modelPath, message.options);
      break;
    case "create_context":
      await this.createContext();
      break;
    case "generate_completion":
      // Usar o novo método unificado para prompt simples
      await this.generateText(message.prompt, message.options);
      break;
    case "generate_chat_completion":
      // Usar o novo método unificado para mensagens de chat
      await this.generateText(message.messages, message.options);
      break;
    case "download_model":
      await this.downloadModel(message.modelId, message.requestId);
      break;
    case "abort":
      this.abort();
      break;
    case "abort_download":
      this.abortDownload();
      break;
    default:
      this.sendError(`Tipo de mensagem desconhecido: ${message.type}`);
  }
}
```

## Suporte Completo às Opções do LlamaChatSession

A implementação acima passa todas as opções recebidas diretamente para o método `prompt()` do LlamaChatSession, o que permite suporte completo a todas as funcionalidades da biblioteca, incluindo:

1. **Controle de Temperatura e Seed**

   ```typescript
   temperature: 0.8,
   topK: 40,
   topP: 0.02,
   seed: 2462
   ```

2. **Sistema de Prompt Personalizado**

   ```typescript
   systemPrompt: "You are a helpful, respectful and honest assistant...";
   ```

3. **Streaming de Resposta**

   ```typescript
   onTextChunk: (chunk) => { ... }
   ```

4. **Suporte a Gramáticas (JSON)**

   ```typescript
   grammar: await llama.getGrammarFor("json");
   ```

5. **Function Calling**

   ```typescript
   functions: { ... }
   ```

6. **Controle de Repetição**

   ```typescript
   repeatPenalty: { ... }
   ```

7. **Prefixo de Resposta**

   ```typescript
   responsePrefix: "The weather today is";
   ```

8. **Controle de Geração**
   ```typescript
   stopOnAbortSignal: true,
   signal: abortController.signal
   ```

## Testes e Validação

Para validar a implementação, serão necessários testes para:

1. Geração de texto com prompt simples
2. Geração de texto com mensagens de chat
3. Streaming de resposta
4. Uso de diferentes opções de geração
5. Tratamento de erros
6. Abortar geração em andamento

## Próximos Passos

1. Implementar as alterações conforme o plano
2. Testar cada funcionalidade
3. Documentar a nova implementação
4. Integrar com o restante do sistema
