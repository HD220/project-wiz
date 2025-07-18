# Claude Code Commands & Hooks Documentation

Este documento fornece uma visão geral completa dos comandos e hooks do Claude Code CLI criados para o projeto Project Wiz, seguindo as melhores práticas da indústria.

## 📋 Índice

- [Comandos Disponíveis](#comandos-disponíveis)
- [Hooks de Automação](#hooks-de-automação)
- [Como Usar](#como-usar)
- [Exemplos Práticos](#exemplos-práticos)
- [Configuração](#configuração)
- [Melhores Práticas](#melhores-práticas)

## 🚀 Comandos Disponíveis

### 1. Arquitetura e Qualidade

#### `/object-calisthenics-enforcer` - Validação de Object Calisthenics

**Propósito:** Garantir compliance rigoroso com as 9 regras obrigatórias de Object Calisthenics.

**Características:**

- Validação automática das 9 regras
- Refatoração para compliance
- Relatórios detalhados de violações
- Correções práticas e incrementais

**Uso:**

```bash
/object-calisthenics-enforcer path/to/file.ts
/object-calisthenics-enforcer --audit src/main/
```

#### `/architecture-improvement` - Melhorias Arquiteturais

**Propósito:** Analisar e melhorar a arquitetura seguindo padrões estabelecidos.

**Características:**

- Auditoria arquitetural completa
- Aplicação de CRUD Consolidation
- Implementação de Clean Architecture
- Melhorias incrementais validadas

**Uso:**

```bash
/architecture-improvement analyze
/architecture-improvement improve src/main/agents/
```

#### `/quality-validator` - Validação de Qualidade

**Propósito:** Validar compliance com todos os padrões de qualidade do projeto.

**Características:**

- Validação automática e manual
- Relatórios de qualidade detalhados
- Métricas de compliance
- Correções automáticas quando possível

**Uso:**

```bash
/quality-validator --full
/quality-validator --report
/quality-validator --fix path/to/file.ts
```

### 2. Documentação

#### `/documentation-generator` - Gerador de Documentação

**Propósito:** Criar e manter documentação técnica consistente e atualizada.

**Características:**

- Geração automática de documentação
- Padrões consistentes de formato
- Exemplos funcionais e testados
- Integração com código atual

**Uso:**

```bash
/documentation-generator module src/main/agents/
/documentation-generator update
/documentation-generator validate
```

### 3. Desenvolvimento

#### `/quick-fix` - Correção Rápida de Problemas

**Propósito:** Identificar e corrigir problemas específicos de forma eficiente e direta.

**Características:**

- Análise rápida de problemas
- Soluções diretas e eficazes
- Validação automática com comandos de qualidade
- Manutenção da compatibilidade

**Uso:**

```bash
/quick-fix "Erro de TypeScript no arquivo user.service.ts"
```

#### `/debug-analyze` - Análise Profunda de Problemas

**Propósito:** Investigar problemas complexos e fornecer diagnósticos detalhados.

**Características:**

- Análise sistemática de problemas
- Categorização por tipo (Main Process, Renderer, Database, etc.)
- Ferramentas de debug específicas
- Plano de correção detalhado

**Uso:**

```bash
/debug-analyze "Aplicação trava ao carregar dados do banco"
```

#### `/code-review` - Assistente de Revisão de Código

**Propósito:** Conduzir revisões de código profissionais e construtivas.

**Características:**

- Análise multi-dimensional de qualidade
- Feedback estruturado e construtivo
- Checklists específicos por tecnologia
- Métricas de qualidade

**Uso:**

```bash
/code-review "src/main/agents/agent.entity.ts"
```

### 4. `/architecture-analysis` - Análise e Design Arquitetural

**Propósito:** Analisar, projetar e melhorar arquiteturas de software.

**Características:**

- Avaliação de atributos de qualidade
- Análise de gaps arquiteturais
- Proposta de soluções
- Roadmap de implementação

**Uso:**

```bash
/architecture-analysis "Domínio de agentes precisa de melhor escalabilidade"
```

### 5. `/test-generator` - Gerador de Testes e QA

**Propósito:** Gerar testes abrangentes e estabelecer práticas de QA.

**Características:**

- Estratégia de pirâmide de testes
- Templates para diferentes tipos de teste
- Padrões FIRST e Given-When-Then
- Cobertura de testes automatizada

**Uso:**

```bash
/test-generator "src/main/users/user.entity.ts"
```

### 6. `/performance-optimizer` - Otimizador de Performance

**Propósito:** Identificar gargalos e implementar otimizações de performance.

**Características:**

- Análise de performance frontend/backend
- Estratégias de caching
- Monitoramento e métricas
- Benchmarking automatizado

**Uso:**

```bash
/performance-optimizer "API de mensagens está lenta"
```

### 7. `/security-auditor` - Auditor de Segurança

**Propósito:** Identificar vulnerabilidades e implementar controles de segurança.

**Características:**

- Checklist OWASP Top 10
- Análise de vulnerabilidades
- Implementação de controles
- Testes de segurança

**Uso:**

```bash
/security-auditor "Verificar segurança do sistema de autenticação"
```

### 8. `/docs-generator` - Gerador de Documentação

**Propósito:** Criar documentação abrangente e maintível.

**Características:**

- Templates para diferentes tipos de documentação
- Documentação de API automatizada
- Padrões de qualidade
- Fluxo de manutenção

**Uso:**

```bash
/docs-generator "Criar documentação da API de domínios"
```

### 9. `/refactor-assistant` - Assistente de Refatoração

**Propósito:** Melhorar qualidade do código através de refatoração sistemática.

**Características:**

- Detecção de code smells
- Padrões de refatoração
- Análise de impacto
- Validação contínua

**Uso:**

```bash
/refactor-assistant "Refatorar classe UserService que está muito grande"
```

### 10. `/auto-improvement` - Análise e Refatoração Prática

**Propósito:** Analisar código e melhorá-lo seguindo Clean Code e DX.

**Características:**

- Foco em Clean Code e Developer Experience
- Análise de dores reais de desenvolvimento
- Soluções práticas e incrementais
- Object Calisthenics aplicados

**Uso:**

```bash
/auto-improvement "Analisar e melhorar estrutura de componentes React"
```

## 🔧 Hooks de Automação

Os hooks são configurados em `.claude/settings.hooks.json` e automatizam tarefas comuns durante o desenvolvimento:

### Hooks de Qualidade

- **pre-commit-quality-check**: Executa verificações antes de commits
- **auto-format-on-edit**: Formata arquivos automaticamente após edição
- **lint-fix-on-save**: Corrige problemas de lint ao salvar

### Hooks de Build e Deploy

- **build-check-on-main-change**: Verifica build após mudanças no main process
- **renderer-build-on-ui-change**: Constrói renderer após mudanças na UI
- **db-migrate-on-schema-change**: Aplica migrações quando schema muda

### Hooks de Testes

- **test-on-function-change**: Executa testes específicos após mudanças
- **integration-test-on-ipc-change**: Testa IPC após mudanças nos handlers

### Hooks de Segurança

- **security-scan-on-sensitive-files**: Scanneia arquivos sensíveis
- **dependency-audit**: Auditoria de dependências após mudanças

### Hooks de Monitoramento

- **performance-benchmark**: Benchmarks após mudanças de domínio
- **architecture-compliance**: Valida compliance arquitetural
- **code-complexity-check**: Verifica complexidade do código

## 💡 Como Usar

### Executando Comandos

```bash
# Comando básico
claude /quick-fix "Descrição do problema"

# Comando com arquivo específico
claude /code-review src/main/users/user.entity.ts

# Comando com contexto adicional
claude /architecture-analysis "Análise do domínio de projetos para melhorar escalabilidade"
```

### Configurando Hooks

1. **Localização:** `.claude/settings.hooks.json`
2. **Ativação:** Hooks são executados automaticamente baseado em padrões
3. **Personalização:** Modifique comandos e padrões conforme necessário

### Exemplo de Hook Personalizado

```json
{
  "name": "custom-validation",
  "type": "PostToolUse",
  "tool": "Edit",
  "match": "src/main/.*\\.ts$",
  "command": "npm run validate-domain -- $TOOL_ARGS_FILE_PATH",
  "description": "Valida domínios após mudanças",
  "continueOnFailure": true
}
```

## 📝 Exemplos Práticos

### Cenário 1: Correção de Bug

```bash
# Problema encontrado
claude /debug-analyze "Erro 500 na API de usuários ao criar novo usuário"

# Análise aprofundada
claude /code-review src/main/users/functions/user-create.functions.ts

# Correção aplicada
claude /quick-fix "Validação de email falhando com domínios específicos"
```

### Cenário 2: Melhoria de Performance

```bash
# Análise de performance
claude /performance-optimizer "Dashboard de projetos carregando muito lento"

# Implementação de melhorias
claude /refactor-assistant "Otimizar query de listagem de projetos"

# Validação
claude /test-generator "Criar testes de performance para API de projetos"
```

### Cenário 3: Refatoração Arquitetural

```bash
# Análise arquitetural
claude /architecture-analysis "Domínio de agentes precisa de melhor separação de responsabilidades"

# Implementação da refatoração
claude /refactor-assistant "Extrair worker de agentes para classe separada"

# Documentação
claude /docs-generator "Documentar nova arquitetura de agentes"
```

## ⚙️ Configuração

### Configuração Inicial

1. **Instale as dependências:**

```bash
npm install
```

2. **Configure os scripts no package.json:**

```json
{
  "scripts": {
    "quality:check": "npm run lint && npm run type-check",
    "security:scan": "npm audit && snyk test",
    "complexity:check": "complexity-report",
    "architecture:validate": "custom-architecture-validator"
  }
}
```

3. **Configure variáveis de ambiente:**

```bash
# .env
DEBUG=project-wiz:*
NODE_ENV=development
```

### Configuração Avançada

**Configuração de Hooks:**

```json
{
  "hooks": [
    {
      "name": "projeto-específico",
      "type": "PreToolUse",
      "tool": "Bash",
      "match": "git.*commit",
      "command": "npm run pre-commit-checks",
      "continueOnFailure": false
    }
  ]
}
```

## 📚 Melhores Práticas

### Para Comandos

1. **Seja Específico:** Forneça contexto detalhado nos prompts
2. **Iteração:** Use comandos em sequência para problemas complexos
3. **Validação:** Sempre valide mudanças com comandos de qualidade
4. **Documentação:** Documente decisões importantes

### Para Hooks

1. **Segurança:** Valide comandos antes de executar
2. **Performance:** Evite hooks muito lentos
3. **Confiabilidade:** Use `continueOnFailure` apropriadamente
4. **Manutenção:** Revise hooks regularmente

### Fluxo de Trabalho Recomendado

```bash
# 1. Análise inicial
claude /debug-analyze "Problema específico"

# 2. Revisão de código
claude /code-review arquivo-específico.ts

# 3. Implementação de correção
claude /quick-fix "Correção baseada na análise"

# 4. Validação (executada automaticamente pelos hooks)
# - Formatação
# - Linting
# - Type checking
# - Testes

# 5. Documentação (se necessário)
claude /docs-generator "Documentar mudanças importantes"
```

## 🎯 Comandos por Categoria

### Desenvolvimento e Debug

- `/quick-fix` - Correções rápidas
- `/debug-analyze` - Análise profunda
- `/refactor-assistant` - Refatoração sistemática

### Qualidade e Revisão

- `/code-review` - Revisão de código
- `/test-generator` - Geração de testes
- `/auto-improvement` - Melhoria contínua

### Arquitetura e Design

- `/architecture-analysis` - Análise arquitetural
- `/performance-optimizer` - Otimização de performance
- `/security-auditor` - Auditoria de segurança

### Documentação e Manutenção

- `/docs-generator` - Geração de documentação

## 🔗 Recursos Adicionais

### Documentação Oficial

- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
- [Hooks Reference](https://docs.anthropic.com/en/docs/claude-code/hooks)

### Comunidade

- [Awesome Claude Code](https://github.com/hesreallyhim/awesome-claude-code)
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)

### Ferramentas Complementares

- ESLint com regras de segurança
- Prettier para formatação
- Husky para git hooks
- Snyk para auditoria de dependências

---

## 📞 Suporte

Se você encontrar problemas ou tiver sugestões para melhorar os comandos:

1. Verifique a documentação do comando específico
2. Consulte os logs de execução
3. Revise a configuração dos hooks
4. Abra uma issue no repositório

**Lembre-se:** Estes comandos foram projetados para maximizar a produtividade e qualidade do código, seguindo as melhores práticas da indústria e as especificidades do projeto Project Wiz.
