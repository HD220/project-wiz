# Documentação do Sistema de Agentes Autônomos e Processamento de Jobs

Este documento serve como um índice e guia para a documentação detalhada do sistema de Agentes Autônomos e Processamento de Jobs. Aqui você encontrará informações sobre a visão geral, conceitos chave, arquitetura, fluxos, decisões arquiteturais, requisitos, implementação e aspectos relacionados ao uso de Large Language Models (LLMs) neste sistema.

## Índice

- 01 - Visão Geral
  - [Introdução](01-visao-geral/introducao.md)
  - [Princípios Fundamentais](01-visao-geral/principios-fundamentais.md)
- 02 - Conceitos Chave
  - [Activity](02-conceitos-chave/activity.md)
  - [Job](02-conceitos-chave/job.md)
  - [AgentInternalState](02-conceitos-chave/agent-internal-state.md)
  - [ActivityContext](02-conceitos-chave/activity-context.md)
  - [Task](02-conceitos-chave/task.md)
  - [Tool](02-conceitos-chave/tool.md)
  - [Queue](02-conceitos-chave/queue.md)
  - [Worker](02-conceitos-chave/worker.md)
  - [WorkerPool](02-conceitos-chave/worker-pool.md)
  - [AutonomousAgent](02-conceitos-chave/autonomous-agent.md)
  - [IAgentService](02-conceitos-chave/iagent-service.md)
  - [ProcessJobService](02-conceitos-chave/process-job-service.md)
- 03 - Arquitetura
  - [Arquitetura Geral](03-arquitetura/arquitetura-geral.md)
  - [Camadas e Componentes](03-arquitetura/camadas-e-componentes.md)
- 04 - Fluxos
  - [O Loop do Agente Autônomo](04-fluxos/loop-agente.md)
  - [Fluxo de Dados e Controle](04-fluxos/fluxo-dados-controle.md)
- 05 - Decisões Arquiteturais
  - [ADRs](05-decisoes-arquiteturais/adrs.md) (índice das ADRs individuais)
- 06 - Requisitos
  - [PRD](06-requisitos/prd.md)
  - [Casos de Uso](06-requisitos/casos-de-uso.md)
- 07 - Implementação
  - [Considerações Gerais de Implementação e Desafios](07-implementacao/consideracoes-gerais.md)
  - [Gerenciamento de Activity History Grande](07-implementacao/gerenciamento-activity-history.md)
- 08 - LLM
  - [Prompts para o Large Language Model (LLM)](08-llm/prompts.md)
