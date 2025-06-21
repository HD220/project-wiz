---
**Nota Histórica:** Este documento reflete discussões e análises sobre a adaptação dos conceitos do BullMQ para o Project Wiz, culminando na ideia de cada Agente/Persona operar sobre uma fila nomeada dedicada. A referência arquitetural principal e mais atualizada é o documento `../target_architecture.md`. Consulte-o para a visão mais recente da arquitetura do sistema de filas e demais componentes.
---

# Adaptação Conceitual de BullMQ para Sistema de Filas com SQLite no Project Wiz

## Introdução

Este documento resume o entendimento dos principais conceitos e funcionalidades do BullMQ que servirão de inspiração para a reformulação do sistema de filas do Project Wiz, utilizando SQLite como backend de persistência. O objetivo é criar um subsistema de filas robusto, flexível e desacoplado. Cada Agente/Persona no Project Wiz operará sobre sua própria fila nomeada, e o sistema como um todo suportará múltiplas dessas filas dedicadas.

## 1. Conceitos Fundamentais a Serem Adaptados

Com base nos exemplos e explicações fornecidas, os seguintes aspectos do BullMQ são cruciais para nossa adaptação:

### 1.1. Instanciação da Fila (`Queue`) e Opções Padrão de Job (`defaultJobOptions`)

*   **BullMQ:** `const queue = new Queue(queueName, { defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 1000 } } });`
*   **Adaptação Project Wiz (SQLite):**
    *   O `QueueService` operará sempre no contexto de uma `queueName` específica, que identifica a fila de um Agente/Persona particular. A capacidade de ter múltiplas filas no sistema advém da existência de múltiplos Agentes, cada um com sua fila dedicada (identificada por um `queueName` único, provavelmente derivado do ID do Agente/Persona).
    *   As `defaultJobOptions` (ex: número de tentativas padrão, tipo de backoff e delay base para retentativas) podem ser associadas a um `queueName` específico (talvez através de uma configuração inicial do Agente ou uma entidade `QueueDefinition` ligada ao Agente/Persona). Estas serão usadas ao adicionar novos `Jobs` à fila daquele Agente, a menos que opções específicas sejam fornecidas para aquele `Job`.
    *   A "conexão" não será com Redis, mas sim com nosso `JobRepository` que interage com o SQLite, onde os `Jobs` de todas as filas de Agentes residem, mas são distinguidos pela coluna `queue_name`.

### 1.2. Adição de Jobs (`queue.add`)

*   **BullMQ:** `await queue.add(jobName, { foo: 'bar' }, { attempts: 5, ... });`
*   **Adaptação Project Wiz (SQLite):**
    *   O `QueueService` terá um método como `add(queueName: string, jobName: string, data: any, opts?: JobSpecificOptions): Promise<Job>`.
    *   `queueName`: O nome da fila específica do Agente à qual este `Job` pertence. Será armazenado na coluna `queue_name` do `Job`.
    *   `jobName`: Um nome/tipo para o `Job` (dentro daquela fila), que será usado para associá-lo a uma função processadora específica que o Agente registrará para si.
    *   `data`: O payload (dados) específico para aquele `Job`.
    *   `opts`: Opções específicas para este `Job` que podem sobrescrever as `defaultJobOptions` da fila do Agente.
    *   Este método criará um novo registro na tabela `jobs` do SQLite, incluindo o `queueName`.

### 1.3. Workers e Processadores Assíncronos

*   **BullMQ:** `const worker = new Worker(queueName, async (job: Job) => { /* ... */ return 'resultado'; });`
*   **Adaptação Project Wiz (SQLite):**
    *   Um Agente (que atua como Worker para sua própria fila) usará o `QueueService` para registrar uma função processadora para um `jobName` específico *dentro da `queueName` do Agente*: `process(queueName: string, jobName: string, processorFn: (job: JobObject) => Promise<any>, concurrency?: number)`. (A concorrência será 1 por Agente/Worker).
    *   O loop interno do `QueueService` (ou a lógica de busca de Jobs do Agente) buscará `Jobs` elegíveis no SQLite filtrando pela `queueName` do Agente e pelo `jobName` para o qual um processador está ativo e registrado por aquele Agente.
    *   Quando um `Job` elegível é encontrado, o `QueueService` (ou o Agente) o marca como 'active', instancia um objeto `JobObject` e invoca a `processorFn` registrada.

