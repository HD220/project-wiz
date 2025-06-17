# Conceito Chave: Task

No sistema de Agentes Autômatos, uma **Task** representa a lógica de execução em memória para um tipo específico de trabalho. Ela encapsula uma ação acionável que ocorre dentro do contexto de uma Job e, por extensão, de uma Activity.

A Task é a unidade fundamental de trabalho que interage diretamente com Large Language Models (LLMs) e Tools para realizar sua função. É importante notar que a Task opera em memória e não possui preocupações com persistência de estado ou gerenciamento de filas. Sua responsabilidade primária é executar a lógica de negócio para a qual foi projetada.

Cada Task recebe os dados necessários para sua execução diretamente da Job que a originou. Isso inclui o `ActivityContext`, que fornece o histórico e o estado atual da atividade, e as Tools relevantes que são injetadas pelo Agente responsável por orquestrar a execução da Task.

Após a execução, a Task pode retornar de três formas principais, que influenciam o comportamento do Worker e da Queue:

1.  **Retorno de Sucesso:** A Task concluiu sua execução com êxito. O Worker pode então processar a próxima Task ou finalizar a Job, dependendo da lógica de orquestração do Agente.
2.  **Retorno Vazio (ou indicando re-agendamento):** A Task indica que precisa ser re-executada posteriormente. Isso geralmente ocorre em cenários onde a Task precisa esperar por uma condição externa ou realizar um processamento assíncrono. O Worker, ao receber este retorno, pode colocar a Job de volta na Queue para ser processada novamente mais tarde.
3.  **Lançamento de Erro:** A Task encontrou um problema que impede sua conclusão. O Worker captura este erro e o trata de acordo com a política de retentativa da Job. Se a política permitir, a Job pode ser re-agendada na Queue para uma nova tentativa. Caso contrário, a Job pode ser marcada como falha.

Compreender o papel da Task é crucial para entender como os Agentes Autômatos executam suas atividades, delegando a lógica de trabalho específica a essas unidades de execução em memória.
