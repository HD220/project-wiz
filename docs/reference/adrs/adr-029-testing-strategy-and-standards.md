# ADR-029: Estratégia e Padrões de Testes Automatizados

**Status:** Proposto (Considerado Aprovado Conforme Instrução)

**Contexto:**
Testes automatizados são fundamentais para garantir a qualidade do software, prevenir regressões, facilitar refatorações seguras e servir como documentação viva. A análise inicial do codebase `src_refactored/` não revelou uma estrutura de testes automatizados visível ou substancial. Esta ADR define a estratégia e os padrões para a implementação de testes automatizados no Project Wiz, confirmando Vitest como o framework principal.

**Decisão:**

Serão adotados os seguintes padrões e estratégias para testes automatizados:

**1. Framework de Testes Padrão:**
    *   **Padrão:** Vitest é o framework de testes padrão para o Project Wiz.
    *   **Justificativa:** Integração nativa com Vite (usado no projeto), API compatível com Jest (familiar para muitos desenvolvedores), bom suporte a TypeScript e ES Modules, e performance.

**2. Localização e Nomenclatura de Arquivos de Teste:**
    *   **Localização:** Arquivos de teste DEVEM ser co-localizados com os arquivos fonte que estão testando, dentro de um subdiretório chamado `__tests__`.
        *   Exemplo: Para `src_refactored/core/domain/user/user.entity.ts`, o arquivo de teste correspondente será `src_refactored/core/domain/user/__tests__/user.entity.test.ts`.
    *   **Nomenclatura do Arquivo:** `[nome-do-arquivo-testado].test.ts`. (O uso de `.spec.ts` é uma alternativa, mas `.test.ts` será o padrão para consistência).
    *   **Justificativa:** Co-localização facilita encontrar testes relevantes, promove a escrita de testes ao criar ou modificar código, e melhora a organização quando comparado a um diretório de testes monolítico no topo do projeto.

**3. Tipos de Testes e Escopo:**
    *   **a. Testes Unitários (Obrigatórios):**
        *   **Foco:** Isolar e verificar a menor unidade lógica de código (e.g., uma função, um método de uma classe, um componente React em isolamento, um hook customizado).
        *   **Dependências:** Todas as dependências externas à unidade sob teste DEVEM ser mockadas usando as funcionalidades do Vitest (`vi.mock`, `vi.fn`, `vi.spyOn`).
        *   **O Que Testar:**
            *   **Lógica de Negócios:** Regras em Entidades, Objetos de Valor, Serviços de Domínio/Aplicação.
            *   **Funções Utilitárias:** Entradas, saídas, casos de borda.
            *   **Componentes React:** Renderização baseada em props, renderização condicional, chamadas a callbacks de props quando interações simples ocorrem (e.g., clique em botão). Testar o contrato do componente, não detalhes de implementação interna.
            *   **Hooks React Customizados:** Lógica de estado, efeitos colaterais (mockando timers, APIs de browser), valor de retorno com diferentes entradas.
        *   **Justificativa:** São rápidos de executar, fornecem feedback rápido, e ajudam a garantir que cada unidade de código funcione corretamente isoladamente.
    *   **b. Testes de Integração (Altamente Recomendados):**
        *   **Foco:** Verificar a interação correta entre dois ou mais componentes ou camadas do sistema.
        *   **Escopo:** Testar a integração real, mockando o mínimo possível de dependências (geralmente apenas aquelas que são externas ao sistema como um todo, como APIs de terceiros ou o próprio Electron IPC para testes de UI desacoplados do main).
        *   **Exemplos:**
            *   **Caso de Uso + Repositório:** Um Caso de Uso interagindo com uma implementação de repositório (pode ser contra um banco de dados de teste em memória/containerizado, ou um mock do repositório se o foco for apenas no Caso de Uso).
            *   **Serviço de Aplicação + Adaptador:** Um serviço que usa um adaptador para um sistema externo (o adaptador seria mockado para simular respostas do sistema externo).
            *   **UI + `IPCService` (Mockado):** Componentes React que usam `IPCService` para buscar dados ou executar mutações, com o `IPCService` mockado para simular respostas do processo principal.
            *   **Repositório + Banco de Dados:** Testar a implementação `Drizzle[NomeEntidade]Repository` contra uma instância real (de teste) do SQLite para validar queries SQL e mapeamentos ORM.
        *   **Justificativa:** Garantem que as diferentes partes do sistema funcionam juntas corretamente, cobrindo lacunas que os testes unitários não pegam.
    *   **c. Testes End-to-End (E2E) (Opcional/Futuro):**
        *   **Foco:** Testar fluxos completos da aplicação da perspectiva do usuário, interagindo com a UI como um usuário faria.
        *   **Ferramentas (Considerações):** Playwright ou Spectron (específico para Electron).
        *   **Padrão Atual:** Não é um requisito para a fase inicial de padronização, mas a arquitetura deve facilitar a adição de testes E2E no futuro.
        *   **Justificativa:** Maior confiança de que a aplicação funciona como um todo, mas são mais lentos e frágeis que testes unitários/integração.

