# Arquitetura Atual e Propostas de Refinamento (v2)

## 1. Introdução

Este documento apresenta uma análise refinada da arquitetura atual do sistema de Agentes IA, com foco em identificar discrepâncias em relação às práticas de desenvolvimento estabelecidas (como Object Calisthenics, SOLID, DDD) e propor um caminho pragmático para alcançar maior consistência e qualidade de código. O objetivo é fornecer um conjunto de propostas de refinamento acionáveis que equilibrem o ideal arquitetural com as realidades e prioridades do projeto. Esta versão (v2) aprofunda a análise e refina as propostas com base em um entendimento mais detalhado do código e dos desafios enfrentados.

## 2. Análise do Estado Atual e Discrepâncias

Uma revisão detalhada do código-fonte, particularmente nos módulos centrais (`core`, `application`, `domain`), revelou padrões e práticas que, embora funcionais, apresentam oportunidades significativas de alinhamento com os princípios arquiteturais e de design de software desejados.

### 2.1. Observações Gerais sobre o Código

*   **Adesão Parcial ao Object Calisthenics**:
    *   **Regra 1 (Um nível de indentação por método)**: Frequentemente respeitada, mas com exceções em métodos mais complexos de orquestração ou lógica condicional aninhada.
    *   **Regra 2 (Não use a palavra-chave ELSE)**: Observada em muitos casos, com preferência por return-early, mas ainda há ocorrências de `else`.
    *   **Regra 3 (Encapsule todos os primitivos e Strings)**: Pouco aplicada. Tipos primitivos são amplamente utilizados como parâmetros e tipos de retorno, levando a um acoplamento mais forte e menor expressividade do domínio.
    *   **Regra 4 (Coleções de primeira classe)**: Ausente na maioria dos casos. Arrays e listas genéricas são manipulados diretamente em vez de serem encapsulados em classes específicas.
    *   **Regra 5 (Um ponto por linha)**: Geralmente respeitada, mas há encadeamentos de chamadas que poderiam ser mais claros.
    *   **Regra 6 (Não abrevie)**: Majoritariamente seguida, com nomes de variáveis e métodos geralmente descritivos.
    *   **Regra 7 (Mantenha todas as entidades pequenas)**: Varia. Algumas classes e métodos são concisos, enquanto outros (especialmente em serviços de aplicação) tendem a acumular responsabilidades. Limite de 50 linhas por classe/método não é uma regra estrita.
    *   **Regra 8 (Não mais que duas variáveis de instância por classe)**: Dificilmente seguida, especialmente em entidades e value objects que naturalmente agregam mais dados. A interpretação desta regra no contexto de DDD precisa ser flexibilizada.
    *   **Regra 9 (Sem getters/setters/properties)**: Não seguida. Padrões de getters e setters são comuns, o que pode levar a um modelo anêmico se não combinado com comportamento rico.

*   **Princípios SOLID**:
    *   **SRP (Single Responsibility Principle)**: Desafios em alguns serviços de aplicação que orquestram muitas operações distintas. Entidades por vezes também acumulam responsabilidades que poderiam ser delegadas a outros objetos de domínio.
    *   **OCP (Open/Closed Principle)**: Há oportunidades para melhorar. Adicionar novos comportamentos muitas vezes requer modificação de classes existentes em vez de extensão.
    *   **LSP (Liskov Substitution Principle)**: Geralmente respeitado nas hierarquias de classes existentes, mas a falta de abstrações mais profundas limita sua aplicabilidade.
    *   **ISP (Interface Segregation Principle)**: Interfaces tendem a ser coesas. No entanto, a ausência de interfaces em alguns pontos leva a dependências de classes concretas.
    *   **DIP (Dependency Inversion Principle)**: Aplicado parcialmente. O uso de injeção de dependência é um bom começo, mas há dependências diretas de módulos de infraestrutura em camadas de domínio/aplicação.

*   **Design Orientado a Domínio (DDD)**:
    *   **Linguagem Ubíqua**: Esforço visível, mas pode ser aprimorado com maior envolvimento do time e formalização no código (e.g., Value Objects mais expressivos).
    *   **Entidades e Value Objects**: Distinção presente, mas Value Objects poderiam ser mais utilizados para encapsular conceitos de domínio e primitivos (conforme Object Calisthenics Regra 3).
    *   **Agregados**: Conceito de agregados parece implícito, mas as raízes de agregado e seus limites nem sempre são claramente definidos, o que pode levar a inconsistências.
    *   **Serviços de Domínio**: Usados, mas por vezes misturados com lógica de aplicação.
    *   **Repositórios**: Interfaces definidas, mas as implementações por vezes expõem detalhes da infraestrutura (e.g., métodos específicos do ORM Drizzle).

