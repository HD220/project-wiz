# Integração com Electron

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
