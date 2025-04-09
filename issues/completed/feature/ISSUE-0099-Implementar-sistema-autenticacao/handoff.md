## Handoff Document - Implementar sistema de autenticação

### Descrição

Implementação de um sistema completo de autenticação para o aplicativo, incluindo:

- Backend: Serviço de autenticação com registro, login, logout e verificação de sessão
- Frontend: Hook useAuth e componentes de interface para fluxo de autenticação
- Segurança: Gerenciamento seguro de tokens e sessões

### Mudanças Implementadas

- Criado o serviço `AuthService` em `src/core/services/auth.ts` com os métodos `registrar`, `login`, `logout`, `verificarSessao` e `atualizarToken`.
- Criado o hook `useAuth` em `src/client/hooks/use-auth.ts` para gerenciar o estado de autenticação do usuário.
- Criados os componentes `LoginForm` em `src/client/components/auth/login-form.tsx` e `RegisterForm` em `src/client/components/auth/register-form.tsx` para permitir que os usuários façam login e se registrem.
- Criado o componente `LogoutButton` em `src/client/components/auth/logout-button.tsx` para permitir que os usuários façam logout.
- Criado o componente `ProtectedRoute` em `src/client/components/auth/protected-route.tsx` para proteger rotas que exigem autenticação.
- Modificado o componente `App.tsx` para adicionar as rotas de autenticação e proteger as rotas existentes.
- Instalados os pacotes `jsonwebtoken` e `react-router-dom` como dependências do projeto.

### Instruções para Teste

1.  Certifique-se de ter as dependências do projeto instaladas (`npm install`).
2.  Execute o aplicativo (`npm run dev`).
3.  Navegue para as rotas `/login` e `/register` para testar os formulários de login e registro.
4.  Tente acessar as rotas protegidas (por exemplo, `/`) sem estar autenticado. Você deve ser redirecionado para a página de login.
5.  Faça login com um usuário válido. Você deve ser redirecionado para a página inicial.
6.  Clique no botão de logout. Você deve ser deslogado e redirecionado para a página de login.

### Pendências

- Implementar a lógica completa de registro no método `registrar` do serviço `AuthService`.
- Implementar a lógica completa de login no método `login` do serviço `AuthService`.
- Implementar a lógica completa de logout no método `logout` do serviço `AuthService`.
- Implementar a lógica completa de verificação de sessão no método `verificarSessao` do serviço `AuthService`.
- Implementar a lógica completa de atualização de token no método `atualizarToken` do serviço `AuthService`.
- Implementar tratamento seguro de tokens.
- Adicionar proteção CSRF.
- Validar inputs do usuário.
- Adicionar testes unitários para os serviços e hooks.
- Buscar informações do usuário após o login e registro.

### Observações

- A instalação dos pacotes `jsonwebtoken` e `react-router-dom` foi realizada com a flag `--legacy-peer-deps` para evitar conflitos de dependência com o pacote `cmdk`. É importante resolver esse conflito de forma mais robusta no futuro, atualizando o `cmdk` ou removendo-o do projeto.
