# Conceito Chave: Queue

A **Queue** (Fila) é um componente fundamental no sistema de Agentes Autônomos e Processamento de Jobs. Ela atua como o **componente central responsável pelo gerenciamento do ciclo de vida das Jobs/Activities**. Pense nela como o maestro que orquestra a execução de todas as tarefas assíncronas no sistema.

A Queue é onde as Jobs (que representam as Activities dos Agentes) são armazenadas, organizadas e controladas desde o momento em que são criadas até a sua conclusão ou falha.

## Principais Responsabilidades da Queue

A Queue possui um conjunto claro de responsabilidades para garantir o fluxo correto e confiável das Jobs/Activities:

1.  **Persistir o Estado das Activities:** A Queue é responsável por salvar e recuperar o estado atual de cada Job/Activity no banco de dados (inicialmente SQLite). Isso garante que o progresso e o contexto das tarefas não sejam perdidos, mesmo em caso de reinício do sistema.
2.  **Controlar Transições de Status:** A Queue gerencia as mudanças de status das Jobs/Activities. Ela é a **única** entidade no sistema com permissão para alterar o status persistido de uma Job/Activity. As transições incluem:
    - `pending`: Pronta para ser executada.
    - `waiting`: Aguardando a conclusão de outras Jobs/Activities das quais depende (`depends_on`).
    - `delayed`: Postergada por um período de tempo (seja por um atraso inicial ou após uma retentativa).
    - `executing`: Atualmente sendo processada por um Worker.
    - `finished`: Concluída com sucesso.
    - `failed`: Falhou após esgotar as tentativas de retentativa.
3.  **Gerenciar Retentativas e Atrasos:** Em caso de falha temporária ou necessidade de re-agendamento, a Queue controla o número de tentativas realizadas (`attempts`), calcula o tempo de espera para a próxima retentativa (`retry_delay`) utilizando uma política de backoff exponencial (geralmente `((attempts+1) ** 2) * retry_delay`), e define o atraso (`delay`) antes que a Job/Activity retorne ao status `pending`.
4.  **Gerenciar Dependências (`depends_on`):** A Queue verifica as dependências de uma Job/Activity ao ser criada ou quando uma de suas dependências é concluída. Se uma Job/Activity possui dependências não finalizadas, a Queue a coloca no status `waiting`. Ela monitora a conclusão das dependências e move a Job/Activity para `pending` quando todas as suas dependências estiverem no status `finished`. Opcionalmente, a Queue pode injetar os resultados das dependências na Job/Activity dependente.

## Interação com Outros Componentes

A Queue interage principalmente com o **WorkerPool** e os **Workers**:

- **Com o WorkerPool:** A Queue notifica o WorkerPool quando novas Jobs/Activities estão disponíveis para processamento (ou seja, no status `pending`). Isso permite que o WorkerPool aloque Workers para pegar essas tarefas.
- **Com os Workers:** Os Workers solicitam Jobs/Activities da Queue para executar. Após o processamento (seja sucesso, necessidade de re-agendamento ou falha), o Worker notifica a Queue sobre o desfecho. A Queue, então, atualiza o status da Job/Activity e gerencia retentativas ou dependências conforme necessário.

Em resumo, a Queue é o coração do sistema de processamento assíncrono, garantindo que as Jobs/Activities sejam gerenciadas de forma persistente, confiável e seguindo as regras de status, retentativas e dependências. Sua responsabilidade exclusiva na atualização do estado persistido é crucial para a integridade do sistema.
