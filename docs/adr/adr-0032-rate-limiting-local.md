# ADR-0032: Decisão de não implementar Rate Limiting em ambiente local

## Status
Aceito

## Contexto
O sistema atual opera em ambiente local/desenvolvimento
Não há exposição direta à internet ou múltiplos usuários concorrentes
Implementação inicial de rate limiting foi removida após análise

## Decisão
Não implementar rate limiting no ambiente local atual
Manter código preparado para ativação quando necessário
Documentar requisitos para ativação em produção

## Alternativas Consideradas
1. Manter rate limiting ativo mesmo em local
   - Vantagem: Maior segurança
   - Desvantagem: Complexidade desnecessária

2. Remover completamente o código de rate limiting
   - Vantagem: Código mais simples
   - Desvantagem: Dificuldade para ativar posteriormente

## Consequências
- Redução de complexidade no ambiente local
- Necessidade de ativar manualmente em produção
- Requer monitoramento para identificar necessidade de ativação

## Diretrizes de Implementação
- Manter documentação clara sobre como ativar
- Incluir testes para verificar funcionamento quando ativado
- Adicionar alertas para lembrar ativação em produção

## Histórico
- 2025-04-16: Documentação inicial criada