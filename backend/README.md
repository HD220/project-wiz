# ProjectWiz

O **ProjectWiz** é um serviço autônomo projetado para auxiliar no desenvolvimento de software, permitindo a automação de tarefas de codificação, criação de issues, geração de pull requests, e muito mais. Ele foi criado com a intenção de atuar como um bot programador que opera em integração com o GitHub, Chromadb e o GPT para otimizar o fluxo de trabalho dos desenvolvedores.

## Visão Geral

O **ProjectWiz** é composto por duas funcionalidades principais:

1. **ProjectWiz Service**: Responsável por gerenciar as conexões com o GitHub, criar issues, documentações, gerenciar tokens e manter o controle do projeto.
2. **ProjectWiz Developer**: Executa as alterações de código, cria testes unitários e realiza commits, atuando diretamente no ambiente de desenvolvimento, usa as informações geradas pelo Service para entender os contextos.

Ambos os serviços funcionam de forma independente, mas compartilham a comunicação via **redis** e armazenamento de dados de configuração no **redis** e dados de contextualização no **ChromaDB**.

## Funcionalidades

- Autenticação no GitHub para acessar repositórios privados.
- Criação e gerenciamento de **issues**.
- Processamento e modificação de código usando **Codex (davinci-002)** com ferramentas AST.
- Geração automática de **pull requests**.
- Execução de testes unitários.
- Integração com **ChromaDB** para armazenamento de dados de contexto.
- Capacidade de identificar e evitar a criação de issues duplicadas.
- Geração de código utilizando o padrão **Conventional Commits**.

## Arquitetura

### Componentes

- **ProjectWiz Service**:
  - Responsável por gerenciar o repositório GitHub e realizar o gerenciamento de issues.
  - Conecta-se ao GPT para gerar sugestões e melhorias no código.
  - Usa **ChromaDB** para armazenar o contexto do código e das issues.
  
- **ProjectWiz Local**:
  - Executa localmente em containers Docker, monitorando e alterando o código de forma autônoma.
  - Baseia-se nas tarefas divididas pelo **ProjectWiz Service** e realiza as modificações e testes necessários.
  
- **BullMQ**: Para orquestrar a troca de mensagens entre os serviços.

- **ChromaDB**: Banco de dados vetorial utilizado para armazenar e acessar o contexto do código e issues, permitindo um melhor entendimento e continuidade das tarefas.

### Fluxo de Trabalho

1. **Inicialização**:
   - O ProjectWiz clona o repositório do GitHub e realiza uma varredura inicial para criar um dicionário de dados e código, que é armazenado no **ChromaDB**.
   - Na primeira execução, o ProjectWiz gera o dicionário completo do código-base.

2. **Criação de Issues**:
   - O serviço gera **issues** baseadas no código e nos comentários presentes no repositório.
   - A IA realiza uma análise das issues já existentes antes de criar uma nova, evitando duplicações.

3. **Tarefas**:
   - Cada issue é dividida em tarefas menores. Essas tarefas são automaticamente marcadas em checklists dentro das issues do GitHub.

4. **Execução Local**:
   - O ProjectWiz Local executa as tarefas, gera testes unitários e faz commit das alterações.
   - Quando todas as tarefas são concluídas, um **pull request** é criado para a branch principal.

5. **Validações e Deploy**:
   - Após a conclusão de um pull request, o código passa por validações automáticas, como testes unitários e validações de convenções de commit.

## Requisitos

- Node.js (versão 18+)
- Docker
- Redis
- ChromaDB
- Conta no GitHub com permissões adequadas

### Diretrizes para o ProjectWiz

1. **Test-Driven Development (TDD)**:  
   - Escrever os testes antes do código de produção.
   - Garantir que cada função seja devidamente testada e que o código só seja considerado "pronto" quando passar em todos os testes.

2. **Princípios SOLID**:  
   - Aplicar os princípios de design para garantir que o código seja modular, extensível e de fácil manutenção.
   - Seguir os cinco princípios do SOLID:
     1. **Single Responsibility Principle** (SRP)
     2. **Open/Closed Principle** (OCP)
     3. **Liskov Substitution Principle** (LSP)
     4. **Interface Segregation Principle** (ISP)
     5. **Dependency Inversion Principle** (DIP)

