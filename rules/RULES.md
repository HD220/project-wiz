# Diretrizes do Project Wiz

## Configuração de Modelos

- Local padrão: project-wiz/llama/models
- Parâmetros configuráveis:
  - Temperatura (0.1-2.0)
  - Máximo de tokens (1-4096)
  - Top-p (0-1)
  - Repeat penalty (opcional):
    - lastTokens: 24
    - penalty: 1.12
    - penalizeNewLine: true
    - frequencyPenalty: 0.02
    - presencePenalty: 0.02

## Implementação do Worker LLM

- Isolamento em processo separado
- Proibido uso de JSDoc
- Template de implementação:

```typescript
import { fileURLToPath } from "url";
import path from "path";
import { LlamaChatSession, Token } from "node-llama-cpp";

async function getLlama() {
  const { getLlama } = await import("node-llama-cpp");
  return getLlama;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const llama = await getLlama();
const model = await llama.loadModel({
  modelPath: path.join(
    __dirname,
    "models",
    "Meta-Llama-3.1-8B-Instruct.Q4_K_M.gguf"
  ),
});
const context = await model.createContext();
const session = new LlamaChatSession({
  contextSequence: context.getSequence(),
});

const q1 = "Hi there, how are you?";
console.log("User: " + q1);

process.stdout.write("AI: ");
const a1 = await session.prompt(q1, {
  onTextChunk(chunk: string) {
    process.stdout.write(chunk);
  },
});
```

## Integração GitHub

- PAT com escopo mínimo (repo)
- Eventos suportados:
  - issues
  - pull_request
- Armazenamento seguro no keychain

## Segurança

- Todos os dados armazenados localmente
- Isolamento de processos
- Permissões mínimas para hooks
