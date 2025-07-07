# Padrões de Código e Diretrizes de Desenvolvimento

**Este documento foi substituído e centralizado.**

Para consultar os padrões de código e diretrizes de desenvolvimento atuais do Project Wiz, por favor, acesse o novo documento consolidado:

➡️ **[Padrões de Código](./coding-standards.md)**

*   **DRY (Don't Repeat Yourself):** Evite duplicação de código.
*   **KISS (Keep It Simple, Stupid):** Mantenha as soluções o mais simples possível.
*   **YAGNI (You Aren't Gonna Need It):** Implemente apenas o que é necessário agora.
*   **Clean Code:** Escreva código que seja fácil de ler, entender e modificar.

Para uma discussão aprofundada sobre estes e outros princípios gerais, bem como diretrizes de arquitetura (Clean Architecture, Object Calisthenics), práticas específicas para as tecnologias que usamos (Electron, React, TypeScript, Vite, Zod), convenções de nomenclatura, formatação, linting, e muito mais, consulte o nosso documento centralizado e principal de Padrões de Código:

*   **[Padrões de Código e Diretrizes de Desenvolvimento para o Project Wiz](./coding-standards.md)**

## Padrões de Estilo de Código

Os seguintes padrões de estilo são extraídos do nosso [Guia de Contribuição](../../community/contribution-guide.md) e devem ser seguidos:

*   **Linguagem Principal:** TypeScript.
    *   Utilizamos a configuração `strict` ativada (`noImplicitAny`, `strictNullChecks`) para maior segurança de tipo.
    *   Path aliases como `@/components`, `@/lib` são utilizados para facilitar a importação.
    *   Priorize a tipagem forte; evite `any` sempre que possível e justifique seu uso se estritamente necessário.

*   **Formatação (Prettier):**
    *   O projeto utiliza Prettier para garantir consistência na formatação do código.
    *   Principais configurações (verifique o arquivo de configuração do Prettier no projeto para detalhes completos, geralmente `.prettierrc.js` ou similar):
        *   Indentação: 2 espaços.
        *   Aspas: Simples (`singleQuote: true`).
        *   Ponto e vírgula: Geralmente no final das instruções (verifique a configuração exata, ex: `semi: true`).
    *   Recomenda-se configurar seu editor para formatar ao salvar ou executar o script de formatação (ex: `npm run format`).

*   **Linting (ESLint):**
    *   ESLint é usado para análise estática de código e para impor padrões.
    *   A configuração base geralmente estende-se de presets recomendados como `eslint:recommended`, `@typescript-eslint/recommended`, e `import/recommended`.
    *   Verifique o arquivo de configuração do ESLint (ex: `.eslintrc.js`) para regras específicas do projeto.
    *   Execute `npm run lint` para verificar e `npm run lint:fix` para tentar correções automáticas.

*   **Convenções de Nomenclatura:**
    *   Use nomes claros, descritivos e em **inglês** para variáveis, funções, classes, arquivos e pastas.
    *   Pastas devem ser nomeadas em inglês.

*   **Controle de Versão (Git):**
    *   Faça commits pequenos e atômicos.
    *   Escreva mensagens de commit claras, descritivas e em inglês. Siga o padrão de [Commits Semânticos](https://www.conventionalcommits.org/) (ex: `feat: Adiciona nova Tool X`, `fix: Corrige problema de login ao usar Y`).

*   **Comentários:**
    *   Comente código complexo ou não óbvio, explicando o *porquê* da lógica, não apenas o *o quê*.
    *   Evite comentários desnecessários para código autoexplicativo.
    *   Escreva comentários em inglês.

## Qualidade do Código e Refatoração

*   **Testes:** Novas funcionalidades devem ser acompanhadas de testes unitários e/ou de integração. Correções de bugs devem, idealmente, incluir um teste que demonstre o bug e verifique a correção. Consulte o [Guia de Testes](./03-testing-guide.md) (a ser criado/movido).
*   **Revisão de Código:** Todos os Pull Requests devem ser revisados por pelo menos um outro desenvolvedor.
*   **Refatoração Contínua:** Dedique tempo para refatorar o código e reduzir o débito técnico.

Ao aderir a esses padrões e diretrizes, contribuímos para um projeto mais robusto, colaborativo e sustentável. Lembre-se de consultar o documento [Padrões de Código e Diretrizes de Desenvolvimento para o Project Wiz](./coding-standards.md) para um entendimento completo e detalhado de todos os padrões vigentes.
