# ISSUE-0142 - Padronizar nomenclatura para inglês no backend

## Diagnóstico
O backend do projeto possui nomes misturados em português e inglês, o que dificulta o entendimento, manutenção e integração com ferramentas e desenvolvedores internacionais.

## Contexto
A padronização da nomenclatura para o inglês é essencial para garantir alinhamento global, consistência no código e aderência às boas práticas de desenvolvimento backend.

## Justificativa
- Facilitar o onboarding de novos desenvolvedores
- Reduzir ambiguidades e erros de interpretação
- Melhorar a integração com APIs, frameworks e ferramentas internacionais
- Preparar o projeto para colaboração internacional

## Recomendações técnicas
- Levantar todos os nomes de arquivos, pastas, classes, funções, variáveis e comentários no backend
- Definir convenções claras de nomenclatura (ex: camelCase para variáveis e funções, PascalCase para classes, kebab-case para arquivos e pastas)
- Renomear todos os itens para inglês seguindo a convenção definida
- Atualizar todas as referências e imports para refletir as mudanças
- Documentar a convenção adotada em local acessível do projeto

## Critérios de aceitação
- 100% do backend com nomenclatura padronizada em inglês
- Convenção documentada e acessível
- Código funcionando sem erros de import ou execução
- Links cruzados e referências atualizados

## Riscos
- Quebra de imports e referências internas
- Conflitos em merges durante o processo de renomeação
- Necessidade de ajustes em documentação e testes automatizados

## Dependências
- Refatoração dos tipos de domínio (ISSUE-0141)
- Reforço dos testes backend para garantir integridade após renomeação

## Links cruzados
- [ISSUE-0141-Refatorar-tipos-dominio-para-domain-contracts](../ISSUE-0141-Refatorar-tipos-dominio-para-domain-contracts/README.md)
- [ISSUE-0140-Adicionar-validacoes-infraestrutura](../../security/ISSUE-0140-Adicionar-validacoes-infraestrutura/README.md)