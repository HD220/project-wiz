import { describe, it, expect } from 'vitest';
import type { Plugin } from 'vite';
import noncePlugin from '../../vite.nonce-plugin.mts';

interface NonceContext {
  nonce?: string;
}

interface MockResponse {
  locals: NonceContext;
}

interface MockServer {
  middlewares: {
    use: (fn: (req: any, res: MockResponse, next: () => void) => void) => void;
  };
}

describe('vite-nonce-plugin', () => {
  const plugin = noncePlugin() as Plugin & {
    configureServer: (server: MockServer) => void;
    transformIndexHtml: (html: string, ctx: any) => string;
  };

  it('should generate unique nonces for each request', () => {
    const res1: MockResponse = { locals: {} };
    const res2: MockResponse = { locals: {} };
    const mockServer: MockServer = {
      middlewares: {
        use: (middleware) => {
          middleware({}, res1, () => {});
          middleware({}, res2, () => {});
        }
      }
    };

    plugin.configureServer(mockServer);
    
    expect(res1.locals.nonce).toBeDefined();
    expect(res2.locals.nonce).toBeDefined();
    expect(res1.locals.nonce).not.toBe(res2.locals.nonce);
  });

  it('should replace __NONCE__ placeholder in HTML', () => {
    const html = '<script nonce="__NONCE__"></script>';
    const ctx = { 
      server: { 
        res: { 
          locals: { nonce: 'test-nonce' } 
        } 
      } 
    };

    const result = plugin.transformIndexHtml(html, ctx);
    expect(result).toContain('nonce="test-nonce"');
    expect(result).not.toContain('__NONCE__');
  });

  it('should return original HTML if no nonce is available', () => {
    const html = '<div>Test</div>';
    const result = plugin.transformIndexHtml(html, {});
    expect(result).toBe(html);
  });
});