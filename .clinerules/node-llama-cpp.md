# node-llama-cpp Rules

## 1. Configuração Inicial

### 1.1 Instalação

#### Novo Projeto

```shell
npm create node-llama-cpp@latest
```

- Escolha template Node + TypeScript para iniciar
- Selecione modelo recomendado (7B/8B parameters)

#### Projeto Existente

```shell
npm install node-llama-cpp
```

- Binários pré-compilados para macOS, Linux e Windows
- Fallback para compilação com cmake se necessário
- Desativar fallback: `NODE_LLAMA_CPP_SKIP_DOWNLOAD=true`

### 1.2 Verificação de Hardware

```shell
npx --no node-llama-cpp inspect gpu
```

- Detecção automática de camadas de computação
- Suporte nativo para Metal (Apple), CUDA (Nvidia), Vulkan (AMD/Intel)

### 1.3 Configuração Básica

```typescript
import { getLlama } from "node-llama-cpp";

const llama = await getLlama();
```

### 1.4 Uso de ESM

- Adicionar `"type": "module"` no package.json
- Usar exclusivamente `import` (não suporta `require`)
- Ver guia de troubleshooting para projetos CommonJS

## 2. Escolha e Validação de Modelos

### 2.1 Obtenção de Modelos

- Recomendado: GGUF models do Hugging Face
- Modelos iniciais: 7B/8B parameters
- Buscar por "Instruct" ou "it" no nome do modelo
- Download otimizado:

```shell
npx --no node-llama-cpp pull --dir ./models <model-file-url>
```

### 2.2 Validação de Modelos

```shell
npx --no node-llama-cpp chat <path-to-model>
```

- Testar com prompt simples ("Hi there")
- Se resposta inadequada, tentar outro modelo
- Opção de chat wrapper:

```shell
npx --no node-llama-cpp chat --wrapper general <path-to-model>
```

## 2. Gerenciamento de Modelos

### 2.1 Carregamento de Modelos

```typescript
const model = await llama.loadModel({
  modelPath: path.join(__dirname, "my-model.gguf"),
});
```

### 2.2 Criação de Contexto

```typescript
const context = await model.createContext();
```

## 3. Integração com Electron

### 3.1 Configuração Básica

#### Scaffolding

```shell
npm create node-llama-cpp@latest -- --template electron-typescript-react
```

- Analisar arquivo electron-builder.ts para configurações de empacotamento
- Manter estrutura de arquivos original

#### Restrições

- Usar exclusivamente no main process
- Evitar uso no renderer process (causa crash)

### 3.2 Boas Práticas

#### Gerenciamento de Processos

- Isolar lógica do LLM em processo separado
- Implementar gerenciamento de estado centralizado
- Utilizar RPC para comunicação entre processos

#### Empacotamento

- Não incluir binários no arquivo asar
- Marcar node-llama-cpp como módulo externo
- Preferir Electron Vite ao invés de Webpack
- Configurar build options corretamente:

```typescript
const llama = await getLlama({
  build: {
    // custom build options
  },
});
```

#### Cross Compilation

- Suporte para arm64 em x64
- Não suportado: x64 em arm64
- Usar GitHub Actions para builds multiplataforma

## 4. Otimizações de Performance

### 4.1 Suporte a GPU

#### CUDA (NVIDIA)

- Requer CUDA Toolkit 12.2 ou superior
- Binários pré-compilados para Windows e Linux
- Verificar suporte:

```shell
npx --no node-llama-cpp inspect gpu
```

- Forçar uso de CUDA:

```typescript
const llama = await getLlama({
  gpu: "cuda",
});
```

- Configurar camadas GPU:

```typescript
const model = await llama.loadModel({
  modelPath,
  gpuLayers: 33, // número de camadas para GPU
});
```

- Monitorar uso de VRAM no Linux:

```shell
watch -d nvidia-smi
```

#### Metal (Apple)

- Habilitado por padrão em Macs com Apple Silicon
- Usar Accelerate framework para melhor performance

#### Vulkan (AMD/Intel)

- Suporte automático quando detectado
- Configuração similar ao CUDA

### 4.2 Batching Automático

- Ativar batching para melhorar throughput
- Ajustar tamanho do batch conforme hardware
- Considerar capacidade de VRAM/GPU

### 4.3 Build Customizado

#### Compilação com CUDA

```shell
npx --no node-llama-cpp source download --gpu cuda
```

- Requer CMake 3.26+
- Solução de problemas comuns:
  - Definir CUDACXX para caminho do nvcc
  - Configurar CMAKE_GENERATOR_TOOLSET
  - Verificar versão do CUDA Toolkit

## 5. Funcionalidades Avançadas

### 5.1 Function Calling

- Implementar funções que o modelo pode chamar durante a geração
- Exemplo básico:

```typescript
const functions = {
  getFruitPrice: defineChatSessionFunction({
    description: "Get the price of a fruit",
    params: {
      type: "object",
      properties: {
        name: { type: "string" },
      },
    },
    async handler(params) {
      // Lógica para retornar preço da fruta
    },
  }),
};
```

### 5.2 Embedding

- Criar contextos de embedding:

```typescript
const context = await model.createEmbeddingContext();
```

- Gerar vetores de embedding:

```typescript
const embedding = await context.getEmbeddingFor("Hello world");
```

## 6. Boas Práticas e Troubleshooting

### 5.1 Segurança de Entrada

- Validar e sanitizar entradas do usuário
- Implementar limites de tamanho de prompt
- Habilitar debug logs para investigação:

```typescript
const llama = await getLlama({
  debug: true,
});
```

### 5.2 Tratamento de Erros Comuns

#### InsufficientMemoryError

- Verificar uso real de memória:

```shell
npx --no node-llama-cpp inspect measure [modelPath]
```

- Ignorar verificações de segurança (com cautela):

```typescript
const model = await llama.loadModel({
  modelPath,
  ignoreMemorySafetyChecks: true,
});
```

#### Illegal Hardware Instruction

- Verificar arquitetura do Node.js:

```shell
node -e "console.log(process.platform, process.arch)"
```

- Garantir compatibilidade entre arquiteturas

#### EPERM no Windows

- Habilitar Developer Mode
- Excluir pasta .cache do usuário

### 5.3 Configuração de Ambiente

#### Termux

- Instalar dependências necessárias:

```bash
pkg update
pkg install nodejs git cmake clang libxml2
```

- Para suporte a Vulkan:

```bash
pkg install vulkan-tools vulkan-loader-android vulkan-headers vulkan-extension-layer
```

#### CommonJS

- Usar import dinâmico:

```typescript
async function myLogic() {
  const { getLlama } = await import("node-llama-cpp");
}
```
