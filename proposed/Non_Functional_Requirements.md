# Requisitos Não Funcionais (RNFs) / Requisitos Técnicos

Este documento descreve os requisitos não funcionais e técnicos do Sistema de Fábrica de Software Autônoma Local, que definem as qualidades do sistema e as restrições sob as quais ele deve operar.

## 1. Performance

*   **RNF1.1:** A interface do usuário DEVE ser responsiva, com tempo de carregamento inicial inferior a 5 segundos.
*   **RNF1.2:** As interações do usuário (ex: envio de mensagens, seleção de projetos) DEVE ter um tempo de resposta inferior a 500ms.
*   **RNF1.3:** A execução de tarefas pelos agentes DEVE ser eficiente, sem otimizações excessivas a princípio.
*   **RNF1.4:** A comunicação entre o processo principal (main) e o processo de renderização (renderer) do Electron DEVE ser eficiente, minimizando a latência.

## 2. Segurança

*   **RNF2.1:** O sistema DEVE garantir a integridade e a confidencialidade dos dados do projeto e do usuário armazenados localmente.
*   **RNF2.2:** O sistema DEVE identificar e alertar se um comando de shell executado por um agente tenta operar fora do `worktree` do agente.
*   **RNF2.3:** O sistema NÃO DEVE implementar validação de entrada rigorosa para interações do usuário, pois o ambiente é local e o usuário é o proprietário do repositório.
*   **RNF2.4:** O sistema DEVE proteger as credenciais de acesso a repositórios remotos (se aplicável) de forma segura.

## 3. Usabilidade

*   **RNF3.1:** A interface do usuário DEVE ser intuitiva e fácil de navegar, mesmo para usuários com pouca experiência em ferramentas de desenvolvimento.
*   **RNF3.2:** O sistema DEVE fornecer feedback claro e imediato ao usuário sobre o status das operações e o progresso das tarefas dos agentes.
*   **RNF3.3:** As mensagens de erro DEVE ser claras, concisas e fornecer informações úteis para a resolução de problemas.

## 4. Manutenibilidade

*   **RNF4.1:** O código-fonte DEVE ser modular, bem organizado e seguir os princípios de Clean Architecture e Domain-Driven Design (DDD).
*   **RNF4.2:** O código DEVE ser bem documentado internamente (comentários, docstrings) para facilitar a compreensão e futuras modificações.
*   **RNF4.3:** O sistema DEVE ser facilmente extensível para adicionar novos tipos de agentes, ferramentas e funcionalidades.
*   **RNF4.4:** O sistema DEVE utilizar um sistema de logging robusto para facilitar a depuração e o monitoramento.

## 5. Escalabilidade

*   **RNF5.1:** A arquitetura DEVE suportar a execução simultânea de múltiplos agentes e tarefas sem degradação significativa de performance.
*   **RNF5.2:** O sistema DEVE ser capaz de gerenciar um grande número de projetos e repositórios Git localmente.
*   **RNF5.3:** O sistema DEVE ser capaz de lidar com um volume crescente de mensagens e interações entre o usuário e os agentes.

## 6. Portabilidade

*   **RNF6.1:** O sistema DEVE ser compatível com os sistemas operacionais Windows, macOS e Linux, aproveitando as capacidades do Electron.js.
*   **RNF6.2:** O sistema DEVE ser empacotado e distribuído de forma que a instalação seja simples e consistente em todas as plataformas suportadas.

## 7. Requisitos Específicos para o Ambiente Electron.js

*   **RNF7.1:** A comunicação entre o processo principal (main) e o processo de renderização (renderer) DEVE ser realizada exclusivamente via Inter-Process Communication (IPC), utilizando canais bem definidos.
*   **RNF7.2:** O processo principal DEVE ser responsável por todas as operações de acesso ao sistema de arquivos, execução de shell e interação com o banco de dados.
*   **RNF7.3:** O processo de renderização DEVE ser responsável apenas pela interface do usuário e pela comunicação com o processo principal.

## 8. Requisitos para o Gerenciamento de Processos e Threads dos Agentes

*   **RNF8.1:** O sistema DEVE gerenciar o ciclo de vida dos processos dos agentes de forma robusta, incluindo inicialização, pausa, retomada e encerramento.
*   **RNF8.2:** As tarefas dos agentes DEVE ser executadas de forma assíncrona e não bloqueante para a interface do usuário.
*   **RNF8.3:** O sistema DEVE implementar um mecanismo de fila de tarefas para cada agente, garantindo a execução ordenada e priorizada das tarefas.
*   **RNF8.4:** O sistema DEVE ser capaz de monitorar o status e o progresso das tarefas em execução pelos agentes.

## 9. Persistência

*   **RNF9.1:** O estado dos projetos, agentes, tarefas, mensagens e issues DEVE ser persistido de forma confiável em um banco de dados local (SQLite).
*   **RNF9.2:** O sistema DEVE garantir a consistência dos dados em caso de falhas inesperadas (ex: queda de energia).
*   **RNF9.3:** O esquema do banco de dados DEVE ser versionado e gerenciado através de migrações.
