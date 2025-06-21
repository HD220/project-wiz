# Implementar Retry Mechanism

## Descrição
Implementar sistema de retentativas automáticas para jobs falhos, com backoff exponencial e limite de tentativas

## Requisitos Funcionais
- [ ] Identificar jobs falhos elegíveis para retentativa
- [ ] Calcular delay usando backoff exponencial (5min inicial)
- [ ] Limitar número máximo de tentativas (3 padrão)
- [ ] Atualizar contador de tentativas
- [ ] Reprocessar jobs ou marcar como falha permanente

## Componentes Envolvidos
- `RetryManager` (infrastructure/services/retry-manager.service.ts)
- `Job` (core/domain/entities/job.entity.ts)
- `QueueManager` (para reagendamento)

## Critérios de Aceitação
- [ ] Jobs falhos são reprocessados corretamente
- [ ] Backoff exponencial é aplicado
- [ ] Limite de tentativas é respeitado
- [ ] Jobs não elegíveis são marcados como falha permanente
- [ ] Testes unitários cobrindo fluxos principais

## Relação com Casos de Uso
- [Retry Failed Job](./../use-cases/retry-failed-job.md)