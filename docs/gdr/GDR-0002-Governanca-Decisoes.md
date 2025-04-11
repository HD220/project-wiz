# GDR-0002 - Processo de Governança das Decisões

## Contexto

- O projeto utiliza **ADRs** (Architecture Decision Records), **GDRs** (Governance Decision Records) e **SDRs** (Standards Decision Records) para registrar decisões arquiteturais, de governança e padrões técnicos.
- É necessário um processo claro para criação, aprovação, rejeição, substituição e migração dessas decisões, garantindo rastreabilidade, transparência e organização.

## Decisão

- **IDs:** Cada tipo de decisão possui uma sequência única:
  - `ADR-XXXX`
  - `GDR-XXXX`
  - `SDR-XXXX`
- **Status possíveis:** 
  - `Proposed`
  - `Accepted`
  - `Rejected`
  - `Superseded`
- **Criação:** Qualquer colaborador pode propor uma nova decisão, utilizando o template específico para o tipo (ADR, GDR ou SDR).
- **Aprovação:**
  - **ADRs:** Devem ser aprovadas pela equipe de arquitetura.
  - **GDRs:** Devem ser aprovadas pela equipe de governança ou liderança.
  - **SDRs:** Devem ser aprovadas pela equipe técnica ou liderança.
- **Rejeição:** Decisões rejeitadas devem conter uma justificativa clara e documentada.
- **Substituição:** Quando uma decisão for substituída, a antiga deve ser marcada como `Superseded` e referenciar a nova decisão que a substitui.
- **Migração:** Caso uma decisão mude de categoria (ex: de ADR para SDR), deve-se criar um novo documento na categoria correta e marcar o antigo como `Superseded`, com referência cruzada.
- **Sumário:** Todas as decisões aceitas devem estar listadas no arquivo `.roo/rules/rules.md`, mantendo uma visão consolidada.
- **Templates:** Devem ser utilizados os templates específicos localizados em `docs/templates/` para garantir padronização.
- **Revisão periódica:** Recomenda-se revisar periodicamente as decisões para garantir sua atualidade e consistência.
- **Evitar duplicidade:** Antes de criar uma nova decisão, deve-se conferir os IDs e temas existentes para evitar duplicidade.

## Consequências

- Processo de governança claro, transparente e auditável.
- Facilidade para localizar, entender e rastrear decisões do projeto.
- Melhoria na organização, consistência e atualização das decisões técnicas e de governança.