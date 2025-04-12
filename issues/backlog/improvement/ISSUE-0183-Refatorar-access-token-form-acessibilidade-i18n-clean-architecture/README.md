# ISSUE-0183

**Título:** Refatorar access-token-form: acessibilidade, i18n, clean architecture

**Contexto:**  
O componente `access-token-form.tsx` precisa ser refatorado para aderir a Clean Code, Clean Architecture, ADRs do projeto e padrões de acessibilidade/internacionalização.

**Escopo:**  
- Refatoração de acessibilidade (SVGs, ARIA, foco, navegação por teclado)
- Internacionalização de todos os textos (i18n)
- Extração de lógicas complexas para hooks dedicados
- Padronização de props e nomes conforme ADRs e SDRs
- Isolamento de subcomponentes internos, se aplicável
- Garantia de cobertura de testes (unitários e acessibilidade)
- Documentação de todas as decisões e progresso no handoff.md

**Critérios de aceitação:**  
- O componente deve seguir Clean Code, Clean Architecture, ADRs e SDRs do projeto.
- Todos os textos devem ser internacionalizados.
- Acessibilidade deve ser validada por testes automatizados.
- handoff.md deve registrar todas as decisões e progresso.