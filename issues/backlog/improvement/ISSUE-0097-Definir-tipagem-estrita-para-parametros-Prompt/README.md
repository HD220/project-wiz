# ISSUE-0097: Definir tipagem estrita para parâmetros da interface Prompt

## Problema
A interface `Prompt` utiliza `Record<string, any>` para o campo `parameters`.

Essa tipagem genérica reduz a segurança de tipos e a clareza do contrato, dificultando a validação, manutenção e evolução da interface.

## Impacto
- Possibilidade de erros em tempo de execução por falta de validação
- Ambiguidade sobre os parâmetros aceitos
- Dificuldade para ferramentas de análise estática e geração de documentação

## Recomendação
- Definir tipos específicos para os parâmetros conhecidos
- Ou criar tipos discriminados/documentados para diferentes categorias de parâmetros
- Atualizar implementações para refletir a nova tipagem

## Critérios de Aceite
- Tipos explícitos para parâmetros da interface `Prompt`
- Código ajustado para usar os novos tipos
- Documentação atualizada

## Prioridade
Média — importante para segurança e clareza, mas não bloqueante

