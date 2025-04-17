import { Plugin } from 'vite';
import crypto from 'crypto';

interface NonceContext {
  nonce?: string;
}

export default function noncePlugin(): Plugin {
  return {
    name: 'vite-plugin-nonce',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Gerar nonce único para cada requisição
        const nonce = crypto.randomBytes(16).toString('base64');
        
        // Adicionar nonce ao contexto local
        (res.locals as NonceContext).nonce = nonce;
        next();
      });
    },
    transformIndexHtml(html, ctx) {
      const nonce = (ctx.server?.res?.locals as NonceContext)?.nonce;
      if (!nonce) return html;

      // Substituir placeholder __NONCE__ pelo valor gerado
      return html
        .replace(/__NONCE__/g, nonce);
    }
  };
}