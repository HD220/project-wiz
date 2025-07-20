# Gerenciamento de Issues e Tarefas

## Resumo Executivo

Implementação de sistema Kanban para tracking e gerenciamento de issues/tarefas dentro de projetos, com integração completa ao sistema de agentes para automação de desenvolvimento.

## Contexto e Motivação

O Project Wiz precisa de um sistema estruturado para organizar e acompanhar o trabalho de desenvolvimento. Diferente de ferramentas tradicionais, este sistema será integrado com agentes de IA que podem automaticamente pegar, trabalhar e resolver issues. A documentação prevê esta funcionalidade como parte essencial do workflow colaborativo humano-IA.

## Escopo

### Incluído:

- Schema `issues` com estados Kanban (todo, doing, done, blocked)
- Schema `issue_assignments` para atribuição a humanos/agentes
- IssueService para CRUD e workflow management
- Integração com sistema de agentes para auto-assignment
- Estados de prioridade e categorização (bug, feature, chore)
- Comentários e atualizações de status em issues
- Métricas básicas (tempo em cada estado, throughput)
- IPC handlers completos para frontend

### Não Incluído:

- Estimativas de pontos ou tempo complexas
- Dependências entre issues (será funcionalidade futura)
- Integração com sistemas externos (GitHub, Jira)
- Relatórios avançados e analytics

## Impacto Esperado

- **Usuários:** Visibilidade clara do progresso do projeto e distribuição de trabalho
- **Desenvolvedores:** Framework para automação de tarefas via agentes
- **Sistema:** Base para workflow colaborativo estruturado entre humanos e IA

## Critérios de Sucesso

- Issues podem ser criadas, editadas e movidas entre estados
- Agentes podem automaticamente pegar issues da coluna "todo"
- Histórico completo de mudanças e comentários é mantido
- Board Kanban visual mostra distribuição atual de trabalho
- Métricas básicas ajudam a identificar gargalos no workflow
