## Documentação da Arquitetura: Sistema de Jobs e Workers

### 1. Visão Geral

Este documento descreve a arquitetura do nosso sistema de processamento assíncrono, focado na execução de unidades de trabalho chamadas **Jobs** por **Workers (Agentes)**, gerenciadas por uma **Queue (Queue)** com persistência em SQLite.

---

### 2. Conceitos Fundamentais

* **Job**: A representação persistida de uma unidade de trabalho no sistema. É um registro de dados que descreve "o que" precisa ser feito. Uma Job é gerenciada exclusivamente pela Queue.
* **Task**: É a lógica de execução em memória para um tipo específico de trabalho. A Task sabe "como" interagir com serviços externos para realizar a parte computacional de uma Job. A Task não se preocupa com persistência ou status de Queue.
* **Queue (Queue)**: O componente central responsável pelo gerenciamento do ciclo de vida das Jobs. Ela persiste o estado das Jobs, controla as transições de status, gerencia retentativas, atrasos e dependências. Sua persistência inicial é em SQLite.
* **Worker**: Uma classe que recebe a Queue a ser escutada (identificada pelo ID do agente) e a função de processamento que será executada. O Worker é responsável por orquestrar a execução e notificar a Queue sobre o desfecho da Job.
* **Agente**: Contém a lógica específica de como executar uma determinada Task. A função de processamento passada para o Worker é um método da classe do Agente.

---

### 3. Entidade Job

A entidade `Job` armazena todas as informações necessárias para o gerenciamento de uma unidade de trabalho pela Queue.

* `id`: Identificador único da Job.
* `name`: Nome da Job.
* `payload`: Payload de entrada da Job, não pode ser alterado internamente durante a execução da Job.
* `data`: Informações que podem ser salvas dentro da execução da Job.
* `result`: Resultado da execução da Job.
* `max_attempts`: Quantidade máxima de tentativas.
* `attempts`: Quantidade de tentativas realizadas.
* `max_retry_delay`: Tempo máximo de espera entre as retentativas.
* `retry_delay`: Tempo de espera entre as retentativas: `((attempts+1) ** 2) * retry_delay`.
* `delay`: Tempo de espera/atraso quando entra no status `delayed`.
* `priority`: Valor de prioridade. **Menor número significa MAIOR prioridade.**
* `status`:
    * `waiting`: Esperando ser executada ou pelas filhas serem concluidas.
    * `delayed`: Postergado por delay (pode ser por conta de um retry ou por já ter sido inserida com delay de início).
    * `success`: Quando foi concluída sem erro de execução.
    * `failed`: Quando foi concluída com erro de execução.
    * `executing`: Durante o processamento da Job.
* `depends_on`: Lista de `jobIds` da qual essa Job depende para poder ser executada. A Job receberá a saída dessas Jobs como parte do seu `payload` (em `job.data`).

#### Transição de Status da Job

```mermaid
graph TD
    B[new]
    C[executing]
    D[finished]
    E[delayed]
    F[waiting]
    G[success]

    B --> F
    F --> C
    C --> E
    C --> G
    C --> D
    C --> F
    E --> F
```


* **`waiting` -> `executing`**: Worker pegou a Job para processar.
* **`executing` -> `success`**: Job concluída com sucesso.
* **`executing` -> `delayed`**: Quando ocorre um erro mas não extrapolou numero de retentativas.
* **`executing` -> `failed`**: Ocorreu um erro durante a execução da Job (Agente lançou uma exceção).
* **`delayed` -> `waiting`**: Após o delay (que pode ser 0), a Job está pronta para ser re-executada.
* **Jobs com `depends_on`**: Fica em `waiting` se suas dependências não estiverem `finished`.

---

### 4. Componentes e Fluxo de Interação

#### 4.1. Queue (`Queue`)

* **Responsabilidade Principal**: Gerenciamento de estado e ciclo de vida das **Jobs**.
* **Persistência**: As Jobs são persistidas em SQLite.
* **Funções**: A Queue é a **única** responsável por atualizar o `status` de uma Job, incrementar `attempts`, gerenciar `delay`, `depends_on`, e `result`. Ela recebe notificações do Worker sobre o desfecho da execução.

#### 4.2. Worker

* **Responsabilidade Principal**: Orquestrar a execução das Jobs.
* **Funcionamento**:
    1.  Recebe o ID do agente para saber qual Queue escutar.
    2.  Recebe a função de processamento (um método da classe Agente) que será executada.
    3.  Internamente, o Worker pega a **Job** da Queue.
    4.  Chama a função de processamento do Agente, passando a Job.
    5.  **Captura exceções (`throw new Error`)** lançadas pela função de processamento.
    6.  **Com base no sucesso ou no erro capturado**, o Worker notifica a Queue para que esta faça a alteração necessária nos status da Job.

