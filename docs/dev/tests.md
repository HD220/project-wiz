# Testes (tests.md)

Este documento descreve a estratégia de testes da aplicação, como executar os testes e as ferramentas utilizadas.

## 1. Tipos de Testes Existentes

A aplicação utiliza principalmente **testes unitários** e **testes de integração** para garantir a qualidade e o comportamento esperado do código.

- **Testes Unitários:** Focam em testar unidades isoladas de código (funções, classes, métodos) para verificar se funcionam conforme o esperado, sem dependências externas.
- **Testes de Integração:** Verificam a interação entre diferentes componentes ou módulos do sistema, garantindo que eles funcionam corretamente quando combinados (ex: um serviço interagindo com um repositório, ou um handler IPC com um serviço).

## 2. Estrutura da Pasta de Testes

Os testes estão localizados na pasta `tests/` na raiz do projeto, e também podem estar próximos ao código que testam (colocação de testes co-localizados).

- `tests/test-setup.ts`: Arquivo de configuração global para os testes, onde podem ser definidos mocks, configurações de ambiente de teste, etc.
- Testes para o **Main Process** (`src/main`): Geralmente localizados dentro das pastas `application/`, `domain/`, `persistence/` e `ipc/` de cada módulo, ou em uma pasta `__tests__` adjacente.
- Testes para o **Renderer Process** (`src/renderer`): Localizados nas pastas `__tests__` ou `test` dentro dos componentes, hooks ou features.

## 3. Como Rodar os Testes

Os testes são executados utilizando o **Vitest**.

- **Executar todos os testes:**

  ```bash
  npm run test
  ```

  Este comando executa todos os testes unitários e de integração configurados no projeto.

- **Executar testes em modo de observação (watch mode):**

  ```bash
  npm run test -- --watch
  ```

  Útil durante o desenvolvimento, pois reexecuta os testes automaticamente quando há mudanças nos arquivos.

- **Executar testes com interface de usuário (UI):**

  ```bash
  npm run test:ui
  ```

  Abre uma interface web interativa para visualizar e depurar os testes, o que pode ser muito útil para entender falhas e cobertura.

- **Executar testes específicos:**
  Para rodar um arquivo de teste específico, você pode passar o caminho para o comando `test`:
  ```bash
  npm run test src/main/modules/agent-management/application/agent.service.test.ts
  ```

## 4. Cobertura e Ferramentas Utilizadas

- **Vitest:** É o framework de testes utilizado, conhecido por sua velocidade e compatibilidade com o ecossistema Vite. Ele oferece funcionalidades como `watch mode`, `hot module replacement` e suporte a TypeScript nativo.
- **Cobertura de Código:** A configuração do Vitest (`vitest.config.mts`) pode ser configurada para gerar relatórios de cobertura de código, indicando quais partes do código foram testadas. Para gerar um relatório de cobertura, você pode usar:
  ```bash
  npm run test -- --coverage
  ```
  O relatório de cobertura será gerado na pasta `coverage/`.

## 5. Mocks e Stubs

Para isolar as unidades de teste e controlar o comportamento de dependências externas, são utilizados mocks e stubs. O Vitest oferece funcionalidades integradas para criar mocks de módulos, funções e classes, permitindo simular comportamentos específicos e verificar interações.
