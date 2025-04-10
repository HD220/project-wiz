export interface AuthToken {
  token: string;
  type: 'oauth' | 'pat';
  createdAt: Date;
  expiresAt?: Date;
}

export interface IAuthRepository {
  saveToken(token: AuthToken): Promise<void>;
  loadToken(): Promise<AuthToken | null>;
  removeToken(): Promise<void>;
}

export interface IGitHubOAuthService {
  startOAuthFlow(): Promise<AuthToken>;
}

export interface ICryptoService {
  encrypt(data: string): Promise<string>;
  decrypt(data: string): Promise<string>;
}

export interface IPasswordService {
  setPassword(password: string): Promise<void>;
  verifyPassword(password: string): Promise<boolean>;
  isPasswordSet(): Promise<boolean>;
}