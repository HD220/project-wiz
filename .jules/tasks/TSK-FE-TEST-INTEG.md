# Tarefa: FE-TEST-INTEG - Escrever testes de integração para fluxos de usuário chave.

**ID da Tarefa:** `FE-TEST-INTEG`
**Título Breve:** Escrever testes de integração para fluxos de usuário chave.
**Descrição Completa:**
Escrever testes de integração para os fluxos de usuário mais importantes da nova aplicação frontend. Estes testes verificarão a interação entre múltiplos componentes, serviços de UI e, possivelmente, mocks de chamadas IPC para simular o comportamento do backend.

---

**Status:** `Pendente`
**Dependências (IDs):** `Todas FE-PAGE-*, FE-FEAT-*` (os fluxos de usuário devem estar implementados)
**Complexidade (1-5):** `4`
**Prioridade (P0-P4):** `P1` (Garantir que os fluxos principais funcionem)
**Responsável:** `Frontend`
**Branch Git Proposta:** `test/fe-integration`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Testes de integração escritos para fluxos críticos, como:
    - Fluxo de onboarding completo.
    - Criação e visualização de um projeto.
    - Envio e recebimento de mensagens em um chat.
- Utilização de bibliotecas de teste como Vitest (ou Jest) e React Testing Library, possivelmente com MSW (Mock Service Worker) para mockar chamadas IPC/API.
- Testes cobrem a interação entre vários componentes e a lógica de navegação.
- Testes são executados como parte do pipeline de CI.

---

## Notas/Decisões de Design
- **Requer subdivisão:** Dada a complexidade 4, esta tarefa deve ser subdividida após a migração de formato, focando em um fluxo de usuário chave por sub-tarefa.
- Estes testes são mais abrangentes que os unitários, mas não tão completos (nem tão lentos) quanto os E2E.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
