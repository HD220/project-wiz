# ISSUE-0198: Revisar e mover issues do backlog já realizadas

## Descrição do problema

Foram identificadas issues no backlog de melhoria que já foram implementadas e entregues, mas permanecem no backlog, gerando duplicidade e dificultando o acompanhamento do progresso real do projeto.

### Exemplos concretos

- `ISSUE-0183-Refatorar-access-token-form-acessibilidade-i18n-clean-architecture` (já entregue, ver handoff.md)
- `ISSUE-0118-Refatorar-repository-settings-em-subcomponentes-e-hooks` (RepositorySettings já refatorado em completed/ISSUE-0091 e ISSUE-0065)
- `ISSUE-0131-Testes-automatizados-componentes-refatorados` (componentes já refatorados e testados em outras issues)
- Outras issues relacionadas a ActivityLog, ModelActions, etc., já entregues em completed.

## Recomendação de correção/refatoração

Revisar todas as issues do backlog de melhoria e mover para completed ou fechar aquelas que já foram implementadas, consolidando o histórico no handoff.md e evitando duplicidade.

## Justificativa

- **Governança e rastreabilidade:** Manter o backlog limpo e atualizado facilita o acompanhamento do progresso e evita retrabalho.
- **Aderência às regras do projeto:** Seguir o fluxo de issues definido nas regras do projeto (ver seção 9 das regras gerais).
- **Redução de technical debt organizacional:** Eliminar issues duplicadas ou obsoletas melhora a eficiência do time.

---