**4. Mocking e Test Doubles:**
    *   **Padrão:** Utilizar as funcionalidades de mocking do Vitest:
        *   `vi.mock(caminho, factory?)`: Para mockar módulos inteiros.
        *   `vi.fn()`: Para criar funções mock simples.
        *   `vi.spyOn(objeto, 'metodo')`: Para espionar ou mockar métodos de um objeto existente.
    *   **Mocks Manuais:** Para mocks mais complexos ou reutilizáveis, criar arquivos em um diretório `__mocks__` adjacente ao módulo que está sendo mockado (e.g., `src_refactored/core/ports/adapters/__mocks__/llm-adapter.interface.ts` para mockar `ILLMAdapter`). O Vitest pode ser configurado para pegar esses mocks automaticamente.
    *   **Injeção de Mocks (DI):** Ao testar classes que usam DI (InversifyJS), criar um container de teste no setup do teste e vincular implementações mock das dependências para a classe/serviço sob teste.
    *   **Justificativa:** Permite isolar a unidade sob teste e controlar o comportamento de suas dependências.

**5. Cobertura de Testes (Code Coverage):**
    *   **Ferramenta:** Vitest suporta relatórios de cobertura usando `c8` (padrão) ou `istanbul`. A configuração deve estar no `vite.config.ts` ou `vitest.config.ts`.
    *   **Metas (Iniciais Sugeridas):**
        *   Camada de Domínio (`core/domain`): > 90% (contém lógica de negócios crítica).
        *   Camada de Aplicação (`core/application`): > 80%.
        *   Serviços de Infraestrutura (lógica de adaptadores, repositórios): > 75%.
        *   Componentes UI (lógica de renderização, hooks): > 70%.
        *   **Foco na Qualidade:** Mais importante que a porcentagem é a qualidade dos testes – eles devem verificar os comportamentos chave e casos de borda, não apenas inflar números.
    *   **Ação:** Gerar relatórios de cobertura (`pnpm test:coverage`) e usá-los como guia para identificar áreas não testadas.
    *   **Justificativa:** Fornece uma métrica quantificável do alcance dos testes, ajudando a identificar lacunas.

**6. Estrutura e Nomenclatura de Suítes de Teste e Casos de Teste:**
    *   **Padrão:**
        *   Usar `describe(description: string, fn: () => void)` para agrupar casos de teste relacionados (e.g., uma suíte por classe, ou por método público de uma classe).
        *   Usar `it(description: string, fn: () => void | Promise<void>)` ou `test(...)` para casos de teste individuais.
        *   Descrições DEVEM ser claras, em Inglês, e seguir um padrão que indique o que está sendo testado, sob quais condições, e qual o resultado esperado.
            *   Exemplo: `describe('JobEntity', () => { describe('create', () => { it('should throw EntityError if queueName is empty', () => { /* ... */ }); it('should correctly initialize props on valid input', () => { /* ... */ }); }); });`
    *   **Arrange-Act-Assert (AAA):** Estruturar o corpo de cada caso de teste seguindo o padrão AAA:
        1.  **Arrange:** Configurar as condições iniciais, instanciar objetos, preparar mocks.
        2.  **Act:** Executar a unidade de código sob teste.
        3.  **Assert:** Verificar se o resultado (valor de retorno, estado do objeto, chamadas a mocks) é o esperado usando as asserções do Vitest/Jest (e.g., `expect(...).toBe(...)`, `expect(...).toHaveBeenCalledWith(...)`).
    *   **Justificativa:** Testes bem estruturados e nomeados são fáceis de entender, manter e depurar quando falham. O padrão AAA torna os testes mais legíveis.

**7. Execução de Testes:**
    *   **Scripts `package.json`:** Definir scripts para rodar testes:
        *   `test`: Roda todos os testes uma vez.
        *   `test:watch`: Roda testes em modo watch durante o desenvolvimento.
        *   `test:coverage`: Roda testes e gera o relatório de cobertura.
    *   **CI Pipeline:** Integrar a execução de `npm test` (ou equivalente) no pipeline de Integração Contínua (CI) para garantir que novo código não quebre testes existentes antes do merge.
    *   **Justificativa:** Facilita a execução de testes em diferentes contextos e automatiza a verificação de qualidade.

**Consequências:**
*   Aumento da confiança na corretude do código e na estabilidade da aplicação.
*   Redução de regressões durante o desenvolvimento e refatoração.
*   Melhoria no design do código (código testável geralmente é mais modular e desacoplado).
*   Testes servem como uma forma de documentação executável.
*   Feedback rápido para desenvolvedores.

---
**Notas de Implementação para LLMs:**
*   Ao criar ou modificar qualquer arquivo de código fonte (`.ts`, `.tsx`), você DEVE criar/atualizar o arquivo de teste correspondente em um diretório `__tests__` adjacente.
*   Siga o padrão `[nome-do-arquivo].test.ts`.
*   Use `describe` e `it` com descrições claras em Inglês.
*   Aplique o padrão Arrange-Act-Assert (AAA) em seus testes.
*   Mock todas as dependências externas da unidade sob teste usando `vi.mock()` ou `vi.fn()`.
*   Escreva testes para cobrir casos de sucesso, casos de falha esperados e casos de borda.
*   Se estiver implementando uma classe, tente testar cada método público.
*   Se estiver implementando um componente React, teste sua renderização com diferentes props e interações simples.
