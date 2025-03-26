# Boas Práticas e Troubleshooting

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
