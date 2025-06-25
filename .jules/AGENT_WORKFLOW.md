**Para o Agente LLM (Jules):**

Este documento define o seu fluxo de trabalho padrão ao ser instruído a "prosseguir com as tarefas" ou "continuar o trabalho" neste projeto. O objetivo é garantir uma abordagem sistemática, autônoma e alinhada com as práticas de desenvolvimento estabelecidas.

## Fluxo de Trabalho Cíclico:

Ao receber uma instrução genérica para continuar o trabalho, siga os passos abaixo:

1.  **Consulta de Documentação Essencial:**
    *   **Revisite `AGENTS.md` (raiz do projeto):** Antes de qualquer ação, releia o `AGENTS.md` para relembrar a visão geral do projeto, princípios de desenvolvimento, padrões arquiteturais, estrutura de código, tecnologias chave, e quaisquer considerações específicas do projeto, incluindo a Seção 9 sobre gerenciamento de tarefas.
    *   **Analise `/.jules/TASKS.md` (Índice Principal):** Este é o seu principal backlog de tarefas. Ele funciona como um índice, com links para arquivos de detalhes.

2.  **Seleção e Gerenciamento de Tarefas:**
    *   **Identifique Tarefas Pendentes no Índice:** No `/.jules/TASKS.md`, procure por tarefas com status "Pendente".
    *   **Priorize Desmembramento de Tarefas Complexas:**
        *   Procure a primeira tarefa `Pendente` no `TASKS.md` com `Complexidade > 1` (a complexidade é definida no arquivo de detalhe da tarefa, mas pode ser anotada no índice).
        *   Se encontrada e suas dependências estiverem resolvidas, sua ação principal será desmembrá-la.
    *   **Execução de Tarefas Simples:**
        *   Se não houver tarefas para desmembrar, procure a primeira tarefa `Pendente` no `TASKS.md` com `Complexidade < 2` (idealmente 1) cujas `Dependências` (listadas no índice e/ou no arquivo de detalhe) estejam todas com o status `Concluído`.
    *   **Se Nenhuma Ação For Possível:** Se todas as tarefas pendentes estiverem bloqueadas ou aguardando desmembramento que dependa de outras, informe o status de bloqueio e aguarde novas instruções.

