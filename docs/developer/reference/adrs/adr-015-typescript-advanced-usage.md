# ADR-015: Padrões para Uso Avançado e Melhores Práticas de TypeScript

**Status:** Proposto (Considerado Aprovado Conforme Instrução)

**Contexto:**
TypeScript é a linguagem principal do projeto. Para maximizar seus benefícios em termos de segurança de tipo, manutenibilidade e clareza do código, é essencial padronizar o uso de seus recursos, desde as configurações do compilador até padrões de tipos avançados e práticas de codificação. Esta ADR detalha essas diretrizes.

**Decisão:**

Serão adotados os seguintes padrões e melhores práticas para o uso de TypeScript:

**1. Configurações Estritas do Compilador (`tsconfig.json`):**
_ **Padrão:** Manter `strict: true` (ou todas as suas sub-flags individuais como `strictNullChecks`, `noImplicitAny`, `noImplicitThis`, `alwaysStrict`, `strictBindCallApply`, `strictFunctionTypes`, `strictPropertyInitialization`) habilitado.
_ Outras flags importantes a serem mantidas:
_ `esModuleInterop: true` (para melhor compatibilidade com módulos CommonJS).
_ `isolatedModules: true` (garante que cada arquivo possa ser transpilado como um módulo separado).
_ `forceConsistentCasingInFileNames: true` (previne problemas de casing em imports).
_ `noUnusedLocals: true` e `noUnusedParameters: true` (para manter o código limpo).
_ `skipLibCheck: true` (pode acelerar a compilação, mas usar com cautela se houver problemas com tipos de dependências).
_ **Justificativa:** Configurações estritas pegam mais erros em tempo de compilação, levando a código mais robusto, confiável e fácil de refatorar.

**2. Tipos Avançados:**
_ **Utility Types (Tipos Utilitários):** Utilizar os tipos utilitários fornecidos pelo TypeScript para manipulações comuns de tipos.
_ `Partial<T>`: Constrói um tipo com todas as propriedades de `T` definidas como opcionais. \* _Uso:_ Para representar atualizações parciais de um objeto. \* _Exemplo:_ `interface User { id: string; name: string; } type UserUpdate = Partial<User>; // { id?: string; name?: string; }`
_ `Required<T>`: Constrói um tipo com todas as propriedades de `T` definidas como requeridas.
_ `Readonly<T>`: Constrói um tipo com todas as propriedades de `T` definidas como `readonly`. \* _Uso:_ Para garantir imutabilidade em objetos de configuração ou dados que não devem ser alterados.
_ `Record<K, T>`: Constrói um tipo de objeto cujas chaves são do tipo `K` e os valores são do tipo `T`.
_ _Uso:_ Para dicionários ou mapas. \* _Exemplo:_ `type FeatureFlags = Record<string, boolean>;`
_ `Pick<T, K extends keyof T>`: Constrói um tipo selecionando um conjunto de propriedades `K` de `T`.
_ `Omit<T, K extends keyof T>`: Constrói um tipo omitindo um conjunto de propriedades `K` de `T`. \* _Uso (Pick/Omit):_ Para criar DTOs ou tipos de visualização com um subconjunto de propriedades de um tipo maior.
_ `ReturnType<typeof someFunction>`: Extrai o tipo de retorno de uma função.
_ `Parameters<typeof someFunction>`: Extrai os tipos dos parâmetros de uma função como uma tupla.
_ `NonNullable<T>`: Exclui `null` e `undefined` de `T`.
_ `Awaited<T>`: Obtém o tipo resolvido de uma `Promise`.
_ **Mapped Types (Tipos Mapeados):** Usar para criar novos tipos baseados na transformação de propriedades de um tipo existente.
_ **Exemplo (Criar um tipo onde todas as propriedades são Promises):**
`typescript
            // type AsyncProps<T> = { [K in keyof T]: Promise<T[K]> };
            // interface User { id: string; name: string; }
            // type AsyncUser = AsyncProps<User>; // { id: Promise<string>; name: Promise<string>; }
            `
_ **Conditional Types (Tipos Condicionais):** Usar `T extends U ? X : Y` para criar tipos que dependem de uma condição. Útil para bibliotecas ou utilitários genéricos complexos.
_ **Exemplo (Obter o tipo do elemento de um array ou o próprio tipo):**
`typescript
            // type ElementType<T> = T extends (infer U)[] ? U : T;
            // type StrOrNumArray = string[] | number[];
            // type ItemType = ElementType<StrOrNumArray>; // string | number
            // type NotAnArray = ElementType<string>;    // string
            `
_ **Template Literal Types (Tipos de Template Literal):** Usar para criar tipos de string específicos e combinações.
_ **Exemplo:** `type EventName = \`on\${Capitalize<string>}\`; type MyEvent = EventName; // e.g., "onClick", "onChange"`
    *   **Indexed Access Types (`T[K]`):** Usar para acessar o tipo de uma propriedade específica de outro tipo. Usar com cautela para evitar erros se a chave não existir. \* **Justificativa (Tipos Avançados):\*\* Permitem modelar dados e comportamentos de forma mais precisa e flexível, melhorando a segurança de tipo e a expressividade do código.

