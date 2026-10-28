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
        'input-otp': resolve(process.cwd(), 'src/entries/input-otp.ts'),
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
        'float-button': resolve(process.cwd(), 'src/entries/float-button.ts'),
        'icon': resolve(process.cwd(), 'src/entries/icon.ts'),
        'typography': resolve(process.cwd(), 'src/entries/typography.ts'),
        'flex': resolve(process.cwd(), 'src/entries/flex.ts'),
        'space': resolve(process.cwd(), 'src/entries/space.ts'),
        'layout': resolve(process.cwd(), 'src/entries/layout.ts'),
        'grid': resolve(process.cwd(), 'src/entries/grid.ts'),
        'affix': resolve(process.cwd(), 'src/entries/affix.ts'),
        'anchor': resolve(process.cwd(), 'src/entries/anchor.ts'),
        'dropdown': resolve(process.cwd(), 'src/entries/dropdown.ts'),
        'auto-complete': resolve(process.cwd(), 'src/entries/auto-complete.ts'),
        'input-number': resolve(process.cwd(), 'src/entries/input-number.ts'),
        'rate': resolve(process.cwd(), 'src/entries/rate.ts'),
        'slider': resolve(process.cwd(), 'src/entries/slider.ts'),
        'time-picker': resolve(process.cwd(), 'src/entries/time-picker.ts'),
        'segmented': resolve(process.cwd(), 'src/entries/segmented.ts'),
        'statistic': resolve(process.cwd(), 'src/entries/statistic.ts'),
        'image': resolve(process.cwd(), 'src/entries/image.ts'),
        'popover': resolve(process.cwd(), 'src/entries/popover.ts'),
        'popconfirm': resolve(process.cwd(), 'src/entries/popconfirm.ts'),
        'result': resolve(process.cwd(), 'src/entries/result.ts'),
        'cascader': resolve(process.cwd(), 'src/entries/cascader.ts'),
        'color-picker': resolve(process.cwd(), 'src/entries/color-picker.ts'),
        'mentions': resolve(process.cwd(), 'src/entries/mentions.ts'),
        'transfer': resolve(process.cwd(), 'src/entries/transfer.ts'),
        'tree-select': resolve(process.cwd(), 'src/entries/tree-select.ts'),
        'calendar': resolve(process.cwd(), 'src/entries/calendar.ts'),
        'carousel': resolve(process.cwd(), 'src/entries/carousel.ts'),
        'list': resolve(process.cwd(), 'src/entries/list.ts'),
        'listy': resolve(process.cwd(), 'src/entries/listy.ts'),
        'masonry': resolve(process.cwd(), 'src/entries/masonry.ts'),
        'qrcode': resolve(process.cwd(), 'src/entries/qrcode.ts'),
        'menu': resolve(process.cwd(), 'src/entries/menu.ts'),
        'tree': resolve(process.cwd(), 'src/entries/tree.ts'),
        'tour': resolve(process.cwd(), 'src/entries/tour.ts'),
        'watermark': resolve(process.cwd(), 'src/entries/watermark.ts'),
        'splitter': resolve(process.cwd(), 'src/entries/splitter.ts'),
        'message': resolve(process.cwd(), 'src/entries/message.ts'),
        'notification': resolve(process.cwd(), 'src/entries/notification.ts'),
        'config-provider': resolve(process.cwd(), 'src/entries/config-provider.ts'),
        'border-beam': resolve(process.cwd(), 'src/entries/border-beam.ts'),
        'marquee': resolve(process.cwd(), 'src/entries/marquee.ts'),
        'number-ticker': resolve(process.cwd(), 'src/entries/number-ticker.ts'),
        'typing-animation': resolve(process.cwd(), 'src/entries/typing-animation.ts'),
        'blur-fade': resolve(process.cwd(), 'src/entries/blur-fade.ts'),
        'shimmer': resolve(process.cwd(), 'src/entries/shimmer.ts'),
        'animated-list': resolve(process.cwd(), 'src/entries/animated-list.ts'),
        'transition': resolve(process.cwd(), 'src/entries/transition.ts'),
        'transition-group': resolve(process.cwd(), 'src/entries/transition-group.ts'),
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
