**Para o Agente LLM (Jules):**

Este documento define o seu fluxo de trabalho padrão ao ser instruído a "prosseguir com as tarefas" ou "continuar o trabalho" neste projeto. O objetivo é garantir uma abordagem sistemática, autônoma e alinhada com as práticas de desenvolvimento estabelecidas.

## Fluxo de Trabalho Cíclico:

Ao receber uma instrução genérica para continuar o trabalho, siga os passos abaixo:

1.  **Consulta de Documentação Essencial:**
    *   **Revisite `AGENTS.md`:** Antes de qualquer ação, releia o `AGENTS.md` para relembrar a visão geral do projeto, princípios de desenvolvimento, padrões arquiteturais, estrutura de código, tecnologias chave, e quaisquer considerações específicas do projeto. Preste atenção especial às seções que podem ter sido atualizadas, incluindo a Seção 9 sobre o novo formato de gerenciamento de tarefas.
    *   **Analise `/.jules/TASKS.md` (Índice Principal):** Este é o seu principal backlog de tarefas. Ele agora funciona como um índice, com links para arquivos de detalhes.

2.  **Seleção e Gerenciamento de Tarefas:**
    *   **Identifique Tarefas Pendentes no Índice:** No `/.jules/TASKS.md`, procure por tarefas com status "Pendente".
    *   **Priorize Complexidade < 2:**
        *   Para cada tarefa "Pendente" no índice, consulte o arquivo de detalhe vinculado (ex: `/.jules/tasks/TSK-[ID].md`) para verificar a `Complexidade (1-5)`.
        *   Selecione uma tarefa com `Complexidade < 2` cujas dependências (listadas no índice e/ou no arquivo de detalhe) estejam "Concluído".
        *   Se houver múltiplas, você pode escolher com base na "Prioridade" listada no índice ou em qualquer outra heurística simples, ou perguntar se houver ambiguidade.
    *   **Subdivisão de Tarefas Complexas:**
        *   Se **não** houver tarefas de complexidade < 2 disponíveis e prontas para execução, identifique a próxima tarefa pendente de maior prioridade (ou a mais antiga no índice) que tenha `Complexidade > 1` (conforme indicado no seu arquivo de detalhe).
        *   **Seu objetivo principal agora é subdividir esta tarefa complexa.** Leia atentamente o arquivo de detalhe da tarefa mãe (`/.jules/tasks/TSK-[ID_MAE].md`).
        *   Proponha um plano detalhado de subdivisão, quebrando a tarefa original em múltiplas sub-tarefas, cada uma com complexidade estimada <= 2 (idealmente 1).
        *   Para cada nova sub-tarefa, prepare o conteúdo para seu arquivo de detalhe (`/.jules/tasks/TSK-[ID_SUBTAREFA].md`), incluindo descrição, dependências (que incluirão o ID da tarefa-mãe), complexidade, etc.
        *   Apresente este plano de subdivisão e os rascunhos dos arquivos de detalhe das sub-tarefas ao usuário para aprovação. **Não prossiga antes da aprovação.**
        *   Uma vez aprovado:
            *   Crie os arquivos de detalhe para cada sub-tarefa em `/.jules/tasks/` usando `create_file_with_block`.
            *   Atualize o `/.jules/TASKS.md` (índice principal): adicione as novas sub-tarefas como linhas no índice (com links para seus respectivos arquivos de detalhe).
            *   Atualize o arquivo de detalhe da tarefa-mãe (`/.jules/tasks/TSK-[ID_MAE].md`) mudando seu status para "Bloqueado" ou "Subdividido" e adicione uma nota referenciando as novas sub-tarefas. Atualize também sua linha correspondente no `/.jules/TASKS.md` (índice).
            *   Retorne ao passo de seleção de tarefa.

3.  **Execução de Tarefa (para tarefas de Complexidade < 2):**
    *   **Leia o Arquivo de Detalhe da Tarefa:** Antes de qualquer coisa, leia completamente o arquivo `/.jules/tasks/TSK-[ID_SELECIONADA].md` para entender todos os requisitos, critérios de aceitação, notas, etc.
    *   **Revisão da Documentação Específica da Tarefa:** Conforme instruído no arquivo de detalhe da tarefa e em `AGENTS.md`, releia as seções específicas da documentação (`docs/funcional`, `docs/tecnico`, etc.) que são DIRETAMENTE relevantes para a tarefa em mãos.
    *   **Crie um Plano de Execução Detalhado:** Use a ferramenta `set_plan()` para articular um plano passo a passo.
    *   **Desenvolva Conforme o Plano:** Siga seu plano.
    *   **Testes (quando aplicável):** Conforme `AGENTS.md`.
    *   **Commits:** Faça commits intermediários se necessário.
    *   **Documente o Progresso:** Use `plan_step_complete()`.

4.  **Conclusão e Submissão da Tarefa:**
    *   **Revisão de Alinhamento com a Documentação:** Conforme `AGENTS.md`.
    *   **Verificação Final:** Revise seu trabalho.
    *   **Atualize Arquivo de Detalhe da Tarefa:**
        *   Modifique o arquivo `/.jules/tasks/TSK-[ID_CONCLUIDA].md`.
        *   Mude o `Status` para "Concluído".
        *   Adicione o `Commit da Conclusão (Link)` (após o submit).
        *   Adicione quaisquer `Notas/Decisões de Design` finais ou `Comentários` relevantes sobre a execução.
    *   **Atualize `/.jules/TASKS.md` (Índice Principal):**
        *   Modifique a linha correspondente à tarefa no arquivo de índice.
        *   Mude o `Status` para "Concluído".
        *   Adicione o link do commit na coluna `Notas Breves` ou crie uma coluna para isso se preferível no futuro.
    *   **Submeta o Código:** Utilize a ferramenta `submit()`. Forneça um nome de branch descritivo e uma mensagem de commit detalhada, incluindo o ID da tarefa.
    *   **Após o Submit, atualize o link do commit no arquivo de detalhe da tarefa e no índice TASKS.md se necessário.**

5.  **Relate e Prepare para a Próxima Tarefa (ou Handoff):**
    *   **Informe o Usuário:** Comunique a conclusão da tarefa.
    *   **Documente para Handoff (se pausar):** Se você for pausar o trabalho antes de iniciar a próxima tarefa, preencha (mentalmente ou se instruído, em um arquivo temporário) as seções do que seria um `PROMPT_HANDOFF.md` para facilitar a retomada. O foco é garantir que o próximo agente (ou você mesmo em uma futura sessão) possa continuar eficientemente.
    *   **Retorne ao Passo 2:** Se houver mais tarefas e você for instruído a continuar, reinicie o ciclo.

## Considerações Adicionais:

*   **Erros e Bloqueios:** Se encontrar um erro que não consegue resolver ou um bloqueio, não prossiga cegamente. Pare, documente o problema (usando a estrutura de um `PROMPT_HANDOFF.md` para o contexto) e solicite ajuda ao usuário.
*   **Clareza:** Se os requisitos de uma tarefa (seja no índice `TASKS.md` ou no seu arquivo de detalhe) não estiverem claros, peça esclarecimentos antes de iniciar o trabalho.
*   **Autonomia com Responsabilidade:** Siga este protocolo para operar de forma autônoma, mas sempre priorize a qualidade, a comunicação e o alinhamento com os objetivos do projeto definidos em `AGENTS.md`.

Este protocolo visa otimizar sua contribuição e garantir um desenvolvimento consistente e rastreável.
