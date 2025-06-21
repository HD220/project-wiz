# UC-001: Iniciar Nova Tarefa (Job/Activity)

**ID:** UC-001
**Nome:** Iniciar Nova Tarefa (Job/Activity)
**Ator Primário:** Usuário (via Interface Gráfica), Outro Componente do Sistema (programaticamente).
**Resumo:** Este caso de uso descreve como uma nova tarefa (Job/Activity) é criada e enfileirada no sistema para processamento por um Agente.

## Pré-condições
- O sistema está operacional.
- O Ator tem as permissões necessárias para criar tarefas (se aplicável).

## Fluxo Principal (Sucesso)
1. O Ator Primário (Usuário/Sistema) requisita a criação de uma nova tarefa, fornecendo dados como nome, payload (dados de entrada), tipo de atividade (opcional), prioridade (opcional), e dependências de outras Jobs (opcional).
2. A requisição é recebida por um manipulador na camada de Infraestrutura (e.g., Electron IPC Handler).
3. O manipulador invoca o Use Case `CreateJobUseCase` (Camada de Aplicação), passando os dados da tarefa.
4. `CreateJobUseCase` valida os dados de entrada (utilizando schemas de validação).
5. `CreateJobUseCase` constrói uma nova entidade `Job` (Camada de Domínio), inicializando seu ID, status (e.g., `PENDING` ou `WAITING` se houver dependências), `ActivityContext` (com base nos inputs), e outros atributos.
6. `CreateJobUseCase` utiliza a interface `IJobRepository` (Camada de Domínio) para persistir a nova entidade `Job`. A implementação do repositório (Camada de Infraestrutura) salva os dados no banco (e.g., SQLite via Drizzle).
7. `CreateJobUseCase` utiliza a interface `IJobQueue` (Camada de Aplicação) para adicionar a nova `Job` à fila de processamento. A implementação da fila (Camada de Infraestrutura) gerencia a ordem e o estado das Jobs.
8. O sistema confirma ao Ator Primário a criação e o enfileiramento da tarefa, retornando o ID da Job.

## Pós-condições
- Uma nova `Job` (representando uma `Activity`) é criada, persistida no sistema e está na fila (`PENDING` ou `WAITING`).
- Se a `Job` estiver `PENDING`, o `WorkerPool` é notificado para potencial processamento.

## Fluxos Alternativos e Exceções
- **FA-001.1 (Validação Falha):** Se os dados de entrada para a criação da Job forem inválidos (passo 4), `CreateJobUseCase` retorna um erro. O sistema informa o Ator Primário sobre a falha na validação.
- **FA-001.2 (Falha na Persistência):** Se ocorrer um erro ao persistir a Job (passo 6) ou ao adicioná-la à fila (passo 7), o Use Case retorna um erro. O sistema informa o Ator Primário sobre a falha.
