# Plataforma Eletro - Documento de Requisitos do Produto (PRD)

## 1. Visão Geral

### 1.1 Descrição do Produto

A Plataforma Eletro é uma aplicação Electron que permite a criação e gerenciamento de agentes autônomos de IA para desenvolvimento de software. A interface é similar ao Discord, onde usuários conversam com agentes especializados que trabalham em projetos de código de forma colaborativa.

### 1.2 Objetivos Principais

- Criar uma "fábrica de software" onde cada agente funciona como um desenvolvedor especializado
- Permitir execução contínua de tarefas longas sem perder contexto
- Facilitar colaboração entre múltiplos agentes e usuários
- Automatizar processos de desenvolvimento sem necessidade de revisão manual de código

### 1.3 Tecnologias Base

- **Frontend**: Electron (aplicação desktop)
- **Backend**: Node.js (main process)
- **Banco de Dados**: SQLite com Drizzle ORM
- **Vector Search**: vec0 (extensão SQLite)
- **IA SDK**: Vercel AI SDK
- **Embeddings**: Xenova/transformers (all-MiniLM-L6-v2)
- **Sistema de Jobs**: Implementação própria baseada no BullMQ

## 2. Arquitetura do Sistema

### 2.1 Estrutura de Projetos

- Cada projeto é um repositório Git clonado localmente
- Projeto inicia vazio (apenas .git) sem repositório remoto por padrão
- Usuário pode configurar repositório remoto posteriormente
- Interface tipo Discord: projetos = servidores, agentes = membros

### 2.2 Sistema de Jobs/Tasks

#### 2.2.1 Tipos de Jobs

**Jobs de Gerenciamento:**

- Prioridade máxima na fila
- Sem worktree associada
- Não podem criar subtasks
- Contexto: mensagem externa + estado de todas as jobs do agente
- Tools disponíveis: gerenciamento de jobs, envio de mensagens
- Prompt especializado para coordenação

**Jobs de Trabalho:**

- Prioridade normal/configurável
- Com worktree dedicada (criada pelo sistema)
- Podem criar subtasks (jobs children)
- Tools completas: código, git, anotações, conhecimento
- Prompt focado na execução de tarefas

#### 2.2.2 Hierarquia de Jobs

- **Job Main (Mãe)**: Cria worktree, executa tarefa principal
- **Jobs Children (Filhas)**: Compartilham worktree da mãe, executam subtarefas
- Job mãe pausa → children executam → respostas voltam como tool response → mãe continua
- Jobs children podem ser criadas em massa (array de jobs)

#### 2.2.3 Execução por Steps

- Cada job executa usando `generateText({ maxSteps: 1 })`
- Após cada step, job volta para fila
- Worker pega próxima job (pode ser a mesma ou diferente)
- Permite multitasking real entre jobs

### 2.3 Worker System

#### 2.3.1 Estrutura do Worker

- **1 Worker por projeto**
- **Concorrência**: até 5 jobs simultâneas por projeto
- **Implementação**: async/await com `Promise.allSettled()`
- **Priorização**: Jobs de gerenciamento sempre primeiro

#### 2.3.2 Fluxo de Execução

1. Worker busca jobs pendentes do projeto
2. Prioriza jobs de gerenciamento
3. Executa até 5 jobs em paralelo
4. Cada job executa 1 step e volta para fila
5. Repete ciclo continuamente

### 2.4 Sistema de Memória

#### 2.4.1 Níveis de Memória

**Memória do Agente** (`addMemory({ level: "agent" })`):

- Conhecimento pessoal, experiências específicas
- Lições aprendidas individuais

**Memória da Equipe** (`addMemory({ level: "team" })`):

- Conhecimento compartilhado entre agentes do projeto
- Padrões de código, decisões arquiteturais

**Memória do Projeto** (`addMemory({ level: "project" })`):

- Contexto geral, documentação
- Histórico de decisões, requisitos

#### 2.4.2 Anotações Temporárias

**Durante Jobs de Trabalho**:

