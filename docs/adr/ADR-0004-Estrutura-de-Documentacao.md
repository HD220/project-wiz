# ADR 0004: Estrutura de documentação

## Status

Aceito

## Contexto

O projeto precisava de uma estrutura de documentação clara e abrangente para:

- Facilitar a manutenção
- Permitir fácil expansão
- Garantir consistência
- Apoiar novos contribuidores

## Decisão

Adotamos a seguinte estrutura de documentação:

1. **README.md** - Visão geral do projeto e ponto de entrada
2. **docs/**
   - **project-context.md** - Visão geral técnica
   - **documentation-status.md** - Status e métricas
   - **ui-components.md** - Documentação de componentes
   - **llm-services.md** - Documentação de serviços
   - **adr/** - Decisões arquiteturais
   - **templates/** - Templates para documentação

## Consequências

- Melhor organização da documentação
- Facilidade para encontrar informações
- Consistência entre documentos
- Requer manutenção contínua para atualizar links e referências

## Alternativas Consideradas

1. Documentação monolítica em um único arquivo
   - Difícil manutenção
   - Pouca organização

2. Documentação apenas no README
   - Limita a profundidade técnica
   - Polui o arquivo principal

## Links relacionados

- [Template de documentação](../templates/)
