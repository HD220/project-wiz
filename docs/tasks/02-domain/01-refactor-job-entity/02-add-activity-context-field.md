# Sub-sub-tarefa: Adicionar/Refatorar campo para ActivityContext na entidade Job

## Descrição:

Adicionar um novo campo à entidade de domínio `Job` ou refatorar um campo existente (como `data`) para armazenar o `ActivityContext`.

## Contexto:

A entidade `Job` precisa ser capaz de persistir o contexto específico de uma atividade do agente. Este contexto será armazenado em um campo dedicado ou no campo `data` existente, que deve ser capaz de conter um objeto complexo (JSON). Esta sub-sub-tarefa depende da sub-sub-tarefa 02.01.01 (abrir o arquivo).

## Specific Instructions:

1.  No arquivo `src/core/domain/entities/job/job.entity.ts` (aberto na sub-sub-tarefa anterior), adicione um novo campo privado `readonly` para o `ActivityContext`.
2.  Considere usar o campo `data` existente se ele for adequado para armazenar JSON, refatorando seu tipo se necessário.
3.  Defina o tipo do campo para ser capaz de armazenar um objeto complexo. Inicialmente, `any` ou `unknown` podem ser usados, ou uma interface básica `ActivityContext` definida na camada de domínio.
4.  Se estiver usando um novo campo, certifique-se de que ele seja inicializado no construtor da entidade `Job`, mesmo que como um objeto vazio ou um valor padrão apropriado.
5.  Evite adicionar lógica de persistência ou infraestrutura neste arquivo.

## Expected Deliverable:

O arquivo `src/core/domain/entities/job/job.entity.ts` modificado com um novo campo (ou campo existente refatorado) para armazenar o `ActivityContext`, com o tipo apropriado e inicialização no construtor.