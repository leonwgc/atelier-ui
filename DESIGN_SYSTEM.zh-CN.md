# Atelier UI 设计系统

[English](./DESIGN_SYSTEM.md)

本文定义 Atelier UI 框架无关的视觉与交互契约，可作为未来适配器（包括 Vue 3+ 版本）的参考。本次只补充规范，不新增 Vue 代码，也不改动现有 React 包。

下文的无障碍要求是未来适配器的验收标准，并不表示所有现有 React 模块都已完成相应审计或满足全部要求。

## 事实来源

- 运行时样式和当前 token 值以 [`src/styles/theme.css`](./src/styles/theme.css) 为准。
- [`design-tokens.json`](./design-tokens.json) 是供工具和未来框架适配器使用的机器可读镜像。修改 token 时，请同步更新此文件。
- 模块行为由各公开模块的 TypeScript 属性及其可观察行为定义。下方目录仅用于索引，不替代模块契约。
- 每个模块的样式应能从其独立入口加载。`docs/` 是构建生成目录，不是本规范的源文件目录。

## 设计原则

1. **层次克制。** 紫色主色用于主要操作或选中状态，辅助区域保持中性。
2. **状态可预测。** 交互模块应在适用时清晰呈现悬停、键盘焦点、按下、禁用、加载、错误、选中和展开等状态。
3. **语义优先。** 优先使用原生 HTML 元素及其键盘行为。只有在原生语义无法表达关系或状态时才添加 ARIA。
4. **内容可组合。** 数据和行为通过属性传入；调用方可通过子内容或明确的自定义接缝提供丰富内容。
5. **动效克制。** 动效用于表达进入、层级或反馈；不得阻塞交互，并且必须尊重减少动态效果偏好。
6. **适配器共享契约。** React 与未来的 Vue 模块应共享 token 值和可观察行为，而不是共享框架专属的渲染或状态代码。

## 视觉基础

下列数值是当前运行时 token。CSS 自定义属性是稳定的样式接缝，统一使用 `--at-` 前缀。

### 颜色

| Token | CSS 变量 | 数值 | 用途 |
| --- | --- | --- | --- |
| 主色 | `--at-color-primary` | `#685cf6` | 主要操作、选中状态、焦点强调 |
| 主色悬停态 | `--at-color-primary-hover` | `#5749e5` | 主操作的悬停状态 |
| 浅主色 | `--at-color-primary-soft` | `#f0efff` | 轻量选中或高亮背景 |
| 正文 | `--at-color-text` | `#222438` | 主要内容 |
| 次级文字 | `--at-color-subtle` | `#697087` | 辅助内容 |
| 弱化文字 | `--at-color-muted` | `#9298aa` | 弱化显示的内容 |
| 边框 | `--at-color-border` | `#e4e6ef` | 默认分隔线和轮廓 |
| 强调边框 | `--at-color-border-strong` | `#d1d4e1` | 强调分隔线 |
| 表面 | `--at-color-surface` | `#ffffff` | 组件主表面 |
| 弱化表面 | `--at-color-surface-muted` | `#f7f8fb` | 次级表面 |
| 危险 | `--at-color-danger` | `#d94d64` | 危险操作或无效状态 |
| 成功 | `--at-color-success` | `#2f9472` | 成功状态 |
| 警告 | `--at-color-warning` | `#c98a29` | 警示状态 |

新增样式应使用语义 token，而不是硬编码这些颜色。状态色应传达含义，而不是仅用于装饰。

### 圆角、层次与字体

| Token | CSS 变量 | 数值 |
| --- | --- | --- |
| 小圆角 | `--at-radius-sm` | `8px` |
| 中圆角 | `--at-radius-md` | `11px` |
| 大圆角 | `--at-radius-lg` | `16px` |
| 小阴影 | `--at-shadow-sm` | `0 2px 8px rgb(38 42 75 / 5%)` |
| 弹窗阴影 | `--at-shadow-modal` | `0 24px 80px rgb(28 30 57 / 22%)` |
| 字体栈 | `--at-font` | `'DM Sans', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` |

轻量浮层使用小阴影，较突出的弹窗使用弹窗阴影。当前主题尚未定义统一的间距、字号、行高或 z-index token。在正式引入这些 token 之前，框架移植应保留现有模块的尺寸，不要自行推测或新建一套尺度。

