import { defineConfig } from 'vite';

export default defineConfig({
  root: 'demo',
  // GitHub Pages serves this project under /<repository-name>/.
  base: process.env.GITHUB_ACTIONS === 'true' ? '/ui-design/' : '/',
  server: { host: '0.0.0.0' },
  build: { outDir: '../demo-dist', emptyOutDir: true },
});
