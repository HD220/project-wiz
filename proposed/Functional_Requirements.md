# Requisitos Funcionais (RFs)

Este documento lista os requisitos funcionais detalhados para o Sistema de Fábrica de Software Autônoma Local, descrevendo as funcionalidades que o sistema deve oferecer.

## 1. Interface do Usuário (Frontend)

*   **RF1.1:** O sistema DEVE fornecer uma interface gráfica de usuário (GUI) inspirada no estilo do Discord, com áreas para projetos (servidores), canais de comunicação e mensagens diretas.
*   **RF1.2:** O sistema DEVE permitir que o usuário visualize uma lista de projetos disponíveis e selecione um para interagir.
*   **RF1.3:** O sistema DEVE exibir os canais de comunicação associados ao projeto selecionado.
*   **RF1.4:** O sistema DEVE permitir que o usuário envie mensagens de texto para os canais de comunicação e para agentes específicos.
*   **RF1.5:** O sistema DEVE exibir as mensagens recebidas dos agentes e de outros componentes do sistema nos canais de comunicação.
*   **RF1.6:** O sistema DEVE permitir que o usuário visualize a documentação gerada pelos agentes (ex: READMEs, relatórios) diretamente na interface.
*   **RF1.7:** O sistema NÃO DEVE permitir que o usuário acesse diretamente o código-fonte ou detalhes de implementação dos agentes através da interface do usuário.
*   **RF1.8:** O sistema DEVE fornecer uma seção na interface do usuário onde o usuário possa visualizar e alterar os system prompts utilizados pelos agentes e pelo sistema.

## 2. Gerenciamento de Agentes e Comunicação

*   **RF2.1:** O sistema DEVE permitir a interação do usuário com agentes de IA criados dinamicamente através de mensagens de texto nos canais de comunicação.
*   **RF2.2:** O sistema DEVE rotear mensagens para agentes com base no contexto da conversa, permitindo que a comunicação seja direcionada a um ou múltiplos agentes, ou por menção explícita (ex: `@AgenteDev`).
*   **RF2.3:** O sistema DEVE permitir a criação de agentes em tempo de execução de acordo com a necessidade do sistema. Um assistente de usuário será o único agente "built-in", disponível em mensagens diretas e em todos os projetos.
*   **RF2.4:** O sistema DEVE fornecer um mecanismo robusto para comunicação e colaboração entre os próprios agentes.
*   **RF2.5:** O sistema DEVE permitir que os agentes enviem atualizações de progresso e status para os canais de comunicação ou mensagens diretas, de forma não constante, focando em marcos importantes ou quando solicitado.
*   **RF2.6:** O sistema DEVE exibir visualmente a tarefa atual que um agente está executando (similar ao status "jogando" do Discord).
*   **RF2.7:** O sistema DEVE permitir que o usuário visualize o perfil de um agente, incluindo seu log de execução, tarefas concluídas e tarefas pendentes.
*   **RF2.6:** O sistema DEVE permitir a definição de personas detalhadas para cada agente, incluindo nome, papel, perfil, backstory e objetivo, para facilitar a comunicação e interação humanizada.

## 3. Execução e Gerenciamento de Tarefas

*   **RF3.1:** O sistema DEVE atribuir uma fila de tarefas individual para cada agente de IA.
*   **RF3.2:** O sistema DEVE permitir que os agentes criem e definam tarefas com base nas interações de linguagem natural com o usuário. A atribuição de tarefas pelo usuário DEVE ocorrer apenas através do sistema de issues, ou solicitando a um agente que assuma uma tarefa específica.
*   **RF3.3:** O sistema DEVE permitir que os agentes acessem e manipulem arquivos no sistema de arquivos local (leitura, escrita, criação, exclusão).
*   **RF3.4:** O sistema DEVE permitir que os agentes executem comandos de shell/linha de comando de forma segura e controlada.
*   **RF3.5:** O sistema DEVE capturar e retornar a saída (stdout e stderr) e o código de saída dos comandos de shell executados pelos agentes.
*   **RF3.6:** O sistema DEVE implementar mecanismos de segurança para restringir os tipos de comandos de shell que os agentes podem executar e os diretórios que podem acessar.

## 4. Gestão de Projetos e Repositórios (Git)

*   **RF4.1:** O sistema DEVE associar cada projeto a um repositório Git local.
*   **RF4.2:** O sistema DEVE permitir que o usuário crie novos projetos, inicializando um repositório Git vazio.
*   **RF4.3:** O sistema DEVE permitir que o usuário clone repositórios Git remotos existentes para criar novos projetos.
*   **RF4.4:** O sistema DEVE permitir que o usuário vincule um projeto local a um repositório remoto para operações de push/pull, com a opção de selecionar a branch para essas operações.
*   **RF4.5:** O sistema DEVE garantir que os agentes utilizem `git worktree` para trabalhar em paralelo em diferentes funcionalidades ou correções.
*   **RF4.6:** O sistema DEVE permitir que os agentes criem, façam commit e mesclem branches Git.
*   **RF4.7:** O sistema DEVE validar o workflow Git dos agentes para evitar conflitos e inconsistências (ex: checagens antes do merge).

## 5. Gerenciamento de Fluxo de Trabalho e Metodologia

*   **RF5.1:** O sistema DEVE suportar a definição e o gerenciamento de épicos, features e histórias de usuário.
*   **RF5.2:** O sistema DEVE permitir o gerenciamento de sprints, incluindo a atribuição de histórias de usuário a sprints.
*   **RF5.3:** O sistema DEVE manter um backlog de trabalho para cada projeto. A priorização do backlog DEVE ser realizada por agentes designados para essa função, ou manualmente pelo usuário através do sistema de issues.
*   **RF5.4:** O sistema DEVE implementar um sistema de issues para rastrear bugs, tarefas e melhorias.
*   **RF5.5:** O sistema DEVE permitir que os agentes criem, atualizem e resolvam issues.
*   **RF5.6:** O sistema DEVE ter a capacidade de ser estendido para integração futura com plataformas externas de issues (ex: GitHub Issues, Jira).

## 6. Autonomia e Dependência dos Agentes

*   **RF6.1:** Os agentes DEVE ser capazes de operar de forma autônoma, tomando decisões com base nas informações disponíveis no repositório do projeto e no contexto das conversas.
*   **RF6.2:** Os agentes DEVE ser capazes de solicitar esclarecimentos ao usuário quando a tarefa for ambígua ou informações adicionais forem necessárias.
*   **RF6.3:** Os agentes DEVE reportar o progresso e o status das tarefas ao usuário de forma regular.

## 7. Documentação Integrada

*   **RF7.1:** O sistema DEVE permitir que os agentes gerem e atualizem documentação (ex: READMEs, documentação técnica, relatórios).
*   **RF7.2:** O sistema DEVE indexar a documentação gerada e permitir sua visualização na interface do usuário com renderização de Markdown, similar à experiência do GitHub.
