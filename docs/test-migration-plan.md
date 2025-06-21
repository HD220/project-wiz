# Plano de Migração de Testes

## 1. Inventário Atual
- Total de arquivos de teste: 12
- Distribuição:
  - Unitários: 3 (25%)
  - Integração: 3 (25%) 
  - E2E: 1 (8%)
  - Especializados: 2 (17%)
  - Suporte: 3 (25%)

## 2. Mapeamento para Nova Estrutura
| Local Atual                         | Tipo Teste | Novo Local                         |
| ----------------------------------- | ---------- | ---------------------------------- |
| src/*.spec.ts                       | Unitário   | tests/unit/[same-structure]        |
| src/infrastructure/*.spec.ts        | Integração | tests/integration/[same-structure] |
| src/infrastructure/*.stress.spec.ts | Stress     | tests/stress/                      |
| tests/unit/*                        | Unitário   | tests/unit/ (manter)               |
| tests/e2e/*                         | E2E        | tests/e2e/ (manter)                |

## 3. Ordem Prioritária de Migração
1. Fase 1: Testes de repositórios Drizzle
   - `src/infrastructure/repositories/drizzle/queue.repository.spec.ts` → `tests/integration/repositories/drizzle/queue.repository.test.ts`
   
2. Fase 2: Testes de serviços ✅
   - `src/infrastructure/services/logger/json-logger.service.spec.ts` → `tests/integration/services/logger/json-logger.service.test.ts` (Concluído em 15/06/2025)

3. Fase 3: Testes de entidades ✅
   - `src/core/domain/entities/jobs/job.entity.spec.ts` → `tests/unit/core/domain/entities/jobs/job.entity.test.ts` (Concluído em 15/06/2025)

4. Fase 4: Testes E2E/stress ✅
   - `src/infrastructure/queue/queue.stress.spec.ts` → `tests/stress/queue.stress.test.ts` (Concluído em 15/06/2025)
   - `tests/e2e/example.test.ts` → `tests/e2e/example.test.ts` (manter)

## 4. Critérios de Aceitação
- [x] Todos os testes migrados executam com sucesso (JsonLogger)
- [x] Cobertura de testes mantida ou melhorada
- [x] Nova estrutura seguindo padrões definidos
- [x] Documentação atualizada
- [x] Configurações de teste centralizadas em `tests/setup/`