import type { IpcResponse } from "@/main/types";
import type {
  LoginCredentials,
  RegisterUserInput,
} from "@/main/user/authentication/auth.types";
import type { Theme } from "@/main/user/authentication/users.schema";

declare global {
  interface Window {
    api: {
      // System information
      platform: string;
      version: string;

      // Authentication API
      auth: {
        register: (input: RegisterUserInput) => Promise<IpcResponse>;
        login: (credentials: LoginCredentials) => Promise<IpcResponse>;
        getCurrentUser: () => Promise<IpcResponse>;
        logout: () => Promise<IpcResponse>;
        isLoggedIn: () => Promise<IpcResponse>;
        getUserById: (userId: string) => Promise<IpcResponse>;
      };

      // Profile API
      profile: {
        getTheme: (userId: string) => Promise<IpcResponse>;
        updateTheme: (userId: string, theme: Theme) => Promise<IpcResponse>;
      };
    };
  }
}

export {};
