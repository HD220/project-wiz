# ADR-0017: Governança do Processo de ADRs

**Status:** Aceito

## Contexto

O projeto enfrentou problemas anteriores relacionados à duplicidade de IDs e inconsistências no gerenciamento das ADRs (Architecture Decision Records). Isso dificultou a rastreabilidade, a governança e a auditoria das decisões arquiteturais ao longo do tempo.

## Decisão

- **IDs das ADRs devem ser únicos, sequenciais e nunca reutilizados.**
- Toda nova ADR deve iniciar com o status **Proposto**.
- Após revisão e consenso, o status deve ser atualizado para **Aceito** ou **Rejeitado**.
- ADRs que forem substituídas por novas decisões devem ser marcadas como **Superseded** e referenciar explicitamente a ADR que a substitui.
- ADRs rejeitadas devem permanecer no repositório para fins históricos e de auditoria.
- Nunca sobrescrever ou excluir ADRs antigas, independentemente do status.
- Sempre atualizar referências cruzadas ao substituir ou rejeitar ADRs, garantindo rastreabilidade completa.

## Consequências

- Garante melhor rastreabilidade das decisões arquiteturais.
- Evita confusões futuras relacionadas a IDs duplicados ou decisões conflitantes.
- Facilita a governança, auditoria e evolução da arquitetura do projeto.

## Recomendações

- Automatizar a geração do próximo ID sequencial para novas ADRs.
- Manter um índice atualizado de todas as ADRs, seus status e relações.
- Realizar revisões periódicas das ADRs para garantir sua relevância e atualização.
- Documentar claramente este fluxo no template oficial e no README da pasta `docs/adr/` para orientar todos os colaboradores.