# ISSUE-0202: Refatorar auth-actions para funções puras e contratos padronizados

## Contexto

O arquivo `src/client/hooks/auth-actions.ts` concentra as ações de autenticação do cliente, incluindo registro, login, logout e refresh de sessão. Com a evolução do projeto e a adoção de Clean Architecture, identificou-se a necessidade de aprimorar a separação de responsabilidades e padronizar contratos, visando maior previsibilidade, testabilidade e manutenção.

## Motivação

- Reduzir o acoplamento entre lógica de autenticação e persistência de tokens.
- Garantir que todas as funções sejam puras, sem efeitos colaterais não controlados.
- Padronizar contratos de retorno e tratamento de erros.
- Facilitar a rastreabilidade e a manutenção futura do módulo de autenticação.
- Atender aos princípios de Clean Code e Clean Architecture adotados no projeto.

## Diagnóstico de Violações de Clean Code

- **Acoplamento**: As funções de autenticação manipulavam diretamente a persistência de tokens (`saveTokens`, `clearTokens`), misturando lógica de domínio com infraestrutura.
- **Responsabilidade Única**: Algumas funções acumulavam responsabilidades (ex: login realizava autenticação e persistência).
- **Contratos**: Apesar de padronizados, os contratos poderiam ser centralizados e documentados para evitar ambiguidades.
- **Testabilidade**: A presença de efeitos colaterais dificultava a criação de testes puros para as funções de ação.

## Plano de Refatoração

1. **Extrair a persistência de tokens** para um serviço dedicado, desacoplando da lógica de autenticação.
2. **Padronizar contratos** de entrada e saída das funções, documentando-os em `docs/architecture.md`.
3. **Centralizar responsabilidades**: cada função deve realizar apenas uma tarefa, delegando persistência e manipulação de sessão para camadas apropriadas.
4. **Reforçar funções puras**: garantir que todas as ações retornem resultados previsíveis e não manipulem estado global ou UI.
5. **Documentar as mudanças** e atualizar referências técnicas.

## Resumo das Mudanças Realizadas

- Refatoração das funções de autenticação para eliminar efeitos colaterais e garantir pureza.
- Extração da lógica de persistência de tokens para um serviço dedicado.
- Padronização e documentação dos contratos de autenticação.
- Centralização das responsabilidades conforme Clean Architecture.
- Atualização da documentação técnica em [`docs/architecture.md`](../../../docs/architecture.md).

## Bloqueio Temporário

Durante a execução desta refatoração, novas implementações relacionadas a autenticação e sessão foram temporariamente bloqueadas para evitar conflitos e garantir a integridade do processo.

---