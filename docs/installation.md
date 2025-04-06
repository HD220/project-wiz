# Instalação e Configuração

## Pré-requisitos

- Node.js 18+
- npm 9+
- Git
- Conta no GitHub (para integração com repositórios)

## Instalação

1.  Clone o repositório:
    ```bash
    git clone <URL do repositório>
    cd project-wiz
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```

## Configuração

1.  **Configuração do GitHub**:
    - Crie um Personal Access Token (PAT) no GitHub:
      1.  Acesse as configurações do seu perfil no GitHub.
      2.  Vá em "Settings" -> "Developer settings" -> "Personal access tokens" -> "Tokens (classic)".
      3.  Clique em "Generate new token" -> "Generate new token (classic)".
      4.  Dê um nome ao token e selecione os escopos (permissions) necessários:
          - `repo`: Para acesso aos repositórios.
          - `workflow`: Para acesso aos workflows.
          - `read:org`: Para ler informações da organização.
      5.  Clique em "Generate token".
      6.  Copie o token gerado.
    - Acesse a seção "Repository Settings" no Project Wiz e insira o PAT no campo correspondente.
2.  **Configuração de Modelos LLM**:
    - Acesse a seção "Model Settings".
    - O Project Wiz lista os modelos LLM disponíveis.
    - Clique no botão "Download" para baixar um modelo.
    - Após o download, você pode configurar os parâmetros do modelo, como:
      - **Temperature**: Controla a aleatoriedade das respostas (0.0 - 1.0).
      - **Max Tokens**: Define o tamanho máximo da resposta.
      - **Memory Limit**: Define o limite de memória para o modelo.
