# ISSUE-0166: Refatorar dashboard.tsx para manutenção e acessibilidade

## Contexto

O componente `src/client/components/dashboard.tsx` é fundamental para a visualização de métricas e status do sistema. Uma análise recente identificou problemas que afetam a manutenção, acessibilidade e aderência a princípios de Clean Code e Clean Architecture. A refatoração proposta visa melhorar a estrutura do código, facilitar futuras evoluções e garantir uma experiência de usuário mais acessível.

## Problemas Identificados

1. **Função com múltiplas responsabilidades (SRP)**
   - A função `Dashboard` concentra lógica de status, renderização de métricas e dashboard LLM em um único bloco.
   - **Impacto:** Dificulta manutenção, testes e reaproveitamento de código.
   - **Recomendação:** Extrair subcomponentes para mensagens de status, lista de métricas e dashboard LLM.

2. **Estilos inline repetidos**
   - Diversos elementos utilizam estilos inline duplicados.
   - **Impacto:** Reduz legibilidade e dificulta padronização visual.
   - **Recomendação:** Extrair estilos para classes CSS em arquivo dedicado.

3. **Uso de `index` como key em listas**
   - O método `.map()` utiliza o índice como key (ex: linha 21).
   - **Impacto:** Pode causar problemas de renderização e performance no React.
   - **Recomendação:** Utilizar identificador único, como `metric.label`.

4. **Mensagens de status sem acessibilidade ARIA**
   - Elementos de status não possuem roles ARIA adequados.
   - **Impacto:** Usuários de tecnologias assistivas não recebem feedback apropriado.
   - **Recomendação:** Adicionar roles ARIA (`role="status"` ou `role="alert"`).

## Checklist de Ações

- [ ] Extrair subcomponentes para:
  - [ ] Mensagens de status
  - [ ] Lista de métricas
  - [ ] Dashboard LLM
- [ ] Remover estilos inline e criar classes CSS em arquivo dedicado
- [ ] Substituir uso de `index` como key por identificador único nas listas
- [ ] Adicionar roles ARIA apropriados nas mensagens de status
- [ ] Garantir cobertura de testes para os novos subcomponentes
- [ ] Atualizar documentação técnica se necessário

## Critérios de Aceite

- O componente principal deve delegar responsabilidades a subcomponentes claros e reutilizáveis
- Não deve haver estilos inline duplicados
- Todas as listas devem utilizar keys únicas e estáveis
- Mensagens de status devem ser acessíveis via ARIA
- Não deve haver regressão funcional ou visual

## Referências

- [Relatório de análise dashboard.tsx](docs/refatoracao-clean-architecture/analise-src-client-components.md)
- [Clean Code Principles](docs/adr/ADR-0012-Clean-Architecture-LLM.md)
- [Acessibilidade ARIA](https://developer.mozilla.org/pt-BR/docs/Web/Accessibility/ARIA)

---

## Progresso / Handoff

> Preencha este espaço com decisões, dificuldades, dúvidas e próximos passos durante a execução da issue.