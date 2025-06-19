# Adaptação Conceitual de BullMQ para Sistema de Filas com SQLite no Project Wiz

## Introdução

Este documento resume o entendimento dos principais conceitos e funcionalidades do BullMQ que servirão de inspiração para a reformulação do sistema de filas do Project Wiz, utilizando SQLite como backend de persistência. O objetivo é criar um subsistema de filas robusto, flexível e desacoplado, que possa ser usado tanto pelos Agentes/Personas quanto por outros possíveis componentes futuros do sistema, suportando múltiplas filas nomeadas.

## 1. Conceitos Fundamentais a Serem Adaptados

Com base nos exemplos e explicações fornecidas, os seguintes aspectos do BullMQ são cruciais para nossa adaptação:

### 1.1. Instanciação da Fila (`Queue`) e Opções Padrão de Job (`defaultJobOptions`)

*   **BullMQ:** `const queue = new Queue(queueName, { defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 1000 } } });`
*   **Adaptação Project Wiz (SQLite):**
    *   Teremos um `QueueService` que opera sobre um `queueName` específico. A instanciação ou os métodos para adicionar e processar `Jobs` sempre levarão em conta o `queueName`.
    *   As `defaultJobOptions` (ex: número de tentativas padrão, tipo de backoff e delay base para retentativas) podem ser associadas a um `queueName` específico (talvez através de uma configuração inicial carregada pelo `QueueService` ou uma entidade `QueueDefinition` que armazena essas configurações). Estas serão usadas ao adicionar novos `Jobs` a uma determinada fila, a menos que opções específicas sejam fornecidas para aquele `Job`.
    *   A "conexão" não será com Redis, mas sim com nosso `JobRepository` que interage com o SQLite, onde os `Jobs` de todas as filas podem residir, mas serão distinguidos pela coluna `queue_name`.

### 1.2. Adição de Jobs (`queue.add`)

*   **BullMQ:** `await queue.add(jobName, { foo: 'bar' }, { attempts: 5, ... });`
*   **Adaptação Project Wiz (SQLite):**
    *   O `QueueService` terá um método como `add(queueName: string, jobName: string, data: any, opts?: JobSpecificOptions): Promise<Job>`.
    *   `queueName`: O nome da fila específica à qual este `Job` pertence. Será armazenado em uma coluna no `Job`.
    *   `jobName`: Um nome/tipo para o `Job` (dentro daquela fila), que será usado para associá-lo a uma função processadora específica.
    *   `data`: O payload (dados) específico para aquele `Job`.
    *   `opts`: Opções específicas para este `Job` que podem sobrescrever as `defaultJobOptions` da fila (ex: número de tentativas, delay inicial, prioridade, configuração de backoff).
    *   Este método criará um novo registro na tabela `jobs` do SQLite, incluindo o `queueName`.

### 1.3. Workers e Processadores Assíncronos

*   **BullMQ:** `const worker = new Worker(queueName, async (job: Job) => { /* ... */ return 'resultado'; });`
*   **Adaptação Project Wiz (SQLite):**
    *   O `QueueService` terá um método para registrar uma função processadora para um `jobName` específico *dentro de uma `queueName` específica*: `process(queueName: string, jobName: string, processorFn: (job: JobObject) => Promise<any>, concurrency?: number)`. (A concorrência será 1 inicialmente por Worker/Agente).
    *   Internamente, o `QueueService` (ou cada Agente que atua como Worker para uma `queueName`) terá um loop (ou um mecanismo de "tick") que periodicamente verifica a tabela `jobs` no SQLite por `Jobs` elegíveis, filtrando pela `queueName` e `jobName` para os quais um processador está ativo e registrado.
    *   Quando um `Job` elegível é encontrado (status 'waiting' ou 'delayed' com `delayUtil` expirado, e correspondendo à `queueName` e `jobName`), o `QueueService` o marca como 'active', instancia um objeto `JobObject` e invoca a `processorFn` registrada.

### 1.4. Objeto `Job` no Processador

*   **BullMQ:** O processador recebe um objeto `job` com propriedades (`id`, `name`, `data`, `opts`, `queueName`) e métodos (`updateData`, `updateProgress`, `moveToDelayed`, `moveToWaitingChildren`, `log`, etc.).
*   **Adaptação Project Wiz (SQLite):**
    *   Nossa `processorFn` também receberá um `JobObject` com estrutura similar, incluindo `queueName`.
    *   Os métodos deste `JobObject` (ex: `job.updateData(newData)`) não modificarão o estado em memória diretamente de forma isolada, mas sim farão chamadas ao `QueueService` (ou `JobRepository`) para persistir essas mudanças no SQLite (ex: atualizar a coluna `data` do `Job` no banco). Isso é crucial porque o estado real está no banco de dados.

