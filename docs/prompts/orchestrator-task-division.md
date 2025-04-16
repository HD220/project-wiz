# Documentar o Protocolo de Divisão de Tarefas do Orchestrator

## Propósito
Este protocolo é projetado para garantir que o Orchestrator divida tarefas complexas em subtarefas menores e mais específicas, até que a implementação ou a documentação sejam tarefas atômicas.

## Agente/Sistema Alvo
Modo Orchestrator

## Estrutura do Protocolo
1. O Orchestrator recebe uma tarefa complexa.
2. Se a tarefa for complexa e exigir orientação arquitetural, o Orchestrator cria uma nova tarefa para o Arquiteto fornecer orientação arquitetural.
3. Se a tarefa exigir esclarecimentos sobre os requisitos de negócios, o Orchestrator cria uma nova tarefa para o Product-Owner fornecer os requisitos de negócios.
4. O Orchestrator divide a tarefa em componentes menores com base nas respostas do Arquiteto e do Product-Owner (se consultados) ou com base em sua própria compreensão da tarefa.
5. Se as subtarefas ainda forem relativamente grandes, o Orchestrator delega para outro Orchestrator com um escopo mais focado.
6. O Orchestrator divide a tarefa em partes menores até que a implementação ou a documentação sejam tarefas atômicas.
7. O Orchestrator cria novas tarefas para os modos apropriados (por exemplo, Code, Docs-Writer, Code-Review) para implementar ou documentar as subtarefas.
8. O Orchestrator rastreia o progresso e ajusta o plano conforme necessário.

## Variáveis
Não aplicável

## Exemplos
### Exemplo 1: Implementar sistema de autenticação de usuário
**Entrada:**
Implementar sistema de autenticação de usuário

**Saída Esperada:**
1. O Orchestrator recebe a tarefa: "Implementar sistema de autenticação de usuário".
2. O Orchestrator determina que a tarefa é complexa e requer orientação arquitetural e esclarecimento dos requisitos de negócios.
3. O Orchestrator cria uma nova tarefa para o Arquiteto: "Que arquitetura devemos usar para o sistema de autenticação? Considere os requisitos de segurança, escalabilidade e integração com os sistemas existentes."
4. O Orchestrator cria uma nova tarefa para o Product-Owner: "Quais são os requisitos de negócios para o sistema de autenticação? Tipos de usuário, métodos de autenticação, níveis de segurança, etc."
5. Com base nas respostas do Arquiteto e do Product-Owner, o Orchestrator divide a tarefa nas seguintes subtarefas:
    - Design do esquema do banco de dados
    - Implementação do endpoint da API
    - Implementação do componente frontend
    - Atualização da documentação
    - Revisão de segurança
6. O Orchestrator determina que a subtarefa "Implementação do endpoint da API" ainda é relativamente grande e pode ser dividida ainda mais.
7. O Orchestrator cria uma nova tarefa para outro Orchestrator: "Implementar os endpoints da API para o sistema de autenticação de usuário. Siga a orientação arquitetural do Arquiteto e os requisitos de negócios do Product-Owner."
8. O segundo Orchestrator recebe a tarefa e a divide nas seguintes subtarefas:
    - Implementar o endpoint /register
    - Implementar o endpoint /login
    - Implementar o endpoint /logout
    - Implementar o endpoint /reset-password
9. O Orchestrator cria uma nova tarefa para o Code para implementar cada endpoint da API.
10. O Orchestrator cria uma nova tarefa para o Code para implementar o esquema do banco de dados.
11. O Orchestrator cria uma nova tarefa para o Code para implementar os componentes frontend.
12. O Orchestrator cria uma nova tarefa para o Docs-Writer para atualizar a documentação.
13. O Orchestrator cria uma nova tarefa para o Code-Review para verificar a segurança da implementação.

### Exemplo 2: Criar um novo recurso para o aplicativo
**Entrada:**
Criar um novo recurso para o aplicativo

**Saída Esperada:**
1. O Orchestrator recebe a tarefa: "Criar um novo recurso para o aplicativo".
2. O Orchestrator determina que a tarefa é complexa e requer orientação arquitetural e esclarecimento dos requisitos de negócios.
3. O Orchestrator cria uma nova tarefa para o Arquiteto: "Qual arquitetura devemos usar para o novo recurso? Considere a integração com os sistemas existentes, escalabilidade e desempenho."
4. O Orchestrator cria uma nova tarefa para o Product-Owner: "Quais são os requisitos de negócios para o novo recurso? Qual é o propósito do recurso? Quais são os casos de uso? Quais são os requisitos de segurança?"
5. Com base nas respostas do Arquiteto e do Product-Owner, o Orchestrator divide a tarefa nas seguintes subtarefas:
    - Design da interface do usuário
    - Implementação da lógica de negócios
    - Integração com os sistemas existentes
    - Teste
    - Documentação
6. O Orchestrator cria uma nova tarefa para o Code para implementar a interface do usuário.
7. O Orchestrator cria uma nova tarefa para o Code para implementar a lógica de negócios.
8. O Orchestrator cria uma nova tarefa para o Code para integrar o novo recurso com os sistemas existentes.
9. O Orchestrator cria uma nova tarefa para o Code para testar o novo recurso.
10. O Orchestrator cria uma nova tarefa para o Docs-Writer para documentar o novo recurso.

## Diretrizes de Implementação
- O Orchestrator deve sempre dividir as tarefas em subtarefas menores e mais específicas.
- O Orchestrator deve delegar para outro Orchestrator se as subtarefas ainda forem relativamente grandes.
- O Orchestrator deve dividir a tarefa em partes menores até que a implementação ou a documentação sejam tarefas atômicas.
- O Orchestrator deve rastrear o progresso e ajustar o plano conforme necessário.