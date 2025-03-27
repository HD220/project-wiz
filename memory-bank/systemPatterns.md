# Padrões do Sistema _Opcional_

Este arquivo documenta padrões recorrentes e padrões usados no projeto.
É opcional, mas recomendado que seja atualizado conforme o projeto evolui.
2025-03-27 08:17:49 - Log de atualizações.

-

## Padrões de Codificação

-

## Padrões Arquiteturais

-

## Padrões de Teste

## Padrões de Codificação

- **Geração de Texto Unificada**: Uso de método único para diferentes tipos de entrada (prompt simples e mensagens de chat)
- **Comunicação via MessagePort**: Interface de comunicação entre processos usando MessagePorts
- **Tratamento de Erros Centralizado**: Método de envio de erros e informações padronizado

## Padrões Arquiteturais

- **Worker Isolado**: Serviço de LLM executado em processo separado
- **Comunicação Assíncrona**: Uso de eventos e callbacks para operações de longa duração
- **Flexibilidade de Configuração**: Suporte a múltiplas opções de inicialização e geração

## Padrões de Teste

- **Teste de Geração de Texto**: Verificação de diferentes tipos de entrada
- **Teste de Streaming**: Validação do recebimento de chunks de resposta
- **Teste de Cancelamento**: Garantir interrupção segura de operações
- **Teste de Progresso**: Monitoramento de operações de longa duração

## Padrão de Download de Modelos

- Uso de `createModelDownloader` para downloads flexíveis
- Suporte a múltiplas fontes (HuggingFace, URLs diretas)
- Implementação de progresso de download
- Tratamento detalhado de erros
- Cancelamento seguro de downloads

*
