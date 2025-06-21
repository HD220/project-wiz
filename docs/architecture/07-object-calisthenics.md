# 07: Aplicação de Object Calisthenics

Object Calisthenics é um conjunto de nove regras de "exercício" para escrever código orientado a objetos melhor. Elas ajudam a criar código mais legível, manutenível e com responsabilidades bem definidas. Aplicaremos estas regras em todo o desenvolvimento do domínio e, sempre que prático, nas outras camadas.

1.  **Um Nível de Indentação por Método:**
    *   **Explicação:** Métodos devem ter apenas um nível de indentação. Isso força a extração de lógica complexa para métodos menores e mais focados.
    *   **Aplicação Prática:** Em um Caso de Uso, se houver múltiplos `if`s aninhados para validação, cada bloco de validação pode ser extraído para um método privado. No nosso exemplo `Job.entity.ts`, métodos como `startProcessing` ou `fail` devem evitar múltiplos `if`s aninhados, extraindo condições para métodos privados ou usando early returns.
        ```typescript
        // Mau:
        // class ProcessOrderUseCase {
        //   execute(order) {
        //     if (order.isValid) {
        //       if (order.hasInventory) {
        //         // ...
        //       }
        //     }
        //   }
        // }

        // Bom:
        // class ProcessOrderUseCase {
        //   execute(order) {
        //     this.ensureOrderIsValid(order);
        //     this.ensureInventoryIsAvailable(order);
        //     // ...
        //   }
        //   private ensureOrderIsValid(order) { /* ... */ }
        //   private ensureInventoryIsAvailable(order) { /* ... */ }
        // }
        ```

2.  **Não Use a Palavra-Chave `ELSE`:**
    *   **Explicação:** O uso de `else` pode muitas vezes ser substituído por `return` antecipado (early return), polimorfismo ou outras construções que tornam o fluxo de controle mais claro.
    *   **Aplicação Prática:** No método `Job.fail()`, se houvesse diferentes lógicas para diferentes status antes da falha, poderíamos usar early returns para cada condição em vez de `if-else if-else`.
        ```typescript
        // Mau:
        // function checkAccess(user) {
        //   if (user.isAdmin) {
        //     return true;
        //   } else {
        //     return false;
        //   }
        // }

        // Bom (early return):
        // function checkAccess(user) {
        //   if (user.isAdmin) {
        //     return true;
        //   }
        //   return false;
        // }
        ```

