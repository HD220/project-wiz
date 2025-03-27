# Plano de Implementação de Download de Modelos

## Objetivo

Implementar método robusto de download de modelos usando `createModelDownloader` e `combineModelDownloaders` da biblioteca node-llama-cpp.

## Requisitos Técnicos

### Suporte a Fontes de Download

- URLs diretas
- HuggingFace (formato `hf://`)
- Múltiplos modelos simultâneos
- Progresso de download
- Tratamento de erros

## Estratégia de Download

### Casos de Uso

1. Download de modelo único
2. Download de múltiplos modelos
3. Download com progresso
4. Cancelamento de download

### Implementação Proposta

```typescript
private async downloadModel(modelIds: string | string[], requestId: string) {
const modelsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "models");
  fs.mkdirSync(modelsDir, { recursive: true });

  const modelList = Array.isArray(modelIds) ? modelIds : [modelIds];

  const downloaders =
    modelList.map(async (modelUri) => {

      return createModelDownloader({
        modelUri: modelUri,
        dirPath: modelsDir,
        onProgress: (progress) => {
          this.sendDownloadProgress(requestId, progress);
        }
      });
    })


  const combinedDownloader = downloaders.length > 1
    ? await combineModelDownloaders(downloaders)
    : await downloaders[0];

  try {
    const downloadedFiles = await combinedDownloader.download();

    downloadedFiles.forEach(filePath => {
      this.sendDownloadComplete(requestId, filePath);
    });
  } catch (error) {
    this.handleDownloadError(requestId, error);
  }
}
```

## Tratamento de Erros

### Tipos de Erros

- Falha de download
- URL inválida
- Espaço em disco insuficiente
- Conexão interrompida

### Estratégia de Tratamento

```typescript
private handleDownloadError(requestId: string, error: Error) {
  if (error.name === "AbortError") {
    this.sendInfo("Download abortado pelo usuário");
  } else {
    this.sendDownloadError(requestId, error.message);
    this.sendError("Erro no download do modelo", error);
  }
}
```

## Recursos Adicionais

### Cancelamento de Download

- Suporte a `AbortController`
- Interrupção segura de downloads

### Logging

- Registrar tentativas de download
- Rastrear progresso
- Documentar erros

## Considerações de Segurança

- Validação de URLs
- Verificação de integridade do arquivo
- Proteção contra downloads maliciosos

## Testes Necessários

- Download de modelo único
- Download de múltiplos modelos
- Cancelamento de download
- Tratamento de URLs inválidas
- Verificação de progresso
- Teste de erro de conexão

## Pontos de Melhoria Futura

- Cache de modelos
- Verificação de hash
- Suporte a mais fontes de download
- Gerenciamento de versões de modelo
