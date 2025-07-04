# Plano de Adaptação às Novas Padronizações

## 1. Introdução

Este documento descreve o plano para adequar o codebase existente do Project Wiz às novas padronizações de código, nomenclatura e documentação, conforme definido em `docs/developer/coding-standards.md`. O objetivo é realizar uma transição gradual e organizada, minimizando disrupções e garantindo a consistência em todo o projeto.

## 2. Fases de Adaptação

A adaptação será dividida em fases para gerenciar o escopo e priorizar áreas críticas.

### Fase 1: Documentação e Conscientização (Imediato)

*   **Ação:** Garantir que toda a equipe (e agentes de IA) esteja ciente dos novos padrões.
    *   **Checklist:**
        *   [ ] Comunicar à equipe sobre o novo documento `docs/developer/coding-standards.md`.
        *   [ ] Revisar e atualizar `GEMINI.MD` e `AGENTS.MD` para refletir as novas diretrizes (CONCLUÍDO).
        *   [ ] Todos os desenvolvedores leram e compreenderam o novo `coding-standards.md`.
*   **Ação:** Aplicar os novos padrões a todo novo código desenvolvido.
    *   **Checklist:**
        *   [ ] Novas funcionalidades seguem estritamente `coding-standards.md`.
        *   [ ] Novos arquivos são criados com nomenclatura kebab-case.
        *   [ ] Code reviews verificam a adesão aos novos padrões.

### Fase 2: Adequação da Nomenclatura de Arquivos (Curto Prazo)

*   **Objetivo:** Renomear todos os arquivos existentes no diretório `src_refactored/` para o padrão kebab-case. Arquivos fora de `src_refactored/` (ex: arquivos de configuração na raiz, scripts) devem ser avaliados caso a caso.
*   **Estratégia:**
    1.  **Identificação:** Mapear todos os arquivos em `src_refactored/` que não seguem o padrão kebab-case.
        *   **Ferramentas:** Scripts customizados (ex: shell script, Node.js script) podem ser usados para listar arquivos não conformes.
    2.  **Planejamento da Renomeação:**
        *   Priorizar por módulos ou features para minimizar conflitos de merge.
        *   Analisar o impacto da renomeação em importações e referências (TypeScript deve ajudar a identificar a maioria dos erros de compilação).
    3.  **Execução:**
        *   Renomear arquivos em lotes pequenos e controlados.
        *   Atualizar todas as importações (`import` e `export`) que referenciam os arquivos renomeados.
        *   Rodar `npm run lint --fix` (ou comando equivalente do projeto para aplicar correções) e testes após cada lote para garantir que nada foi quebrado.
    *   **Checklist:**
        *   [ ] Script de identificação de arquivos não conformes foi criado e executado.
        *   [ ] Lista de arquivos a serem renomeados foi gerada e priorizada.
        *   [ ] Lote 1 de arquivos renomeado e importações corrigidas.
        *   [ ] Testes e linting passaram para o Lote 1.
        *   [ ] ... (repetir para outros lotes) ...
        *   [ ] Todos os arquivos em `src_refactored/` estão em kebab-case.
        *   [ ] Arquivos de configuração e outros (fora de `src_refactored/`) foram avaliados e, se aplicável, renomeados.
*   **Guia para LLMs/Agentes de IA na Renomeação:**
    *   "Ao renomear um arquivo (ex: de `MyComponent.tsx` para `my-component.tsx`), você DEVE encontrar e atualizar todas as declarações de importação que referenciam o nome antigo. Por exemplo, `import MyComponent from './MyComponent'` deve ser alterado para `import MyComponent from './my-component'`. Verifique também exportações em arquivos `index.ts`."
    *   "Após renomear um conjunto de arquivos, execute os linters e testes do projeto para validar as mudanças. Corrija quaisquer erros introduzidos."

### Fase 3: Refatoração Gradual do Código Existente (Médio Prazo)

