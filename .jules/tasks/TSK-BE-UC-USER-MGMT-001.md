# Tarefa: BE-UC-USER-MGMT-001 - Implementar User Management UseCases

**ID da Tarefa:** `BE-UC-USER-MGMT-001`
**Título Breve:** Implementar User Management UseCases (CreateUser, GetUser)
**Descrição Completa:**
Implementar os casos de uso para gerenciamento de usuários, localizados em `src_refactored/core/application/use-cases/user/`. Especificamente:
1.  `CreateUserUseCase`: Para criar um novo usuário. Deve incluir validação de entrada (ex: nome, email) via Zod, criação da entidade `User`, e persistência via `IUserRepository`.
2.  `GetUserUseCase`: Para buscar detalhes de um usuário (provavelmente por ID ou email). Deve interagir com `IUserRepository`.

Ambos os use cases devem tratar erros de forma robusta e retornar objetos `Result`.

---

**Status:** `Em Andamento`
**Dependências (IDs):** (Core User Domain: `UserEntity`, VOs, `IUserRepository` são assumidos como existentes. Schemas Zod criados como parte desta tarefa.)
**Complexidade (1-5):** `3`
**Prioridade (P0-P4):** `P1`
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/be-uc-user-management`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
**Para `CreateUserUseCase`:**
- Arquivo `create-user.use-case.ts` e `create-user.schema.ts` criados e implementados. **(Concluído)**
- Implementa `IUseCase<CreateUserInput, Promise<Result<CreateUserOutput, DomainError>>>`. **(Concluído)**
- Valida entrada com `CreateUserInputSchema`. **(Concluído)**
- Cria `UserEntity` (com VOs e novo `UserId`). **(Concluído)**
- Persiste via `IUserRepository.add()`. **(Concluído)**
- Retorna `Result.ok<CreateUserOutput>` ou `Result.fail<DomainError>`. **(Concluído)**
- Testes unitários. *(Adiado)*

**Para `GetUserUseCase`:**
- Arquivo `get-user.use-case.ts` e `get-user.schema.ts` criados e implementados. **(Concluído)**
- Implementa `IUseCase<GetUserInput, Promise<Result<GetUserOutput | null, DomainError>>>`. **(Concluído)**
- Valida entrada com `GetUserInputSchema` (permite busca por ID ou email). **(Concluído)**
- Busca usuário via `IUserRepository` (`findById` ou `findByEmail`). **(Concluído)**
- Retorna `Result.ok<GetUserOutput>` se encontrado, `Result.fail(new NotFoundError())` se não encontrado. **(Concluído)**
- Testes unitários. *(Adiado)*

---

## Notas/Decisões de Design
- Ambos os use cases dependem de `IUserRepository` e `ILoggerService` via DI.
- `CreateUserUseCase` inclui verificações de existência de usuário por username/email antes da criação.
- A questão do hashing de senha para `CreateUserUseCase` é notada; a `UserEntity` atual não lida com senhas. O use case passa a senha como está, assumindo que o repositório ou um serviço futuro lidará com o hashing, ou que a entidade será atualizada.
- `GetUserUseCase` retorna um `NotFoundError` específico quando o usuário não é encontrado.

---

## Comentários
- Esta tarefa foi criada para suprir a falta dos use cases de usuário, necessários para `FE-IPC-ONBOARD`.
- `(Data Atual)`: Implementação de `CreateUserUseCase` e `GetUserUseCase` concluída.

---

## Histórico de Modificações da Tarefa (Opcional)
- `(Data Anterior)`: Tarefa criada.
- `(Data Atual)`: Status alterado para "Em Andamento". Schemas e use cases implementados.

[end of .jules/tasks/TSK-BE-UC-USER-MGMT-001.md]
