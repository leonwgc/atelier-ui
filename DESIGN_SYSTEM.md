# Atelier UI Design System

[简体中文](./DESIGN_SYSTEM.zh-CN.md)

This document defines the framework-neutral visual and interaction contract for Atelier UI. It is the reference for future adapters, including a Vue 3+ implementation; React and future adapters share the same design contract.

Accessibility rules below are acceptance criteria for future adapters, not an audit claim that every existing React module already satisfies them.

## Source of truth

- Runtime styles and the current token values live in [`src/styles/theme.css`](./src/styles/theme.css).
- [`design-tokens.json`](./design-tokens.json) is a machine-readable mirror for tooling and future framework adapters. Keep it synchronized when a token changes.
- Component behavior is defined by each public component's TypeScript props and observable behavior. The catalog below is an inventory, not a replacement for those contracts.
- Component styles remain independently loadable from their component entry. `docs/` is generated output and is not a source location for this specification.

## Visual language

Atelier UI uses neutral surfaces, near-black primary actions, semantic status colors, and compact controls. Components and documentation share the runtime tokens in `src/styles/theme.css`.

| Visual element | Components | Design rules |
| --- | --- | --- |
| Main and secondary actions | `Button`, same variants and callbacks | Near-black primary, outlined secondary, 500 weight, 32/40/48px heights |
| Inputs and selection | `Input`, `Textarea`, shared selector | 14px default text, 6px radius, semantic focus/error rings |
| Data rows | `Table` | Neutral dividers, 14px text, 16px horizontal padding, aqua hover |
| Dialogs and popups | Existing overlay components | Neutral surface, shared elevation, token masks |
| Links and status | `Typography`, `Alert`, `Tag` | Info blue distinct from brand; positive/notice/negative semantics |
| Documentation | Existing navigation, search, pages and examples | Same runtime tokens in light and dark modes, Inter font stack |

The `--at-` variables, published APIs, custom content, controlled state, locale behavior, and per-component imports define the component contract. Themes are configured through Atelier providers and hooks. Dark mode uses semantic color mappings. Success and warning text use darker palette steps for readable small text; status accents remain available for icons and fills. Explicit user-selected colors, color-picker spectra, image content, and example syntax colors retain their meaning.

## Design principles

1. **Quiet hierarchy.** Use the near-black primary color for the main action or selected state; use the independent info token for links; keep supporting surfaces neutral.
2. **Predictable states.** Interactive modules expose clear hover, focus-visible, active, disabled, loading, error, selected, and open states where relevant.
3. **Semantic first.** Prefer native HTML elements and native keyboard behavior. Add ARIA only to express relationships or states that native semantics do not provide.
4. **Composable content.** Keep data and behavior in props; allow callers to supply rich content through children or an explicit customization seam.
5. **Motion with restraint.** Motion communicates entry, hierarchy, or feedback; it must not block interaction and must respect reduced-motion preferences.
6. **Framework adapters, shared contract.** React and future Vue modules should share token values and observable behavior, not framework-specific rendering or state code.

## Visual foundations

The values below are the current runtime tokens. CSS custom properties are the stable styling seam and use the `--at-` prefix.

### Color

| Token | CSS variable | Value | Intended use |
| --- | --- | --- | --- |
| Primary | `--at-color-primary` | `#00131c` | Primary actions, selected states, focus accent |
| Primary hover | `--at-color-primary-hover` | `#49565d` | Hovered primary actions |
| Primary soft | `--at-color-primary-soft` | `#f6f7f7` | Subtle selected or highlighted surfaces |
| Text | `--at-color-text` | `#00131c` | Main content |
| Subtle text | `--at-color-subtle` | `#647075` | Supporting content |
| Muted text | `--at-color-muted` | `#929a9e` | De-emphasized content |
| Border | `--at-color-border` | `#b6bcbe` | Default separators and outlines |
| Strong border | `--at-color-border-strong` | `#929a9e` | Emphasized separators |
| Surface | `--at-color-surface` | `#ffffff` | Main component surface |
| Muted surface | `--at-color-surface-muted` | `#f6f7f7` | Secondary surface |
| Danger | `--at-color-danger` | `#e23a3a` | Destructive or invalid state |
| Success | `--at-color-success` | `#2abd13` | Successful state |
| Warning | `--at-color-warning` | `#efa610` | Caution state |

Use semantic tokens rather than hard-coding these values in new styles. A status color should communicate meaning, not decoration.

### Theme modes

The color table lists light-mode defaults. `src/styles/theme.css` also defines a dark palette selected by `data-at-theme="dark"`; an explicit `data-at-theme="light"` resets a nested region to the light palette. `design-tokens.json` records dark variants as `darkValue` on the same tokens. `--at-color-info` is the informational accent and `--at-color-on-accent` is readable foreground text on filled accent controls. Preserve these semantic roles rather than inverting rendered colors.

