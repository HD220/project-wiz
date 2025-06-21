# Sub-sub-tarefa: Criar arquivo da interface de domínio JobQueue

## Descrição:

Criar o arquivo de código-fonte para a interface de domínio `JobQueue`, que definirá o contrato para o gerenciamento de Jobs/Activities pela fila.

## Contexto:

A interface `JobQueue` é um Port de saída na camada de domínio, essencial para garantir que a lógica da aplicação que interage com a fila seja independente da implementação concreta. Esta sub-sub-tarefa cria o arquivo onde esta interface será definida.

## Specific Instructions:

1.  Crie um novo arquivo para a interface da Queue na camada de domínio/ports. O caminho recomendado é `src/core/domain/ports/job-queue.interface.ts`.
2.  Abra este arquivo no editor de código.

## Expected Deliverable:

O arquivo `src/core/domain/ports/job-queue.interface.ts` criado e aberto no editor de código, pronto para a definição da interface.