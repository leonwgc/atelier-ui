import { resolve } from 'node:path';
import { defineConfig } from 'vite';

function attachExtractedCss() {
  return {
    name: 'atelier-attach-extracted-css',
    generateBundle(outputOptions: { format?: string }, bundle: Record<string, unknown>) {
      for (const item of Object.values(bundle)) {
        if (!item || typeof item !== 'object' || !('type' in item) || item.type !== 'chunk') continue;
        const chunk = item as unknown as {
          code: string;
          fileName: string;
          modules: Record<string, unknown>;
          viteMetadata?: { importedCss?: Set<string> };
        };
        const cssFiles = chunk.viteMetadata?.importedCss;
        if (!cssFiles?.size) continue;
        const moduleIds = Object.keys(chunk.modules);
        if (!moduleIds.some((id) => /\.tsx?($|\?)/.test(id))) continue;
        const imports = new Set([...cssFiles].map((file) => `./${file}`));
        imports.add('./theme.css');
        if (moduleIds.some((id) => /[/\\]src[/\\](Input|Textarea|Select)\.tsx($|\?)/.test(id))) {
          imports.add('./field.css');
        }
        chunk.code = outputOptions.format === 'es'
          ? `${[...imports].map((file) => `import ${JSON.stringify(file)};`).join('\n')}\n${chunk.code}`
          : `if(typeof document!=="undefined"&&!(typeof process!=="undefined"&&process.versions?.node)){${[...imports].map((file) => `require(${JSON.stringify(file)});`).join('')}}\n${chunk.code}`;
      }
    },
  };
}

export default defineConfig({
  plugins: [attachExtractedCss()],
  build: {
    cssCodeSplit: true,
    lib: {
      entry: {
        index: resolve(process.cwd(), 'src/index.ts'),
        button: resolve(process.cwd(), 'src/entries/button.ts'),
        input: resolve(process.cwd(), 'src/entries/input.ts'),
        textarea: resolve(process.cwd(), 'src/entries/textarea.ts'),
        select: resolve(process.cwd(), 'src/entries/select.ts'),
        checkbox: resolve(process.cwd(), 'src/entries/checkbox.ts'),
        radio: resolve(process.cwd(), 'src/entries/radio.ts'),
        switch: resolve(process.cwd(), 'src/entries/switch.ts'),
        modal: resolve(process.cwd(), 'src/entries/modal.ts'),
        table: resolve(process.cwd(), 'src/entries/table.ts'),
        alert: resolve(process.cwd(), 'src/entries/alert.ts'),
        tag: resolve(process.cwd(), 'src/entries/tag.ts'),
        avatar: resolve(process.cwd(), 'src/entries/avatar.ts'),
        tooltip: resolve(process.cwd(), 'src/entries/tooltip.ts'),
        badge: resolve(process.cwd(), 'src/entries/badge.ts'),
        breadcrumb: resolve(process.cwd(), 'src/entries/breadcrumb.ts'),
        divider: resolve(process.cwd(), 'src/entries/divider.ts'),
        empty: resolve(process.cwd(), 'src/entries/empty.ts'),
        pagination: resolve(process.cwd(), 'src/entries/pagination.ts'),
        progress: resolve(process.cwd(), 'src/entries/progress.ts'),
        skeleton: resolve(process.cwd(), 'src/entries/skeleton.ts'),
        spin: resolve(process.cwd(), 'src/entries/spin.ts'),
        tabs: resolve(process.cwd(), 'src/entries/tabs.ts'),
        card: resolve(process.cwd(), 'src/entries/card.ts'),
        descriptions: resolve(process.cwd(), 'src/entries/descriptions.ts'),
        steps: resolve(process.cwd(), 'src/entries/steps.ts'),
        timeline: resolve(process.cwd(), 'src/entries/timeline.ts'),
        collapse: resolve(process.cwd(), 'src/entries/collapse.ts'),
        'date-picker': resolve(process.cwd(), 'src/entries/date-picker.ts'),
        upload: resolve(process.cwd(), 'src/entries/upload.ts'),
        drawer: resolve(process.cwd(), 'src/entries/drawer.ts'),
        form: resolve(process.cwd(), 'src/entries/form.ts'),
        zodResolver: resolve(process.cwd(), 'src/entries/zodResolver.ts'),
        yupResolver: resolve(process.cwd(), 'src/entries/yupResolver.ts'),
      },
      name: 'AtelierUI',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
      output: {
        globals: { react: 'React', 'react-dom': 'ReactDOM' },
      },
    },
  },
});
