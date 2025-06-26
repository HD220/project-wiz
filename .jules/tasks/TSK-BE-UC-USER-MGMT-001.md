# Tarefa: BE-UC-USER-MGMT-001 - Implementar User Management UseCases

**ID da Tarefa:** `BE-UC-USER-MGMT-001`
**Título Breve:** Implementar User Management UseCases (CreateUser, GetUser)
**Descrição Completa:**
Implementar os casos de uso para gerenciamento de usuários, localizados em `src_refactored/core/application/use-cases/user/`. Especificamente:
1.  `CreateUserUseCase`: Para criar um novo usuário. Deve incluir validação de entrada (ex: nome, email) via Zod, criação da entidade `User`, e persistência via `IUserRepository`.
2.  `GetUserUseCase`: Para buscar detalhes de um usuário (provavelmente por ID ou email). Deve interagir com `IUserRepository`.

Ambos os use cases devem tratar erros de forma robusta e retornar objetos `Result`.

---

**Status:** `Pendente`
**Dependências (IDs):** (Assumindo que as entidades de domínio do Usuário (`UserEntity`, `UserId`, `UserName`, `UserEmail`, etc.) e a interface `IUserRepository` estão definidas ou serão refinadas. A implementação concreta do repositório e a configuração do banco de dados são dependências externas.)
**Complexidade (1-5):** `3` (Dois use cases, lógica de aplicação, validação, interação com repositório)
**Prioridade (P0-P4):** `P1` (Fundamental para desbloquear `FE-IPC-ONBOARD` e funcionalidades de usuário)
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/be-uc-user-management`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
**Para `CreateUserUseCase`:**
- Arquivo `create-user.use-case.ts` (e `create-user.schema.ts`) criado em `src_refactored/core/application/use-cases/user/`.
- Implementa `IUseCase` (ou similar).
- Valida entrada com Zod schema.
- Cria `UserEntity`.
- Persiste via `IUserRepository`.
- Retorna `Result.ok<UserEntity>(user)` ou `Result.fail<DomainError>(error)`.
- Testes unitários (quando aplicável).

**Para `GetUserUseCase`:**
- Arquivo `get-user.use-case.ts` (e `get-user.schema.ts`) criado.
- Implementa `IUseCase` (ou similar).
- Valida entrada (ex: ID do usuário).
- Busca usuário via `IUserRepository`.
- Retorna `Result.ok<UserEntity | null>(user)` ou `Result.fail<DomainError>(error)`. (Retornar `null` ou um `NotFoundError` específico).
- Testes unitários (quando aplicável).

---

## Notas/Decisões de Design
- Os use cases devem ser agnósticos à implementação concreta do repositório.
- A geração de IDs e a lógica de hash de senha (para `CreateUserUseCase`) devem ser tratadas pela entidade `UserEntity` ou por serviços de domínio, conforme o padrão.
- Considerar erros de domínio como `UserAlreadyExistsError`, `UserNotFoundError`, `InvalidEmailError`.

---

## Comentários
- Esta tarefa foi criada para suprir a falta dos use cases de usuário, necessários para `FE-IPC-ONBOARD`.
- Pode ser dividida em duas tarefas separadas se a implementação de cada use case for extensa.

---

## Histórico de Modificações da Tarefa (Opcional)
- `(Data Atual)`: Tarefa criada.

[end of .jules/tasks/TSK-BE-UC-USER-MGMT-001.md]
