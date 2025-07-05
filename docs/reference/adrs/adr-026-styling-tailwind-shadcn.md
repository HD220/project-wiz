# ADR-026: Convenções de Estilização com Tailwind CSS e Shadcn/UI

**Status:** Proposto (Considerado Aprovado Conforme Instrução)

**Contexto:**
A estilização da interface do usuário (UI) no Project Wiz é realizada primariamente com Tailwind CSS, complementada pela biblioteca de componentes Shadcn/UI. Para manter a consistência visual, a manutenibilidade dos estilos e uma boa Developer Experience (DX), é necessário padronizar como essas ferramentas são utilizadas.

**Decisão:**

Serão adotadas as seguintes convenções e padrões para estilização:

**1. Tailwind CSS como Motor Principal de Estilização:**
    *   **Padrão (Utility-First):** A abordagem "utility-first" do Tailwind CSS é o padrão. Estilos devem ser aplicados primariamente através da composição de classes utilitárias diretamente no JSX dos componentes.
    *   **Minimizar CSS Customizado:** A escrita de arquivos CSS customizados (`.css`, `.scss`) para estilos específicos de componentes deve ser EVITADA. Apenas em casos onde um estilo complexo (e.g., animações elaboradas, gradientes muito específicos não triviais com utilitários, comportamentos de hover/focus muito intrincados) é comprovadamente difícil ou impossível de alcançar com utilitários Tailwind, um CSS customizado mínimo pode ser considerado. Tal CSS deve ser escopado o máximo possível para o componente em questão (e.g., usando CSS Modules se a configuração permitir, ou classes bem nomeadas e específicas).
    *   **Configuração (`tailwind.config.ts`):**
        *   Este arquivo é o local para estender o tema padrão do Tailwind (cores, fontes, espaçamentos, breakpoints), adicionar plugins, e configurar variantes.
        *   Modificações no `tailwind.config.ts` devem ser bem justificadas e documentadas dentro do próprio arquivo ou nesta ADR se forem extensivas.
    *   **Justificativa:** Utility-first promove consistência, rapidez no desenvolvimento, evita o crescimento descontrolado de CSS e facilita a manutenção, pois os estilos estão co-localizados com a marcação.

**2. Uso e Convenções de Shadcn/UI:**
    *   **Natureza dos Componentes:** Componentes Shadcn/UI não são uma biblioteca tradicional de componentes instalada via npm. Eles são "receitas" ou "blocos de construção" que são copiados para o codebase do projeto (tipicamente em `src_refactored/presentation/ui/components/ui/` via CLI `shadcn-ui add [component-name]`).
    *   **Customização:** A customização da aparência dos componentes Shadcn/UI é feita editando diretamente seu código fonte (o arquivo `.tsx` copiado para o projeto) e ajustando as classes Tailwind CSS dentro deles.
    *   **Composição:** Componentes Shadcn/UI (e.g., `Button`, `Card`, `Dialog`, `Input`) são usados como primitivas para construir componentes de aplicação mais complexos e específicos do domínio.
    *   **Atualizações:** Atualizar um componente Shadcn/UI para uma nova versão da "receita" pode exigir a repetição do comando `add` (com overwrite) e a reaplicação de customizações, ou a comparação manual das mudanças.
    *   **Justificativa:** Shadcn/UI oferece um conjunto de componentes acessíveis e bem projetados, com a flexibilidade de customização total diretamente no projeto, sem as abstrações ou limitações de bibliotecas de componentes tradicionais.

**3. Gerenciamento de Nomes de Classe (Class Names):**
    *   **Padrão:** Para aplicar classes condicionalmente ou construir nomes de classe dinamicamente, utilizar a biblioteca `clsx` (ou `classnames` se já estiver em uso extensivo e for preferido, mas `clsx` é geralmente mais leve).
        ```typescript
        // import clsx from 'clsx';
        // const buttonClasses = clsx(
        //   'px-4 py-2 rounded',
        //   { 'bg-blue-500 text-white': variant === 'primary' },
        //   { 'bg-gray-200 text-gray-700': variant === 'secondary' },
        //   { 'opacity-50 cursor-not-allowed': disabled },
        //   className // para permitir classes externas
        // );
        // return <button className={buttonClasses}>{children}</button>;
        ```
    *   **Resolução de Conflitos de Utilitários (`tailwind-merge`):**
        *   Para evitar conflitos e redundâncias entre classes utilitárias do Tailwind (e.g., `p-2` e `px-4 py-3` aplicados ao mesmo elemento), utilizar a biblioteca `tailwind-merge`.
        *   Componentes Shadcn/UI geralmente já utilizam `tailwind-merge` internamente em sua função `cn` (que combina `clsx` e `tailwind-merge`). Se estiver construindo componentes reutilizáveis que aceitam uma prop `className` externa, é uma boa prática usar uma função `cn` similar.
        *   **Exemplo de função `cn` (geralmente em `lib/utils.ts`):**
            ```typescript
            // import { type ClassValue, clsx } from "clsx"
            // import { twMerge } from "tailwind-merge"
            // export function cn(...inputs: ClassValue[]) {
            //   return twMerge(clsx(inputs))
            // }
            ```
    *   **Justificativa:** `clsx` é eficiente para lógica condicional de classes. `tailwind-merge` garante que a intenção final das classes Tailwind seja aplicada corretamente, resolvendo conflitos de forma previsível.

