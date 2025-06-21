# UC-005: Usuário Configura Provedor LLM

**ID:** UC-005
**Nome do Caso de Uso:** Usuário Configura Provedor LLM
**Ator Principal:** Usuário
**Nível:** Usuário-Meta (User Goal)
**Prioridade:** Alta

## Descrição Breve:
Este caso de uso descreve como um usuário configura os detalhes de um provedor de Modelo de Linguagem Grande (LLM) no Project Wiz. Isso permite que o sistema, através dos Agentes IA, utilize os modelos desse provedor.

## Pré-condições:
1.  O usuário está autenticado no sistema Project Wiz.
2.  O usuário possui as credenciais necessárias (ex: chave de API) para o provedor LLM que deseja configurar.

## Fluxo Principal (Caminho Feliz):

1.  **Usuário Acessa Configurações de LLM:**
    *   O Usuário navega para a seção de "Configurações de LLM" ou "Provedores de LLM" na interface do Project Wiz (UI).
2.  **Sistema Exibe Provedores Configurados e Opção de Adicionar:**
    *   A UI exibe uma lista dos provedores de LLM já configurados (se houver).
    *   A UI apresenta uma opção para "Adicionar Novo Provedor" ou "Configurar Provedor".
3.  **Usuário Inicia Configuração de Novo Provedor (ou Edita Existente):**
    *   O Usuário seleciona a opção para adicionar um novo provedor ou escolhe um existente para editar.
4.  **Sistema Apresenta Formulário de Configuração:**
    *   A UI exibe um formulário com campos relevantes para o tipo de provedor LLM. Campos comuns podem incluir:
        *   **Nome da Configuração:** Um nome amigável para esta configuração específica (ex: "Minha Chave OpenAI Pessoal", "DeepSeek Trabalho").
        *   **Tipo de Provedor:** Uma seleção do provedor LLM (ex: "OpenAI", "DeepSeek", "Anthropic", etc. - a lista de provedores suportados pelo sistema).
        *   **Chave de API (API Key):** Campo para inserir a chave de API do provedor.
        *   **(Opcional) Endpoint da API:** Se o provedor permitir ou exigir um endpoint customizado.
        *   **(Opcional) Outros Parâmetros:** Quaisquer outros parâmetros específicos exigidos pelo provedor ou pelo AI SDK (ex: ID da Organização para OpenAI).
5.  **Usuário Preenche e Salva Formulário:**
    *   O Usuário insere os detalhes da configuração, incluindo a chave de API.
    *   O Usuário submete/salva o formulário.
6.  **Sistema Valida Dados:**
    *   O backend (via Caso de Uso `CreateLLMProviderConfigUseCase` ou similar) valida os dados fornecidos (ex: campos obrigatórios preenchidos).
    *   (Opcional, mas recomendado) O sistema pode tentar fazer uma chamada de teste simples à API do provedor com a chave fornecida para verificar sua validade, sem armazenar a chave se a validação falhar.
7.  **Sistema Persiste Configuração do Provedor LLM:**
    *   O sistema salva a configuração do provedor LLM de forma segura no banco de dados. A chave de API deve ser armazenada de forma criptografada ou utilizando um mecanismo seguro de gerenciamento de segredos.
8.  **Sistema Confirma Configuração:**
    *   A UI exibe uma mensagem de sucesso.
    *   A nova configuração (ou a atualizada) aparece na lista de provedores configurados.

## Fluxos Alternativos:

*   **FA-001: Dados de Configuração Inválidos ou Incompletos:**
    *   Se o Usuário submeter o formulário com dados inválidos (ex: chave de API em formato incorreto, campos obrigatórios faltando):
        1.  O sistema (UI ou backend) informa ao Usuário sobre os erros de validação.
        2.  O Usuário deve corrigir os dados e tentar salvar novamente.

*   **FA-002: Chave de API Inválida (Detectado na Validação Opcional):**
    *   Se o sistema realizar uma chamada de teste (Passo 6) e a chave de API for inválida:
        1.  O sistema informa ao Usuário que a chave de API parece inválida.
        2.  A configuração não é salva (ou a chave não é salva).
        3.  O Usuário deve verificar e corrigir a chave de API.

*   **FA-003: Erro ao Salvar Configuração:**
    *   Se ocorrer um erro no backend ao tentar persistir a configuração:
        1.  O sistema informa ao Usuário sobre a falha.
        2.  O caso de uso termina.

## Pós-condições:

*   **Sucesso:**
    *   A configuração do provedor LLM é salva de forma segura no sistema.
    *   Os modelos deste provedor (e desta configuração específica) tornam-se disponíveis para serem associados a Personas (ver UC-004).
*   **Falha:**
    *   A configuração do provedor LLM não é salva ou é salva parcialmente de forma segura.
    *   O Usuário é informado sobre o motivo da falha.

## Requisitos Especiais:
*   **Segurança:** As chaves de API dos provedores LLM são informações altamente sensíveis e DEVEM ser armazenadas de forma segura (ex: criptografadas em repouso) e transmitidas de forma segura. Evitar logar chaves de API.
*   A UI deve mascarar a entrada da chave de API.
*   O sistema deve ser flexível para suportar diferentes campos de configuração para diferentes tipos de provedores LLM no futuro.

## Relacionamento com Outros Casos de Uso:
*   As configurações de provedor LLM feitas aqui são usadas em **UC-004: Usuário Gerencia Personas** quando o Usuário associa um modelo LLM a uma Persona.
*   A integração efetiva com o LLM (descrita em RF-LLM) depende de configurações válidas de provedores.

---
**Nota:** Este caso de uso foca na configuração do *provedor*. A seleção de *modelos específicos* de um provedor configurado geralmente ocorre durante a configuração da Persona (UC-004). Funcionalidades como deletar configurações de provedor podem ser consideradas extensões.
