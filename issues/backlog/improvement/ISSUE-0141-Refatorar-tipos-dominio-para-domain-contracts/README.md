# ISSUE-0141 - Refatorar tipos de domínio para domain contracts

## Diagnóstico
Os tipos de domínio estão dispersos ou acoplados a implementações específicas, dificultando a manutenção, testes e evolução do sistema.

## Contexto
A camada de domínio deve ser independente, com contratos claros e desacoplados de detalhes de infraestrutura, alinhada aos princípios da Clean Architecture.

## Justificativa
- Facilitar a substituição de implementações sem impacto no domínio
- Melhorar a legibilidade e organização do código
- Garantir isolamento da lógica de negócio
- Facilitar a criação e manutenção de testes

## Recomendações Técnicas
- Mapear todos os tipos relacionados ao domínio existentes no projeto
- Extrair e mover esses tipos para o diretório `src/core/domain/contracts`
- Definir contratos claros, sem dependências de infraestrutura ou detalhes de implementação
- Atualizar todos os imports na base de código para utilizar os contratos extraídos
- Documentar os contratos criados para facilitar entendimento e uso

## Critérios de Aceitação
- Todos os tipos de domínio centralizados em `src/core/domain/contracts`
- Código ajustado para utilizar exclusivamente os contratos extraídos
- Testes ajustados e passando após a refatoração
- Documentação dos contratos atualizada e acessível

## Riscos
- Quebra de dependências existentes
- Necessidade de ajustes em múltiplos módulos simultaneamente

## Dependências
- Padronização da nomenclatura no backend

## Links Cruzados
- Relacionar com a issue de padronização de nomenclatura e documentação das entidades