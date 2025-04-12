// Auth types for AuthService

export interface AuthUser {
  id: string;
  email: string;
  passwordHash?: string;
  createdAt: string;
}

export interface RegisterInput {
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface AuthSession {
  user: {
    id: string;
    email: string;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface AuthServiceInterface {
  register(input: RegisterInput): Promise<AuthUser>;
  login(input: LoginInput): Promise<AuthSession>;
  logout(token: string): Promise<void>;
  verifySession(token: string): Promise<AuthUser | null>;
  refreshToken(refreshToken: string): Promise<AuthSession>;
}