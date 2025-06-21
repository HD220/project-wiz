# Adicionar Job à Fila

## Objetivo
Permitir que o sistema adicione novos jobs à fila de processamento

## Atores
- Sistema principal
- Worker service

## Pré-condições
- Worker service deve estar rodando
- Fila de jobs deve estar disponível

## Fluxo Principal
1. Cliente envia job para a API
2. Sistema valida:
   - Estrutura do job
   - Permissões do cliente
   - Recursos disponíveis
3. Job é persistido no banco de dados
4. Job é adicionado à fila apropriada
5. Sistema notifica cliente com ID do job

## Fluxos Alternativos
- Job inválido: retorna erro de validação
- Fila indisponível: retorna erro de sistema

## Pós-condições
- Job está na fila com status "pending"
- Job é visível para workers disponíveis

## Regras de Negócio
- Jobs devem conter todos campos obrigatórios
- Prioridade padrão é "normal"
- Máximo de 3 retentativas automáticas

## Validações
- **Obrigatório**:
  - `type`: Tipo do job (deve estar na lista de tipos permitidos)
  - `priority`: Número entre 1-100
  - `payload`: Objeto válido para o tipo especificado
- **Opcional**:
  - `retryPolicy`: Configuração personalizada de retentativas
  - `timeout`: Tempo máximo de execução em ms

## Exemplo de Payload
```json
{
  "type": "data-processing",
  "priority": 75,
  "payload": {
    "datasetId": "123e4567-e89b-12d3-a456-426614174000",
    "operations": ["clean", "transform", "aggregate"]
  },
  "retryPolicy": {
    "maxAttempts": 3,
    "backoff": "exponential"
  }
}
```

## Códigos de Erro
- `invalid_job_type`: Tipo de job não reconhecido
- `invalid_priority`: Valor fora do intervalo permitido
- `payload_validation_failed`: Payload não corresponde ao schema do tipo
- `rate_limited`: Cliente excedeu limite de jobs por minuto

## Diagrama
```mermaid
sequenceDiagram
    participant Sistema
    participant Fila
    Sistema->>Fila: Adiciona job
    Fila-->>Sistema: Confirmação