# ISSUE-0146 - Refatorar Sidebar em componentes menores

## Contexto
A Sidebar atual do projeto está implementada de forma monolítica, concentrando múltiplas responsabilidades em um único componente. Isso dificulta a manutenção, a realização de testes unitários e a evolução incremental da interface.

## Diagnóstico
- Código extenso e complexo, com muitas linhas e responsabilidades misturadas
- Mistura de lógica de navegação, controle de estado e renderização da interface
- Viola o princípio da responsabilidade única (SRP)
- Dificulta a reutilização de partes da Sidebar em outros contextos
- Torna a identificação e correção de bugs mais trabalhosa

## Justificativa
- Melhorar a manutenibilidade do código
- Facilitar a criação de testes unitários específicos para cada parte da Sidebar
- Permitir evolução incremental da interface, com menor risco de regressão
- Isolar bugs e facilitar o diagnóstico de problemas
- Tornar o código mais alinhado aos princípios SOLID e Clean Code

## Recomendações técnicas
- Quebrar a Sidebar em componentes menores e reutilizáveis, por exemplo:
  - **Menu**: navegação principal
  - **UserInfo**: informações do usuário logado
  - **Footer**: ações secundárias ou informações adicionais
- Extrair a lógica de estado e efeitos para hooks dedicados
- Aplicar princípios SOLID e Clean Code na organização dos componentes e hooks
- Garantir compatibilidade com o roteamento atual da aplicação
- Documentar a API pública dos novos componentes para facilitar uso e manutenção

## Critérios de aceitação
- Sidebar dividida em pelo menos **3 componentes reutilizáveis**
- Cobertura de **testes unitários** para cada componente extraído
- Sem regressões visuais ou funcionais na navegação e uso da Sidebar
- Código revisado e aprovado seguindo os padrões do projeto

## Riscos e dependências
- Possível impacto em funcionalidades que dependem da Sidebar atual
- Necessidade de ajustes em estilos globais para manter a consistência visual
- Dependência da refatoração dos hooks relacionados, que possuem código duplicado (ver **issue de hooks duplicados** a ser criada)