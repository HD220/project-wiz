# Issue: Implementar Módulo de Jobs (Backend)

**Propósito:**
Criar o módulo de Jobs (`src/main/modules/job-management`) no backend. Este módulo será responsável pela criação, atualização de status e persistência de Jobs, que representam as unidades de trabalho a serem executadas pelos Agentes (Personas).

**Guia de Implementação:**
1.  **Definição da Entidade Job:**
    *   Definir a entidade `Job` no domínio, incluindo atributos como `id`, `personaId`, `status` (pendente, em progresso, concluído, falha), `type` (tipo de tarefa), `payload` (dados da tarefa), `result` (resultado da tarefa), `createdAt`, `updatedAt`.
2.  **Criação do Módulo `job-management`:**
    *   Criar a estrutura de diretórios para o módulo em `src/main/modules/job-management` com as camadas `domain`, `application`, `persistence`.
3.  **Implementação do Repositório de Jobs:**
    *   No `persistence` do módulo, implementar um repositório para a entidade `Job` que utilize o Drizzle ORM para interagir com o banco de dados SQLite.
    *   Implementar métodos para `save` (criar/atualizar), `findById`, `findByPersonaId`, `updateStatus`.
4.  **Implementação dos Casos de Uso (Application Layer):**
    *   No `application` do módulo, criar casos de uso (commands e queries) para as operações de Jobs:
        *   `CreateJobCommand`: Para criar um novo Job.
        *   `UpdateJobStatusCommand`: Para atualizar o status de um Job.
        *   `GetJobDetailsQuery`: Para obter detalhes de um Job.
        *   `ListJobsByPersonaQuery`: Para listar Jobs de uma Persona específica.
5.  **Integração com o CQRS Dispatcher:**
    *   Registrar os handlers para os commands e queries do módulo de Jobs no `CqrsDispatcher`.

**Critérios de Verificação:**
*   A entidade `Job` deve ser definida corretamente com todos os atributos necessários.
*   O módulo `job-management` deve ser criado com a estrutura de camadas adequada.
*   O repositório de Jobs deve ser capaz de persistir e recuperar dados de Jobs no banco de dados.
*   Os casos de uso para criação, atualização de status e consulta de Jobs devem funcionar corretamente.
*   Testes unitários e de integração devem cobrir todas as funcionalidades do módulo de Jobs.

**Dependências:**
*   Implementar Módulo de Persistência de Dados (Backend)
*   Implementar Sistema de Filas por Agente (Backend)

---