# Refatorar `access-token-form.tsx` para Melhorias de UX, Robustez e Clean Architecture

## Contexto

O componente `src/client/components/access-token-form.tsx` apresenta oportunidades de melhoria identificadas em análise recente. O objetivo é alinhar o componente aos padrões de Clean Code, Clean Architecture e ADRs do projeto, aprimorando a experiência do usuário, a separação de responsabilidades e a robustez do formulário.

## Problemas Identificados

1. **Botão "Show" sem funcionalidade (UX e SRP)**
   - O botão "Show" está presente, mas não alterna a visibilidade do token.
   - *Recomendação:* Implementar alternância de visibilidade do token ou remover o botão.

2. **Lógica de permissões acoplada ao formulário (SRP)**
   - O componente `<PermissionsList />` está diretamente acoplado ao formulário.
   - *Recomendação:* Extrair a lógica de permissões para um componente ou hook dedicado caso a complexidade aumente.

3. **Falta de tratamento de erros/validação de input (Robustez)**
   - Não há validação de input nem feedback visual para erros ou sucesso.
   - *Recomendação:* Adicionar validação de input e feedback visual apropriado.

4. **Lógica de manipulação de token no componente de apresentação (Clean Architecture)**
   - A manipulação do token está diretamente no componente de apresentação.
   - *Recomendação:* Se a lógica crescer, mover para um hook dedicado para isolar regras de negócio.

## Critérios de Aceitação

- O botão "Show" deve alternar a visibilidade do token ou ser removido.
- O formulário deve validar o input do token e exibir feedback visual para erros e sucesso.
- A lógica de permissões deve ser extraída se houver aumento de complexidade.
- A manipulação do token deve ser isolada em um hook se a lógica se expandir.
- O componente deve seguir os padrões de Clean Code e Clean Architecture definidos nas ADRs do projeto.

## Checklist de Ações

- [ ] Implementar alternância de visibilidade do token ou remover o botão "Show".
- [ ] Adicionar validação de input e feedback visual para erros e sucesso.
- [ ] Avaliar e, se necessário, extrair a lógica de permissões para componente/hook dedicado.
- [ ] Avaliar e, se necessário, mover a lógica de manipulação do token para um hook dedicado.
- [ ] Garantir aderência aos padrões de Clean Code e Clean Architecture.
- [ ] Atualizar testes e documentação do componente, se aplicável.

## Referências

- ADR-0012: Clean Architecture para módulos LLM
- ADR-0002: shadcn-ui como biblioteca de componentes
- docs/architecture.md
- docs/ui-components.md

---