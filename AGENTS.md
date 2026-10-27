# Repository Instructions

## Project shape

- This is a single npm project. The React 18 and TypeScript component library is in `src/`; its interactive documentation site is in `demo/`.
- Preserve the one-project layout. Keep reusable components, their documentation pages, and package entry points in their existing directories.

## Component changes

- Implement components as typed React function components. Reuse the existing CSS variables and `cx` helper, and keep each component's styles in `src/styles/<component>.css`.
- Import a component's CSS from its source module so consuming that component loads its styles automatically. Keep the shared theme in `src/styles/theme.css`.
- For each new public component, update `src/index.ts`, add a dedicated `src/entries/<component>.ts`, add its ESM/CJS/type subpath to `package.json`, and register the entry in `vite.lib.config.ts`. Keep the package entry and generated CSS independently loadable.
- Use semantic HTML and accessible names, keyboard behavior, visible focus, and state attributes for interactive controls. Respect reduced-motion preferences for animation.

## Documentation site

- Add each component as its own navigation item under the appropriate category in `demo/main.tsx`; the existing global search is generated from that navigation list.
- Give each component its own page with usage examples and an API reference table. Every `ExampleCard` must include a complete standalone TSX code sample with imports and any required local state.
- Keep example imports aligned with the component's published subpath, such as `atelier-ui/button`.

## Verification

- Before handoff, run `npm run typecheck`, `npm run build`, and `git diff --check` for code changes. Report the commands actually run and their results.
- Review package exports and the demo navigation when adding public components.