3. **Padrões de Projeto (Design Patterns)**:  
   - Utilizar padrões como **Factory**, **Singleton**, **Observer**, **Adapter**, **Strategy**, etc., quando necessário.
   - Manter o código limpo e reutilizável.

4. **Commitlint**:  
   - Garantir que todas as mensagens de commit sigam o padrão **Conventional Commits**.
   - Evitar commits ambíguos ou sem relação clara com o que foi modificado.

5. **Semantic-release**:  
   - Automatizar o processo de versionamento baseado em commits.
   - Gerar changelogs automaticamente e realizar deploys contínuos.

6. **CI/CD**:  
   - Configurar um pipeline de **CI/CD** para executar testes automatizados, fazer build e realizar o deploy automático.
   - A integração contínua ajuda a identificar problemas rapidamente e a entrega contínua garante que o código sempre esteja pronto para produção.

7. **Testes Automatizados**:  
   - Escrever **testes unitários**, **testes de integração** e **testes end-to-end**.
   - Garantir que os testes sejam executados automaticamente no pipeline de CI/CD.

8. **Linting e Formatação de Código**:
   - Utilizar as ferramentas **ESLint** e **Prettier** para garantir um código limpo e consistente.
   - Integrar essas ferramentas no pipeline de CI para garantir que o código passe pelas verificações de estilo antes de ser mesclado.

9. **Documentação**:
   - Manter uma documentação clara e atualizada do projeto, incluindo um **README.md** e documentos de especificação técnica.
   - Gerar automaticamente a documentação de API, caso aplicável.

10. **Monitoração e Logging**:
    - Configurar **logging** eficiente (ex. usando o **pino** ou outra biblioteca).
    - Monitorar a performance e o comportamento do código em produção, integrando ferramentas como o **OpenTelemetry**.

11. **Segurança**:
    - Implementar práticas de segurança, como controle de acesso, criptografia de dados sensíveis, e testes de segurança automatizados.
    - Verificar dependências com ferramentas como **npm audit** ou **Snyk**.

12. **Gerenciamento de Dependências**:
    - Utilizar ferramentas como o **Renovate** ou **Dependabot** para garantir que as dependências estejam sempre atualizadas e seguras.

13. **Code Review**:
    - Implementar revisões de código como parte do fluxo de trabalho, para garantir que o código seja revisado por outro desenvolvedor antes de ser mesclado.

## Instalação

1. Clone este repositório:

```bash
git clone https://github.com/HD220/project-wiz.git
cd project-wiz
```

2. Instale as dependências:

```bash
npm install
```

3. Configure o arquivo `.env` com as suas credenciais do GitHub e do OpenAI API.

4. Inicialize os containers Docker:

```bash
docker-compose up
```

## Configuração

Certifique-se de configurar as seguintes variáveis de ambiente no arquivo `.env`:

```plaintext
GITHUB_TOKEN=seu-token-github
OPENAI_API_KEY=sua-api-key-gpt
CHROMA_DB_URL=http://localhost:8000
```

## Uso

1. Para iniciar o **ProjectWiz Service**:

```bash
npm run start
```

### Desenvolvimento

Durante o desenvolvimento local, você pode utilizar o **ngrok** para expor endpoints que recebem notificações via webhook do GitHub para que o **ProjectWiz** inicie atividades de analise das alterações realizadas.

```bash
npx ngrok http 3000
```

## Contribuição

Contribuições são bem-vindas! Siga os passos abaixo para colaborar:

1. Faça um fork do repositório.
2. Crie uma nova branch (`git checkout -b feature/sua-feature`).
3. Realize suas modificações e faça commit (`git commit -m 'Adiciona nova feature'`).
4. Envie para o repositório (`git push origin feature/sua-feature`).
5. Abra um **Pull Request**.

## Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais detalhes.

## Contato

Se você tiver alguma dúvida ou sugestão, entre em contato através do e-mail: dev@projectwiz.com.