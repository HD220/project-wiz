# UC-003: Usuário Gerencia Projetos

**ID:** UC-003
**Nome do Caso de Uso:** Usuário Gerencia Projetos
**Ator Principal:** Usuário
**Nível:** Usuário-Meta (User Goal)
**Prioridade:** Alta

## Descrição Breve:
Este caso de uso descreve como um usuário cria, visualiza e configura projetos dentro do Project Wiz. Os projetos servem como contêineres para o trabalho dos Agentes IA.

## Pré-condições:
1.  O usuário está autenticado no sistema Project Wiz.

## Fluxo Principal (Caminho Feliz):

### Sub-fluxo 1: Criar Novo Projeto
1.  **Usuário Solicita Criação:** O Usuário seleciona a opção "Criar Novo Projeto" na UI.
2.  **Sistema Apresenta Formulário:** A UI exibe um formulário para o Usuário inserir os detalhes do novo projeto. Campos mínimos incluem:
    *   Nome do Projeto.
    *   Caminho do Diretório Principal (Localização no sistema de arquivos onde o projeto será criado - `caminho_working_directory`).
    *   (Opcional) Descrição do Projeto.
    *   (Opcional) URL do Repositório Git Remoto (se for clonar um existente como base ou para configurar o remote).
3.  **Usuário Preenche e Submete Formulário:** O Usuário insere os detalhes e submete o formulário.
4.  **Sistema Valida Dados:** O backend (via Caso de Uso `CreateProjectUseCase`) valida os dados fornecidos (ex: nome não vazio, caminho válido e acessível).
5.  **Sistema Cria Estrutura do Projeto:**
    *   O sistema cria o diretório principal do projeto no caminho especificado.
    *   O sistema inicializa uma estrutura de pastas padrão dentro do diretório do projeto (ex: `source-code/`, `docs/`, `worktrees/`).
    *   O sistema inicializa um repositório Git na raiz do diretório do projeto.
    *   (Opcional) Se uma URL de repositório remoto foi fornecida, o sistema pode tentar clonar desse repositório ou configurar o remote.
6.  **Sistema Persiste Dados do Projeto:** O sistema salva as informações do novo projeto (nome, caminho, ID, etc.) no banco de dados.
7.  **Sistema Confirma Criação:** A UI exibe uma mensagem de sucesso e atualiza a lista de projetos, possivelmente navegando para a visualização do novo projeto.

### Sub-fluxo 2: Listar e Visualizar Projetos
1.  **Usuário Acessa Lista de Projetos:** O Usuário navega para a seção de listagem de projetos na UI.
2.  **Sistema Exibe Lista:** A UI busca (via backend) e exibe a lista de projetos existentes, mostrando informações sumárias (ex: nome, talvez data de criação ou último acesso).
3.  **Usuário Seleciona Projeto:** O Usuário clica em um projeto da lista para ver seus detalhes.
4.  **Sistema Exibe Detalhes do Projeto:** A UI busca (via backend) e exibe informações detalhadas sobre o projeto selecionado. Isso pode incluir:
    *   Nome, descrição, caminho do diretório.
    *   Abas para tarefas/Jobs associados, discussões, equipe (se aplicável), configurações do projeto.

### Sub-fluxo 3: Configurar Projeto Existente (Simplificado)
1.  **Usuário Acessa Configurações do Projeto:** Dentro da visualização de detalhes de um projeto, o Usuário navega para a seção de configurações.
2.  **Sistema Exibe Opções de Configuração:** A UI exibe os parâmetros configuráveis do projeto (ex: nome, descrição, talvez `working_directory` se puder ser alterado com segurança).
3.  **Usuário Modifica e Salva Configurações:** O Usuário altera os parâmetros desejados e salva.
4.  **Sistema Valida e Persiste Alterações:** O backend valida e salva as novas configurações no banco de dados.
5.  **Sistema Confirma Atualização:** A UI exibe uma mensagem de sucesso.

## Fluxos Alternativos:

*   **FA-001 (Criar Projeto): Caminho de Diretório Inválido ou Inacessível:**
    *   No Passo 5 do Sub-fluxo 1, se o caminho do diretório fornecido for inválido, já existir de forma conflitante, ou o sistema não tiver permissões para criar/escrever:
        1.  O sistema informa ao Usuário sobre o erro.
        2.  O Usuário pode corrigir o caminho e tentar novamente, ou cancelar a operação.

*   **FA-002 (Criar Projeto): Erro ao Inicializar Git ou Estrutura:**
    *   No Passo 5 do Sub-fluxo 1, se ocorrer um erro durante a criação das pastas ou inicialização do Git:
        1.  O sistema tenta reverter as alterações parciais (se possível e seguro).
        2.  O sistema informa ao Usuário sobre o erro.
        3.  O Usuário pode tentar novamente ou cancelar.

*   **FA-003 (Visualizar/Configurar): Projeto Não Encontrado:**
    *   Se o Usuário tentar acessar um projeto que não existe ou foi removido, o sistema exibe uma mensagem apropriada.

## Pós-condições:

*   **Sucesso (Criar Projeto):**
    *   Um novo projeto é criado no sistema de arquivos.
    *   Um repositório Git é inicializado no projeto.
    *   As informações do projeto são persistidas no banco de dados.
    *   O projeto aparece na lista de projetos do usuário.
*   **Sucesso (Visualizar Projeto):**
    *   Os detalhes do projeto são exibidos ao usuário.
*   **Sucesso (Configurar Projeto):**
    *   As configurações do projeto são atualizadas e persistidas.
*   **Falha:**
    *   O estado do sistema permanece consistente.
    *   O Usuário é informado sobre o motivo da falha.

## Requisitos Especiais:
*   Acesso ao sistema de arquivos para criação de diretórios.
*   Capacidade de executar comandos Git (para inicialização).
*   Interface de usuário clara para gerenciamento de projetos.

## Relacionamento com Outros Casos de Uso:
*   As informações do projeto (especialmente `caminho_working_directory`) são usadas como contexto para **UC-001: Usuário Solicita Tarefa a um Agente IA** e **UC-002: Agente IA Processa um Job**.

---
**Nota:** Este caso de uso foca nas operações básicas de CRUD (Create, Read, Update) para projetos, do ponto de vista do usuário. Funcionalidades mais avançadas como importação de projetos existentes, arquivamento, ou deleção detalhada podem ser casos de uso separados ou extensões deste.
