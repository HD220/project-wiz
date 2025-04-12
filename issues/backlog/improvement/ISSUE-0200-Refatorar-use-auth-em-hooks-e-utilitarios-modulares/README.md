# ISSUE-0200: Refatorar use-auth em hooks e utilitários modulares

## Contexto
O hook `useAuth` era responsável por orquestrar o estado global de autenticação no frontend, delegando parte da lógica para outros hooks e utilitários. Com o crescimento do projeto, a complexidade da autenticação aumentou, tornando necessário modularizar responsabilidades e centralizar tipos e helpers para garantir manutenibilidade e aderência ao Clean Code.

## Motivação
- Reduzir acoplamento entre lógica de estado, ações e utilitários.
- Facilitar a evolução e manutenção do fluxo de autenticação.
- Centralizar tipos e helpers para evitar duplicidade e inconsistências.
- Melhorar a clareza das responsabilidades de cada módulo.
- Garantir rastreabilidade e documentação clara do processo de refatoração.

## Diagnóstico de Violações de Clean Code
- **Responsabilidade Única:** O hook misturava orquestração de estado, delegação de lógica e exposição de utilitários, violando o princípio de responsabilidade única.
- **Modularidade:** Funções e tipos estavam dispersos, dificultando reutilização e manutenção.
- **Centralização de Tipos:** Tipos de autenticação estavam parcialmente centralizados, mas havia dependências cruzadas e possíveis duplicidades.
- **Tratamento de Erros:** O tratamento de erro era simplificado (string/null), limitando extensibilidade e clareza.
- **Retorno Extenso:** O hook retornava múltiplos elementos, o que poderia ser melhor organizado via modularização.

## Plano de Refatoração
1. **Extrair lógica de autenticação** (registro, login, logout, refresh) para hooks e utilitários dedicados.
2. **Centralizar tipos de autenticação** em `src/client/types/auth.ts`.
3. **Criar helpers reutilizáveis** para tratamento de erros e manipulação de tokens.
4. **Isolar responsabilidades**: separar claramente estado, ações e utilitários.
5. **Revisar e documentar dependências** entre módulos de autenticação.
6. **Atualizar documentação** para refletir a nova arquitetura dos hooks e utilitários.

## Resumo das Mudanças Realizadas
- Lógica de autenticação extraída para hooks e utilitários modulares.
- Tipos centralizados em `src/client/types/auth.ts`.
- Helpers criados para tratamento de erros e manipulação de tokens.
- Responsabilidades isoladas entre estado, ações e utilitários.
- Documentação atualizada para facilitar rastreabilidade e manutenção futura.