# Handoff Técnico - ISSUE-0095: Correção do risco de vazamento de memória no `LlmBridgeGateway`

---

## Diagnóstico do Problema

Durante o uso intensivo do `LlmBridgeGateway`, foi identificado um crescimento contínuo e indefinido das estruturas internas `pendingRequests` e `streamHandlers`. Essas estruturas são mapas que armazenam, respectivamente, as requisições pendentes e os manipuladores de streams ativos.

O problema ocorria principalmente em cenários de falha de comunicação, cancelamento inesperado ou desconexão abrupta, onde as entradas nesses mapas não eram removidas corretamente. Com o tempo, isso levava a um acúmulo de objetos órfãos, causando consumo excessivo de memória (vazamento), degradação de desempenho e risco de travamento da aplicação.

---

## Solução Implementada

Para mitigar o risco de vazamento, foram aplicadas as seguintes estratégias:

- **Timeouts configuráveis** para requisições e streams, garantindo que operações que excedam um tempo limite sejam automaticamente canceladas.
- **Cancelamento automático** de streams inativos ou que não recebem dados dentro do prazo estipulado.
- **Limpeza automática** das entradas nos mapas `pendingRequests` e `streamHandlers` em qualquer cenário de falha, timeout ou cancelamento.
- **Logs detalhados** para rastrear o ciclo de vida das requisições e streams, facilitando o diagnóstico de problemas futuros.
- **Testes automatizados** cobrindo os casos de timeout, cancelamento e falha, para garantir que os recursos sejam sempre liberados corretamente.

---

## Decisões Técnicas

- **Uso de timeouts configuráveis:** optou-se por permitir a configuração dos tempos limite para facilitar ajustes conforme o ambiente e o modelo LLM utilizado, evitando valores fixos que poderiam ser inadequados em diferentes contextos.
- **Cancelamento automático:** implementado via timers que disparam a limpeza e o cancelamento da requisição ou stream caso o tempo limite seja atingido.
- **Limpeza centralizada:** toda finalização de requisição ou stream, seja por sucesso, erro, timeout ou cancelamento, aciona rotinas que removem as entradas dos mapas, evitando objetos órfãos.
- **Logs detalhados:** adicionados em todos os pontos críticos (início, sucesso, erro, timeout, cancelamento) para facilitar a auditoria e o troubleshooting.
- **Testes automatizados:** essenciais para garantir que as correções não introduzam regressões e que os recursos sejam sempre liberados.

---

## Funcionamento dos Timeouts e Cancelamentos Automáticos

- **Timeouts de requisição:** ao iniciar uma requisição, um timer é criado. Se a resposta não chegar dentro do tempo limite, a requisição é cancelada automaticamente, removida do `pendingRequests` e um erro de timeout é retornado.
- **Timeouts de stream:** para streams de resposta, um timer monitora a inatividade. Se não houver dados recebidos dentro do prazo, o stream é cancelado e removido do `streamHandlers`.
- **Cancelamento explícito:** além dos timeouts, o sistema permite cancelamentos explícitos por parte do usuário ou de componentes superiores, que também acionam a limpeza.

---

## Instruções para Ajuste dos Tempos Limite

Os tempos limite são configuráveis via parâmetros do serviço ou variáveis de ambiente (dependendo da implementação). Recomenda-se:

- Ajustar o **timeout de requisição** conforme o tempo médio esperado para respostas do modelo LLM utilizado.
- Ajustar o **timeout de stream** para um valor que considere a latência e o ritmo de envio dos dados.
- Em ambientes de teste, usar valores menores para facilitar a detecção de problemas.
- Em produção, monitorar os logs e ajustar os valores para evitar cancelamentos prematuros ou vazamentos.

---

## Recomendações para Monitoramento e Manutenção

- **Monitorar os logs** para identificar requisições ou streams que atinjam o timeout com frequência.
- **Ajustar os tempos limite** conforme o comportamento observado.
- **Revisar periodicamente os testes automatizados** para cobrir novos cenários.
- **Auditar o consumo de memória** em cargas prolongadas para garantir que os mapas não cresçam indefinidamente.
- **Adicionar métricas** (futuro) para monitorar o tamanho dos mapas em tempo real.

---

## Lições Aprendidas e Pontos de Atenção

- Vazamentos de memória podem ocorrer mesmo em sistemas assíncronos se não houver limpeza adequada em todos os fluxos de erro.
- Timeouts e cancelamentos automáticos são essenciais para garantir a liberação de recursos.
- Logs detalhados são fundamentais para diagnóstico e ajuste fino.
- Configurações flexíveis aumentam a resiliência do sistema.
- Testes automatizados devem cobrir explicitamente cenários de falha, timeout e cancelamento.

---