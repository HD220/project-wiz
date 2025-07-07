# ADR-016: Aplicação Prática de Object Calisthenics no Project Wiz

**Status:** Proposto (Considerado Aprovado Conforme Instrução)

**Contexto:**
Object Calisthenics são um conjunto de nove regras de exercício de programação que ajudam a escrever código orientado a objetos melhor, mais limpo, coeso e de fácil manutenção. A adesão a estes princípios é um requisito não funcional chave para a qualidade do código no Project Wiz. Esta ADR detalha como cada regra deve ser interpretada e aplicada no contexto do nosso codebase TypeScript.

**Decisão:**

As seguintes nove regras de Object Calisthenics serão aplicadas:

**1. Apenas Um Nível de Indentação por Método:**
    *   **Intenção:** Promove métodos pequenos e focados, desencorajando o aninhamento profundo de lógica condicional ou loops.
    *   **Aplicação no Project Wiz:**
        *   Extraia blocos `if`, `for`, `while`, `try/catch` aninhados para métodos privados ou funções auxiliares bem nomeadas.
        *   Utilize "Guard Clauses" (retornos antecipados) para validar pré-condições e reduzir o aninhamento no "caminho feliz" do método.
        *   **Exemplo (TypeScript):**
            ```typescript
            // Ruim (múltiplos níveis)
            // function processItem(item: Item, user: User) {
            //   if (item) {
            //     if (user.isActive) {
            //       for (const detail of item.details) {
            //         if (detail.isValid) { /* ... */ }
            //       }
            //     }
            //   }
            // }

            // Bom (um nível por método)
            // function processItem(item?: Item, user?: User) {
            //   if (!item || !user || !user.isActive) return; // Guard Clauses
            //   processItemDetails(item.details);
            // }
            // function processItemDetails(details: Detail[]) {
            //   for (const detail of details) { // Único nível aqui
            //     ensureDetailIsValidAndProcess(detail);
            //   }
            // }
            // function ensureDetailIsValidAndProcess(detail: Detail) {
            //    if (!detail.isValid) return; // Guard Clause
            //    /* ... processamento do detalhe ... */
            // }
            ```
    *   **Benefício Principal:** Métodos mais curtos, fáceis de ler, entender e testar.

**2. Não Use a Palavra-Chave `else`:**
    *   **Intenção:** Encoraja lógica condicional mais clara através de retornos antecipados (guard clauses), polimorfismo ou padrões de projeto como State ou Strategy, reduzindo aninhamento e complexidade ciclomática.
    *   **Aplicação no Project Wiz:**
        *   Priorize Guard Clauses para todas as pré-condições ou caminhos alternativos simples.
        *   Para lógica condicional mais complexa baseada em estado, considere o padrão State. Para diferentes algoritmos baseados em uma condição, considere o padrão Strategy.
        *   **Exemplo (Guard Clauses):**
            ```typescript
            // Ruim (com else)
            // function getDiscount(userType: UserType, amount: number): number {
            //   if (userType === UserType.PREMIUM) {
            //     return amount * 0.1;
            //   } else {
            //     return amount * 0.05;
            //   }
            // }

            // Bom (sem else)
            // function getDiscount(userType: UserType, amount: number): number {
            //   if (userType === UserType.PREMIUM) {
            //     return amount * 0.1;
            //   }
            //   return amount * 0.05; // Caminho padrão/default
            // }
            ```
    *   **Benefício Principal:** Fluxo de controle mais linear e legível, métodos mais simples.

