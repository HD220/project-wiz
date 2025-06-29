# 1. Visão Geral do Projeto

O Project Wiz é uma aplicação desktop ElectronJS com frontend em React e backend/core em Node.js/TypeScript.

**Instrução Fundamental: Leitura Prévia da Documentação**

Antes de iniciar QUALQUER tarefa de desenvolvimento, refatoração ou análise que envolva modificações no código ou na sua estrutura, é **obrigatório** que você revise CUIDADOSAMENTE toda a documentação relevante. O seu entendimento do sistema depende disso.

*   **Documentação de Referência Principal:** Localizada em `docs/reference/`.
    *   **Arquitetura do Software (`docs/reference/01-software-architecture.md`):** Este é o documento primário para entender a arquitetura do sistema. Ele detalha a Clean Architecture, as camadas (Domínio, Aplicação, Infraestrutura), o fluxo de dependências, e os componentes chave. **A leitura e compreensão deste documento são cruciais.**
    *   **Boas Práticas e Diretrizes de Desenvolvimento (`docs/reference/02-best-practices.md`):** Contém discussões aprofundadas sobre princípios gerais e específicos das tecnologias que usamos.
    *   **Princípios de Qualidade de Código e Refatoração (`docs/reference/08-code-quality-and-refactoring-principles.md`):** Foca em como manter a qualidade do código e as abordagens para refatoração.
*   **Documentação do Desenvolvedor:** Localizada em `docs/developer/`.
    *   **Padrões de Código (`docs/developer/02-coding-standards.md`):** Especifica os padrões de estilo de código, formatação, linting e convenções de nomenclatura.
*   **Outros Documentos:** Conforme a necessidade da tarefa, explore outros documentos em `docs/` (ex: `docs/analise-e-pesquisa/` para ADRs e pesquisas, `docs/tecnico/` para artefatos legados ou específicos se ainda relevantes).

A falha em consultar a documentação adequadamente resultará em trabalho desalinhado com os objetivos e a estrutura do projeto.

## 2. Arquitetura do Software e Princípios Mandatórios

### 2.1. Arquitetura Geral

O Project Wiz adota a **Clean Architecture**. Esta abordagem organiza o código em camadas concêntricas, com um fluxo de dependência estrito para o interior:

*   **Camada de Domínio (Domain):** Contém a lógica de negócios central e as entidades. É a camada mais interna e não depende de nenhuma outra camada.
*   **Camada de Aplicação (Application):** Orquestra os casos de uso da aplicação. Contém a lógica específica da aplicação e depende apenas da camada de Domínio.
*   **Camada de Infraestrutura (Infrastructure):** Lida com detalhes externos como frameworks, bancos de dados, APIs de terceiros e a interface do usuário (UI). Esta camada depende da camada de Aplicação (através de portas e adaptadores).

**O fluxo de dependência é sempre: Infraestrutura -> Aplicação -> Domínio.**

Para um detalhamento completo da arquitetura, componentes de cada camada, tecnologias chave e fluxos de dados, consulte **obrigatoriamente** o documento:
*   `docs/reference/01-software-architecture.md`

### 2.2. Princípios de Design e Codificação

Aderência estrita aos seguintes princípios é crucial:

*   **Clean Architecture:** Conforme descrito acima e detalhado em `docs/reference/01-software-architecture.md`.
*   **Object Calisthenics:** Todas as 9 regras devem ser aplicadas rigorosamente. Veja a seção "3. Object Calisthenics em Detalhe" abaixo. Este é um requisito não funcional chave.
*   **SOLID:**
    *   **S**ingle Responsibility Principle: Classes e métodos devem ter uma única responsabilidade bem definida.
    *   **O**pen/Closed Principle: Entidades devem ser abertas para extensão, mas fechadas para modificação.
    *   **L**iskov Substitution Principle: Subtipos devem ser substituíveis por seus tipos base.
    *   **I**nterface Segregation Principle: Clientes não devem depender de interfaces que não usam.
    *   **D**ependency Inversion Principle: Dependa de abstrações (interfaces/portas), não de implementações concretas.
