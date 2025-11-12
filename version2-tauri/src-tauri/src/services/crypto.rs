use aes_gcm::{
    aead::{Aead, AeadCore, KeyInit, OsRng},
    Aes256Gcm, Nonce,
};
use crate::errors::AppError;

/// Encrypt plaintext using AES-256-GCM
///
/// Returns ciphertext format: [nonce (12 bytes)][encrypted data + auth tag]
pub fn encrypt(plaintext: &str, key: &[u8]) -> Result<Vec<u8>, AppError> {
    // Validate key length (must be 32 bytes for AES-256)
    if key.len() != 32 {
        return Err(AppError::Encryption);
    }

    // Create cipher instance
    let cipher = Aes256Gcm::new_from_slice(key)
        .map_err(|_| AppError::Encryption)?;

    // Generate random nonce (12 bytes for GCM)
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);

    // Encrypt data
    let ciphertext = cipher
        .encrypt(&nonce, plaintext.as_bytes())
        .map_err(|_| AppError::Encryption)?;

    // Combine nonce + ciphertext
    let mut result = Vec::with_capacity(nonce.len() + ciphertext.len());
    result.extend_from_slice(&nonce);
    result.extend_from_slice(&ciphertext);

    Ok(result)
}

/// Decrypt ciphertext using AES-256-GCM
///
/// Expects input format: [nonce (12 bytes)][encrypted data + auth tag]
pub fn decrypt(ciphertext: &[u8], key: &[u8]) -> Result<String, AppError> {
    // Validate key length
    if key.len() != 32 {
        return Err(AppError::Encryption);
    }

    // Validate minimum ciphertext length (nonce + at least some data)
    if ciphertext.len() < 12 {
        return Err(AppError::Encryption);
    }

    // Create cipher instance
    let cipher = Aes256Gcm::new_from_slice(key)
        .map_err(|_| AppError::Encryption)?;

    // Extract nonce (first 12 bytes)
    let (nonce_bytes, encrypted_data) = ciphertext.split_at(12);
    let nonce = Nonce::from_slice(nonce_bytes);

    // Decrypt data
    let plaintext_bytes = cipher
        .decrypt(nonce, encrypted_data)
        .map_err(|_| AppError::Encryption)?;

    // Convert to UTF-8 string
    String::from_utf8(plaintext_bytes)
        .map_err(|_| AppError::Encryption)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encrypt_decrypt() {
        let key = b"12345678901234567890123456789012"; // 32 bytes
        let plaintext = "Hello, World!";

        let encrypted = encrypt(plaintext, key).unwrap();
        let decrypted = decrypt(&encrypted, key).unwrap();

        assert_eq!(plaintext, decrypted);
    }

    #[test]
    fn test_invalid_key_length() {
        let key = b"short"; // Invalid length
        let plaintext = "Hello";

        assert!(encrypt(plaintext, key).is_err());
    }

    #[test]
    fn test_decrypt_with_wrong_key() {
        let key1 = b"12345678901234567890123456789012";
        let key2 = b"09876543210987654321098765432109";
        let plaintext = "Secret message";

        let encrypted = encrypt(plaintext, key1).unwrap();
        assert!(decrypt(&encrypted, key2).is_err());
    }

    #[test]
    fn test_decrypt_invalid_ciphertext() {
        let key = b"12345678901234567890123456789012";
        let invalid_ciphertext = b"short"; // Too short

        assert!(decrypt(invalid_ciphertext, key).is_err());
    }
}
