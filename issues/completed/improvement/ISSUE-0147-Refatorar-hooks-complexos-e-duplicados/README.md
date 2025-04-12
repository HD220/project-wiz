# ISSUE-0147 - Refatorar hooks complexos e duplicados

## Contexto
Diversos hooks no frontend apresentam alta complexidade, lógica misturada e duplicação de código. Isso dificulta a manutenção, a evolução e a testabilidade do código.

## Diagnóstico
- Hooks extensos, com múltiplas responsabilidades
- Dificuldade para manutenção e testes unitários
- Duplicação de lógica entre hooks similares
- Baixa reutilização devido à mistura de responsabilidades

## Justificativa
Refatorar os hooks para:
- Melhorar a legibilidade e organização do código
- Facilitar a criação e manutenção de testes unitários
- Reduzir bugs relacionados à complexidade e duplicação
- Promover reutilização de lógica comum
- Aderir aos princípios do Clean Code, SOLID e DRY

## Recomendações técnicas
- Mapear todos os hooks duplicados e complexos existentes
- Quebrar hooks grandes em hooks menores, especializados e com responsabilidade única
- Consolidar lógica comum para eliminar duplicações
- Aplicar princípios SOLID e DRY durante a refatoração
- Documentar a API dos hooks refatorados (parâmetros, retorno, efeitos colaterais)
- Garantir compatibilidade com componentes existentes, especialmente a Sidebar (ver [ISSUE-0146](../ISSUE-0146-Refatorar-Sidebar-em-componentes-menores))

## Critérios de aceitação
- Hooks com responsabilidade única e tamanho reduzido
- Ausência de duplicação de lógica entre hooks
- Cobertura de testes unitários ampliada para os hooks refatorados
- Código revisado e aprovado em pull request

## Riscos e dependências
- Impacto em componentes que consomem os hooks, como a Sidebar
- Necessidade de ajustes em chamadas e props nos componentes consumidores
- Dependência da refatoração da Sidebar (ver [ISSUE-0146](../ISSUE-0146-Refatorar-Sidebar-em-componentes-menores))