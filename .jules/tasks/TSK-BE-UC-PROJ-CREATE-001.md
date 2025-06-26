# Tarefa: BE-UC-PROJ-CREATE-001 - Implementar CreateProjectUseCase

**ID da Tarefa:** `BE-UC-PROJ-CREATE-001`
**Título Breve:** Implementar CreateProjectUseCase
**Descrição Completa:**
Implementar o caso de uso para criar novos projetos, localizado em `src_refactored/core/application/use-cases/project/create-project.use-case.ts`. Esta implementação deve incluir:
- Validação da entrada de dados (nome do projeto, descrição, etc.) utilizando um schema Zod (provavelmente `create-project.schema.ts`).
- Criação de uma nova entidade `Project` com os dados validados.
- Interação com a interface `IProjectRepository` para persistir a nova entidade `Project`.
- Tratamento de erros robusto, retornando um objeto `Result` que indique sucesso (com a entidade `Project` criada) ou falha (com um erro de domínio apropriado).

---

**Status:** `Em Andamento`
**Dependências (IDs):** (Core Project Domain: `ProjectEntity`, `ProjectId`, `ProjectName`, `ProjectDescription`, `IProjectRepository` são assumidos como existentes e funcionais. Schema Zod `create-project.schema.ts` também é necessário.)
**Complexidade (1-5):** `3`
**Prioridade (P0-P4):** `P1`
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/be-uc-create-project`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Arquivo `create-project.use-case.ts` criado e implementado em `src_refactored/core/application/use-cases/project/`. **(Concluído)**
- O use case implementa a interface `IUseCase<CreateProjectInput, Promise<Result<CreateProjectOutput, DomainError>>>`. **(Concluído)**
- Utiliza o schema Zod `CreateProjectInputSchema` de `create-project.schema.ts` para validar os dados de entrada. **(Concluído)**
- Cria uma instância de `ProjectEntity` com os dados validados, incluindo um novo `ProjectId`. **(Concluído)**
- Chama o método `save` do `IProjectRepository` injetado. **(Concluído)**
- Retorna `Result.ok<CreateProjectOutput>(output)` em caso de sucesso, onde `output` contém os dados do projeto criado (id, name, description, timestamps). **(Concluído)**
- Retorna `Result.fail<DomainError>(error)` em caso de falha (validação, criação de VO/Entidade, erro do repositório). **(Concluído)**
- Testes unitários para o use case são criados (embora a execução de testes esteja atualmente suspensa). *(Adiado devido à diretiva de não rodar testes)*

---

## Notas/Decisões de Design
- O use case depende de `IProjectRepository` e `ILoggerService` via injeção de dependência (InversifyJS).
- A geração de `ProjectId` é feita usando `ProjectId.create()`.
- `ProjectDescription` é opcional.
- Erros de validação de VOs (como `ProjectName`) são propagados.
- Erros inesperados são encapsulados em `ApplicationError`.

---

## Comentários
- Esta tarefa foi criada para suprir a falta do `CreateProjectUseCase`, necessário para a funcionalidade de IPC `FE-IPC-PROJ-CREATE`.
- `(Data Atual)`: Implementação do `CreateProjectUseCase` concluída e revisada. Pronto para submissão.

---

## Histórico de Modificações da Tarefa (Opcional)
- `(Data Anterior)`: Tarefa criada e status alterado para "Em Andamento".
- `(Data Atual)`: Lógica do use case implementada e revisada.

[end of .jules/tasks/TSK-BE-UC-PROJ-CREATE-001.md]
