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

Carrega um modelo LLM com das opções fornecidas.

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

---

## Validação em APIs

### Exemplo de Validação de Endpoint

```typescript
import { InputValidator } from '@/core/infrastructure/validation';
import { z } from 'zod';

// Definindo schema para payload de usuário
const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3).max(100),
  email: z.string().email()
});

// Criando validador
const userValidator = new InputValidator(UserSchema);

// Usando em um endpoint
router.post('/users', async (req, res) => {
  try {
    const validData = userValidator.validate(req.body);
    // Processar dados válidos...
  } catch (error) {
    res.status(400).json({
      error: error.code,
      message: error.message,
      path: error.path
    });
  }
});
```

### Validação de Headers

```typescript
const AuthHeaderSchema = z.object({
  authorization: z.string().regex(/^Bearer .+$/)
});

const authValidator = new InputValidator(AuthHeaderSchema);

router.use((req, res, next) => {
  try {
    authValidator.validate(req.headers);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid auth header' });
  }
});
```

### Validação Customizada

```typescript
class AgeValidator extends InputValidator<{ age: number }> {
  protected formatError(error: z.ZodError): ValidationError {
    return {
      code: 'INVALID_AGE',
      message: 'Idade deve ser entre 18 e 120 anos',
      path: error.errors[0].path
    };
  }
}

const ageSchema = z.object({
  age: z.number().min(18).max(120)
});

const ageValidator = new AgeValidator(ageSchema);

## Validação de Tokens OAuth do GitHub

### Schema de Validação
```typescript
import { z } from 'zod';

const OAuthTokenPattern = /^[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+\.?[A-Za-z0-9\-_=]*$/;

export const GitHubOAuthTokenSchema = z.object({
  access_token: z.string()
    .min(40, 'Token deve ter no mínimo 40 caracteres')
    .max(2000, 'Token deve ter no máximo 2000 caracteres')
    .regex(OAuthTokenPattern, 'Formato de token inválido'),
  token_type: z.literal('bearer'),
  scope: z.string()
    .min(3, 'Escopo deve ter no mínimo 3 caracteres')
    .max(500, 'Escopo deve ter no máximo 500 caracteres')
}).strict();
```

### Regras de Validação
1. **access_token**:
   - Obrigatório
   - Formato JWT válido
   - Tamanho: 40-2000 caracteres
   - Regex: `^[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+\.?[A-Za-z0-9\-_=]*$`

2. **token_type**:
   - Obrigatório
   - Valor fixo: 'bearer'

3. **scope**:
   - Obrigatório
   - Tamanho: 3-500 caracteres

### Exemplos

**Payload válido:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
  "token_type": "bearer",
  "scope": "repo,user"
}
```

**Erros comuns:**
1. Token muito curto:
```json
{
  "error": "ValidationError",
  "code": "INVALID_INPUT",
  "message": "Token deve ter no mínimo 40 caracteres",
  "path": ["access_token"]
}
```

2. Formato inválido:
```json
{
  "error": "ValidationError",
  "code": "INVALID_INPUT",
  "message": "Formato de token inválido",
  "path": ["access_token"]
}
```

3. Propriedade extra:
```json
{
  "error": "ValidationError",
  "code": "UNRECOGNIZED_KEYS",
  "message": "Propriedade não reconhecida: 'extra'",
  "path": []
}
```
