# ADR-025: Design de Componentes React e Gerenciamento de Estado na UI

**Status:** Proposto (Considerado Aprovado Conforme Instrução)

**Contexto:**
A camada de UI (`src_refactored/presentation/ui/`) é construída com React e TypeScript. Para garantir uma UI manutenível, performática, testável e com boa Developer Experience (DX), é crucial padronizar como os componentes são projetados, como o estado é gerenciado (local, compartilhado, global), e como as interações com o backend (via IPC) são tratadas. Esta ADR consolida as melhores práticas e define os padrões para o desenvolvimento React no Project Wiz.

**Decisão:**

Serão adotados os seguintes padrões para o design de componentes React e gerenciamento de estado:

**1. Componentes Funcionais e Hooks:**
    *   **Padrão:** Todos os novos componentes React DEVEM ser Componentes Funcionais. A lógica de estado e ciclo de vida DEVE ser gerenciada usando React Hooks (`useState`, `useEffect`, `useContext`, `useReducer`, `useCallback`, `useMemo`, etc.). Componentes de Classe devem ser evitados.
    *   **Justificativa:** Alinhamento com as práticas modernas do React, resultando em código mais conciso, legível, e com melhor reuso de lógica através de hooks customizados.

**2. Estrutura e Granularidade de Componentes:**
    *   **Princípio da Responsabilidade Única (SRP):** Cada componente deve ter uma única responsabilidade bem definida. Componentes complexos devem ser divididos em componentes menores e mais focados.
    *   **Composição:** Favorecer a composição de componentes para construir UIs complexas.
    *   **Distinção (Conceitual) Container/Presentational:**
        *   **Componentes de Página/Feature (Containers - Smart):** Localizados em `src_refactored/presentation/ui/app/**` (para rotas) ou em `features/**/components/` (se forem containers de features mais complexas). São responsáveis por:
            *   Buscar dados (usando hooks como `useIpcQuery`).
            *   Gerenciar estado relevante para a feature ou página.
            *   Passar dados e callbacks para componentes de apresentação.
        *   **Componentes de Apresentação (Dumb):** Localizados em `features/**/components/`, `components/common/`, `components/layout/`, `components/ui/`. São responsáveis por:
            *   Renderizar UI com base nas props recebidas.
            *   Chamar callbacks de props para notificar sobre interações do usuário.
            *   Geralmente não possuem estado próprio complexo (podem ter estado de UI trivial).
    *   **Justificativa:** Melhora a reutilização, testabilidade (componentes de apresentação são fáceis de testar com diferentes props) e a separação de responsabilidades.

**3. Props e Estado Local:**
    *   **Props:**
        *   Definir interfaces TypeScript para as props de cada componente.
        *   Nomes de props devem ser claros e seguir `camelCase`.
        *   Usar `readonly` para props que não devem ser modificadas pelo componente.
    *   **Estado Local (`useState`, `useReducer`):**
        *   Usar `useState` para estados locais simples (booleanos, strings, números, pequenos objetos/arrays).
        *   Usar `useReducer` para lógica de estado local mais complexa ou quando o próximo estado depende do anterior de forma não trivial.
    *   **Justificativa:** Type-safety e clareza na comunicação entre componentes e no gerenciamento de estado interno.

