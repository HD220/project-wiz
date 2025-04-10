# Handoff - ISSUE-0143 - Extrair import/export de prompts para serviços dedicados

## Diagnóstico
Atualmente, a lógica de importação e exportação de prompts está dispersa ou acoplada a componentes da interface e infraestrutura, o que dificulta a manutenção, a realização de testes adequados e a evolução da funcionalidade. Isso gera alto acoplamento e reduz a coesão do sistema.

## Contexto
Para aderir aos princípios da Clean Architecture, é fundamental que a manipulação de prompts seja isolada em serviços dedicados, desacoplados da interface e da infraestrutura. Isso permitirá maior reuso, facilidade de testes, substituição de implementações e evolução independente das camadas.

## Justificativa
- Melhorar a organização do código, centralizando responsabilidades
- Facilitar a manutenção e evolução da funcionalidade de prompts
- Permitir substituição de implementações sem afetar o restante do sistema
- Garantir separação clara de responsabilidades, alinhada à Clean Architecture

## Recomendações Técnicas
- Mapear todos os pontos do código onde ocorre importação e exportação de prompts
- Criar serviços dedicados para importação e exportação, com interfaces bem definidas
- Isolar a lógica de transformação, validação e persistência dentro desses serviços
- Atualizar todas as chamadas existentes para utilizar os novos serviços
- Cobrir os serviços com testes unitários, incluindo fluxos de sucesso e falha
- Documentar detalhadamente os serviços criados, suas interfaces e fluxos

## Critérios de Aceitação
- Toda a lógica de importação e exportação centralizada em serviços dedicados
- Código cliente desacoplado da infraestrutura e detalhes internos
- Testes cobrindo fluxos principais e cenários de erro
- Documentação atualizada refletindo a nova arquitetura e uso dos serviços

## Riscos
- Possível quebra de funcionalidades existentes durante a refatoração
- Aumento da complexidade inicial para isolar e migrar a lógica dispersa

## Dependências
- Padronização da nomenclatura no backend (ver ISSUE-0142)
- Reforço dos testes no backend e infraestrutura (ver ISSUE-0140)

## Links Cruzados
- [ISSUE-0142 - Padronizar nomenclatura inglês backend](../ISSUE-0142-Padronizar-nomenclatura-ingles-backend/README.md)
- [ISSUE-0140 - Adicionar validações infraestrutura](../../security/ISSUE-0140-Adicionar-validacoes-infraestrutura/README.md)