**4. Design Responsivo:**
    *   **Padrão:** Utilizar os prefixos responsivos padrão do Tailwind CSS (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`) para aplicar estilos diferentes em breakpoints específicos.
    *   Adotar uma abordagem "mobile-first": estilizar para telas pequenas primeiro, e então usar os prefixos para adicionar ou sobrescrever estilos para telas maiores.
    *   **Justificativa:** Prática padrão e eficaz para construir interfaces responsivas com Tailwind.

**5. Modo Escuro (Dark Mode) e Tematização:**
    *   **Padrão (Tailwind):** Utilizar a variante `dark:` do Tailwind CSS para aplicar estilos específicos para o modo escuro. A ativação do modo escuro (adição da classe `dark` ao elemento `html` ou outro ancestral) é geralmente gerenciada por um `ThemeProvider` (como o `next-themes` ou um customizado).
    *   **Cores Semânticas (CSS Variables):**
        *   Definir um conjunto de variáveis CSS para cores semânticas no arquivo global de estilos (e.g., `globals.css` ou `styles/theme.css`), com valores diferentes para light e dark mode.
            ```css
            /* :root { --background: 0 0% 100%; --foreground: 222.2 84% 4.9%; --primary: ...; } */
            /* .dark { --background: 222.2 84% 4.9%; --foreground: 0 0% 98%; --primary: ...; } */
            ```
        *   Configurar estas variáveis no `tailwind.config.ts` para que possam ser usadas com as classes utilitárias do Tailwind (e.g., `bg-background`, `text-foreground`, `bg-primary`). Shadcn/UI já promove esta abordagem.
    *   **Justificativa:** Permite uma implementação consistente e fácil de manter para o modo escuro e temas, aproveitando as capacidades do Tailwind e CSS variables.

**6. Organização de Classes Utilitárias Customizadas (Raras):**
    *   **Padrão:** Se for absolutamente necessário criar classes utilitárias globais que não podem ser alcançadas pela configuração do Tailwind (e.g., uma animação complexa reutilizável), elas devem ser definidas em um arquivo CSS global (e.g., `styles/custom-utilities.css`) e importadas no `globals.css` ou no ponto de entrada da aplicação.
    *   **Componentes `@apply`:** O uso de `@apply` do Tailwind dentro de arquivos CSS para criar classes de componentes deve ser usado com MUITA moderação e apenas para agrupar utilitários que são repetidos de forma idêntica em muitos lugares para um *componente de UI muito específico e bem definido*. Geralmente, é preferível criar um componente React que aplique os utilitários diretamente em seu JSX.
    *   **Justificativa:** Mantém a filosofia utility-first. CSS customizado global deve ser mínimo para evitar conflitos e perda dos benefícios do Tailwind.

**7. Linting para Classes Tailwind:**
    *   **Padrão:** Utilizar o plugin `eslint-plugin-tailwindcss` para:
        *   Ordenar automaticamente as classes Tailwind (melhora a legibilidade e consistência).
        *   Detectar o uso de classes Tailwind conflitantes ou depreciadas.
        *   Garantir o uso correto de variantes.
    *   **Justificativa:** Mantém os nomes de classe organizados e ajuda a evitar erros comuns com Tailwind.

**Consequências:**
*   Abordagem de estilização consistente e manutenível em toda a UI.
*   Aproveitamento máximo dos benefícios do Tailwind CSS (utility-first, responsividade, theming).
*   Uso eficaz e padronizado dos componentes Shadcn/UI.
*   Melhor DX para desenvolvedores trabalhando com estilos.

---
**Notas de Implementação para LLMs:**
*   Sempre use classes utilitárias do Tailwind diretamente no JSX para aplicar estilos.
*   Evite escrever CSS customizado. Se parecer necessário, questione se o estilo pode ser alcançado com composição de utilitários ou configuração no `tailwind.config.ts`.
*   Use a função `cn` (que combina `clsx` e `tailwind-merge`) ao construir componentes que aceitam `className` como prop ou que precisam de classes condicionais.
*   Para modo escuro, use a variante `dark:` e as cores semânticas configuradas (e.g., `bg-background`, `text-foreground`).
*   Siga a ordem de classes definida pelo linter do Tailwind.
