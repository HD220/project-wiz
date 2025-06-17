# Conceito Chave: Worker

No sistema de Agentes Autônomos e processamento de Jobs, o **Worker** é um componente fundamental responsável por orquestrar a execução das Jobs, que representam as Activities dos Agentes. Pense nele como um "executor" que pega uma tarefa da fila e garante que ela seja processada pelo Agente correto.

O Worker é uma classe ou processo que atua como a ponte entre a **Queue** (Fila) e o **AutonomousAgent** (Agente Autônomo). Ele não contém a lógica de negócio da tarefa em si (isso é responsabilidade da Task e do Agente), mas sim a lógica de coordenação da execução.

**Funcionamento do Worker:**

1.  **Obter a Job:** O Worker se conecta à **Queue** e solicita uma Job que esteja pronta para ser processada (status `pending`). A Queue entrega a Job de maior prioridade disponível para este Worker.
2.  **Invocar o Agente:** O Worker recebe o ID do agente (para saber qual fila escutar) e a função de processamento específica desse Agente. Com a Job em mãos, o Worker invoca essa função do **AutonomousAgent**, passando a Job completa como parâmetro. É o Agente que contém a inteligência para decidir o que fazer com a Job, possivelmente utilizando **Tasks** e **Tools**.
3.  **Notificar a Queue:** Após a execução da função do Agente, o Worker monitora o resultado:
    - Se o Agente retornar um valor (sucesso), o Worker notifica a Queue para marcar a Job como `finished` e registrar o resultado.
    - Se o Agente retornar `undefined` ou `null` (não concluído, mas sem erro), o Worker notifica a Queue para marcar a Job como `delayed`, indicando que ela precisa ser re-agendada para continuar em um ciclo futuro.
    - Se o Agente lançar uma exceção (erro), o Worker captura essa exceção.

**Tratamento de Exceções e Retentativas:**

Um papel crucial do Worker é capturar exceções que possam ser lançadas durante a execução da lógica do Agente ou da Task. Quando uma exceção é capturada, o Worker não tenta resolver o erro diretamente. Em vez disso, ele notifica a **Queue** sobre a falha.

A **Queue** é a responsável por gerenciar a política de retentativa da Job. Ao ser notificada de uma falha pelo Worker, a Queue verifica se a Job ainda tem tentativas restantes (`attempts` < `max_attempts`). Se tiver, a Queue incrementa o contador de tentativas, calcula o próximo tempo de espera (`delay`) usando a política de backoff exponencial configurada na Job, e muda o status da Job para `delayed`. Se a Job já atingiu o número máximo de tentativas, a Queue a marca como `failed`.

Dessa forma, o Worker garante que falhas temporárias não interrompam permanentemente o processamento, delegando a lógica complexa de retentativa e gerenciamento de estado de falha para a Queue.

Em resumo, o Worker é o orquestrador da execução, garantindo que as Jobs sejam retiradas da fila, processadas pelo Agente apropriado e que o resultado (sucesso, necessidade de re-agendamento ou falha) seja comunicado de volta à Queue para o gerenciamento correto do ciclo de vida da Job.
