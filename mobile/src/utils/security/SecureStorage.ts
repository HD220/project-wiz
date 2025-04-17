import * as SecureStore from 'expo-secure-store';

interface TokenStorage {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  deleteItem(key: string): Promise<void>;
}

const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  ID_TOKEN: 'id_token',
} as const;

export const secureStorage: TokenStorage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Failed to save token:', error);
      throw new Error('Failed to securely store token');
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      return null;
    }
  },

  async deleteItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Failed to delete token:', error);
    }
  },
};

export const TokenService = {
  async saveAuthTokens(tokens: {
    accessToken: string;
    refreshToken?: string;
    idToken?: string;
  }): Promise<void> {
    const operations = [
      secureStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, tokens.accessToken)
    ];

    if (tokens.refreshToken) {
      operations.push(
        secureStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, tokens.refreshToken)
      );
    }

    if (tokens.idToken) {
      operations.push(
        secureStorage.setItem(TOKEN_KEYS.ID_TOKEN, tokens.idToken)
      );
    }

    await Promise.all(operations);
  },

  async getAccessToken(): Promise<string | null> {
    return secureStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  },

  async clearTokens(): Promise<void> {
    await Promise.all([
      secureStorage.deleteItem(TOKEN_KEYS.ACCESS_TOKEN),
      secureStorage.deleteItem(TOKEN_KEYS.REFRESH_TOKEN),
      secureStorage.deleteItem(TOKEN_KEYS.ID_TOKEN),
    ]);
  },
};