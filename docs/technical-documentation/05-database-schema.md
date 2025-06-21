# Guia: Schema do Banco de Dados

Este documento fornece uma visão geral do schema do banco de dados utilizado pelo Project Wiz, com foco nas principais entidades e seus relacionamentos. O Project Wiz utiliza **SQLite** como seu banco de dados principal, com o ORM **Drizzle ORM** para interações e migrações.

*(Nota: Este documento é uma visão geral conceitual e pode não refletir todos os campos ou tabelas exatas em um determinado momento. Para a definição mais precisa, consulte os arquivos de schema do Drizzle ORM no código-fonte do projeto, geralmente localizados em `src/infrastructure/db/schemas` ou similar).*

## 1. Visão Geral e Ferramentas

*   **Banco de Dados:** SQLite (armazenamento local em arquivo).
*   **ORM:** Drizzle ORM.
*   **Migrações:** Gerenciadas pelo Drizzle Kit (ex: `drizzle-kit generate` e `drizzle-kit migrate`).
*   **Drizzle Studio:** Uma ferramenta visual (`drizzle-kit studio`) pode ser usada para inspecionar o banco de dados durante o desenvolvimento.

## 2. Principais Entidades e Tabelas

A seguir, uma descrição das tabelas principais e seus campos mais importantes, conforme definido nos schemas Drizzle.

### 2.1. `users` (Usuários)
   - `id`: Identificador único do usuário (ex: UUID ou serial).
   - `username`: Nome de usuário para login.
   - `password_hash`: Hash da senha do usuário.
   - `email`: Endereço de e-mail.
   - `avatar_url`: URL para o avatar do usuário.
   - `createdAt`, `updatedAt`: Timestamps.
   *(Relacionado à funcionalidade de login de usuário).*

### 2.2. `projects` (Projetos)
   - `id`: Identificador único do projeto.
   - `name`: Nome do projeto.
   - `description`: Descrição do projeto.
   - `github_repo_url`: URL do repositório GitHub associado (opcional).
   - `owner_id` ou `user_id`: Chave estrangeira para a tabela `users`, indicando o proprietário ou criador (se aplicável).
   - `createdAt`, `updatedAt`.

### 2.3. `personas` (Personas/Agentes Configurados)
   - `id`: Identificador único da Persona.
   - `name`: Nome dado à Persona pelo usuário.
   - `role`: Papel da Persona (ex: "Desenvolvedor Frontend", "Analista de QA").
   - `goal`: Objetivo principal definido para a Persona.
   - `backstory`: História ou contexto da Persona.
   - `llm_provider_config_id`: Chave estrangeira para `llm_provider_configs`, indicando qual configuração de LLM esta Persona utiliza.
   - `temperature`: Parâmetro de temperatura para o LLM (se configurável por Persona).
   - `user_id`: Chave estrangeira para `users` (quem criou/possui esta Persona).
   - `createdAt`, `updatedAt`.

### 2.4. `llm_providers` (Provedores de LLM)
   - `id`: Identificador único do provedor (ex: "openai", "deepseek").
   - `name`: Nome legível do provedor (ex: "OpenAI", "DeepSeek").
   - `slug`: Um slug para identificar o provedor.
   *(Esta tabela pode ser pré-populada ou gerenciada administrativamente).*

### 2.5. `llm_provider_configs` (Configurações de Provedores de LLM por Usuário)
   - `id`: Identificador único da configuração.
   - `user_id`: Chave estrangeira para `users`.
   - `llm_provider_id`: Chave estrangeira para `llm_providers`.
   - `api_key_hash` ou `api_key_reference`: Referência segura para a chave de API do usuário para aquele provedor.
   - `name`: Um nome dado pelo usuário para esta configuração (ex: "Minha Chave OpenAI Pessoal").
   - `createdAt`, `updatedAt`.

### 2.6. `jobs` (Jobs/Tarefas do Sistema)

Esta tabela armazena as Jobs (atividades) que o sistema precisa processar. Os campos são definidos no schema Drizzle `jobs.ts`:

*   `id`: Identificador único do Job (UUID string). Chave Primária.
*   `name`: Nome descritivo do Job (TEXT, NOT NULL).
*   `status`: Status atual do Job (TEXT ENUM: 'pending', 'waiting', 'active', 'delayed', 'completed', 'failed', 'cancelled', NOT NULL).
*   `priority`: Prioridade numérica do Job (INTEGER, NOT NULL). Menor número = maior prioridade.
*   `currentAttempts`: Número de tentativas de execução já realizadas (INTEGER, NOT NULL, default 0).
*   `maxAttempts`: Número máximo de tentativas permitidas (INTEGER, NOT NULL, default 3).
*   `payload`: Dados de entrada para o Job (JSON TEXT, NULLABLE).
*   `result`: Resultado final da execução do Job (JSON TEXT, NULLABLE).
*   `data`: Campo para armazenar dados dinâmicos, primariamente o `ActivityContext` serializado (JSON TEXT, NOT NULL).
*   `createdAt`: Timestamp de criação do Job (INTEGER, como milliseconds since epoch, NOT NULL, default current time).
*   `updatedAt`: Timestamp da última atualização do Job (INTEGER, como milliseconds since epoch, NOT NULL, default current time).
*   `executeAfter`: Timestamp para Jobs agendados/atrasados (INTEGER, como milliseconds since epoch, NULLABLE).
*   `failedReason`: Motivo da falha, se aplicável (TEXT, NULLABLE).
*   `dependsOn`: Array de JobIds (strings UUID) dos quais este Job depende, armazenado como JSON TEXT (NULLABLE).

