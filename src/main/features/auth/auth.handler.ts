import { AuthService } from "@/main/features/auth/auth.service";
import type {
  LoginCredentials,
  RegisterUserInput,
} from "@/main/features/auth/auth.types";
import { createIpcHandler } from "@/main/utils/ipc-handler";

/**
 * Setup authentication IPC handlers
 * Exposes AuthService methods to the frontend via IPC
 */
export function setupAuthHandlers(): void {
  createIpcHandler("auth:register", (input: RegisterUserInput) =>
    AuthService.register(input),
  );

  createIpcHandler("auth:login", (credentials: LoginCredentials) =>
    AuthService.login(credentials),
  );

  createIpcHandler("auth:getCurrentUser", () => AuthService.getCurrentUser());

  createIpcHandler("auth:logout", async () => {
    await AuthService.logout();
    return { message: "Logged out successfully" };
  });

  createIpcHandler("auth:isLoggedIn", () =>
    Promise.resolve({ isLoggedIn: AuthService.isLoggedIn() }),
  );

  createIpcHandler("auth:getActiveSession", async () => {
    // Initialize session from database if not already loaded
    await AuthService.initializeSession();
    const user = await AuthService.getCurrentUser();
    return user ? { user } : null;
  });

  createIpcHandler("auth:getUserById", (userId: string) =>
    AuthService.getUserById(userId),
  );
}