**3. Envolva Todas as Primitivas e Strings (Wrap All Primitives and Strings):**
    *   **Intenção:** Evitar "Obsessão por Primitivas". Se um tipo primitivo (string, número, booleano) ou uma string literal tiver significado de domínio, regras de validação, restrições de formato ou comportamento associado, ele deve ser encapsulado em uma classe ou tipo específico (Objeto de Valor - VO).
    *   **Aplicação no Project Wiz:**
        *   Alinha-se diretamente com a **ADR-010: Padrões de Implementação para Entidades e Objetos de Valor**. Todos os IDs, emails, nomes com regras específicas, valores monetários, durações, etc., devem ser VOs.
        *   **Exemplo:** Em vez de `userId: string`, use `userId: UserId` (onde `UserId` é um VO que valida o formato do ID).
    *   **Benefício Principal:** Código mais expressivo e type-safe, validação e regras de negócio centralizadas no VO, redução de erros por uso incorreto de primitivas.

**4. Coleções de Primeira Classe (First Class Collections):**
    *   **Intenção:** Uma classe que contém uma coleção (e.g., um array ou mapa) não deve, idealmente, ter outras variáveis de instância. A coleção e as operações significativas sobre ela devem ser encapsuladas em sua própria classe.
    *   **Aplicação no Project Wiz:**
        *   Se uma entidade ou serviço gerencia uma lista de itens e possui muita lógica para manipular essa lista (filtrar, adicionar com regras, calcular totais baseados na lista), considere criar uma classe específica para essa coleção.
        *   **Exemplo:** Em vez de `JobEntity` ter um `this.props.logs: LogEntry[]` e muitos métodos para manipular `logs`, poderia ter `this.props.activityLog: ActivityLogVO` onde `ActivityLogVO` encapsula a coleção de `LogEntryVO` e os métodos para adicionar, filtrar, etc. (Nota: `JobEntity` já usa `ActivityHistoryVO` que é um bom exemplo disso).
    *   **Benefício Principal:** Melhora a coesão, encapsula a lógica de manipulação da coleção, e torna a classe que usa a coleção mais limpa e focada em suas outras responsabilidades.

**5. Apenas Um Ponto Por Linha (Law of Demeter):**
    *   **Intenção:** Reduzir o acoplamento limitando as chamadas de método a colaboradores diretos. Evitar longas cadeias de chamadas como `objeto.getA().getB().getDetalheC().fazerAlgo()`. Siga o princípio "Tell, Don't Ask".
    *   **Aplicação no Project Wiz:**
        *   Se uma classe `A` precisa de algo de `C` através de `B` (`a.getB().getC().doSomething()`), então `A` está acoplada não apenas a `B`, mas também à estrutura interna de `B` e à existência de `C`.
        *   Em vez disso, `A` deveria pedir a `B` para realizar a operação: `a.getB().doSomethingThatInvolvesC()`. A classe `B` então lidaria com a interação com `C`.
        *   Alternativamente, se `A` precisa de uma informação de `C`, `B` deveria ter um método que busca essa informação e a retorna diretamente para `A`.
    *   **Benefício Principal:** Menor acoplamento entre classes, melhor encapsulamento, código mais fácil de manter e refatorar, pois mudanças na estrutura interna de um objeto têm impacto mais localizado.

**6. Não Abreviar:**
    *   **Intenção:** Usar nomes claros, explícitos, inequívocos e completos para variáveis, funções, classes, arquivos, etc.
    *   **Aplicação no Project Wiz:**
        *   Alinha-se com a **ADR-XXX-ComprehensiveNamingConventions.md** (a ser criada), que mandata nomes em inglês.
        *   Evite abreviações como `usr` para `user`, `cfg` para `config`, `calc` para `calculate`, a menos que a abreviação seja um acrônimo universalmente entendido e padronizado no domínio (e.g., `DTO`, `ID`, `URL`, `HTML`).
        *   Priorize a clareza sobre a economia de alguns caracteres.
    *   **Benefício Principal:** Código autoexplicativo, mais fácil de ler e entender por todos (incluindo futuros mantenedores e LLMs).

