# Implementar sistema de autenticação

## Descrição

Implementar um sistema completo de autenticação para o aplicativo, incluindo:

- Backend: Serviço de autenticação com registro, login, logout e verificação de sessão
- Frontend: Hook useAuth e componentes de interface para fluxo de autenticação
- Segurança: Gerenciamento seguro de tokens e sessões

## Motivação

Atualmente o aplicativo não possui nenhum sistema de autenticação, o que é essencial para:

- Proteger rotas e funcionalidades
- Personalizar a experiência do usuário
- Permitir integrações seguras com outros serviços

## Tarefas

### Backend (core/services/auth)

- [ ] Criar serviço AuthService com métodos para:
  - Registrar novo usuário
  - Fazer login
  - Fazer logout
  - Verificar sessão
  - Atualizar token
- [ ] Implementar estratégia de autenticação JWT
- [ ] Criar middleware para rotas protegidas

### Frontend

- [ ] Criar hook useAuth seguindo padrão existente (similar a use-llm.ts)
- [ ] Criar componentes para:
  - Formulário de login
  - Formulário de registro
  - Botão/logout
  - Proteção de rotas
- [ ] Integrar com componentes UI existentes (form, input, button, etc)
- [ ] Implementar persistência de sessão

### Segurança

- [ ] Implementar tratamento seguro de tokens
- [ ] Adicionar proteção CSRF
- [ ] Validar inputs do usuário

## Dependências

- Nenhuma - esta é uma implementação nova

## Critérios de Aceitação

- [ ] Usuário pode se registrar e fazer login
- [ ] Rotas protegidas são acessíveis apenas para usuários autenticados
- [ ] Sessão persiste entre recarregamentos
- [ ] Tokens são armazenados e transmitidos com segurança
- [ ] Testes unitários para serviços e hooks
