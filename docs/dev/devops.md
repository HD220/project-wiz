# Configuração do Ambiente e Deploy (devops.md)

Este documento detalha como configurar o ambiente de desenvolvimento, rodar a aplicação localmente, e informações sobre o processo de build e deploy.

## 1. Como Rodar Localmente

Para rodar o **project-wiz** localmente, siga os passos abaixo:

### Pré-requisitos

-   **Node.js:** Versão 18.x ou superior. Recomenda-se usar um gerenciador de versões como `nvm` (Node Version Manager).
-   **npm:** Vem com o Node.js. Certifique-se de que está atualizado (`npm install -g npm@latest`).
-   **Git:** Para clonar o repositório.

### Passos para Configuração

1.  **Clonar o Repositório:**
    ```bash
    git clone https://github.com/your-repo/project-wiz.git
    cd project-wiz
    ```

2.  **Instalar Dependências:**
    ```bash
    npm install
    ```
    Este comando instalará todas as dependências do projeto, incluindo as do Electron, React, e outras bibliotecas.

3.  **Variáveis de Ambiente:**
    Crie um arquivo `.env` na raiz do projeto, baseado no `.env.example`. Atualmente, não há variáveis de ambiente críticas para o funcionamento local, mas é uma boa prática tê-lo para futuras configurações (ex: chaves de API para testes).

4.  **Rodar a Aplicação em Modo de Desenvolvimento:**
    ```bash
    npm run start
    ```
    Este comando iniciará o processo principal do Electron e o servidor de desenvolvimento do Vite para o processo de renderização. A aplicação será aberta em uma nova janela.

## 2. Scripts Disponíveis

Os seguintes scripts estão definidos no `package.json` e podem ser executados via `npm run <script-name>`:

-   `start`: Inicia a aplicação em modo de desenvolvimento.
-   `build`: Compila a aplicação para produção.
-   `make`: Empacota a aplicação para distribuição (gera instaladores/executáveis).
-   `lint`: Executa o linter (ESLint) para verificar problemas de estilo e qualidade de código.
-   `test`: Executa os testes unitários e de integração (Vitest).
-   `test:ui`: Executa os testes com interface de usuário (Vitest UI).
-   `format`: Formata o código usando Prettier.
-   `typecheck`: Executa a verificação de tipos com TypeScript.
-   `drizzle:migrate`: Executa as migrações do Drizzle ORM para o banco de dados.
-   `drizzle:studio`: Inicia o Drizzle Studio para visualizar e gerenciar o banco de dados.
-   `drizzle:generate`: Gera novas migrações do Drizzle ORM com base nas mudanças do schema.

## 3. Build e Empacotamento

O empacotamento da aplicação é feito utilizando **Electron Forge**.

-   **Configuração:** O arquivo `forge.config.cts` na raiz do projeto contém as configurações para o empacotamento, incluindo os bundlers (Vite), makers (para diferentes formatos de instaladores) e publicadores.

-   **Processo de Build:**
    ```bash
    npm run build
    ```
    Este comando compila o código TypeScript para JavaScript e prepara os assets para o empacotamento. Os arquivos compilados são colocados na pasta `out/`.

-   **Empacotamento (Making):**
    ```bash
    npm run make
    ```
    Após o build, este comando utiliza o Electron Forge para gerar os pacotes de distribuição para as plataformas configuradas (ex: `.exe` para Windows, `.dmg` para macOS, `.deb`/`.rpm` para Linux). Os artefatos finais são encontrados em `out/make/`.

## 4. Testes Automatizados

Os testes são configurados com **Vitest**.

-   **Executar Testes:**
    ```bash
    npm run test
    ```
-   **Executar Testes com UI:**
    ```bash
    npm run test:ui
    ```

## 5. CI/CD Pipelines (Informações Gerais)

Atualmente, não há pipelines de CI/CD configuradas neste repositório. No entanto, para um ambiente de produção, recomenda-se a integração com ferramentas como GitHub Actions, GitLab CI/CD ou Jenkins para automatizar os processos de:

-   **Build:** Compilar a aplicação em cada push para o branch principal.
-   **Testes:** Rodar todos os testes automaticamente para garantir a qualidade do código.
-   **Linting/Type Checking:** Garantir que o código segue os padrões e está livre de erros de tipo.
-   **Empacotamento:** Gerar os artefatos de distribuição automaticamente.
-   **Publicação:** Publicar novas versões em um servidor de atualização ou repositório de releases.

## 6. Serviços Externos Envolvidos

Atualmente, a aplicação não se integra diretamente com serviços externos de autenticação (Auth0), pagamentos (Stripe) ou monitoramento de erros (Sentry). A arquitetura é projetada para ser extensível, permitindo a fácil integração com esses serviços no futuro, principalmente através do módulo `llm-provider` para diferentes APIs de modelos de linguagem.