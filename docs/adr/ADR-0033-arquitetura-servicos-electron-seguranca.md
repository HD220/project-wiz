# ADR-0033: Arquitetura dos serviços no Electron e camada de segurança centralizada

## Status

- 🟡 **Proposto** (status inicial)

> **Importante:**  
> - Toda nova ADR deve começar com status **Proposto**.  
> - Após revisão, atualizar para **Aceito**, **Rejeitado** ou **Superseded**.  
> - Se substituída, referencie explicitamente a nova ADR.  
> - Nunca excluir ou sobrescrever ADRs antigas.  
> - Consulte a [ADR-0017-Governança do Processo de ADRs](../../adr/ADR-0017-Governanca-Processo-ADRs.md) para detalhes completos.

---

## Contexto

A arquitetura dos serviços no Electron (HistoryService, WorkerService, GitHubTokenService, SessionService) precisa ser documentada e uma camada de segurança centralizada precisa ser implementada para garantir a segurança dos serviços.

---

## Decisão

Documentar a arquitetura dos serviços no Electron e implementar uma camada de segurança centralizada.

---

## Consequências

- Melhor compreensão da arquitetura dos serviços no Electron.
- Maior segurança dos serviços.
- Facilidade na manutenção e evolução dos serviços.

---

## Alternativas Consideradas

- Não documentar a arquitetura dos serviços no Electron — motivo da rejeição: dificulta a compreensão e manutenção dos serviços.
- Não implementar uma camada de segurança centralizada — motivo da rejeição: aumenta o risco de vulnerabilidades nos serviços.

---

## Links Relacionados

- [Link para issue ou documento relacionado](https://github.com/HD220/project-wiz/issues/333)