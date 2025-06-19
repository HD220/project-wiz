# Caso de Uso: Refatorar Código Legado e Adicionar Testes Unitários

Este documento detalha um cenário de uso para o Project Wiz, onde um usuário solicita a refatoração de um módulo de código legado e a criação de testes unitários correspondentes. O objetivo é explorar as interações entre o usuário, a Persona (Agente + LLM) e as Tools.

## Personagens Envolvidos

*   **Usuário:** Desenvolvedor que deseja melhorar um código existente.
*   **PersonaDevSenior:** Uma Persona configurada com o papel de Desenvolvedor Sênior/Arquiteto, com acesso a `GitTools`, `Tools` de leitura/escrita de arquivos, execução de comandos no terminal, e capacidade de análise e geração de código via LLM.

## Fluxo Detalhado do Caso de Uso

**Etapa 1: Solicitação do Usuário**

*   **Interação:** O Usuário inicia uma conversa com a PersonaDevSenior através da interface de chat do Project Wiz.
    *   **Usuário:** "Olá, PersonaDevSenior! Tenho um módulo de código legado em Python aqui (`caminho/do/modulo.py`) que está bastante confuso e não possui testes unitários. Gostaria que você o refatorasse para melhorar a legibilidade, seguindo os padrões PEP 8, e também criasse testes unitários para as funções principais dele usando a biblioteca `unittest`. O código está no nosso repositório X, branch Y."
*   **Suposição do Analista:**
    *   O usuário especifica o repositório e branch. A Persona terá `Tools` para acessar este código.

**Etapa 2: Análise, Planejamento, Definição de Pronto e Ponto de Verificação com Usuário**

*   **Ações da PersonaDevSenior (internas, orquestradas pelo seu LLM):**
    1.  **Entendimento da Solicitação:** O LLM interpreta a solicitação do usuário.
    2.  **Criação do Job Principal:** A PersonaDevSenior cria um novo Job principal para si mesma em sua Fila interna.
        *   **Nome do Job (exemplo):** "Refatorar `modulo.py` (do repo X, branch Y) e Adicionar Testes Unitários"
        *   **Payload Inicial (armazenado no `ActivityContext` do Job):**
            *   `repo_url: "url_do_repo_x"`
            *   `branch_original: "Y"`
            *   `caminho_arquivo_original: "caminho/do/modulo.py"`
            *   `padrao_estilo: "PEP 8"`
            *   `framework_testes: "unittest"`
            *   `solicitacao_original_usuario: "Olá, PersonaDevSenior! ..."`
            *   `project_working_directory: "/path/to/local/repoX"` (Assumindo que esta informação vem do `Project`)
    3.  **Preparação do Ambiente de Trabalho (na `working_directory` do Projeto):**
        *   A PersonaDevSenior identifica a `caminho_working_directory` do Projeto X.
        *   Usa `gitCheckoutBranchTool(branch_name=branch_Y, cwd=project_working_directory)` para garantir que está no branch correto.
        *   Cria um novo branch para o Job: `gitCreateBranchTool(new_branch_name="feature/refactor-modulo-" + timestamp, base_branch_name=branch_Y, cwd=project_working_directory)`. Todas as operações subsequentes serão neste novo branch.
        *   Usa `readFileTool(path=project_working_directory + "/" + caminho_arquivo_original)` para carregar o código no `ActivityContext`.
    4.  **Análise Inicial e Definição de Pronto (`validationCriteria`):**
        *   O LLM analisa o código carregado.
        *   Com base na análise e na solicitação, o LLM, instruído pela Persona, define os `validationCriteria` para o Job principal. Exemplo:
            *   "Código em `modulo.py` refatorado e em conformidade com PEP 8."
            *   "Testes unitários criados para as funções A, B, C (identificadas como principais)."
            *   "Todos os testes unitários devem passar."
            *   "Um novo branch Git será criado com as alterações."
        *   Estes critérios são armazenados no `ActivityContext` do Job principal.
    5.  **Planejamento de Alto Nível (Criação de Sub-Jobs):** O LLM define um plano de ação, que agora consiste na criação de Sub-Jobs formais.
        *   Sub-Job 1: "Analisar e Refatorar `modulo.py` para PEP 8" (Depende de: Nenhum)
        *   Sub-Job 2: "Identificar Funções Chave em `modulo.py` para Testes" (Depende de: Sub-Job 1)
        *   Sub-Job 3: "Gerar Testes Unitários (`unittest`) para Funções Identificadas" (Depende de: Sub-Job 2)
        *   Sub-Job 4: "Executar e Validar Testes Unitários" (Depende de: Sub-Job 3)
        *   Sub-Job 5: "Commitar Alterações e Preparar Entrega" (Depende de: Sub-Job 4)
        *   A PersonaDevSenior cria esses `Sub-Jobs` em sua Fila, com `parent_job_id` referenciando o Job principal e as `depends_on_job_ids` apropriadas.
