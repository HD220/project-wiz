import { ipcMain } from 'electron';
import { AuthService, LoginInput, RegisterInput } from './auth.service';

export function setupAuthHandlers(): void {
  // Login handler
  ipcMain.handle('auth:login', async (event, data: LoginInput) => {
    try {
      const result = await AuthService.login(data);
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  });

  // Register handler
  ipcMain.handle('auth:register', async (event, data: RegisterInput) => {
    try {
      const result = await AuthService.register(data);
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      };
    }
  });

  // Validate token handler
  ipcMain.handle('auth:validate-token', async (event, token: string) => {
    try {
      const result = await AuthService.validateToken(token);
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Token validation failed' 
      };
    }
  });

  // Get current user handler
  ipcMain.handle('auth:get-current-user', async (event, userId: string) => {
    try {
      const result = await AuthService.getCurrentUser(userId);
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get current user' 
      };
    }
  });

  // Logout handler
  ipcMain.handle('auth:logout', async (event, userId: string) => {
    try {
      await AuthService.logout(userId);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Logout failed' 
      };
    }
  });

  // Change password handler
  ipcMain.handle('auth:change-password', async (event, data: { userId: string; currentPassword: string; newPassword: string }) => {
    try {
      await AuthService.changePassword(data.userId, data.currentPassword, data.newPassword);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Password change failed' 
      };
    }
  });
}