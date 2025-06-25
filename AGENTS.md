# Guia para Agentes LLM Trabalhando no Repositório Project Wiz

Bem-vindo, colega Agente LLM! Este documento é seu guia para entender e contribuir com o codebase do Project Wiz. Nosso objetivo é construir uma aplicação robusta, manutenível e de alta qualidade, e sua colaboração inteligente é fundamental.

## 1. Visão Geral do Projeto

O Project Wiz é uma aplicação desktop ElectronJS com frontend em React e backend/core em Node.js/TypeScript. Seu propósito é automatizar tarefas de desenvolvimento de software usando agentes de IA (como você!). Os agentes são configurados via "Personas" (`AgentPersonaTemplate`), processam "Jobs" (tarefas) de uma fila, e utilizam "Tools" (`IAgentTool`) para interagir com o sistema e o ambiente de desenvolvimento. O `GenericAgentExecutor` é o principal motor de processamento para os agentes.

**Leia com Atenção TODA A DOCUMENTAÇÃO RELEVANTE ANTES DE CADA TAREFA:**
*   **Compreensão Holística do Sistema:** Antes de iniciar QUALQUER tarefa de desenvolvimento ou refatoração, é **obrigatório** que você revise CUIDADOSAMENTE toda a documentação relevante na pasta `docs/`. Isso inclui, mas não se limita a:
    *   **Documentação Funcional Canônica:** `docs/funcional/` - Descreve O QUE o sistema faz. Entenda os objetivos de negócio e os fluxos de usuário.
    *   **Documentação Técnica Principal:** `docs/tecnico/` - Descreve COMO o sistema é construído. Preste atenção especial a:
        *   `docs/tecnico/arquitetura.md`: Detalha a Clean Architecture, camadas, e o fluxo de dependências.
        *   `docs/tecnico/requisitos.md`: Lista os Requisitos Funcionais (RF) e Não Funcionais (RNF) que sua implementação deve atender.
        *   `docs/tecnico/casos-de-uso/`: Detalha os principais fluxos de interação e como diferentes partes do sistema colaboram.
        *   `docs/tecnico/plano_refatoracao_codigo_fase5.md`: O plano que estamos seguindo para esta reescrita (se aplicável à sua tarefa).
    *   Outros documentos em `docs/` que possam ser pertinentes à sua tarefa específica (ex: ADRs em `docs/technical-documentation/adrs/`, guias de UI/UX se estiver trabalhando no frontend).
*   **Este Arquivo (`AGENTS.md`):** Seu guia principal para desenvolvimento, contendo princípios e padrões mandatórios.
*   **A Falha em Consultar a Documentação Adequadamente Resultará em Trabalho Desalinhado.** O objetivo desta leitura prévia é garantir que sua implementação esteja alinhada com os objetivos do sistema, a arquitetura definida, e os requisitos funcionais/não funcionais.