### 动效与焦点

| Token | CSS 变量 | 数值 |
| --- | --- | --- |
| 快速时长 | `--at-motion-fast` | `140ms` |
| 基础时长 | `--at-motion-base` | `200ms` |
| 慢速时长 | `--at-motion-slow` | `280ms` |
| 标准缓动 | `--at-ease-standard` | `cubic-bezier(.2, .7, .2, 1)` |
| 强调缓动 | `--at-ease-emphasized` | `cubic-bezier(.2, .85, .25, 1)` |
| 默认过渡 | `--at-transition` | `var(--at-motion-base) var(--at-ease-standard)` |

键盘焦点使用带主色调的 2px 可见轮廓，并留出 2px 偏移。保留全局 `prefers-reduced-motion: reduce` 行为；模块专属动画不得在用户启用减少动态效果后重新引入较长动画。悬停不能抢夺焦点，也不能造成焦点与关闭逻辑循环。

## 模块目录

以下公开模块按主要用途分组。部分模块会参与多个工作流；分组仅用于查找，不代表依赖关系。

| 分类 | 公开模块 |
| --- | --- |
| 基础与布局 | `Icon`、`Typography`（`Title`、`Text`、`Paragraph`、`Link`）、`Divider`、`Affix`、`Flex`、`Grid`（`GridCol`）、`Layout`（`LayoutHeader`、`LayoutSider`、`LayoutContent`、`LayoutFooter`）、`Space`、`Splitter`（`SplitterPanel`）、`FloatButton`（`FloatButtonGroup`、`BackTop`） |
| 操作与导航 | `Button`、`Anchor`、`Breadcrumb`、`Dropdown`、`Menu`、`Pagination`、`Steps`、`Tabs` |
| 表单与输入 | `AutoComplete`、`Cascader`、`Checkbox`（`CheckboxGroup`）、`ColorPicker`、`DatePicker`、`Input`、`InputNumber`、`InputOTP`、`Mentions`、`Radio`（`RadioGroup`）、`Rate`、`Segmented`、`Select`、`Slider`、`Switch`、`Textarea`、`TimePicker`、`Transfer`、`TreeSelect`、`Upload` |
| 数据展示 | `Avatar`、`Badge`、`Calendar`、`Card`、`Carousel`、`Collapse`、`Descriptions`、`Empty`、`Image`（`ImagePreviewGroup`）、`List`（`ListItem`、`ListItemMeta`）、`Listy`、`Masonry`、`Progress`、`QRCode`、`Skeleton`、`Statistic`（`Countdown`）、`Table`、`Tag`、`Timeline`、`Tree`、`Watermark` |
| 反馈与浮层 | `Alert`、`Drawer`、`Message`、`Modal`、`Notification`、`Popover`、`Popconfirm`、`Result`、`Spin`、`Tooltip`、`Tour` |
| 动效与特效 | `AnimatedList`、`BlurFade`、`BorderBeam`、`Confetti`、`Expand`、`FadeIn`、`FlipCard`、`FlipIn`、`Glow`、`HoverLift`、`Marquee`、`NumberTicker`、`Press`、`Pulse`、`ScaleIn`、`ScrollReveal`、`Shake`、`Shimmer`、`SlideIn`、`Stagger`、`Transition`（`TransitionGroup`）、`TypingAnimation`、`Wobble` |
| 跨模块配置 | `ConfigProvider`（`useConfig`）；表单 Hooks：`useForm`、`useWatch`、`Controller`、`FormProvider`、`useFormContext`、`useFieldArray` |

## 交互契约

以下规则定义框架适配器必须保留的可观察行为。

### 状态与事件

- 受控值由调用方提供的值决定：用户操作通过对应的回调或事件请求变更；适配器不得静默覆盖受控值。
- 如果 React 模块同时支持 `value` 和 `defaultValue`，Vue 版本应通过 `modelValue` / `update:modelValue` 支持受控 `v-model`。只有 React 契约支持非受控模式时，才保留初始值属性。
- 单独受控的浮层状态应将 `open` / `onOpenChange` 映射为 `open` / `update:open`（`v-model:open`）。选项选择状态不能与浮层显隐状态混为一谈。
- 保持事件载荷含义和触发顺序。用值更新事件同步状态；调用方需要获知已提交操作时，应另提供 `change`、`select` 或 `submit` 等领域事件。
- 禁用控件不能响应鼠标或键盘激活。加载中的操作应暴露忙碌状态，并避免重复触发。
- 集合项使用稳定标识。自定义渲染在所有适配器中都应接收一致的条目及状态信息。