- `addNote(content)`: Anotações temporárias para a job atual
- Revisadas no final da job main
- Podem gerar novas jobs ou conhecimento permanente

### 2.5 Sistema de Conversas

#### 2.5.1 Tipos de Conversa

- **DM 1x1**: Usuário com agente individual
- **Grupos**: Múltiplos usuários e agentes
- **Channels**: Conversas públicas do projeto

#### 2.5.2 Gerenciamento de Contexto Longo

**Assuntos e Categorização**:

- LLM simples (Deepseek-chat) categoriza mensagens em assuntos
- Assuntos podem ter resumos quando ficam grandes
- Subdivisão em sub-assuntos conforme necessário

**Embeddings e Busca**:

- Embeddings locais usando Xenova/transformers
- Modelo: all-MiniLM-L6-v2
- Armazenamento: vec0 no SQLite
- Busca por similaridade para contexto relevante

**Montagem de Contexto**:

- Janela deslizante: últimas N mensagens
- Busca por assuntos relacionados
- Busca por similaridade (embeddings)
- Limite de tokens configurável

## 3. Sistema de Colaboração

### 3.1 Dispatcher Inteligente

#### 3.1.1 Função

- LLM coordenadora (Deepseek-chat ou configurável)
- Analisa mensagens e decide quem deve responder
- Previne flood de mensagens entre agentes

#### 3.1.2 Processo de Decisão

```typescript
const decision = await generateObject({
  model: dispatcherModel,
  prompt: `Mensagem: ${mensagem}, Participantes: ${perfis}`,
  schema: z.object({
    selectedUsers: z.array(z.string()),
    waitForUser: z.boolean().optional(),
    delaySeconds: z.number().optional(),
  }),
});
```

#### 3.1.3 Controle de Fluxo

- Se usuário está na lista: delay antes de acionar agentes
- Se usuário responder no prazo: cancela jobs dos agentes
- Se usuário não responder: executa jobs normalmente
- Delay configurável (15-30 segundos)

### 3.2 Comunicação Entre Agentes

#### 3.2.1 Canais de Comunicação

- **Canal do Projeto**: Conversa pública, todos veem
- **DMs**: Conversas privadas entre agentes
- **Mensagens com Resposta**: `sendMessage({ requireResponse: true })`

#### 3.2.2 Fluxo de Mensagens

- Agente A envia mensagem → cria job para Agente B
- Job pausada aguardando resposta
- Agente B responde → job de A continua
- Jobs pendentes permitem alternância de contexto

### 3.3 Trabalho Multi-Projeto

- Agentes podem participar de múltiplos projetos
- Jobs children podem especificar `projectSlug` diferente
- Contexto carregado automaticamente do projeto correto

## 4. Fluxos Principais

### 4.1 Criação de Projeto

1. **Usuário cria projeto** com nome e descrição
2. **Agentes são adicionados** como membros
3. **Dispatcher analisa** projeto + perfis dos agentes
4. **Cria jobs de gerenciamento** para agentes relevantes
5. **Agentes decidem** como iniciar (perguntas, estrutura, etc.)

### 4.2 Processamento de Mensagens

1. **Nova mensagem** chega (usuário ou agente)
2. **Sistema salva** mensagem no banco
3. **Categorização**: LLM extrai/atualiza assuntos
4. **Embeddings**: Gera embedding da mensagem
5. **Contexto**: Monta contexto relevante (assuntos + similaridade)
6. **Dispatcher**: Decide quem deve responder
7. **Jobs**: Cria jobs de gerenciamento para agentes selecionados

### 4.3 Execução de Jobs de Trabalho

1. **Job Main inicia**: Sistema cria worktree
2. **Execução por steps**: `generateText({ maxSteps: 1 })`
3. **Alternância**: Job volta para fila após cada step
4. **Jobs Children**: Podem ser criadas durante execução
5. **Revisão**: Job de revisão automática no final
6. **Merge**: Se aprovado, merge automático na branch default

### 4.4 Tratamento de Conflitos

