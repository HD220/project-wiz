# Gerenciamento de Personas e Agentes IA

Project Wiz permite a criação, configuração e gerenciamento de `AgentPersonaTemplate` (templates de Personas) e a criação de instâncias de Agentes IA executáveis.

## Funcionalidades Principais:

1.  **Criação e Definição de `AgentPersonaTemplate` (Templates de Persona):**
    *   Usuários podem criar novos templates de Persona (via `CreatePersonaUseCase`).
    *   Cada template de Persona (`AgentPersonaTemplate`) é definido por atributos chave:
        *   **Nome:** Um identificador para o template (ex: "Desenvolvedor Frontend Júnior").
        *   **Papel (Role):** A especialização principal (ex: "Developer", "QA Tester").
        *   **Objetivo (Goal):** O objetivo de alto nível que um Agente usando este template busca alcançar.
        *   **Backstory/Contexto:** Informações de fundo para construir o prompt de sistema do LLM.
        *   **Nomes das Ferramentas (`toolNames`):** Uma lista dos nomes das `Tools` que um Agente com este template tem permissão para usar.
    *   A persistência desses templates é gerenciada pelo sistema (via `IPersonaRepository`).

2.  **Criação de Instâncias de Agente:**
    *   O sistema permite a criação de uma entidade `Agent` (via `CreateAgentUseCase`).
    *   Um `Agent` é uma instância executável que vincula um `AgentPersonaTemplate` (selecionado por seu ID) a uma configuração específica de provedor LLM (`LLMProviderConfigId`) e define parâmetros como `temperature`.
    *   Este `Agent` é a entidade que efetivamente será usada por um `Worker` para processar Jobs.

3.  **Listagem e Gerenciamento via UI:**
    *   A interface do usuário (componente `PersonaList`) permite listar os `AgentPersonaTemplate` existentes para seleção (ex: durante o onboarding ou configuração de um Agente).
    *   Funcionalidades para editar templates de Persona ou instâncias de Agente não foram explicitamente detalhadas no código analisado, mas são uma extensão lógica.

4.  **Estado do Agente:**
    *   **`AgentInternalState`:** Cada instância de Agente (ou conceitualmente, cada Persona que já atuou) pode ter um `AgentInternalState` persistente. Este estado armazena:
        *   Conhecimento geral acumulado.
        *   Conhecimento específico de projetos.
        *   Notas, aprendizados, e "promessas" (compromissos de longo prazo).
        *   É crucial para continuidade e aprendizado.
    *   **`AgentRuntimeState`:** O sistema também define uma entidade `AgentRuntimeState` para informações transitórias ou de status sobre um agente enquanto ele está ativamente processando uma tarefa.

5.  **Múltiplos Agentes Atuando Concorrentemente (Worker Pool):**
    *   O sistema suporta múltiplos Agentes (instâncias configuradas) operando em paralelo, cada um processando Jobs de sua respectiva fila (geralmente uma fila por `role` de Persona).
    *   Um `WorkerService` é configurado para um `handlesRole` específico, utilizando um `IAgentExecutor` (como o `GenericAgentExecutor`) que é instanciado com o `AgentPersonaTemplate` apropriado.

## Interação com o Usuário:
*   O usuário interage com uma instância de Agente (indiretamente, ao submeter um Job para um `role` que o Agente manipula).
*   O Agente opera autonomamente para cumprir a solicitação, utilizando seu `AgentPersonaTemplate`, a configuração de LLM associada, seu `AgentInternalState` (se aplicável), e as `Tools` habilitadas.