*   **Ponto de Verificação com Usuário:**
    *   **PersonaDevSenior (Chat):** "Entendido! Analisei o módulo `modulo.py` do branch Y. Meu plano é o seguinte:
        1.  Refatorar o código para conformidade com PEP 8.
        2.  Identificar as funções principais que necessitam de testes.
        3.  Gerar os testes unitários usando `unittest`.
        4.  Executar todos os testes para garantir que estão passando.
        5.  Commitar tudo em um novo branch para sua revisão.
    *   Minha Definição de Pronto para este trabalho será: código refatorado, testes criados para as funções X, Y, Z, todos os testes passando, e alterações commitadas.
    *   Você aprova esta abordagem antes que eu inicie a execução?"
*   **Interação do Usuário:**
    *   **Usuário (Chat):** "Sim, parece ótimo! Pode prosseguir." (Ou solicita ajustes no plano).

**Etapa 3: Execução dos Sub-Jobs (Iteração entre LLM e Tools dentro da `working-directory`)**

*   A PersonaDevSenior processa seus Sub-Jobs sequencialmente, conforme as dependências:

    *   **Sub-Job 1: Analisar e Refatorar `modulo.py` para PEP 8**
        *   (Código já lido na Etapa 2.3 e está no `ActivityContext`)
        *   **Ação (Task interna):** Persona envia o conteúdo ao LLM: "Analise este código Python (já no contexto). Identifique áreas que violam o PEP 8 ou dificultam a legibilidade. Depois, refatore o código para máxima legibilidade e conformidade com PEP 8. Explique as principais alterações."
        *   **Resultado:** LLM retorna o código refatorado e as explicações.
        *   **Ação:** Persona usa `writeFileTool(path=project_working_directory + "/" + caminho_arquivo_original, content=codigo_refatorado_do_llm)` (sobrescreve o original no branch do Job).
        *   **Ação:** Persona usa `executeTerminalCommandTool(command="flake8 " + caminho_arquivo_original, cwd=project_working_directory)` para verificar. Se houver erros, pode haver um sub-loop de correção com o LLM e `writeFileTool`. (Nota: Se encontrar dificuldades persistentes, a Persona pode aplicar "regras de ouro": reavaliar a abordagem, dividir mais o problema, ou como último recurso, pedir ajuda ao usuário).

    *   **Sub-Job 2: Identificar Funções Chave em `modulo.py` para Testes**
        *   **Ação (Task interna):** Persona envia o código refatorado (do `ActivityContext` do Sub-Job 1 ou relendo da `working_directory` do projeto) ao LLM: "Liste as funções principais deste módulo que deveriam ter testes unitários."
        *   **Resultado:** LLM retorna a lista de funções. Armazenado no `ActivityContext` do Sub-Job 2.

    *   **Sub-Job 3: Gerar Testes Unitários (`unittest`) para Funções Identificadas**
        *   Para cada função identificada:
            *   **Ação (Task interna):** Persona envia a assinatura da função ao LLM: "Gere casos de teste `unittest` abrangentes para a função `nome_da_funcao`."
            *   **Resultado:** LLM retorna o código dos testes.
            *   **Ação:** Persona agrega os testes gerados e usa `writeFileTool(path=project_working_directory + "/test_modulo.py", content=codigo_testes_agregados, mode="append_or_create")`. (Pode usar `searchAndReplaceInFileTool` ou `applyDiffTool` para modificações mais granulares se o arquivo já existir e precisar de ajustes).
        *   *(Suposição: Persona pode usar `findFilesByNameTool("*.py", project_working_directory)` ou `searchInFileContentTool("def minha_funcao", project_working_directory)` se precisar localizar/confirmar arquivos ou conteúdo específico).*

    *   **Sub-Job 4: Executar e Validar Testes Unitários**
        *   **Ação:** Persona usa `executeTerminalCommandTool(command="python -m unittest test_modulo.py", cwd=project_working_directory)`.
        *   **Resultado:** Saída dos testes é capturada.
        *   **Ação (Task interna):** Persona envia a saída ao LLM: "Analise o resultado dos testes. Todos passaram? Se não, quais falharam e por quê? Sugira correções."
        *   **Resultado:** LLM analisa. Se houver falhas, a Persona entra em um sub-loop (corrigir teste ou código da função, `writeFileTool`/`applyDiffTool`, re-executar testes). Se as dificuldades persistirem, pode pedir ajuda ao usuário.

    *   **Sub-Job 5: Commitar Alterações e Preparar Entrega**
        *   (Assegura que está no branch correto: `feature/refactor-modulo-<timestamp>`)
        *   **Ação:** Persona usa `gitAddTool(files=[caminho_arquivo_original, "test_modulo.py"], cwd=project_working_directory)`.
        *   **Ação (Task interna):** Persona instrui LLM para gerar mensagem de commit: "Gere uma mensagem de commit concisa para refatoração PEP 8 e adição de testes unitários para `modulo.py`."
        *   **Resultado:** Mensagem de commit gerada.
        *   **Ação:** Persona usa `gitCommitTool(message=mensagem_commit, cwd=project_working_directory)`.
        *   **Ação (Opcional, configurável):** Persona usa `gitPushTool(branch_name="feature/refactor-modulo-" + timestamp, cwd=project_working_directory)`.

