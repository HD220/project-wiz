import { ipcMain } from 'electron';
import { AuthService } from '../services/auth.service';
import type { 
  LoginInput, 
  RegisterInput 
} from '../../shared/schemas/validation.schemas';
import { handleError } from '../utils/error-handler';

/**
 * Authentication IPC handlers
 */
export function setupAuthHandlers(): void {
  // Login user
  ipcMain.handle('auth:login', async (_, input: LoginInput) => {
    try {
      return await AuthService.login(input);
    } catch (error) {
      throw handleError(error);
    }
  });
  
  // Register new user
  ipcMain.handle('auth:register', async (_, input: RegisterInput) => {
    try {
      return await AuthService.register(input);
    } catch (error) {
      throw handleError(error);
    }
  });
  
  // Validate token
  ipcMain.handle('auth:validate-token', async (_, token: string) => {
    try {
      return await AuthService.validateToken(token);
    } catch (error) {
      throw handleError(error);
    }
  });
  
  // List all accounts
  ipcMain.handle('auth:list-accounts', async () => {
    try {
      return await AuthService.listAccounts();
    } catch (error) {
      throw handleError(error);
    }
  });
  
  // Check if first run
  ipcMain.handle('auth:is-first-run', async () => {
    try {
      return await AuthService.isFirstRun();
    } catch (error) {
      throw handleError(error);
    }
  });
  
  // Create default account
  ipcMain.handle('auth:create-default-account', async () => {
    try {
      return await AuthService.createDefaultAccount();
    } catch (error) {
      throw handleError(error);
    }
  });
  
  // Logout (client-side only, no server action needed)
  ipcMain.handle('auth:logout', async () => {
    // Nothing to do on server side for logout
    // Client should clear token
    return { success: true };
  });
}