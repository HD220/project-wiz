import type {
  LoginInput,
  RegisterInput,
  AuthResult,
  User,
} from "../../shared/types/common";
import { BaseApiClient } from "./api-client";

export class AuthService extends BaseApiClient {
  static async login(data: LoginInput): Promise<AuthResult> {
    const response = await window.electronAPI.login(data);
    return this.handleResponse(response, "Login failed");
  }

  static async register(data: RegisterInput): Promise<AuthResult> {
    const response = await window.electronAPI.register(data);
    return this.handleResponse(response, "Registration failed");
  }

  static async validateToken(
    token: string,
  ): Promise<{ userId: string; username: string }> {
    const response = await window.electronAPI.validateToken(token);
    return this.handleResponse(response, "Token validation failed");
  }

  static async getCurrentUser(userId: string): Promise<User> {
    const response = await window.electronAPI.getCurrentUser(userId);
    return this.handleResponse(response, "Failed to get current user");
  }

  static async logout(userId: string): Promise<void> {
    const response = await window.electronAPI.logout(userId);
    return this.handleResponse(response, "Logout failed");
  }

  static async changePassword(data: {
    userId: string;
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    const response = await window.electronAPI.changePassword(data);
    return this.handleResponse(response, "Password change failed");
  }
}
