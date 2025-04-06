# Configurações de TypeScript e Vite

## Configurações do TypeScript (tsconfig.json)

### Configurações Principais

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": ["./src/client/*"]
    }
  }
}
```

#### Explicação das Configurações

1. **target**: "ES2020"

   - Define o nível de ECMAScript alvo
   - Garante compatibilidade com recursos modernos

2. **module**: "commonjs"

   - Formato de módulo para Node.js
   - Necessário para integração com Electron

3. **moduleResolution**: "node"

   - Resolução de módulos seguindo convenções Node.js
   - Permite imports sem extensões

4. **strict**: true

   - Habilita todas as verificações de tipo estritas
   - Melhora segurança e qualidade do código

5. **paths**
   - Aliases para caminhos absolutos
   - Exemplo de uso:
     ```ts
     import { Component } from "@/components/MyComponent";
     ```

## Configurações do Vite

### Configurações Comuns

```ts
// vite.main.config.mts
{
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      "@": "/src"
    }
  },
  build: {
    target: "node18"
  }
}
```

### Configurações Específicas por Ambiente

#### Main Process (Electron)

- Plugins:
  - `vite-tsconfig-paths`: Resolve paths do tsconfig
  - `node-polyfills`: Polyfills para Node.js
- Build:
  - Formato ESM
  - Dependências externas: electron, node-llama-cpp

#### Renderer Process

- Suporte a React
- Configurações específicas para UI
- Hot Module Replacement

#### Web Workers

- Suporte a módulos em workers
- Configurações de isolamento

## Histórico de Mudanças

### 2025-04-05 - Atualização de Configurações

- Adicionado suporte a paths absolutos
- Atualizado target para Node 18
- Configurado polyfills para Node.js

### 2025-03-20 - Configurações Iniciais

- Configuração básica do TypeScript
- Setup inicial do Vite para Electron

## Boas Práticas

1. **Aliases**: Use @/ para imports absolutos
2. **Extensões**: Omita extensões em imports (exceto para .tsx)
3. **Ambientes**: Use variáveis de ambiente para configurações específicas
4. **Plugins**: Mantenha plugins atualizados

## Solução de Problemas

### Erros Comuns

1. **Cannot find module**

   - Verifique aliases e paths no tsconfig
   - Confira extensões no vite.config

2. **Type errors**

   - Verifique configurações strict
   - Atualize tipos e definições

3. **Build failures**
   - Confira dependências externas
   - Verifique target e formato
