# Handoff – ISSUE-0202: Refatorar auth-actions para funções puras e contratos padronizados

## Resumo

Esta issue retroativa documenta a refatoração do arquivo `src/client/hooks/auth-actions.ts` para garantir aderência aos princípios de Clean Code e Clean Architecture, promovendo funções puras, contratos padronizados e centralização de responsabilidades.

---

## Decisões Tomadas

- **Separação de responsabilidades**: A lógica de autenticação foi isolada da persistência de tokens, que passou a ser responsabilidade de um serviço dedicado.
- **Padronização de contratos**: Todos os contratos de entrada e saída das funções de autenticação foram revisados, padronizados e documentados.
- **Funções puras**: As funções de ação de autenticação passaram a não depender de estado global, UI ou efeitos colaterais não controlados.
- **Centralização de contratos**: Os contratos e fluxos de autenticação foram centralizados e documentados em [`docs/architecture.md`](../../../docs/architecture.md).
- **Bloqueio temporário**: Durante a refatoração, novas implementações de autenticação/sessão foram bloqueadas para evitar conflitos.

---

## Extrações e Padronizações

- **Serviço de persistência de tokens**: Toda a manipulação de tokens (`saveTokens`, `clearTokens`, `getAccessToken`, `getRefreshToken`) foi extraída para um serviço dedicado, desacoplando da lógica de domínio.
- **Contratos de autenticação**: Os contratos de retorno das funções (ex: `{ user: AuthUser }`, `{ session: AuthSession }`, `{ success: true }`) foram padronizados e documentados.
- **Tratamento de erros**: O tratamento de erros foi uniformizado, utilizando sempre exceções e nunca efeitos colaterais.

---

## Centralização de Responsabilidades

- **Ações de autenticação**: Limitadas a orquestrar chamadas à API e retornar resultados previsíveis.
- **Persistência e manipulação de sessão**: Delegadas a serviços específicos, facilitando manutenção e testes.
- **Documentação**: Todos os fluxos e contratos atualizados em [`docs/architecture.md`](../../../docs/architecture.md) para garantir rastreabilidade e alinhamento técnico.

---

## Referências

- [docs/architecture.md](../../../docs/architecture.md) – Documentação técnica dos contratos e fluxos de autenticação.
- [src/client/hooks/auth-actions.ts](../../../src/client/hooks/auth-actions.ts) – Implementação refatorada.
- [src/client/hooks/auth-storage.ts](../../../src/client/hooks/auth-storage.ts) – Serviço de persistência de tokens.

---

## Observações

- Esta refatoração é fundamental para garantir a escalabilidade e a manutenibilidade do módulo de autenticação.
- Recomenda-se que futuras evoluções sigam o padrão estabelecido nesta entrega.

---