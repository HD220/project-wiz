# UC-005: Usuário Configura Provedor LLM

**ID:** UC-005
**Nome do Caso de Uso:** Usuário Configura Provedor LLM
**Ator Principal:** Usuário
**Nível:** Suporte (Supporting Goal)
**Prioridade:** Alta
**Referência Funcional:** `docs/funcional/05_integracao_llm.md`, `docs/funcional/07_interface_usuario_ux.md`

## Descrição Breve:
Este caso de uso descreve como um usuário configura um novo provedor de Modelo de Linguagem Grande (LLM) no sistema, como OpenAI ou DeepSeek, fornecendo as informações necessárias (ex: chave de API).

## Pré-condições:
1.  O usuário está autenticado no sistema Project Wiz.
2.  O usuário possui as credenciais necessárias (ex: chave de API) para o provedor LLM que deseja configurar.

## Fluxo Principal:
1.  **Usuário Inicia Configuração de LLM:** O Usuário navega para a seção de configuração de LLM na UI (ex: através de um menu de configurações ou durante o onboarding). O componente `llm-config-form.tsx` é provavelmente envolvido.
2.  **Sistema Apresenta Formulário:** A UI exibe um formulário para o Usuário selecionar o provedor de LLM (ex: OpenAI, DeepSeek) e inserir os detalhes de configuração. Campos comuns incluem:
    *   Nome da Configuração (um alias para o usuário identificar esta configuração).
    *   ID do Provedor LLM (identificador do tipo de provedor, ex: `openai`, `deepseek`).
    *   Chave de API.
    *   (Opcional) Endpoint Base (se diferente do padrão).
    *   (Opcional) Outros parâmetros específicos do provedor.
3.  **Usuário Preenche Detalhes:** O Usuário insere as informações solicitadas e submete o formulário.
4.  **UI Envia Requisição:** A UI envia uma requisição para o backend (via IPC) para criar a configuração do provedor LLM.
5.  **Backend Processa Criação:**
    *   O manipulador IPC invoca o `CreateLLMProviderConfigUseCase`.
    *   `CreateLLMProviderConfigUseCase` valida os dados de entrada.
    *   Cria uma entidade `LLMProviderConfig` (ou VOs correspondentes).
    *   Persiste a configuração usando `ILLMProviderConfigRepository`. (A chave de API em si pode ser armazenada de forma segura, ex: variáveis de ambiente referenciadas pela configuração, ou gerenciador de segredos do Electron, em vez de diretamente no banco de dados em plain text).
6.  **Sistema Confirma Criação:** O backend retorna uma confirmação de sucesso (com o ID da configuração) para a UI.
7.  **UI Atualiza Visualização:** A UI atualiza a lista de configurações de provedor LLM disponíveis e/ou confirma que a nova configuração foi salva.

## Fluxos Alternativos:
*   **FA-005.1: Falha na Validação:** Se os dados fornecidos para a configuração do provedor LLM forem inválidos (Passo 5), o `CreateLLMProviderConfigUseCase` retorna um erro. A UI exibe a mensagem de erro ao Usuário.
*   **FA-005.2: Falha na Persistência:** Se ocorrer um erro durante a persistência da configuração (Passo 5), o UseCase retorna um erro. A UI informa o Usuário sobre a falha.
*   **FA-005.3: Teste de Conexão Falha (Opcional):** O sistema pode opcionalmente tentar uma chamada de teste ao provedor LLM com as credenciais fornecidas. Se falhar, informa o usuário antes de salvar permanentemente.

## Pós-condições:
*   **Sucesso:** Uma nova configuração de provedor LLM (`LLMProviderConfig`) é criada e persistida. Esta configuração pode agora ser associada a instâncias de `Agent` (ver UC-004).
*   **Falha:** O sistema informa o usuário sobre o erro e permanece em um estado consistente. Nenhuma configuração de LLM é salva se o processo falhar.

## Requisitos Especiais:
*   **Segurança:** Chaves de API e outras credenciais devem ser manuseadas e armazenadas de forma segura. Elas não devem ser expostas desnecessariamente na UI após a configuração inicial e não devem ser logadas em plain text. O ideal é que sejam referenciadas a partir de variáveis de ambiente ou um sistema de gerenciamento de segredos.
*   A UI deve listar os provedores de LLM suportados pelo sistema.
*   (Futuro) Interface para editar ou deletar configurações de provedor LLM existentes.
*   (Futuro) Interface para testar a conexão com o provedor LLM após a configuração.
