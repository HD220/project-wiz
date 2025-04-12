# ISSUE-0176: Refatorar `llm-metrics-dashboard` para Clean Code, Clean Architecture e i18n

## Contexto

O componente `src/client/components/llm-metrics-dashboard.tsx` é responsável pela visualização das métricas dos LLMs no dashboard. Atualmente, ele apresenta diversos problemas que comprometem a manutenibilidade, escalabilidade e aderência aos padrões do projeto, conforme identificado em análise recente.

## Problemas Identificados

- **Textos, labels e comentários em português** (violação SDR-0001)
- **Componente excessivamente grande** (>200 linhas), dificultando manutenção e testes
- **Violação do SRP e DRY**: lógica de estado/histórico misturada à UI, duplicidade de código
- **Acoplamento de lógica de domínio à UI**: manipulação de histórico e cálculo de métricas não isolados
- **Ausência de internacionalização (i18n)**: impossibilita suporte multilíngue
- **Falta de tratamento de edge cases**: não lida adequadamente com dados inconsistentes ou ausentes

## Objetivo

Refatorar o componente para garantir:

- Aderência ao Clean Code e Clean Architecture (ADRs 0012, 0013, 0014)
- Internacionalização completa (SDR-0001, issues relacionadas à i18n)
- Manutenibilidade, testabilidade e escalabilidade
- Separação clara entre UI, lógica de estado e domínio

## Checklist de Ações

- [ ] Traduzir todo o código, labels, mensagens e comentários para inglês
- [ ] Extrair subcomponentes para cada seção do dashboard (SRP)
- [ ] Criar hooks customizados para lógica de estado/histórico
- [ ] Implementar componente genérico para gráficos, evitando duplicidade (DRY)
- [ ] Isolar manipulação de histórico e cálculo de métricas em hooks/serviços (Clean Architecture)
- [ ] Implementar sistema de internacionalização (i18n) para todos os textos de UI
- [ ] Adicionar tratamento para dados inconsistentes ou ausentes (edge cases)
- [ ] Garantir cobertura de testes para novos hooks e componentes extraídos
- [ ] Atualizar documentação técnica e ADRs se necessário

## Critérios de Aceite

- Todo o código e textos em inglês
- Estrutura modular, com subcomponentes e hooks bem definidos
- Suporte a múltiplos idiomas via sistema de i18n
- Lógica de domínio desacoplada da UI
- Tratamento robusto de edge cases
- Cobertura de testes adequada
- Documentação e ADRs atualizados, se aplicável

---

## Progresso e Handoff

Utilize o arquivo `handoff.md` nesta pasta para documentar decisões, progresso, dificuldades e próximos passos durante a execução da refatoração.