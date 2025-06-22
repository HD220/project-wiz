# Visão Geral do Sistema Project Wiz

## Propósito Principal

O Project Wiz visa transformar o ciclo de vida do desenvolvimento de software através da colaboração inteligente entre usuários humanos e Agentes de IA (Personas) autônomos. Funciona como uma "fábrica de software pessoal e inteligente" em uma aplicação desktop.

## Interação Principal do Usuário

1.  **Conversa e Delegação:** O usuário interage com uma Persona (Agente de IA especializado) através de uma interface de chat, descrevendo uma necessidade ou objetivo no contexto de um projeto.
2.  **Planejamento pelo Agente:** A Persona analisa o pedido, elabora um plano de ação (que pode incluir a decomposição da tarefa em Jobs e Sub-Jobs) e define critérios de "Definição de Pronto".
3.  **Aprovação do Usuário (Ponto de Verificação):** O Agente pode apresentar o plano e a "Definição de Pronto" ao usuário para aprovação antes de iniciar o trabalho principal.
4.  **Execução Autônoma:** Após a aprovação, o Agente executa os Jobs e Sub-Jobs, utilizando sua inteligência (LLM) e Ferramentas (`Tools`) disponíveis. Para tarefas de código, o Agente opera dentro de uma `working_directory` do projeto, geralmente em um branch Git específico.
5.  **Auto-Validação:** O Agente realiza uma auto-validação interna para garantir que os resultados atendam à "Definição de Pronto".
6.  **Acompanhamento e Entrega:** O usuário acompanha o progresso dos Jobs e recebe o resultado final (ex: um novo branch Git com o código modificado, um relatório, etc.), podendo continuar a interação para feedback ou ajustes.

## Principais Capacidades Funcionais (Resumo)

*   **Gerenciamento de Projetos:** Criação e organização de projetos de software.
*   **Gerenciamento de Personas (Agentes IA):** Definição, configuração e interação com Agentes de IA especializados.
*   **Operação Autônoma de Agentes:** Planejamento, execução de tarefas, uso de LLMs e Tools, gerenciamento de contexto.
*   **Sistema de Jobs e Filas:** Gerenciamento robusto de tarefas (Jobs), suas dependências, prioridades e ciclo de vida.
*   **Integração com LLMs:** Utilização flexível de Modelos de Linguagem Grandes para inteligência dos Agentes.
*   **Ferramentas de Agente Extensíveis:** Um conjunto de `Tools` que os Agentes podem usar para interagir com o ambiente.
*   **Interface de Usuário Intuitiva:** Uma aplicação desktop (Electron) com UI baseada em React para facilitar todas as interações.

Este documento serve como ponto de partida. Os documentos subsequentes nesta pasta detalham cada uma dessas áreas funcionais.
