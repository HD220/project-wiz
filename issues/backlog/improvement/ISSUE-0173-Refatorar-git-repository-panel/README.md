# ISSUE-0173: Refatorar `git-repository-panel.tsx` para Clean Architecture, shadcn-ui e Acessibilidade

## Contexto

O componente `src/client/components/git-repository-panel.tsx` apresenta problemas críticos de arquitetura, design e aderência a padrões do projeto, conforme relatório de análise. A refatoração é estratégica para garantir manutenibilidade, escalabilidade e alinhamento com Clean Code, Clean Architecture e ADRs aceitas (ex: uso de shadcn-ui).

## Problemas Identificados

- Função principal excessivamente longa (143 linhas)
- Violação dos princípios SRP e DRY
- Acoplamento excessivo à lógica de domínio
- Não utilização de componentes shadcn-ui (ADR-0002)
- Uso de estilos inline
- Falhas de acessibilidade (labels, ARIA, foco, etc.)

## Objetivo

Refatorar o componente para:

- Seguir Clean Architecture e Clean Code
- Utilizar componentes shadcn-ui
- Melhorar acessibilidade
- Isolar lógica de domínio e infraestrutura
- Facilitar manutenção e evolução futura

## Checklist de Ações

- [ ] Extrair subcomponentes para Status, Commit, Branches e History
- [ ] Segregar blocos em componentes funcionais próprios e hooks customizados
- [ ] Criar componentes reutilizáveis para botões e inputs
- [ ] Isolar lógica de domínio e infraestrutura em serviços/use cases
- [ ] Manter hooks apenas para orquestração e estado da UI
- [ ] Substituir elementos HTML puros por componentes shadcn-ui (ver ADR-0002)
- [ ] Migrar estilos inline para classes CSS ou styled components
- [ ] Revisar e aplicar boas práticas de acessibilidade (labels, ARIA, foco, etc.)
- [ ] Garantir cobertura de testes para novos componentes e hooks
- [ ] Atualizar documentação técnica se necessário

## Critérios de Aceite

- O componente principal deve ter menos de 50 linhas e delegar responsabilidades
- Não deve haver lógica de domínio acoplada diretamente ao componente
- Todos os elementos interativos devem usar shadcn-ui
- Acessibilidade validada (uso de labels, ARIA, navegação por teclado)
- Código limpo, testável e alinhado aos padrões do projeto

## Referências

- [ADR-0002: Componentes shadcn-ui](../../../docs/adr/ADR-0002-Componentes-shadcn-ui.md)
- [ADR-0012: Clean Architecture LLM](../../../docs/adr/ADR-0012-Clean-Architecture-LLM.md)
- [SDR-0001: Código em Inglês](../../../docs/sdr/SDR-0001-Codigo-Fonte-Em-Ingles.md)

---

## Progresso e Handoff

Acompanhe o progresso e decisões em `handoff.md` nesta pasta.