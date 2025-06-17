# Sub-sub-tarefa: Definir métodos da interface de domínio JobRepository

## Descrição:

Definir os métodos essenciais na interface de domínio `JobRepository` que representam as operações de persistência para a entidade `Job`/`Activity`.

## Contexto:

A interface `JobRepository` define o contrato que qualquer implementação de repositório de Job deve seguir. É necessário especificar os métodos que a camada de Aplicação usará para persistir e recuperar Jobs/Activities, como salvar, buscar por ID, atualizar, etc., utilizando as entidades e Value Objects de domínio apropriados. Esta sub-sub-tarefa depende da sub-sub-tarefa 02.08.01.

## Specific Instructions:

1.  No arquivo `src/core/domain/ports/job-repository.interface.ts` (criado na sub-sub-tarefa anterior), defina a interface `JobRepository`.
2.  Adicione as assinaturas dos métodos essenciais para gerenciar entidades `Job`/`Activity`:
    *   `save(job: Job): Promise<void>`
    *   `findById(jobId: JobId): Promise<Job | null>`
    *   `update(job: Job): Promise<void>`
    *   *(Outros métodos conforme necessário para consultas pela Queue)*
3.  Utilize as entidades e Value Objects definidos anteriormente (ex: `Job`, `JobId`) nas assinaturas dos métodos.
4.  Garanta que a interface defina apenas as operações de persistência de alto nível, sem detalhes de implementação de banco de dados.

## Expected Deliverable:

O arquivo `src/core/domain/ports/job-repository.interface.ts` com a interface `JobRepository` definida e contendo as assinaturas dos métodos essenciais para a persistência de Jobs/Activities.