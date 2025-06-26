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

**Status:** `Pendente`
**Dependências (IDs):** (Assumindo que as entidades de domínio do Projeto (`ProjectEntity`, `ProjectId`, `ProjectName`, `ProjectDescription`) e a interface `IProjectRepository` estão definidas ou serão refinadas como parte desta tarefa. A implementação concreta do repositório e a configuração do banco de dados são dependências externas, mas o use case deve depender apenas da interface.)
**Complexidade (1-5):** `3` (Envolve lógica de aplicação, validação, interação com repositório, modelagem de entidade)
**Prioridade (P0-P4):** `P1` (Fundamental para desbloquear `FE-IPC-PROJ-CREATE` e funcionalidades de criação de projeto)
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/be-uc-create-project`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Arquivo `create-project.use-case.ts` criado em `src_refactored/core/application/use-cases/project/`.
- O use case implementa a interface `IUseCase` (ou similar, conforme padrão do projeto).
- Utiliza o schema Zod `CreateProjectInputSchema` (de `create-project.schema.ts`) para validar os dados de entrada.
- Cria uma instância de `ProjectEntity` com os dados validados.
- Chama o método `save` (ou `create`) do `IProjectRepository` injetado.
- Retorna `Result.ok<ProjectEntity>(project)` em caso de sucesso.
- Retorna `Result.fail<DomainError>(error)` em caso de falha (ex: falha na validação, erro do repositório).
- Testes unitários para o use case são criados, cobrindo cenários de sucesso e falha (embora a execução de testes esteja atualmente suspensa por diretiva do usuário).

---

## Notas/Decisões de Design
- O use case deve ser agnóstico à implementação concreta do repositório (Drizzle, etc.), dependendo apenas da interface `IProjectRepository`.
- A geração de IDs para o novo projeto deve ser tratada pela entidade `ProjectEntity` ou pelo repositório, conforme o padrão do domínio.
- Considerar quais erros específicos do domínio podem surgir (ex: `ProjectNameTooShortError`, `ProjectCreationError`).

---

## Comentários
- Esta tarefa foi criada para suprir a falta do `CreateProjectUseCase`, necessário para a funcionalidade de IPC `FE-IPC-PROJ-CREATE`.

---

## Histórico de Modificações da Tarefa (Opcional)
- `(Data Atual)`: Tarefa criada.

[end of .jules/tasks/TSK-BE-UC-PROJ-CREATE-001.md]