3.  **Envolva Todos os Primitivos e Strings em Value Objects:**
    *   **Explicação:** Tipos primitivos (string, number, boolean) e Strings muitas vezes não carregam significado de negócio. Envolvê-los em classes pequenas (Value Objects) adiciona semântica, validação e comportamento.
    *   **Aplicação Prática:** Em vez de `job.status: string`, teremos `job.status: JobStatusVO`. Em vez de `user.email: string`, `user.email: EmailVO`. O `JobStatusVO` (esboçado em [`02-domain-layer.md`](./02-domain-layer.md#211-entidade-job-exemplo-detalhado)) validaria o status. Um `EmailVO` validaria o formato do email.

4.  **Coleções de Primeira Classe (First-Class Collections):**
    *   **Explicação:** Se uma classe contém uma coleção (array, lista, map), crie uma classe dedicada para essa coleção. Essa nova classe encapsulará todos os comportamentos relacionados à manipulação e consulta da coleção.
    *   **Aplicação Prática:** Se um `Project` tivesse uma lista de `Job`s, em vez de `project.jobs: Job[]`, poderíamos ter `project.jobs: JobList`, onde `JobList` teria métodos como `getActiveJobs()`, `getFailedJobs()`, `addJob(job: Job)`.
        ```typescript
        // class JobList {
        //   private jobs: Job[];
        //   constructor(initialJobs: Job[] = []) { this.jobs = initialJobs; }
        //   add(job: Job): void { /* ... */ }
        //   getFailedJobs(): Job[] { /* ... */ }
        //   // Outros métodos de consulta e manipulação da lista de jobs
        // }
        ```

5.  **Um Ponto por Linha (Law of Demeter - Forma Estrita):**
    *   **Explicação:** Um método só deve chamar métodos de objetos que são: o próprio objeto (`this`), parâmetros do método, objetos que ele cria/instancia, ou dependências diretas do objeto (variáveis de instância). Evita encadeamentos longos como `a.getB().getC().doSomething()`.
    *   **Aplicação Prática:** Em um Caso de Uso ou Serviço de Domínio, em vez de `job.getProject().getOwner().getEmail()`, o `Job` poderia ter um método `getProjectOwnerEmail()` (se fizer sentido para `Job` conhecer isso), ou o componente chamador obteria cada objeto na cadeia separadamente se precisasse de informações de cada um.

6.  **Não Abrevie:**
    *   **Explicação:** Use nomes completos e descritivos para classes, métodos e variáveis.
    *   **Aplicação Prática:** `IJobRepository` em vez de `IJobRepo`. `CreateProjectUseCase` em vez de `CrtPrjUC`. `AIAgentExecutionService` em vez de `AgentSvc`.

7.  **Mantenha Todas as Entidades Pequenas (Máximo 50-100 Linhas):**
    *   **Explicação:** Classes devem ser pequenas e focadas em uma única responsabilidade. Um limite de linhas é um guia para forçar coesão.
    *   **Aplicação Prática:** Se a entidade `Job` (detalhada em [`02-domain-layer.md`](./02-domain-layer.md#211-entidade-job-exemplo-detalhado)) começasse a acumular muitas responsabilidades não intrínsecas ao seu estado principal (ex: lógicas complexas de notificação, agendamento avançado), essas responsabilidades seriam extraídas para Serviços de Domínio ou outros Casos de Uso.

8.  **Nenhuma Classe com Mais de Duas Variáveis de Instância:**
    *   **Explicação:** Esta é uma das regras mais desafiadoras e visa máxima coesão. Força a criação de mais classes pequenas que encapsulam conceitos relacionados.
    *   **Aplicação Prática:** Para entidades como `Job` que naturalmente têm várias propriedades, agrupamos essas propriedades em um objeto `props` (como em `Job.props: JobProps`). Se mesmo assim o objeto `props` se tornar muito grande e com conceitos distintos, esses conceitos podem ser extraídos para Value Objects ou pequenas classes de dados que compõem as `props`. O espírito é evitar classes que são meros agregados de muitos campos desconexos.

9.  **Sem Getters/Setters/Propriedades Públicas para Alteração de Estado Direta:**
    *   **Explicação:** O estado de um objeto só deve ser modificado através de métodos que representam comportamentos de negócio explícitos (Tell, Don't Ask). Getters para leitura de estado são permitidos. Setters que simplesmente atribuem um valor a um campo são desencorajados; em vez disso, use métodos com nomes que descrevam a ação de negócio.
    *   **Aplicação Prática:** Na nossa entidade `Job`:
        *   Temos getters como `job.id`, `job.status`.
        *   Não temos um `job.setStatus(newStatus)`. Em vez disso, temos `job.startProcessing()`, `job.complete(result)`, `job.fail(error)`, `job.prepareForDelay(timestamp)`, que alteram o status como um efeito colateral de um comportamento de negócio ou preparação para uma ação. A propriedade `props` da entidade `Job` foi marcada como `public readonly` no exemplo em `02-domain-layer.md` para leitura, mas sua modificação é encapsulada pelos métodos da entidade. (Nota: Se `props` for `public readonly`, os métodos da entidade que modificam `props` precisariam recriar o objeto `props` para manter a imutabilidade percebida do objeto `props` em si, ou `props` seria `private` e os getters acessariam `this.props.fieldName`.) Para a nossa discussão, `job.props` sendo público para leitura pelo Worker/QueueClient para persistência é aceitável, desde que a modificação seja via métodos.

A aplicação disciplinada destas regras, especialmente no código de domínio, resultará em um sistema mais robusto, flexível e fácil de entender.
```
