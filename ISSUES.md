# Project Wiz

A sequência lógica para o desenvolvimento do projeto deve seguir um fluxo que permita construir uma base sólida e evoluir gradualmente as funcionalidades. A seguir, organizo as atividades em uma ordem que respeita a dependência entre os componentes e o fluxo natural de implementação

## **Fase 1: Configuração Inicial e Preparação do Ambiente**

1. **Criar estrutura do monorepo**
   - Tarefa 1.1: Criar estrutura do monorepo com Lerna ou Nx.
   - Tarefa 1.2: Configurar `package.json` para cada serviço do monorepo.
   - Tarefa 1.3: Configurar ESLint, Prettier e outras ferramentas de linting.

2. **Configurar Docker e docker-compose**
   - Tarefa 2.1: Criar `Dockerfile` para Autocode Service e Local.
   - Tarefa 2.2: Criar `docker-compose.yml` para integrar os serviços.
   - Tarefa 2.3: Testar `docker-compose` para garantir que todos os serviços iniciam corretamente.

3. **Definir e configurar variáveis de ambiente**
   - Tarefa 3.1: Definir as variáveis de ambiente para cada serviço.
   - Tarefa 3.2: Criar um `.env.example` para documentar as variáveis.
   - Tarefa 3.3: Documentar o processo de inicialização no README.

## **Fase 2: Integração com GitHub e Autenticação**

1. **Implementar Webhook e Clonagem de Repositórios**
   - Tarefa 4.1: Configurar o webhook no GitHub para enviar eventos.
   - Tarefa 4.2: Implementar rota no Autocode Service para receber eventos do webhook.
   - Tarefa 4.3: Implementar função para clonar repositórios no Autocode Service (@octokit/rest).
   - Tarefa 4.4: Testar clonar repositórios públicos.

2. **Autenticação com Repositórios Privados**
   - Tarefa 5.1: Implementar OAuth para autenticação com repositórios privados.
   - Tarefa 5.2: Testar clonagem de repositórios privados.

## **Fase 3: Armazenamento e Busca de Dados no ChromaDB**

1. **Implementar e Testar Armazenamento de Contexto**
   - Tarefa 6.1: Definir esquema de armazenamento no ChromaDB.
   - Tarefa 6.2: Implementar endpoints para salvar contexto no ChromaDB.
   - Tarefa 6.3: Testar armazenamento de diferentes versões de código.

2. **Implementar Pesquisa e Integração com Pipeline**
   - Tarefa 7.1: Criar funcionalidade de pesquisa no ChromaDB.
   - Tarefa 7.2: Testar a pesquisa de issues no ChromaDB.
   - Tarefa 7.1: Integrar ChromaDB ao pipeline do Autocode Local.
   - Tarefa 7.2: Integrar ChromaDB ao pipeline do Autocode Service.

## **Fase 4: Criação e Gerenciamento de Issues**

1. **Criar e Gerenciar Issues Automáticas**
   - Tarefa 8.1: Desenvolver funcionalidade para análise de código.
   - Tarefa 8.2: Implementar integração com API do GitHub para criar issues automáticas.
   - Tarefa 8.3: Implementar verificação de duplicação de issues com ChromaDB.
   - Tarefa 8.4: Testar criação de issues duplicadas.

2. **Checklists e Referências de Issues**
   - Tarefa 9.1: Gerar checklists automáticas nas issues.
   - Tarefa 9.2: Testar diferentes checklists em issues.
   - Tarefa 9.3: Criar referências entre issues semelhantes.
   - Tarefa 9.4: Testar referências cruzadas entre issues.

## **Fase 5: Análise e Modificação de Código com GPT**

1. **Análise de Código via GPT**
    - Tarefa 10.1: Configurar integração com GPT para análise de código.
    - Tarefa 10.2: Implementar análise estática básica com GPT.
    - Tarefa 10.3: Testar sugestões de melhorias via GPT.

2. **Modificação de Código e Suporte AST**
    - Tarefa 11.1: Implementar funcionalidade para aplicar sugestões do GPT no código.
    - Tarefa 11.2: Configurar recast para modificações AST.
    - Tarefa 11.3: Testar alterações AST no código.
    - Tarefa 11.4: Testar modificações automáticas do código.

## **Fase 6: Validação e Testes**

1. **Configuração de Testes Unitários e Validações**
    - Tarefa 12.1: Configurar Jest para testes unitários.
    - Tarefa 12.2: Criar testes unitários para Autocode Local.
    - Tarefa 12.3: Testar execução automática de testes no pipeline.
    - Tarefa 12.4: Configurar `commitlint` para garantir convenções de commit.
    - Tarefa 12.5: Testar convenções de commit com diferentes cenários.

2. **Automatização de Pull Requests**
    - Tarefa 13.1: Automatizar criação de pull requests no pipeline de CI/CD.
    - Tarefa 13.2: Testar criação automática de pull requests.

## **Fase 7: Deploy Automático**

1. **Configurar Pipeline de CI/CD e Deploy**
    - Tarefa 14.1: Configurar pipeline de CI/CD (GitHub Actions, Jenkins, etc.).
    - Tarefa 14.2: Configurar ambiente de staging para deploy automático.
    - Tarefa 14.3: Testar deploy automático em staging após pull requests.

2. **Verificação de Segurança no Pipeline**
    - Tarefa 15.1: Configurar verificações de segurança (Dependabot, escaneamento de vulnerabilidades).
    - Tarefa 15.2: Testar bloqueios de deploy em caso de falhas de segurança.
