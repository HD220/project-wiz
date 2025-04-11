# Handoff - ISSUE-0148 - Remover dados fixos do dashboard e páginas

## Resumo do problema
O frontend utilizava dados fixos (mockados ou hardcoded) no dashboard, prejudicando a experiência real do usuário e mascarando o estado real do sistema.

## O que foi feito
- **Removidos todos os dados fixos do dashboard** (`repositoryMetrics`).
- **Criado o hook `useRepositoryMetrics`** que consulta o banco SQLite via Drizzle ORM, calculando métricas reais a partir da tabela `activityLog`.
- **Dashboard atualizado** para usar o hook dinâmico, exibindo dados reais ou mensagens apropriadas durante carregamento, erro ou ausência de dados.
- **Verificado o componente `LlmMetricsDashboard`**, que já utiliza dados dinâmicos via hooks (`useLlmMetrics`, `useGpuMetrics`).
- **Revisadas páginas relacionadas** (`repositories`, `repository-settings`) e confirmado que não utilizam dados fixos.
- **Fallback seguro implementado**: mensagens de loading, erro e ausência de dados garantem boa experiência mesmo sem dados.

## Recomendações para continuidade
- Expandir a coleta de métricas no backend para enriquecer o dashboard.
- Atualizar ou criar testes automatizados cobrindo cenários com dados reais, ausência de dados e erros.
- Coordenar com o backend para garantir a qualidade e disponibilidade dos dados.
- Futuras melhorias podem incluir filtros, exportação e visualizações avançadas.

## Checklist para revisão
- [x] Todos os dados fixos removidos do dashboard
- [x] Dados dinâmicos carregados via Drizzle ORM
- [x] Fallback seguro implementado para ausência de dados
- [ ] Testes automatizados atualizados
- [x] Documentação técnica atualizada
- [x] Código revisado e aprovado

## Links cruzados
- Futuras issues podem ser abertas para ajustes ou criação de endpoints no backend, caso identificadas dependências durante a execução desta tarefa.