**4. Gerenciamento de Estado Compartilhado/Global:**
    *   **Evitar Prop Drilling Excessivo:**
        *   Para compartilhar estado entre poucos componentes aninhados, "levantar o estado" (lifting state up) para o ancestral comum mais próximo é a primeira opção.
        *   **React Context API:** Usar para dados que são considerados "globais" para uma subárvore de componentes e que não mudam com frequência extrema (e.g., tema da UI, informações do usuário autenticado, configurações de internacionalização).
            *   Prover contextos em pontos apropriados da árvore (e.g., `app/__root.tsx` ou `app/app/_layout.tsx` para contextos realmente globais, ou no topo de uma feature para contextos específicos da feature).
    *   **Estado de Servidor (Dados do Backend):**
        *   **Padrão:** Utilizar os hooks customizados `useIpcQuery` e `useIpcMutation` (de `hooks/ipc/`, após correção para usar `IPCService` ou `window.electronIPC` corretamente, conforme ADR-024) para buscar e modificar dados do backend via IPC. Estes hooks gerenciam estados de loading/error/data.
        *   **Consideração Futura (TanStack Query - React Query):** Para necessidades mais avançadas de gerenciamento de estado de servidor (caching sofisticado, sincronização em segundo plano, atualizações otimistas, paginação/queries infinitas), a adoção de uma biblioteca como TanStack Query deve ser considerada. Ela pode encapsular ou ser usada em conjunto com o `IPCService`. Por ora, os hooks customizados são a base.
    *   **Estado Global da UI (Complexo):**
        *   **Situação Atual:** O diretório `presentation/ui/store/` está vazio.
        *   **Decisão:**
            1.  Iniciar com React Context para estados globais simples.
            2.  Se a complexidade do estado global da UI crescer significativamente (múltiplas fatias de estado interconectadas, necessidade de middlewares, devtools avançados), adotar uma biblioteca de gerenciamento de estado leve e moderna como **Zustand** ou **Jotai**. A escolha deve ser objeto de uma nova ADR se/quando a necessidade se tornar clara. Evitar Redux Toolkit inicialmente devido à sua verbosidade, a menos que a complexidade realmente o justifique.
    *   **Justificativa:** Escolher a ferramenta certa para cada tipo de estado (local, compartilhado, servidor, global) resulta em código mais simples, performático e fácil de manter.

**5. Hooks Customizados (`src_refactored/presentation/ui/hooks/`):**
    *   **Padrão:** Encorajar a criação de hooks customizados para extrair e reutilizar lógica de UI com estado e/ou efeitos colaterais entre componentes.
    *   **Nomenclatura:** Devem começar com `use` (e.g., `useDebounce`, `useProjectFilters`). O nome do arquivo do hook deve seguir `use-kebab-case-nome.hook.ts` (conforme ADR-028).
    *   **Localização:** Hooks globais em `hooks/`. Hooks específicos de uma feature em `features/<nome-da-feature>/hooks/`.
    *   **Justificativa:** DRY, melhor organização da lógica, componentes mais limpos e focados na apresentação.

**6. Efeitos Colaterais (`useEffect`):**
    *   **Padrão:** Usar `useEffect` para efeitos colaterais que não são cobertos pelos hooks de data fetching (e.g., inscrições a eventos não-IPC, manipulações diretas do DOM se inevitáveis, timers).
    *   **Array de Dependências:** SEMPRE fornecer um array de dependências correto e completo. Omitir ou errar no array de dependências é uma fonte comum de bugs. Usar as ferramentas de linting (`eslint-plugin-react-hooks`) para ajudar.
    *   **Função de Limpeza (Cleanup):** SEMPRE retornar uma função de limpeza de `useEffect` se o efeito configurar qualquer inscrição, timer, ou recurso que precise ser liberado quando o componente é desmontado ou antes que o efeito re-execute.
    *   **Justificativa:** Gerenciamento correto e previsível de efeitos colaterais, prevenindo memory leaks e comportamento inesperado.

**7. Formulários:**
    *   **Biblioteca Padrão:** React Hook Form.
    *   **Validação:** Esquemas Zod (definidos em `*.schema.ts` co-localizados com o formulário ou caso de uso) integrados com React Hook Form usando `@hookform/resolvers/zod`.
    *   **Estrutura:** Componentes de formulário devem ser bem estruturados, possivelmente com componentes de input reutilizáveis. Lógica de submissão deve chamar os hooks `useIpcMutation` apropriados (via `IPCService`).
    *   **Justificativa:** React Hook Form oferece performance e DX para formulários. Zod garante validação robusta e type-safe.

