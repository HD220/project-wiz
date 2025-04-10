import AsyncStorage from '@react-native-async-storage/async-storage';

const URL_KEY = 'api_url';
const TOKEN_KEY = 'api_token';

export async function saveToken(url: string, token: string) {
  await AsyncStorage.setItem(URL_KEY, url);
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getToken(): Promise<{ url: string; token: string } | null> {
  const url = await AsyncStorage.getItem(URL_KEY);
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (url && token) {
    return { url, token };
  }
  return null;
}