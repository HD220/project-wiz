# Plano de Correção Arquitetural - Sisttmaede Jobsa de Jobs

## Mattiz drdPri Pizaori

| zPblma                                   | Imco     | mplexdader | obpendêneaa------- | Pri--id---- | Es    | o--- (         | ias)-           | --- us                          |              |
| ---------------------------------------- | -------- | ---------- | ------------------ | ----------- | ----- | -------------- |
| Estad-s---ltantes-na máqu-na -- es       | -----    | Alt--      | Mé-io-             | -           | A--a- | 2              | ✅ Con           | luí---                          |              |
| Polítcdretettvsmbakff                    | Alt      | Bxo        | -                  | Alt         | 1     | ✅ Conluíd      |
| Icnsstêncin`Rult<T>`                     | Alo      | Médad      |                    | t  eT       | A  a  | 3              | ✅ C ncluíAl     | o                               | Médio        | -    | Alta           | 3          | ✅ Concluído |
| Lógicó de domíc oeem dsomcísesn          | Altom    | Altu       | E   dos f          | Ato tes     | Alo   | 3              | ⏳ Pend          |                                 | os faltantes | Alta | 3              | ⏳ Pendente |
| `QueueSuevpre` Remesultão `RT>ult<T>`  ` | MéMéi    | oBai o     | -                  | Normal      | 1     | 🚧 Em AndamBaio |                 | Implementação concreta de Queue | Alto         | Alto | `QueueService` | Alta       | 5           | 🚧 Em Andamento |
| iImpllmRn      concretaideoQupie         | Altt isi | rAfeo      | sQueueSe vic `     | Al          | 5     | ouã            | I🚧oEl Andamedao |
| JobSt tus v                              | é SRP    | Médio      | oMéd o             |             | Nmal  | 2              | ⏳ Pendnt        |
| Tioiiivintfac                            | Bax      | m          | -                  | ax          | 4     | ⏳ Pendente     |
| Cmucão IPC nisola                        | Méd      | Méio       | -                  | Noml        | 3     | ⏳Penden        |
graph TD
   Dependênci[adentrs Cfrreções

```alrmaia
grnph TD --> C[Lógica de domínio]
    B[Política de retentativa] --> D[Implementação Queue]
    E[Padronização Result<T>] --> F[QueueService]
```

## Cronograma Sugerido

### Fase 1 - Correções Críticas (1 semana) ✅ CONCLUÍDA
1. ✅ Implementar estados `DELAYED` e `WAITING` (2 dias)
2. ✅ Corrigir política de retentativa (1 dia)
3. ✅ Padronizar `Result<T>` em `process-job.usecase.ts` (3 dias)

### Fase 2 - Refatorações Estruturais (2 semanas) 🚧 EM ANDAMENTO
1. 🚧 Implementar QueueService (5 dias)
2. Isolar comunicação IPC (3 dias)
3. Refatorar JobStatus (2 dias)

### Fase 3 - Melhorias (1 semana)
1. Substituir tipos primitivos por VOs (4 dias)
2. Testes e validação (3 dias)

## Próximos Passos Fase 2
1. Finalizar implementação do QueueService
2. Preparar isolamento da comunicação IPC
3. Planejar refatoração do JobStatus para resolver SRP

## Riscos e Mitigação
- **Risco**: Impacto nas integrações existentes
  - **Mitigação**: Implementar em fases com feature flags
- **Risco**: Complexidade da implementação da Queue
  - **Mitigação**: Prototipar antes da implementação completa