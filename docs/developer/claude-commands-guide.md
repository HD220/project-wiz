# Claude Commands Guide

**Data de Criação:** 2025-01-17  
**Última Atualização:** 2025-01-17  
**Status:** Ativo  
**Aplicabilidade:** Todos os desenvolvedores usando Claude Code CLI

---

## Visão Geral

O Project Wiz possui um conjunto abrangente de comandos Claude Code CLI especialmente projetados para garantir qualidade, consistência e produtividade no desenvolvimento. Todos os comandos seguem os padrões arquiteturais estabelecidos do projeto.

## Categorias de Comandos

### 1. 🏗️ Arquitetura e Qualidade

#### `/object-calisthenics-enforcer`

**Propósito:** Garantir compliance rigoroso com as 9 regras obrigatórias de Object Calisthenics.

**Funcionalidades:**

- Validação automática das 9 regras
- Refatoração para compliance
- Relatórios detalhados de violações
- Correções práticas e incrementais

**Exemplos de Uso:**

```bash
# Validar arquivo específico
/object-calisthenics-enforcer src/main/domains/agents/agent.entity.ts

# Auditoria completa de domínio
/object-calisthenics-enforcer --audit src/main/domains/

# Correção automática
/object-calisthenics-enforcer --fix src/main/domains/users/
```

#### `/architecture-improvement`

**Propósito:** Analisar e melhorar a arquitetura seguindo padrões estabelecidos.

**Funcionalidades:**

- Auditoria arquitetural completa
- Aplicação de CRUD Consolidation
- Implementação de Clean Architecture
- Melhorias incrementais validadas

**Exemplos de Uso:**

```bash
# Análise arquitetural
/architecture-improvement analyze

# Melhorar domínio específico
/architecture-improvement improve src/main/domains/agents/

# Consolidar CRUD
/architecture-improvement consolidate src/main/domains/projects/
```

#### `/quality-validator`

**Propósito:** Validar compliance com todos os padrões de qualidade do projeto.

**Funcionalidades:**

- Validação automática e manual
- Relatórios de qualidade detalhados
- Métricas de compliance
- Correções automáticas quando possível

**Exemplos de Uso:**

```bash
# Validação completa
/quality-validator --full

# Relatório detalhado
/quality-validator --report

# Correção automática
/quality-validator --fix src/main/domains/llm/
```

### 2. 📚 Documentação

#### `/documentation-generator`

**Propósito:** Criar e manter documentação técnica consistente e atualizada.

**Funcionalidades:**

- Geração automática de documentação
- Padrões consistentes de formato
- Exemplos funcionais e testados
- Integração com código atual

**Exemplos de Uso:**

```bash
# Gerar documentação de módulo
/documentation-generator module src/main/domains/agents/

# Atualizar toda documentação
/documentation-generator update

# Validar documentação
/documentation-generator validate
```

### 3. 🛠️ Desenvolvimento

#### `/quick-fix`

**Propósito:** Identificar e corrigir problemas específicos de forma eficiente e direta.

**Funcionalidades:**

- Análise rápida de problemas
- Soluções diretas e eficazes
- Validação automática com comandos de qualidade
- Manutenção da compatibilidade

**Exemplos de Uso:**

```bash
# Correção rápida
/quick-fix "Erro de TypeScript no arquivo user.service.ts"

# Problema específico
/quick-fix "Hook useTerminal está violando Object Calisthenics"
```

#### `/debug-analyze`

**Propósito:** Investigar problemas complexos e fornecer diagnósticos detalhados.

**Funcionalidades:**

- Análise sistemática de problemas
- Categorização por tipo (Main Process, Renderer, Database, etc.)
- Ferramentas de debug específicas
- Plano de correção detalhado

**Exemplos de Uso:**

```bash
# Análise profunda
/debug-analyze "Aplicação trava ao carregar dados do banco"

# Debug específico
/debug-analyze "Memory leak no processo de renderização"
```

### 4. 🧠 Planejamento

#### `/brainstorm`

**Propósito:** Iniciar sessões de brainstorm interativas e estruturadas.

**Funcionalidades:**

- Sessões interativas guiadas
- Pesquisa dinâmica na codebase
- Esclarecimento de ambiguidades
- Documentação de decisões

**Exemplos de Uso:**

