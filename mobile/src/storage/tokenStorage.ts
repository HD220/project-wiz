import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';

const URL_KEY = 'api_url';
const TOKEN_KEY = 'api_token';

// Secret key for AES encryption (should be stored securely in production)
const SECRET_KEY = process.env.MOBILE_SECRET_KEY || 'wiz-mobile-secret-key';

export async function saveToken(url: string, token: string) {
  try {
    const encryptedUrl = CryptoJS.AES.encrypt(url, SECRET_KEY).toString();
    const encryptedToken = CryptoJS.AES.encrypt(token, SECRET_KEY).toString();

    await AsyncStorage.setItem(URL_KEY, encryptedUrl);
    await AsyncStorage.setItem(TOKEN_KEY, encryptedToken);
  } catch (error) {
    console.error('Error saving encrypted token:', error);
    throw error;
  }
}

export async function getToken(): Promise<{ url: string; token: string } | null> {
  try {
    const encryptedUrl = await AsyncStorage.getItem(URL_KEY);
    const encryptedToken = await AsyncStorage.getItem(TOKEN_KEY);

    if (encryptedUrl && encryptedToken) {
      const urlBytes = CryptoJS.AES.decrypt(encryptedUrl, SECRET_KEY);
      const tokenBytes = CryptoJS.AES.decrypt(encryptedToken, SECRET_KEY);

      const url = urlBytes.toString(CryptoJS.enc.Utf8);
      const token = tokenBytes.toString(CryptoJS.enc.Utf8);

      if (url && token) {
        return { url, token };
      }
    }
    return null;
  } catch (error) {
    console.error('Error retrieving encrypted token:', error);
    return null;
  }
}