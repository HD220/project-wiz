# Padrões de Teste Consolidados - Project Wiz

## 1. Introdução
Este documento consolida os padrões de teste do projeto, combinando as melhores práticas de testes gerais com o fluxo de trabalho específico para Drizzle ORM.

## 2. Configuração do Ambiente

### Vitest
```typescript
// vitest.config.mts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.mts', 'vite.*.mts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Drizzle (Banco em Memória)
```typescript
// tests/setup/drizzle.ts
import { Database } from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

export async function setupTestDB() {
  const sqlite = new Database(":memory:");
  const db = drizzle(sqlite);
  await migrate(db, { migrationsFolder: "./migrations" });
  return db;
}
```

## 3. Estrutura de Pastas
```
project-wiz/
├── src/
└── tests/
    ├── unit/             # Testes de unidade
    ├── integration/      # Testes de integração
    ├── e2e/             # Testes end-to-end
    ├── stress/          # Testes de stress
    ├── setup/           # Configurações de teste
    └── setup.ts         # Setup global
```

## 4. Tipos de Testes

### Unitários
```typescript
// Exemplo: Teste de entidade
import { Job } from '@/core/domain/entities/jobs/job.entity';

describe('Job Entity', () => {
  it('should create a valid job', () => {
    const job = new Job({ id: 'job-123', name: 'Test Job' });
    expect(job).toBeInstanceOf(Job);
  });
});
```

### Integração (com Drizzle)
```typescript
// Exemplo: Teste de repositório
describe('DrizzleQueueRepository', () => {
  let repository: DrizzleQueueRepository;

  beforeAll(async () => {
    const db = await getTestDB();
    repository = new DrizzleQueueRepository(db);
  });

  it('should throw error when saving null queue', async () => {
    await expect(repository.save(null)).rejects.toThrow();
  });
});
```

## 5. Padrões de Escrita

### Templates
```typescript
// Template para testes de integração
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestDB } from '@/tests/setup/drizzle';

describe('Component Integration', () => {
  beforeAll(async () => { /* setup */ });
  
  it('should behave correctly', () => {
    // Arrange, Act, Assert
  });

  afterAll(async () => { /* teardown */ });
});
```

### Boas Práticas
- Teste comportamentos, não implementações
- Use nomes descritivos para testes
- Isole testes que usam banco de dados
- Limpe dados após cada teste

## 6. Testes com Banco de Dados

### Setup/Teardown
```typescript
describe('Database Tests', () => {
  beforeAll(async () => {
    await setupTestDB();
    await applyMigrations();
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await teardownTestDB();
  });
});
```

### Migrações e Verificação
```bash
# Comandos úteis
npm run drizzle:generate  # Gerar migração
npm run drizzle:migrate   # Aplicar migrações
npm run test:db           # Rodar testes com DB
npm run verify:tests      # Verificar estrutura de testes e padrões

# Exemplo de saída:
# ✔ Estrutura de pastas correta
# ✔ Padrão de nomenclatura de arquivos
# ✔ Configurações obrigatórias presentes
# ✖ 2 arquivos com imports inválidos
```

## 7. Checklists

### Estrutura de Testes
- [ ] Pastas organizadas por tipo de teste
- [ ] Nomes de arquivos com sufixo .test.ts
- [ ] Setup global configurado

### Conteúdo de Testes
- [ ] Caminhos felizes testados
- [ ] Casos de erro cobertos
- [ ] Edge cases considerados
- [ ] Dados limpos após testes

### Drizzle Specific
- [ ] Banco em memória configurado
- [ ] Migrações aplicadas
- [ ] Transações testadas