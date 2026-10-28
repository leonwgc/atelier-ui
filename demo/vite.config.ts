import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  root: 'demo',
  // The development server stays at /; the built demo is served as a repo site.
  base: command === 'build' ? '/ui-design/' : '/',
  server: { host: '0.0.0.0', port: 4000 },
  build: { outDir: '../docs', emptyOutDir: true },
}));
