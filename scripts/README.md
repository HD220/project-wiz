# Scripts de Automação - Sistema de Agentes AI

Esta pasta contém scripts bash para automatizar o processo de implementação das tasks do Sistema de Agentes AI.

## 📋 Scripts Disponíveis

### 1. `send-tasks-to-claude.sh` - Envio Automático para Claude Code

Envia o conteúdo das tasks sequencialmente para o Claude Code CLI para implementação automática.

**Uso:**
```bash
# Enviar todas as tasks
./scripts/send-tasks-to-claude.sh

# Enviar range específico
./scripts/send-tasks-to-claude.sh 01 05        # MVP Phase
./scripts/send-tasks-to-claude.sh 09A 12C     # Micro-tasks avançadas
./scripts/send-tasks-to-claude.sh 10A 10C     # Apenas Task 10 completa

# Ver ajuda
./scripts/send-tasks-to-claude.sh --help
```

**Características:**
- ✅ Ordem sequencial respeitando dependências
- ✅ Suporte a ranges (start-end)
- ✅ Confirmação antes do envio
- ✅ Pause entre envios (2s)
- ✅ Feedback colorido no terminal
- ✅ Verificação de pré-requisitos

### 2. `list-tasks.sh` - Visualização e Navegação

Lista, filtra e visualiza o conteúdo das tasks disponíveis.

**Uso:**
```bash
# Listar todas as tasks
./scripts/list-tasks.sh

# Filtros por fase
./scripts/list-tasks.sh --mvp          # Tasks 01-05
./scripts/list-tasks.sh --enhanced     # Tasks 06-09
./scripts/list-tasks.sh --advanced     # Tasks 10-12
./scripts/list-tasks.sh --micro        # Apenas micro-tasks

# Resumo estatístico
./scripts/list-tasks.sh --summary

# Visualizar task específica
./scripts/list-tasks.sh --view 01      # Task 01
./scripts/list-tasks.sh --view 09A     # Micro-task 09A

# Ver ajuda
./scripts/list-tasks.sh --help
```

**Características:**
- 📊 Tabela organizada com informações completas
- 🎨 Output colorido por fase (MVP=Verde, Enhanced=Amarelo, Advanced=Roxo)
- 📋 Resumo estatístico com totais e estimativas
- 👁️ Visualização de conteúdo com syntax highlighting
- 🔍 Filtros por fase e tipo

## 🚀 Fluxo de Trabalho Recomendado

### 1. **Exploração Inicial**
```bash
# Ver resumo geral
./scripts/list-tasks.sh --summary

# Listar tasks MVP para começar
./scripts/list-tasks.sh --mvp
```

### 2. **Visualização de Task**
```bash
# Ver conteúdo da primeira task
./scripts/list-tasks.sh --view 01

# Analisar micro-tasks de uma funcionalidade
./scripts/list-tasks.sh --view 09A
./scripts/list-tasks.sh --view 09B
./scripts/list-tasks.sh --view 09C
```

### 3. **Implementação por Fases**

**MVP Phase (Funcionalidade básica):**
```bash
./scripts/send-tasks-to-claude.sh 01 05
```

**Enhanced Phase (Polimento):**
```bash
./scripts/send-tasks-to-claude.sh 06 08
./scripts/send-tasks-to-claude.sh 09A 09C  # Task 09 em micro-tasks
```

**Advanced Phase (Recursos avançados):**
```bash
./scripts/send-tasks-to-claude.sh 10A 10C  # Tools
./scripts/send-tasks-to-claude.sh 11A 11C  # Hiring  
./scripts/send-tasks-to-claude.sh 12A 12C  # Collaboration
```

### 4. **Implementação Individual**
```bash
# Implementar apenas uma task específica
./scripts/send-tasks-to-claude.sh 01 01

# Implementar uma micro-task específica
./scripts/send-tasks-to-claude.sh 09A 09A
```

## 📁 Estrutura de Tasks

```
prps/sistema-agentes-ai/tasks/
├── README.md                                    # Visão geral e mapa de progresso
├── 01-basic-llm-provider-creation.md          # MVP
├── 02-list-llm-providers.md                   # MVP
├── 03-basic-agent-creation.md                 # MVP
├── 04-list-agents.md                          # MVP
├── 05-agent-chat-interface.md                 # MVP
├── 06-provider-management-enhanced.md         # Enhanced
├── 07-agent-configuration-enhanced.md         # Enhanced
├── 08-agent-memory-system-enhanced.md         # Enhanced
├── 09A-task-queue-foundation.md              # Enhanced (Micro)
├── 09B-background-worker-system.md           # Enhanced (Micro)
├── 09C-task-management-interface.md          # Enhanced (Micro)
├── 10A-tool-foundation-registry.md           # Advanced (Micro)
├── 10B-git-analysis-tools.md                 # Advanced (Micro)
├── 10C-chat-integration-interface.md         # Advanced (Micro)
├── 11A-project-analysis-database.md          # Advanced (Micro)
├── 11B-ai-candidate-generation.md            # Advanced (Micro)
├── 11C-hiring-interface-workflow.md          # Advanced (Micro)
├── 12A-collaboration-foundation-database.md  # Advanced (Micro)
├── 12B-agent-coordination-execution.md       # Advanced (Micro)
└── 12C-workflow-builder-monitoring.md        # Advanced (Micro)
```

## ⚙️ Pré-requisitos

### Claude Code CLI
```bash
# Instalar Claude Code CLI
# Seguir instruções em: https://docs.anthropic.com/en/docs/claude-code

# Verificar instalação
claude --version
```

### Dependências do Sistema
```bash
# Ubuntu/Debian
sudo apt-get install bc

# macOS
brew install bc

# Verificar dependências
which bc      # Para cálculos matemáticos
which bat     # Para syntax highlighting (opcional)
```

## 🎯 Benefícios dos Scripts

### **Automatização Completa**
- ✅ Envio sequencial respeitando dependências
- ✅ Implementação hands-off com Claude Code
- ✅ Redução de erros manuais

### **Navegação Eficiente**
- 📋 Visualização rápida de todas as tasks
- 🔍 Filtros por fase e complexidade
- 📊 Métricas e estatísticas úteis

### **Flexibilidade de Execução**
- 🎯 Implementação por fases ou tasks individuais
- 🔄 Suporte a micro-tasks subdividas
- ⚡ Feedback em tempo real

### **Controle de Qualidade**
- ✅ Confirmação antes de envios em lote
- 📋 Verificação de pré-requisitos
- 🎨 Output claro e organizado

## 🚨 Notas Importantes

1. **Ordem de Implementação**: Os scripts respeitam as dependências entre tasks. Sempre implemente em ordem sequencial.

2. **Micro-tasks**: Tasks complexas (09, 10, 11, 12) foram subdividas em micro-tasks (A, B, C) que devem ser implementadas sequencialmente.

3. **Claude Code CLI**: Certifique-se de ter o Claude Code CLI configurado e funcionando antes de usar os scripts de envio.

4. **Backup**: Sempre faça backup do código antes de implementações automáticas em lote.

5. **Teste Individual**: Teste cada fase antes de prosseguir para a próxima.

---

*Scripts criados para facilitar a implementação do Sistema de Agentes AI no Project Wiz.*