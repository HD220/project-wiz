# Referência da API

(Em desenvolvimento)

---

## Hook `useLLM`

Hook React para interação com o serviço backend de LLM via IPC. Permite carregar e descarregar modelos, gerar texto, consultar modelos disponíveis e configurar opções do contexto do modelo.

Ideal para integrar funcionalidades de LLM em componentes React, com gerenciamento automático de estado de carregamento e erros.

### Importação

```typescript
import { useLLM } from "@/client/hooks/use-llm";
```

### Retorno

O hook retorna um objeto com as seguintes propriedades e métodos:

| Propriedade / Método            | Tipo / Assinatura                                                                 | Descrição                                                                                   |
|---------------------------------|-----------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------|
| `isLoading`                     | `boolean`                                                                         | Indica se alguma operação está em andamento                                                |
| `error`                         | `Error \| null`                                                                   | Objeto de erro caso alguma operação falhe                                                   |
| `loadModel`                     | `(options: ModelOptions) => Promise<void>`                                        | Carrega um modelo LLM com as opções fornecidas                                              |
| `unloadModel`                   | `() => Promise<void>`                                                             | Descarrega o modelo atualmente carregado                                                    |
| `generate`                      | `(options: GenerateOptions) => Promise<string>`                                   | Gera texto a partir do prompt fornecido                                                     |
| `getLoadedModel`                | `() => Promise<ModelOptions \| null>`                                             | Obtém informações do modelo atualmente carregado                                            |
| `getAvailableModels`            | `() => Promise<ModelOptions[]>`                                                   | Lista todos os modelos disponíveis                                                          |
| `setOptions`                    | `(options: LlamaContextOptions) => Promise<void>`                                 | Define opções do contexto do modelo                                                         |

---

### Interfaces

#### `ModelOptions`

Opções para carregar um modelo LLM.

```typescript
interface ModelOptions extends Partial<LlamaModelOptions> {
  modelPath: string; // Caminho para o arquivo do modelo
}
```

- `modelPath` (string) **Obrigatório**: Caminho para o arquivo do modelo.
- Outras opções opcionais herdadas de `LlamaModelOptions`.

#### `GenerateOptions`

Opções para geração de texto.

```typescript
interface GenerateOptions {
  prompt: string; // Texto de entrada para o modelo
  options?: Omit<LLamaChatPromptOptions, 'prompt'>; // Opções adicionais para geração
}
```

- `prompt` (string) **Obrigatório**: Texto de entrada para o modelo processar.
- `options` (opcional): Configurações adicionais para geração, exceto o próprio prompt.

---

### Detalhamento dos métodos

#### `loadModel(options: ModelOptions): Promise<void>`

Carrega um modelo LLM com as opções fornecidas.

- **Parâmetros:**
  - `options`: Objeto `ModelOptions` com o caminho e configurações do modelo.
- **Retorno:** Promise resolvida quando o modelo for carregado.

#### `unloadModel(): Promise<void>`

Descarrega o modelo atualmente carregado.

- **Retorno:** Promise resolvida ao finalizar a operação.

#### `generate(options: GenerateOptions): Promise<string>`

Gera texto a partir do prompt fornecido.

- **Parâmetros:**
  - `options`: Objeto com o prompt e configurações adicionais.
- **Retorno:** Promise que resolve para o texto gerado.

#### `getLoadedModel(): Promise<ModelOptions | null>`

Obtém informações do modelo atualmente carregado.

- **Retorno:** Promise que resolve para as opções do modelo ou `null` se nenhum estiver carregado.

#### `getAvailableModels(): Promise<ModelOptions[]>`

Lista todos os modelos disponíveis no sistema.

- **Retorno:** Promise que resolve para um array de modelos.

#### `setOptions(options: LlamaContextOptions): Promise<void>`

Define opções do contexto do modelo, como parâmetros de geração padrão.

- **Parâmetros:**
  - `options`: Objeto `LlamaContextOptions` com as configurações desejadas.
- **Retorno:** Promise resolvida ao aplicar as configurações.

---

### Exemplo de uso básico

```typescript
import { useEffect } from "react";
import { useLLM } from "@/client/hooks/use-llm";

function ChatComponent() {
  const {
    isLoading,
    error,
    loadModel,
    unloadModel,
    generate,
    getLoadedModel,
    getAvailableModels,
    setOptions
  } = useLLM();

  useEffect(() => {
    async function init() {
      try {
        await loadModel({ modelPath: "models/llama-model.gguf" });
        await setOptions({ nCtx: 2048 });
        const response = await generate({ prompt: "Olá, quem é você?" });
        console.log("Resposta do modelo:", response);
      } catch (err) {
        console.error("Erro:", err);
      }
    }

    init();

    return () => {
      unloadModel();
    };
  }, []);

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;

  return <div>Converse com o modelo!</div>;
}
```

---

### Resumo

O hook `useLLM` simplifica a integração com modelos LLM no frontend React, abstraindo a comunicação IPC e fornecendo uma API clara para carregar modelos, gerar texto e configurar o contexto.

Para detalhes sobre as opções específicas de modelos e geração, consulte a documentação da biblioteca [`node-llama-cpp`](https://github.com/abetlen/llama-cpp-python).
