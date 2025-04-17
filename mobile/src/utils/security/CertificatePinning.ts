import axios from 'axios';
import { createHash } from 'crypto';

interface PinnedCertificates {
  [domain: string]: string[]; // Array de hashes de certificados válidos
}

const PINNED_CERTIFICATES: PinnedCertificates = {
  'api.example.com': [
    'SHA256_HASH_DO_CERTIFICADO_PRIMARIO',
    'SHA256_HASH_DO_CERTIFICADO_SECUNDARIO'
  ]
};

export const configureCertificatePinning = () => {
  axios.interceptors.request.use(async (config) => {
    if (!config.url) return config;

    try {
      const domain = new URL(config.url).hostname;
      const pinnedHashes = PINNED_CERTIFICATES[domain];

      if (pinnedHashes) {
        config.httpsAgent = new (require('https').Agent)({
          checkServerIdentity: (host: string, cert: any) => {
            const certHash = createHash('sha256')
              .update(cert.raw.toString())
              .digest('hex');
            
            if (!pinnedHashes.includes(certHash)) {
              throw new Error(`Certificate pinning failed for ${host}`);
            }
          }
        });
      }
    } catch (error) {
      console.error('Certificate pinning error:', error);
      throw error;
    }

    return config;
  });
};