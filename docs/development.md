# Desenvolvimento

## Configuração do Ambiente

1.  **Node.js e npm**: Certifique-se de ter o Node.js (versão 18+) e o npm (versão 9+) instalados.
2.  **Editor de código**: Use um editor de código como o VS Code, com as extensões recomendadas para TypeScript, ESLint e Prettier.
3.  **Git**: Certifique-se de ter o Git instalado.
4.  **Dependências**:
    - Execute `npm install` no diretório raiz do projeto para instalar as dependências.

## Guia de Contribuição

1.  **Fork do repositório**: Faça um fork do repositório do Project Wiz no GitHub.
2.  **Criação da branch**: Crie uma branch para sua feature ou correção:
    ```bash
    git checkout -b feature/sua-feature
    ```
3.  **Implementação**: Faça as alterações no código.
4.  **Commit**: Faça commit das suas mudanças, seguindo as convenções de commit do projeto:
    ```bash
    git commit -m "feat: Adiciona nova feature"
    ```
    ou
    ```bash
    git commit -m "fix: Corrige um bug"
    ```
5.  **Push**: Faça push para a branch no seu repositório fork:
    ```bash
    git push origin feature/sua-feature
    ```
6.  **Pull Request**: Abra um Pull Request no repositório original do Project Wiz.

## Padrões de Código e Estilo

- **ESLint e Prettier**: Siga os padrões de código e estilo definidos no arquivo `.eslintrc.json` e `.prettierrc.js`.
- **TypeScript**: Use TypeScript para tipagem estática e para garantir a qualidade do código.
- **Convenções de Commit**: Use as convenções de commit do projeto para facilitar a leitura do histórico de commits.

## Testes

- **Testes Unitários**: Use o Jest para testes unitários. Os testes unitários devem cobrir a maior parte do código possível.
- **Testes de Integração**: Use testes de integração para testar a comunicação entre os componentes e a integração com o GitHub.
- **Executando os testes**:
  ```bash
  npm test
  ```

## Processo de Build e Deploy

- **Build do Frontend**: Use o Vite para build do frontend.
  ```bash
  npm run build
  ```
- **Build do Aplicativo Electron**: Use o Electron Forge para build do aplicativo Electron.
  ```bash
  npm run package
  ```
- **Deploy**: (Em desenvolvimento) - Detalhes sobre o processo de deploy serão adicionados em breve.