3.  **Fase 3: Execução da Ação:**

    *   **SE A AÇÃO FOR DESMEMBRAR UMA TAREFA COMPLEXA:**
        1.  Adote a persona de **"Arquiteto de Software"**.
        2.  Anuncie a tarefa que será desmembrada (ex: `Analisando a Tarefa TSK-XXX para desmembramento.`).
        3.  **Leia atentamente o arquivo de detalhe da tarefa-mãe** (`/.jules/tasks/TSK-[ID_MAE].md`) para entender completamente seu escopo.
        4.  Defina um conjunto de sub-tarefas claras, concisas e acionáveis (Complexidade idealmente 1 para cada).
        5.  **Para cada nova sub-tarefa:**
            *   Gere um novo ID único para a sub-tarefa (e.g., `TSK-[ID_MAE].1`, `TSK-[ID_MAE].2`).
            *   Crie seu arquivo de detalhe em `/.jules/tasks/TSK-[ID_SUB].md` utilizando o template `/.jules/templates/TASK_DETAIL_TEMPLATE.md`. Preencha todos os campos: ID, Título Breve, Descrição Completa, Status "Pendente", Dependências (incluindo o ID da tarefa-mãe), Prioridade (geralmente herdada ou P1 para sub-tarefas de uma P0), Responsável "Jules", Branch Git Proposta (pode ser a mesma da tarefa-mãe ou uma sub-branch).
        6.  **Atualize o `/.jules/TASKS.md` (Índice Principal):**
            *   Modifique o status da tarefa-mãe para "Bloqueado" ou "Subdividido" e atualize sua nota breve.
            *   Adicione novas linhas para cada sub-tarefa, incluindo seus IDs, títulos breves, status "Pendente", dependências, prioridade, responsável e o link para seu novo arquivo de detalhe.
        7.  **Atualize o arquivo de detalhe da tarefa-mãe (`/.jules/tasks/TSK-[ID_MAE].md`):** Mude seu status para "Bloqueado" ou "Subdividido" e adicione uma nota na seção "Comentários" ou "Notas/Decisões de Design" referenciando as sub-tarefas criadas.
        8.  Passe para a Fase 4 (Submissão).

    *   **SE A AÇÃO FOR EXECUTAR UMA TAREFA SIMPLES:**
        1.  Adote a persona apropriada para a tarefa.
        2.  Anuncie a tarefa que será executada.
        3.  **Leia atentamente o arquivo de detalhe da tarefa (`/.jules/tasks/TSK-[ID_TAREFA].md`)** para entender todos os requisitos, critérios de aceitação e notas.
        4.  Atualize o status da tarefa para "Em Andamento" no seu "estado mental" (a atualização formal nos arquivos ocorrerá ao final da execução da tarefa, antes do commit).
        5.  Crie e siga um plano de execução detalhado usando `set_plan()`.
        6.  **Durante a execução:**
            *   Se precisar de informações de arquivos existentes, use suas ferramentas para consultá-los. **NÃO INVENTE CÓDIGO OU DOCUMENTAÇÃO INEXISTENTE.**
            *   Se perceber que a tarefa é mais complexa que o esperado (ex: C=1 era na verdade C=2 ou mais), **PARE**, atualize a complexidade no arquivo de detalhe da tarefa e no `TASKS.md`. Comunique ao usuário. Se a nova complexidade for >1, a tarefa deverá ser desmembrada no próximo ciclo.
            *   Se identificar necessidades não mapeadas, problemas bloqueadores que podem se tornar uma subtarefa, ou desvios significativos de escopo que justifiquem uma **nova tarefa independente**:
                1.  **PARE** a execução da tarefa atual.
                2.  Crie uma nova tarefa: Defina ID (e.g., `NEW-TSK-XXX`), Título, Descrição Completa, Prioridade, etc.
                3.  Crie o arquivo de detalhe para esta nova tarefa em `/.jules/tasks/TSK-[ID_NOVA].md` usando o template.
                4.  Adicione a nova tarefa ao `/.jules/TASKS.md` (índice).
                5.  Se necessário, adicione a nova tarefa como dependência da tarefa atual (ou de outras) no `TASKS.md` e nos arquivos de detalhe.
                6.  Comunique a criação da nova tarefa ao usuário.
                7.  Reavalie se pode continuar a tarefa original ou se ela agora está bloqueada pela nova tarefa criada.
        7.  Após a implementação bem-sucedida da tarefa:
            *   **Atualize o arquivo de detalhe da tarefa (`/.jules/tasks/TSK-[ID_CONCLUIDA].md`):** Mude o `Status` para "Concluído", adicione o `Commit da Conclusão (Link)` (será preenchido após o submit), e quaisquer `Notas/Decisões de Design` ou `Comentários` finais relevantes.
            *   **Atualize a linha correspondente no `/.jules/TASKS.md` (Índice Principal):** Mude o `Status` para "Concluído" e adicione uma nota breve de conclusão (ex: "Implementado X", ou o link do commit se o formato permitir).
        8.  Passe para a Fase 4 (Submissão).

4.  **Fase 4: Submissão:**
    *   Submeta todas as alterações de código, os arquivos de detalhe de tarefas novos/atualizados (criados ou modificados na Fase 3), e o `/.jules/TASKS.md` (índice) atualizado. Forneça um nome de branch descritivo e uma mensagem de commit clara, incluindo o(s) ID(s) da(s) tarefa(s) principal(is) abordada(s).
    *   **Pós-Submit (Importante):** Se você obteve o SHA do commit, volte e atualize os campos `Commit da Conclusão (Link)` nos arquivos de detalhe das tarefas que foram concluídas neste ciclo. Isso pode exigir um pequeno commit de documentação adicional (ex: `docs: Update task TSK-XXX with commit SHA`).

5.  **Relate e Prepare para a Próxima Tarefa (ou Handoff):**
    *   **Informe o Usuário:** Comunique a conclusão da tarefa e o commit.
    *   **Documente para Handoff (se pausar):** Se você for pausar o trabalho antes de iniciar a próxima tarefa, preencha (mentalmente ou se instruído, em um arquivo temporário) as seções do que seria um `PROMPT_HANDOFF.md` para facilitar a retomada.
    *   **Retorne ao Passo 1 (Consulta de Documentação Essencial):** Se for instruído a continuar, reinicie o ciclo.

## Considerações Adicionais:

*   **Erros e Bloqueios:** Se encontrar um erro que não consegue resolver ou um bloqueio, não prossiga cegamente. Pare, documente o problema e solicite ajuda ao usuário.
*   **Clareza:** Se os requisitos de uma tarefa (no índice `TASKS.md` ou no seu arquivo de detalhe) não estiverem claros, peça esclarecimentos antes de iniciar o trabalho.
*   **Autonomia com Responsabilidade:** Siga este protocolo para operar de forma autônoma, mas sempre priorize a qualidade, a comunicação e o alinhamento com os objetivos do projeto definidos em `AGENTS.md`.

Este protocolo visa otimizar sua contribuição e garantir um desenvolvimento consistente e rastreável.
