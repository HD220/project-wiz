# Handoff - Implementar configurações avançadas do LLM

## Visão geral

Esta issue tem como objetivo implementar configurações avançadas para os modelos LLM, permitindo aos usuários ajustar parâmetros como temperatura, top_p e max_tokens.

## Detalhes da implementação

- **Interface do usuário:** Criar uma interface para configurar os parâmetros do LLM.
- **Persistência:** Implementar a persistência das configurações do LLM.
- **Integração:** Integrar as configurações com o WorkerService.

## Próximos passos

- Implementar a interface do usuário para configurar os parâmetros do LLM.
- Implementar a persistência das configurações do LLM.
- Integrar as configurações com o WorkerService.
- Testar a implementação.

## Observações

O WorkerService já recebe LLamaChatPromptOptions, mas não há interface para configurar esses parâmetros.