```bash
# Brainstorm para nova feature
/brainstorm "Sistema de notificações em tempo real"

# Brainstorm para problema
/brainstorm "Otimização de performance da aplicação"
```

#### `/feature-plan`

**Propósito:** Criar documentação completa para novas features.

**Funcionalidades:**

- Análise profunda da codebase
- Identificação de padrões existentes
- Documentação estruturada
- Plano de implementação

**Exemplos de Uso:**

```bash
# Plano de feature
/feature-plan "Integração com sistema de versionamento Git"

# Partir de brainstorm
/feature-plan docs/brainstorms/2025-01-17-notificacoes.md
```

## Hooks Automáticos

### Hooks de Qualidade

```json
{
  "name": "object-calisthenics-check",
  "type": "PostToolUse",
  "tool": "Edit",
  "match": "src/main/domains/.*\\.ts$",
  "command": "/object-calisthenics-enforcer $TOOL_ARGS_FILE_PATH",
  "description": "Validate Object Calisthenics compliance after domain changes"
}
```

### Hooks de Documentação

```json
{
  "name": "documentation-update",
  "type": "PostToolUse",
  "tool": "Edit",
  "match": "src/.*\\.(ts|tsx)$",
  "command": "/documentation-generator update $TOOL_ARGS_FILE_PATH",
  "description": "Update documentation when code changes"
}
```

### Hooks de Validação

```json
{
  "name": "quality-validation",
  "type": "PreToolUse",
  "tool": "Bash",
  "match": "git.*commit",
  "command": "/quality-validator --full",
  "description": "Comprehensive quality validation before commits"
}
```

## Fluxo de Trabalho Recomendado

### 1. Desenvolvimento de Nova Feature

```bash
# 1. Planejamento
/brainstorm "Nova funcionalidade X"
/feature-plan "Implementar funcionalidade X"

# 2. Implementação
# ... código ...

# 3. Validação
/object-calisthenics-enforcer src/main/domains/new-feature/
/quality-validator --full

# 4. Documentação
/documentation-generator module src/main/domains/new-feature/
```

### 2. Correção de Problemas

```bash
# 1. Análise
/debug-analyze "Problema específico"

# 2. Correção
/quick-fix "Problema específico"

# 3. Validação
/quality-validator --fix path/to/fixed/file.ts
```

### 3. Melhoria Arquitetural

```bash
# 1. Análise
/architecture-improvement analyze

# 2. Implementação
/architecture-improvement improve src/main/domains/target/

# 3. Validação
/quality-validator --full
```

## Configuração de Permissões

### settings.local.json

```json
{
  "permissions": {
    "allow": ["Bash(npm run:*)", "Bash(npx:*)", "Bash(git:*)"],
    "deny": []
  }
}
```

## Melhores Práticas

### 1. Uso Consistente

- **Sempre** use comandos de qualidade após mudanças
- **Valide** antes de commits
- **Documente** alterações significativas

### 2. Automação

- **Configure** hooks para validação automática
- **Use** comandos de correção automática
- **Monitore** métricas de qualidade

### 3. Colaboração

- **Compartilhe** comandos úteis com a equipe
- **Documente** novos padrões descobertos
- **Valide** que todos seguem os mesmos padrões

### 4. Evolução

- **Monitore** eficácia dos comandos
- **Sugira** melhorias quando necessário
- **Mantenha** comandos atualizados

## Troubleshooting

### Problema: Comando não encontrado

```bash
# Verificar se comando existe
ls .claude/commands/

# Verificar permissões
cat .claude/settings.local.json
```

### Problema: Hook não executa

```bash
# Verificar configuração de hooks
cat .claude/settings.hooks.json

# Verificar logs
# Hooks executam automaticamente, verifique output
```

### Problema: Validação falha

```bash
# Executar validação manual
/quality-validator --report

# Aplicar correções
/quality-validator --fix
```

## Próximos Passos

1. **Configurar** todos os hooks automáticos
2. **Treinar** equipe no uso dos comandos
3. **Monitorar** métricas de qualidade
4. **Evoluir** comandos conforme necessário

---

**Lembre-se:** Os comandos Claude Code são ferramentas poderosas para manter a qualidade e consistência do código. Use-os regularmente e mantenha-os atualizados com as necessidades do projeto.
