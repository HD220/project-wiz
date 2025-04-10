# ISSUE-0159 - Consolidar Dashboards Técnicos

## Contexto e diagnóstico

Os dashboards técnicos do projeto estão dispersos, incompletos ou desatualizados, dificultando o acompanhamento da saúde do projeto, cobertura de testes, dívidas técnicas, status da documentação, métricas de qualidade e segurança. Isso impacta negativamente a gestão, priorização e tomada de decisão.

## Justificativa

- Centralizar informações críticas para gestão técnica
- Facilitar o acompanhamento contínuo da evolução do projeto
- Identificar rapidamente gargalos, riscos e prioridades
- Suportar auditorias, compliance e planejamento incremental
- Melhorar a comunicação entre times técnicos e stakeholders

## Recomendações técnicas

- Consolidar e atualizar dashboards em `docs/templates/` e `docs/`, cobrindo:
  - Saúde geral do projeto
  - Cobertura de testes (unitários, integração, E2E)
  - Dívida técnica e violações de padrões
  - Status da documentação (completude, gaps)
  - Métricas de qualidade de código (complexidade, duplicação)
  - Segurança (vulnerabilidades, dependências)
- Utilizar templates padronizados e exemplos claros
- Incluir gráficos, tabelas e indicadores visuais
- Garantir atualização contínua e versionamento
- Referenciar ADRs, plano de testes, API Reference e guias relacionados

## Critérios de aceitação

- Dashboards técnicos consolidados, atualizados e versionados
- Indicadores visuais claros e objetivos
- Links cruzados com issues, ADRs, templates e documentação relacionada
- Revisão por pelo menos um membro sênior
- Disponíveis em `docs/` e `docs/templates/` com referências no README principal

## Riscos e dependências

- Dependência de coleta e atualização contínua das métricas
- Risco de desatualização se não houver processo contínuo de revisão
- Dependência de integração com ferramentas de análise e CI/CD

## Prioridade

Média — foco em gestão técnica e visibilidade

## Relacionamentos

- Relacionar com outras issues de documentação, qualidade, testes e ADRs assim que criadas