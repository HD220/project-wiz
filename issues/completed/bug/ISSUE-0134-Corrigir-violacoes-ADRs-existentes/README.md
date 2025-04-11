# ISSUE-0134 - Corrigir violações às ADRs existentes

## Diagnóstico consolidado das violações

Foram identificadas violações às decisões arquiteturais documentadas, que comprometem a padronização e a qualidade do projeto:

- **Modificações indevidas no shadcn-ui** (ADR-0002): componentes foram alterados diretamente, contrariando a diretriz de manter o padrão original para facilitar manutenção e atualizações.
- **Dashboard fixo** (ADR-0009): implementação atual utiliza dados estáticos, contrariando a decisão de exibir dados dinâmicos do sistema.
- **ECMAScript target não padronizado** (ADR-0008): divergências nas configurações do target ECMAScript, gerando builds inconsistentes.
- **Nomenclatura Lingui fora do padrão** (ADR-0011): chaves e arquivos de internacionalização não seguem o padrão kebab-case definido.

## Impactos negativos

- Inconsistência visual e técnica, dificultando manutenção e evolução.
- Risco de bugs e retrabalho devido a divergências arquiteturais.
- Dificuldade para atualizar dependências e componentes.
- Comprometimento da escalabilidade e qualidade do produto.

## Objetivos da issue

- Corrigir todas as violações identificadas, alinhando o projeto às ADRs aceitas.
- Reforçar aderência às decisões arquiteturais.
- Atualizar documentação se necessário.
- Uniformizar configurações e nomenclaturas.
- Prioridade **alta** para evitar riscos e retrabalho.

## Recomendações iniciais

- Restaurar componentes shadcn-ui para o padrão original, movendo customizações para wrappers ou temas.
- Refatorar dashboard para consumir dados dinâmicos.
- Uniformizar target ECMAScript nas configurações do projeto.
- Padronizar nomenclatura Lingui para kebab-case.
- Adicionar validações automáticas para reforçar conformidade.
- Atualizar ADRs se ajustes forem necessários.

## Links cruzados

- **ADR-0002:** Componentes shadcn-ui
- **ADR-0008:** Atualizar target ECMAScript
- **ADR-0009:** Dashboard dinâmico
- **ADR-0011:** Padrão nomenclatura kebab-case
- **Issue relacionada:** ISSUE-0133 (IDs duplicados ADRs)

**Prioridade:** Alta