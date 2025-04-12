# ISSUE-0177: Refatorar componente model-configuration.tsx

## Contexto

O componente `src/client/components/model-configuration.tsx` apresenta diversos problemas de arquitetura e qualidade de código, conforme análise recente:

- Função principal excede 50 linhas, dificultando manutenção e entendimento.
- Violações do princípio da responsabilidade única (SRP) e do DRY, com repetição de lógica e UI.
- Lógica de estado acoplada à camada de apresentação.
- Ausência de validação e tratamento de erros para entradas do usuário.
- Textos hardcoded em inglês, sem suporte a internacionalização (i18n).

Essas questões contrariam princípios de Clean Code, Clean Architecture e ADRs do projeto, impactando negativamente a manutenibilidade, testabilidade e escalabilidade do código.

## Objetivo

Refatorar o componente para garantir modularidade, clareza, testabilidade e aderência às melhores práticas e decisões arquiteturais do projeto.

## Checklist de Ações

- [ ] Extrair subcomponentes para cada bloco de configuração, reduzindo o tamanho da função principal.
- [ ] Criar um componente genérico de slider para reutilização e eliminação de código duplicado.
- [ ] Segregar cada configuração em componentes filhos especializados, promovendo SRP.
- [ ] Extrair a lógica de estado para hooks customizados, integrando com a camada de domínio/serviço quando aplicável.
- [ ] Implementar validação e feedback visual para entradas do usuário.
- [ ] Migrar todos os textos hardcoded para o sistema de i18n, conforme guia e ADRs do projeto.
- [ ] Garantir cobertura de testes para os novos componentes e hooks.
- [ ] Atualizar documentação técnica e exemplos de uso, se necessário.

## Critérios de Aceite

- O componente principal não deve exceder 50 linhas.
- Não deve haver duplicação de lógica de UI ou estado.
- Todos os textos devem estar internacionalizados.
- Deve haver validação adequada para entradas do usuário.
- O código deve estar alinhado com Clean Architecture e ADRs relevantes.

## Referências

- [ADR-0012 - Clean Architecture LLM](../../../docs/adr/ADR-0012-Clean-Architecture-LLM.md)
- [ADR-0015 - Padrão de Nomenclatura Kebab-Case](../../../docs/adr/ADR-0015-Padrao-Nomenclatura-Kebab-Case.md)
- [Guia de i18n](../../../docs/i18n-guide.md)
- [Clean Code Principles](../../../.roo/rules/rules.md)

## Riscos e Observações

- Refatoração pode impactar outros componentes que dependem de model-configuration.
- Testes automatizados devem ser revisados/adaptados.
- Validar integração com sistema de i18n já existente.

## Handoff e Progresso

Acompanhe o progresso e decisões no arquivo `handoff.md` desta issue.