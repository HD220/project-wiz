# UC-004: Usuário Gerencia Personas (Agentes IA)

**ID:** UC-004
**Nome do Caso de Uso:** Usuário Gerencia Personas (Agentes IA)
**Ator Principal:** Usuário
**Nível:** Usuário-Meta (User Goal)
**Prioridade:** Alta

## Descrição Breve:
Este caso de uso descreve como um usuário cria, visualiza, configura e edita Personas. As Personas são as configurações que definem o comportamento, as capacidades e a especialização dos Agentes IA no Project Wiz.

## Pré-condições:
1.  O usuário está autenticado no sistema Project Wiz.
2.  O sistema tem acesso à lista de modelos de LLM configurados (ver UC-005).
3.  O sistema tem acesso à lista de Ferramentas (`Tools`) disponíveis no `ToolRegistry`.

## Fluxo Principal (Caminho Feliz):

### Sub-fluxo 1: Criar Nova Persona
1.  **Usuário Solicita Criação:** O Usuário seleciona a opção "Criar Nova Persona" na UI.
2.  **Sistema Apresenta Formulário de Criação:** A UI exibe um formulário para o Usuário inserir os detalhes da nova Persona. Campos incluem:
    *   Nome da Persona (identificador único e descritivo).
    *   Papel (Role): Descrição da especialização principal (ex: "Desenvolvedor Python Sênior", "Revisor de Código", "Gerador de Documentação Técnica").
    *   Objetivo (Goal): O objetivo de alto nível que esta Persona tentará alcançar em suas tarefas.
    *   Backstory/Contexto: Informações de fundo, conhecimentos específicos, estilo de comunicação ou atuação desejado. (Estes campos ajudam a formar o prompt de sistema do LLM).
    *   Seleção de Modelo LLM: Lista suspensa ou seletor para escolher um modelo de LLM (dentre os configurados no sistema) que esta Persona utilizará.
    *   Seleção de Ferramentas (`Tools`) Habilitadas: Lista de `Tools` disponíveis no sistema, permitindo ao usuário marcar quais esta Persona terá permissão para usar.
3.  **Usuário Preenche e Submete Formulário:** O Usuário insere os detalhes e seleciona as opções desejadas, depois submete o formulário.
4.  **Sistema Valida Dados:** O backend (via Caso de Uso `CreatePersonaUseCase` ou similar) valida os dados fornecidos (ex: nome único, modelo LLM válido selecionado).
5.  **Sistema Persiste Dados da Persona:** O sistema salva a configuração da nova Persona no banco de dados.
6.  **Sistema Confirma Criação:** A UI exibe uma mensagem de sucesso e atualiza a lista de Personas disponíveis.

### Sub-fluxo 2: Listar e Visualizar Personas
1.  **Usuário Acessa Lista de Personas:** O Usuário navega para a seção de listagem/gerenciamento de Personas na UI.
2.  **Sistema Exibe Lista:** A UI busca (via backend) e exibe a lista de Personas existentes, mostrando informações sumárias (ex: Nome, Papel).
3.  **Usuário Seleciona Persona:** O Usuário clica em uma Persona da lista para ver ou editar seus detalhes.
4.  **Sistema Exibe Detalhes da Persona:** A UI exibe o formulário (similar ao de criação, mas pré-preenchido) com todas as configurações da Persona selecionada.

### Sub-fluxo 3: Editar Persona Existente
1.  **Usuário Acessa Detalhes da Persona:** Conforme o Passo 4 do Sub-fluxo 2.
2.  **Usuário Modifica Configurações:** O Usuário altera os campos desejados no formulário (Nome, Papel, Objetivo, Backstory, Modelo LLM, `Tools` Habilitadas).
3.  **Usuário Salva Alterações:** O Usuário submete o formulário com as alterações.
4.  **Sistema Valida Dados:** O backend valida os dados modificados.
5.  **Sistema Persiste Alterações da Persona:** O sistema atualiza a configuração da Persona no banco de dados.
6.  **Sistema Confirma Atualização:** A UI exibe uma mensagem de sucesso.

## Fluxos Alternativos:

*   **FA-001 (Criar/Editar Persona): Nome da Persona Já Existe:**
    *   Se o Usuário tentar criar uma Persona com um nome que já está em uso, ou renomear uma Persona para um nome existente:
        1.  O sistema informa ao Usuário sobre o conflito de nome.
        2.  O Usuário deve fornecer um nome diferente.

*   **FA-002 (Criar/Editar Persona): Dados Inválidos:**
    *   Se o Usuário fornecer dados inválidos (ex: campos obrigatórios em branco):
        1.  A UI ou o backend informa ao Usuário sobre os campos inválidos.
        2.  O Usuário deve corrigir os dados.

*   **FA-003 (Visualizar/Editar): Persona Não Encontrada:**
    *   Se o Usuário tentar acessar uma Persona que não existe (ex: ID inválido), o sistema exibe uma mensagem apropriada.

## Pós-condições:

*   **Sucesso (Criar Persona):**
    *   Uma nova Persona é configurada e persistida no sistema.
    *   A nova Persona aparece na lista de Personas disponíveis para uso.
*   **Sucesso (Editar Persona):**
    *   As configurações da Persona são atualizadas e persistidas.
*   **Falha:**
    *   O estado do sistema permanece consistente.
    *   O Usuário é informado sobre o motivo da falha.

## Requisitos Especiais:
*   A lista de Modelos LLM disponíveis para seleção deve ser carregada das configurações do sistema.
*   A lista de `Tools` disponíveis para seleção deve ser carregada do `ToolRegistry` do sistema.
*   Interface de usuário clara e intuitiva para o formulário de configuração da Persona.

## Relacionamento com Outros Casos de Uso:
*   As Personas configuradas aqui são selecionadas pelo Usuário em **UC-001: Usuário Solicita Tarefa a um Agente IA**.
*   A seleção de Modelo LLM depende das configurações feitas em **UC-005: Usuário Configura Provedor LLM**.

---
**Nota:** Funcionalidades como deletar Personas, duplicar Personas, ou exportar/importar configurações de Personas podem ser consideradas como casos de uso separados ou futuras extensões.