*   **DRY (Don't Repeat Yourself):** Evite duplicação de código e lógica.
*   **KISS (Keep It Simple, Stupid):** Prefira soluções mais simples quando possível, sem sacrificar a clareza ou os princípios arquiteturais.

Consulte também:
*   `docs/developer/02-coding-standards.md` para padrões de formatação, nomenclatura, etc.
*   `docs/reference/02-best-practices.md` para uma visão mais ampla de boas práticas.
*   `docs/reference/08-code-quality-and-refactoring-principles.md` para diretrizes sobre qualidade.

## 3. Object Calisthenics em Detalhe (Como Aplicar)

As 9 regras são mandatórias. Aqui estão algumas diretrizes contextuais:

1. **Um Nível de Indentação por Método:**
    * Extraia blocos `if`, `for`, `while`, `try/catch` para métodos privados ou funções auxiliares.
    * Use guard clauses (retornos antecipados) para reduzir aninhamento.
2. **Não Use a Palavra-Chave `else`:**
    * Priorize guard clauses.
    * Para lógica condicional mais complexa, considere polimorfismo (Strategy Pattern, State Pattern) ou mapeamentos.
3. **Encapsule Todos os Tipos Primitivos e Strings:**
    * **Value Objects (VOs):** Use para qualquer primitivo que tenha significado de domínio, regras de validação, ou comportamento associado (ex: `ProjectId`, `EmailAddress`, `JobStatus`, `RetryDelay`).
    * **DTOs/Schemas Zod:** Para dados de entrada/saída de casos de uso e handlers IPC.
    * **Exceções:** Primitivos são aceitáveis para variáveis de loop locais, contadores simples, ou strings que são verdadeiramente apenas "dados brutos" sem semântica de domínio (raro).
4. **Coleções de Primeira Classe:**
    * Se uma classe gerencia uma coleção (array, map, set) e tem lógica de negócios em torno dessa coleção (adicionar, remover, filtrar com regras específicas), crie uma classe dedicada para essa coleção (ex: `ActivityHistory`, `ToolNames`).
    * A classe da coleção não deve ter outras variáveis de instância além da própria coleção.
5. **Apenas Um Ponto Por Linha (Lei de Demeter):**
    * Evite cadeias como `object.getA().getB().doC()`.
    * Em vez disso, peça ao colaborador direto para fazer o trabalho: `object.doSomethingRelatedToC()`.
    * Isso reduz o acoplamento. Cuidado especial em casos de uso orquestrando entidades.
6. **Não Abrevie:**
    * Use nomes completos e descritivos para classes, métodos, variáveis. `repository` em vez de `repo`. `index` é aceitável para contadores de loop.
7. **Mantenha Todas as Entidades Pequenas:**
    * **Classes:** Idealmente <50-100 linhas. Se maior, provavelmente tem múltiplas responsabilidades.
    * **Métodos:** Idealmente <5-10 linhas. Se maior, extraia para métodos privados.
8. **Nenhuma Classe Com Mais de Duas Variáveis de Instância:**
    * Esta é a regra mais desafiadora, especialmente com DI.
    * **Estratégias:**
        * Agrupe dependências que servem a um único propósito coeso em um objeto de configuração/contexto e injete esse objeto.
        * Se uma classe tem muitas dependências servindo a propósitos distintos, divida a classe em responsabilidades menores.
        * Entidades frequentemente têm um `_id` (identidade) e um `props` (estado). VOs têm seus `props`.
9. **Sem Getters/Setters/Propriedades (para comportamento):**
    * **Comportamento sobre Dados:** Objetos devem expor métodos que realizam ações ("Tell, Don't Ask"), em vez de apenas fornecer acesso direto a dados internos para manipulação externa.
    * **Value Objects:** Por convenção, VOs podem ter um método `value()` ou similar (ex: `idString()`, `nameString()`) para fornecer sua representação primitiva quando necessário para interagir com sistemas externos ou para persistência, mas o VO em si deve ser imutável. Isso não é um "getter" no sentido de expor estado interno para mutação arbitrária.
    * **Entidades:** O estado interno (`props`) é privado. Mutações de estado ocorrem através de métodos comportamentais que retornam uma *nova instância* da entidade (ou atualizam `updatedAt` e retornam `this` se a entidade for conceitualmente mutável mas suas props VOs forem imutáveis).

## 4. Tecnologias Chave

Consulte `package.json` e `docs/tecnico/arquitetura.md` para a lista completa. As principais incluem:

* **Linguagem:** TypeScript (configuração `strict`).
* **Backend/Core:** Node.js.
* **Desktop App:** ElectronJS.
* **Frontend UI:** React, Vite, Tailwind CSS, Radix UI, ShadCN UI conventions.
* **Roteamento (UI):** TanStack Router.
* **i18n (UI):** LinguiJS.
* **Formulários (UI):** React Hook Form + Zod.
* **DI (Backend):** InversifyJS.
* **Banco de Dados:** SQLite com Drizzle ORM.
* **AI/LLM:** `ai-sdk`.
* **Testes:** Vitest.

## 5. Modificações Controladas: Dependências, Configurações e Organização do Código

Qualquer proposta de adição de novas dependências (pacotes npm, bibliotecas), alterações significativas em configurações existentes (ex: `tsconfig.json`, `vite.config.ts`, configurações de CI/CD) ou mudanças estruturais na organização do código (ex: mover pastas principais, alterar significativamente a estrutura de módulos) deve seguir um processo formal de aprovação.

**Processo Mandatório:**

1.  **Análise e Pesquisa Prévias:**
    *   Antes de propor qualquer alteração das mencionadas acima, você deve realizar uma pesquisa e análise detalhada.
    *   Identifique a necessidade da mudança e os problemas que ela visa resolver.
    *   Se for uma nova dependência, compare alternativas, considerando fatores como popularidade, manutenção, licença, impacto no tamanho do bundle, segurança e alinhamento com a arquitetura existente.
    *   Para alterações de configuração ou organização, avalie os prós e contras da mudança e o impacto potencial no restante do sistema.

2.  **Criação de um ADR (Architecture Decision Record):**
    *   Documente os resultados da sua análise e pesquisa em um novo arquivo ADR.
    *   Utilize um template padrão para ADRs (se não existir, crie um simples com seções para Contexto, Decisão Proposta, Alternativas Consideradas, Prós, Contras, e Justificativa).
    *   Salve o ADR na pasta `docs/analise-e-pesquisa/` com um nome descritivo (ex: `adr-XXX-uso-nova-biblioteca-graficos.md` ou `adr-XXX-reestruturacao-pasta-servicos.md`).

3.  **Solicitação de Aprovação:**
    *   Informe ao usuário (seu supervisor humano) sobre o novo ADR criado e solicite uma revisão e aprovação.
    *   Aponte claramente qual o problema que está sendo resolvido e por que a solução proposta (nova dependência, mudança de configuração, etc.) é a melhor opção.

4.  **Implementação Somente Após Aprovação:**
    *   **Você NÃO DEVE instalar novas dependências, aplicar alterações de configuração significativas ou realizar reorganizações estruturais de código sem a aprovação explícita do ADR correspondente pelo usuário.**
    *   Uma vez que o ADR seja aprovado, você poderá prosseguir com a implementação da decisão documentada.

Este processo garante que todas as mudanças significativas sejam bem ponderadas, documentadas e alinhadas com os objetivos de longo prazo do projeto.

## 6. Trabalhando com Código Legado (Durante a Fase 5)

* O código legado em `src/` e `src2/` existe para consulta e entendimento.
* **NÃO MODIFIQUE O CÓDIGO LEGADO.**
* **TODO O NOVO CÓDIGO DEVE SER ESCRITO EM `src_refactored/`.**
* Se você encontrar um VO, entidade, ou função utilitária no código legado que seja de alta qualidade e se alinhe PERFEITAMENTE com os novos princípios (Clean Arch, OC), você pode adaptá-lo para `src_refactored/`. No entanto, a **reescrita é a norma**.

## 7. Gerenciamento de Tarefas e Ciclo de Trabalho do Agente

O trabalho neste projeto é rastreado através de um sistema de tarefas localizado em `/.jules/`.

* **Arquivo de Índice Principal (`/.jules/TASKS.md`):**
  * Contém uma tabela de alto nível de todas as tarefas, com status, dependências, prioridade e um link para o arquivo de detalhe da tarefa.
  * Use para visão geral do backlog e identificar a próxima tarefa.
* **Arquivos de Detalhes da Tarefa (`/.jules/tasks/TSK-[ID_DA_TAREFA].md`):**
  * Cada tarefa no índice tem um arquivo Markdown correspondente em `/.jules/tasks/`, nomeado `TSK-[ID_DA_TAREFA].md`.
  * Utilize o template `/.jules/templates/TASK_DETAIL_TEMPLATE.md` para criar novos arquivos de detalhe.
  * **Este arquivo é a fonte canônica de informação para a tarefa.** Contém descrição completa, critérios de aceitação, notas, comentários, status, link do commit de conclusão, etc.
  * **Leitura Obrigatória:** Sempre consulte e leia integralmente o arquivo de detalhe da tarefa relevante (`/.jules/tasks/TSK-[ID_TAREFA_ATUAL].md`) **antes** de iniciar qualquer trabalho de implementação ou desmembramento.
  * **Atualização Contínua:** Durante a execução da tarefa, adicione notas, decisões de design, ou observações relevantes diretamente neste arquivo (nas seções "Comentários" ou "Notas/Decisões de Design"). Ao concluir a tarefa, atualize seu status final, adicione o link do commit de conclusão e quaisquer notas finais.
* **Criação de Novas Tarefas (Descobertas/Imprevistos):**
  * Se, durante a execução de uma tarefa, você identificar uma necessidade não mapeada, um problema bloqueador que justifique uma sub-tarefa não planejada, ou um desvio significativo de escopo que não se encaixa na tarefa atual:
        1. **PARE** a execução da tarefa atual.
        2. Defina a nova tarefa: atribua um ID único (ex: `NEW-TSK-001` ou `TSK-[ID_PAI]-SUB-X`), título breve, descrição completa, prioridade, e estime sua complexidade.
        3. Crie o arquivo de detalhe para esta nova tarefa em `/.jules/tasks/` usando o template.
        4. Adicione a nova tarefa como uma nova linha no índice `/.jules/TASKS.md`, incluindo o link para seu arquivo de detalhe.
        5. Se aplicável, estabeleça dependências: a nova tarefa pode depender da atual, ou a atual pode passar a depender da nova. Atualize os campos de dependência no `TASKS.md` e nos arquivos de detalhe relevantes.
        6. Comunique a criação desta nova tarefa e seu impacto ao usuário.
        7. Reavalie qual tarefa executar em seguida com base nas prioridades e dependências atualizadas.

* **Seu Ciclo de Trabalho:**
    1. **Fase 1: Sincronização e Análise:**
        * Leia o `/.jules/TASKS.md` (índice) para entender o estado atual.
    2. **Fase 2: Seleção da Próxima Ação:**
        * **Desmembrar Tarefas Complexas:** Priorize tarefas `Pendente` com `Complexidade > 1` (ver arquivo de detalhe).
            * Leia o detalhe da tarefa.
            * **Crie arquivos de detalhe para cada sub-tarefa** em `/.jules/tasks/` usando o template. Preencha todos os campos, incluindo dependência da tarefa-mãe.
            * Atualize o `TASKS.md` (índice): adicione sub-tarefas, marque a mãe como "Bloqueado" ou "Subdividido".
            * Atualize o arquivo de detalhe da tarefa-mãe.
        * **Executar Tarefa Simples:** Se não houver para desmembrar, procure tarefa `Pendente` com `Complexidade = 1` e dependências `Concluído`.
            * **Leia integralmente o arquivo de detalhe da tarefa selecionada (`/.jules/tasks/TSK-[ID].md`) e qualquer outra documentação ou código antes de prosseguir.**
    3. **Fase 3: Execução da Ação:**
        * **Se Desmembrar:** Conforme descrito acima (criação de arquivos de detalhe, atualização do índice e do detalhe da mãe).
        * **Se Executar:**
            * Implemente a tarefa.
            * **Documente continuamente no arquivo de detalhe da tarefa.**
            * **Crie novas tarefas para descobertas/bloqueios conforme descrito na seção "Criação de Novas Tarefas".**
            * Após a conclusão:
                * **Atualize o arquivo de detalhe da tarefa (`/.jules/tasks/TSK-[ID_CONCLUIDA].md`)**: Status para "Concluído", link do commit, notas.
                * **Atualize a linha no índice `/.jules/TASKS.md`**.

Lembre-se, o objetivo é criar uma base de código exemplar e manter um rastreamento de tarefas impecável. Pense cuidadosamente sobre cada decisão de design e implementação. Se algo não estiver claro, peça esclarecimentos.
