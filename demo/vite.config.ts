import { defineConfig } from 'vite';
import { exampleSource } from './exampleSource.ts';

export default defineConfig(({ command }) => ({
  root: 'demo',
  plugins: [exampleSource()],
  // The development server stays at /; the built demo is served as a repo site.
  base: command === 'build' ? '/atelier-ui/' : '/',
  server: { host: '0.0.0.0', port: 4000 },
  build: { outDir: '../docs', emptyOutDir: true },
}));
