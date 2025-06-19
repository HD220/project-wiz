# Adaptação Conceitual de BullMQ para Sistema de Filas com SQLite no Project Wiz

## Introdução

Este documento resume o entendimento dos principais conceitos e funcionalidades do BullMQ que servirão de inspiração para a reformulação do sistema de filas do Project Wiz, utilizando SQLite como backend de persistência. O objetivo é criar um subsistema de filas robusto, flexível e desacoplado, que possa ser usado tanto pelos Agentes/Personas quanto por outros possíveis componentes futuros do sistema.

## 1. Conceitos Fundamentais a Serem Adaptados

Com base nos exemplos e explicações fornecidas, os seguintes aspectos do BullMQ são cruciais para nossa adaptação:

### 1.1. Instanciação da Fila (`Queue`) e Opções Padrão de Job (`defaultJobOptions`)

*   **BullMQ:** `const queue = new Queue(queueName, { defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 1000 } } });`
*   **Adaptação Project Wiz (SQLite):**
    *   Teremos um `QueueService` (ou similar) que, ao ser instanciado, poderá receber um `queueName` (para simular múltiplas filas, talvez usando este nome como um filtro em uma coluna da tabela de Jobs, ou um prefixo para IDs de Jobs) e também um objeto `defaultJobOptions`.
    *   Essas `defaultJobOptions` (ex: número de tentativas padrão, tipo de backoff e delay base para retentativas) serão usadas ao adicionar novos Jobs, a menos que opções específicas sejam fornecidas para aquele Job.
    *   A "conexão" não será com Redis, mas sim com nosso `JobRepository` que interage com o SQLite.

### 1.2. Adição de Jobs (`queue.add`)

*   **BullMQ:** `await queue.add(jobName, { foo: 'bar' }, { attempts: 5, ... });`
*   **Adaptação Project Wiz (SQLite):**
    *   O `QueueService` terá um método `add(jobName: string, data: any, opts?: JobSpecificOptions): Promise<Job>`.
    *   `jobName`: Um nome/tipo para o Job, que será usado para associá-lo a uma função processadora específica.
    *   `data`: O payload (dados) específico para aquele Job.
    *   `opts`: Opções específicas para este Job que podem sobrescrever as `defaultJobOptions` da fila (ex: número de tentativas, delay inicial, prioridade, configuração de backoff).
    *   Este método criará um novo registro na tabela `jobs` do SQLite com todas essas informações.

### 1.3. Workers e Processadores Assíncronos

*   **BullMQ:** `const worker = new Worker(queueName, async (job: Job) => { /* ... */ return 'resultado'; });`
*   **Adaptação Project Wiz (SQLite):**
    *   O `QueueService` terá um método para registrar uma função processadora para um `jobName` específico: `process(jobName: string, processorFn: (job: JobObject) => Promise<any>, concurrency?: number)`. (A concorrência será 1 inicialmente).
    *   Internamente, o `QueueService` terá um loop (ou um mecanismo de "tick") que periodicamente verifica a tabela `jobs` no SQLite por Jobs elegíveis (status 'waiting' ou 'delayed' com `delayUtil` expirado, que correspondem a um `jobName` com processador registrado).
    *   Quando um Job elegível é encontrado, o `QueueService` o marca como 'active', instancia um objeto `JobObject` (que espelha a API do `job` do BullMQ recebido pelo processador) e invoca a `processorFn` registrada, passando o `JobObject`.

### 1.4. Objeto `Job` no Processador

*   **BullMQ:** O processador recebe um objeto `job` com propriedades (`id`, `name`, `data`, `opts`) e métodos (`updateData`, `updateProgress`, `moveToDelayed`, `moveToWaitingChildren`, `log`, etc.).
*   **Adaptação Project Wiz (SQLite):**
    *   Nossa `processorFn` também receberá um `JobObject` com estrutura similar.
    *   Os métodos deste `JobObject` (ex: `job.updateData(newData)`) não modificarão o estado em memória diretamente de forma isolada, mas sim farão chamadas ao `QueueService` (ou `JobRepository`) para persistir essas mudanças no SQLite (ex: atualizar a coluna `data` do Job no banco). Isso é crucial porque o estado real está no banco de dados.

### 1.5. Processamento em Etapas (Steps) dentro de um Job

*   **BullMQ:** Exemplo com `enum Step` e `await job.updateData({ step: Step.Next });` dentro de um loop `while` no processador.
*   **Adaptação Project Wiz (SQLite):**
    *   Este padrão é diretamente aplicável. O campo `data` do nosso Job no SQLite (que será um JSON) pode armazenar o `step` atual. O `job.updateData()` no nosso `JobObject` atualizará este campo no JSON no banco.

