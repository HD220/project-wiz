# Guia: Schema do Banco de Dados

Este documento fornece uma visão geral do schema do banco de dados utilizado pelo Project Wiz, com foco nas principais entidades e seus relacionamentos. O Project Wiz utiliza **SQLite** como seu banco de dados principal, com o ORM **Drizzle ORM** para interações e migrações.

*(Nota: Este documento é uma visão geral conceitual e pode não refletir todos os campos ou tabelas exatas em um determinado momento. Para a definição mais precisa, consulte os arquivos de schema do Drizzle ORM no código-fonte do projeto, geralmente localizados em uma pasta como `src/infrastructure/services/drizzle/schema` ou similar).*

## 1. Visão Geral e Ferramentas

*   **Banco de Dados:** SQLite (armazenamento local em arquivo).
*   **ORM:** Drizzle ORM.
*   **Migrações:** Gerenciadas pelo Drizzle Kit (ex: `drizzle-kit generate` e `drizzle-kit migrate`).
*   **Drizzle Studio:** Uma ferramenta visual (`drizzle-kit studio`) pode ser usada para inspecionar o banco de dados durante o desenvolvimento.

## 2. Principais Entidades e Tabelas (Conceitual)

A seguir, uma descrição das prováveis tabelas principais e seus campos mais importantes. Os nomes exatos das tabelas e colunas são definidos pelo schema do Drizzle.

### 2.1. `users` (Usuários)
   - `id`: Identificador único do usuário (ex: UUID ou serial).
   - `username`: Nome de usuário para login.
   - `password_hash`: Hash da senha do usuário.
   - `email`: Endereço de e-mail.
   - `avatar_url`: URL para o avatar do usuário.
   - `created_at`, `updated_at`: Timestamps.
   *(Relacionado à funcionalidade de login de usuário mencionada no TODO).*

### 2.2. `projects` (Projetos)
   - `id`: Identificador único do projeto.
   - `name`: Nome do projeto.
   - `description`: Descrição do projeto.
   - `github_repo_url`: URL do repositório GitHub associado (opcional).
   - `owner_id` ou `user_id`: Chave estrangeira para a tabela `users`, indicando o proprietário ou criador (se aplicável).
   - `created_at`, `updated_at`.

### 2.3. `personas` (Personas/Agentes Configurados)
   - `id`: Identificador único da Persona.
   - `name`: Nome dado à Persona pelo usuário.
   - `role`: Papel da Persona (ex: "Desenvolvedor Frontend", "Analista de QA").
   - `goal`: Objetivo principal definido para a Persona.
   - `backstory`: História ou contexto da Persona.
   - `llm_provider_config_id`: Chave estrangeira para `llm_provider_configs`, indicando qual configuração de LLM esta Persona utiliza.
   - `temperature`: Parâmetro de temperatura para o LLM (se configurável por Persona).
   - `user_id`: Chave estrangeira para `users` (quem criou/possui esta Persona).
   - `created_at`, `updated_at`.

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
   - `created_at`, `updated_at`.

### 2.6. `jobs` (Jobs/Tarefas)
   - `id`: Identificador único do Job (UUID).
   - `name`: Nome ou título do Job.
   - `project_id`: Chave estrangeira para `projects`, indicando a qual projeto este Job pertence.
   - `persona_id`: Chave estrangeira para `personas`, indicando qual Persona está (ou deveria estar) trabalhando neste Job.
   - `status`: Status atual do Job (ex: "waiting", "active", "completed", "failed", "delayed" - conforme definido na [Arquitetura de Jobs](./01-architecture.md#3-entidade-job)).
   - `priority`: Prioridade do Job.
   - `payload`: Dados de entrada para o Job (JSON/TEXT).
   - `data`: Dados intermediários ou mutáveis durante a execução (JSON/TEXT).
   - `result`: Resultado final do Job (JSON/TEXT).
   - `attempts`, `max_attempts`: Controle de tentativas.
   - `delay`, `retry_delay`, `max_retry_delay`: Controle de atrasos e retentativas.
   - `depends_on_job_id`: Chave estrangeira para outro Job (auto-relacionamento), para dependências.
   - `created_at`, `updated_at`, `started_at`, `finished_at`.
   - `failed_reason`: Motivo da falha, se houver.

### 2.7. `job_logs` (Logs de Execução de Jobs) - Potencial
   - `id`: Identificador do log.
   - `job_id`: Chave estrangeira para `jobs`.
   - `timestamp`: Momento do log.
   - `message`: Conteúdo do log.
   - `level`: Nível do log (INFO, ERROR, DEBUG).

### 2.8. Outras Tabelas Potenciais
   *   `persona_tools`: Tabela de associação para definir quais Tools uma Persona específica pode usar.
   *   `project_members`: Se múltiplos usuários puderem colaborar em projetos.
   *   `annotations`: Para a `AnnotationTool`.
   *   `memory_entries`: Para a `MemoryTool`.

## 3. Relacionamentos Principais (Conceitual)

*   Um `User` pode ter muitas `Projects`, muitas `Personas` e muitas `LLMProviderConfigs`.
*   Um `Project` pertence a um `User` (ou tem um owner) e pode ter muitos `Jobs`.
*   Uma `Persona` pertence a um `User`, usa uma `LLMProviderConfig`, e pode ser atribuída a muitos `Jobs`.
*   Uma `LLMProviderConfig` pertence a um `User` e a um `LLMProvider`.
*   Um `Job` pertence a um `Project`, é geralmente atribuído a uma `Persona`, e pode depender de outro `Job`.

## 4. Migrações

As alterações no schema são gerenciadas através de arquivos de migração gerados pelo Drizzle Kit. É crucial aplicar as migrações para manter o banco de dados consistente com a definição do schema no código.

Comandos comuns (conforme `package.json`):
*   `npm run db:generate`: Gera arquivos de migração com base nas alterações do schema.
*   `npm run db:migrate`: Aplica as migrações pendentes ao banco de dados.

## Conclusão

Este documento oferece uma visão de alto nível do schema do banco de dados do Project Wiz. Para detalhes precisos sobre campos, tipos e constraints, os desenvolvedores devem consultar diretamente os arquivos de definição de schema do Drizzle ORM no código-fonte. Uma estrutura de banco de dados bem definida é essencial para a persistência e a integridade dos dados que sustentam a operação dos Agentes e o gerenciamento dos projetos.