**3. Genéricos (`<T>`):**
_ **Padrão:** Usar genéricos para criar funções, classes, interfaces e tipos que podem operar sobre uma variedade de tipos de forma segura.
_ **Constraints Genéricas (`<T extends SomeType>`):** Aplicar constraints para especificar que um tipo genérico deve atender a um certo contrato (e.g., ter certas propriedades ou métodos).
_ **Exemplo:** `function getItemId<T extends { id: string }>(item: T): string { return item.id; }`
_ **Inferência:** Deixar o TypeScript inferir os tipos genéricos quando possível, mas especificá-los explicitamente se a inferência falhar ou a clareza for comprometida.
_ **Quando Usar:** Quando uma funcionalidade pode ser aplicada a diferentes tipos de dados sem alterar sua lógica fundamental.
_ **Justificativa:** Promove DRY e reutilização de código mantendo a segurança de tipo.

**4. Type Guards (Guardas de Tipo) e Type Narrowing (Estreitamento de Tipo):**
_ **Padrão:** Utilizar type guards para estreitar o tipo de uma variável dentro de um escopo condicional.
_ **User-Defined Type Guards:** Funções que retornam `parametro is TipoDesejado`.
`typescript
        // interface Car { drive: () => void; }
        // interface Bike { ride: () => void; }
        // function isCar(vehicle: Car | Bike): vehicle is Car {
        //   return (vehicle as Car).drive !== undefined;
        // }
        // function startVehicle(vehicle: Car | Bike) {
        //   if (isCar(vehicle)) {
        //     vehicle.drive(); // vehicle é Car aqui
        //   } else {
        //     vehicle.ride();  // vehicle é Bike aqui
        //   }
        // }
        `
_ **Operadores `typeof`, `instanceof`, `in`:** Usar para narrowing de tipos primitivos, classes e verificação de propriedades.
_ **Discriminated Unions (Uniões Discriminadas / Tagged Unions):** Padrão altamente recomendado para modelar estados ou tipos variantes. Consiste em uma propriedade literal comum (o "discriminante" ou "tag") em cada tipo da união, permitindo narrowing exaustivo com `switch` ou `if/else if`.
_ **Exemplo:**
`typescript
            // interface SuccessResponse { status: 'success'; data: unknown; }
            // interface ErrorResponse { status: 'error'; error: string; }
            // type ApiResponse = SuccessResponse | ErrorResponse;
            // function handleResponse(response: ApiResponse) {
            //   switch (response.status) {
            //     case 'success': console.log(response.data); break;
            //     case 'error': console.error(response.error); break;
            //     default: const _exhaustiveCheck: never = response; // Garante que todos os casos foram tratados
            //   }
            // }
            `
_ **Justificativa:** Permite trabalhar com tipos de união de forma segura e explícita, garantindo que o código acesse apenas propriedades ou métodos que existem no tipo estreitado.

**5. `unknown` vs. `any`:**
_ **Padrão:** **SEMPRE preferir `unknown` em vez de `any`** quando o tipo de um valor não é conhecido antecipadamente.
_ `unknown` força uma verificação de tipo (usando type guards, `instanceof`, asserção de tipo) antes que qualquer operação possa ser realizada sobre o valor.
_ `any` desabilita efetivamente a verificação de tipos, tornando-se uma "porta de escape" que deve ser evitada.
_ **Quando `any` é (cautelosamente) Aceitável:**
_ Ao interagir com código JavaScript legado ou bibliotecas de terceiros que não possuem tipos.
_ Para conteúdo verdadeiramente dinâmico onde a estrutura do tipo é impossível de ser conhecida ou modelada.
_ **Sempre justifique o uso de `any` com um comentário e restrinja seu escopo ao mínimo.**
_ **Exemplo (`unknown`):**
`typescript
        // async function fetchData(url: string): Promise<unknown> { /* ... */ return {}; }
        // async function processData() {
        //   const response = await fetchData("/api/data");
        //   if (typeof response === 'object' && response !== null && 'propertyName' in response) {
        //     console.log((response as { propertyName: string }).propertyName);
        //   }
        // }
        ` \* **Justificativa:** `unknown` mantém a segurança de tipo, forçando o desenvolvedor a lidar explicitamente com o tipo desconhecido, enquanto `any` a sacrifica.

**6. Enums:**
_ **Padrão:**
_ Para conjuntos simples e fixos de valores string, **prefira Tipos de União Literal** (e.g., `type Status = 'active' | 'inactive' | 'pending';`).
_ Use `enum` do TypeScript quando:
_ Se necessita de um objeto no runtime que mapeia nomes para valores (e vice-versa para enums numéricos).
_ Para interoperabilidade com APIs ou código legado que espera enums.
_ Para conjuntos de constantes numéricas onde os valores em si são importantes e podem não ser sequenciais.
_ Se usar `enum`, prefira `const enum` quando possível, pois são completamente removidos durante a transpilação e seus valores são inlined, resultando em código JavaScript menor. No entanto, `const enum` tem limitações (e.g., não podem ser iterados no runtime).
_ **Exemplo (String Literal Union vs. String Enum):**
```typescript
// Preferido para status simples:
// type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';

        // String Enum (se o objeto enum for útil no runtime):
        // enum LogLevel { ERROR = "ERROR", WARN = "WARN", INFO = "INFO" }
        // function log(level: LogLevel, message: string) { /* ... */ }
        // log(LogLevel.ERROR, "Falha crítica!");
        ```
    *   **Justificativa:** Uniões literais são mais leves e muitas vezes mais diretas para strings. Enums (especialmente `const enum`) podem ser eficientes, mas sua necessidade deve ser avaliada caso a caso.