#### 4.3. Agente

* **Responsabilidade Principal**: Executar a lógica da **Task**.
* **Funcionamento**:
    1.  Recebe uma **Job** do Worker.
    2.  Instancia a classe **Task** apropriada (que sabe interagir com a LLM), usando os dados da Job e as **Tools** do Agente.
    3.  Executa a `taskInstance`. O Agente não sabe sobre a Queue ou o status da Job.

#### **Regras de Retorno do Agente (para o Worker):**

* **Retorno de Sucesso (retorna um valor):**
    * **Significado**: A Task concluiu seu trabalho para esta Job.
    * **Ação do Worker**: Notifica a Queue sobre o sucesso e o resultado. A Queue marca a **Job como `finished`**.
* **Retorno Vazio (`return;` ou `return undefined/null`):**
    * **Significado**: A Task não concluiu, mas não houve um erro. Precisa de mais passos e deve ser re-agendada.
    * **Ação do Worker**: Notifica a Queue sobre a necessidade de continuação. A Queue coloca a **Job em `delayed`** (e depois `pending` se o delay for 0).
* **Lançamento de Erro (`throw new Error`):**
    * **Significado**: Ocorreu uma falha na execução da Task.
    * **Ação do Worker**: Captura a exceção e notifica a Queue sobre a falha. A Queue lida com o **`retry`** ou marca a Job como `failed` (se `max_attempts` atingido).

#### 4.4. Task

* **Responsabilidade Principal**: Encapsular a lógica de interação com LLMs e o uso de **Tools**.
* **Funcionamento**:
    * Recebe os dados da Job e as **Tools** injetadas pelo Agente.
    * Realiza chamadas à LLM usando o `ai-sdk`.
    * A LLM usa **Tools** fornecidas.
    * O retorno da Task (ou a ausência dele) e o lançamento de erros seguem as regras definidas para o Agente.

---

### 5. Interação com LLMs e Tools

* As chamadas para LLMs são feitas usando o `ai-sdk`, fornecendo **Tools** para serem executadas.
* Uma "step" da Job pode ter várias chamadas à LLM. Uma step finaliza quando a LLM usa a Tool `finalAnswer`.
* A Tool `finalAnswer` possui os parâmetros `answer` e `taskFinished` (booleano).
* As **Tools** são de dois tipos: **Tools do Agente** (genéricas) e **Tools da Task/Job** (específicas). O `tipo da task` no `payload` da Job influencia como o prompt é criado e quais **Tools** (além das do Agente) estão disponíveis. A classe **Task** cuida de quais **Tools** estarão disponíveis.

---

### 6. Diagrama de Sequência do Fluxo de Jobs

```mermaid
sequenceDiagram
    participant Client
    participant Queue
    participant WorkerPool
    participant JobProcessor
    
    Client->>Queue: Add Job
    Queue->>WorkerPool: Job Available
    WorkerPool->>JobProcessor: Assign Worker
    JobProcessor->>WorkerPool: Process Job
    WorkerPool->>Queue: Job Completed/Failed
    Queue->>Client: Notify Status
```

---

### 7. Exemplo Completo de Fluxo com Retentativa

1. Job é adicionado à Queue com prioridade média
2. Worker disponível pega o job
3. Processamento falha (timeout)
4. Sistema aplica backoff exponencial (1s, 2s, 4s...)
5. Após 3 tentativas, job é marcado como falha permanente
6. Notificação é enviada ao cliente

---

### 8. Decisões de Design Importantes

- **Backoff exponencial configurável**: Permite ajustar a estratégia de retentativa conforme o tipo de job
- **Prioridade dinâmica**: Jobs podem ter sua prioridade ajustada baseada em tipo e contexto
- **Isolamento de falhas**: Cada worker opera de forma independente, prevenindo contaminação cruzada
- **Monitoramento em tempo real**: Sistema fornece métricas e status atualizados da Queue

---

### 9. Considerações de Escalabilidade

- **Particionamento horizontal**: A Queue pode ser dividida em múltiplas instâncias para distribuir carga
- **Balanceamento de carga**: Workers são distribuídos dinamicamente conforme capacidade
- **Limites de taxa (rate limiting)**: Controle de throughput para evitar sobrecarga
- **Escalabilidade vertical**: Workers podem ser configurados com diferentes capacidades