**8. Performance:**
    *   **Memoização Criteriosa:**
        *   `React.memo()`: Para componentes funcionais que recebem props complexas (objetos/arrays) e podem ser dispendiosos para re-renderizar. Aplicar apenas se houver ganho de performance comprovado (profiling) e se as props forem comparáveis de forma eficiente.
        *   `useCallback()`: Para memoizar callbacks passados para componentes filhos otimizados (com `React.memo` ou que dependem da identidade da função em `useEffect`).
        *   `useMemo()`: Para memoizar o resultado de cálculos computacionalmente caros.
        *   **Cuidado:** Memoização excessiva ou inadequada pode prejudicar a performance.
    *   **Virtualização de Listas:** Para listas longas (centenas/milhares de itens), usar bibliotecas de virtualização (e.g., TanStack Virtual, `react-window`) para renderizar apenas os itens visíveis.
    *   **Lazy Loading de Componentes/Rotas:** Usar `React.lazy()` e `<Suspense>` para carregar componentes (especialmente para rotas diferentes) sob demanda, melhorando o tempo de carregamento inicial da aplicação. TanStack Router suporta lazy loading de componentes de rota.
    *   **Justificativa:** Garantir uma experiência de usuário fluida e responsiva.

**9. Acessibilidade (A11y):**
    *   **Padrão:** Priorizar acessibilidade em todos os componentes.
        *   Usar HTML semântico.
        *   Fornecer atributos ARIA apropriados quando necessário.
        *   Garantir navegação completa por teclado.
        *   Manter contraste de cores adequado.
        *   Usar linters de acessibilidade (e.g., `eslint-plugin-jsx-a11y`).
    *   **Justificativa:** Inclusão e para atender a potenciais requisitos legais.

**10. Error Boundaries (Limites de Erro):**
    *   **Padrão:** Implementar Error Boundaries (componentes de classe que definem `static getDerivedStateFromError()` e `componentDidCatch()`) em pontos estratégicos da aplicação (e.g., em volta de features principais, seções de layout) para capturar erros de renderização em seus filhos, logar o erro e exibir uma UI de fallback em vez de quebrar toda a aplicação.
    *   **Justificativa:** Melhora a resiliência da UI, prevenindo que um erro em uma parte da interface derrube toda a tela.

**11. Interação com Roteamento (TanStack Router):**
    *   **Padrão:** Utilizar os hooks e componentes fornecidos pelo TanStack Router para navegação e acesso a informações de rota:
        *   `<Link to="/path" params={{ id }} search={{ query: val }}>`: Para navegação declarativa.
        *   `useNavigate()`: Para navegação programática.
        *   `useParams<RoutePathParams<'/app/projects/$projectId'>>()`: Para acessar parâmetros de rota dinâmicos de forma type-safe.
        *   `useSearch<RoutePathSearch<'/app/projects'>>()`: Para acessar parâmetros de busca (query string) de forma type-safe.
        *   `useLoaderData<RouteLoaderData<'/app/projects/$projectId'>>()`: Se estiver usando loaders de rota do TanStack Router.
    *   **Justificativa:** Uso padronizado e type-safe das funcionalidades do router.

**Consequências:**
*   UI mais consistente, manutenível, testável e performática.
*   Melhor separação de responsabilidades nos componentes React.
*   Clareza no gerenciamento de diferentes tipos de estado.
*   Melhor DX para desenvolvedores React.

---
**Notas de Implementação para LLMs:**
*   Sempre crie componentes funcionais usando hooks. Os arquivos de componentes devem ser nomeados `kebab-case.tsx` (e.g., `minha-feature/components/meu-cartao-perfil.tsx`).
*   Divida componentes grandes em menores e mais focados.
*   Para interações com o backend (IPC), use os hooks `useIpcQuery` e `useIpcMutation` (que utilizam o `IPCService` ou `window.electronIPC`). Os arquivos destes hooks devem ser nomeados `use-kebab-case-nome.hook.ts` (e.g., `minha-feature/hooks/use-dados-projeto.hook.ts`).
*   Gerencie o estado local com `useState`/`useReducer`. Para estado compartilhado/global, comece com Context e avalie bibliotecas dedicadas (Zustand/Jotai) se a complexidade aumentar.
*   Use `useEffect` com arrays de dependência corretos e funções de limpeza.
*   Aplique memoização (`React.memo`, `useCallback`, `useMemo`) apenas quando houver um gargalo de performance identificado.
*   Siga as diretrizes de acessibilidade.
*   Use React Hook Form e Zod para formulários.
*   Consulte ADR-027 e ADR-028 para as convenções de nomenclatura de arquivos e diretórios do frontend atualizadas.
