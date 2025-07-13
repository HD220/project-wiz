import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { app } from 'electron';

const ALGORITHM = 'aes-256-gcm';
const KEY_FILE = 'master.key';

export class EncryptionService {
  private masterKey: Buffer | null = null;

  constructor() {
    this.initializeMasterKey();
  }

  private getKeyPath(): string {
    const userDataPath = app.getPath('userData');
    return path.join(userDataPath, KEY_FILE);
  }

  private initializeMasterKey(): void {
    const keyPath = this.getKeyPath();
    
    try {
      if (fs.existsSync(keyPath)) {
        // Load existing master key
        this.masterKey = fs.readFileSync(keyPath);
      } else {
        // Generate new master key
        this.masterKey = crypto.randomBytes(32);
        
        // Ensure directory exists
        const dir = path.dirname(keyPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        // Save master key with restricted permissions
        fs.writeFileSync(keyPath, this.masterKey, { mode: 0o600 });
      }
    } catch (error) {
      console.error('Failed to initialize master key:', error);
      throw new Error('Failed to initialize encryption service');
    }
  }

  encrypt(plaintext: string): string {
    if (!this.masterKey) {
      throw new Error('Master key not initialized');
    }

    try {
      // Generate random initialization vector
      const iv = crypto.randomBytes(16);
      
      // Create cipher
      const cipher = crypto.createCipheriv(ALGORITHM, this.masterKey, iv);
      cipher.setAAD(Buffer.from('api-key'));
      
      // Encrypt the plaintext
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Get authentication tag
      const authTag = cipher.getAuthTag();
      
      // Combine IV + Auth Tag + Encrypted Data
      const result = iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
      return result;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  decrypt(encryptedData: string): string {
    if (!this.masterKey) {
      throw new Error('Master key not initialized');
    }

    try {
      // Split the encrypted data
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];
      
      // Create decipher
      const decipher = crypto.createDecipheriv(ALGORITHM, this.masterKey, iv);
      decipher.setAAD(Buffer.from('api-key'));
      decipher.setAuthTag(authTag);
      
      // Decrypt the data
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  // Utility method to check if a string is encrypted
  isEncrypted(data: string): boolean {
    return data.includes(':') && data.split(':').length === 3;
  }

  // Method to rotate master key (for security purposes)
  rotateMasterKey(): void {
    const keyPath = this.getKeyPath();
    
    try {
      // Generate new master key
      this.masterKey = crypto.randomBytes(32);
      
      // Save new master key
      fs.writeFileSync(keyPath, this.masterKey, { mode: 0o600 });
      
      console.log('Master key rotated successfully');
    } catch (error) {
      console.error('Failed to rotate master key:', error);
      throw new Error('Failed to rotate master key');
    }
  }
}