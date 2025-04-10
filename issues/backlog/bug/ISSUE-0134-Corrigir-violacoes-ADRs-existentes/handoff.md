# Handoff Técnico - ISSUE-0134

## Passos técnicos para corrigir cada violação

### 1. Modificações indevidas no shadcn-ui
- Identificar todos os componentes shadcn-ui modificados.
- Restaurar para o padrão original do shadcn-ui.
- Mover customizações para arquivos de tema ou componentes wrapper externos.
- Validar visualmente e via snapshot tests.

### 2. Dashboard fixo
- Remover dados estáticos/hardcoded.
- Integrar com fontes de dados dinâmicas (APIs, stores, etc.).
- Garantir atualização em tempo real ou via polling/eventos.
- Testar com dados reais e mocks.

### 3. ECMAScript target
- Revisar `tsconfig.json`, configurações do Vite e outros arquivos de build.
- Uniformizar para o target definido na ADR-0008 (ex: ES2022).
- Validar builds para todas as plataformas suportadas.

### 4. Nomenclatura Lingui
- Auditar arquivos `.po`, `.json` e chaves de tradução.
- Renomear arquivos e chaves para kebab-case.
- Atualizar referências no código.
- Validar carregamento das traduções.

---

## Dependências e pré-requisitos

- Acesso às ADRs afetadas.
- Ambiente de desenvolvimento configurado.
- Scripts de build e lint atualizados.
- Testes automatizados para validação.

---

## Recomendações para validação pós-correção

- Executar todos os testes automatizados.
- Realizar revisão de código focada em aderência às ADRs.
- Validar visualmente o dashboard e componentes UI.
- Testar internacionalização em todos os idiomas suportados.
- Garantir builds consistentes e sem warnings.

---

## Referências às ADRs afetadas

- `docs/adr/ADR-0002-Componentes-shadcn-ui.md`
- `docs/adr/ADR-0008-Atualizar-target-ECMAScript.md`
- `docs/adr/ADR-0009-Refatorar-dashboard-para-dados-dinamicos.md`
- `docs/adr/ADR-0011-Padrao-Nomenclatura-Kebab-Case.md`

---

**Prioridade:** Alta  
**Responsável:** Equipe de desenvolvimento  
**Prazo recomendado:** Curto prazo para evitar inconsistências