# Handoff - Implementação do Sistema de Autenticação

## Detalhes Técnicos

### Backend

- Criar pasta `src/core/services/auth` com:
  - `index.ts`: Exporta o serviço principal
  - `types.ts`: Tipos e interfaces
  - `strategies/`: Implementações de estratégias (JWT, etc)
  - `middlewares/`: Middlewares de autenticação

### Frontend

- Criar `src/client/hooks/useAuth.ts` seguindo padrão de outros hooks
- Criar componentes em `src/client/components/auth/`:
  - `LoginForm.tsx`
  - `RegisterForm.tsx`
  - `AuthProvider.tsx`

## Padrões a Seguir

- Usar JWT para autenticação stateless
- Armazenar token apenas em httpOnly cookies
- Seguir OWASP Top 10 para segurança
- Usar bcrypt para hash de senhas

## Referências Úteis

- [Documentação JWT](https://jwt.io/introduction)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [React Auth Patterns](https://reactrouter.com/en/main/start/concepts#authentication)

## Considerações de Segurança

- Implementar rate limiting para tentativas de login
- Validar todos os inputs do usuário
- Usar CSRF tokens para forms
- Nunca expor mensagens de erro detalhadas

## Implementação Realizada (Fase 2)

### Backend (Core)
- Interfaces e tipos definidos em `src/core/services/auth/types.ts`.
- Repositório seguro com `keytar` em `AuthRepositoryKeytar`.
- Estratégia manual de token (`ManualTokenStrategy`).
- Serviço OAuth GitHub (`GitHubOAuthService`) com fluxo completo.
- Exportações centralizadas em `src/core/services/auth/index.ts`.

### Frontend
- Hook `useAuth` para login OAuth, manual, logout e status.
- Contexto global `AuthProvider`.
- Componente `LoginForm` com login OAuth, manual e logout.

### Segurança
- Tokens armazenados criptografados via `keytar`.
- Validação básica de tokens.
- Logout remove token localmente.

### Pendências Futuras
- Configurar `CLIENT_ID` e `CLIENT_SECRET` no serviço OAuth.
- Implementar proteção opcional com senha local (`IPasswordService`).
- Melhorar UX e tratamento de erros.