### 2.7. `workers` (Workers do Sistema)

Esta tabela representa os workers que processam as jobs. Schema Drizzle `workers.ts`:

*   `id`: Identificador único do Worker (UUID string). Chave Primária.
*   `associatedAgentId`: ID do Agente (`AgentId` value, UUID string) ao qual este worker está associado ou para o qual está configurado (TEXT, NULLABLE).
*   `status`: Status atual do Worker (TEXT ENUM: 'idle', 'busy', 'offline', 'error', NOT NULL).
*   `createdAt`: Timestamp de criação do Worker (INTEGER, como milliseconds since epoch, NOT NULL, default current time).
*   `lastHeartbeatAt`: Timestamp do último sinal de atividade ou atualização do Worker (INTEGER, como milliseconds since epoch, NOT NULL, default current time).

### 2.8. `agent_states` (Estado Interno dos Agentes)

Armazena o estado interno persistente dos agentes. Schema Drizzle `agent-states.ts`:

*   `agentId`: Identificador único do Agente (`AgentId` value, UUID string), que também é a Chave Primária desta tabela.
*   `currentProjectId`: ID do projeto atualmente em foco pelo agente (TEXT, NULLABLE).
*   `currentGoal`: Objetivo principal atual do agente (TEXT, NULLABLE).
*   `generalNotes`: Notas gerais ou aprendizados persistentes do agente (TEXT, NULLABLE).
*   `updatedAt`: Timestamp da última atualização deste estado (INTEGER, como milliseconds since epoch, NOT NULL, default current time).

### 2.9. `job_logs` (Logs de Execução de Jobs) - Potencial
   - `id`: Identificador do log.
   - `job_id`: Chave estrangeira para `jobs`.
   - `timestamp`: Momento do log.
   - `message`: Conteúdo do log.
   - `level`: Nível do log (INFO, ERROR, DEBUG).
   *(Esta tabela é conceitual e pode ser implementada para maior observabilidade).*

### 2.10. Outras Tabelas Potenciais
   *   `persona_tools`: Tabela de associação para definir quais Tools uma Persona específica pode usar (se a configuração de tools for granular por persona).
   *   `project_members`: Se múltiplos usuários puderem colaborar em projetos.

## 3. Relacionamentos Principais

*   Um `User` pode ter muitas `Projects`, muitas `Personas` e muitas `LLMProviderConfigs`.
*   Um `Project` pertence a um `User` (ou tem um owner). A relação entre `Jobs` e `Projects` é gerenciada no nível da aplicação ou através do `ActivityContext` da Job (e.g., campo `currentProjectId` no `agent_states`), não por uma chave estrangeira direta no schema `jobs`.
*   Uma `Persona` pertence a um `User` e usa uma `LLMProviderConfig`. A atribuição de `Jobs` a uma Persona/Agente é gerenciada pela lógica da aplicação (e.g., o `WorkerService` associa um `Worker` a um `AgentId`, e esse `Worker` processa `Jobs`). O `AgentId` no `agent_states` e o `associatedAgentId` no `workers` referem-se à identidade da Persona/Agente.
*   Uma `LLMProviderConfig` pertence a um `User` e a um `LLMProvider`.
*   Um `Job` pode depender de outros `Jobs` (através do campo `dependsOn` na tabela `jobs`).
*   Um `Worker` (tabela `workers`) está geralmente associado a um `AgentId`.
*   A tabela `agent_states` armazena o estado para um `AgentId`.

## 4. Migrações

As alterações no schema são gerenciadas através de arquivos de migração gerados pelo Drizzle Kit. É crucial aplicar as migrações para manter o banco de dados consistente com a definição do schema no código.

Comandos comuns (conforme `package.json`):
*   `npm run db:generate`: Gera arquivos de migração com base nas alterações do schema.
*   `npm run db:migrate`: Aplica as migrações pendentes ao banco de dados.

## Conclusão

Este documento oferece uma visão de alto nível do schema do banco de dados do Project Wiz, refletindo as tabelas e campos implementados para `jobs`, `workers`, e `agent_states`. Para detalhes precisos sobre campos, tipos e constraints, os desenvolvedores devem consultar diretamente os arquivos de definição de schema do Drizzle ORM no código-fonte (`src/infrastructure/db/schemas`). Uma estrutura de banco de dados bem definida é essencial para a persistência e a integridade dos dados que sustentam a operação dos Agentes e o gerenciamento dos projetos.
