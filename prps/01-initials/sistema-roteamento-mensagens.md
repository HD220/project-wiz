# Sistema de Roteamento de Mensagens

## Resumo Executivo

Implementação do MessageRouter que analisa mensagens em conversas e canais para determinar quando e quais agentes devem ser ativados, criando o fluxo inteligente de interação entre humanos e IA.

## Contexto e Motivação

O Project Wiz possui sistema de conversas e esquemas para agentes, mas falta a ponte inteligente entre eles. O MessageRouter é o componente que transforma conversas casuais em ações automatizadas, analisando intent, contexto e expertise necessária para decidir qual agente deve intervir e que tipo de tarefa deve ser criada.

## Escopo

### Incluído:

- MessageRouter service para análise de intent em mensagens
- Sistema de regras configuráveis para ativação de agentes
- Pattern matching para comandos explícitos (/fix, /review, /test)
- Análise contextual usando LLM para intents implícitos
- Queue management para criação automática de tarefas
- Sistema de cooldown para evitar spam de agentes
- Logging e auditoria de decisões de roteamento
- Configuração por projeto de sensibilidade de ativação

### Não Incluído:

- Machine learning para melhorar decisões ao longo do tempo
- Integração com sistemas externos de ticketing
- Análise de sentimento para priorização
- Sistema de votação para aprovação de ações

## Impacto Esperado

- **Usuários:** Experiência fluida onde conversar naturalmente gera trabalho automatizado
- **Desenvolvedores:** Framework claro para expandir tipos de automação
- **Sistema:** Ponte inteligente entre comunicação humana e execução automatizada

## Critérios de Sucesso

- Comandos explícitos (ex: "/review este código") sempre ativam agente correto
- Discussões naturais ocasionalmente geram tarefas relevantes sem spam
- Agentes são ativados com contexto suficiente para executar tarefa
- Usuários podem controlar sensibilidade de ativação automática
- Sistema mantém log claro de por que cada agente foi ativado