**7. Módulos e Namespaces:**
_ **Padrão:** Utilizar exclusivamente Módulos ES6 (`import`/`export`) para organização de código.
_ Desencorajar fortemente o uso de `namespace` do TypeScript, a menos que para organizar tipos ao interagir com bibliotecas JavaScript globais (não modulares) muito antigas ou para criar declarações de tipo ambiente (`.d.ts`) para tais bibliotecas. \* **Justificativa:** Módulos ES6 são o padrão moderno, promovem melhor organização, encapsulamento e otimizações de build (tree-shaking). `namespace` é um padrão mais antigo e menos comum em código moderno.

**8. Sobrecarga de Funções (Function Overloads):**
_ **Padrão:** Usar sobrecargas de função com moderação, apenas quando uma única função precisa ter diferentes assinaturas de parâmetros e/ou tipos de retorno baseados nesses parâmetros, e quando alternativas (como usar tipos de união para parâmetros ou um objeto de opções) não são mais claras.
_ Defina as assinaturas de sobrecarga primeiro, seguidas pela assinatura de implementação real (que deve ser compatível com todas as sobrecargas e geralmente usa `any` ou tipos de união para os parâmetros, com type guards no corpo).
_ **Exemplo:**
`typescript
        // function processInput(input: string): string[];
        // function processInput(input: number): number[];
        // function processInput(input: string | number): string[] | number[] {
        //   if (typeof input === 'string') {
        //     return input.split('');
        //   } else {
        //     return Array.from({ length: input }, (_, i) => i + 1);
        //   }
        // }
        `
_ **Justificativa:** Fornece type-safety para múltiplas assinaturas de uma mesma função, mas pode aumentar a complexidade se usado excessivamente.

**9. Decorators:**
_ **Padrão:** Decorators (usados por InversifyJS para `@injectable()`, `@inject()`, etc.) são aceitos conforme o uso pelo framework de DI.
_ A criação de decorators customizados deve ser bem justificada, documentada e seguir as especificações do TypeScript. Geralmente são para metaprogramação avançada ou para estender frameworks. \* **Justificativa:** Necessários para frameworks como InversifyJS. Decorators customizados podem adicionar complexidade e devem ser usados com critério.

**10. Código Assíncrono (`async`/`await`, `Promise`):**
_ **Padrão:** Utilizar `async/await` para todo código assíncrono baseado em Promises, para melhor legibilidade e fluxo de controle similar ao síncrono.
_ Sempre tratar erros de Promises, seja com `try/catch` em blocos `async/await`, ou com `.catch()` em cadeias de Promise (embora `async/await` seja preferido).
_ Evitar o anti-padrão "async executor" (passar uma função `async` para o construtor de `new Promise((resolve, reject) => { /_ async code _/ })`). Use `async` functions diretamente.
_ Tenha cuidado com `Promise.all()` vs. `Promise.allSettled()` dependendo se uma falha deve rejeitar todas ou se todos os resultados são necessários.
_ Evite `void` em Promises não tratadas (e.g., `async function foo(): Promise<void> { await someAsync(); }` sem `try/catch`). Use `eslint` para detectar isso (`@typescript-eslint/no-floating-promises`).
_ **Justificativa:** `async/await` torna o código assíncrono mais fácil de ler e escrever. Tratamento de erro explícito previne "unhandled promise rejections".

**11. Estilo de Código para Tipos:**
_ **Padrão:** Para definições de tipo complexas (uniões longas, tipos mapeados, condicionais), use quebras de linha e indentação para melhorar a legibilidade, similar ao código regular. Prettier pode ajudar a formatar isso.
_ **Justificativa:** Tipos complexos podem se tornar tão difíceis de ler quanto código complexo se não forem bem formatados.

**Consequências:**

- Maior robustez e segurança de tipo em toda a codebase.
- Código mais expressivo, legível e manutenível.
- Melhor utilização dos recursos do TypeScript para modelagem de dados e comportamentos.
- Redução de erros em tempo de execução que poderiam ser pegos em tempo de compilação.

---

**Notas de Implementação para LLMs:**

- Sempre que definir um tipo, pense se um Utility Type existente pode ser usado.
- Prefira `unknown` a `any`. Se usar `any`, justifique.
- Use `async/await` para código assíncrono e sempre inclua tratamento de erro (`try/catch`).
- Para modelar estados variantes, use Discriminated Unions.
- Consulte esta ADR ao encontrar situações que exijam modelagem de tipo mais complexa.
