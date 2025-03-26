# Configuração Inicial

## 1.1 Instalação

### Novo Projeto

```shell
npm create node-llama-cpp@latest
```

- Escolha template Node + TypeScript para iniciar
- Selecione modelo recomendado (7B/8B parameters)

### Projeto Existente

```shell
npm install node-llama-cpp
```

- Binários pré-compilados para macOS, Linux e Windows
- Fallback para compilação com cmake se necessário
- Desativar fallback: `NODE_LLAMA_CPP_SKIP_DOWNLOAD=true`

## 1.2 Verificação de Hardware

```shell
npx --no node-llama-cpp inspect gpu
```

- Detecção automática de camadas de computação
- Suporte nativo para Metal (Apple), CUDA (Nvidia), Vulkan (AMD/Intel)

## 1.3 Configuração Básica

```typescript
import { getLlama } from "node-llama-cpp";

const llama = await getLlama();
```

## 1.4 Uso de ESM

- Adicionar `"type": "module"` no package.json
- Usar exclusivamente `import` (não suporta `require`)
- Ver guia de troubleshooting para projetos CommonJS