### 1.4. Objeto `Job` no Processador

*   **BullMQ:** O processador recebe um objeto `job` com propriedades (`id`, `name`, `data`, `opts`, `queueName`) e métodos (`updateData`, `updateProgress`, `moveToDelayed`, `moveToWaitingChildren`, `log`, etc.).
*   **Adaptação Project Wiz (SQLite):**
    *   Nossa `processorFn` (executada pelo Agente) também receberá um `JobObject` com estrutura similar, incluindo `queueName` (que será a fila do próprio Agente).
    *   Os métodos deste `JobObject` farão chamadas ao `QueueService` para persistir mudanças no SQLite.

### 1.5. Processamento em Etapas (Steps) dentro de um Job

*   **BullMQ:** Exemplo com `enum Step` e `await job.updateData({ step: Step.Next });`.
*   **Adaptação Project Wiz (SQLite):**
    *   Este padrão é diretamente aplicável. O campo `data` do nosso `Job` no SQLite pode armazenar o `step` atual.

### 1.6. Atrasando um Job Durante o Processamento (`job.moveToDelayed`)

*   **BullMQ:** `await job.moveToDelayed(Date.now() + delayMs, token); throw new DelayedError();`
*   **Adaptação Project Wiz (SQLite):**
    *   O `JobObject` terá um método `async moveToDelayed(delayUntilTimestamp: number)`.
    *   Este método instruirá o `QueueService` a atualizar o status do `Job` (na sua `queueName`) para 'delayed' e definir `delayUtil`.
    *   O processador (Agente) lançará um erro especial (`JobDelayedError`) para sinalizar ao `QueueService` que a mudança de estado foi intencional.

### 1.7. Esperando por Filhos (`job.moveToWaitingChildren`)

*   **BullMQ:** Adiciona Jobs filhos e depois `await job.moveToWaitingChildren(token); throw new WaitingChildrenError();`.
*   **Adaptação Project Wiz (SQLite):**
    *   Um `Job` pai (um Agente processando um Job) pode criar `Sub-Jobs`. Estes `Sub-Jobs` serão adicionados à **mesma `queueName`** do Agente pai, mas com `jobName`s que podem ser diferentes (representando diferentes `Tasks` ou etapas da decomposição). A relação será mantida via `parent_job_id` nos `Sub-Jobs`.
    *   O `JobObject.moveToWaitingChildren()`:
        1.  Consultaria o `JobRepository` para verificar o status de todos os `Sub-Jobs` (com o mesmo `queueName` e `parent_job_id` igual ao ID do Job atual).
        2.  Se todos estiverem 'completed', retorna `false`.
        3.  Se algum não estiver 'completed', o `QueueService` atualiza o status do `Job` pai para 'waiting_children', e o processador lança `JobWaitingChildrenError`.
    *   O `QueueService` ou o Agente precisará reavaliar `Jobs` em 'waiting_children'.

### 1.8. Ciclo de Vida e Estados do Job (Adaptado)

*   **Estados Principais:** `waiting` (aguardando processamento na sua `queueName`), `active` (sendo processado por seu Agente), `completed`, `failed`, `delayed`, `waiting_children`.
*   **Transições:** Gerenciadas pelo `QueueService` e pela lógica do Agente.

## 2. O que Simplificar ou Adiar Inicialmente

*   **Eventos Ricos:** Foco em logging detalhado inicialmente.
*   **Locks Avançados:** A estratégia de status `active` e o Agente sendo o único processador de sua fila deve simplificar a concorrência para um Job específico.
*   **FlowProducer:** A criação de árvores complexas de `Jobs` pode ser gerenciada pelo Agente criando `Sub-Jobs` dinamicamente em sua própria fila.

## Conclusão do Entendimento

A ideia é adaptar a API e os conceitos do BullMQ para um sistema onde cada Agente gerencia sua própria fila nomeada (`queueName`) persistida em SQLite. O `QueueService` atuará como uma interface para esta persistência e para o registro de processadores pelos Agentes. Isso permite múltiplas filas no sistema (uma por Agente), mas cada Agente foca em sua própria lista de trabalho.
