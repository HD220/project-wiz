# Refatorar sidebar.tsx para modularidade, SRP e testabilidade

## Contexto

O arquivo `src/client/components/ui/sidebar.tsx` apresenta problemas críticos de manutenção e qualidade de código:

- **Tamanho excessivo:** O arquivo possui mais de 700 linhas, dificultando a leitura, entendimento e manutenção.
- **Múltiplas responsabilidades:** As funções `SidebarProvider` e `Sidebar` concentram lógica de estado, contexto, renderização e manipulação de UI, violando o princípio da responsabilidade única (SRP).
- **Baixa modularidade:** A lógica está fortemente acoplada, dificultando a extração de partes reutilizáveis e a realização de testes unitários.
- **Testabilidade comprometida:** A concentração de lógica e estado em componentes grandes dificulta a criação de testes isolados e a identificação de bugs.

## Problemas Identificados

- Violação do SRP (Single Responsibility Principle) em `SidebarProvider` e `Sidebar`.
- Baixa separação de preocupações entre lógica de estado/contexto, hooks e renderização.
- Dificuldade para manutenção, evolução e testes devido ao tamanho e acoplamento.
- Dificuldade para reaproveitamento de lógica e componentes.

## Recomendações

- **Extrair hooks customizados:** Isolar lógica de estado e efeitos em hooks dedicados.
- **Dividir componentes:** Separar subcomponentes de UI e lógica em arquivos próprios.
- **Separar contexto:** Mover a lógica de contexto para arquivos/contextos dedicados.
- **Melhorar testabilidade:** Garantir que cada parte seja facilmente testável de forma isolada.
- **Seguir Clean Code e Clean Architecture:** Aplicar princípios de modularidade, SRP e baixo acoplamento.

## Critérios de Aceite

- O arquivo `sidebar.tsx` deve ser dividido em múltiplos arquivos/componentes/hook/contexto conforme apropriado.
- Cada função/componente deve ter responsabilidade única e clara.
- A testabilidade deve ser aprimorada, permitindo testes unitários para lógica e UI.
- O código resultante deve seguir os padrões de Clean Code e Clean Architecture adotados no projeto.

---
**Não implementar a refatoração nesta issue. Esta issue é apenas para rastreamento e planejamento da melhoria.**