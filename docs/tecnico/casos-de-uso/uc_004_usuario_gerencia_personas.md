# UC-004: Usuário Gerencia Personas e Agentes IA

**ID:** UC-004
**Nome do Caso de Uso:** Usuário Gerencia Personas e Agentes IA
**Ator Principal:** Usuário
**Nível:** Usuário-Meta (User Goal)
**Prioridade:** Média
**Referência Funcional:** `docs/funcional/02_gerenciamento_personas_agentes.md`, `docs/funcional/07_interface_usuario_ux.md`

## Descrição Breve:
Este caso de uso descreve como um usuário cria e configura `AgentPersonaTemplate` (templates de Persona) e, subsequentemente, cria instâncias de `Agent` (agentes IA executáveis) vinculando esses templates a configurações de LLM.

## Pré-condições:
1.  O usuário está autenticado no sistema Project Wiz.
2.  Existem configurações de Provedor LLM (`LLMProviderConfig`) salvas no sistema (ver UC-005).

## Fluxo Principal (Criação de `AgentPersonaTemplate`):
1.  **Usuário Solicita Criação de Template de Persona:** O Usuário navega para a seção de gerenciamento de Personas na UI e inicia a ação de criar um novo template.
2.  **Sistema Apresenta Formulário:** A UI exibe um formulário para o Usuário inserir os detalhes do template de Persona:
    *   Nome (identificador do template)
    *   Papel (Role)
    *   Objetivo (Goal)
    *   Backstory/Contexto
    *   Seleção de `toolNames` permitidas (lista de ferramentas que Agentes baseados neste template poderão usar).
3.  **Usuário Preenche Detalhes:** O Usuário insere as informações e submete o formulário.
4.  **UI Envia Requisição:** A UI envia uma requisição para o backend (via IPC) para criar o template de Persona.
5.  **Backend Processa Criação:**
    *   O manipulador IPC invoca o `CreatePersonaUseCase`.
    *   `CreatePersonaUseCase` valida os dados.
    *   Cria um objeto `AgentPersonaTemplate` (ou VOs correspondentes).
    *   Persiste o template usando `IPersonaRepository`.
6.  **Sistema Confirma Criação:** O backend retorna uma confirmação de sucesso (com o ID do template) para a UI.
7.  **UI Atualiza Visualização:** A UI atualiza a lista de templates de Persona (`PersonaList`).

## Fluxo Principal (Criação de Instância de `Agent`):
1.  **Usuário Solicita Criação de Agente:** O Usuário, geralmente em um contexto de configuração de um worker ou ao designar um Agente para um projeto/tarefa, decide criar uma nova instância de Agente.
2.  **Sistema Apresenta Formulário/Seleção:** A UI exibe um formulário/interface que permite ao Usuário:
    *   Selecionar um `AgentPersonaTemplate` existente (por ID).
    *   Selecionar uma `LLMProviderConfig` existente (por ID).
    *   Definir a `temperature` para o Agente.
3.  **Usuário Preenche Detalhes:** O Usuário faz as seleções e submete.
4.  **UI Envia Requisição:** A UI envia uma requisição para o backend (via IPC) para criar a instância do Agente.
5.  **Backend Processa Criação:**
    *   O manipulador IPC invoca o `CreateAgentUseCase`.
    *   `CreateAgentUseCase` valida os dados.
    *   Carrega o `AgentPersonaTemplate` e `LLMProviderConfig` usando seus respectivos repositórios.
    *   Cria a entidade `Agent`.
    *   Persiste a entidade `Agent` usando `IAgentRepository`.
6.  **Sistema Confirma Criação:** O backend retorna uma confirmação de sucesso (com o `agentId`) para a UI.
7.  **UI Atualiza Visualização:** A UI pode listar a nova instância de Agente ou confirmar sua configuração.

## Fluxo Principal (Listagem de `AgentPersonaTemplate`):
1.  **Usuário Navega para Lista:** O Usuário acessa a seção de gerenciamento/seleção de Personas na UI (ex: `PersonaList`).
2.  **UI Solicita Dados:** A UI envia uma requisição para o backend (via IPC) para obter a lista de todos os `AgentPersonaTemplate`.
3.  **Backend Recupera Templates:** O manipulador IPC invoca um caso de uso (ex: `ListPersonasUseCase`, implícito) que utiliza `IPersonaRepository` para buscar todos os templates.
4.  **Sistema Retorna Dados:** O backend retorna a lista de templates para a UI.
5.  **UI Exibe Lista:** A UI renderiza a lista de `AgentPersonaTemplate` disponíveis.

## Fluxos Alternativos:
*   **FA-004.1: Falha na Validação (Criação de Template/Agente):** Se os dados fornecidos forem inválidos, o UseCase correspondente retorna um erro. A UI exibe a mensagem de erro.
*   **FA-004.2: Falha na Persistência (Criação de Template/Agente):** Se ocorrer um erro durante a persistência, o UseCase retorna um erro. A UI informa o Usuário.
*   **FA-004.3: Template de Persona ou LLMConfig Não Encontrado (Criação de Agente):** Se o `personaId` ou `llmProviderConfigId` fornecido não existir, o `CreateAgentUseCase` retorna um erro. A UI informa o Usuário.

## Pós-condições:
*   **Criação de Template Bem-sucedida:** Um novo `AgentPersonaTemplate` é criado e persistido.
*   **Criação de Agente Bem-sucedida:** Uma nova instância de `Agent` é criada, vinculando um template de Persona a uma configuração de LLM, e persistida.
*   **Listagem Bem-sucedida:** A lista de `AgentPersonaTemplate` é exibida na UI.
*   **Falha:** O sistema informa o usuário sobre o erro e permanece em um estado consistente.

## Requisitos Especiais (Futuro):
*   Interface para editar `AgentPersonaTemplate` e instâncias de `Agent` existentes.
*   Interface para deletar `AgentPersonaTemplate` e instâncias de `Agent`.
*   Gerenciamento mais granular de `toolNames` na UI durante a configuração do template.
*   Associação do `AgentInternalState` com a instância de `Agent`.
