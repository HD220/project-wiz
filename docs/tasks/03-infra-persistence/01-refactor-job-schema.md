# Sub-tarefa: Refatorar schema Drizzle de Jobs para incluir ActivityContext

## Descrição:

Modificar o schema Drizzle existente para a tabela de Jobs (`jobs`) para incluir um campo capaz de armazenar o `ActivityContext`.

## Contexto:

O `ActivityContext` contém informações cruciais sobre o estado atual da atividade do agente. Para persistir essa informação junto com a Job, precisamos garantir que o schema do banco de dados tenha um campo apropriado. O campo `data` existente na tabela `jobs` parece ser o local mais adequado para armazenar o `ActivityContext`, provavelmente serializado como JSON.

## Specific Instructions:

1. Abra o arquivo do schema Drizzle para Jobs (`src/infrastructure/services/drizzle/schemas/jobs.ts`).
2. Localize a definição da tabela `jobs`.
3. Verifique se o campo `data` existe e se seu tipo é adequado para armazenar dados JSON (ex: `jsonb` ou `text` dependendo do dialeto SQLite usado pelo Drizzle). Se necessário, ajuste o tipo do campo `data`.
4. Adicione um comentário no schema indicando que o campo `data` é usado para armazenar o `ActivityContext` serializado.
5. Não crie testes nesta fase.

## Expected Deliverable:

Arquivo `src/infrastructure/services/drizzle/schemas/jobs.ts` modificado com o campo `data` configurado corretamente para armazenar o `ActivityContext` serializado.