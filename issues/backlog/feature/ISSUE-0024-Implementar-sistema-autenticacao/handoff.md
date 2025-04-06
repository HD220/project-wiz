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
