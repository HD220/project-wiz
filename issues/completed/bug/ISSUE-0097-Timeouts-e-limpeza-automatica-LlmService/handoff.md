# Handoff - ISSUE-0097: Timeouts e limpeza automática no LlmService

## Resumo da Análise

Durante a análise do `LlmService` (arquivo `src/core/application/services/llm-service.ts`), foi identificado que:

- Não há controle de timeout para streams ou requisições.
- Listeners são registrados (`response`, `error`) mas não removidos explicitamente após finalização ou erro.
- Não existem mapas explícitos `pendingRequests` ou `streamHandlers`, mas o risco de vazamento ocorre pela ausência de limpeza adequada e controle de tempo.

## Plano Técnico para Correção

### 1. Implementar Timeout Configurável

- Definir um valor padrão (ex: 60 segundos) para timeout de streams.
- Permitir parametrização futura via configuração.

### 2. Cancelamento Automático

- Utilizar `setTimeout` para disparar o cancelamento da stream se o tempo limite for atingido.
- No timeout:
  - Rejeitar a Promise com erro de timeout.
  - Remover todos os listeners registrados.
  - Realizar limpeza de referências.

### 3. Limpeza de Listeners e Recursos

- Após finalização normal, erro ou timeout:
  - Remover listeners `response` e `error`.
  - Cancelar o timer de timeout, se ainda ativo.
  - Garantir que não fiquem referências pendentes.

### 4. Fluxo de `promptStream`

- Envolver a Promise de `promptStream` com lógica de timeout.
- Encerrar a Promise com sucesso ou erro, sempre limpando recursos.

### 5. Testes

- Simular streams que excedem o tempo limite.
- Simular cancelamentos abruptos.
- Verificar que listeners são removidos em todos os fluxos.

## Critérios de Aceitação (reforçados)

- Streams e requisições inativas são canceladas automaticamente após timeout.
- Listeners são sempre removidos após finalização, erro ou timeout.
- Não há crescimento contínuo de uso de memória em cenários de erro ou timeout.
- Timeout deve ser configurável facilmente.
- Sem impacto negativo na experiência do usuário.

---