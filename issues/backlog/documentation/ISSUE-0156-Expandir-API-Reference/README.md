# ISSUE-0156 - Expandir API Reference

## Contexto e diagnóstico

A documentação atual da API está incompleta, com descrições superficiais, ausência de exemplos detalhados, fluxos de uso e cobertura parcial dos endpoints, métodos, parâmetros e respostas. Isso dificulta a integração de novos desenvolvedores, aumenta erros de uso e compromete a escalabilidade do projeto.

## Justificativa da necessidade

- Facilitar integração rápida e correta com a API
- Reduzir erros de uso por falta de clareza
- Aumentar a rastreabilidade e padronização das interfaces públicas
- Suportar evolução incremental da API com documentação versionada
- Atender requisitos de compliance e auditoria técnica

## Recomendações técnicas

- Expandir o arquivo `docs/api-reference.md` cobrindo:
  - Todos os endpoints, métodos, parâmetros, tipos e respostas
  - Códigos de status e mensagens de erro
  - Exemplos de requisições e respostas (JSON, curl, etc.)
  - Fluxos de autenticação e autorização
  - Limitações, quotas e boas práticas
- Incluir fluxogramas e diagramas de sequência para fluxos complexos
- Referenciar ADRs e templates relacionados
- Garantir atualização contínua com versionamento da documentação

## Critérios de aceitação

- API Reference expandida cobrindo 100% dos endpoints e fluxos
- Exemplos claros e testáveis incluídos
- Links cruzados com ADRs, templates e outras issues relacionadas
- Revisão por pelo menos um membro sênior
- Disponível em `docs/api-reference.md` com referências no README principal

## Riscos e dependências

- Dependência de informações atualizadas sobre a API real
- Risco de desatualização se não houver processo contínuo de revisão
- Dependência de definições de autenticação e autorização

## Detalhes adicionais

- Nome da issue: `ISSUE-0156-Expandir-API-Reference`
- Criar README.md e handoff.md detalhados com todas as informações acima
- Organizar em `issues/backlog/documentation/ISSUE-0156-Expandir-API-Reference/`
- Incluir links para outras issues relacionadas assim que criadas
- Prioridade alta, foco em clareza e cobertura total da API