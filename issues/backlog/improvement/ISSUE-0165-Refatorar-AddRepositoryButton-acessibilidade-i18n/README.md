# ISSUE-0165: Refatorar AddRepositoryButton para acessibilidade e i18n

## Contexto

O componente `src/client/components/add-repository-button.tsx` foi analisado e apresenta dois pontos de melhoria estratégicos:

1. **Acessibilidade do SVG**  
   O ícone SVG utilizado no botão não possui atributos de acessibilidade. Isso pode prejudicar usuários de leitores de tela.  
   - Se o SVG for meramente decorativo, deve receber `aria-hidden="true"`.
   - Se for informativo, deve receber `role="img"` e um `aria-label` descritivo (ex: `"Add"`).

2. **Internacionalização do texto**  
   O texto do botão está hardcoded como `"Add Repository"`, sem uso do sistema de internacionalização do projeto.  
   - O texto deve ser extraído e renderizado via sistema i18n, por exemplo: `{t('addRepository')}`.

Essas melhorias alinham o componente com as boas práticas de acessibilidade e internacionalização já adotadas no projeto.

## Checklist de Ações

- [ ] Adicionar atributos de acessibilidade ao SVG do botão:
  - [ ] Usar `aria-hidden="true"` se decorativo, ou
  - [ ] Usar `role="img"` e `aria-label` se informativo
- [ ] Substituir o texto hardcoded por chamada ao sistema de internacionalização (`t('addRepository')`)
- [ ] Garantir que o código continue seguindo os padrões de nomenclatura e estrutura do projeto
- [ ] Testar o componente com leitor de tela e em diferentes idiomas
- [ ] Atualizar testes automatizados, se existirem

## Critérios de Aceite

- O SVG do botão está corretamente acessível conforme sua função (decorativo ou informativo)
- O texto do botão é internacionalizável e utiliza o sistema i18n do projeto
- Não há regressões funcionais ou visuais no componente
- O código segue os padrões de clean code e nomenclatura definidos pelo projeto

## Referências

- [Guia de Internacionalização](../../../docs/i18n-guide.md)
- [ADR-0002: Componentes shadcn-ui](../../../docs/adr/ADR-0002-Componentes-shadcn-ui.md)
- [SDR-0001: Código-fonte em inglês](../../../docs/sdr/SDR-0001-Codigo-Fonte-Em-Ingles.md)
- [SDR-0002: Não utilizar JSDocs](../../../docs/sdr/SDR-0002-Nao-utilizar-JSDocs.md)

---

## Progresso / Handoff

Utilize o arquivo `handoff.md` nesta pasta para documentar decisões, progresso, dúvidas e próximos passos durante a execução desta melhoria.