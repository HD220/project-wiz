# ISSUE-0143 - Extrair import/export de prompts para serviços dedicados

## Diagnóstico
A lógica de importação e exportação de prompts está dispersa ou acoplada a componentes e infraestrutura, dificultando manutenção, testes e evolução.

## Contexto
Para seguir os princípios da Clean Architecture, a manipulação de prompts deve ser isolada em serviços dedicados, facilitando reuso, testes e desacoplamento da infraestrutura e da interface.

## Justificativa
- Melhorar a organização do código
- Facilitar a manutenção e evolução
- Permitir substituição de implementações sem impacto no restante do sistema
- Garantir separação clara de responsabilidades

## Recomendações Técnicas
- Mapear todos os pontos onde ocorre importação e exportação de prompts
- Criar serviços dedicados para importação e exportação
- Isolar a lógica de transformação, validação e persistência nesses serviços
- Atualizar chamadas existentes para utilizar os novos serviços
- Cobrir os serviços com testes unitários
- Documentar os serviços criados

## Critérios de Aceitação
- Toda a lógica de importação e exportação centralizada em serviços dedicados
- Código cliente desacoplado da infraestrutura e detalhes de implementação
- Testes cobrindo fluxos principais e cenários de erro
- Documentação atualizada refletindo a nova arquitetura

## Riscos
- Possível quebra de funcionalidades existentes durante a refatoração
- Aumento da complexidade inicial para isolar e migrar a lógica

## Dependências
- Padronização da nomenclatura no backend (ver ISSUE-0142)
- Reforço dos testes no backend e infraestrutura (ver ISSUE-0140)

## Links Cruzados
- [ISSUE-0142 - Padronizar nomenclatura inglês backend](../ISSUE-0142-Padronizar-nomenclatura-ingles-backend/README.md)
- [ISSUE-0140 - Adicionar validações infraestrutura](../../security/ISSUE-0140-Adicionar-validacoes-infraestrutura/README.md)