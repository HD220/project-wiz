# Guia: Estratégia de Testes

Este documento descreve a estratégia de testes adotada no Project Wiz, incluindo os tipos de testes utilizados, as ferramentas e as melhores práticas para garantir a qualidade e a estabilidade da aplicação.

## 1. Filosofia de Testes

Acreditamos que uma estratégia de testes abrangente é fundamental para:

*   **Garantir a Qualidade:** Entregar um software que funcione conforme o esperado.
*   **Prevenir Regressões:** Evitar que novas alterações quebrem funcionalidades existentes.
*   **Facilitar a Refatoração:** Permitir que o código seja modificado com confiança.
*   **Melhorar o Design do Código:** Escrever código testável geralmente leva a um design mais modular e desacoplado.
*   **Documentar o Comportamento:** Testes servem como uma forma de documentação viva do comportamento esperado do sistema.

Incentivamos uma abordagem de "Pirâmide de Testes" (ou um balanço pragmático dela), com uma base sólida de testes unitários, uma camada de testes de integração e testes end-to-end (E2E) para os fluxos mais críticos.

## 2. Ferramentas de Teste

Conforme o `package.json` e as configurações do projeto:

*   **Framework de Teste Principal:** [Vitest](https://vitest.dev/)
    *   Utilizado para testes unitários e de integração.
    *   Conhecido por sua rapidez, API compatível com Jest, e boa integração com Vite.
*   **Testes de Componentes React (Frontend):**
    *   Provavelmente utiliza [Testing Library](https://testing-library.com/docs/react-testing-library/intro/) (ex: `@testing-library/react`) em conjunto com Vitest para testar componentes React, focando no comportamento do ponto de vista do usuário.
*   **Testes End-to-End (E2E) para Electron:**
    *   Para testes E2E da aplicação Electron, ferramentas como [Playwright](https://playwright.dev/) ou [Spectron](https://www.electronjs.org/pt/docs/latest/tutorial/testing-spectron) (embora Spectron esteja em fim de vida e Playwright seja mais moderno) podem ser consideradas ou já estar em uso. *(Esta parte pode precisar de confirmação ou ser marcada como "a ser definida" se não estiver claro no projeto).*
*   **Cobertura de Código:**
    *   Vitest possui integração com `c8` ou `istanbul` para gerar relatórios de cobertura de código. O script `npm run test:coverage` geralmente executa isso.

## 3. Tipos de Testes

### 3.1. Testes Unitários

*   **Foco:** Testar a menor unidade de código isoladamente (funções, métodos de classes, componentes React simples).
*   **Características:** Rápidos, numerosos, fáceis de escrever e manter.
*   **Localização:** Geralmente em arquivos `*.test.ts` ou `*.spec.ts` próximos aos arquivos de código que estão testando.
*   **Exemplo:** Testar uma função utilitária, a lógica interna de um hook React, ou o render de um componente simples com diferentes props.

### 3.2. Testes de Integração

*   **Foco:** Testar a interação entre duas ou mais unidades/módulos do sistema.
*   **Características:** Mais lentos que testes unitários, mas mais rápidos que E2E. Verificam se diferentes partes do sistema funcionam bem juntas.
*   **Localização:** Podem estar em pastas de teste dedicadas ou junto aos módulos que integram.
*   **Exemplo:**
    *   Testar a integração entre um caso de uso (use case) e seu repositório.
    *   Testar a comunicação entre o processo principal do Electron e o processo de renderer.
    *   Testar um fluxo de formulário React que envolve múltiplos componentes e validação.

### 3.3. Testes End-to-End (E2E)

*   **Foco:** Testar a aplicação completa do ponto de vista do usuário, simulando fluxos reais de interação através da UI.
*   **Características:** Mais lentos, mais complexos de escrever e manter, mas fornecem a maior confiança de que a aplicação está funcionando corretamente como um todo.
*   **Localização:** Geralmente em uma pasta de testes E2E separada.
*   **Exemplo:**
    *   Simular o login de um usuário, criação de um projeto, definição de uma Persona e atribuição de um Job.
    *   Verificar se um Job é executado e se o resultado esperado aparece na UI.
*   *(A estratégia e ferramentas específicas para E2E no Project Wiz podem precisar de mais detalhamento conforme o projeto amadurece).*

### 3.4. Testes de Schema de Banco de Dados (Potencial)

*   Com Drizzle ORM, podem existir testes para verificar a corretude das definições de schema ou a lógica de migrações, embora isso seja menos comum como uma categoria separada de "testes de aplicação".

## 4. Onde Encontrar os Testes

*   **Testes Unitários e de Integração:** Procure por arquivos com sufixos como `.test.ts`, `.spec.ts`, `.test.tsx`, ou `.spec.tsx` dentro das pastas `src/` ou em uma pasta `tests/` na raiz.
*   **Testes E2E:** Se existirem, provavelmente em uma pasta dedicada como `e2e/` ou `tests-e2e/`.

## 5. Executando os Testes

Consulte o [Guia de Configuração do Ambiente de Desenvolvimento](./06-development-setup.md#8-executando-testes) para os comandos exatos (`npm run test`, `npm run test:watch`, `npm run test:coverage`).

## 6. Melhores Práticas e Diretrizes

*   **Escreva testes para novo código:** Sempre que adicionar uma nova funcionalidade ou corrigir um bug, adicione testes correspondentes.
*   **Testes devem ser independentes:** A falha ou sucesso de um teste não deve afetar outros.
*   **Testes devem ser repetíveis:** Devem produzir o mesmo resultado sempre que executados em um ambiente consistente.
*   **Foco no comportamento, não na implementação:** Especialmente para testes de componentes e E2E, teste o que o usuário vê e faz, não os detalhes internos da implementação.
*   **Mantenha os testes rápidos:** Testes lentos desencorajam sua execução frequente.
*   **Revise os testes:** Testes são código e devem ser mantidos e revisados como qualquer outro código.
*   **Monitore a cobertura de código:** Use os relatórios de cobertura como um guia, mas não como o único objetivo. 100% de cobertura não significa ausência de bugs.

## Conclusão

Uma estratégia de testes robusta é um investimento na qualidade e sustentabilidade do Project Wiz. Contribuições para o código devem, idealmente, incluir testes apropriados. Este documento serve como um guia para entender a abordagem de testes do projeto e será atualizado conforme as práticas evoluem.
