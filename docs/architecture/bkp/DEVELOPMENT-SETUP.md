# Project Wiz: Configuração de Desenvolvimento

**Versão:** 3.0  
**Status:** Design Final  
**Data:** 2025-01-17

---

## 🎯 Visão Geral

Este documento detalha a **configuração simplificada do ambiente de desenvolvimento** para o Project Wiz, seguindo os princípios KISS e Clean Code. Inclui ferramentas essenciais, configurações mínimas e fluxos de trabalho otimizados para máxima produtividade.

---

## 🛠️ Pré-requisitos

### Sistema Operacional

- **Windows 10/11** (principal)
- **macOS 12+** (suportado)
- **Linux Ubuntu 20.04+** (suportado)

### Software Obrigatório

```bash
# Node.js (recomendado via nvm)
node --version  # v20.10.0+
npm --version   # v10.0.0+

# Git
git --version  # v2.40.0+

# VS Code (recomendado)
code --version
```

### VS Code Extensions

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-json",
    "ms-playwright.playwright",
    "vitest.explorer",
    "tanstack.vscode-router",
    "drizzle-team.drizzle-vscode"
  ]
}
```

---

## 📦 Setup Inicial

### 1. Clone e Instalação

```bash
# Clone do repositório
git clone https://github.com/user/project-wiz.git
cd project-wiz

# Instalação das dependências
npm install

# Rebuild dependências nativas (se necessário)
npm run rebuild
```

### 2. Configuração de Ambiente

```bash
# Copiar arquivo de ambiente
cp .env.example .env

# Editar variáveis necessárias
code .env
```

#### Variáveis de Ambiente Essenciais

```bash
# .env
NODE_ENV=development
DB_FILE_NAME=project-wiz-dev.db

# API Keys (obrigatórias para IA)
DEEPSEEK_API_KEY=your_deepseek_api_key_here
OPENAI_API_KEY=your_openai_api_key_here  # opcional

# Development flags
DEBUG=true
LOG_LEVEL=debug
ENABLE_DEVTOOLS=true
```

### 3. Configuração do Banco de Dados

```bash
# Gerar migrações iniciais
npm run db:generate

# Aplicar migrações
npm run db:migrate

# Seed dados de desenvolvimento (opcional)
npm run db:seed

