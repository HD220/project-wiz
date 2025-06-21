# Sub-tarefa: Refatorar JobDrizzleRepository

## Descrição:

Refatorar a classe `JobDrizzleRepository` para implementar a interface `JobRepository.interface.ts` e lidar com a serialização/desserialização do `ActivityContext`.

## Contexto:

O `JobDrizzleRepository` é a implementação concreta do repositório de Jobs para o Drizzle ORM. Ele precisa garantir que as operações de persistência e recuperação de Jobs estejam em conformidade com a interface definida na camada de Domínio/Aplicação e que o `ActivityContext` seja corretamente serializado ao salvar e desserializado ao carregar Jobs.

## Specific Instructions:

1. Abra o arquivo `src/infrastructure/repositories/job-drizzle.repository.ts`.
2. Modifique a classe `JobDrizzleRepository` para implementar a interface `JobRepository.interface.ts`.
3. Ajuste os métodos existentes (ex: `save`, `findById`, `find`, etc.) para garantir que eles lidem corretamente com a serialização do `ActivityContext` ao salvar Jobs no banco de dados.
4. Ajuste os métodos de recuperação de Jobs para garantir que eles desserializem o `ActivityContext` do campo `data` e o reconstruam como um Value Object `ActivityContext`.
5. Garanta que o mapeamento entre a entidade de domínio `Job` e o objeto do schema Drizzle seja tratado dentro deste repositório.
6. Adicione comentários JSDoc para explicar a lógica de serialização/desserialização e o mapeamento.
7. Não crie testes nesta fase.

## Expected Deliverable:

Arquivo `src/infrastructure/repositories/job-drizzle.repository.ts` refatorado, implementando `JobRepository.interface.ts` e lidando corretamente com a serialização/desserialização do `ActivityContext`.