### 1.5. Processamento em Etapas (Steps) dentro de um Job

*   **BullMQ:** Exemplo com `enum Step` e `await job.updateData({ step: Step.Next });` dentro de um loop `while` no processador.
*   **Adaptação Project Wiz (SQLite):**
    *   Este padrão é diretamente aplicável. O campo `data` do nosso `Job` no SQLite (que será um JSON) pode armazenar o `step` atual. O `job.updateData()` no nosso `JobObject` atualizará este campo no JSON no banco.

### 1.6. Atrasando um Job Durante o Processamento (`job.moveToDelayed`)

*   **BullMQ:** `await job.moveToDelayed(Date.now() + delayMs, token); throw new DelayedError();`
*   **Adaptação Project Wiz (SQLite):**
    *   Nosso `JobObject` terá um método `async moveToDelayed(delayUntilTimestamp: number, internalToken?: any)`.
    *   Este método instruirá o `QueueService` a atualizar o status do `Job` no SQLite para 'delayed' e definir o campo `delayUtil` (ou similar) para o `delayUntilTimestamp`.
    *   O processador deverá então lançar um erro especial (ex: `JobDelayedError`) que será capturado pelo loop do `QueueService` que invocou o processador. O `QueueService` então entenderá que não deve tratar isso como uma falha normal, mas sim apenas confirmar a transição para 'delayed'.

### 1.7. Esperando por Filhos (`job.moveToWaitingChildren`)

*   **BullMQ:** Adiciona Jobs filhos e depois `await job.moveToWaitingChildren(token); throw new WaitingChildrenError();`. O `moveToWaitingChildren` verifica se os filhos estão completos.
*   **Adaptação Project Wiz (SQLite):**
    *   O `Job` pai, ao criar `Sub-Jobs` (filhos), os adicionará à(s) fila(s) apropriada(s) (podem ser a mesma fila ou filas diferentes). A relação será mantida via `parent_job_id` nos filhos e, opcionalmente, uma lista de `childJobIds` no campo `data` do pai.
    *   O `JobObject.moveToWaitingChildren(internalToken)`:
        1.  Consultaria o `JobRepository` para verificar o status de todos os `childJobIds` (usando o `parent_job_id` para encontrá-los ou a lista em `data`).
        2.  Se todos estiverem 'completed', o método retorna `false` (não precisa esperar), e o processador do `Job` pai continua.
        3.  Se algum filho não estiver 'completed', o `QueueService` atualiza o status do `Job` pai para 'waiting_children' no SQLite, e o processador lança `JobWaitingChildrenError`.
    *   O loop do `QueueService` precisará ter uma lógica para periodicamente reavaliar `Jobs` no estado 'waiting_children'.

### 1.8. Ciclo de Vida e Estados do Job (Adaptado)

*   **Estados Principais:** `waiting` (aguardando processamento na sua `queueName`), `active` (sendo processado), `completed` (sucesso), `failed` (falha após todas as tentativas), `delayed` (atrasado para próxima tentativa ou por `moveToDelayed`), `waiting_children` (aguardando conclusão de `Jobs` filhos).
*   **Transições:** Serão gerenciadas pelo `QueueService` com base no resultado dos processadores e chamadas aos métodos do `JobObject`.

## 2. O que Simplificar ou Adiar Inicialmente

*   **Eventos Ricos:** O sistema de eventos do BullMQ é extenso. Inicialmente, podemos focar em logging detalhado e talvez alguns callbacks simples ou um sistema de eventos mais simples, adiando um sistema de eventos pub/sub completo e altamente granular por `queueName`.
*   **Locks Avançados e Tokens:** BullMQ usa locks no Redis. Para o SQLite, a estratégia de marcar o Job como `active` e o `QueueService` (sendo um singleton no processo principal do Electron) controlar o despacho deve ser suficiente para evitar processamento duplicado do mesmo Job. O `token` para `moveToDelayed` e `moveToWaitingChildren` seria um ID interno da instância de processamento ativa do Job para garantir que apenas ela possa realizar essas operações.
*   **FlowProducer:** A criação de árvores complexas de `Jobs` de uma vez (Flows) pode ser simplificada para um `Job` pai podendo adicionar filhos (Sub-Jobs) dinamicamente à(s) fila(s).

## Conclusão do Entendimento

A ideia é pegar a API amigável e os conceitos poderosos de gerenciamento de `Jobs` do BullMQ, incluindo o suporte a múltiplas filas nomeadas, e construir um adaptador (`QueueService` + `JobRepository`) que os implemente usando SQLite para persistência. O foco será na robustez do ciclo de vida do `Job`, retentativas, atrasos, e a capacidade de processamento em etapas e espera por filhos, tudo dentro do contexto de filas nomeadas.
```
