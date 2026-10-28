# Repository Instructions

## Project shape

- This is a single npm project. The React 18 and TypeScript component library is in `src/`; its interactive documentation site is in `demo/`.
- Preserve the one-project layout. Keep reusable components, their documentation pages, and package entry points in their existing directories.

## Component changes

- Implement components as typed React function components. Reuse the existing CSS variables and `cx` helper, and keep each component's styles in `src/styles/<component>.css`.
- Import a component's CSS from its source module so consuming that component loads its styles automatically. Keep the shared theme in `src/styles/theme.css`.
- For each new public component, update `src/index.ts`, add a dedicated `src/entries/<component>.ts`, add its ESM/CJS/type subpath to `package.json`, and register the entry in `vite.lib.config.ts`. Keep the package entry and generated CSS independently loadable.
- Use semantic HTML and accessible names, keyboard behavior, visible focus, and state attributes for interactive controls. Respect reduced-motion preferences for animation.

## Design system and framework adapters

- For changes to component visuals, interaction behavior, theme tokens, animation, or a future framework port, follow [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) and [`DESIGN_SYSTEM.zh-CN.md`](./DESIGN_SYSTEM.zh-CN.md). These documents define the cross-framework visual, interaction, accessibility, and Vue 3+ translation contract.
- Treat `src/styles/theme.css` as the runtime token source of truth. Keep [`design-tokens.json`](./design-tokens.json) synchronized; preserve the `--at-` CSS variable and class prefixes.
- Preserve controlled state, event meaning, custom-content seams, keyboard behavior, focus handling, and reduced-motion behavior across adapters. The accessibility clauses are acceptance criteria, not an audit claim about every existing component.
- Keep framework-specific rendering and state isolated in adapters. Do not make React consumers depend on Vue unless the package scope explicitly calls for it.

## Documentation site

- Add each component as its own navigation item under the appropriate category in `demo/main.tsx`; the existing global search is generated from that navigation list.
- Give each component its own page with usage examples and an API reference table. Every `ExampleCard` must include a complete standalone TSX code sample with imports and any required local state.
- Keep example imports aligned with the component's published subpath, such as `atelier-ui/button`.
- Keep the public component catalog in `README.md` aligned with exports from `src/index.ts`; update it when public modules are added, removed, or renamed.

## Verification

- Before handoff, run `npm run typecheck`, `npm run build`, and `git diff --check` for code changes. Report the commands actually run and their results.
- Review package exports and the demo navigation when adding public components.