*   **Objetivo:** Aplicar os demais padrões de código (além da nomenclatura de arquivos) ao código legado em `src_refactored/`.
*   **Estratégia:**
    *   **"Boy Scout Rule":** Deixar o código mais limpo do que você o encontrou. Ao trabalhar em uma funcionalidade ou corrigir um bug, dedicar um tempo para aplicar os novos padrões na área do código que está sendo modificada.
    *   **Sprints de Refatoração:** Alocar tempo específico em sprints para refatorar módulos ou componentes críticos que não estão em conformidade.
    *   **Priorização:**
        *   Módulos com alta complexidade ciclomática.
        *   Módulos com histórico de bugs.
        *   Componentes UI que não seguem as diretrizes de acessibilidade ou estrutura.
*   **Checklist (por módulo/componente refatorado):**
    *   [ ] Nomenclatura de variáveis, funções, classes, etc., revisada e adequada.
    *   [ ] Regras de Object Calisthenics aplicadas.
    *   [ ] Padrões de comentários (mínimos e em inglês) seguidos.
    *   [ ] Tipagem TypeScript revisada e `any` evitado.
    *   [ ] Regras de ESLint (conforme `eslint.config.js`) completamente satisfeitas.
    *   [ ] Testes unitários atualizados ou criados para cobrir as refatorações.
*   **Guia para LLMs/Agentes de IA na Refatoração:**
    *   "Ao refatorar um arquivo ou módulo para os novos padrões, foque em aplicar as regras de `docs/developer/coding-standards.md`."
    *   "Preste atenção especial às regras de Object Calisthenics, como 'Um nível de indentação por método' e 'Não use a palavra-chave ELSE'. Extraia métodos e use guard clauses."
    *   "Substitua comentários desnecessários por código autoexplicativo."
    *   "Certifique-se de que todo o código refatorado passe no lint (`npm run lint`) e nos testes (`npm run test`)."

### Fase 4: Manutenção Contínua e Melhoria (Longo Prazo)

*   **Objetivo:** Garantir que os padrões sejam mantidos e evoluam conforme necessário.
*   **Ações:**
    *   Revisões de código contínuas e rigorosas.
    *   Atualizações periódicas das regras de ESLint e Prettier para alinhamento com as melhores práticas da comunidade.
    *   Revisão e atualização da documentação de padrões conforme o projeto evolui.
    *   **Checklist:**
        *   [ ] Processo de code review inclui verificação explícita dos padrões.
        *   [ ] Ferramentas de linting e formatação são mantidas atualizadas.
        *   [ ] Documentação de padrões é um item vivo e revisado anualmente ou conforme necessidade.

## 3. Validação e Métricas

*   **Linting:** `npm run lint` deve passar sem erros ou warnings significativos.
*   **Testes:** Cobertura de testes deve ser mantida ou aumentada. `npm run test` deve passar.
*   **Revisões de Código:** Feedback das revisões deve indicar conformidade com os padrões.
*   **Inspeção Manual:** Revisões periódicas de amostras do código para verificar a adesão.

## 4. Guia para LLMs e Agentes de IA

*   **Instrução Primária:** "Antes de qualquer tarefa de codificação ou refatoração, você DEVE ler e internalizar completamente o documento `docs/developer/coding-standards.md`. Todas as suas modificações de código DEVEM seguir estritamente essas diretrizes."
*   **Nomenclatura de Arquivos:** "Todos os novos arquivos DEVEM ser nomeados usando kebab-case. Ao modificar arquivos existentes, se o escopo da tarefa permitir, renomeie o arquivo para kebab-case e atualize todas as suas importações."
*   **Refatoração:** "Ao receber uma tarefa para refatorar uma seção do código, aplique TODAS as regras relevantes de `docs/developer/coding-standards.md`, incluindo Object Calisthenics, remoção de comentários desnecessários, e conformidade com ESLint."
*   **Criação de Código Novo:** "Todo código novo DEVE ser escrito em conformidade com `docs/developer/coding-standards.md` desde o início."
*   **Dúvidas:** "Se alguma diretriz em `docs/developer/coding-standards.md` parecer ambígua ou entrar em conflito com os requisitos da tarefa, peça esclarecimentos ANTES de prosseguir."

Este plano de adaptação visa melhorar a qualidade, consistência e manutenibilidade do projeto Project Wiz a longo prazo.
