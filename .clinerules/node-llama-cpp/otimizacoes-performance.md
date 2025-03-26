# Otimizações de Performance

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

- Habilitado por padrão em Macs con Apple Silicon
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
