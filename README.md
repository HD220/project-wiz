# Project Wiz - Fabrica de software autonoma

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Visão Geral

Project Wiz é um sistema ElectronJS com visual Discord-Like, onde cada servidor é um projeto/repositorio e os agentes participantes do servidor trabalham para evoluçao do projeto e você pode iteragir e ver a iteração entre os agentes.

## Documentação

- [Sistema de Filas](/docs/queue-system.md) - Arquitetura e guia de uso do sistema de processamento assíncrono de jobs

## Testes

O projeto segue padrões rigorosos de testes automatizados para garantir qualidade e estabilidade. Consulte [Test Standards](/docs/test-architecture.md) para detalhes completos.

### Estrutura

```
project-wiz/
├── src/                  # Código fonte
└── tests/                # Todos os testes
    ├── unit/             # Testes unitários
    ├── integration/      # Testes de integração  
    ├── e2e/              # Testes end-to-end
    ├── stress/           # Testes de carga
    └── setup/            # Configurações de teste
```

### Tipos de Testes

- **Unitários**: Testam componentes isolados
  ```typescript
  // tests/unit/core/domain/entities/jobs/job.entity.test.ts
  describe("Job Entity", () => {
    it("should accept priority 0 as default value", () => {
      const job = new TestJob("test-id", new JobStatus(JobStatusValues.WAITING));
      expect(job.getPriority()).toBe(0);
    });
  });
  ```

- **Integração**: Testam interação entre componentes
  ```typescript
  // tests/integration/repositories/drizzle/queue.repository.test.ts  
  describe("DrizzleQueueRepository - Integration Tests", () => {
    it("deve lançar erro quando queue for nulo", async () => {
      await expect(repository.save(null)).rejects.toThrow();
    });
  });
  ```

### Execução

Comandos disponíveis no `package.json`:

```bash
# Executar todos os testes
npm test

# Executar testes unitários
npm run test:unit

# Executar testes de integração
npm run test:integration

# Executar testes com cobertura
npm run test:coverage

# Verificar estrutura de testes
npm run verify:tests
```

### Verificação de Estrutura

O projeto inclui um script para validar a estrutura de testes:

```bash
npm run verify:tests
```

Este script verifica:
- Estrutura de pastas conforme padrão
- Nomenclatura de arquivos de teste
- Configurações obrigatórias
- Imports e dependências
- Gera relatório detalhado

Exemplo de saída:
```
=== Relatório de Verificação de Estrutura de Testes ===

✅ 15 verificações passaram
❌ 0 verificações falharam
⚠️ 2 avisos

=== Resultado ===
✅ Estrutura de testes está conforme os padrões
```

### Configuração

O ambiente de testes utiliza:
- Vitest como runner de testes
- Banco de dados SQLite em memória para testes de integração
- Configuração definida em [`vitest.config.mts`](/vitest.config.mts)

### Validação Automática

O script de verificação é executado automaticamente:
- No pre-commit hook (via Husky)
- No pipeline de CI/CD
- Antes da geração de builds de produção

Isso garante que todos os testes sigam os padrões do projeto.

### Cobertura

Para gerar relatórios de cobertura:

```bash
npm run test:coverage
```

Isso gera relatórios em:
- Terminal (texto)
- Pasta `coverage/` (HTML, JSON)

### Mais Informações

- [Arquitetura de Testes](/docs/test-architecture.md)
- [Padrões de Teste](/.roo/rules/Test-Standard-Rules.md)
- [Fluxo com Drizzle](/.roo/rules/Drizzle-Workflow-Rules.md)
