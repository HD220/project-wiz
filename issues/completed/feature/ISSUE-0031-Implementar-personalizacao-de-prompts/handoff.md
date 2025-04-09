# Handoff Document - Implementar personalização de prompts

## Descrição

Implementar sistema para personalização de prompts usados na interação com os modelos LLM.

## Status

Em andamento. Interface básica implementada, persistência dos prompts implementada e suporte a templates implementado.

## Próximos passos

- Permitir compartilhamento de prompts entre usuários.
- Documentar o sistema de prompts.

## Decisões

- Utilizar o componente `model-settings.tsx` como base para a interface de edição de prompts.
- Armazenar os prompts personalizados no sistema de configurações existente.
- Implementar templates de prompts utilizando a biblioteca `handlebars`.
- Criado componente `PromptCustomization` para a edição dos prompts.
- Adicionado o componente `PromptCustomization` na tab "Prompt Customization" do componente `ModelSettings`.
- Implementado o salvamento e carregamento dos prompts utilizando o sistema de arquivos.
- Implementado o suporte a templates de prompts utilizando a biblioteca `handlebars`.

## Pendências

- Permitir compartilhamento de prompts entre usuários.

## Notas

- O componente `model-settings.tsx` já possui uma estrutura para configurações de modelos, o que facilita a implementação da interface de edição de prompts.
- O sistema de configurações existente permite armazenar dados de forma persistente, o que é ideal para os prompts personalizados.
- A biblioteca `handlebars` é uma boa opção para implementar templates de prompts, pois é leve e fácil de usar.