### 1.6. Atrasando um Job Durante o Processamento (`job.moveToDelayed`)

*   **BullMQ:** `await job.moveToDelayed(Date.now() + delayMs, token); throw new DelayedError();`
*   **Adaptação Project Wiz (SQLite):**
    *   Nosso `JobObject` terá um método `async moveToDelayed(delayUntilTimestamp: number, internalToken?: any)`.
    *   Este método instruirá o `QueueService` a atualizar o status do Job no SQLite para 'delayed' e definir o campo `delayUtil` (ou similar) para o `delayUntilTimestamp`.
    *   O processador deverá então lançar um erro especial (ex: `JobDelayedError`) que será capturado pelo loop do `QueueService` que invocou o processador. O `QueueService` então entenderá que não deve tratar isso como uma falha normal (que levaria a retentativas ou a marcar como 'failed'), mas sim apenas confirmar a transição para 'delayed'. O `internalToken` pode ser um mecanismo interno para garantir que apenas o processador ativo possa atrasar o Job.

### 1.7. Esperando por Filhos (`job.moveToWaitingChildren`)

*   **BullMQ:** Adiciona Jobs filhos e depois `await job.moveToWaitingChildren(token); throw new WaitingChildrenError();`. O `moveToWaitingChildren` verifica se os filhos estão completos.
*   **Adaptação Project Wiz (SQLite):**
    *   Precisaremos de uma forma de registrar a relação pai-filho. Embora tenhamos removido `parent_job_id` do schema principal do Job para desacoplamento, um Job que se move para `waiting-children` poderia ter um campo especial em seu `data` ou `opts` para listar os IDs dos Jobs filhos que ele criou e está aguardando.
    *   O `JobObject.moveToWaitingChildren(internalToken)`:
        1.  Consultaria o `JobRepository` para verificar o status de todos os `childJobIds` listados em seus `data`/`opts`.
        2.  Se todos estiverem 'completed', o método retorna `false` (não precisa esperar), e o processador do Job pai continua.
        3.  Se algum filho não estiver 'completed', o `QueueService` atualiza o status do Job pai para 'waiting_children' no SQLite, e o processador lança `JobWaitingChildrenError`.
    *   O loop do `QueueService` precisará ter uma lógica para periodicamente reavaliar Jobs no estado 'waiting_children' para ver se seus filhos foram concluídos.

### 1.8. Ciclo de Vida e Estados do Job (Adaptado)

*   **Estados Principais:** `waiting` (aguardando processamento), `active` (sendo processado), `completed` (sucesso), `failed` (falha após todas as tentativas), `delayed` (atrasado para próxima tentativa ou por `moveToDelayed`), `waiting_children` (aguardando conclusão de Jobs filhos).
*   **Transições:** Serão gerenciadas pelo `QueueService` com base no resultado dos processadores e chamadas aos métodos do `JobObject`.

## 2. O que Simplificar ou Adiar Inicialmente

*   **Múltiplas Queues Nomeadas Explícitas:** Podemos começar com uma "fila padrão" conceitual, onde todos os Jobs são adicionados. O `jobName` dentro do `add()` será usado para rotear para o processador correto. A separação física ou lógica em múltiplas filas pode ser uma otimização futura.
*   **Eventos Ricos:** O sistema de eventos do BullMQ é extenso. Inicialmente, podemos focar em logging detalhado e talvez alguns callbacks simples, adiando um sistema de eventos pub/sub completo.
*   **Locks Avançados e Tokens:** BullMQ usa locks no Redis para gerenciar concorrência. Precisaremos de uma estratégia mais simples para o SQLite, talvez focando em transações e no fato de que o `QueueService` (em um único processo Node.js inicialmente) é quem "despacha" os Jobs, evitando que o mesmo Job seja pego por dois "loops de processamento" simultaneamente através de flags de status (`active`). O `token` mencionado para `moveToDelayed` e `moveToWaitingChildren` seria um ID interno do processamento ativo.
*   **FlowProducer:** A criação de árvores complexas de Jobs de uma vez (Flows) pode ser simplificada para um Job pai podendo adicionar filhos dinamicamente.

## Conclusão do Entendimento

A ideia é pegar a API amigável e os conceitos poderosos de gerenciamento de Jobs do BullMQ e construir um adaptador que os implemente usando SQLite para persistência. O foco será na robustez do ciclo de vida do Job, retentativas, atrasos, e a capacidade de processamento em etapas e espera por filhos.
```
