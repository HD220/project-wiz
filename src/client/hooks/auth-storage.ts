import { AuthUser, AuthSession } from "../types/auth";

export interface IAuthStorage {
  setItem(key: string, value: string): void;
  getItem(key: string): string | null;
  removeItem(key: string): void;
}

export interface AuthStorageOptions {
  encryptionKey?: string;
  tokenExpirationMs?: number;
}

export class AuthStorageService {
  private storage: IAuthStorage;
  private encryptionKey?: string;
  private tokenExpirationMs?: number;

  constructor(storage: IAuthStorage, options?: AuthStorageOptions) {
    this.storage = storage;
    this.encryptionKey = options?.encryptionKey;
    this.tokenExpirationMs = options?.tokenExpirationMs;
  }

  saveSession(session: AuthSession) {
    const now = Date.now();
    const accessToken = this.encrypt(session.accessToken);
    const refreshToken = this.encrypt(session.refreshToken);
    const user = JSON.stringify(session.user);

    this.storage.setItem("accessToken", accessToken);
    this.storage.setItem("refreshToken", refreshToken);
    this.storage.setItem("user", user);

    if (this.tokenExpirationMs) {
      this.storage.setItem("accessTokenExpiresAt", (now + this.tokenExpirationMs).toString());
      this.storage.setItem("refreshTokenExpiresAt", (now + this.tokenExpirationMs).toString());
    }
  }

  clearSession() {
    this.storage.removeItem("accessToken");
    this.storage.removeItem("refreshToken");
    this.storage.removeItem("user");
    this.storage.removeItem("accessTokenExpiresAt");
    this.storage.removeItem("refreshTokenExpiresAt");
  }

  getAccessToken(): string | null {
    if (this.isTokenExpired("accessTokenExpiresAt")) {
      this.storage.removeItem("accessToken");
      return null;
    }
    const token = this.storage.getItem("accessToken");
    return token ? this.decrypt(token) : null;
  }

  getRefreshToken(): string | null {
    if (this.isTokenExpired("refreshTokenExpiresAt")) {
      this.storage.removeItem("refreshToken");
      return null;
    }
    const token = this.storage.getItem("refreshToken");
    return token ? this.decrypt(token) : null;
  }

  getUser(): AuthUser | null {
    const raw = this.storage.getItem("user");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  private isTokenExpired(expirationKey: string): boolean {
    if (!this.tokenExpirationMs) return false;
    const expiresAt = this.storage.getItem(expirationKey);
    if (!expiresAt) return false;
    return Date.now() > parseInt(expiresAt, 10);
  }

  // Placeholder for encryption logic
  private encrypt(value: string): string {
    // Implement encryption here if needed
    return value;
  }

  // Placeholder for decryption logic
  private decrypt(value: string): string {
    // Implement decryption here if needed
    return value;
  }
}

// Default implementation using browser localStorage
export const defaultAuthStorage = new AuthStorageService(
  {
    setItem: (key, value) => localStorage.setItem(key, value),
    getItem: (key) => localStorage.getItem(key),
    removeItem: (key) => localStorage.removeItem(key),
  }
);