# Adoção do TransactionWrapper nos Repositórios

## Etapas
1. [x] Extrair lógica para TransactionWrapper (#123)
2. [ ] Atualizar DrizzleQueueRepository para usar o novo wrapper
3. [ ] Implementar nos demais repositórios por ordem crítica:
   - [ ] UserDrizzleRepository (prioridade alta)
   - [ ] PersonaDrizzleRepository (prioridade média)
   - [ ] LLMProviderDrizzleRepository (prioridade baixa)

## Checklist por Repositório
- [ ] Criar instância do TransactionWrapper
- [ ] Substituir chamadas diretas por wrapper.runInTransaction
- [ ] Atualizar testes unitários
- [ ] Testes de integração com transação
- [ ] Documentar no ADR-002

## Cronograma
| Repositório              | Estimativa | Responsável | Status   |
| ------------------------ | ---------- | ----------- | -------- |
| DrizzleQueueRepository   | 2h         | @dev1       | Pendente |
| UserDrizzleRepository    | 3h         | @dev2       | Pendente |
| PersonaDrizzleRepository | 2h         | @dev3       | Pendente |

## Riscos e Mitigação
- **Risco**: Quebra de compatibilidade
  - **Mitigação**: Manter ambas implementações durante transição
- **Risco**: Impacto no desempenho
  - **Mitigação**: Monitorar métricas após cada migração