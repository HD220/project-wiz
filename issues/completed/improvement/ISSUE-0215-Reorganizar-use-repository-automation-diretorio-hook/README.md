# Reorganizar use-repository-automation para diretório de hooks

## Contexto

O hook `use-repository-automation` está atualmente localizado em `src/client/components/use-repository-automation.ts`. Esta organização viola as recomendações de Clean Architecture, pois hooks devem ser mantidos separados de componentes para garantir uma clara separação de responsabilidades e facilitar a manutenção do projeto.

## Problema

- O arquivo do hook está no diretório de componentes, o que dificulta a organização e pode causar confusão sobre sua finalidade.
- A prática recomendada é manter hooks customizados no diretório `src/client/hooks`, alinhando-se aos princípios de Clean Architecture adotados pelo projeto.

## Proposta de Melhoria

- Mover o arquivo `src/client/components/use-repository-automation.ts` para `src/client/hooks/use-repository-automation.ts`.
- Garantir que todos os imports no projeto sejam atualizados para refletir a nova localização do hook.
- Atualizar a documentação, se necessário, para indicar a nova estrutura.

## Benefícios Esperados

- Melhor separação de responsabilidades entre componentes e hooks.
- Estrutura de projeto mais clara e alinhada com Clean Architecture.
- Facilidade de manutenção e evolução do código.

## Critérios de Aceite

- O hook deve estar localizado em `src/client/hooks/use-repository-automation.ts`.
- Não deve haver referências ao hook no diretório de componentes.
- O projeto deve continuar funcionando normalmente após a reorganização.