## 2. Princípios Arquiteturais Mandatórios
(Conteúdo da Seção 2 permanece o mesmo)
*   **Clean Architecture:** ...
*   **Object Calisthenics:** ...
*   **SOLID:** ...
*   **DRY (Don't Repeat Yourself):** ...
*   **KISS (Keep It Simple, Stupid):** ...

## 3. Estrutura do Código (em `src_refactored/` durante a Fase 5, depois `src/`)
(Conteúdo da Seção 3 permanece o mesmo, mas com a nota sobre `app/` para rotas)
Aderir à Clean Architecture:
*   `src_refactored/core/domain/`: ...
*   `src_refactored/core/application/`: ...
*   `src_refactored/core/ports/`: ...
*   `src_refactored/core/common/`: ...
*   `src_refactored/infrastructure/`: ...
*   `src_refactored/presentation/`: ...
    *   `electron/`: ...
    *   `ui/`: ...
        *   `app/`: **Diretório raiz para o file-based routing do TanStack Router.**
        *   `features/`: (Este diretório será removido ou seu propósito redefinido se não for para rotas). Módulos de funcionalidades específicas da UI...
        ... (restante da estrutura ui) ...
*   `src_refactored/shared/`: ...

## 4. Tecnologias Chave
(Conteúdo da Seção 4 permanece o mesmo)
*   **Linguagem:** TypeScript ...
*   ...

## 5. Fluxo de Trabalho de Desenvolvimento
(Conteúdo da Seção 5 permanece o mesmo)
*   **Implementação Orientada ao Domínio:** ...
*   ...

## 6. Object Calisthenics em Detalhe (Como Aplicar)
(Conteúdo da Seção 6 permanece o mesmo)
1.  **Um Nível de Indentação por Método:** ...
*   ...

## 7. Tratamento de Erros
(Conteúdo da Seção 7 permanece o mesmo)
*   Use o tipo `Result<T, E extends Error>` ...
*   ...

## 8. Trabalhando com Código Legado (Durante a Fase 5)
(Conteúdo da Seção 8 permanece o mesmo)
*   O código legado em `src/` e `src2/` ...
*   ...

## 9. Gerenciamento de Tarefas e Ciclo de Trabalho do Agente (CONSOLIDADO E DETALHADO)

O trabalho neste projeto é rastreado através de um sistema de tarefas localizado em `/.jules/`. Este sistema é composto por um arquivo de índice principal (`/.jules/TASKS.md`) e arquivos de detalhe individuais para cada tarefa (`/.jules/tasks/TSK-[ID].md`).

**Princípios Fundamentais do Gerenciamento de Tarefas:**
*   **Fonte Canônica:** O arquivo de detalhe da tarefa (`/.jules/tasks/TSK-[ID].md`) é a fonte canônica de informação para essa tarefa. O índice `TASKS.md` serve como um sumário e ponto de entrada.
*   **Consistência:** É crucial manter a consistência entre o status e as informações no `TASKS.md` e nos arquivos de detalhe correspondentes.
*   **Documentação Contínua:** Os arquivos de detalhe das tarefas devem ser atualizados não apenas na conclusão, mas também durante a execução com notas, decisões e descobertas relevantes.

**Fluxo de Trabalho Cíclico do Agente:**

Ao receber uma instrução genérica para continuar o trabalho (ex: "prossiga"), siga rigorosamente as fases abaixo:

**Fase 1: Sincronização e Análise (Início do Ciclo)**
1.  **Revisite este arquivo (`AGENTS.md`):** Relembre os princípios, padrões e fluxos de trabalho aqui definidos.
2.  **Analise `/.jules/TASKS.md` (Índice Principal):** Obtenha uma visão geral do estado atual do projeto e do backlog de tarefas.

**Fase 2: Seleção da Próxima Ação**
A lógica de decisão para escolher o que fazer é a seguinte, em ordem de prioridade:

1.  **Desmembrar Tarefas Complexas:**
    *   Procure a primeira tarefa no `TASKS.md` com status `Pendente` e cuja `Complexidade` (indicada no seu arquivo de detalhe, `/.jules/tasks/TSK-[ID].md`) seja `> 1`.
    *   Verifique se todas as `Dependências` dessa tarefa complexa estão `Concluído`.
    *   Se uma tarefa assim for encontrada, sua ação principal será desmembrá-la (ver Fase 3).
2.  **Executar Tarefa Simples:**
    *   Se não houver tarefas complexas prontas para desmembramento, procure a primeira tarefa no `TASKS.md` com status `Pendente`, `Complexidade < 2` (idealmente 1, conforme seu arquivo de detalhe), e cujas `Dependências` (listadas no índice e/ou no arquivo de detalhe) estejam todas com o status `Concluído`.
    *   Se uma tarefa assim for encontrada, sua ação será executá-la (ver Fase 3).
3.  **Aguardar:**
    *   Se nenhuma ação for possível (ex: todas as tarefas pendentes estão bloqueadas por dependências não resolvidas, ou aguardam desmembramento que está bloqueado), informe o status de bloqueio ao usuário e aguarde por novas instruções ou pela resolução dos bloqueios.

**Fase 3: Execução da Ação Selecionada**

*   **SE A AÇÃO FOR DESMEMBRAR UMA TAREFA COMPLEXA:**
    1.  Adote a persona de **"Arquiteto de Software"**.
    2.  Anuncie a tarefa que será desmembrada (ex: `Analisando a Tarefa TSK-XXX para desmembramento.`).
    3.  **Leia atentamente o arquivo de detalhe da tarefa-mãe** (`/.jules/tasks/TSK-[ID_MAE].md`) para entender completamente seu escopo, critérios de aceitação e notas.
    4.  Defina um conjunto de sub-tarefas claras, concisas e acionáveis. Cada sub-tarefa deve ter uma `Complexidade` estimada de 1 (ou no máximo 2, se inevitável).
    5.  **Para cada nova sub-tarefa:**
        *   Gere um novo ID único (e.g., `[ID_MAE].1`, `[ID_MAE].2`).
        *   Crie seu arquivo de detalhe em `/.jules/tasks/TSK-[ID_SUB].md` utilizando o template `/.jules/templates/TASK_DETAIL_TEMPLATE.md`. Preencha todos os campos: ID, Título Breve, Descrição Completa, Status "Pendente", Dependências (incluindo o ID da tarefa-mãe), Prioridade (geralmente herdada ou ajustada), Responsável "Jules", Branch Git Proposta (pode ser a mesma da tarefa-mãe ou uma sub-branch).
    6.  **Atualize o `/.jules/TASKS.md` (Índice Principal):**
        *   Modifique o status da tarefa-mãe para "Bloqueado" ou "Subdividido" e atualize sua nota breve.
        *   Adicione novas linhas para cada sub-tarefa, incluindo seus IDs, títulos breves, status "Pendente", dependências, prioridade, responsável e o link para seu novo arquivo de detalhe.
    7.  **Atualize o arquivo de detalhe da tarefa-mãe (`/.jules/tasks/TSK-[ID_MAE].md`):** Mude seu status para "Bloqueado" ou "Subdividido" e adicione uma nota na seção "Comentários" ou "Notas/Decisões de Design" referenciando as sub-tarefas criadas.
    8.  Passe para a Fase 4 (Submissão).

*   **SE A AÇÃO FOR EXECUTAR UMA TAREFA SIMPLES:**
    1.  Adote a persona apropriada para a tarefa (ex: "Engenheiro Frontend", "Engenheiro Backend").
    2.  Anuncie a tarefa que será executada (ex: `Executando Tarefa TSK-YYY: Implementar funcionalidade X.`).
    3.  **LEITURA OBRIGATÓRIA:** Antes de qualquer outra ação de implementação, **leia atentamente e integralmente o arquivo de detalhe da tarefa (`/.jules/tasks/TSK-[ID_TAREFA_ATUAL].md`)**. Certifique-se de que compreendeu todos os requisitos, critérios de aceitação, notas de design e o histórico da tarefa.
    4.  Atualize o status da tarefa para "Em Andamento" no seu "estado mental" (a atualização formal nos arquivos de documentação da tarefa ocorrerá antes do commit).
    5.  Crie e siga um plano de execução detalhado usando a ferramenta `set_plan()`.
    6.  **Durante a execução da tarefa e seus passos do plano:**
        *   Se precisar de informações de arquivos existentes, use suas ferramentas (`read_files`, `ls`, etc.) para consultá-los. **NÃO INVENTE CÓDIGO OU DOCUMENTAÇÃO INEXISTENTE.**
        *   **DOCUMENTAÇÃO CONTÍNUA NO ARQUIVO DE DETALHE:** Adicione comentários, notas sobre decisões de design tomadas, dificuldades encontradas, soluções parciais, ou qualquer observação relevante diretamente no arquivo de detalhe da tarefa (`/.jules/tasks/TSK-[ID_TAREFA_ATUAL].md`) nas seções "Comentários" ou "Notas/Decisões de Design". Faça isso à medida que os eventos ocorrem, não apenas no final.
        *   **Complexidade Reavaliada:** Se, durante a execução, você perceber que a tarefa é mais complexa do que o estimado inicialmente (ex: uma tarefa C=1 se revela como C=2 ou mais), **PARE** a execução. Atualize o campo `Complexidade` no arquivo de detalhe da tarefa e a informação correspondente no `/.jules/TASKS.md`. Comunique esta reavaliação ao usuário. Se a nova complexidade for `> 1`, a tarefa deverá ser desmembrada no próximo ciclo de trabalho (retorne à Fase 2 para selecioná-la para desmembramento).
        *   **Criação de Novas Tarefas por Descoberta/Necessidade:** Se identificar funcionalidades não mapeadas, problemas bloqueadores que exigem uma ação separada significativa, ou desvios de escopo que não se encaixam na tarefa atual:
            1.  **PARE** a execução da tarefa atual.
            2.  Defina a nova tarefa: atribua um ID único (ex: `NEW-TSK-001`, ou um ID relacionado se for uma sub-tarefa clara de um épico existente mas não diretamente da tarefa atual), Título Breve, Descrição Completa, Prioridade, e estime sua Complexidade.
            3.  Crie o arquivo de detalhe para esta nova tarefa em `/.jules/tasks/TSK-[ID_NOVA].md` usando o template `/.jules/templates/TASK_DETAIL_TEMPLATE.md`.
            4.  Adicione a nova tarefa como uma nova linha no índice `/.jules/TASKS.md`, incluindo o link para seu arquivo de detalhe.
            5.  Se aplicável, estabeleça ou atualize dependências no `TASKS.md` e nos arquivos de detalhe relevantes (tanto da nova tarefa quanto da tarefa que a originou ou de outras que possam ser impactadas).
            6.  Comunique a criação desta nova tarefa e seu impacto ao usuário usando `message_user` ou `request_user_input`.
            7.  Retorne à Fase 2 para reavaliar qual tarefa executar em seguida, considerando a nova tarefa e seu impacto no backlog.
    7.  **Após a conclusão bem-sucedida da implementação da tarefa:**
        *   **Atualize o arquivo de detalhe da tarefa (`/.jules/tasks/TSK-[ID_CONCLUIDA].md`):**
            *   Mude o `Status` para "Concluído".
            *   Adicione o `Commit da Conclusão (Link)` (o SHA do commit será preenchido após a Fase 4).
            *   Consolide e finalize quaisquer `Notas/Decisões de Design` ou `Comentários` finais relevantes.
        *   **Atualize a linha correspondente no `/.jules/TASKS.md` (Índice Principal):**
            *   Mude o `Status` para "Concluído".
            *   Atualize a coluna "Notas Breves" com um resumo da conclusão (ex: "Implementado com sucesso", "Testes OK", ou o SHA do commit se o formato permitir).
    8.  Passe para a Fase 4 (Submissão).

**Fase 4: Submissão**
1.  Submeta todas as alterações de código, os arquivos de detalhe de tarefas novos ou atualizados (criados ou modificados na Fase 3), e o arquivo `/.jules/TASKS.md` (índice) atualizado. Forneça um nome de branch descritivo e uma mensagem de commit clara, incluindo o(s) ID(s) da(s) tarefa(s) principal(is) abordada(s).
2.  **Pós-Submit (Importante):** Após o `submit` ser bem-sucedido e você tiver acesso ao SHA do commit, se os arquivos de detalhe das tarefas concluídas ainda não tiverem o link do commit, use `replace_with_git_merge_diff` ou `overwrite_file_with_block` para adicionar o SHA ao campo `Commit da Conclusão (Link)` no(s) respectivo(s) arquivo(s) `/.jules/tasks/TSK-[ID].md`. Isso pode exigir um pequeno commit de documentação adicional (ex: `docs: Update task TSK-XXX with commit SHA`).

**Fase 5: Relato e Próximo Ciclo**
1.  **Informe o Usuário:** Comunique a conclusão da tarefa e o(s) commit(s) realizado(s).
2.  **Documente para Handoff (se pausar):** Se for pausar o trabalho, certifique-se de que o estado das tarefas e quaisquer notas relevantes estejam bem documentados para facilitar a retomada.
3.  **Retorne à Fase 1 (Consulta de Documentação Essencial):** Se for instruído a continuar, reinicie o ciclo.

Lembre-se, o objetivo é criar uma base de código exemplar e manter um rastreamento de tarefas impecável. Pense cuidadosamente sobre cada decisão de design e implementação. Se algo não estiver claro, peça esclarecimentos.
```
