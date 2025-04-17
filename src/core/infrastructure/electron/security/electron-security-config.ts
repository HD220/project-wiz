import { BrowserWindowConstructorOptions, Certificate } from 'electron';
import { URL } from 'node:url';
import { createHash } from 'crypto';

/**
 * Configurações padrão de segurança para janelas do Electron
 */
export const secureWindowConfig: BrowserWindowConstructorOptions = {
  webPreferences: {
    sandbox: true,
    contextIsolation: true,
    webSecurity: true,
    allowRunningInsecureContent: false,
    webgl: false,
    plugins: false,
    experimentalFeatures: false,
    nodeIntegration: false,
    nodeIntegrationInWorker: false,
    nodeIntegrationInSubFrames: false,
    spellcheck: false,
    disableBlinkFeatures: 'Auxclick',
    partition: 'persist:secure-session'
  }
};

/**
 * Valida URLs seguras para carregamento no Electron
 */
export function validateSecureUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'file:';
  } catch {
    return false;
  }
}

/**
 * Sanitiza inputs para handlers IPC
 */
export function sanitizeIpcInput(input: unknown): unknown {
  if (typeof input === 'string') {
    // Remove caracteres potencialmente perigosos
    return input.replace(/[<>"'`]/g, '');
  }
  return input;
}

/**
 * Configurações de segurança para sessões
 */
export const sessionSecurityConfig = {
  cookie: {
    secure: true,
    httpOnly: true,
    sameSite: 'strict'
  },
  certificateVerifyProc: (request: { hostname: string; certificate: Certificate; verificationResult: string; errorCode: number }, callback: (verificationResult: number) => void) => {
    const { hostname, certificate } = request;
    
    // Lista de hashes de certificados confiáveis
    const trustedCertHashes = [
      'SHA256_HASH_DO_CERTIFICADO_1',
      'SHA256_HASH_DO_CERTIFICADO_2'
    ];
    
    const certHash = createHash('sha256')
      .update(certificate.data)
      .digest('hex');
    
    const isTrusted = trustedCertHashes.includes(certHash);
    const isValidForHost = validateHostname(hostname, certificate);
    
    callback(isTrusted && isValidForHost ? 0 : -2); // 0 = sucesso, -2 = falha
  }
};

function validateHostname(hostname: string, certificate: Certificate): boolean {
  // Verifica se o certificado é válido para o hostname
  if (!certificate.issuer || !certificate.subject) {
    return false;
  }
  
  // Implementar lógica de validação de hostname
  return true;
}
}