# Abrir Drizzle Studio
npm run db:studio
```

---

## 🔧 Configurações de Ferramentas

### TypeScript Configuration

```json
// tsconfig.json (principais configurações)
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/main/*": ["./src/main/*"],
      "@/renderer/*": ["./src/renderer/*"],
      "@/shared/*": ["./src/shared/*"]
    }
  }
}
```

### ESLint Configuration

```javascript
// eslint.config.js (principais regras)
export default [
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: "@typescript-eslint/parser",
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "@typescript-eslint": typescriptEslint,
      react: react,
      "react-hooks": reactHooks,
      import: importPlugin,
    },
    rules: {
      // TypeScript
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/prefer-const": "error",

      // React
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Import
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always",
          alphabetize: { order: "asc" },
        },
      ],

      // Code Quality
      "no-console": "warn",
      "prefer-const": "error",
      "no-var": "error",
    },
  },
];
```

### Prettier Configuration

```json
// .prettierrc.json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### TailwindCSS Configuration

```typescript
// tailwind.config.ts
export default {
  content: ["./src/renderer/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        discord: {
          "bg-primary": "#36393f",
          "bg-secondary": "#2f3136",
          "bg-tertiary": "#202225",
          "text-primary": "#dcddde",
          "text-secondary": "#72767d",
          "text-muted": "#4f545c",
          accent: "#5865f2",
          "accent-hover": "#4752c4",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
```

---

## 🚀 Scripts de Desenvolvimento

### Scripts Principais

```json
// package.json scripts essenciais
{
  "scripts": {
    // Development
    "dev": "concurrently \"npm run dev:vite\" \"npm run dev:electron\"",
    "dev:vite": "vite",
    "dev:electron": "electron-forge start",

    // Build
    "build": "npm run extract && npm run compile && npm run build:vite && npm run build:electron",
    "build:vite": "vite build",
    "build:electron": "electron-forge package",

    // Quality
    "lint": "eslint . --ext .ts,.tsx --fix",
    "lint:check": "eslint . --ext .ts,.tsx",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,js,jsx}\"",
    "quality:check": "npm run lint:check && npm run type-check && npm run format:check && npm test",

    // Database
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "db:seed": "tsx src/main/scripts/seed.ts",
    "db:reset": "rm -f project-wiz-dev.db && npm run db:migrate && npm run db:seed",

    // Testing
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",

    // i18n
    "extract": "lingui extract",
    "compile": "lingui compile",

    // Utilities
    "clean": "rm -rf dist out .vite node_modules/.vite",
    "rebuild": "electron-rebuild",
    "postinstall": "electron-builder install-app-deps"
  }
}
```

### Scripts Customizados

```bash
# scripts/dev-setup.sh - Setup completo para novos desenvolvedores
#!/bin/bash
echo "🚀 Setting up Project Wiz development environment..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js v20+"
    exit 1
fi

# Verificar versão do Node
NODE_VERSION=$(node -v | cut -d'v' -f2)
if [ "$(printf '%s\n' "20.0.0" "$NODE_VERSION" | sort -V | head -n1)" != "20.0.0" ]; then
    echo "❌ Node.js v20+ requerido. Versão atual: v$NODE_VERSION"
    exit 1
fi

# Instalar dependências
echo "📦 Installing dependencies..."
npm install

# Setup environment
if [ ! -f .env ]; then
    echo "⚙️ Creating .env file..."
    cp .env.example .env
    echo "✏️ Please edit .env file with your API keys"
fi

# Setup database
echo "🗄️ Setting up database..."
npm run db:migrate
npm run db:seed

echo "✅ Development environment ready!"
echo "🎯 Run 'npm run dev' to start developing"
```

```bash
# scripts/quality-check.sh - Verificação completa de qualidade
#!/bin/bash
echo "🔍 Running quality checks..."

# Lint
echo "📋 Linting..."
npm run lint:check || exit 1

# Type check
echo "🔧 Type checking..."
npm run type-check || exit 1

# Format check
echo "✨ Format checking..."
npm run format:check || exit 1

# Tests
echo "🧪 Running tests..."
npm test || exit 1

echo "✅ All quality checks passed!"
```

---

## 🔄 Fluxo de Desenvolvimento

### Desenvolvimento Diário

```bash
# 1. Atualizar código
git pull origin main

# 2. Instalar novas dependências (se houver)
npm install

# 3. Atualizar banco de dados (se houver novas migrações)
npm run db:migrate

# 4. Iniciar desenvolvimento
npm run dev

# 5. Verificar qualidade antes de commit
npm run quality:check
```

### Workflow de Feature

```bash
# 1. Criar branch para feature
git checkout -b feature/nova-funcionalidade

# 2. Desenvolver e testar
npm run dev
npm run test:watch

# 3. Verificar qualidade
npm run quality:check

# 4. Commit e push
git add .
git commit -m "feat: adiciona nova funcionalidade"
git push origin feature/nova-funcionalidade

# 5. Criar Pull Request
```

### Debugging

```bash
# Debug do processo principal
npm run dev:debug

# Debug com DevTools
ELECTRON_ENABLE_DEVTOOLS=true npm run dev

# Debug específico por módulo
DEBUG=project-wiz:* npm run dev

# Logs detalhados
LOG_LEVEL=debug npm run dev
```

---

## 🧪 Configuração de Testes

### Vitest Configuration

```typescript
// vitest.config.mts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "src/test/", "**/*.d.ts", "**/*.config.*"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/main": path.resolve(__dirname, "./src/main"),
      "@/renderer": path.resolve(__dirname, "./src/renderer"),
      "@/shared": path.resolve(__dirname, "./src/shared"),
    },
  },
});
```

### Test Setup

```typescript
// src/test/setup.ts
import { vi } from "vitest";

// Mock Electron APIs
global.window = Object.assign(global.window, {
  api: {
    projects: {
      create: vi.fn(),
      findById: vi.fn(),
      findByUser: vi.fn(),
    },
    agents: {
      create: vi.fn(),
      findById: vi.fn(),
    },
    // ... outras APIs
  },
});

// Mock de localStorage
Object.defineProperty(window, "localStorage", {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
});
```

---

## 🐛 Debugging e Troubleshooting

### Problemas Comuns

#### 1. Dependências Nativas

```bash
# Erro: binding.node não encontrado
npm run rebuild

# Se ainda não funcionar
rm -rf node_modules
npm install
npm run rebuild
```

#### 2. Problemas de Banco

```bash
# Database locked
npm run db:reset

# Migrations out of sync
rm -f project-wiz-dev.db
npm run db:migrate
```

#### 3. Problemas de Build

```bash
# Limpar cache
npm run clean
npm install

# Verificar configurações
npm run type-check
```

### Logs de Debug

```typescript
// Configuração de logging para desenvolvimento
const logger = {
  debug: (message: string, data?: any) => {
    if (process.env.DEBUG) {
      console.log(`[DEBUG] ${message}`, data);
    }
  },
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data);
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
  },
};
```

---

## 📊 Performance Monitoring

### Bundle Analysis

```bash
# Analisar bundle do renderer
npm run build:analyze

# Ver tamanho dos chunks
npm run build && ls -la dist/
```

### Memory Profiling

```bash
# Profile do processo principal
node --inspect-brk node_modules/.bin/electron .

# Profile do renderer
ELECTRON_ENABLE_DEVTOOLS=true npm run dev
# Abrir DevTools > Memory tab
```

---

## 🔐 Configurações de Segurança

### Content Security Policy

```typescript
// CSP para desenvolvimento
const csp = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' https://api.deepseek.com https://api.openai.com;
`;
```

### API Key Management

```typescript
// Nunca committar API keys
// Use .env para desenvolvimento
// Use variáveis de ambiente em produção

const apiKey = process.env.DEEPSEEK_API_KEY;
if (!apiKey) {
  throw new Error("DEEPSEEK_API_KEY is required");
}
```

---

## 📈 Próximos Passos

1. **JUNIOR-DEVELOPER-GUIDE.md** - Guia específico para desenvolvedores juniores
2. **TESTING-STRATEGY.md** - Estratégia completa de testes
3. **DEPLOYMENT-GUIDE.md** - Guia de deployment e distribuição

---

_Esta configuração de desenvolvimento foi projetada para maximizar a produtividade e minimizar problemas de setup, proporcionando uma experiência de desenvolvimento fluida e eficiente._
