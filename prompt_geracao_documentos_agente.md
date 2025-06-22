**Solicitação de Configuração Inicial de Agente para Projeto Novo**

Olá! Estamos iniciando um novo projeto de software e gostaríamos de configurar a estrutura inicial para colaboração com agentes LLM como você. Por favor, gere os seguintes artefatos, mantendo-os genéricos o suficiente para serem adaptados a qualquer tipo de projeto, mas fornecendo uma estrutura sólida:

1.  **`/AGENTS.md` (Guia para Agentes LLM)**
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

2.  **`.jules/TASKS.md` (Rastreador de Tarefas)**
    *   **Objetivo:** Um arquivo Markdown simples para rastrear tarefas de desenvolvimento de alto nível, seu status, dependências e responsáveis (que podem ser humanos ou LLMs).
    *   **Formato Sugerido:** Uma tabela Markdown com colunas como:
        *   `ID da Tarefa` (ex: FEAT-001, BUG-002, DOC-003)
        *   `Descrição da Tarefa`
        *   `Status` (ex: Pendente, Em Andamento, Concluído, Bloqueado, Revisão)
        *   `Complexidade (1-5)` 1 (Muito Baixa), 2 (Baixa), 3 (Média), 4 (Alta), 5 (Muito Alta)
        *   `Responsável` (ex: Desenvolvedor A, AgenteJules, [NOME_DO_MEMBRO_DA_EQUIPE])
        *   `Dependências (IDs)`
        *   `Data de Criação`
        *   `Data de Conclusão (Estimada/Real)`
        *   `Notas`
    *   Inclua um exemplo de como preencher uma ou duas tarefas fictícias.

