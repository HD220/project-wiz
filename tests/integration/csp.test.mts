import { describe, it, expect, vi } from 'vitest';
import { createServer } from 'vite';
import path from 'path';
import { readFile } from 'fs/promises';

describe('CSP Integration', () => {
  it('should inject valid nonce into CSP header', async () => {
    const server = await createServer({
      configFile: path.resolve(__dirname, '../../vite.renderer.config.mts'),
      root: path.resolve(__dirname, '../../'),
    });

    await server.listen();
    
    try {
      const response = await fetch(`http://localhost:${server.config.server.port}`);
      const cspHeader = response.headers.get('content-security-policy');
      
      expect(cspHeader).toBeDefined();
      expect(cspHeader).toMatch(/nonce-[a-zA-Z0-9+/]+={0,2}/);
    } finally {
      await server.close();
    }
  });

  it('should replace __NONCE__ in HTML with valid nonce', async () => {
    const server = await createServer({
      configFile: path.resolve(__dirname, '../../vite.renderer.config.mts'),
      root: path.resolve(__dirname, '../../'),
    });

    await server.listen();
    
    try {
      const response = await fetch(`http://localhost:${server.config.server.port}`);
      const html = await response.text();
      
      expect(html).not.toContain('__NONCE__');
      expect(html).toMatch(/nonce="[a-zA-Z0-9+/]+={0,2}"/);
    } finally {
      await server.close();
    }
  });
});