`ConfigProvider.colorScheme` accepts `light` or `dark` and inherits when omitted. Portals preserve an explicit scheme; standalone APIs accept a scheme or use their provider-bound hooks. Custom token overrides remain authoritative. Native controls use CSS `color-scheme`; intrinsic image and color-picker content is not recolored. The documentation follows system preference until a manual choice is saved, and initializes the document theme before rendering to avoid a light flash.

### Shape, depth, and type

| Token | CSS variable | Value |
| --- | --- | --- |
| Small radius | `--at-radius-sm` | `4px` |
| Medium radius | `--at-radius-md` | `6px` |
| Large radius | `--at-radius-lg` | `6px` |
| Small shadow | `--at-shadow-sm` | `0 0.3px 1.8px 0 rgb(0 0 0 / 10%), 0 1.6px 7.2px 0 rgb(0 0 0 / 13%)` |
| Modal shadow | `--at-shadow-modal` | `0 1.2px 7.2px 0 rgb(0 0 0 / 10%), 0 6.4px 28.8px 0 rgb(0 0 0 / 13%)` |
| Font stack | `--at-font` | `Inter, 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif` |

Use the small shadow for lightweight elevation and the modal shadow for prominent overlays. The theme defines spacing (4/8/12/16/24px), body type (12/14/16px), a 1.5 line height, medium weight (500), and control heights (32/40/48px). Z-index remains component-specific. Preserve existing interaction contracts when adapting these values.

### Motion and focus

| Token | CSS variable | Value |
| --- | --- | --- |
| Fast duration | `--at-motion-fast` | `110ms` |
| Base duration | `--at-motion-base` | `150ms` |
| Slow duration | `--at-motion-slow` | `240ms` |
| Standard easing | `--at-ease-standard` | `cubic-bezier(.4, 0, .2, 1)` |
| Emphasized easing | `--at-ease-emphasized` | `cubic-bezier(0, 0, .2, 1)` |
| Default transition | `--at-transition` | `var(--at-motion-base) var(--at-ease-standard)` |

Keyboard focus uses a visible 2px primary-color outline with a 2px offset. Select uses the shared focus ring and emphasized border without an additional outline to avoid stacked rings; forced-colors mode retains an explicit outline. Preserve the global `prefers-reduced-motion: reduce` behavior; component-specific animation must not reintroduce long motion when the preference is active. Hover must not steal focus or create a focus/close loop.

## Component inventory

These public modules are grouped by their primary job. Some modules appear in more than one workflow; this grouping is for discovery, not a dependency hierarchy.

| Family | Public modules |
| --- | --- |
| Foundation and layout | `Icon`, `Typography` (`Title`, `Text`, `Paragraph`, `Link`), `Divider`, `Affix`, `Flex`, `Grid` (`GridCol`), `Layout` (`LayoutHeader`, `LayoutSider`, `LayoutContent`, `LayoutFooter`), `Space`, `Splitter` (`SplitterPanel`), `FloatButton` (`FloatButtonGroup`, `BackTop`) |
| Actions and navigation | `Button`, `Anchor`, `Breadcrumb`, `Dropdown`, `Menu`, `Pagination`, `Steps`, `Tabs` |
| Form and input | `AutoComplete`, `Cascader`, `Checkbox` (`CheckboxGroup`), `ColorPicker`, `DatePicker`, `Input`, `InputNumber`, `InputOTP`, `Mentions`, `Radio` (`RadioGroup`), `Rate`, `Segmented`, `Select`, `Slider`, `Switch`, `Textarea`, `TimePicker`, `Transfer`, `TreeSelect`, `Upload` |
| Data display | `Avatar`, `Badge`, `Calendar`, `Card`, `Carousel`, `Collapse`, `Descriptions`, `Empty`, `Image` (`ImagePreviewGroup`), `List` (`ListItem`, `ListItemMeta`), `Listy`, `Masonry`, `Progress`, `QRCode`, `Skeleton`, `Statistic` (`Countdown`), `Table`, `Tag`, `Timeline`, `Tree`, `Watermark` |
| Feedback and overlays | `Alert`, `Drawer`, `Message`, `Modal`, `Notification`, `Popover`, `Popconfirm`, `Result`, `Spin`, `Tooltip`, `Tour` |
| Motion and effects | `AnimatedList`, `BlurFade`, `BorderBeam`, `Confetti`, `Expand`, `FadeIn`, `FlipCard`, `FlipIn`, `Glow`, `HoverLift`, `Marquee`, `NumberTicker`, `Press`, `Pulse`, `ScaleIn`, `ScrollReveal`, `Shake`, `Shimmer`, `SlideIn`, `Stagger`, `Transition` (`TransitionGroup`), `TypingAnimation`, `Wobble` |
| Cross-cutting configuration | `ConfigProvider` (`useConfig`); form hooks `useForm`, `useWatch`, `Controller`, `FormProvider`, `useFormContext`, `useFieldArray` |

