# ISSUE-0170: Refatorar FileListItem – Remover key desnecessário e aprimorar acessibilidade

## Contexto

O componente `src/client/components/file-list-item.tsx` foi analisado e está bem estruturado, seguindo os padrões do projeto. No entanto, foram identificadas duas oportunidades de melhoria relacionadas à limpeza do código e à acessibilidade do botão principal do componente.

## Problemas Identificados

1. **Uso desnecessário de `key` no Button**
   - O atributo `key` está sendo utilizado diretamente no componente Button (linha 13), o que não é necessário fora de listas mapeadas no React.
   - **Impacto:** Código redundante, potencial confusão para manutenção futura.

2. **Acessibilidade não explícita no Button**
   - O componente Button (linhas 12–37) não deixa claro se já provê acessibilidade adequada.
   - **Impacto:** Pode comprometer a experiência de usuários que dependem de tecnologias assistivas, caso atributos ARIA relevantes não estejam presentes.

## Recomendação

- Remover o atributo `key` do Button, caso não esteja em um contexto de lista mapeada.
- Verificar se o componente Button já implementa acessibilidade adequada. Se não, adicionar os atributos ARIA necessários para garantir navegação e uso por leitores de tela.

## Checklist de Ações

- [ ] Remover o atributo `key` do Button, se não for necessário.
- [ ] Revisar a implementação do Button para garantir acessibilidade (atributos ARIA, roles, labels).
- [ ] Adicionar ou ajustar atributos ARIA conforme necessário.
- [ ] Testar o componente com ferramentas de acessibilidade (ex: Lighthouse, axe).
- [ ] Atualizar testes automatizados, se aplicável.
- [ ] Documentar decisões e eventuais limitações encontradas no handoff.

## Critérios de Aceite

- O componente não deve conter o atributo `key` fora de contexto de lista.
- O Button deve estar acessível para leitores de tela e navegação por teclado.
- Não deve haver regressão de funcionalidade ou estilo visual.

---

## Progresso e Handoff

Utilize o arquivo `handoff.md` nesta pasta para documentar decisões, progresso, dúvidas e próximos passos.