3.  **`.jules/AGENT_WORKFLOW.md` (Protocolo de Continuidade de Trabalho para Agente LLM)**
	Arquivo:
	```markdown
	**Para o Agente LLM (Jules):**

	Este documento define o seu fluxo de trabalho padrão ao ser instruído a "prosseguir com as tarefas" ou "continuar o trabalho" neste projeto. O objetivo é garantir uma abordagem sistemática, autônoma e alinhada com as práticas de desenvolvimento estabelecidas.

	## Fluxo de Trabalho Cíclico:

	Ao receber uma instrução genérica para continuar o trabalho, siga os passos abaixo:

	1.  **Consulta de Documentação Essencial:**
		*   **Revisite `AGENTS.md`:** Antes de qualquer ação, releia o `AGENTS.md` para relembrar a visão geral do projeto, princípios de desenvolvimento, padrões arquiteturais, estrutura de código, tecnologias chave, e quaisquer considerações específicas do projeto. Preste atenção especial às seções que podem ter sido atualizadas.
		*   **Analise `.jules/TASKS.md`:** Este é o seu principal backlog de tarefas.

	2.  **Seleção e Gerenciamento de Tarefas:**
		*   **Identifique Tarefas Pendentes:** No `.jules/TASKS.md`, procure por tarefas com status "Pendente".
		*   **Priorize Complexidade 1:** Selecione uma tarefa com `Complexidade (1-5) = 1`. Se houver múltiplas, você pode escolher com base na data de criação ou em qualquer outra heurística simples, ou perguntar se houver ambiguidade.
		*   **Subdivisão de Tarefas Complexas:**
			*   Se **não** houver tarefas de complexidade 1 disponíveis, identifique a próxima tarefa pendente de maior prioridade (ou a mais antiga) que tenha complexidade > 1.
			*   **Seu objetivo principal agora é subdividir esta tarefa complexa.** Proponha um plano detalhado de subdivisão, quebrando a tarefa original em múltiplas sub-tarefas, cada uma com complexidade estimada de 1.
			*   Apresente este plano de subdivisão ao usuário para aprovação. **Não prossiga com a execução da tarefa original ou das sub-tarefas propostas antes da aprovação.**
			*   Uma vez aprovado, atualize o `.jules/TASKS.md`: marque a tarefa original como "Bloqueado" ou "Subdividido" (adicionando uma nota referenciando as novas sub-tarefas) e adicione as novas sub-tarefas (com complexidade 1) à lista. Em seguida, retorne ao passo de seleção de tarefa (priorizando as recém-criadas).

	3.  **Execução de Tarefa (para tarefas de Complexidade 1):**
		*   **Crie um Plano de Execução Detalhado:** Para a tarefa selecionada, use a ferramenta `set_plan()` para articular um plano passo a passo de como você pretende implementá-la. Este plano deve ser específico e acionável.
		*   **Desenvolva Conforme o Plano:** Siga seu plano, utilizando as ferramentas disponíveis (`ls`, `read_files`, `create_file_with_block`, `replace_with_git_merge_diff`, `run_in_bash_session`, etc.).
		*   **Testes (quando aplicável):** Se a tarefa envolve lógica de backend (casos de uso, actions), escreva ou atualize os testes unitários/integração relevantes. Siga as diretrizes de teste em `AGENTS.md`.
		*   **Commits:** Faça commits intermediários se a tarefa for um pouco mais longa, usando mensagens de commit claras e seguindo o padrão Conventional Commits.
		*   **Documente o Progresso:** Use `plan_step_complete()` após cada passo significativo do seu plano.

	4.  **Conclusão e Submissão da Tarefa:**
		*   **Verificação Final:** Revise seu trabalho. Certifique-se de que a tarefa foi totalmente concluída conforme os requisitos. Execute testes relevantes (`npm test` para lógica de backend).
		*   **Submeta o Código:** Utilize a ferramenta `submit()` para criar um Pull Request (simulado). Forneça um nome de branch descritivo e uma mensagem de commit detalhada.
		*   **Atualize `.jules/TASKS.md`:** Mude o status da tarefa para "Concluído" e preencha a "Data de Conclusão (Real)". Adicione notas relevantes, como o link para o commit ou PR.

	5.  **Relate e Prepare para a Próxima Tarefa (ou Handoff):**
		*   **Informe o Usuário:** Comunique a conclusão da tarefa.
		*   **Documente para Handoff (se pausar):** Se você for pausar o trabalho antes de iniciar a próxima tarefa, preencha (mentalmente ou se instruído, em um arquivo temporário) as seções do que seria um `PROMPT_HANDOFF.md` para facilitar a retomada. O foco é garantir que o próximo agente (ou você mesmo em uma futura sessão) possa continuar eficientemente.
		*   **Retorne ao Passo 2:** Se houver mais tarefas e você for instruído a continuar, reinicie o ciclo.

	## Considerações Adicionais:

	*   **Erros e Bloqueios:** Se encontrar um erro que não consegue resolver ou um bloqueio, não prossiga cegamente. Pare, documente o problema (usando a estrutura de um `PROMPT_HANDOFF.md` para o contexto) e solicite ajuda ao usuário.
	*   **Clareza:** Se os requisitos de uma tarefa em `TASKS.md` não estiverem claros, peça esclarecimentos antes de iniciar o trabalho.
	*   **Autonomia com Responsabilidade:** Siga este protocolo para operar de forma autônoma, mas sempre priorize a qualidade, a comunicação e o alinhamento com os objetivos do projeto definidos em `AGENTS.md`.

	Este protocolo visa otimizar sua contribuição e garantir um desenvolvimento consistente e rastreável.
	```

Por favor, crie o conteúdo inicial para cada um desses três arquivos. Eles devem ser genéricos, mas bem estruturados, para que possam ser facilmente customizados quando o projeto específico (`[NOME_DO_PROJETO]`) for definido. Utilize os placeholders indicados para facilitar a substituição posterior.
---
**Notas para a LLM que está gerando os arquivos:**
*   Para `AGENTS.md`, na seção de `Princípios Gerais`, você pode listar alguns como "Escreva código claro e legível", "Evite repetição (DRY)", "Mantenha a simplicidade (KISS)", "Priorize a testabilidade", "Considere a segurança desde o início".
*   Para `TASKS.md`, um exemplo de tarefa poderia ser: `FEAT-001 | Configuração inicial do projeto | Pendente | 4 - Alta | [NOME_DO_MEMBRO_DA_EQUIPE] | - | AAAA-MM-DD | AAAA-MM-DD | Configurar linters, formatadores e estrutura básica de pastas.`