### 2.2. Discrepâncias Específicas e Impactos

*   **Anemia do Domínio**: Muitas entidades e VOs são primariamente estruturas de dados com getters/setters, com a lógica de negócios residindo predominantemente nos serviços de aplicação. Isso dificulta o reuso da lógica de domínio e a manutenção da consistência.
    *   **Impacto**: Menor coesão, maior acoplamento, lógica de negócios duplicada, dificuldade em testar o domínio isoladamente.
*   **Acoplamento à Infraestrutura**: Camadas de domínio e aplicação por vezes dependem diretamente de detalhes de implementação da camada de infraestrutura (e.g., Drizzle).
    *   **Impacto**: Dificuldade em trocar tecnologias de infraestrutura, testes mais complexos (necessidade de mocks detalhados da infraestrutura).
*   **Falta de Encapsulamento de Primitivos**: Uso excessivo de `string`, `number`, `boolean` como parâmetros e retornos em vez de Value Objects.
    *   **Impacto**: "Primitive Obsession", menor expressividade do código, validações espalhadas, dificuldade em refatorar e adicionar significado semântico.
*   **Gerenciamento de Transações e Unidade de Trabalho**: Lógica de transação por vezes misturada com lógica de aplicação, ou não claramente definida em torno de casos de uso.
    *   **Impacto**: Risco de inconsistência de dados, dificuldade em garantir atomicidade das operações.

## 3. Caminho para a Consistência: Uma Abordagem Pragmática

Não se trata de uma reescrita completa, mas de um processo iterativo e focado de refinamento. A estratégia é:

1.  **Educação e Conscientização Contínua**: Workshops e sessões de pair programming sobre Object Calisthenics, SOLID, DDD e os padrões específicos a serem adotados.
2.  **Priorização Inteligente**: Focar nos módulos mais críticos e naqueles onde as discrepâncias causam maior impacto (dor).
3.  **Refatoração Incremental**: Aplicar os refinamentos em pequenas etapas, idealmente como parte do desenvolvimento de novas funcionalidades ou correção de bugs ("Boy Scout Rule").
4.  **Ferramentas de Análise Estática**: Configurar linters e outras ferramentas para ajudar a identificar e corrigir desvios dos padrões estabelecidos.
5.  **Revisões de Código Focadas**: Incluir verificações específicas sobre os princípios e práticas desejadas durante as revisões de código.

## 4. Propostas de Refinamento Pragmatico

As seguintes propostas visam endereçar as discrepâncias mais impactantes de forma incremental.

### Proposta 1: Fortalecer o Encapsulamento com Value Objects (Object Calisthenics Regra 3 & 4)

*   **Problema**: Uso excessivo de tipos primitivos, levando a "Primitive Obsession" e falta de expressividade. Coleções genéricas manipuladas diretamente.
*   **Solução**:
    *   Identificar conceitos de domínio que são atualmente representados por primitivos (e.g., `Email`, `UserID`, `StatusTarefa`, `NomeProjeto`) e encapsulá-los em Value Objects imutáveis.
    *   Implementar validações de domínio dentro desses VOs.
    *   Criar classes para coleções de primeira classe (e.g., `ListaDeTarefas`, `ConjuntoDePermissoes`) que encapsulem a lógica de manipulação dessas coleções.
*   **Exemplo Prático**:
    *   Em vez de `assignTask(userId: string, taskId: string)`, usar `assignTask(assigneeId: UserID, task: TaskID)`.
    *   `class Email { constructor(private readonly value: string) { /* validation */ } toString() { return this.value; } }`
*   **Benefícios**: Código mais expressivo e seguro, validações centralizadas, redução de erros por tipos incompatíveis.

### Proposta 2: Enriquecer Entidades e Reduzir Anemia do Domínio (DDD)

