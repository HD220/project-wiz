# Handoff Técnico - ISSUE-0133 - Corrigir IDs duplicados nas ADRs

## Passos técnicos para renumeração e atualização

1. **Mapear todas as ADRs duplicadas**
   - Identificar os arquivos com IDs repetidos (já listado na issue).
2. **Definir nova sequência incremental única**
   - Exemplo: manter as ADRs aceitas com IDs menores e rejeitadas com IDs maiores ou criar sequência cronológica.
3. **Renomear os arquivos**
   - Atualizar o prefixo numérico no nome do arquivo para garantir unicidade.
4. **Atualizar o conteúdo interno das ADRs**
   - Corrigir o ID e o título no cabeçalho/front-matter ou no corpo do documento.
5. **Padronizar status**
   - Marcar explicitamente cada ADR como `Accepted`, `Rejected` ou `Superseded`.
6. **Atualizar referências cruzadas**
   - Buscar por links internos entre ADRs e corrigir para os novos IDs.
7. **Revisar links externos**
   - Atualizar documentação, README ou outras referências que apontem para as ADRs renumeradas.
8. **Criar uma ADR de governança**
   - Definir processo para criação, revisão, rejeição e substituição de ADRs, reforçando unicidade dos IDs.

## Dependências e pré-requisitos

- Acesso completo aos arquivos das ADRs.
- Ferramentas para busca e substituição em múltiplos arquivos.
- Validação com o time para confirmar status correto de cada ADR (aceita, rejeitada, superseded).

## Recomendações para validação pós-ajuste

- Conferir se todos os IDs são únicos e sequenciais.
- Validar se todas as referências cruzadas e links foram atualizados corretamente.
- Revisar se o status das ADRs está explícito e padronizado.
- Garantir que a nova ADR de governança está clara e acessível.

## Referências a boas práticas de ADR

- [Michael Nygard - Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [adr.github.io](https://adr.github.io/)
- Recomenda-se manter ADRs rejeitadas para histórico, mas sempre com IDs únicos e status explícito.