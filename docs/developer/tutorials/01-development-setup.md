# Guia: Configurando o Ambiente de Desenvolvimento

Este guia detalha os passos necessários para configurar seu ambiente local para desenvolver e contribuir com o Project Wiz. Ele expande as informações presentes na seção "Como Começar (Desenvolvimento)" do [README principal](../../README.md#como-comecar-desenvolvimento).

## 1. Pré-requisitos Essenciais

Antes de começar, certifique-se de ter os seguintes softwares instalados em seu sistema:

- **Node.js:**
  - É altamente recomendável usar um gerenciador de versões do Node.js como [nvm](https://github.com/nvm-sh/nvm) (Linux/macOS) ou [nvm-windows](https://github.com/coreybutler/nvm-windows) (Windows) para instalar e gerenciar diferentes versões do Node.
  - Verifique o arquivo `.nvmrc` na raiz do projeto para a versão específica do Node.js recomendada. Se não houver `.nvmrc`, a versão LTS mais recente do Node.js é geralmente uma boa escolha.
  - Para instalar com nvm (após instalar nvm):
    ```bash
    nvm install
    nvm use
    ```
- **npm (Node Package Manager):**
  - Vem instalado com o Node.js. Usado para gerenciar as dependências do projeto.
  - Verifique se você está usando uma versão recente do npm: `npm install -g npm@latest`.
- **Git:**
  - Essencial para clonar o repositório e gerenciar o controle de versão. Você pode baixá-lo em [git-scm.com](https://git-scm.com/).

## 2. Clonando o Repositório

1.  Abra seu terminal ou prompt de comando.
2.  Navegue até o diretório onde você deseja armazenar o projeto.
3.  Clone o repositório do Project Wiz (substitua pela URL correta do repositório):
    ```bash
    git clone https://github.com/HD220/project-wiz.git
    ```
4.  Entre no diretório do projeto:
    ```bash
    cd project-wiz
    ```

## 3. Instalando as Dependências

O Project Wiz utiliza npm para gerenciar suas dependências de frontend e backend.

```bash
npm install
```

Este comando lerá o arquivo `package.json` e `package-lock.json` e baixará todas as dependências necessárias para as pastas `node_modules/`.

## 4. Configuração do Banco de Dados (SQLite com Drizzle ORM)

O projeto utiliza SQLite, que é um banco de dados baseado em arquivo e não requer um servidor separado. O Drizzle ORM é usado para definir o schema e executar migrações.

- **Geração de Migrações (se você alterar o schema):**
  Se você fizer alterações nos arquivos de schema do Drizzle (localizados dentro dos diretórios de persistência dos módulos de negócio, ex: `src/main/modules/project-management/persistence/project.schema.ts`), você precisará gerar novos arquivos de migração:
  ```bash
  npm run db:generate
  ```
- **Aplicando Migrações:**
  Para criar o arquivo do banco de dados SQLite e aplicar todas as migrações pendentes (essencial na primeira vez ou após um `git pull` que traga novas migrações):
  ```bash
  npm run db:migrate
  ```
  Isso criará o arquivo do banco de dados (ex: `sqlite.db`) no local configurado.
- **Drizzle Studio (Opcional, mas útil):**
  Para visualizar e interagir com o banco de dados através de uma interface web:
  ```bash
  npm run db:studio
  ```

## 5. Variáveis de Ambiente

Algumas funcionalidades, especialmente integrações com APIs de LLM, podem requerer chaves de API ou outras configurações sensíveis. O projeto provavelmente utiliza um arquivo `.env` para gerenciar essas variáveis.

1.  Procure por um arquivo chamado `.env.example` ou similar na raiz do projeto.
2.  Copie este arquivo para `.env`:
    ```bash
    cp .env.example .env
    ```
3.  Abra o arquivo `.env` em um editor de texto e preencha as variáveis necessárias (como chaves de API para OpenAI, DeepSeek, etc.). **Nunca comite o arquivo `.env` com suas chaves secretas para o repositório Git.** O `.gitignore` já deve estar configurado para ignorá-lo.

## 6. Executando a Aplicação em Modo de Desenvolvimento

Para iniciar o Project Wiz em modo de desenvolvimento, com hot-reloading para o frontend (React/Vite) e o backend (Electron/Node.js), execute:

```bash
npm run dev
```

Este comando utiliza `electron-forge start` nos bastidores. A aplicação Electron deverá abrir. Quaisquer alterações que você fizer no código-fonte devem recarregar a aplicação automaticamente.

## 7. Comandos Essenciais do Projeto

Para facilitar o desenvolvimento, o `package.json` contém vários scripts úteis. Aqui estão os mais importantes:

- **Rodar a Aplicação (Desenvolvimento):**

  ```bash
  npm run dev
  ```

  _Inicia a aplicação em modo de desenvolvimento com recarregamento automático._

- **Construir para Produção:**

  ```bash
  npm run build
  ```

  _Compila e empacota a aplicação para distribuição._

- **Executar Testes:**
  - Para rodar todos os testes uma vez:
    ```bash
    npm run test
    ```
  - Para rodar os testes em modo "watch" (re-executa ao salvar):
    ```bash
    npm run test:watch
    ```
  - Para gerar um relatório de cobertura de testes:
    ```bash
    npm run test:coverage
    ```

- **Análise e Formatação de Código:**
  - Para verificar o código com ESLint e tentar corrigir problemas:
    ```bash
    npm run lint
    ```
  - Para formatar todo o código com Prettier:
    ```bash
    npm run format
    ```
  - Para verificar se o código está formatado (útil em CI):
    ```bash
    npm run format:check
    ```

- **Gestão do Banco de Dados (Drizzle):**
  - Para gerar migrações após alterar o schema:
    ```bash
    npm run db:generate
    ```
  - Para aplicar migrações ao banco de dados:
    ```bash
    npm run db:migrate
    ```
  - Para abrir o Drizzle Studio (interface web para o DB):
    ```bash
    npm run db:studio
    ```

## Conclusão

Com estes passos, seu ambiente de desenvolvimento para o Project Wiz deve estar configurado e pronto. Se encontrar problemas, verifique as issues abertas no repositório do projeto ou considere abrir uma nova issue com detalhes do problema.
