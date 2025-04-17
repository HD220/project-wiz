import * as SecureStore from 'expo-secure-store';
import { secureStorage, TokenService } from './SecureStorage';

jest.mock('expo-secure-store');

describe('SecureStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should save tokens securely', async () => {
    const mockSetItem = SecureStore.setItemAsync as jest.Mock;
    mockSetItem.mockResolvedValueOnce(undefined);

    await TokenService.saveAuthTokens({
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token'
    });

    expect(mockSetItem).toHaveBeenCalledWith('access_token', 'test-access-token');
    expect(mockSetItem).toHaveBeenCalledWith('refresh_token', 'test-refresh-token');
  });

  it('should handle missing optional tokens', async () => {
    const mockSetItem = SecureStore.setItemAsync as jest.Mock;
    mockSetItem.mockResolvedValueOnce(undefined);

    await TokenService.saveAuthTokens({
      accessToken: 'test-access-token'
    });

    expect(mockSetItem).toHaveBeenCalledTimes(1);
  });

  it('should retrieve access token', async () => {
    const mockGetItem = SecureStore.getItemAsync as jest.Mock;
    mockGetItem.mockResolvedValueOnce('test-token');

    const token = await TokenService.getAccessToken();
    expect(token).toBe('test-token');
    expect(mockGetItem).toHaveBeenCalledWith('access_token');
  });

  it('should clear all tokens', async () => {
    const mockDeleteItem = SecureStore.deleteItemAsync as jest.Mock;
    mockDeleteItem.mockResolvedValue(undefined);

    await TokenService.clearTokens();
    expect(mockDeleteItem).toHaveBeenCalledTimes(3);
  });
});