*   **Problema**: Entidades são frequentemente meros sacos de dados, com lógica de negócios nos serviços de aplicação.
*   **Solução**:
    *   Mover lógica de negócios que opera diretamente sobre o estado de uma entidade para dentro da própria entidade.
    *   Garantir que as entidades protejam suas invariantes e não exponham seu estado interno indiscriminadamente (favorecer métodos que expressam comportamento em vez de simples setters).
*   **Exemplo Prático**:
    *   Em vez de `taskService.completeTask(task)` que altera o estado da `task` externamente, ter um método `task.complete()` que encapsula a lógica de mudança de estado e validações associadas.
*   **Benefícios**: Maior coesão, melhor encapsulamento, lógica de domínio mais clara e testável.

### Proposta 3: Refinar Limites de Agregados e Raízes (DDD)

*   **Problema**: Limites de agregados não claramente definidos podem levar a manipulações diretas de entidades internas e inconsistências.
*   **Solução**:
    *   Para cada agregado, identificar explicitamente a Raiz do Agregado.
    *   Garantir que todas as modificações em entidades dentro do agregado passem pela Raiz do Agregado.
    *   Repositórios devem lidar apenas com Raízes de Agregado.
*   **Exemplo Prático**:
    *   Se `Projeto` é uma raiz de agregado que contém `Tarefas`, a adição ou modificação de uma `Tarefa` deve ser feita através de um método em `Projeto` (e.g., `projeto.adicionarTarefa(...)`).
*   **Benefícios**: Consistência de dados garantida dentro do agregado, acoplamento reduzido.

### Proposta 4: Melhorar a Aplicação do Princípio da Inversão de Dependência (SOLID - DIP)

*   **Problema**: Dependências diretas de camadas de domínio/aplicação em implementações de infraestrutura.
*   **Solução**:
    *   Garantir que todas as dependências de infraestrutura (e.g., repositórios, serviços de email, gateways de pagamento) sejam representadas por interfaces definidas na camada de Aplicação ou Domínio.
    *   As implementações dessas interfaces residirão na camada de Infraestrutura e serão injetadas onde necessário.
*   **Exemplo Prático**:
    *   Definir `ITarefaRepository` na camada de domínio/aplicação.
    *   `TarefaRepositoryDrizzle` na camada de infraestrutura implementa `ITarefaRepository`.
    *   Serviços de aplicação dependem de `ITarefaRepository`, não de `TarefaRepositoryDrizzle`.
*   **Benefícios**: Maior desacoplamento, melhor testabilidade (mocks mais fáceis), flexibilidade para trocar implementações de infraestrutura.

### Proposta 5: Adoção Consciente de "Um Nível de Indentação" e "Não Use Else" (Object Calisthenics Regra 1 & 2)

*   **Problema**: Métodos com múltiplos níveis de indentação e uso excessivo de `else` podem ser difíceis de ler e entender.
*   **Solução**:
    *   Refatorar métodos longos ou com lógica condicional complexa, extraindo submétodos.
    *   Utilizar "guard clauses" (return early) para reduzir aninhamento e eliminar a necessidade de `else`.
    *   Considerar padrões como Strategy ou State para lidar com lógicas condicionais mais complexas de forma polimórfica.
*   **Exemplo Prático**:
    ```typescript
    // Antes
    function processItem(item: any) {
      if (item.isValid) {
        if (item.type === 'A') {
          // do A
        } else {
          // do B
        }
      } else {
        // log error
      }
    }

    // Depois
    function processItem(item: any) {
      if (!item.isValid) {
        // log error
        return;
      }
      if (item.type === 'A') {
        // do A
        return;
      }
      // do B
    }
    ```
*   **Benefícios**: Código mais legível, menor complexidade ciclomática, mais fácil de testar e manter.

## 5. Conclusão

A jornada para uma arquitetura mais robusta e consistente é contínua. As propostas apresentadas não são uma bala de prata, mas um conjunto de diretrizes e ações pragmáticas que, quando aplicadas de forma consistente e iterativa, podem levar a melhorias significativas na qualidade do código, manutenibilidade, testabilidade e expressividade do domínio. O sucesso dependerá do comprometimento da equipe em aprender, aplicar e adaptar esses princípios à realidade do projeto Wiz. Recomenda-se iniciar com a Proposta 1 (Value Objects) e a Proposta 5 (Indentação/Else), pois tendem a ter um impacto positivo rápido na legibilidade e robustez do código, e gradualmente avançar para as demais, focando em áreas críticas do sistema.
