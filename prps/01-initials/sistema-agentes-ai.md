# Sistema de Agentes de IA

## Resumo Executivo

Implementação do sistema central de agentes de IA do Project Wiz, permitindo a criação, gerenciamento e execução de agentes autônomos que colaboram no desenvolvimento de software através de conversas e tarefas automatizadas.

## Contexto e Motivação

O sistema de agentes representa o diferencial principal do Project Wiz. Atualmente, toda a infraestrutura base está implementada (usuários, projetos, conversas), mas o core value proposition - agentes de IA colaborativos - está completamente ausente. Esta é a funcionalidade que transforma o Project Wiz de um simples chat em uma "fábrica autônoma de software".

## Escopo

### Incluído:

- Schema de dados para agentes, tarefas e filas de trabalho
- AgentService para gerenciamento do ciclo de vida dos agentes
- QueueService para distribuição e execução de tarefas
- AgentWorker base class para execução de tarefas
- Sistema de routing de mensagens para ativação de agentes
- Integração com LLMs (OpenAI, DeepSeek) via AI SDK
- Sistema de personas com roles e expertise específicas
- Interface IPC para comunicação frontend-backend

### Não Incluído:

- Interface de usuário (será abordada em documento separado)
- Análise automática de código para contratação de agentes
- Sistema de worktrees Git para isolamento de trabalho
- Monitoramento avançado de performance

## Impacto Esperado

- **Usuários:** Capacidade de interagir com agentes de IA especializados através de conversas naturais
- **Desenvolvedores:** Framework extensível para criação de novos tipos de agentes
- **Sistema:** Transformação do Project Wiz em plataforma de automação de desenvolvimento

## Critérios de Sucesso

- Agentes podem ser criados, configurados e associados a projetos
- Mensagens em conversas ativam agentes relevantes quando apropriado
- Agentes executam tarefas de código (análise, geração, testes) com sucesso
- Sistema de filas processa tarefas de forma assíncrona e confiável
- Integração perfeita com sistema de conversas existente