### 组合与自定义

- React `children` 映射为 Vue 默认插槽或具名插槽；React 渲染回调映射为带有文档化插槽属性的作用域插槽。
- 数据驱动模块通过属性接收数据模型（例如 `options`、`items` 或 `columns`）。不要用不透明的 HTML 字符串取代结构化数据。
- 若公开接口支持复合组合，应保留该模式，例如 `LayoutHeader` 等布局子模块或列表项元数据；不要为插槽已能表达的内容再增加一套平行配置属性。
- 将 `className` 和 `style` 映射到 Vue 的 `class` 和 `style`。保持 `at-` 类名前缀和 CSS 自定义属性稳定。除非模块另有说明，否则应将透传属性交给同一个语义化根元素。
- 仅在当前公开接口已提供命令式方法时才暴露这些方法。不要用暴露内部状态或实现节点来替代清晰的契约。

### 无障碍与浮层

- 语义适用时使用原生按钮、输入框、链接、列表和标题。为控件关联标签、描述和错误信息。
- 保持键盘可操作、Tab 顺序合理、焦点可见，并按需设置正确的角色和状态（例如 `aria-expanded`、`aria-selected`、`aria-checked`、`aria-busy` 和 `aria-disabled`）。
- 指针从触发器移向菜单或弹层内容时，菜单和弹层应保持打开。悬停可以打开菜单，但不能强制移动焦点；键盘激活时可按该控件文档规定的交互模式移动焦点。
- 对话框类浮层应正确处理焦点进入、焦点约束、关闭和焦点恢复。Tooltip 或悬停弹层不能形成键盘焦点陷阱。
- 以适当方式播报异步反馈；状态不能只通过颜色传达。

## Vue 3+ 转译指南

Vue 版本应作为相同设计契约的适配器，而不是 React 渲染的包装层。

| React 模式 | Vue 3+ 转译方式 |
| --- | --- |
| `value` / `onChange` | `modelValue` 属性和 `update:modelValue` 事件；支持 `v-model` |
| `open` / `onOpenChange` | `open` 属性和 `update:open` 事件；支持 `v-model:open` |
| `children` | 默认插槽 |
| `renderItem(item, state)` | 作用域插槽，例如 `#item="{ item, state }"` |
| Context Provider / Hook | `provide` / `inject` 加组合式函数（composable） |
| 基于 Portal 的弹层 | 使用 `Teleport`，并保留相同的焦点与关闭契约 |
| 命令式 ref 方法 | 通过范围精简的 `defineExpose` 暴露相同的文档化方法 |
| CSS 变量和模块样式 | 复用 `--at-` token 名称，并从 Vue 入口导入样式 |

目标是兼容 Vue 3.0+：使用 `defineComponent` / `setup`、`ref`、`computed`、`watch`、`provide` / `inject` 以及标准插槽和事件。不要依赖 `defineModel` 或较新模板 ref 宏等后续版本才提供的便利功能。只有在浏览器环境中运行时才访问浏览器全局对象，并处理 DOM ref 初始不可用的情况。

框架专属的状态和渲染应保留在各自适配器中。只有当两个实现确实都需要同一段纯计算逻辑时才共享；不要引入一个只负责转发调用的跨框架接缝。本次交付继续保持单一 npm 工程。Vue 实现的发布方式及 peer dependency 隔离应在 Vue 项目范围明确后再决定；不要因为这份规范而让 React 用户被动安装 Vue。

## 移植检查清单

- [ ] 根据 `design-tokens.json` 实现当前 token 集，并保留 CSS 变量名称。
- [ ] 与现有 React 模块的默认值、受控/非受控行为、事件载荷及条目标识保持一致。
- [ ] 为丰富内容和自定义条目渲染提供 Vue 插槽，并记录每个作用域插槽的属性。
- [ ] 匹配语义化 HTML、键盘行为、ARIA 状态、焦点处理和减少动态效果行为。
- [ ] 样式可按模块导入，并保留 `at-` 类名前缀。
- [ ] 通过公开接口验证可观察行为，包括受控状态、键盘交互、浮层、减少动态效果和自定义插槽。
