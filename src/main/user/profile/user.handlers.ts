import { ipcMain } from 'electron';
import * as UserService from './user.service';
import { getLogger } from '../../utils/logger';
import type { UpdateUserInput } from '../../../shared/types/auth.types';

const logger = getLogger('user-handlers');

/**
 * Setup IPC handlers for user profile management
 */
export function setupUserHandlers(): void {
  // Update profile handler
  ipcMain.handle('user:update-profile', async (_, userId: string, input: UpdateUserInput) => {
    try {
      logger.debug({ userId }, 'Updating user profile');
      return await UserService.updateProfile(userId, input);
    } catch (error) {
      logger.error({ error: error.message, userId }, 'Failed to update profile');
      throw error;
    }
  });

  // Update preferences handler
  ipcMain.handle('user:update-preferences', async (_, userId: string, preferences: Record<string, any>) => {
    try {
      logger.debug({ userId }, 'Updating user preferences');
      return await UserService.updatePreferences(userId, preferences);
    } catch (error) {
      logger.error({ error: error.message, userId }, 'Failed to update preferences');
      throw error;
    }
  });

  // Find user by ID handler
  ipcMain.handle('user:find-by-id', async (_, userId: string) => {
    try {
      return await UserService.findById(userId);
    } catch (error) {
      logger.error({ error: error.message, userId }, 'Failed to find user');
      throw error;
    }
  });

  // Deactivate account handler
  ipcMain.handle('user:deactivate-account', async (_, userId: string) => {
    try {
      logger.debug({ userId }, 'Deactivating user account');
      return await UserService.deactivateAccount(userId);
    } catch (error) {
      logger.error({ error: error.message, userId }, 'Failed to deactivate account');
      throw error;
    }
  });

  logger.info('User profile IPC handlers registered');
}