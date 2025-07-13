# Módulos do Sistema (modules.md)

A lógica de negócios da aplicação é dividida em módulos de domínio, seguindo os princípios do DDD. Cada módulo é autocontido e responsável por uma área específica da funcionalidade do sistema. Eles são carregados e orquestrados pelo `ModuleLoader` no `kernel` da aplicação.

--- 

## 1. Módulo de Gerenciamento de Agentes (`agent-management`)

-   **Função Principal:** Gerenciar o ciclo de vida de **Agentes de IA**. Um agente é uma configuração que define como interagir com um modelo de linguagem (LLM), incluindo qual provedor usar, o modelo específico, e outros parâmetros como temperatura e `system prompt`.

-   **Componentes Principais:**
    -   `AgentService`: Contém os casos de uso para criar, atualizar, excluir e buscar agentes.
    -   `AgentRepository`: Responsável pela persistência dos dados dos agentes no banco de dados.
    -   `AgentMapper`: Converte entidades de domínio para DTOs e vice-versa.
    -   `AgentIpcHandlers`: Expõe as funcionalidades do `AgentService` para o Renderer Process através de canais IPC.

-   **Dependências:** Nenhuma.

-   **Eventos:**
    -   **Dispara:** `AgentCreatedEvent`, `AgentUpdatedEvent`, `AgentDeletedEvent`.
    -   **Escuta:** `LLMProviderDeletedEvent` para lidar com agentes que possam estar associados a um provedor de LLM que foi removido.

---

## 2. Módulo de Mensagens de Canal (`channel-messaging`)

-   **Função Principal:** Gerenciar as mensagens trocadas dentro de **Canais**. Este módulo lida com o envio, recebimento e armazenamento de mensagens em um contexto de comunicação em grupo, incluindo interações com a IA.

-   **Componentes Principais:**
    -   `ChannelMessageService`: Gerencia as operações CRUD para mensagens de canal.
    -   `AIChatService`: Orquestra a interação com a IA dentro de um canal, enviando o histórico de mensagens para o LLM e processando a resposta.
    -   `ChannelMessageRepository`: Persiste as mensagens de canal.
    -   `ChannelMessageIpcHandlers`: Expõe as funcionalidades de mensagens para o frontend.

-   **Dependências:**
    -   `llm-provider`: Necessário para que o `AIChatService` possa interagir com os modelos de linguagem.

---

## 3. Módulo de Comunicação (`communication`)

-   **Função Principal:** Gerenciar a criação e o ciclo de vida de **Canais** de comunicação. Um canal é um espaço onde múltiplos usuários (ou agentes) podem conversar.

-   **Componentes Principais:**
    -   `ChannelService`: Casos de uso para criar, renomear, arquivar e buscar canais.
    -   `ChannelRepository`: Persistência dos dados dos canais.
    -   `ChannelIpcHandlers`: Expõe as funcionalidades de gerenciamento de canais para o frontend.

-   **Dependências:** Nenhuma.

---

## 4. Módulo de Mensagens Diretas (`direct-messages`)

-   **Função Principal:** Gerenciar conversas diretas entre o usuário e um **Agente de IA**. Este módulo é responsável por manter o histórico da conversa e orquestrar a interação com o LLM.

-   **Componentes Principais:**
    -   `ConversationService`: Gerencia o ciclo de vida das conversas.
    -   `MessageService`: Gerencia o envio e armazenamento de mensagens individuais.
    -   `AgentConversationService`: Orquestra a lógica de interação com um agente de IA, enviando o prompt do usuário e o histórico da conversa para o `TextGenerationService`.
    -   `DirectMessageIpcHandlers`: Expõe as funcionalidades de conversa para o frontend.

-   **Dependências:**
    -   `agent-management`: Para obter informações sobre os agentes com os quais o usuário está conversando.
    -   `llm-provider`: Para acessar o `TextGenerationService` e gerar respostas da IA.

---

## 5. Módulo de Provedor de LLM (`llm-provider`)

-   **Função Principal:** Gerenciar a configuração de diferentes **Provedores de Modelos de Linguagem** (ex: OpenAI, Anthropic, Google AI). Este módulo abstrai a complexidade de interagir com as diferentes APIs de LLM.

-   **Componentes Principais:**
    -   `LlmProviderService`: Casos de uso para adicionar, configurar e remover provedores de LLM.
    -   `LlmProviderRepository`: Persiste as configurações dos provedores (incluindo chaves de API de forma segura).
    -   `AIService`: Um serviço de fachada que fornece uma interface unificada para interagir com qualquer LLM configurado, independentemente do provedor.
    -   `TextGenerationService` (dentro de `application`): Implementa a lógica específica para geração de texto, usando o `AIService`.
    -   `LlmProviderIpcHandlers`: Expõe as funcionalidades de gerenciamento de provedores para o frontend.

-   **Dependências:** Nenhuma.

---

## 6. Módulo de Gerenciamento de Projetos (`project-management`)

-   **Função Principal:** Gerenciar o ciclo de vida de **Projetos**. Um projeto na aplicação serve como um contêiner para organizar conversas, agentes e outros recursos relacionados a um contexto de trabalho específico.

-   **Componentes Principais:**
    -   `ProjectService`: Casos de uso para criar, renomear, arquivar e buscar projetos.
    -   `ProjectRepository`: Persistência dos dados dos projetos.
    -   `ProjectMapper`: Mapeia entre entidades de domínio e DTOs.
    -   `ProjectIpcHandlers`: Expõe as funcionalidades de gerenciamento de projetos para o frontend.

-   **Dependências:** Nenhuma.
