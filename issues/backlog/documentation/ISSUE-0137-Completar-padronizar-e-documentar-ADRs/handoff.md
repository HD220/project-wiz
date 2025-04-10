# Handoff - ISSUE-0137 - Completar, padronizar e documentar ADRs

## Passos Técnicos

1. **Auditar ADRs existentes**
   - Verificar status atual (aceita, rejeitada, superseded).
   - Corrigir status inconsistentes.
   - Remover detalhes excessivos em ADRs rejeitadas para evitar confusão.
2. **Completar cobertura**
   - Criar ADRs para segurança, testes, build/deploy, i18n e integrações.
   - Utilizar o template padrão.
3. **Padronizar nomenclatura e status**
   - Seguir convenção `ADR-XXXX-Titulo.md`.
   - Status explícito no início do documento.
4. **Documentar governança ADR**
   - Criar um ADR ou documento separado descrevendo:
     - Processo de criação, revisão, aprovação, rejeição e substituição.
     - Critérios para aceitação ou rejeição.
     - Como lidar com superseded.
     - Fluxo de revisões e versionamento.
5. **Adicionar links cruzados**
   - Entre ADRs relacionadas.
   - Para issues do backlog que motivaram ou dependem da decisão.
   - Para documentação técnica relevante.
6. **Revisar e validar**
   - Conferir se todas as ADRs cobrem os temas críticos.
   - Validar clareza, status e links.
   - Garantir que a governança está compreensível e aplicável.

---

## Estratégias para Documentar Governança ADR

- Basear-se em boas práticas como [Michael Nygard - Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions).
- Definir papéis e responsabilidades (quem propõe, quem revisa, quem aprova).
- Estabelecer critérios claros para aceitação e rejeição.
- Formalizar o fluxo para substituição (superseded) e rejeição.
- Manter histórico e rastreabilidade das mudanças nas ADRs.

---

## Dependências e Pré-requisitos

- Correção dos IDs duplicados (Issue [ISSUE-0133](../../bug/ISSUE-0133-Corrigir-IDs-duplicados-ADRs/README.md)).
- Correção de violações às ADRs existentes (Issue [ISSUE-0134](../../bug/ISSUE-0134-Corrigir-violacoes-ADRs-existentes/README.md)).
- Template ADR atualizado e padronizado.

---

## Recomendações para Validação Pós-Ajuste

- Revisão cruzada por pelo menos dois membros da equipe.
- Validação da cobertura temática.
- Conferência da clareza dos status e links cruzados.
- Aprovação formal da governança ADR documentada.

---

## Referências de Boas Práticas

- [Documenting Architecture Decisions - Michael Nygard](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [adr.github.io](https://adr.github.io/)
- [ThoughtWorks - Lightweight Architecture Decision Records](https://www.thoughtworks.com/en-us/radar/techniques/lightweight-architecture-decision-records)