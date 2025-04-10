# Arquitetura - Registros de Decisões (ADRs)

Este diretório contém os **Architecture Decision Records (ADRs)** do projeto, que documentam decisões arquiteturais importantes, seu contexto, alternativas e consequências.

---

## Governança do Processo de ADRs

Conforme definido na [ADR-0017-Governança do Processo de ADRs](./ADR-0017-Governanca-Processo-ADRs.md):

- **IDs** devem ser únicos, sequenciais e nunca reutilizados.
- Toda nova ADR inicia com status **Proposto**.
- Após revisão, o status muda para **Aceito** ou **Rejeitado**.
- ADRs substituídas devem ser marcadas como **Superseded** e referenciar a nova ADR.
- ADRs rejeitadas permanecem no repositório para histórico.
- Nunca sobrescrever ou excluir ADRs antigas.
- Atualizar referências cruzadas ao substituir ou rejeitar ADRs.

---

## Fluxo para criação e gestão de ADRs

1. **Criar nova ADR** com status **Proposto** e próximo ID sequencial.
2. **Revisar** a ADR com os envolvidos.
3. **Atualizar status** para **Aceito**, **Rejeitado** ou **Superseded**.
4. **Referenciar** ADRs relacionadas, especialmente se substituir ou rejeitar alguma.
5. **Nunca apagar** ADRs antigas, mesmo rejeitadas.
6. **Atualizar este índice** após qualquer mudança.

---

## Lista de ADRs

| ID       | Título                                                        | Status    |
|----------|---------------------------------------------------------------|-----------|
| ADR-0001 | [Implementação de ADRs](./ADR-0001-Implementacao-de-ADRs.md)  | Aceito    |
| ADR-0002 | [Componentes shadcn-ui](./ADR-0002-Componentes-shadcn-ui.md)  | Aceito    |
| ADR-0003 | [Não utilizar JSDocs](./ADR-0003-Nao-utilizar-JSDocs.md)      | Aceito    |
| ADR-0004 | [Estrutura de Documentação](./ADR-0004-Estrutura-de-Documentacao.md) | Aceito    |
| ADR-0005 | [Estrutura de Pastas Electron](./ADR-0005-Estrutura-de-Pastas-Electron.md) | Aceito    |
| ADR-0006 | [Não implementar sistema de plugins](./ADR-0006-Nao-implementar-sistema-de-plugins.md) | Aceito    |
| ADR-0007 | [DSL para fluxos de trabalho](./ADR-0007-DSL-para-fluxos-de-trabalho.md) | Aceito    |
| ADR-0008 | [Nomenclatura Serviços LLM](./ADR-0008-Nomenclatura-Servicos-LLM.md) | Aceito    |
| ADR-0009 | [Implementação TanStack Router + Drizzle](./ADR-0009-Implementacao-TanStack-Router-Drizzle.md) | Aceito    |
| ADR-0010 | [Refatoração WorkerService Mistral GGUF](./ADR-0010-Refatoracao-WorkerService-Mistral-GGUF.md) | Aceito    |
| ADR-0011 | [Atualizar target ECMAScript](./ADR-0011-Atualizar-target-ECMAScript.md) | Aceito    |
| ADR-0012 | [Clean Architecture LLM](./ADR-0012-Clean-Architecture-LLM.md) | Aceito    |
| ADR-0013 | [Refatorar dashboard para dados dinâmicos](./ADR-0013-Refatorar-dashboard-para-dados-dinamicos.md) | Aceito    |
| ADR-0014 | [Histórico Conversas SQLite + Drizzle](./ADR-0014-Historico-Conversas-SQLite-Drizzle.md) | Aceito    |
| ADR-0015 | [Padrão Nomenclatura Kebab Case](./ADR-0015-Padrao-Nomenclatura-Kebab-Case.md) | Aceito    |
| ADR-0016 | [Gerenciamento Streams Requisições LlmService](./ADR-0016-Gerenciamento-Streams-Requisicoes-LlmService.md) | Aceito    |
| ADR-0017 | [Governança do Processo de ADRs](./ADR-0017-Governanca-Processo-ADRs.md) | Aceito    |

---

## Template oficial

Utilize o template disponível em:

`docs/templates/adr/template.md`

---

## Recomendações

- Automatize a geração do próximo ID sequencial.
- Mantenha este índice sempre atualizado.
- Revise periodicamente as ADRs para garantir sua relevância.
- Consulte a ADR-0017 para detalhes completos da governança.