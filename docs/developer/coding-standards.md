# Padrões de Código e Diretrizes de Desenvolvimento

Manter um padrão de código consistente e seguir as diretrizes de desenvolvimento é crucial para a qualidade, legibilidade e manutenção do Project Wiz. Este documento consolida os principais padrões de código, estilo, formatação, nomenclatura, e melhores práticas específicas para tecnologias, servindo como fonte única de verdade.

## Princípios Fundamentais

No Project Wiz, seguimos os seguintes princípios de desenvolvimento de software:

*   **DRY (Don't Repeat Yourself):**
    *   **Regra:** Evite duplicação de código. Abstraia lógica comum em funções, classes ou módulos reutilizáveis.
    *   **Porquê:** Reduz a redundância, melhora a manutenibilidade (alterações são feitas em um só lugar), diminui a chance de inconsistências e facilita a compreensão, pois o comportamento é definido uma única vez. Código duplicado é um convite a bugs quando uma cópia é atualizada e a outra não.

*   **KISS (Keep It Simple, Stupid):**
    *   **Regra:** Mantenha as soluções o mais simples possível, mas não mais simples. Evite complexidade desnecessária ou prematura.
    *   **Porquê:** Código simples é mais fácil de entender, testar, depurar e manter. Complexidade acidental aumenta a carga cognitiva e a probabilidade de erros.

*   **YAGNI (You Aren't Gonna Need It):**
    *   **Regra:** Implemente apenas o que é necessário agora, com base nos requisitos atuais. Evite adicionar funcionalidades ou abstrações especulativamente para um futuro incerto.
    *   **Porquê:** Previne o desperdício de esforço em funcionalidades que podem nunca ser usadas, mantém o código mais enxuto e focado, e reduz a complexidade geral do sistema.

*   **Clean Code:**
    *   **Regra:** Escreva código que seja fácil de ler, entender e modificar por qualquer desenvolvedor da equipe (incluindo seu "eu" futuro).
    *   **Porquê:** Código limpo melhora a colaboração, reduz a curva de aprendizado para novos membros, diminui a probabilidade de introdução de bugs durante modificações e torna o desenvolvimento mais eficiente e prazeroso.

*   **SOLID:** Estes princípios de design orientado a objetos ajudam a criar software mais compreensível, flexível e manutenível.
    *   **S**ingle Responsibility Principle (Princípio da Responsabilidade Única):
        *   **Regra:** Uma classe ou módulo deve ter apenas uma razão para mudar, ou seja, deve ter apenas uma responsabilidade ou tarefa.
        *   **Porquê:** Torna as classes mais focadas, coesas, fáceis de entender, testar e menos propensas a efeitos colaterais quando modificadas.
    *   **O**pen/Closed Principle (Princípio Aberto/Fechado):
        *   **Regra:** Entidades de software (classes, módulos, funções) devem ser abertas para extensão, mas fechadas para modificação.
        *   **Porquê:** Permite adicionar novas funcionalidades sem alterar código existente e testado, reduzindo o risco de introduzir bugs em funcionalidades antigas e promovendo a reutilização.
    *   **L**iskov Substitution Principle (Princípio da Substituição de Liskov):
        *   **Regra:** Subtipos devem ser substituíveis por seus tipos base sem alterar a corretude ou o comportamento esperado do programa.
        *   **Porquê:** Garante que a herança (e polimorfismo) seja usada corretamente, mantendo a consistência, a previsibilidade do sistema e a integridade dos contratos estabelecidos pelas classes base.
    *   **I**nterface Segregation Principle (Princípio da Segregação de Interfaces):
        *   **Regra:** Clientes não devem ser forçados a depender de interfaces que não utilizam. Crie interfaces menores, coesas e mais específicas para cada tipo de cliente.
        *   **Porquê:** Evita interfaces "gordas" (fat interfaces) e o acoplamento desnecessário a métodos não utilizados, resultando em um design mais flexível e modular.
    *   **D**ependency Inversion Principle (Princípio da Inversão de Dependência):
        *   **Regra:** Módulos de alto nível não devem depender de módulos de baixo nível; ambos devem depender de abstrações (interfaces, tipos abstratos). Além disso, abstrações não devem depender de detalhes; detalhes devem depender de abstrações.
        *   **Porquê:** Promove baixo acoplamento e alta flexibilidade, facilitando a substituição de implementações, a testabilidade (via mocks) e a evolução independente das diferentes partes do sistema.

*   **Nomenclatura Descritiva:**
    *   **Regra:** Use nomes claros, inequívocos e em **inglês** para variáveis, funções, classes, arquivos e pastas. Os nomes devem transmitir intenção e propósito de forma concisa.
    *   **Porquê:** Melhora drasticamente a legibilidade e reduz o tempo necessário para outros desenvolvedores (ou você mesmo no futuro) entenderem o significado e o papel de cada elemento do código. Nomes bem escolhidos são uma forma primária de documentação.

*   **Falhar Rápido (Fail Fast):**
    *   **Regra:** Detecte erros, entradas inválidas e condições anormais o mais cedo possível no ciclo de vida de uma operação e interrompa a execução ou lance uma exceção imediatamente. Valide pré-condições e pós-condições.
    *   **Porquê:** Previne a propagação de estados inválidos pelo sistema, o que pode levar a erros mais complexos e difíceis de depurar em estágios posteriores. Identificar a origem do problema rapidamente economiza tempo e esforço.

*   **Operações Idempotentes:**
    *   **Regra:** Projete operações (especialmente interações com APIs, manipulação de estado ou tarefas de longa duração) para serem idempotentes quando aplicável. Uma operação idempotente é aquela que, se executada múltiplas vezes com os mesmos parâmetros, produz o mesmo resultado e efeito colateral que teria se fosse executada apenas uma vez.
    *   **Porquê:** Aumenta a robustez e a resiliência do sistema, especialmente em operações de rede ou transações que podem ser reintentadas automaticamente ou manualmente sem causar efeitos indesejados (ex: múltiplas cobranças, duplicação de dados).

*   **Dados Imutáveis:**
    *   **Regra:** Prefira estruturas de dados e objetos imutáveis sempre que possível. Evite modificar objetos ou arrays no local (in-place mutation); em vez disso, crie novas instâncias com os valores atualizados.
    *   **Porquê:** Reduz efeitos colaterais, simplifica o rastreamento de mudanças de estado, melhora a previsibilidade do comportamento do código e facilita o debugging. É especialmente útil em React (para detecção de mudanças) e em programação concorrente ou funcional.
    *   **Exemplo Avançado (TypeScript com `immer` ou `fp-ts` para imutabilidade complexa):**
        ```typescript
        // Usando Readonly para imutabilidade superficial
        type DeepReadonly<T> = { readonly [P in keyof T]: DeepReadonly<T[P]> };
        interface ComplexState {
          user: { id: string; preferences: { theme: string; notifications: boolean } };
          posts: ReadonlyArray<{ id: string; comments: ReadonlyArray<string> }>;
        }
        const initialState: DeepReadonly<ComplexState> = {
          user: { id: "user1", preferences: { theme: "dark", notifications: true } },
          posts: [{ id: "post1", comments: ["comment1", "comment2"] }]
        };

        // Para atualizações complexas, bibliotecas como 'immer' podem ajudar:
        // import produce from 'immer';
        // const nextState = produce(initialState, draftState => {
        //   draftState.user.preferences.theme = "light";
        //   draftState.posts[0].comments.push("newComment");
        // });
        // console.log(initialState.user.preferences.theme); // "dark" (original não modificado)
        // console.log(nextState.user.preferences.theme); // "light"
        ```

*   **Consciência de Performance:**
    *   **Regra:** Considere os impactos de performance das escolhas de algoritmos, estruturas de dados e operações, especialmente em caminhos críticos, loops frequentes ou manipulação de grandes volumes de dados. Otimize quando necessário e justificado por medições (profiling), não por suposições prematuras.
    *   **Porquê:** Garante que a aplicação seja responsiva, eficiente e escale adequadamente, proporcionando uma boa experiência ao usuário e utilizando os recursos do sistema de forma otimizada.

*   **Melhores Práticas de Segurança:**
    *   **Regra:** Esteja atento a vulnerabilidades de segurança em todas as fases do desenvolvimento. Sanitize todas as entradas do usuário, valide dados em ambos frontend e backend, evite codificar informações sensíveis, use HTTPS, implemente controle de acesso adequado e siga as diretrizes OWASP Top 10.
    *   **Porquê:** Protege os dados do usuário, a integridade do sistema e a reputação do projeto contra atividades maliciosas, acessos não autorizados e vazamento de informações.

*   **Refatoração Regular:**
    *   **Regra:** Refatore continuamente o código para melhorar seu design, clareza, simplicidade e manutenibilidade. Aplique a "Boy Scout Rule": deixe o código mais limpo do que você o encontrou. Não adie o débito técnico indefinidamente.
    *   **Porquê:** Mantém o código saudável, adaptável a mudanças futuras, previne o acúmulo de "sujeira" que pode comprometer a produtividade e a qualidade, e facilita a incorporação de novos desenvolvedores.

*   **Evitar Números Mágicos/Strings:**
    *   **Regra:** Substitua números ou strings literais, que aparecem diretamente no código sem explicação, por constantes nomeadas ou enumerações que descrevam seu significado.
    *   **Porquê:** Melhora a legibilidade, pois o nome da constante fornece contexto. Facilita a manutenção, pois o valor pode ser alterado em um único local. Reduz o risco de erros de digitação ao usar o mesmo valor em múltiplos lugares.
    *   **Exemplo Avançado (TypeScript):**
        ```typescript
        // Ruim
        // if (user.status === 3 && user.type === 'premium_plus') { /* ... */ }
        // setTimeout(processData, 3600000);

        // Bom
        enum UserAccountStatus { ACTIVE = 1, INACTIVE = 2, SUSPENDED = 3 }
        enum UserAccountType { BASIC = 'basic', PREMIUM = 'premium', PREMIUM_PLUS = 'premium_plus' }

        const ONE_HOUR_IN_MS = 60 * 60 * 1000;

        // if (user.status === UserAccountStatus.SUSPENDED && user.type === UserAccountType.PREMIUM_PLUS) { /* ... */ }
        // setTimeout(processData, ONE_HOUR_IN_MS);
        ```

*   **Baixo Acoplamento, Alta Coesão:**
    *   **Regra:** Projete módulos, classes e componentes para serem fracamente acoplados (minimizar dependências diretas e conhecimento mútuo entre eles) e altamente coesos (elementos dentro de um módulo/classe/componente são funcionalmente relacionados e focados em um único propósito bem definido).
    *   **Porquê:** Aumenta a modularidade, o que facilita a reutilização, a testabilidade isolada e a manutenção, pois mudanças em um módulo têm menos chance de impactar outros módulos não relacionados diretamente.

*   **Revisões de Código:**
    *   **Regra:** Participe ativamente e conduza revisões de código (Code Reviews) completas e construtivas para todo código novo ou modificado antes de ser integrado à base principal.
    *   **Porquê:** É uma das formas mais eficazes de identificar bugs precocemente, garantir a adesão aos padrões de código, compartilhar conhecimento entre a equipe, melhorar a qualidade geral do design e da implementação, e promover um senso de propriedade coletiva do código. (Ver seção "Diretrizes para Revisão de Código (Code Review)" para mais detalhes).

### Visualização da Clean Architecture

A arquitetura do Project Wiz adota os princípios da Clean Architecture. Para uma discussão detalhada, consulte **[Boas Práticas e Diretrizes de Desenvolvimento Detalhadas](../reference/02-best-practices.md)**. A visualização abaixo ilustra as camadas e a regra de dependência:

```mermaid
graph TD
    A[Frameworks & Drivers] --> B(Adaptadores)
    B --> C(Casos de Uso)
    C --> D(Entidades)

    subgraph "Camada Externa (Frameworks & Drivers Layer)"
        A
    end
    subgraph "Camada de Adaptadores de Interface (Interface Adapters Layer)"
        B
    end
    subgraph "Camada de Aplicação (Application Layer)"
        C
    end
    subgraph "Camada de Domínio (Domain Layer)"
        D
    end
    style D fill:#FAA,stroke:#333,stroke-width:2px
    style C fill:#AFE,stroke:#333,stroke-width:2px
    style B fill:#ADD,stroke:#333,stroke-width:2px
    style A fill:#DAE,stroke:#333,stroke-width:2px
```
*   **Regra de Dependência:** As dependências fluem sempre para dentro. Código em camadas internas não deve saber nada sobre código em camadas externas.

A seção **Princípios de Object Calisthenics (Exemplos Práticos)** mais abaixo neste documento detalha algumas dessas regras com exemplos.

## Padrões de Estilo de Código

### Linguagem Principal: TypeScript

*   **Configuração `strict`:**
    *   **Regra:** Utilizamos a configuração `strict: true` (ou todas as suas flags individuais como `noImplicitAny`, `strictNullChecks`, etc.) ativada no `tsconfig.json`.
    *   **Porquê:** Garante maior segurança de tipo, detectando muitos erros comuns (como referências nulas ou tipos implícitos `any`) em tempo de compilação, resultando em código mais robusto, confiável e fácil de refatorar.
*   **Path Aliases:**
    *   **Regra:** Path aliases como `@/components`, `@/lib`, `@/core` são utilizados para facilitar a importação de módulos.
    *   **Porquê:** Evita caminhos de importação relativos longos e frágeis (ex: `../../../../components/Button`), tornando o código mais limpo, fácil de mover entre diretórios e melhorando a legibilidade das importações.
*   **Tipagem Forte:**
    *   **Regra:** Priorize a tipagem forte; evite `any` sempre que possível. Se `any` for estritamente necessário (ex: interagir com bibliotecas de terceiros sem tipos ou código dinâmico complexo), justifique seu uso com um comentário e restrinja seu escopo ao mínimo. Considere `unknown` como uma alternativa mais segura a `any`.
    *   **Porquê:** `any` desabilita a verificação de tipos do TypeScript para a variável ou expressão específica, anulando os benefícios de segurança de tipo e aumentando o risco de erros em tempo de execução que poderiam ser pegos em compilação. `unknown` força verificações de tipo antes do uso.
*   **Aplicação de Tipos:**
    *   **Regra:** Defina explicitamente tipos para todas as declarações de variáveis, parâmetros de função e valores de retorno de função, a menos que o tipo inferido pelo TypeScript seja óbvio, correto e não prejudique a clareza.
    *   **Porquê:** Melhora a clareza do código, serve como documentação, auxilia na detecção precoce de erros de tipo e facilita o entendimento das estruturas de dados e contratos de função por outros desenvolvedores.
*   **Interface vs. Type:**
    *   **Regra:** Use `interface` para definir a forma de objetos públicos (especialmente aqueles que podem ser estendidos ou implementados por classes) ou quando desejar a capacidade de "declaration merging" (útil para estender interfaces de bibliotecas de terceiros). Use `type` para tipos de união, interseção, tuplas, tipos mapeados, tipos condicionais, ou para nomear tipos primitivos e formas de objeto mais complexas que não necessitam de "declaration merging" ou herança de interface explícita.
    *   **Porquê:** `interface` oferece melhor performance em algumas verificações de tipo e mensagens de erro potencialmente mais claras para estruturas de objeto simples e hierarquias. `type` é mais versátil para construções de tipo mais complexas e operações de tipo. A escolha deve visar clareza e intenção.
    *   **Exemplo Avançado (Type para Mapped Type):**
        ```typescript
        // Interface para descrever uma entidade
        interface Product {
          id: string;
          name: string;
          price: number;
          inStock: boolean;
        }

        // Type para criar um tipo parcial com todos os campos opcionais, útil para updates
        type PartialProductUpdate = Partial<Product>;
        // Resultado: { id?: string; name?: string; price?: number; inStock?: boolean; }

        // Type para criar um tipo onde todas as propriedades são readonly
        type ReadonlyProduct = Readonly<Product>;

        // Type para um DTO que omite certos campos
        type ProductListingDTO = Omit<Product, 'inStock'>;
        ```
*   **Propriedades Readonly:**
    *   **Regra:** Aplique `readonly` a propriedades de interfaces/tipos, a arrays (`ReadonlyArray<T>`) e a tuplas que não devem ser reatribuídos ou modificados após a inicialização da instância que os contém.
    *   **Porquê:** Promove a imutabilidade e a previsibilidade do estado, prevenindo modificações acidentais e tornando mais claro quais dados são fixos e quais podem mudar.
    *   **Exemplo (ReadonlyArray e Tupla):**
        ```typescript
        interface AppConfig {
          readonly adminEmails: ReadonlyArray<string>;
          readonly defaultCoordinates: readonly [number, number]; // Tupla readonly
        }
        const config: AppConfig = {
          adminEmails: ["admin@example.com", "support@example.com"],
          defaultCoordinates: [10.0, 20.5]
        };
        // config.adminEmails.push("new@example.com"); // Erro
        // config.defaultCoordinates[0] = 5.0; // Erro
        ```
*   **Enums vs. Tipos de União Literal:**
    *   **Regra:** Prefira tipos de união literal (ex: `'status-ativo' | 'status-inativo'`) para um conjunto pequeno e fixo de valores literais conhecidos, especialmente strings. Use `enum` do TypeScript (preferencialmente `const enum` para evitar código JavaScript extra) para conjuntos distintos de constantes numéricas relacionadas, quando a interoperabilidade com código legado que usa enums for necessária, ou quando se deseja um objeto iterável no runtime com nomes e valores.
    *   **Porquê:** Tipos de união literal geralmente oferecem melhor tree-shaking, não introduzem um objeto extra no runtime (no caso de `const enum`, são inlined), e podem ser mais fáceis de depurar. `enum`s podem ser mais verbosos e ter algumas armadilhas (como enums numéricos reversos).
*   **Genéricos para Reusabilidade:**
    *   **Regra:** Empregue genéricos (`<T>`) para criar componentes, funções, classes e tipos reutilizáveis que podem operar em uma variedade de tipos de dados enquanto mantêm a segurança de tipo.
    *   **Porquê:** Permite escrever código flexível, abstrato e DRY (Don't Repeat Yourself) sem sacrificar a segurança de tipos, evitando a necessidade de `any` ou duplicação de código para diferentes tipos.
    *   **Exemplo Avançado (Função Genérica com Constraints):**
        ```typescript
        interface Lengthwise {
          length: number;
        }

        // Esta função genérica aceita qualquer tipo T que tenha uma propriedade 'length' do tipo number.
        function logLength<T extends Lengthwise>(arg: T): T {
          console.log(arg.length);
          return arg;
        }

        logLength("hello"); // OK, string tem length
        logLength([1, 2, 3]); // OK, array tem length
        // logLength(123); // Erro: number não tem propriedade length
        logLength({ length: 10, value: "test" }); // OK

        // Exemplo com múltiplas constraints ou classes
        // function createInstance<T extends SomeBaseClass & SomeInterface>(constructor: new () => T): T {
        //   return new constructor();
        // }
        ```
*   **Tratamento de Null e Undefined (`strictNullChecks`):**
    *   **Regra:** Com `strictNullChecks` ativado, trate explicitamente a possibilidade de valores `null` ou `undefined`. Utilize encadeamento opcional (`?.`), coalescência nula (`??`), guardas de tipo (type guards como `typeof x === 'string'` ou `x instanceof MyClass`), asserções de tipo (com cautela, ex: `value!`), ou utilitários como `NonNullable<T>`.
    *   **Porquê:** `strictNullChecks` é uma das funcionalidades mais poderosas do TypeScript para prevenir erros comuns de "cannot read property 'foo' of undefined/null" em tempo de execução. Exige um manejo explícito desses valores, tornando o código mais seguro e robusto.
    *   **Exemplo Avançado (Type Guard e NonNullable):**
        ```typescript
        interface UserProfile { name: string; bio?: string | null; }

        function printUserProfile(profile: UserProfile) {
          console.log(`Name: ${profile.name}`);
          // Usando type guard para refinar o tipo de bio
          if (typeof profile.bio === 'string') {
            console.log(`Bio: ${profile.bio.toUpperCase()}`); // profile.bio é string aqui
          } else {
            console.log("Bio not provided or is null.");
          }
        }
        // Exemplo com NonNullable
        // function getBioOrFail(bio: string | null | undefined): NonNullable<string | null | undefined> /* string */ {
        //   if (bio === null || bio === undefined) throw new Error("Bio is missing!");
        //   return bio;
        // }
        ```
*   **Módulos ESM:**
    *   **Regra:** Sempre prefira a sintaxe de módulo ES (`import`/`export`) em vez de outros sistemas de módulos como CommonJS (`require`/`module.exports`) no código TypeScript.
    *   **Porquê:** É o padrão moderno para módulos JavaScript/TypeScript, suportado nativamente por navegadores e Node.js (em versões recentes), e permite melhor análise estática por ferramentas de build e linters, facilitando otimizações como tree-shaking.
*   **Opções Estritas do Compilador:**
    *   **Regra:** Mantenha todas as opções do compilador relacionadas à `strict` (ou a própria `strict: true`) habilitadas no `tsconfig.json`. Escreva código que seja compatível com essas verificações rigorosas.
    *   **Porquê:** Ajuda a escrever código mais seguro, robusto e de melhor qualidade, pegando uma gama maior de erros potenciais em tempo de compilação antes que se tornem problemas em produção.

### Formatação (Prettier)

*   **Regra:** O projeto utiliza Prettier para garantir consistência na formatação automática do código. As configurações estão definidas em `.prettierrc.js` (ou similar).
    *   Indentação: 2 espaços.
    *   Aspas: Simples (`singleQuote: true`).
    *   Ponto e vírgula: Sempre no final das instruções (`semi: true`).
    *   Outras configurações conforme o arquivo do projeto.
*   **Porquê:** Formatação automática e consistente elimina debates sobre estilo pessoal, garante um visual uniforme em toda a codebase, melhora a legibilidade e permite que os desenvolvedores se concentrem na lógica de negócios em vez de se preocuparem com detalhes de formatação.
*   **Ação:** Recomenda-se configurar seu editor para formatar ao salvar (Format On Save) ou executar o script de formatação (ex: `npm run format`) regularmente.
*   **Consistência na Formatação:**
    *   **Regra:** Adira ao estilo de formatação de código consistente imposto pelo Prettier. Evite desabilitar regras do Prettier ou introduzir formatação manual que divirja do padrão.
    *   **Porquê:** Garante que as diferenças de código (diffs) em revisões e merges reflitam apenas mudanças lógicas, não de estilo pessoal, facilitando a colaboração e a manutenção do histórico.

### Linting (ESLint)

*   **Regra:** ESLint é usado para análise estática de código e para impor padrões de qualidade de código, boas práticas e estilo não cobertos pelo Prettier. A configuração base (`eslint.config.js`) estende-se de presets recomendados e é customizada para as necessidades do projeto.
*   **Porquê:** Ajuda a prevenir erros comuns, identificar anti-padrões, promover consistência no uso de construções da linguagem, e manter a qualidade geral do código, melhorando sua robustez e manutenibilidade a longo prazo.
*   **Ação:** Execute `npm run lint` para verificar o código e `npm run lint:fix` para tentar correções automáticas para as regras que o suportam.
*   **Instrução Crucial:**
        *   **Regra:** Após criar ou modificar um arquivo, **SEMPRE execute o ESLint (`npx eslint path/to/your/file.tsx --fix` ou o script do projeto `npm run lint:fix`) e realize TODOS os ajustes e refatorações necessários para eliminar erros e avisos.** Não prossiga com o commit de código que possua erros de linting.
        *   **Porquê:** Garante que apenas código em conformidade com os padrões de qualidade seja integrado à base principal, mantendo a alta qualidade e prevenindo a introdução de "code smells" ou potenciais bugs.

### Convenções de Nomenclatura

*   **Variáveis, Funções, Classes, Pastas:**
    *   **Regra:** Use nomes claros, descritivos, autoexplicativos e em **inglês** para todas as construções de código.
        *   Variáveis e funções: `camelCase` (e.g., `currentUser`, `calculateTotalPrice`).
        *   Classes, Interfaces, Tipos, Enums: `PascalCase` (e.g., `UserService`, `IOrderRepository`, `PaymentStatus`).
        *   Constantes (valores fixos e imutáveis): `UPPER_SNAKE_CASE` (e.g., `MAX_RETRIES`, `DEFAULT_TIMEOUT_MS`).
    *   **Porquê:** Inglês é a língua universal no desenvolvimento de software, facilitando a colaboração. Nomes descritivos e consistentes com as convenções de casing melhoram drasticamente a legibilidade, reduzem ambiguidades e o tempo necessário para entender o código.
*   **Pastas:**
    *   **Regra:** Devem ser nomeadas em inglês e, para este projeto, **prioritariamente em `kebab-case`** (ex: `user-authentication`, `data-processing`), a menos que uma convenção específica de um framework ou ferramenta exija outro padrão (ex: componentes React podem estar em pastas `PascalCase` se essa for a convenção do projeto para componentes).
    *   **Porquê:** Consistência na nomeação de pastas melhora a navegabilidade do projeto e `kebab-case` é comum em muitos ecossistemas web para nomes de diretórios.

### Convenções de Nomenclatura de Arquivos

*   **Regra:** **Todos os nomes de arquivos devem estar em kebab-case** (e.g., `user-profile.component.ts`, `data-fetcher.service.ts`, `auth-constants.ts`).
    *   **Porquê:** `kebab-case` é fácil de ler em nomes de arquivo, é URL-friendly (embora menos relevante para arquivos de código-fonte), e evita problemas de sensibilidade de caixa em diferentes sistemas operacionais, garantindo consistência entre ambientes de desenvolvimento.
*   **Aplicabilidade:** Esta regra se aplica a todos os tipos de arquivo criados dentro do projeto (.ts, .tsx, .md, .json, etc.).
*   **Exceções Justificáveis:**
    *   Frameworks ou bibliotecas que exigem explicitamente uma convenção diferente (e.g., roteamento de páginas Next.js como `page.tsx` ou `layout.tsx` dentro de diretórios específicos).
    *   Arquivos de configuração com nomes padronizados pela comunidade ou ferramentas (e.g., `vite.config.ts`, `tailwind.config.ts`, `README.md`, `Dockerfile`, `Procfile`).
    *   Arquivos de definição de tipo globais ou de bibliotecas de terceiros que seguem suas próprias convenções (ex: `custom.d.ts`).
    *   **Importante:** Tais exceções devem ser limitadas e, se não forem universalmente reconhecidas, justificadas internamente ou documentadas se necessário.
*   **Exemplos:**
    *   **Bom:** `user-service.ts`, `invoice-generator.util.ts`, `use-auth-session.hook.tsx`, `api-error.model.ts`, `contributing-guide.md`
    *   **Ruim:** `UserService.ts`, `InvoiceGenerator.util.ts`, `useAuthSession.tsx`, `ApiErrorModel.ts`, `ContributingGuide.md`
    *   **Exceções Aceitáveis:** `vite.config.ts`, `next.config.js`, `src/app/admin/users/[userId]/page.tsx` (Next.js), `src/components/Button/Button.stories.tsx` (Storybook convention), `jest.setup.ts`

### Controle de Versão (Git)

*   **Commits Atômicos:**
    *   **Regra:** Faça commits pequenos e atômicos, representando uma única mudança lógica ou funcional. Evite commits gigantescos que misturam várias alterações não relacionadas.
    *   **Porquê:** Facilita a revisão do código (Pull Requests menores são mais fáceis de revisar), o rastreamento de alterações (`git blame`), a reversão de mudanças problemáticas (`git revert`), a depuração com `git bisect`, e a compreensão do histórico do projeto.
*   **Mensagens de Commit em Inglês:**
    *   **Regra:** Escreva todas as mensagens de commit em inglês.
    *   **Porquê:** Consistência com a nomeação do código e das variáveis, e facilita a colaboração em um contexto potencialmente internacional.

*   **Escrevendo Boas Mensagens de Commit:**
    *   **Padrão:** Siga o padrão de [Commits Semânticos (Semantic Commits)](https://www.conventionalcommits.org/).
        *   **Porquê:** Cria um histórico de commits mais legível, significativo e estruturado. Permite a automação de changelogs, facilita o versionamento semântico (SemVer) e melhora a comunicação sobre a natureza das mudanças.
        *   **Tipos Comuns e Seus Significados:**
            *   `feat:` (nova funcionalidade para o usuário, não uma nova funcionalidade para o script de build)
            *   `fix:` (correção de bug para o usuário, não uma correção de bug no script de build)
            *   `docs:` (mudanças na documentação, como README, guias, etc.)
            *   `style:` (formatação, ponto e vírgula faltando, etc.; nenhuma mudança na lógica do código)
            *   `refactor:` (refatoração de código de produção, ex.: renomear uma variável, sem alterar comportamento externo)
            *   `test:` (adição ou correção de testes; nenhuma mudança no código de produção)
            *   `chore:` (atualização de tarefas de build, configuração de pacotes, etc.; nenhuma mudança no código de produção)
            *   `perf:` (mudanças de código que melhoram a performance)
            *   `ci:` (mudanças nos arquivos e scripts de configuração de CI/CD)
            *   `build:` (mudanças que afetam o sistema de build ou dependências externas, ex: Gulp, Webpack, NPM)
            *   `revert:` (reverte um commit anterior)
    *   **Estrutura:**
        1.  **Linha de Resumo (Subject):** `tipo(escopo_opcional): descrição_curta_imperativa`
            *   Curta (idealmente 50 caracteres, máximo 72).
            *   Escrita no imperativo presente (e.g., "Add feature" não "Added feature" ou "Adds feature").
            *   Escopo opcional entre parênteses para indicar a parte do código afetada (e.g., `feat(auth): ...`, `fix(payment-gateway): ...`).
            *   Não termine com ponto final.
        2.  **Corpo (Body - Opcional):**
            *   Separado do resumo por uma linha em branco.
            *   Explica o *contexto*, o *quê* e o *porquê* da mudança em mais detalhes. Pode ter múltiplos parágrafos.
            *   Mantenha as linhas com no máximo 72-80 caracteres para melhor legibilidade em diferentes ferramentas Git.
        3.  **Rodapé (Footer - Opcional):**
            *   Separado do corpo por uma linha em branco.
            *   Para informações de "Breaking Changes" (mudanças que quebram a compatibilidade): `BREAKING CHANGE: descrição da mudança e instruções de migração.`
            *   Para referenciar issues (ex: `Closes #123`, `Fixes #456`).
    *   **Exemplos Detalhados:**

        | Tipo de Commit | Exemplo Bom                                                                 | Exemplo Ruim                               |
        | -------------- | --------------------------------------------------------------------------- | ------------------------------------------ |
        | `feat`         | `feat(profile): Permite upload de avatar do usuário`                         | `Adicionado upload`                        |
        |                | `Implementa a funcionalidade de upload de avatar na página de perfil.`<br>`Inclui validação de tipo e tamanho de imagem.` |                                            |
        | `fix`          | `fix(auth): Corrige redirecionamento após login com token expirado`          | `Bug no login`                             |
        |                | `O token de acesso não estava sendo renovado corretamente,` <br> `causando falha no redirecionamento. Agora o refresh token é usado.` | `corrigi o problema do token`              |
        | `docs`         | `docs(api): Adiciona documentação para o endpoint de usuários`               | `Atualizei a documentação`                 |
        | `style`        | `style(components): Aplica formatação do Prettier em UserCard`              | `prettier`                                 |
        | `refactor`     | `refactor(services): Extrai lógica de cálculo de imposto para TaxService`    | `Melhorias no código`                      |
        | `test`         | `test(auth): Adiciona testes de integração para fluxo de registro`          | `Testes`                                   |
        | `chore`        | `chore: Atualiza dependência do ESLint para v8.50.0`                       | `Update deps`                              |
        | `perf`         | `perf(list): Otimiza renderização de lista virtualizada para grandes datasets` | `Melhora performance da lista`             |
        | `ci`           | `ci(deploy): Ajusta script de deploy para novo ambiente de staging`          | `Ajuste CI`                                |
        | `build`        | `build: Configura tree-shaking para reduzir bundle final`                   | `Build`                                    |
        | `revert`       | `revert: feat(profile): Remove funcionalidade de upload de avatar`           | `Revertendo último commit`                 |
        |                | `Este commit reverte o commit abc123xyz.`                                   |                                            |


*   **Disciplina de Controle de Versão:**
    *   **Regra:** Gerencie dependências do projeto explicitamente (ex: `package.json` e `package-lock.json`). Mantenha as dependências atualizadas (avaliando o impacto de cada atualização) e monitore vulnerabilidades conhecidas (ex: usando `npm audit`).
    *   **Porquê:** Garante a reprodutibilidade do build, a segurança do projeto contra vulnerabilidades em dependências e facilita a colaboração ao manter todos os desenvolvedores em um conjunto consistente de dependências.

### Comentários

*   **Evitar Comentários Desnecessários:**
    *   **Regra:** Evite comentários o máximo possível. O código deve ser autoexplicativo através de boa nomenclatura, estrutura clara e design expressivo.
    *   **Porquê:** Comentários tendem a ficar desatualizados à medida que o código evolui, tornando-se enganosos ou irrelevantes. Código claro não precisa de comentários para explicar o que faz. Comentários que parafraseiam o código são redundantes.
*   **Comentários Necessários (O "Porquê" e o "Trade-off"):**
    *   **Regra:** Se um comentário for *absolutamente necessário*, ele deve explicar o *porquê* de uma decisão de design particular, as consequências de uma otimização, um workaround para um problema conhecido de uma biblioteca externa, ou a razão de uma lógica de negócios complexa que não pode ser simplificada mais sem perder clareza. Não comente o *o quê* o código faz.
    *   **Porquê:** O "o quê" o código faz deve ser óbvio pela leitura do próprio código. O "porquê" ou o contexto de decisões não óbvias são informações valiosas que o código por si só não pode transmitir.
*   **Idioma dos Comentários:**
    *   **Regra:** Escreva todos os comentários (quando necessários) em inglês.
    *   **Porquê:** Consistência com o restante do código e mensagens de commit, e facilita a colaboração e compreensão por uma audiência global de desenvolvedores.
*   **Não Comentar Código:**
    *   **Regra:** Não use comentários para desabilitar ou "comentar" blocos de código. Se o código não é necessário, remova-o. Se for experimental ou para referência futura, use branches do Git ou outras ferramentas.
    *   **Porquê:** O controle de versão (Git) é a ferramenta apropriada para manter o histórico das versões anteriores e gerenciar diferentes linhas de desenvolvimento. Código comentado polui a codebase, dificulta a leitura e pode ser confundido com código ativo.
*   **Sem Comentários de Metadados Supérfluos:**
    *   **Regra:** Não inclua comentários no início de um arquivo indicando seu caminho, autor, data de criação/modificação, ou no final de um arquivo indicando `[fim do arquivo]`.
    *   **Porquê:** Estas informações são fornecidas e gerenciadas de forma mais eficaz pelo sistema de controle de versão (Git) e pelo IDE. Tais comentários adicionam ruído visual e se tornam rapidamente desatualizados.
*   **Sem Comentários de Log de Mudanças no Código:**
    *   **Regra:** REMOVA TODOS OS COMENTÁRIOS EXPLICATIVOS PARA MODIFICAÇÕES DE CÓDIGO (e.g., `'// Corrigido bug X em DD/MM/AAAA por Fulano'`, `'// Adicionada feature Y'`).
    *   **Porquê:** O histórico do Git (`git blame`, `git log`, mensagens de commit semânticas) serve a esse propósito de forma muito mais eficaz e organizada. Comentários de log no código poluem e se tornam obsoletos.
*   **Priorize Clareza Sobre Comentários:**
    *   **Regra:** Em vez de adicionar um comentário para explicar uma seção confusa ou complexa do código, dedique tempo para refatorá-la até que se torne autoexplicativa. Use nomes melhores, divida funções/métodos, simplifique a lógica.
    *   **Porquê:** Código claro é inerentemente mais fácil de manter, entender e depurar do que código complexo com explicações adicionais. O esforço para tornar o código autoexplicativo compensa a longo prazo.

## Convenções de Estrutura de Diretórios

Manter uma estrutura de diretórios consistente facilita a navegação, a localização de código e a compreensão da arquitetura do projeto. A estrutura de diretórios do Project Wiz é baseada nos princípios da Clean Architecture e em convenções comuns para aplicações frontend modernas. Consulte `docs/reference/01-software-architecture.md` para detalhes arquiteturais completos.

**Porquê:** Uma estrutura bem definida acelera o desenvolvimento, pois os desenvolvedores sabem onde encontrar ou colocar diferentes tipos de arquivos, reforça a separação de responsabilidades arquiteturais, e facilita a integração de novos membros à equipe.

### Backend (`src_refactored/`)

A estrutura do backend segue as camadas da Clean Architecture, promovendo separação de responsabilidades e testabilidade:

*   `core/`: Coração da aplicação, contendo a lógica de negócios pura, independente de frameworks ou detalhes de infraestrutura.
    *   `domain/`: Define as entidades de negócio, objetos de valor, regras de domínio intrínsecas e as interfaces dos repositórios (contratos de persistência). É o núcleo mais interno e estável.
        *   **Porquê:** Isola a lógica de negócio fundamental de preocupações externas, tornando-a reutilizável e testável independentemente de UI, banco de dados, etc.
        *   **Exemplo:** `user.entity.ts`, `job-status.vo.ts`, `i-project.repository.ts`
    *   `application/`: Orquestra os casos de uso da aplicação. Contém serviços de aplicação, DTOs (Data Transfer Objects) para comunicação entre camadas, e as interfaces (portas) para serviços externos que a aplicação necessita (ex: gateways de notificação, sistemas de arquivos).
        *   **Porquê:** Define o que a aplicação pode fazer e como os dados fluem para executar essas operações, conectando o domínio à infraestrutura através de abstrações.
        *   **Exemplo:** `create-user.use-case.ts`, `project.service.ts`, `i-notification.gateway.ts`
*   `infrastructure/`: Implementações concretas de componentes externos e detalhes técnicos.
    *   `persistence/`: Implementações dos repositórios definidos no domínio (e.g., usando Drizzle ORM para interagir com SQLite).
        *   **Porquê:** Abstrai os detalhes de como os dados são armazenados e recuperados, permitindo trocar a tecnologia de persistência sem impactar o core da aplicação.
        *   **Exemplo:** `drizzle-user.repository.ts`
    *   `adapters/`: Adaptadores para serviços externos (LLMs, APIs de terceiros), implementações de gateways, e outros componentes que traduzem dados entre o formato da aplicação e o formato de sistemas externos.
        *   **Porquê:** Isola a aplicação das particularidades de ferramentas e serviços externos.
        *   **Exemplo:** `openai-llm.adapter.ts`, `bullmq-job.queue.ts`
    *   `electron/`: Código específico do processo principal do Electron (configuração de IPC, ciclo de vida da aplicação, gerenciamento de janelas).
        *   **Porquê:** Concentra a lógica relacionada ao ambiente desktop Electron.
    *   `frameworks/`: Configurações e código de "cola" (glue code) para frameworks específicos (ex: configuração de um servidor HTTP se houver um).
        *   **Porquê:** Mantém o código específico de framework separado da lógica de aplicação.
    *   `ioc/`: Configuração de Injeção de Dependência (ex: usando InversifyJS) para montar a aplicação, conectando abstrações às suas implementações concretas.
        *   **Porquê:** Facilita o baixo acoplamento e a testabilidade, permitindo que as dependências sejam injetadas em vez de serem codificadas diretamente.
*   `presentation/`: Camada responsável pela interação com o usuário ou outros sistemas (frequentemente considerada parte da infraestrutura na Clean Architecture).
    *   `electron/`: (Pode ser subdividido em `main/` e `preload/` scripts).
    *   `ui/`: Contém a aplicação frontend React. (Ver detalhes abaixo).
*   `shared/`: Código utilitário, tipos comuns, ou lógica que precisa ser compartilhada entre diferentes camadas (usar com cautela para não violar as regras de dependência da Clean Architecture – idealmente, o core não deve depender do shared se o shared tiver dependências de infraestrutura).
    *   **Porquê:** Evita duplicação de código para funcionalidades transversais como logging, tratamento de resultados, etc.
    *   **Exemplo:** `result.ts` (para encapsular sucesso/falha de operações), `logger.interface.ts`

### Frontend (`src_refactored/presentation/ui/`)

A interface do usuário (UI) é uma SPA React organizada para clareza, escalabilidade e Developer Experience (DX). A estrutura visa agrupar arquivos por funcionalidade (feature-sliced) e por tipo.
**Porquê Geral da Estrutura Frontend:** Esta organização visa facilitar a localização do código, promover a reutilização de componentes, isolar funcionalidades para melhor manutenção, e alinhar-se com as práticas modernas de desenvolvimento React para projetos de médio a grande porte.

```mermaid
graph LR
    subgraph "src_refactored/presentation/ui/"
        A[index.html]
        B[main.tsx]
        C[assets/]
        D[components/]
        E[config/]
        F[features/]
        G[hooks/]
        H[lib/]
        I[services/]
        J[store/]
        K[styles/]
        L[types/]
        M[routeTree.gen.ts]

        D --- D1[common/]
        D --- D2[layout/]
        D --- D3[ui/ (shadcn)]
        F --- F1[feature-A/]
        F --- F2[feature-B/]
        F1 --- F1a[components/]
        F1 --- F1b[hooks/]
        F1 --- F1c[pages/]
    end
```

*   **Raiz (`index.html`, `main.tsx`):** Ponto de entrada da aplicação React. `main.tsx` configura providers globais (tema, query client, router).
    *   **Porquê:** Padrão para aplicações Vite/React, centralizando a inicialização da aplicação e contextos globais.
*   `assets/`: Recursos estáticos como imagens, fontes, etc.
    *   **Porquê:** Localização padrão para arquivos que são servidos diretamente ou importados pelo sistema de build.
*   `components/`: Componentes React reutilizáveis em toda a aplicação.
    *   `common/`: Componentes UI genéricos, pequenos e altamente reutilizáveis, sem lógica de negócio específica (ex: `LoadingSpinner`, `ErrorFallback`, `PageTitle`, `CustomButton`).
        *   **Porquê:** Promove máxima reutilização, consistência visual para elementos básicos e evita duplicação de componentes de UI simples.
    *   `layout/`: Componentes responsáveis pela estrutura visual principal das páginas e seções da aplicação (ex: `AppShell` para o container principal, `MainSidebar`, `ContextSidebar` para barras laterais contextuais, `PageHeader`).
        *   **Porquê:** Separa a estrutura geral da aplicação (o "esqueleto") do conteúdo específico das páginas/features, facilitando mudanças globais de layout.
    *   `ui/`: Componentes base da biblioteca de UI (e.g., Shadcn/UI como `button.tsx`, `card.tsx`, `dialog.tsx`). Geralmente adicionados via CLI e podem ser customizados.
        *   **Porquê:** Mantém os componentes da biblioteca de UI externa organizados e permite fácil customização ou extensão sem modificar diretamente o código da biblioteca.
*   `config/`: Centraliza configurações principais da UI (instâncias de router, query client, configuração de i18n).
    *   **Porquê:** Facilita encontrar e modificar configurações globais da aplicação frontend, como comportamento de rotas ou cache de dados.
*   `features/<nome-da-feature>/`: Agrupamento modular por funcionalidade de negócio (ex: `auth`, `project-dashboard`, `chat-module`). Esta é uma abordagem chave para escalabilidade e organização.
    *   `components/`: Componentes React reutilizáveis *exclusivamente* dentro desta feature.
    *   `hooks/`: Hooks React contendo lógica de UI, estado e efeitos colaterais específicos da feature.
    *   `pages/` ou `views/`: Componentes de página completos que são os pontos de entrada para as rotas da feature (ex: `ProjectListPage.tsx`, `AuthPage.tsx`).
    *   `services/` (opcional): Funções encapsulando chamadas IPC ou lógica de busca de dados específica da feature.
    *   `types/` (opcional): Definições de tipo TypeScript específicas desta feature.
    *   `index.ts` (opcional): Ponto de entrada para exportar elementos públicos da feature (componentes, hooks, tipos), facilitando importações em outras partes da aplicação.
    *   **Porquê (Feature-Sliced Design):** Promove alta coesão (tudo relacionado a uma feature está agrupado) e baixo acoplamento (features são mais independentes umas das outras). Facilita o desenvolvimento paralelo por diferentes equipes, a manutenção (mudanças em uma feature têm menos chance de quebrar outra) e a eventual remoção ou alteração significativa de features.
*   `hooks/`: Contém hooks React globais, utilitários e reutilizáveis através de múltiplas features (ex: `useDebounce`, `useLocalStorage`, `useAppTheme`).
    *   **Porquê:** Permite reutilizar lógica de UI comum que não é específica de uma única feature, evitando duplicação.
*   `lib/`: Utilitários JavaScript/TypeScript puros (não-React) que podem ser usados em qualquer parte do frontend (ex: `cn` para classnames, utilitários de data, formatação de strings, helpers de validação).
    *   **Porquê:** Separa lógica puramente funcional e utilitária do código React (componentes, hooks), tornando-os mais fáceis de testar e reutilizar em contextos não-React se necessário.
*   `services/`: Define a camada de abstração para comunicação com o backend (Electron main process via IPC ou APIs HTTP). Contém funções que encapsulam chamadas, tratam dados e erros de comunicação.
    *   **Porquê:** Decoupla a lógica da UI e dos componentes dos detalhes da comunicação com o backend. Isso facilita a manutenção, a testabilidade (mockando a camada de serviço) e a potencial troca de implementações de transporte (ex: de IPC para HTTP) no futuro.
*   `store/`: Para gerenciamento de estado global do cliente que não é estado de servidor (o qual é geralmente gerenciado por bibliotecas como TanStack Query). Pode usar Zustand, Jotai, ou React Context API para estados mais simples.
    *   **Porquê:** Centraliza o estado que precisa ser acessado e modificado por múltiplas partes não relacionadas da árvore de componentes, evitando prop drilling excessivo e complexidade na sincronização de estado.
*   `styles/`: Arquivos de estilo globais (ex: `globals.css` com importações do Tailwind CSS, variáveis de tema CSS globais, reset/normalize CSS).
    *   **Porquê:** Local padrão para estilos que afetam toda a aplicação ou definem a base visual.
*   `types/`: Definições de tipo TypeScript globais para o frontend, usáveis através de múltiplas features ou componentes (ex: tipos para objetos de usuário, temas, configurações globais da UI).
    *   **Porquê:** Centraliza tipos que são comuns a várias partes da UI, evitando duplicação e facilitando a manutenção.
*   `routeTree.gen.ts`: Arquivo gerado automaticamente pelo TanStack Router Vite plugin, contendo a árvore de rotas da aplicação baseada na estrutura de arquivos em `features/**/pages/`.
    *   **Porquê:** Facilita o roteamento type-safe e a organização de rotas baseada em convenções de arquivos, reduzindo a necessidade de configuração manual de rotas.

## Princípios de Object Calisthenics (Exemplos Práticos)

Object Calisthenics são um conjunto de 9 regras que ajudam a escrever código orientado a objetos melhor e mais limpo. Eles promovem baixo acoplamento, alta coesão e melhor encapsulamento. Consulte `../reference/02-best-practices.md` para a lista completa. Abaixo, exemplos práticos para algumas regras chave:

| Regra                                      | Impacto Principal                                                                 |
| ------------------------------------------ | --------------------------------------------------------------------------------- |
| Um Nível de Indentação por Método          | Métodos menores, mais focados, legibilidade aumentada.                             |
| Não Use a Palavra-Chave ELSE               | Fluxo de controle mais linear, complexidade ciclomática reduzida.                   |
| Envolva Todas as Primitivas e Strings      | Código mais expressivo, validação centralizada, redução de "Primitive Obsession".   |
| Um Ponto Por Linha (Lei de Demeter)        | Redução de acoplamento, melhor encapsulamento.                                     |
| Mantenha Todas as Entidades Pequenas         | Maior coesão, melhor SRP, facilidade de entendimento e teste.                     |
| Sem Classes Com Mais de Duas Vars. de Inst. | Força alta coesão e SRP, pode levar à descoberta de novos conceitos de domínio.    |

### 1. Um Nível de Indentação por Método

*   **Regra:** Mantenha apenas um nível de indentação (bloco de código aninhado) dentro de um método.
*   **Porquê:** Força a criação de métodos menores e mais focados, extraindo lógica aninhada para métodos privados ou funções auxiliares. Isso melhora drasticamente a legibilidade e facilita o entendimento do fluxo de cada método.
*   **Antes:**
    ```typescript
    class ReportGenerator {
      public generate(items: ReportItem[], format: ReportFormat, user: User) {
        if (items && items.length > 0) { // Nível 1
          if (user.hasPermission(Permissions.GENERATE_REPORT)) { // Nível 2
            let reportContent = "";
            for (const item of items) { // Nível 3
              if (item.isActive) { // Nível 4
                reportContent += `${item.name}: ${item.value}\n`;
              }
            }
            if (format === ReportFormat.PDF) { // Nível 3
              // ... lógica para PDF ...
              console.log("Generating PDF report with content:", reportContent);
            } else {
              // ... lógica para CSV ...
              console.log("Generating CSV report with content:", reportContent);
            }
            return true;
          } else {
            console.error("User does not have permission."); return false;
          }
        } else {
          console.warn("No items to report."); return false;
        }
      }
    }
    ```
*   **Depois:**
    ```typescript
    class ReportGenerator {
      private generateReportContent(items: ReportItem[]): string {
        let content = "";
        for (const item of items) { // Nível 1 (dentro do novo método)
          if (item.isActive) { // Nível 2, mas extraído para outro método se complexo
            content += this.formatItem(item);
          }
        }
        return content;
      }

      private formatItem(item: ReportItem): string {
        return `${item.name}: ${item.value}\n`; // Nível 1
      }

      private saveReport(content: string, format: ReportFormat): void {
        if (format === ReportFormat.PDF) { // Nível 1
          console.log("Generating PDF report with content:", content);
          // ... lógica para PDF ...
          return;
        }
        console.log("Generating CSV report with content:", content);
        // ... lógica para CSV ...
      }

      public generate(items: ReportItem[], format: ReportFormat, user: User): boolean {
        if (!items || items.length === 0) { // Nível 1 (Guard Clause)
          console.warn("No items to report.");
          return false;
        }
        if (!user.hasPermission(Permissions.GENERATE_REPORT)) { // Nível 1 (Guard Clause)
          console.error("User does not have permission.");
          return false;
        }
        const reportContent = this.generateReportContent(items);
        this.saveReport(reportContent, format);
        return true;
      }
    }
    ```

### 2. Não Use a Palavra-Chave ELSE

*   **Regra:** Evite o uso da palavra-chave `else`. Use retornos antecipados (guard clauses) ou polimorfismo, ou padrões de projeto como State ou Strategy.
*   **Porquê:** Reduz o aninhamento, a complexidade ciclomática e torna o fluxo de controle do método mais claro, linear e fácil de seguir, pois o "caminho feliz" não é interrompido por blocos `else`.
*   **Antes:**
    ```typescript
    function processPayment(amount: number, method: PaymentMethod, user: User) {
      if (user.isBlocked) {
        return { success: false, error: "User is blocked" };
      } else {
        if (method === PaymentMethod.CREDIT_CARD) {
          if (amount > user.creditLimit) {
            return { success: false, error: "Exceeds credit limit" };
          } else {
            // Process credit card payment
            return { success: true, transactionId: "cc_123" };
          }
        } else if (method === PaymentMethod.PAYPAL) {
          // Process PayPal payment
          return { success: true, transactionId: "pp_456" };
        } else {
          return { success: false, error: "Unsupported payment method" };
        }
      }
    }
    ```
*   **Depois (com Guard Clauses):**
    ```typescript
    function processPayment(amount: number, method: PaymentMethod, user: User) {
      if (user.isBlocked) {
        return { success: false, error: "User is blocked" };
      }
      if (method === PaymentMethod.CREDIT_CARD) {
        if (amount > user.creditLimit) {
          return { success: false, error: "Exceeds credit limit" };
        }
        // Process credit card payment
        return { success: true, transactionId: "cc_123" };
      }
      if (method === PaymentMethod.PAYPAL) {
        // Process PayPal payment
        return { success: true, transactionId: "pp_456" };
      }
      return { success: false, error: "Unsupported payment method" };
    }
    ```

### 3. Envolva Todas as Primitivas e Strings (Wrap All Primitives and Strings)

*   **Regra:** Se um tipo primitivo (string, número, booleano) ou uma string literal tiver significado de domínio, regras de validação, restrições de formato ou comportamento associado, encapsule-o em uma classe ou tipo específico (Objeto de Valor - Value Object).
*   **Porquê:** Evita "Obsessão por Primitivas" (Primitive Obsession). Dá significado semântico aos dados, centraliza a lógica de validação e comportamento relacionado àquele dado específico, torna o código mais expressivo, type-safe e reduz a chance de erros por uso incorreto de primitivas.
*   **Antes:**
    ```typescript
    function createUser(email: string, age: number, postalCode: string): User {
      if (!email.includes('@') || email.length < 5) {
        throw new Error("Invalid email format.");
      }
      if (age < 18) {
        throw new Error("User must be at least 18 years old.");
      }
      if (!/^\d{5}-\d{3}$/.test(postalCode)) { // Ex: CEP brasileiro
        throw new Error("Invalid postal code format.");
      }
      return new User(email, age, postalCode);
    }
    ```
*   **Depois:**
    ```typescript
    class Email {
      readonly value: string;
      constructor(email: string) {
        if (!email.includes('@') || email.length < 5) { // Validação interna
          throw new Error(`Invalid email format: ${email}`);
        }
        this.value = email;
      }
      get domain(): string { return this.value.split('@')[1]; }
    }

    class Age {
      readonly value: number;
      constructor(age: number) {
        if (age < 18) { // Validação interna
          throw new Error("User must be at least 18 years old.");
        }
        this.value = age;
      }
      isAdult(): boolean { return this.value >= 18; }
    }

    class PostalCode {
      readonly value: string;
      private static readonly BRAZILIAN_REGEX = /^\d{5}-\d{3}$/;
      constructor(postalCode: string) {
        if (!PostalCode.BRAZILIAN_REGEX.test(postalCode)) { // Validação interna
          throw new Error(`Invalid postal code format for Brazil: ${postalCode}`);
        }
        this.value = postalCode;
      }
    }

    function createUser(email: Email, age: Age, postalCode: PostalCode): User {
      // A lógica de validação já foi garantida pelos Value Objects
      return new User(email.value, age.value, postalCode.value);
    }
    // Uso:
    // const userEmail = new Email("test@example.com");
    // const userAge = new Age(30);
    // const userPostalCode = new PostalCode("12345-678");
    // const newUser = createUser(userEmail, userAge, userPostalCode);
    ```

### 4. Um Ponto Por Linha (Law of Demeter)

*   **Regra:** Limite o número de "pontos" (acesso a propriedades ou chamadas de método) em uma única linha de código. Evite cadeias longas como `objeto.getA().getB().getC().fazerAlgo()`. Em vez disso, peça ao objeto para fazer algo por você (Tell, Don't Ask) ou introduza variáveis intermediárias se for apenas para melhorar a legibilidade.
*   **Porquê:** Reduz o acoplamento entre classes, pois uma classe não precisa conhecer a estrutura interna de múltiplos outros objetos ("não fale com estranhos"). Melhora o encapsulamento e a manutenibilidade, pois mudanças na estrutura interna de um objeto têm menos probabilidade de quebrar código cliente distante.
*   **Antes (Violação da Lei de Demeter):**
    ```typescript
    class Order {
      customer: Customer;
      // ...
      getShippingLabelInfo(): string {
        // Violação: conhece detalhes de Address e ZipCode
        const city = this.customer.getAddress().getCity();
        const zip = this.customer.getAddress().getZipCode().getCode();
        return `Ship to: ${city}, ${zip}`;
      }
    }
    // Em outro lugar:
    // const label = order.getShippingLabelInfo();
    // const primaryPhoneNumber = order.getCustomer().getContactInfo().getPrimaryPhone().getNumber();
    ```
*   **Depois (Seguindo a Lei de Demeter):**
    ```typescript
    class ZipCode {
      constructor(private code: string) {}
      getCode(): string { return this.code; }
    }
    class Address {
      constructor(private city: string, private zipCode: ZipCode) {}
      getCity(): string { return this.city; }
      getZipCode(): ZipCode { return this.zipCode; }
      // Novo método para atender Order
      getShippingCityAndZip(): { city: string; zip: string } {
        return { city: this.city, zip: this.zipCode.getCode() };
      }
    }
    class ContactInfo {
        // ...
        getPrimaryPhoneNumber(): string { /* ... */ return "123-456"; }
    }
    class Customer {
      constructor(private address: Address, private contactInfo: ContactInfo) {}
      // Novo método para atender Order
      getShippingInfo(): { city: string; zip: string } {
        return this.address.getShippingCityAndZip(); // Delega
      }
      getPrimaryContactNumber(): string {
        return this.contactInfo.getPrimaryPhoneNumber(); // Delega
      }
    }
    class Order {
      constructor(private customer: Customer) {}
      getShippingLabelInfo(): string {
        const shippingData = this.customer.getShippingInfo(); // Apenas um ponto para Customer
        return `Ship to: ${shippingData.city}, ${shippingData.zip}`;
      }
      getCustomerPrimaryPhoneNumber(): string {
          return this.customer.getPrimaryContactNumber(); // Apenas um ponto
      }
    }
    ```
    *Tabela de Impacto:*
    | Benefício da Regra "Um Ponto Por Linha" | Descrição                                                                 |
    | --------------------------------------- | ------------------------------------------------------------------------- |
    | Menor Acoplamento                       | Classes dependem menos da estrutura interna de outras; interagem com "amigos" diretos. |
    | Maior Encapsulamento                    | Detalhes internos dos objetos são mais bem protegidos e gerenciados por eles mesmos. |
    | Melhor Manutenibilidade                 | Mudanças na estrutura de um objeto (ex: `Address`) têm impacto mais localizado. |
    | Código Mais Legível (Tell, Don't Ask)   | Interações com objetos se tornam mais semânticas e focadas no "o quê" o objeto faz, não "como" ele obtém os dados. |

### 5. Mantenha Todas as Entidades Pequenas (Classes e Métodos)

*   **Regra:** Classes devem ser pequenas e coesas (idealmente menos de 100 linhas de código, preferencialmente menos de 50). Métodos devem ser ainda menores e mais focados (idealmente menos de 15 linhas, preferencialmente menos de 5-10).
*   **Porquê:** Classes e métodos pequenos são inerentemente mais fáceis de entender, testar isoladamente e manter. Promovem alta coesão (elementos da classe/método trabalham juntos para um único propósito) e o Princípio da Responsabilidade Única (SRP). Se uma classe ou método está se tornando muito grande, é um forte indicador de que está acumulando responsabilidades demais e precisa ser dividido em unidades menores e mais especializadas.
*   **Antes (Classe Grande, Método Longo - Conceitual):**
    ```typescript
    class UserProfileManager { // Potencialmente >200 linhas
      // ... várias propriedades ...
      constructor(/* ...várias dependências... */) {}

      public displayUserProfile(userId: string): void { // Potencialmente > 50 linhas
        // 1. Buscar dados do usuário (fetch, parsing)
        // 2. Buscar preferências do usuário
        // 3. Buscar histórico de pedidos
        // 4. Formatar dados para exibição
        // 5. Renderizar seção de informações pessoais
        // 6. Renderizar seção de preferências
        // 7. Renderizar histórico de pedidos
        // 8. Lógica de logging
        console.log("Exibindo perfil completo...");
      }
      // ... muitos outros métodos grandes ...
    }
    ```
*   **Depois (Classes Menores, Métodos Curtos - Conceitual):**
    ```typescript
    // interface UserData { /* ... */ }
    // interface UserPreferences { /* ... */ }
    // interface OrderHistory { /* ... */ }

    // class UserDataService { fetch(id: string): UserData { /* ... */ return {} as UserData; } } // < 50 linhas
    // class PreferencesService { fetch(id: string): UserPreferences { /* ... */ return {} as UserPreferences; } } // < 50 linhas
    // class OrderHistoryService { fetch(id: string): OrderHistory { /* ... */ return {} as OrderHistory; } } // < 50 linhas

    // class UserProfileFormatter { // Focado na formatação
    //   formatBasicInfo(data: UserData): FormattedBasicInfo { /* < 15 linhas */ return {} as FormattedBasicInfo; }
    //   formatPreferences(prefs: UserPreferences): FormattedPrefs { /* < 15 linhas */ return {} as FormattedPrefs; }
    //   formatOrderHistory(history: OrderHistory): FormattedHistory { /* < 15 linhas */ return {} as FormattedHistory; }
    // }

    // class UserProfileRenderer { // Focado na renderização
    //   constructor(private formatter: UserProfileFormatter) {}
    //   render(data: UserData, prefs: UserPreferences, history: OrderHistory): void { // < 15 linhas
    //     const basic = this.formatter.formatBasicInfo(data);
    //     const preferences = this.formatter.formatPreferences(prefs);
    //     const orders = this.formatter.formatOrderHistory(history);
    //     this.renderSection("User Info", basic);
    //     this.renderSection("Preferences", preferences);
    //     this.renderSection("Order History", orders);
    //   }
    //   private renderSection(title: string, content: any) { /* < 5 linhas - lógica de renderização real */ }
    // }

    // class UserProfileViewUseCase { // Orquestrador
    //   constructor(
    //     private dataService: UserDataService,
    //     private prefsService: PreferencesService,
    //     private historyService: OrderHistoryService,
    //     private renderer: UserProfileRenderer
    //   ) {}

    //   public async display(userId: string): Promise<void> { // < 15 linhas
    //     const userData = await this.dataService.fetch(userId);
    //     const userPrefs = await this.prefsService.fetch(userId);
    //     const orderHistory = await this.historyService.fetch(userId);
    //     this.renderer.render(userData, userPrefs, orderHistory);
    //     // Logging pode ser um aspecto separado (Aspect-Oriented Programming) ou um decorator
    //   }
    // }
    ```
    *Tabela de Impacto:*
    | Benefício de Entidades Pequenas         | Descrição                                                                 |
    | --------------------------------------- | ------------------------------------------------------------------------- |
    | Alta Coesão e SRP                       | Cada classe/método foca em uma única responsabilidade bem definida.        |
    | Melhor Legibilidade e Compreensão       | Código menor é mais fácil de ler, assimilar e entender o propósito.       |
    | Facilidade de Teste Unitário            | Unidades menores e focadas são significativamente mais fáceis de testar isoladamente. |
    | Manutenção Simplificada e Segura        | Mudanças são localizadas, reduzindo o risco de efeitos colaterais.        |
    | Maior Reutilização Potencial            | Componentes menores e bem definidos tendem a ser mais reutilizáveis em diferentes contextos. |

### 6. Nenhuma Classe Com Mais de Duas Variáveis de Instância

*   **Regra:** Classes não devem ter mais do que duas variáveis de instância (propriedades de classe). Se uma classe parece precisar de mais, é um forte indicador de que essas variáveis podem (e devem) ser agrupadas em um novo objeto de valor ou entidade coesa que representa um conceito de domínio distinto.
*   **Porquê:** Esta é uma das regras mais rigorosas e desafiadoras do Object Calisthenics, mas seu objetivo é forçar um altíssimo nível de coesão nas classes. Muitas variáveis de instância frequentemente indicam que a classe está gerenciando múltiplos conceitos ou responsabilidades. A aplicação desta regra ajuda a descobrir e modelar explicitamente esses conceitos, levando a um design de domínio mais rico e classes menores e mais focadas.
*   **Antes:**
    ```typescript
    class ReportConfig {
      // Potencialmente muitas variáveis de instância para configurar um relatório
      private reportTitle: string;
      private outputFormat: 'PDF' | 'CSV' | 'HTML';
      private includeHeader: boolean;
      private headerText: string; // Só relevante se includeHeader for true
      private includeFooter: boolean;
      private footerText: string; // Só relevante se includeFooter for true
      private dataFilterStartDate: Date;
      private dataFilterEndDate: Date;
      // ... e talvez mais ...

      constructor(title: string, format: 'PDF' | 'CSV' | 'HTML', incHeader: boolean, hText: string, incFooter: boolean, fText: string, startDate: Date, endDate: Date) {
        this.reportTitle = title; this.outputFormat = format;
        this.includeHeader = incHeader; this.headerText = hText;
        // ... etc ...
      }
    }
    ```
*   **Depois:**
    ```typescript
    // Value Objects para conceitos menores
    class ReportTitle { constructor(public readonly value: string) { /* validação */ } }
    enum OutputFormat { PDF = 'PDF', CSV = 'CSV', HTML = 'HTML' }
    class HeaderConfig { // Agrupa configurações do cabeçalho
      constructor(public readonly include: boolean, public readonly text?: string) {
        if (include && !text) throw new Error("Header text required if header is included.");
      }
      static noHeader(): HeaderConfig { return new HeaderConfig(false); }
      static withText(text: string): HeaderConfig { return new HeaderConfig(true, text); }
    }
    class FooterConfig { // Agrupa configurações do rodapé
      constructor(public readonly include: boolean, public readonly text?: string) {
        if (include && !text) throw new Error("Footer text required if footer is included.");
      }
      static noFooter(): FooterConfig { return new FooterConfig(false); }
      static withText(text: string): FooterConfig { return new FooterConfig(true, text); }
    }
    class DateRangeFilter { // Agrupa o filtro de data
      constructor(public readonly startDate: Date, public readonly endDate: Date) {
        if (endDate < startDate) throw new Error("End date must be after start date.");
      }
    }

    // Classe principal agora com menos (ou idealmente duas) variáveis de instância,
    // que são elas mesmas objetos bem definidos.
    // Se ainda tiver mais de duas, pode ser dividida ainda mais.
    // Ex: ReportMetadata (title, format) e ReportStructure (header, footer, dataFilter)
    class ReportMetadata {
        constructor(
            public readonly title: ReportTitle,
            public readonly format: OutputFormat
        ){}
    }
    class ReportLayout { // Exemplo de outra classe com 2 VOs
        constructor(
            public readonly header: HeaderConfig,
            public readonly footer: FooterConfig
        ){}
    }
    // A classe ReportConfig original poderia ser um orquestrador ou builder
    // que usa essas classes menores, ou ser decomposta nelas.
    // Para estritamente 2 variáveis, ReportConfig poderia ser:
    class ReportConfig {
        constructor(
            public readonly metadata: ReportMetadata, // VO 1
            public readonly layout: ReportLayout     // VO 2
            // public readonly dataFilter: DateRangeFilter // Se adicionar esta, já são 3.
                                                      // Talvez layout inclua o dataFilter ou
                                                      // ReportConfig precise ser repensado.
        ){}
    }
    ```
    *Tabela de Impacto:*
    | Benefício de Poucas Variáveis de Instância | Descrição                                                              |
    | ------------------------------------------ | ---------------------------------------------------------------------- |
    | Coesão Máxima e SRP Extremo                | Garante que a classe está focada em um conceito único e altamente coeso. |
    | Descoberta de Conceitos de Domínio         | Ajuda a identificar e modelar explicitamente novos Objetos de Valor ou Entidades que estavam implícitos. |
    | Redução de Complexidade da Classe          | Classes com menos estado interno são geralmente mais simples de entender e testar. |
    | Clareza de Responsabilidade                | Torna o propósito e as responsabilidades da classe extremamente claros. |
    | Facilita a Imutabilidade                   | Classes com poucas dependências de estado são mais fáceis de tornar imutáveis. |

## Validação da Camada de Domínio (Entidades e Objetos de Valor)

*   **Autovalidação:**
    *   **Regra:** Entidades e Objetos de Valor (VOs) na Camada de Domínio (`src_refactored/core/domain/`) são responsáveis por garantir sua própria consistência interna e aderir a invariantes de negócios. Eles devem validar seus dados na criação (construtor ou método de fábrica estático) ou em mudanças significativas de estado.
    *   **Porquê:** Centraliza as regras de negócio e as invariantes nos próprios objetos de domínio, tornando o domínio mais rico, robusto e garantindo que um objeto nunca exista em estado inválido. Isso previne a propagação de dados inválidos pelo sistema.
*   **Zod para Validação de Domínio:**
    *   **Regra:** Zod é a biblioteca padrão para definir esquemas de validação concisos e poderosos dentro da Camada de Domínio. VOs e Entidades devem usar esquemas Zod em seus métodos de fábrica `create` (preferencial) ou construtores para validar dados de entrada. Falhas de validação devem lançar erros específicos do domínio (ex: `ValueError`, `EntityError`), que podem encapsular os detalhes do erro Zod.
    *   **Porquê:** Zod fornece uma forma declarativa, type-safe e poderosa de definir e aplicar validações complexas, com excelente integração com TypeScript para inferência de tipos. Isso mantém as regras de validação próximas aos dados que elas protegem.
*   **Confiança do Caso de Uso na Validação do Domínio:**
    *   **Regra:** Casos de Uso da Camada de Aplicação devem confiar na validação realizada pelos VOs e Entidades para regras de negócio e consistência de dados. Eles podem usar Zod para validar a forma e os tipos de DTOs de entrada (input port), mas a lógica de negócio central e as invariantes são responsabilidade do domínio.
    *   **Porquê:** Evita duplicação de lógica de validação em múltiplas camadas e mantém os casos de uso focados na orquestração de interações com o domínio, não na validação detalhada de regras de negócio que pertencem às entidades.
*   **Benefícios:** Esta abordagem garante que os objetos de domínio sejam sempre consistentes e válidos, reduz a duplicação de código de validação, torna o sistema mais fácil de manter e entender, e aumenta a confiabilidade geral da aplicação.

## Padrão de Resposta e Tratamento de Erros de Caso de Uso

*   **DTO de Resposta Padronizado:**
    *   **Regra:** Todos os Casos de Uso da Camada de Aplicação (`src_refactored/application/use-cases/`) devem retornar um objeto de resposta padronizado, como `IUseCaseResponse<TOutput, TErrorDetails>` (definida em `src_refactored/shared/application/use-case-response.dto.ts`). Este objeto indica sucesso/falha e carrega os dados de saída ou detalhes do erro.
    *   **Porquê:** Cria um contrato consistente e previsível para os consumidores dos casos de uso (e.g., camada de apresentação, controladores de API, outros serviços), simplificando o tratamento de resultados de sucesso e de condições de falha de forma uniforme.
*   **Implementação via `UseCaseWrapper` (Decorator ou Função de Ordem Superior):**
    *   **Regra:** A lógica de `try/catch` para erros genéricos, logging de erros e o mapeamento de exceções (tanto erros de domínio esperados quanto exceções inesperadas) para o DTO de erro padronizado devem ser centralizados, idealmente através de um Decorator (se a sintaxe for suportada e desejada) ou uma função de ordem superior que "envolve" a execução do caso de uso. Casos de uso focam na lógica de negócio e lançam exceções específicas do domínio ou de aplicação em caso de falha.
    *   **Porquê:** Mantém os casos de uso limpos e focados em sua responsabilidade principal (SRP), evita boilerplate de tratamento de erro repetitivo em cada caso de uso (DRY), e garante um tratamento de erro uniforme e consistente em toda a camada de aplicação.
*   **Referência ADR:** ADR-008 ("Padrão de Tratamento de Erros e Resposta para Casos de Uso") detalha este padrão e a hierarquia de erros (`CoreError`).
*   **Benefícios:** Consistência na comunicação de resultados, clareza no tratamento de erros, manutenibilidade melhorada devido à centralização da lógica de erro, e casos de uso mais limpos e focados.

## Melhores Práticas Específicas de Tecnologia/Ferramenta

### Electron.js
*   **Separar Processos Principal e de Renderização:**
    *   **Regra:** Separe estritamente a lógica. O processo principal lida com o ciclo de vida do aplicativo, gerenciamento de janelas e APIs nativas do sistema operacional. Processos de renderização são responsáveis exclusivamente pela interface do usuário (UI) de cada janela. Evite misturar preocupações.
    *   **Porquê:** Melhora a segurança (sandboxing do renderizador, que pode executar código de terceiros se carregar conteúdo web), estabilidade (um crash no renderizador não derruba o processo principal e, consequentemente, a aplicação inteira) e performance (distribuição de carga e responsividade da UI).
*   **Comunicação IPC Segura:**
    *   **Regra:** Use `ipcMain` (no processo principal) e `ipcRenderer` (em scripts de preload) para toda comunicação entre os processos. Defina nomes de canal claros e descritivos. Utilize `contextBridge.exposeInMainWorld` no script de preload para expor APIs do processo principal ao renderizador de forma segura e controlada, em vez de habilitar `nodeIntegration` no renderizador.
    *   **Porquê:** Previne que o código do renderizador acesse APIs Node.js e do Electron diretamente e de forma irrestrita, o que é uma grande vulnerabilidade de segurança. O `contextBridge` garante que apenas as funcionalidades explicitamente expostas estejam disponíveis, mantendo o isolamento de contexto.
*   **Uso do Context Bridge:**
    *   **Regra:** Exponha apenas as funções e objetos estritamente necessários e seguros do processo principal para o renderizador via `contextBridge` no script de preload. Evite expor `ipcRenderer` diretamente, módulos Node.js inteiros (como `fs`, `child_process`), ou objetos complexos com referências internas ao processo principal.
    *   **Porquê:** Garante que apenas as APIs absolutamente necessárias sejam expostas ao renderizador, minimizando a superfície de ataque e reforçando o princípio do menor privilégio para o código que roda no renderizador.
*   **Manuseio de Recursos:**
    *   **Regra:** Gerencie recursos da aplicação (como acesso a arquivos do sistema, conexões de banco de dados, configurações sensíveis) primariamente no processo principal. Processos de renderização devem solicitar acesso ou dados desses recursos via IPC, e o processo principal atua como um gatekeeper.
    *   **Porquê:** Centraliza o gerenciamento de recursos sensíveis ou pesados, melhorando a segurança (renderizador não acessa diretamente), o controle sobre o uso desses recursos, a consistência dos dados e permite que o processo principal gerencie concorrência ou bloqueios se necessário.
*   **Considerações de Performance:**
    *   **Regra:** Otimize o tempo de inicialização da aplicação e o uso de recursos. Carregue módulos preguiçosamente (`Lazy-loading`) quando possível, minimize operações síncronas bloqueantes no processo principal (especialmente durante a inicialização), e gerencie a memória eficientemente, especialmente se a aplicação puder ter múltiplas janelas ou processos de renderização.
    *   **Porquê:** Impacta diretamente a experiência do usuário; uma aplicação desktop responsiva e eficiente, que inicia rapidamente e não consome recursos excessivos, é crucial para a satisfação e retenção do usuário.
*   **Tratamento de Erros e Logging:**
    *   **Regra:** Implemente tratamento de erros robusto em ambos os processos (principal e renderizador). Utilize mecanismos para capturar exceções não tratadas em cada processo. Centralize o logging de erros e eventos importantes para facilitar a depuração e monitoramento (ex: usando um logger que pode escrever para console e/ou arquivo).
    *   **Porquê:** Permite identificar e diagnosticar problemas de forma eficaz, tanto durante o desenvolvimento quanto em produção (se logs forem coletados), melhorando a estabilidade e a capacidade de manutenção da aplicação.
*   **Integração de Módulo Nativo:**
    *   **Regra:** Ao usar módulos Node.js nativos (escritos em C/C++), garanta que sejam corretamente reconstruídos para a versão específica do Node.js usada pelo Electron (usando ferramentas como `electron-rebuild`). Idealmente, mantenha o uso de módulos nativos restrito ao processo principal.
    *   **Porquê:** Módulos nativos precisam ser compilados especificamente para o ambiente Electron para funcionar corretamente. Restringi-los ao processo principal simplifica o processo de build, a distribuição da aplicação e evita potenciais problemas de segurança ou compatibilidade se expostos diretamente ao renderizador.

### React
*   **Componentes Funcionais & Hooks:**
    *   **Regra:** Sempre use componentes funcionais e React Hooks (como `useState`, `useEffect`, `useContext`, `useCallback`, `useMemo`, etc.) para criar componentes UI, gerenciar estado e lidar com efeitos colaterais. Evite componentes de classe em novo código.
    *   **Porquê:** Hooks oferecem uma maneira mais direta, concisa e funcional de reutilizar lógica com estado e lidar com o ciclo de vida e efeitos colaterais dos componentes, resultando em código geralmente mais legível, testável e fácil de compor.
*   **Estrutura de Componentes:**
    *   **Regra:** Organize componentes logicamente, seguindo padrões como Atomic Design (átomos, moléculas, organismos, templates, páginas) ou agrupando por funcionalidade (feature-based). Cada componente deve idealmente aderir ao Princípio da Responsabilidade Única (SRP), focando em uma única tarefa ou aspecto da UI. Quebre componentes complexos em componentes menores e mais focados.
    *   **Porquê:** Melhora a reutilização, testabilidade e manutenibilidade dos componentes. Uma estrutura clara torna a base de código mais fácil de navegar, entender e modificar sem causar efeitos colaterais inesperados.
*   **Evitar Prop Drilling:**
    *   **Regra:** Minimize o "prop drilling" (passar props por múltiplos níveis de componentes aninhados que não usam diretamente essas props, apenas as repassam). Para dados que são necessários em muitos lugares distantes na árvore de componentes, considere `React Context` (para dados que não mudam com frequência extrema) ou bibliotecas de gerenciamento de estado mais robustas (como Zustand, Jotai, Redux).
    *   **Porquê:** Prop drilling excessivo torna os componentes intermediários menos reutilizáveis, mais acoplados à estrutura de dados dos pais e muito mais difíceis de refatorar, pois a assinatura de muitos componentes precisa ser alterada.
*   **Memoização para Performance:**
    *   **Regra:** Use `React.memo` para componentes funcionais, `useCallback` para funções passadas como props, e `useMemo` para valores computados de forma custosa, mas faça-o criteriosamente. Aplique memoização apenas quando o custo do recálculo/re-render for comprovadamente significativo (através de profiling) e puder ser evitado sem introduzir complexidade excessiva.
    *   **Porquê:** Renderizações desnecessárias de componentes e recálculos de funções/valores podem levar a problemas de performance em aplicações React complexas. No entanto, a memoização em si também tem um custo (overhead de comparação de props/dependências), então seu uso indiscriminado pode ser prejudicial.
*   **Prop `key` para Listas:**
    *   **Regra:** Sempre forneça uma prop `key` estável, única dentro da lista e previsível ao renderizar listas de elementos React. A `key` deve idealmente ser derivada de um ID único e imutável do item de dados que o elemento representa. Evite usar o índice do array como `key` se a lista puder ser reordenada, itens puderem ser adicionados/removidos do meio, ou se os itens tiverem estado interno.
    *   **Porquê:** Keys são cruciais para o algoritmo de reconciliação do React. Elas ajudam o React a identificar eficientemente quais itens foram alterados, adicionados ou removidos, otimizando as atualizações da DOM e evitando comportamentos inesperados com o estado interno dos componentes da lista (ex: perda de foco em inputs).
*   **Acessibilidade (A11y):**
    *   **Regra:** Priorize a acessibilidade web (a11y) em todos os componentes e interações da UI. Use HTML semântico (e.g., `<button>`, `<nav>`, `<article>`), atributos ARIA (`aria-label`, `aria-hidden`, `role`, etc.) quando o HTML semântico não for suficiente, e garanta navegação completa por teclado, contraste adequado de cores e compatibilidade com leitores de tela.
    *   **Porquê:** Torna a aplicação utilizável por um público mais amplo, incluindo pessoas com diversas deficiências (visuais, motoras, auditivas, cognitivas). Além de ser uma prática inclusiva e ética, é um requisito legal em muitas jurisdições e contextos.
*   **Renderização Condicional:**
    *   **Regra:** Use técnicas de renderização condicional claras e legíveis. Para lógica simples, operadores ternários (`condição ? <ComponenteA /> : <ComponenteB />`) ou o operador `&&` (`condição && <ComponenteA />`) são aceitáveis dentro do JSX. Para lógica mais complexa ou múltiplas condições, considere extrair a lógica para variáveis descritivas antes do `return` do JSX, ou até mesmo para funções auxiliares ou componentes menores.
    *   **Porquê:** JSX excessivamente complexo e aninhado com muita lógica condicional inline pode se tornar rapidamente difícil de ler, entender e manter. Clareza e legibilidade são fundamentais para a manutenibilidade.
*   **Gerenciamento de Estado:**
    *   **Regra:** Gerencie o estado local do componente (que não é necessário por outros componentes) com `useState`. Para estado que precisa ser compartilhado entre alguns componentes irmãos ou entre pai e filho distante, considere levantar o estado (lifting state up) para o ancestral comum mais próximo. Para estado global complexo ou que afeta muitas partes não relacionadas da aplicação, utilize `React Context` com `useReducer` para lógica de atualização mais complexa, ou uma biblioteca de gerenciamento de estado dedicada (e.g., Zustand, Jotai, Redux Toolkit).
    *   **Porquê:** Escolher a ferramenta e o escopo corretos para o gerenciamento de estado simplifica o fluxo de dados, melhora a performance (evitando re-renders desnecessários de partes não afetadas da UI) e facilita a depuração e o rastreamento de como o estado muda ao longo do tempo.
*   **Hooks Customizados para Reuso de Lógica:**
    *   **Regra:** Extraia lógica reutilizável que envolve estado (usando `useState`, `useReducer`) e/ou efeitos colaterais (`useEffect`) para Hooks customizados. Nomeie-os começando com `use` (e.g., `useFormInput`, `useFetchData`, `useWindowSize`).
    *   **Porquê:** Promove o DRY (Don't Repeat Yourself), organiza melhor a lógica relacionada ao estado e efeitos colaterais que pode ser compartilhada entre múltiplos componentes, facilita testes dessa lógica de forma isolada e torna os componentes que os utilizam mais limpos, focados na apresentação e mais fáceis de entender.
*   **Efeitos Colaterais com `useEffect`:**
    *   **Regra:** Manipule todos os efeitos colaterais (como busca de dados, inscrições a eventos, timers, e manipulações diretas do DOM que não podem ser feitas declarativamente) dentro de hooks `useEffect`. Sempre forneça um array de dependências correto e completo para controlar quando o efeito é re-executado. Implemente funções de limpeza (cleanup functions) retornadas pelo `useEffect` para evitar memory leaks ou comportamento inesperado (e.g., cancelar inscrições a eventos, limpar timers, abortar requisições fetch).
    *   **Porquê:** `useEffect` fornece um ciclo de vida claro e declarativo para efeitos colaterais dentro de componentes funcionais, garantindo que eles sejam executados e limpos de forma previsível e eficiente em relação ao ciclo de vida do componente e suas dependências. Um array de dependências incorreto ou ausente é uma fonte comum de bugs difíceis de rastrear (loops infinitos, closures obsoletas, memory leaks).

### Vite.js
*   **Recursos Nativos do Vite:**
    *   **Regra:** Utilize as importações de módulo ES nativas do Vite para Hot Module Replacement (HMR) extremamente rápido e um servidor de desenvolvimento eficiente.
    *   **Porquê:** Proporciona uma experiência de desenvolvimento significativamente mais ágil e responsiva em comparação com bundlers tradicionais, pois não precisa re-empacotar toda a aplicação a cada mudança, apenas os módulos afetados.
*   **Configuração (`vite.config.ts`):**
    *   **Regra:** Mantenha `vite.config.ts` (ou `.js`/`.mts`) limpo, organizado e focado. Use plugins do ecossistema Vite para estender funcionalidades quando necessário (ex: para React, SVGR, otimizações específicas).
    *   **Porquê:** Facilita o entendimento e a manutenção da configuração de build e desenvolvimento. Uma configuração clara torna mais fácil diagnosticar problemas de build ou otimizar o processo.
*   **Manuseio de Ativos:**
    *   **Regra:** Gerencie ativos estáticos usando o manuseio de ativos embutido do Vite. Coloque ativos na pasta `public/` para que sejam copiados para a raiz do diretório de build sem processamento e acessíveis via caminhos absolutos. Importe ativos diretamente no código JavaScript/TypeScript (ex: `import logoUrl from './logo.svg'`) para que sejam incluídos no grafo de dependências, processados, hasheados para cache busting e otimizados.
    *   **Porquê:** Oferece uma integração eficiente e flexível com o processo de build, com versionamento automático de assets importados (cache busting) e fácil acesso a assets públicos que não precisam de processamento.
*   **Variáveis de Ambiente:**
    *   **Regra:** Use `import.meta.env` para acessar variáveis de ambiente no código do cliente, seguindo a convenção do Vite de prefixá-las com `VITE_` (e.g., `VITE_API_URL`, `VITE_FEATURE_FLAG_XYZ`) para que sejam expostas ao código do frontend durante o build.
    *   **Porquê:** É a maneira padronizada e segura de expor variáveis de ambiente para o código do cliente. O prefixo `VITE_` previne o vazamento acidental de variáveis de ambiente sensíveis do servidor ou do sistema de build que não deveriam estar acessíveis no frontend.

### Zod
*   **Abordagem Schema First:**
    *   **Regra:** Sempre defina um esquema Zod para validação de entrada antes de processar quaisquer dados externos (recebidos de APIs, formulários de usuário, chamadas IPC) ou dados que cruzam limites de camadas importantes dentro da aplicação.
    *   **Porquê:** Garante a integridade, a forma esperada e os tipos dos dados desde o ponto de entrada, prevenindo erros em tempo de execução devido a dados malformados ou inesperados. Os esquemas Zod também servem como uma documentação clara e concisa da estrutura de dados esperada.
*   **Esquemas de Objeto Estritos (`.strict()`):**
    *   **Regra:** Prefira `z.object({...}).strict()` para esquemas de objeto, a menos que haja uma razão explícita e bem compreendida para permitir chaves desconhecidas (nesse caso, documente o porquê).
    *   **Porquê:** Ajuda a capturar dados inesperados ou chaves extras que podem ter sido enviadas inadvertidamente, aumentando a robustez da validação e prevenindo que dados não modelados se propaguem pela aplicação.
*   **Inferência de Tipo (`z.infer<>`):**
    *   **Regra:** Utilize `z.infer<typeof seuSchema>` do Zod para derivar tipos TypeScript diretamente de seus esquemas de validação Zod. Evite definir manualmente interfaces/tipos que espelham esquemas Zod.
    *   **Porquê:** Mantém os tipos TypeScript e as regras de validação Zod perfeitamente sincronizados (DRY - Don't Repeat Yourself). Qualquer alteração no esquema Zod reflete automaticamente no tipo TypeScript, reduzindo a chance de inconsistências e erros de dessincronização.
*   **Refinamento para Lógica Complexa (`.refine()`, `.superRefine()`):**
    *   **Regra:** Use `.refine()` (para validações em um único campo após as checagens de tipo) ou `.superRefine()` (para validações que envolvem múltiplos campos do objeto ou lógica mais complexa) para implementar validações customizadas que vão além das verificações de tipo e forma básicas.
    *   **Porquê:** Permite encapsular regras de validação complexas e específicas do domínio (ex: uma data final deve ser posterior à data inicial, a soma de percentuais não deve exceder 100) dentro do próprio esquema, mantendo a lógica de validação centralizada, coesa com a definição da forma dos dados e reutilizável.
*   **Customização de Mensagem de Erro:**
    *   **Regra:** Forneça mensagens de erro customizadas e descritivas nos esquemas Zod, especialmente para validações cujos erros podem ser expostos ao usuário final ou necessitam de clareza em logs de depuração. Use o parâmetro `message` ou `errorMap` de Zod.
    *   **Porquê:** Melhora a experiência do desenvolvedor durante a depuração, fornecendo contexto sobre a falha de validação, e permite apresentar feedback mais útil e acionável ao usuário sobre entradas de dados inválidas, em vez de mensagens genéricas.
*   **Campos Opcionais, Anuláveis e Padrão (`.optional()`, `.nullable()`, `.default()`):**
    *   **Regra:** Distinga claramente e use corretamente os modificadores `.optional()` (o campo pode estar ausente), `.nullable()` (o campo pode ser `null`), e `.default(valor)` (o campo terá um valor padrão se ausente na entrada) nos esquemas Zod, conforme a necessidade semântica do modelo de dados.
    *   **Porquê:** Garante que o esquema reflita precisamente a estrutura de dados esperada e como lidar com valores ausentes, nulos ou que devem ter um fallback padrão, prevenindo erros de lógica e tornando o contrato de dados mais explícito.
*   **Transformações (`.transform()`, `.pipe()` com `z.coerce`):**
    *   **Regra:** Use `.transform()` para realizar transformações de dados (e.g., sanitização, conversão de tipo segura, formatação de strings) *após* a validação ser bem-sucedida. Para coerção de tipos antes da validação (ex: string para número), use `z.coerce` (disponível em Zod 3.20+), frequentemente dentro de um `.pipe()`.
    *   **Porquê:** `.transform()` assegura que as transformações sejam aplicadas apenas a dados que já foram validados como corretos. `z.coerce` permite que dados de entrada (como strings de query params) sejam convertidos para o tipo esperado antes da validação principal, simplificando o esquema. Isso mantém a lógica de validação e transformação separada mas encadeada de forma segura e explícita.
*   **Validação em Pontos de Entrada/Limites de Camada:**
    *   **Regra:** Realize a validação com esquemas Zod no ponto de entrada mais cedo possível para dados externos (e.g., em handlers IPC, controladores de API HTTP, ao receber dados de formulários da UI) e idealmente ao cruzar limites entre camadas arquiteturais importantes (ex: DTOs de entrada para casos de uso).
    *   **Porquê:** Previne que dados inválidos ou malformados se propaguem pela aplicação, garantindo que as camadas internas e a lógica de negócios operem sempre com dados já validados e conformes com a estrutura esperada, aumentando a robustez e segurança do sistema.

## Qualidade do Código e Refatoração

*   **Testes:**
    *   **Regra:** Novas funcionalidades devem ser acompanhadas de testes unitários e/ou de integração que validem seu comportamento e casos de borda. Correções de bugs devem, idealmente, incluir um novo teste que demonstre o bug (reproduzindo a falha) e verifique a correção.
    *   **Porquê:** Garante que o código funcione como esperado, previne regressões (introdução de novos bugs em funcionalidades existentes ao modificar o código), facilita refatorações seguras (testes atuam como uma rede de segurança) e serve como documentação viva do comportamento esperado. Consulte o [Guia de Testes](./03-testing-guide.md) (a ser criado/movido).
*   **Revisão de Código:**
    *   **Regra:** Todos os Pull Requests (ou Merge Requests) devem ser revisados por pelo menos um outro desenvolvedor qualificado da equipe antes de serem mesclados à branch principal. (Ver seção "Diretrizes para Revisão de Código (Code Review)" para mais detalhes).
    *   **Porquê:** (Já coberto em Princípios Fundamentais) É uma etapa crucial para a detecção de bugs, melhoria da qualidade do código, compartilhamento de conhecimento, disseminação de boas práticas e garantia de conformidade com os padrões estabelecidos.
*   **Refatoração Contínua:**
    *   **Regra:** Dedique tempo para refatorar o código regularmente e reduzir o débito técnico acumulado. Siga a "Boy Scout Rule": deixe o código sempre um pouco mais limpo do que você o encontrou.
    *   **Porquê:** (Já coberto em Princípios Fundamentais) Mantém o código saudável, flexível, fácil de entender e adaptável a futuras mudanças, prevenindo que se torne um "legado" difícil e custoso de manter.

## Diretrizes para Revisão de Código (Code Review)

**Objetivo da Revisão de Código:** Garantir a qualidade, conformidade com os padrões, identificar bugs potenciais, promover o compartilhamento de conhecimento e manter a consistência do codebase.

**Checklist para Revisores:**

*   [ ] **Conformidade com `coding-standards.md`:** Aderência a todos os padrões de nomenclatura, estilo, formatação, Object Calisthenics, etc?
*   [ ] **Clareza e Legibilidade:** O código é fácil de entender? Nomes são descritivos? A lógica é direta?
*   [ ] **Corretude:** A implementação atende aos requisitos da tarefa/issue? Cobre casos de borda?
*   [ ] **Testes:** Existem testes unitários/integração? São adequados e passam?
*   [ ] **Performance:** Há alguma preocupação óbvia de performance? Loops desnecessários, consultas ineficientes?
*   [ ] **Segurança:** Há alguma vulnerabilidade de segurança aparente (ex: XSS, injeção de SQL, tratamento inadequado de dados sensíveis)?
*   [ ] **Documentação:** Comentários (se necessários) são claros e em inglês? Código autoexplicativo é priorizado?
*   [ ] **Mensagens de Commit:** São semânticas e descritivas?
*   [ ] **Princípios de Design:** SOLID, DRY, KISS, YAGNI foram considerados?
*   [ ] **Tratamento de Erros:** Erros são tratados de forma robusta e consistente?

**Tom da Revisão:** Construtivo, respeitoso e focado no código, não no autor. O objetivo é melhorar o produto e ajudar a equipe a crescer, não criticar. Forneça sugestões claras e acionáveis.

## Plugins Recomendados para Linting e Formatação

Para auxiliar na aplicação automática e validação destes padrões, recomendamos a configuração e uso dos seguintes plugins e ferramentas no ambiente de desenvolvimento e no pipeline de CI/CD:

*   **ESLint (`eslint.config.js`):** Principal ferramenta para análise estática e imposição de regras de código.
    *   `@typescript-eslint/eslint-plugin` e `@typescript-eslint/parser`: Essenciais para projetos TypeScript. Permitem que o ESLint entenda a sintaxe do TypeScript e aplicam regras específicas para a linguagem.
        *   **Porquê:** Garante conformidade com as melhores práticas do TypeScript, detecta erros comuns relacionados a tipos e funcionalidades específicas do TS.
    *   `eslint-plugin-import`: Ajuda a organizar, validar e impor um padrão para as declarações de `import`. (Ex: `import/order` para ordenar importações, `import/no-unresolved` para caminhos inválidos, `import/no-duplicates` para evitar importações repetidas).
        *   **Porquê:** Mantém as importações organizadas, legíveis e previne erros de caminhos inválidos ou redundâncias.
    *   `eslint-plugin-react` e `eslint-plugin-react-hooks`: Indispensáveis para projetos React.
        *   **Porquê:** Impõe as regras do React, como o uso correto de hooks (ex: `react-hooks/rules-of-hooks`), convenções de JSX, e outras boas práticas específicas do React.
    *   `eslint-plugin-jsx-a11y`: Para verificar e impor padrões de acessibilidade em código JSX.
        *   **Porquê:** Ajuda a criar interfaces de usuário mais acessíveis para todos os usuários, incluindo aqueles com deficiências, seguindo as diretrizes WCAG.
    *   **Pesquisa e Sugestão:**
        *   "`eslint-plugin-sonarjs`: Para detecção de "code smells" e melhoria da manutenibilidade.
            *   **Porquê:** Identifica lógica complexa ou repetitiva, duplicação de código, e outros padrões que podem ser simplificados para tornar o código mais robusto e fácil de manter."
        *   "`eslint-plugin-security` ou `eslint-plugin-security-node`: Para identificar potenciais vulnerabilidades de segurança no código Node.js ou JavaScript em geral.
            *   **Porquê:** Auxilia na prevenção de falhas comuns de segurança, como uso de `eval` perigoso, detecção de regex inseguras, ou potenciais pontos de injeção."
    *   **Para Nomenclatura de Arquivos (kebab-case):**
        *   "Atualmente, não há um plugin ESLint padrão amplamente adotado que imponha `kebab-case` em nomes de arquivos de forma universal e facilmente configurável para exceções complexas. Isso geralmente requer scripts customizados (ver `docs/developer/adaptation-plan.md`) ou verificações em hooks de pré-commit (como com `lint-staged`). No entanto, pode-se investigar:
            *   `eslint-plugin-filenames-simple`: Permite configurar uma `filenamePattern` usando regex. Ex: `{'case': 'kebab-case', 'name': '/^[a-z0-9\\-]+$|^[A-Z][a-zA-Z0-9]+$/'}` (permitindo kebab ou PascalCase).
            *   `eslint-plugin-unicorn` (regra `unicorn/filename-case`): Oferece várias opções de casing, incluindo `kebabCase`. Pode ser configurado para ignorar certos padrões.
            *   Criar uma regra customizada de ESLint se a necessidade for crítica e as opções existentes não forem suficientes.
        *   **Porquê:** Garante consistência visual na estrutura de arquivos, facilita a localização de arquivos e adere ao padrão definido neste documento."
    *   **Para Object Calisthenics:**
        *   "Algumas regras de Object Calisthenics (ex: `no-else-return` do ESLint core, `max-depth` para níveis de indentação, `max-lines-per-function`, `max-classes-per-file`, `complexity` para complexidade ciclomática) podem ser configuradas diretamente no ESLint ou com plugins como `eslint-plugin-sonarjs`. Outras regras (ex: 'Envolver Todas as Primitivas', 'Um Ponto Por Linha', 'Não Mais Que Duas Variáveis de Instância') são mais conceituais e requerem disciplina da equipe e verificação em revisões de código."
        *   **Porquê:** Promove código mais limpo, modular, com responsabilidades bem definidas e, consequentemente, mais fácil de manter e testar.
*   **Prettier:** Ferramenta opinativa para formatação de código automática e consistente.
    *   **Porquê:** Elimina debates sobre estilo de formatação, garante um padrão visual uniforme em toda a codebase e permite que os desenvolvedores se concentrem na lógica.
    *   **Integração:** Deve ser integrado com ESLint usando `eslint-config-prettier` para desabilitar regras de estilo do ESLint que possam conflitar com as decisões do Prettier.
*   **EditorConfig (`.editorconfig`):** Arquivo para manter configurações básicas de edição (como indentação, tipo de fim de linha, charset) consistentes entre diferentes editores e IDEs.
    *   **Porquê:** Evita problemas de formatação e inconsistências causados por configurações divergentes de editores entre os membros da equipe.
*   **Husky & lint-staged:** Ferramentas para configurar Git hooks.
    *   **Porquê:** Permitem rodar linters, formatadores e testes automaticamente antes dos commits ou pushes, garantindo que apenas código conforme e testado seja enviado para o repositório, melhorando a qualidade e prevenindo a introdução de erros na base de código principal.
*   **Exemplo de Configuração (Conceitual para `eslint.config.js` em formato Flat Config):**
    ```javascript
    // Exemplo meramente ilustrativo de como algumas regras poderiam ser adicionadas
    // import globals from 'globals';
    // import tseslint from 'typescript-eslint';
    // import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
    // import eslintPluginJsxA11y from 'eslint-plugin-jsx-a11y';
    // import eslintPluginFilenamesSimple from 'eslint-plugin-filenames-simple';
    // // ... outros imports de plugins ...

    // export default tseslint.config(
    //   {
    //     ignores: ['dist/**', 'node_modules/**', '*.config.js'],
    //   },
    //   {
    //     files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    //     languageOptions: {
    //       globals: { ...globals.browser, ...globals.node },
    //       parser: tseslint.parser,
    //       parserOptions: {
    //         project: './tsconfig.json', // ou tsconfig.eslint.json
    //         ecmaFeatures: { jsx: true },
    //       },
    //     },
    //     plugins: {
    //       '@typescript-eslint': tseslint.plugin,
    //       'react-hooks': eslintPluginReactHooks,
    //       'jsx-a11y': eslintPluginJsxA11y,
    //       'filenames-simple': eslintPluginFilenamesSimple,
    //       // 'import': eslintPluginImport,
    //       // 'unicorn': eslintPluginUnicorn,
    //       // 'sonarjs': eslintPluginSonarjs,
    //     },
    //     rules: {
    //       '@typescript-eslint/no-explicit-any': 'warn',
    //       '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],
    //       'react-hooks/rules-of-hooks': 'error',
    //       'react-hooks/exhaustive-deps': 'warn',
    //       'max-depth': ['warn', { max: 3 }], // Object Calisthenics: Um nível de indentação (aproximado)
    //       'no-else-return': 'warn',           // Object Calisthenics: Não use ELSE
    //       'complexity': ['warn', 10],         // Limita complexidade ciclomática
    //       'filenames-simple/filename-case': ['error', { 'case': 'kebab-case' }],
    //       // 'unicorn/filename-case': ['error', { case: 'kebabCase', ignore: ['\\.config\\.js$', '\\[.*\\]\\.tsx?$'] }],
    //       // ... outras regras ...
    //     },
    //   }
    // );
    ```
*   **Nota:** A configuração exata dos plugins e regras deve ser mantida e evoluída no arquivo `eslint.config.js` (ou equivalente) do projeto. Esta seção serve como um guia de alto nível e sugestão de ferramentas para alcançar os padrões descritos.

Ao aderir a esses padrões e diretrizes, contribuímos para um projeto mais robusto, colaborativo e sustentável. Lembre-se de consultar o [documento detalhado de Boas Práticas](../reference/02-best-practices.md) para um entendimento mais profundo sobre arquitetura e outros conceitos.
