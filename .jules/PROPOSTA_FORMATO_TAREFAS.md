# Proposta de Novo Formato para Gerenciamento de Tarefas

Esta proposta visa otimizar o sistema de gerenciamento de tarefas, tornando-o mais eficiente em termos de performance para o agente e mais organizado. A principal mudança é a separação dos detalhes das tarefas em arquivos individuais, mantendo um arquivo de índice principal mais enxuto.

## Estrutura Sugerida

### 1. Arquivo Principal de Índice (`/.jules/TASKS.md`)

Este arquivo conteria uma tabela simplificada com os campos essenciais para o planejamento e rastreamento de alto nível. O objetivo é que este arquivo seja pequeno e rápido de processar.

**Campos Sugeridos:**

*   `ID da Tarefa`: Identificador único da tarefa.
*   `Título Breve da Tarefa`: Uma descrição curta e direta.
*   `Status`: Pendente, Em Andamento, Concluído, Bloqueado, Revisão, Cancelado.
*   `Dependências (IDs)`: Lista de IDs de tarefas das quais esta depende.
*   `Prioridade (P0-P4)`: Nível de prioridade (P0: Crítica, P1: Alta, P2: Média, P3: Baixa, P4: Muito Baixa).
*   `Responsável`: Agente/Persona designada.
*   `Link para Detalhes`: Um link relativo para o arquivo de detalhe da tarefa.
*   `Notas Breves`: Comentários muito curtos ou status de alto nível (ex: "Subdividido", "Aguardando aprovação").

**Exemplo de Tabela em `/.jules/TASKS.md`:**

```markdown
# Tabela Principal de Tarefas - Fase 5

**Status:** Pendente, Em Andamento, Concluído, Bloqueado, Revisão, Cancelado
**Prioridade (P0-P4):** P0 (Crítica), P1 (Alta), P2 (Média), P3 (Baixa), P4 (Muito Baixa)

| ID da Tarefa | Título Breve da Tarefa                     | Status    | Dependências (IDs) | Prioridade | Responsável | Link para Detalhes                            | Notas Breves                                  |
|--------------|--------------------------------------------|-----------|--------------------|------------|-------------|-----------------------------------------------|-----------------------------------------------|
| APP-SVC-002  | Implementar WorkerService                  | Bloqueado | DOM-JOB-011, APP-SVC-001.8, APP-PORT-003 | P1         | Jules       | [TSK-APP-SVC-002.md](./tasks/TSK-APP-SVC-002.md) | Subdividido                                   |
| APP-SVC-002.1| Definir interface IWorkerService           | Pendente  | APP-SVC-002, DOM-JOB-011, APP-PORT-003 | P1         | Jules       | [TSK-APP-SVC-002.1.md](./tasks/TSK-APP-SVC-002.1.md) |                                               |
| LINT-FIX-001 | Corrigir todos os erros de lint            | Bloqueado | CONFIG-ESLINT-001.2| P2         | Jules       | [TSK-LINT-FIX-001.md](./tasks/TSK-LINT-FIX-001.md) | Subdividido                                   |
| LINT-FIX-001.1| Executar lint --fix e listar erros        | Pendente  | LINT-FIX-001, CONFIG-ESLINT-001.2 | P2         | Jules       | [TSK-LINT-FIX-001.1.md](./tasks/TSK-LINT-FIX-001.1.md) |                                               |
```

### 2. Arquivos de Detalhes da Tarefa (`/.jules/tasks/TSK-[ID_DA_TAREFA].md`)

Cada tarefa listada no arquivo de índice terá um arquivo Markdown correspondente em uma subpasta `/.jules/tasks/`. O nome do arquivo seguirá o padrão `TSK-[ID_DA_TAREFA].md` para facilitar a vinculação e a localização.

**Conteúdo de um Arquivo de Detalhe:**

Este arquivo conteria todos os campos detalhados que atualmente estão no `TASKS.md` expandido, como:

*   `ID da Tarefa`
*   `Título Breve da Tarefa`
*   `Descrição Completa da Tarefa`
*   `Status`
*   `Dependências (IDs)`
*   `Complexidade (1-5)` (Ainda útil para mim ao analisar a tarefa em detalhe)
*   `Prioridade (P0-P4)`
*   `Responsável`
*   `Branch Git Proposta` (se aplicável)
*   `Commit da Conclusão (Link)` (após conclusão)
*   `Critérios de Aceitação`
*   `Notas/Decisões de Design`
*   `Histórico de Modificações da Tarefa` (opcional, mas pode ser útil)

**Exemplo de Arquivo de Detalhe (`/.jules/tasks/TSK-APP-SVC-002.1.md`):**

