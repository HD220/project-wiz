// Authentication types for the user domain

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterUserInput {
  username: string;
  name: string;
  password: string;
  avatar?: string;
}

export interface AuthResult {
  user: {
    id: string;
    username: string;
    name: string;
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface SessionValidationResult {
  valid: boolean;
  user?: AuthResult["user"];
  error?: string;
}