## Interaction contract

These rules describe observable behavior that a framework adapter must preserve.

### State and events

- A controlled value is authoritative: user interaction requests a change through the corresponding callback/event; the adapter does not silently replace the supplied value.
- Where a React module supports both `value` and `defaultValue`, Vue should expose `modelValue` / `update:modelValue` for controlled `v-model` use. Keep an initial-value prop only when the React contract has an uncontrolled mode.
- A separately controlled popup state maps `open` / `onOpenChange` to `open` / `update:open` (`v-model:open`). Do not conflate selection changes with popup visibility changes.
- Preserve event payload meaning and ordering. Use a value-update event for state synchronization and a separate domain event such as `change`, `select`, or `submit` when callers need the committed action.
- Disabled controls do not activate from pointer or keyboard input. Loading actions expose their busy state and prevent duplicate activation.
- Collections use stable item identity. Custom item rendering must receive the same item and state information in every adapter.

### Composition and customization

- React `children` become Vue default or named slots; React render callbacks become scoped slots with documented slot props.
- Data-driven modules keep their data model as props (for example `options`, `items`, or `columns`). Do not replace structured data with opaque HTML strings.
- Preserve compound composition where it is part of the public interface, such as `Layout.Header`-style submodules or list item metadata; avoid adding parallel configuration props for content already expressible through slots.
- Map `className` and `style` to Vue `class` and `style`. Keep the `at-` class prefix and CSS custom properties stable. Forward attributes to the same semantic root element unless the module documents otherwise.
- Expose imperative methods only when the current public interface already provides them. Do not expose internal state or implementation nodes as a substitute for a clear contract.

### Localization

Built-in text and accessible labels use the typed locale catalog in `src/locale/`. `ConfigProvider` selects a language pack, inherits missing configuration from its parent, and accepts message overrides and custom packs. Preserve explicit component text props and the default `zh-CN` behavior. Calendar and numeric formatting follow the pack's `formatLocale`. React portals preserve the locale context and expose `lang`; standalone APIs require a bound hook or an explicit locale. Adapters must preserve these precedence and fallback rules without translating application-owned data.

### Accessibility and overlays

- Use native buttons, inputs, links, lists, and headings whenever their semantics fit. Associate labels, descriptions, and errors with their controls.
- Maintain keyboard operation, logical tab order, visible focus, and appropriate roles/states (`aria-expanded`, `aria-selected`, `aria-checked`, `aria-busy`, and `aria-disabled` as applicable).
- Menus and popups remain open while the pointer moves between their trigger and content. Hover can open a menu, but must not force focus; keyboard activation may move focus according to the widget's documented pattern.
- Dialog-like overlays must preserve focus entry, containment, dismissal, and restoration behavior. A tooltip or hover popup must not become a keyboard trap.
- Announce asynchronous feedback appropriately and do not communicate status with color alone.

## Vue 3+ translation guide

The Vue version should be an Adapter for the same design contract, not a wrapper around React rendering.

| React pattern | Vue 3+ translation |
| --- | --- |
| `value` / `onChange` | `modelValue` prop and `update:modelValue` event; support `v-model` |
| `open` / `onOpenChange` | `open` prop and `update:open` event; support `v-model:open` |
| `children` | Default slot |
| `renderItem(item, state)` | Scoped slot such as `#item="{ item, state }"` |
| Context provider / hook | `provide` / `inject` plus a composable |
| Portal-based popup | `Teleport`, preserving the same focus and dismissal contract |
| Imperative ref methods | A narrow `defineExpose` surface with the same documented methods |
| CSS variables and component styles | Reuse the `--at-` token names and import styles from the Vue entry |

Target Vue 3.0+ compatibility: use `defineComponent`/`setup`, `ref`, `computed`, `watch`, `provide`/`inject`, and standard slots/emits. Do not require later-only conveniences such as `defineModel` or newer template-ref macros. Access browser globals only when the module is running in the browser, and handle initially unavailable DOM refs.

Keep framework-specific state and rendering in their own adapters. Share pure calculations only when both implementations genuinely need the same logic; do not introduce a cross-framework seam that merely forwards calls. The current repository remains a single npm project for this deliverable. Decide Vue package publication and peer-dependency isolation when the Vue implementation is scoped; do not make React consumers install Vue as a side effect of this specification.

## Porting checklist

- [ ] Implement the current token set from `design-tokens.json` and preserve CSS variable names.
- [ ] Match the existing React module's defaults, controlled/uncontrolled behavior, event payloads, and item identity.
- [ ] Provide Vue slots for rich content and custom item rendering; document each scoped slot's props.
- [ ] Match semantic HTML, keyboard behavior, ARIA state, focus handling, and reduced-motion behavior.
- [ ] Keep styles importable per module and retain the `at-` class prefix.
- [ ] Test observable behavior through the public interface, including controlled state, keyboard interaction, overlays, reduced motion, and custom slots.
