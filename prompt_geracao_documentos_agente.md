**Solicitação de Configuração Inicial de Agente para Projeto Novo**

Olá! Estamos iniciando um novo projeto de software e gostaríamos de configurar a estrutura inicial para colaboração com agentes LLM como você. Por favor, gere os seguintes artefatos, mantendo-os genéricos o suficiente para serem adaptados a qualquer tipo de projeto, mas fornecendo uma estrutura sólida:

1.  **`AGENTS.md` (Guia para Agentes LLM)**
    *   **Objetivo:** Servir como o principal documento de orientação para qualquer agente LLM que trabalhe neste repositório.
    *   **Seções a incluir (sugestões, adicione outras se relevante):**
        *   `Introdução`: Breve boas-vindas e propósito do documento.
        *   `Visão Geral do Projeto (Placeholder)`: Um espaço para ser preenchido posteriormente com a descrição do projeto específico `[NOME_DO_PROJETO]`.
        *   `Princípios Gerais de Desenvolvimento`: Inclua placeholders ou exemplos de princípios como Clareza de Código, DRY, KISS, Testabilidade, Segurança.
        *   `Padrões Arquiteturais (Placeholder)`: Espaço para descrever a arquitetura principal (ex: Camadas, Microserviços, MVC, etc.) a ser definida para o projeto. Referenciar `[LINK_PARA_DOCUMENTO_DE_ARQUITETURA]`.
        *   `Estrutura de Código Sugerida (Placeholder)`: Um local para detalhar a organização das pastas e arquivos.
        *   `Tecnologias Chave (Placeholder)`: Para listar as principais linguagens, frameworks e ferramentas.
        *   `Fluxo de Trabalho de Desenvolvimento`: Dicas gerais sobre como contribuir (ex: TDD/BDD, commits, revisões de código, branches).
        *   `Comunicação`: Como o agente deve interagir, pedir ajuda, reportar progresso.
        *   `Considerações Específicas (Placeholder)`: Para quaisquer regras ou convenções únicas do projeto.

2.  **`TASKS.md` (Rastreador de Tarefas)**
    *   **Objetivo:** Um arquivo Markdown simples para rastrear tarefas de desenvolvimento de alto nível, seu status, dependências e responsáveis (que podem ser humanos ou LLMs).
    *   **Formato Sugerido:** Uma tabela Markdown com colunas como:
        *   `ID da Tarefa` (ex: FEAT-001, BUG-002, DOC-003)
        *   `Descrição da Tarefa`
        *   `Status` (ex: Pendente, Em Andamento, Concluído, Bloqueado, Revisão)
        *   `Prioridade` (ex: Alta, Média, Baixa)
        *   `Responsável` (ex: Desenvolvedor A, AgenteJules, [NOME_DO_MEMBRO_DA_EQUIPE])
        *   `Dependências (IDs)`
        *   `Data de Criação`
        *   `Data de Conclusão (Estimada/Real)`
        *   `Notas`
    *   Inclua um exemplo de como preencher uma ou duas tarefas fictícias.

3.  **`PROMPT_HANDOFF.md` (Template para Continuação de Trabalho)**
    *   **Objetivo:** Um template Markdown que os desenvolvedores (humanos ou LLMs) usarão para passar o contexto do trabalho para o próximo agente ou para continuar o trabalho em uma sessão futura. Isso garante que informações cruciais não sejam perdidas.
    *   **Seções a incluir (sugestões):**
        *   `## 1. Visão Geral da Tarefa Principal`
            *   `Breve descrição do objetivo geral que está sendo trabalhado.`
        *   `## 2. Ponto de Continuação`
            *   `### 2.1. Última Tarefa Concluída:`
                *   `ID da Tarefa (de TASKS.md): [PREENCHER_ID_ULTIMA_TAREFA_CONCLUIDA]`
                *   `Descrição Breve: [PREENCHER_DESCRICAO_ULTIMA_TAREFA]`
                *   `Commit Associado (se aplicável): [LINK_OU_HASH_DO_COMMIT]`
                *   `Resumo das Mudanças: [BREVE_RESUMO_DO_QUE_FOI_FEITO_NA_ULTIMA_TAREFA]`
            *   `### 2.2. Próxima Tarefa Imediata:`
                *   `ID da Tarefa (de TASKS.md): [PREENCHER_ID_PROXIMA_TAREFA]`
                *   `Descrição da Tarefa: [COPIAR_DESCRICAO_DA_PROXIMA_TAREFA]`
                *   `Complexidade Estimada (opcional): [COMPLEXIDADE_DA_PROXIMA_TAREFA]`
            *   `### 2.3. Estado Atual do Código Relevante:`
                *   `Branch Git Atual: [NOME_DA_BRANCH_GIT_ATUAL]`
                *   `Arquivos Criados/Modificados na Sessão Anterior (relevantes para esta tarefa):`
                    *   `[CAMINHO_ARQUIVO_1]`
                    *   `[CAMINHO_ARQUIVO_2]`
                *   `Observações sobre o Estado do Código: [QUALQUER_NOTA_IMPORTANTE_SOBRE_O_ESTADO_ATUAL]`
        *   `## 3. Contexto Chave e Documentação de Referência`
            *   `Listar documentos importantes (ex: AGENTS.md, TASKS.md, especificações de features [LINK_ESPECIFICACAO_FEATURE_X], diagramas de arquitetura [LINK_DIAGRAMA_Y]).`
        *   `## 4. Bloqueios ou Questões Pendentes`
            *   `Descrever qualquer bloqueio ou questão que precise de input antes de prosseguir. Se não houver, declare: "Nenhum bloqueio identificado."`
        *   `## 5. Objetivo Específico para a Próxima Sessão de Trabalho`
            *   `Detalhar o que precisa ser feito para concluir a próxima tarefa específica.`

Por favor, crie o conteúdo inicial para cada um desses três arquivos. Eles devem ser genéricos, mas bem estruturados, para que possam ser facilmente customizados quando o projeto específico (`[NOME_DO_PROJETO]`) for definido. Utilize os placeholders indicados para facilitar a substituição posterior.
---
**Notas para a LLM que está gerando os arquivos:**
*   Para `AGENTS.md`, na seção de `Princípios Gerais`, você pode listar alguns como "Escreva código claro e legível", "Evite repetição (DRY)", "Mantenha a simplicidade (KISS)", "Priorize a testabilidade", "Considere a segurança desde o início".
*   Para `TASKS.md`, um exemplo de tarefa poderia ser: `FEAT-001 | Configuração inicial do projeto | Pendente | Alta | [NOME_DO_MEMBRO_DA_EQUIPE] | - | AAAA-MM-DD | AAAA-MM-DD | Configurar linters, formatadores e estrutura básica de pastas.`
*   Todos os arquivos devem ser criados na raiz do repositório, a menos que uma estrutura de pastas diferente seja mais apropriada para templates (ex: em uma pasta `.templates/`). Por agora, crie-os na raiz.