**7. Mantenha Todas as Entidades Pequenas (Classes e Métodos):**
    *   **Intenção:** Classes devem ser pequenas e coesas. Métodos devem ser ainda menores e mais focados. Isso promove o Princípio da Responsabilidade Única (SRP).
    *   **Aplicação no Project Wiz:**
        *   **Classes:** Apontar para < 100 linhas (idealmente < 50) como um guia suave. Se uma classe cresce muito, é um sinal para refatoração e extração de responsabilidades para novas classes ou VOs.
        *   **Métodos:** Apontar para < 15 linhas (idealmente < 5-10). Métodos longos devem ser quebrados em métodos privados menores e bem nomeados.
    *   **Benefício Principal:** Classes e métodos menores são mais fáceis de entender, testar, manter e menos propensos a conter múltiplos bugs.

**8. Nenhuma Classe Com Mais de Duas Variáveis de Instância:**
    *   **Intenção:** Regra rigorosa para promover altíssima coesão e forçar o SRP. Se uma classe possui muitas variáveis de instância (estado), ela provavelmente está gerenciando múltiplos conceitos ou responsabilidades que poderiam ser agrupados em novos objetos.
    *   **Aplicação no Project Wiz (Pragmática):**
        *   Esta regra é desafiadora, especialmente com Injeção de Dependência (DI), onde serviços podem ter várias dependências injetadas (que são colaboradores, não estado direto da classe).
        *   **Foco Principal:** Aplicar estritamente para variáveis de instância que representam o *estado interno* da classe.
        *   Se uma classe tem muitas variáveis de estado, questione se essas variáveis poderiam formar um novo VO ou uma nova entidade coesa.
        *   **Para dependências injetadas:** O número pode ser maior que dois se cada dependência representar um colaborador distinto e necessário para a responsabilidade principal da classe. No entanto, um número excessivo de dependências injetadas ainda pode indicar que a classe tem muitas responsabilidades e deve ser dividida (SRP).
    *   **Benefício Principal:** Força a descoberta de conceitos de domínio implícitos, leva a classes menores e altamente focadas, e melhora a coesão.

**9. Sem Getters/Setters/Properties (para acesso/mutação direta de estado):**
    *   **Intenção:** Objetos devem expor comportamento ("Tell, Don't Ask") em vez de simplesmente expor seus dados internos através de getters e setters públicos que permitem manipulação externa irrestrita. Mudanças de estado devem ocorrer como efeitos colaterais de métodos que representam operações de negócio.
    *   **Aplicação no Project Wiz:**
        *   Alinha-se com a **ADR-010 (Entity/VO Standards)**:
            *   **VOs:** São imutáveis. Expor valores via `get` accessors é aceitável, pois o estado não pode ser alterado.
            *   **Entidades:**
                *   Expor o estado (que geralmente são VOs ou outras entidades) via `get` accessors é aceitável para leitura.
                *   NÃO devem existir setters públicos que alterem diretamente as propriedades.
                *   Toda mutação de estado deve ocorrer através de métodos de negócio bem definidos que encapsulam as regras e invariantes, idealmente retornando uma nova instância da entidade (conforme ADR-010).
    *   **Benefício Principal:** Melhor encapsulamento, controle sobre as transições de estado, comportamento da classe mais explícito e menos acoplamento aos detalhes internos de como o estado é armazenado.

**Consequências:**
*   Código mais limpo, modular, coeso e com responsabilidades bem definidas.
*   Melhoria na legibilidade, testabilidade e manutenibilidade.
*   Design de domínio mais rico e explícito.
*   Redução da complexidade acidental.

---
**Notas de Implementação para LLMs:**
*   Para cada método/classe que você criar ou refatorar, revise estas 9 regras.
*   Preste atenção especial à extração de métodos para manter um único nível de indentação e métodos curtos.
*   Use Guard Clauses extensivamente para evitar a palavra-chave `else`.
*   Identifique primitivas que carregam significado de domínio e proponha/crie VOs para elas.
*   Desafie classes com muitas variáveis de instância ou métodos longos, buscando oportunidades para dividi-las.
*   Foque em expor comportamento, não apenas estado.
