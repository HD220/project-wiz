# Sistema de Agentes de IA Humanizados

## Resumo Executivo

Implementação do sistema central de agentes humanizados do Project Wiz, criando "pessoas virtuais" autônomas que colaboram no desenvolvimento de software através de conversas naturais, auto-gestão de tarefas e interação orgânica com usuários e outros agentes.

## Contexto e Motivação

O sistema de agentes representa o diferencial principal do Project Wiz. Atualmente, toda a infraestrutura base está implementada (usuários, projetos, conversas), mas o core value proposition - agentes humanizados colaborativos - está completamente ausente. Esta é a funcionalidade que transforma o Project Wiz de um simples chat em uma "fábrica autônoma de software" onde agentes virtuais trabalham como colegas reais.

## Filosofia dos Agentes

### Agentes como "Pessoas Virtuais"

Os agentes não são ferramentas especializadas, mas **colegas de trabalho virtuais** com:

- **Identidade própria**: Nome, avatar, backstory, personalidade e objetivos
- **Autonomia total**: Criam e gerenciam suas próprias tarefas e prioridades
- **Colaboração natural**: Conversam em DMs e canais como qualquer membro da equipe
- **Memória persistente**: Mantêm contexto de longo prazo e registram aprendizados

### Sistema de Contratação Inteligente

- **Assistente Pessoal**: Cada usuário tem um agente assistente padrão que atua como "gerente de RH virtual"
- **Contratação por Conversa**: Usuário discute necessidades com assistente, que aciona tools de contratação
- **Análise Proativa**: Assistente analisa projeto periodicamente e sugere contratação de especialistas
- **Processo de Seleção**: Sistema gera 3 candidatos com diferentes perfis para escolha
- **Gestão Manual**: Interface para usuário criar/editar agentes diretamente

## Escopo

### Incluído:

#### Core System

- **Schema de dados** para agentes humanizados (persona, backstory, goals, status, memória)
- **AgentService** para gerenciamento completo do ciclo de vida
- **AgentWorker** com sistema de auto-gestão de filas de tarefas
- **Sistema de status** (disponível, ocupado, ausente, offline) estilo Discord
- **Sistema de memória e contexto** para conversas de longa duração

#### Agent Tools & Capabilities

- **Ferramentas base**: Equivalentes às ferramentas do Claude (Bash, Read, Edit, etc.)
- **Ferramentas da plataforma**:
  - Criar/gerenciar projetos
  - Enviar mensagens (DM e canais)
  - Interagir com sistema kanban/issues
  - Gerenciar fila pessoal de tarefas
  - Contratar outros agentes
  - Análise de projetos
- **Auto-agendamento**: Tarefas recorrentes e agendadas na fila pessoal

#### Integration Layer

- **Sistema de roteamento** inteligente baseado em expertise e contexto
- **Integração LLM** (Claude, OpenAI, DeepSeek) via AI SDK
- **Interface IPC** para comunicação frontend-backend
- **Processamento em background** 24/7 das filas de tarefas

### Não Incluído:

- Interface de usuário (será abordada em documento separado)
- Sistema de permissões (implementação inicial com autonomia total)
- Monitoramento avançado de performance
- Sistema de "horário de trabalho" (agentes operam 24/7)

## Arquitetura Técnica

### Agent Lifecycle

1. **Initialization**: Assistente ou usuário inicia processo de contratação
2. **Generation**: LLM gera 3 candidatos com personas únicas
3. **Selection**: Usuário ou assistente escolhe candidato ideal
4. **Onboarding**: Agente se apresenta e estabelece objetivos iniciais
5. **Operation**: Operação contínua 24/7 com processamento de filas
6. **Learning**: Registro contínuo de memórias e aprendizados

## Impacto Esperado

- **Usuários:** Experiência de trabalhar com colegas virtuais especializados
- **Assistentes:** Gestão inteligente e proativa da "equipe virtual"
- **Agentes:** Ambiente de trabalho autônomo com ferramentas completas
- **Sistema:** Plataforma de desenvolvimento colaborativo humano-AI

## Critérios de Sucesso

- Assistente pessoal contrata agentes baseado em necessidades do projeto
- Agentes conversam naturalmente e criam suas próprias tarefas
- Sistema de memória mantém contexto de longo prazo efetivamente
- Filas de tarefas processam trabalho em background continuamente
- Roteamento inteligente direciona mensagens para agentes apropriados
- Agentes colaboram entre si para resolver problemas complexos
