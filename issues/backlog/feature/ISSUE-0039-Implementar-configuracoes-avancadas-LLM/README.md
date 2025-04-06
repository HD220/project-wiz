# ISSUE-0039: Implementar configurações avançadas do LLM

## Descrição

Implementar configurações avançadas para os modelos LLM, permitindo aos usuários ajustar parâmetros como temperatura, top_p e max_tokens.

## Necessidades

- Criar uma interface de usuário para configurar os parâmetros do LLM.
- Persistir as configurações do LLM.
- Integrar as configurações com o WorkerService.

## Critérios de Aceitação

- O usuário deve ser capaz de ajustar os parâmetros de temperatura, top_p e max_tokens através da interface do usuário.
- As configurações devem ser persistidas e aplicadas ao modelo LLM.
- A interface deve ser intuitiva e fácil de usar.

## Notas

O WorkerService já recebe LLamaChatPromptOptions, mas não há interface para configurar esses parâmetros.

## Prioridade

Alta

## Estimativa

5 dias