```markdown
# Tarefa: APP-SVC-002.1 - Definir interface IWorkerService

**ID da Tarefa:** APP-SVC-002.1
**Título Breve:** Definir interface IWorkerService
**Descrição Completa:** Definir a interface para `WorkerService` (`IWorkerService`) e seus Data Transfer Objects (DTOs), baseando-se nas necessidades identificadas pelas dependências `DOM-JOB-011` (definição de Job) e `APP-PORT-003` (contrato da Fila). A interface deve cobrir o ciclo de vida dos workers e a execução de jobs.
**Status:** Pendente
**Dependências (IDs):** APP-SVC-002, DOM-JOB-011, APP-PORT-003
**Complexidade (1-5):** 1
**Prioridade:** P1
**Responsável:** Jules
**Branch Git Proposta:** `feature/app-worker-service-interface`
**Critérios de Aceitação:**
- Arquivo `IWorkerService.ts` criado em `src_refactored/core/application/ports/` (ou local apropriado).
- Interface `IWorkerService` definida com métodos para registrar, iniciar, parar workers e submeter jobs.
- DTOs necessários para a comunicação com o serviço definidos.
- Revisão da interface aprovada.
**Notas/Decisões:**
- Considerar os tipos de jobs que o WorkerService irá manusear ao definir os DTOs.
```

## Vantagens da Nova Abordagem

*   **Performance Aprimorada:** O arquivo de índice `TASKS.md` será significativamente menor, resultando em operações de leitura e escrita mais rápidas para o agente.
*   **Melhor Organização:** Os detalhes de cada tarefa são encapsulados em arquivos dedicados, facilitando a consulta e o gerenciamento da informação.
*   **Histórico Granular no Git:** As alterações nas tarefas serão isoladas em seus respectivos arquivos, o que melhora a clareza e a rastreabilidade das modificações no controle de versão.
*   **Redução de Conflitos de Merge:** Menor probabilidade de conflitos se diferentes tarefas forem trabalhadas em paralelo, já que as modificações ocorrerão em arquivos distintos.
*   **Maior Flexibilidade para Detalhes:** Os arquivos de tarefa individuais podem acomodar informações mais ricas e estruturadas (ex: múltiplos critérios de aceitação, decisões de design detalhadas, checklists) sem sobrecarregar a tabela principal.

## Impacto nas Operações do Agente (Jules)

*   **Fase 1 (Sincronização e Análise):** Continuarei lendo o `/.jules/TASKS.md` para obter a visão geral do projeto e identificar a próxima ação prioritária com base no status, dependências e prioridade.
*   **Fase 2 (Seleção da Ação):**
    *   **Desmembrar Tarefas Complexas:** Identificarei a tarefa-mãe no `TASKS.md`. Se necessário, lerei o arquivo de detalhe da tarefa-mãe para pleno entendimento. Criarei os novos arquivos de detalhe para cada sub-tarefa em `/.jules/tasks/`. Em seguida, atualizarei o `TASKS.md` principal para adicionar as linhas de índice para as novas sub-tarefas e marcar a tarefa-mãe como "Bloqueado" ou "Subdividido".
    *   **Executar Tarefa Simples:** Identificarei a tarefa no `TASKS.md` e, em seguida, lerei seu arquivo de detalhe correspondente em `/.jules/tasks/TSK-[ID].md` para obter todas as especificações e contexto necessário para a execução.
*   **Fase 3 (Execução da Ação):**
    *   **Desmembrar:** A criação dos novos arquivos `.md` para cada sub-tarefa será feita usando `create_file_with_block`. A atualização do `TASKS.md` principal (para adicionar as novas linhas de índice e modificar a tarefa-mãe) continuará usando `overwrite_file_with_block` (ou, idealmente, uma ferramenta de edição mais granular se disponível no futuro).
    *   **Executar:** Após a conclusão do código ou da ação da tarefa, atualizarei o *arquivo de detalhe da tarefa* (ex: `/.jules/tasks/TSK-ID.md`) para refletir o status "Concluído", adicionar notas, link do commit, etc. Em seguida, atualizarei a linha correspondente no `TASKS.md` principal para "Concluído" e adicionarei o link para o commit.
*   **Fase 4 (Submissão):** O commit incluirá as alterações nos arquivos de detalhe da(s) tarefa(s) modificada(s)/criada(s) e no arquivo de índice `TASKS.md`.

## Próximos Passos

Se esta proposta for aprovada, uma tarefa inicial precisará ser criada para:
1.  Migrar o conteúdo do `TASKS.md` atual para esta nova estrutura.
2.  Ajustar meus scripts internos (se necessário) para interagir com este novo formato.

Esta mudança estrutural deve aliviar significativamente os gargalos de performance relacionados ao processamento do arquivo `TASKS.md`.