1. **Merge falha**: Sistema detecta conflito
2. **Job de resolução**: Criada para o agente original
3. **Contexto**: Informações do conflito + diff
4. **Resolução**: Agente resolve e prepara novo merge
5. **Retry**: Até 3 tentativas, depois pede ajuda no canal

### 4.5 Autonomia dos Agentes

1. **Standby**: Agente sem jobs ativas
2. **Check-in periódico**: Sistema cria job de gerenciamento genérica
3. **Análise**: Agente revisa projeto, conversas recentes
4. **Decisão**: Cria novas tasks ou volta ao standby
5. **Configurável**: Intervalo e comportamento por agente/projeto

## 5. Tools dos Agentes

### 5.1 Jobs de Gerenciamento

```typescript
// Gerenciamento de jobs
createTask({ message, priority?, delayHours?, recurring? })
editTask({ id, newInstructions })
cancelTask({ id })
scheduleTask({ message, when })

// Comunicação
sendMessage({ to, message, requireResponse? })
sendChannelMessage({ message })
```

### 5.2 Jobs de Trabalho

```typescript
// Memória
addNote({ content }) // Temporária
addMemory({ content, level: "agent"|"team"|"project" }) // Permanente

// Colaboração
sendMessage({ to, message, requireResponse? })
createChildJobs([{ message, projectSlug? }])

// Auto-gerenciamento
createManagementTask({ prompt, context })
```

### 5.3 Tools Técnicas (Jobs de Trabalho)

- Ferramentas de código (criar, editar, deletar arquivos)
- Comandos Git (commit, branch, etc.)
- Execução de comandos do sistema
- Análise de arquivos e estrutura do projeto

## 6. Configurações e Providers

### 6.1 Providers de IA

- **Configurável pelo usuário**: Múltiplos providers
- **Dispatcher**: Modelo barato (Deepseek-chat)
- **Categorizador**: Modelo barato para assuntos
- **Agentes**: Modelos principais (Claude, GPT-4, etc.)
- **Embeddings**: Local (sem custo)

### 6.2 Configurações por Projeto

- **Autonomia**: Nível de proatividade dos agentes
- **Intervalos**: Frequência de check-ins automáticos
- **Limites**: Número máximo de jobs, timeouts
- **Modelos**: Provider e modelo para cada função

## 7. Banco de Dados

### 7.1 Tabelas Principais

```sql
-- Projetos
projects (id, name, description, settings, created_at)

-- Agentes
agents (id, name, role, goal, backstory, capabilities)

-- Jobs
jobs (id, type, status, priority, agent_id, project_id, message, payload, parent_job_id, attempts, created_at, updated_at)

-- Mensagens e Conversas
messages (id, content, sender_id, sender_type, channel_id, project_id, created_at)
subjects (id, name, description, project_id, created_at)
message_subjects (message_id, subject_id)

-- Memória
memory (id, content, created_by, created_at)
agent_memory (memory_id, agent_id)
team_memory (memory_id, project_id)
project_memory (memory_id, project_id)

-- Embeddings
message_embeddings (message_id, embedding)
```

### 7.2 Vector Search (vec0)

- Embeddings armazenados usando vec0
- Busca por similaridade para contexto
- Indexação automática de novas mensagens

## 8. Requisitos Funcionais

### 8.1 RF01 - Criação de Projetos

- Usuário pode criar projetos com nome e descrição
- Sistema clone repositório local vazio
- Agentes são adicionados como membros
- Dispatcher inicia conversação automática

### 8.2 RF02 - Execução de Jobs

- Jobs executam 1 step por vez
- Sistema de prioridades (gerenciamento > trabalho)
- Concorrência limitada por projeto (5 jobs)
- Auto-retry com limite de tentativas

### 8.3 RF03 - Colaboração

- Mensagens entre agentes e usuários
- Dispatcher inteligente para roteamento
- Delay configurável para respostas
- Cancelamento automático se usuário responder

### 8.4 RF04 - Memória e Contexto

- Sistema de assuntos para categorização
- Embeddings para busca por similaridade
- Múltiplos níveis de memória
- Contexto enriquecido automaticamente

