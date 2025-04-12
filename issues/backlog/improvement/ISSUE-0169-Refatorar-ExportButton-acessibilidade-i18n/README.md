# Refatorar ExportButton: acessibilidade e internacionalização

## Contexto

O componente `src/client/components/export-button.tsx` foi analisado e apresenta oportunidades de melhoria para alinhar-se aos padrões de qualidade, acessibilidade e internacionalização definidos pelo projeto (ver ADR-0012, ADR-0002, SDR-0001).

## Problemas Identificados

1. **Texto hardcoded (i18n)**
   - O texto do botão está fixo no código (linha 22).
   - Recomenda-se extrair o texto para o sistema de internacionalização, conforme guia de i18n do projeto.

2. **Acessibilidade do SVG**
   - O ícone SVG (linhas 6-21) não possui atributos de acessibilidade.
   - Recomenda-se adicionar `role="img"` e `aria-label="Export icon"` para garantir melhor suporte a leitores de tela.

## Objetivo

Refatorar o componente para:
- Remover textos hardcoded, utilizando o sistema de i18n.
- Garantir que o SVG seja acessível, seguindo boas práticas de acessibilidade.

## Checklist de Ações

- [ ] Extrair todo texto visível do componente para o sistema de internacionalização (i18n).
- [ ] Atualizar o componente para consumir as traduções via hook/função de i18n.
- [ ] Adicionar os atributos `role="img"` e `aria-label="Export icon"` ao SVG.
- [ ] Validar a acessibilidade do componente com leitores de tela.
- [ ] Garantir que o código resultante siga os padrões de Clean Code e Clean Architecture.
- [ ] Atualizar testes (se existirem) para refletir as mudanças.
- [ ] Documentar decisões e progresso em `handoff.md`.

## Critérios de Aceite

- Nenhum texto hardcoded visível no componente.
- SVG acessível conforme recomendações.
- Código revisado e aprovado segundo padrões do projeto.
- Progresso e decisões documentados em `handoff.md`.

## Referências

- [ADR-0012: Clean Architecture para módulos LLM](../../../docs/adr/ADR-0012-Clean-Architecture-LLM.md)
- [ADR-0002: shadcn-ui como biblioteca de UI](../../../docs/adr/ADR-0002-Componentes-shadcn-ui.md)
- [SDR-0001: Código-fonte em inglês](../../../docs/sdr/SDR-0001-Codigo-Fonte-Em-Ingles.md)
- [Guia de internacionalização](../../../docs/i18n-guide.md)
- [Guia de acessibilidade](../../../docs/ui-components.md)

---