**Etapa 4: Auto-Validação Final do Job Principal pela Persona**

*   **Ações da PersonaDevSenior (internas, com seu LLM):**
    *   Após a conclusão bem-sucedida de todos os Sub-Jobs, a Persona revisita os `validationCriteria` definidos na Etapa 2 para o Job Principal.
    *   O LLM verifica se os resultados dos Sub-Jobs atendem a esses critérios.
    *   Se alguma validação falhar, a Persona pode decidir criar um novo Sub-Job corretivo ou, em caso de falha persistente, marcar o Job principal como falho e notificar o usuário.

**Etapa 5: Conclusão e Apresentação ao Usuário**

*   **Ações da PersonaDevSenior (Chat):**
    *   "Olá! Concluí a refatoração do `modulo.py` e a criação dos testes unitários.
        *   As alterações foram commitadas no branch: `feature/refactor-modulo-<timestamp>` dentro da working directory do projeto em `path/to/local/repoX`.
        *   (Se push configurado) O branch também foi enviado para o repositório remoto.
    *   Resumo das alterações:
        *   O código em `caminho/do/modulo.py` foi refatorado para conformidade com PEP 8.
        *   Testes unitários foram criados em `test_modulo.py` para as funções principais.
        *   Todos os testes passaram.
    *   (Opcional) [LLM gera um breve resumo das refatorações mais significativas].
    *   Sugiro que você revise o branch. Posso ajudar com mais alguma coisa neste módulo?"
*   **Aprendizado (Interno):**
    *   A PersonaDevSenior pode agora atualizar seu `AgentInternalState`.
        *   **Conhecimento Específico do Projeto:** "O arquivo `caminho/do/modulo.py` no projeto X foi refatorado em DD/MM/AAAA, focando em PEP 8 e adição de testes `unittest`. Funções principais testadas: A, B, C."
        *   **Conhecimento Geral (Opcional):** Se uma técnica de refatoração específica ou um padrão de teste se mostrou particularmente útil, isso poderia ser uma nota genérica para "melhores práticas de refatoração Python".

## Perguntas para Discussão e Refinamento:

1.  **Interação do Usuário:**
    *   O ponto de verificação após o planejamento é suficiente? Ou seriam desejáveis mais pontos de interação/aprovação (ex: após a refatoração e antes da geração dos testes)?
    *   A criação de um novo branch para as alterações é uma boa prática padrão?

2.  **Sub-Jobs vs Tasks Internas:**
    *   A formalização em Sub-Jobs adiciona clareza ao processo e permite melhor rastreamento e potencial paralelização (se diferentes Sub-Jobs puderem ser feitos por Personas diferentes no futuro). Esta abordagem parece adequada?

3.  **Tools Adicionais:**
    *   As `GitTools` são essenciais. `searchAndReplaceInFileTool` e `applyDiffTool` oferecem granularidade. As `Tools` de busca (`findFilesByNameTool`, `searchInFileContentTool`) parecem úteis para contextos mais amplos. Alguma outra `Tool` crítica para este cenário?

4.  **Estratégia de Dificuldades ("Regras de Ouro"):**
    *   Como a Persona decide quando é hora de "pedir ajuda" versus continuar tentando ou simplificando o problema? Isso seria configurável na Persona?

5.  **"Definição de Pronto" (Validation Criteria):**
    *   A definição antecipada dos `validationCriteria` pelo LLM/Persona, e a aprovação implícita pelo usuário ao aceitar o plano, parece um bom fluxo?

6.  **Entrega via Git:**
    *   A entrega via branch Git é preferível a apenas fornecer os arquivos modificados? Oferecer um `diff` no chat seria útil?

7.  **Evolução do `AgentInternalState`:**
    *   A distinção entre conhecimento específico do projeto e conhecimento geral da Persona para o `AgentInternalState` é uma boa abordagem para aprendizado contínuo? Como evitar que o `AgentInternalState` se torne excessivamente grande ou ruidoso?

Agradeço antecipadamente seu feedback sobre este cenário!
```