### 8.5 RF05 - Autonomia

- Agentes podem se auto-gerenciar
- Check-ins periódicos configuráveis
- Criação autônoma de jobs
- Standby quando sem trabalho

## 9. Requisitos Não Funcionais

### 9.1 RNF01 - Performance

- Embeddings processados localmente
- SQLite com indexação adequada
- Concorrência controlada para evitar sobrecarga
- Steps limitados para responsividade

### 9.2 RNF02 - Escalabilidade

- Sistema de workers por projeto
- Limite de jobs simultâneas
- Configuração flexível de recursos
- Cleanup automático de dados antigos

### 9.3 RNF03 - Confiabilidade

- Auto-retry para jobs falhas
- Cleanup de jobs órfãs
- Backup automático do SQLite
- Logs detalhados para debugging

### 9.4 RNF04 - Usabilidade

- Interface Discord-like familiar
- Configuração simples de providers
- Feedback visual do status das jobs
- Controles de autonomia intuitivos

## 10. Casos de Uso

### 10.1 UC01 - Desenvolvimento de Feature

1. Usuário descreve nova feature no canal
2. Dispatcher aciona PM e desenvolvedores relevantes
3. PM faz perguntas de esclarecimento
4. Desenvolvedor cria jobs para implementação
5. Jobs children para testes e documentação
6. Review automático e merge na main
7. Notificação de conclusão

### 10.2 UC02 - Resolução de Bug

1. Usuário reporta bug com detalhes
2. Dispatcher aciona QA e desenvolvedor
3. QA cria job para reproduzir o bug
4. Desenvolvedor analisa e corrige
5. Conflito de merge detectado
6. Sistema cria job para resolução
7. Merge bem-sucedido após correção

### 10.3 UC03 - Standup Diário

1. Sistema cria job de gerenciamento periódica
2. PM analisa progresso do projeto
3. Identifica bloqueios ou atrasos
4. Cria jobs para outros agentes
5. Atualiza roadmap do projeto
6. Comunica status no canal

### 10.4 UC04 - Onboarding de Agente

1. Novo agente adicionado ao projeto
2. Sistema carrega memória da equipe/projeto
3. Agente recebe contexto via job de gerenciamento
4. Faz perguntas de esclarecimento
5. Recebe primeira task de trabalho
6. Contribui com conhecimento para equipe

## 11. Fluxo de Implementação

### 11.1 Fase 1 - Core System

- Sistema de jobs básico
- Worker com concorrência
- Jobs de gerenciamento vs trabalho
- Sistema de worktrees

### 11.2 Fase 2 - Colaboração

- Dispatcher inteligente
- Comunicação entre agentes
- Sistema de delay/cancelamento
- Multi-projeto

### 11.3 Fase 3 - Memória

- Sistema de assuntos
- Embeddings locais
- Contexto enriquecido
- Múltiplos níveis de memória

### 11.4 Fase 4 - Autonomia

- Check-ins periódicos
- Auto-gerenciamento avançado
- Configurações de autonomia
- Analytics e métricas

## 12. Considerações Técnicas

### 12.1 Embeddings Locais

- Usar Xenova/transformers no main process
- Modelo all-MiniLM-L6-v2 para balanceamento
- vec0 para storage e busca eficiente
- Processamento assíncrono para não bloquear UI

### 12.2 Gestão de Worktrees

- Git worktree para isolamento de trabalho
- Cleanup automático após merge
- Naming convention para organização
- Backup antes de operações destrutivas

### 12.3 Configuração de Providers

- Interface para cadastro de providers
- Validação de API keys
- Fallback para modelos alternativos
- Rate limiting e error handling

### 12.4 Monitoramento

- Logs estruturados para debugging
- Métricas de performance das jobs
- Status de saúde dos agentes
- Alertas para jobs travadas

Este PRD define a arquitetura completa da Plataforma Eletro, fornecendo base sólida para implementação de um sistema de agentes autônomos robusto e escalável.
