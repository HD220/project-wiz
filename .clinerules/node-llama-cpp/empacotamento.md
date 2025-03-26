# Empacotamento com Electron

## Configurações Essenciais

### 1. Estrutura de Arquivos

- Incluir binários específicos por plataforma:

```typescript
"node_modules/node-llama-cpp/bins/${os}-${arch}*/**/*";
```

- Excluir builds locais não utilizados:

```typescript
"!node_modules/node-llama-cpp/llama/localBuilds/**/*";
```

### 2. Configurações Multiplataforma

#### macOS

- Formatos suportados: DMG e ZIP
- Arquiteturas: arm64 e x64
- Assinatura de código necessária

#### Windows

- Formato principal: NSIS
- Arquiteturas: x64 e arm64
- Configurações de instalação:
  - Instalação em um clique
  - Remove dados ao desinstalar

#### Linux

- Formatos suportados: AppImage, Snap, DEB e tar.gz
- Arquiteturas: x64 e arm64

### 3. Boas Práticas

- Usar asar para empacotamento, mas desempacotar binários necessários:

```typescript
asarUnpack: [
  "node_modules/node-llama-cpp/bins",
  "node_modules/node-llama-cpp/llama/localBuilds",
];
```

- Nomes de artefatos consistentes:

```typescript
artifactName: "${name}.${os}.${version}.${arch}.${ext}";
```

### 4. Considerações Especiais

- Tratamento especial para Apple Silicon:

```typescript
await $`codesign --force --deep --sign - ${appPath}`;
```

- Configurações específicas para AppX (Windows Store)
