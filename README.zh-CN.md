<div align="center">

# Atelier UI

由 AI 主导设计与架构的 React + TypeScript 组件库，提供统一的设计语言、丰富的交互组件与动画效果，以及交互式文档。

[English](./README.md) · 简体中文

[在线组件手册](https://leonwgc.github.io/ui-design/) · [组件目录](#组件目录) · [本地开发](#本地开发)

</div>

---

## 项目介绍

Atelier UI 是一个从零实现的 React 组件库与配套 Demo 站点。项目使用 TypeScript 编写，组件样式按组件拆分，并支持组件级按需导入；示例站点提供交互演示、完整示例代码和 API 说明。

你好，欢迎来到 Atelier UI。你可以先在在线手册里试试组件交互，再查看完整示例代码，把合适的组件带进自己的项目；无论是搭建界面，还是查找某个组件的用法，都可以从下面的分类目录开始。

设计 token 与跨框架组件契约见设计系统规范：[中文](./DESIGN_SYSTEM.zh-CN.md) · [English](./DESIGN_SYSTEM.md)；机器可读 token 见[`design-tokens.json`](./design-tokens.json)。

项目采用单一 npm 工程，不使用 npm workspaces：

- `src/`：组件库源码、表单 Hooks 与组件样式。
- `demo/`：组件手册和交互示例。
- `docs/`：GitHub Pages 发布目录，由生产构建生成。

## 组件目录

目录与 `src/index.ts` 的公开导出保持一致。

### 基础与布局

| 组件 | 说明 |
| --- | --- |
| Affix 固钉 | 滚动时保持内容在视口内可见 |
| Divider 分割线 | 分隔相关内容 |
| Flex 弹性布局 | 以 Flexbox 属性排列内容 |
| FloatButton 悬浮按钮 | 视口快捷操作，包含 `FloatButtonGroup` 按钮组和 `BackTop` 回到顶部 |
| Grid 栅格 | 基于列数的网格布局，包含 GridCol |
| Icon 图标 | 轻量内联 SVG 图标 |
| Layout 布局 | 组合 `LayoutHeader`、`LayoutSider`、`LayoutContent` 与 `LayoutFooter` |
| Space 间距 | 为相邻元素设置一致间距 |
| Splitter 分隔面板 | 拖动调整相邻 `SplitterPanel` 空间 |
| Typography 排版 | 统一标题、正文、段落与链接层级，包含 `Title`、`Text`、`Paragraph` 和 `Link` |

### 操作与导航

| 组件 | 说明 |
| --- | --- |
| Button 按钮 | 操作按钮、视觉类型、尺寸及加载状态 |
| Anchor 锚点 | 跳转到页面内指定区块 |
| Breadcrumb 面包屑 | 展示层级路径 |
| Dropdown 下拉菜单 | 展示关联操作或导航选项 |
| Menu 导航菜单 | 在菜单项之间切换 |
| Pagination 分页 | 分页导航与页码切换 |
| Steps 步骤条 | 展示流程进度 |
| Tabs 标签页 | 切换同级内容视图 |

### 数据录入

| 组件 | 说明 |
| --- | --- |
| AutoComplete 自动完成 | 输入时提供匹配建议 |
| Cascader 级联选择 | 按层级选择路径 |
| Checkbox 复选框 | 单项及 `CheckboxGroup` 复选框组 |
| ColorPicker 颜色选择器 | 选择并读取颜色值 |
| DatePicker 日期选择 | 选择日期 |
| Input 输入框 | 单行文本输入 |
| InputNumber 数字输入框 | 按范围和步长录入数值 |
| InputOTP 验证码输入 | 输入分段验证码 |
| Mentions 提及 | 在文本中输入成员提及 |
| Radio 单选框 | 单项及 `RadioGroup` 单选框组 |
| Rate 评分 | 通过星级收集评分 |
| Segmented 分段控制器 | 在互斥选项间切换 |
| Select 选择器 | 从下拉选项中选择 |
| Slider 滑动输入条 | 在数值范围内拖动选择 |
| Switch 开关 | 切换两种状态 |
| Textarea 多行输入 | 多行文本输入 |
| TimePicker 时间选择 | 选择本地时间 |
| Transfer 穿梭框 | 在两个列表间移动条目 |
| TreeSelect 树选择 | 从层级选项中选择 |
| Upload 上传 | 选择、拖放与移除文件 |

### 数据展示

| 组件 | 说明 |
| --- | --- |
| Avatar 头像 | 展示用户或对象头像 |
| Badge 徽标 | 展示数量与状态标记 |
| Calendar 日历 | 按月浏览和选择日期 |
| Card 卡片 | 内容容器 |
| Carousel 走马灯 | 轮换展示内容 |
| Collapse 折叠面板 | 按需展开和收起内容 |
| Descriptions 描述列表 | 展示结构化属性 |
| Empty 空状态 | 展示无数据占位 |
| Image 图片 | 展示图片并支持 `ImagePreviewGroup` 预览组 |
| List 列表 | 展示自定义数据行及 `ListItem`、`ListItemMeta` 元数据 |
| Listy 虚拟列表 | 高效展示长列表 |
| Masonry 瀑布流 | 多列排列不同高度的内容 |
| Progress 进度条 | 展示任务进度 |
| QRCode 二维码 | 将文本或链接编码成可扫描二维码 |
| Skeleton 骨架屏 | 内容加载占位 |
| Statistic 统计数值 | 突出展示关键数值，包含倒计时 |
| Table 表格 | 数据表格、分页、排序、筛选与行选择 |
| Tag 标签 | 状态与分类标记 |
| Timeline 时间轴 | 按时间顺序展示事件 |
| Tree 树形控件 | 展示可展开的层级结构 |
| Watermark 水印 | 在内容区域平铺归属标记 |

### 反馈与浮层

| 组件 | 说明 |
| --- | --- |
| Alert 提示 | 页面内状态提示 |
| Drawer 抽屉 | 侧边抽屉面板 |
| Message 全局提示 | 显示轻量操作结果，并提供 `message` 全局调用方法 |
| Modal 弹窗 | 对话框及确认交互 |
| Notification 通知 | 展示带标题和描述的通知卡片，并提供 `notification` 全局调用方法 |
| Popconfirm 气泡确认框 | 就地确认轻量操作 |
| Popover 气泡卡片 | 展示带标题或内容的浮层 |
| Result 结果 | 展示任务状态和后续操作 |
| Spin 加载中 | 局部或页面加载状态 |
| Tooltip 文字提示 | 悬停或聚焦时显示说明 |
| Tour 漫游式引导 | 分步介绍产品功能 |

### 动效与特效

| 组件 | 说明 |
| --- | --- |
| AnimatedList 列表渐入 | 为列表项添加渐入动画，支持自定义列表项 |
| BlurFade 模糊渐入 | 以模糊渐入方式显示内容 |
| BorderBeam 边框流光 | 为重点内容添加动态边框 |
| Confetti 彩纸效果 | 展示庆祝反馈动画 |
| Expand 平滑展开 | 平滑展开或收起内容 |
| FadeIn 淡入 | 为内容添加淡入效果 |
| FlipCard 翻转卡片 | 通过翻转展示卡片背面内容 |
| FlipIn 翻转进入 | 以翻转动画显示内容 |
| Glow 发光 | 添加强调性发光效果 |
| HoverLift 悬停浮起 | 悬停时抬升内容 |
| Marquee 跑马灯 | 循环滚动展示内容 |
| NumberTicker 数字滚动 | 动画展示数值变化 |
| Press 按压反馈 | 为交互内容添加按压效果 |
| Pulse 脉冲 | 循环强调内容 |
| ScaleIn 缩放进入 | 以缩放动画显示内容 |
| ScrollReveal 滚动显现 | 滚动到视口时显示内容 |
| Shake 摇晃 | 通过摇晃提供反馈 |
| Shimmer 流光 | 展示流动高光效果 |
| SlideIn 滑入 | 从指定方向滑入内容 |
| Stagger 交错动画 | 为子项依次添加动画 |
| Transition / TransitionGroup 过渡 | 为元素或列表管理进入、离开状态 |
| TypingAnimation 打字动画 | 逐字显示文本 |
| Wobble 摆动 | 添加轻量摆动效果 |

### 全局配置与工具

`ConfigProvider` 用于配置组件前缀、方向、尺寸、语言和主题变量；`useConfig` 用于读取配置。公开工具函数包括 `formatTime`、`parseTime`、`formatCountdown`、`formatStatistic`、`hsvToRgb`、`parseColor`、`rgbToHsv` 和 `toHex`。


### 浅色与深色主题

文档站右上角的太阳 / 月亮按钮用于切换浅色和深色模式。首次访问跟随系统偏好，手动选择后保存到 localStorage。切换保留当前语言、页面和表单状态。

```tsx
import { ConfigProvider } from 'atelier-ui/config-provider';
import { Button } from 'atelier-ui/button';

export function ThemeExample() {
  return (
    <ConfigProvider colorScheme="dark">
      <Button variant="primary">深色主题</Button>
      <ConfigProvider colorScheme="light"><Button>浅色区域</Button></ConfigProvider>
    </ConfigProvider>
  );
}
```

`colorScheme` 默认继承父级 Provider；未显式配置时，组件继承所在的 CSS 主题，默认是浅色。整站也可以在文档根节点设置 `data-at-theme="dark"` 或 `data-at-theme="light"`。下拉浮层和对话框保留显式配置的主题；`useModal`、`useMessage` 和 `useNotification` 将主题传给独立浮层，未绑定的静态 API 可显式传入 `colorScheme`。自定义主题 token 仍然优先。图片、二维码、取色面板等固有内容颜色保持原样。

### 国际化

所有组件的内置文案和无障碍标签支持简体中文与英文，默认语言为 `zh-CN`。没有内置文案的组件继续渲染调用方提供的内容。显式传入的文案属性优先，包括属性允许的空字符串或 `null`。

```tsx
import { ConfigProvider } from 'atelier-ui/config-provider';
import { createLocale, enUS } from 'atelier-ui/locale';
import { Empty } from 'atelier-ui/empty';

const jaJP = createLocale('ja-JP', {
  'common.noData': 'データがありません',
  'common.ok': '確認',
}, enUS);

export function Example() {
  return (
    <ConfigProvider locale="en-US" locales={{ 'ja-JP': jaJP }}>
      <Empty />
      <ConfigProvider messages={{ 'common.noData': '此区域暂时没有内容' }}>
        <Empty />
      </ConfigProvider>
      <ConfigProvider locale="ja-JP"><Empty /></ConfigProvider>
    </ConfigProvider>
  );
}
```

- `locale`：语言标识，或 `enUS`、`zhCN` 等 `Locale` 对象。
- `locales`：按标识注册扩展语言包。`createLocale(code, messages, base = enUS, formatLocale = code)` 从基础语言包补齐缺失翻译；Intl 不支持的语言标识使用基础语言包的格式化语言。
- `messages`：覆盖当前语言包的部分文案，键名受类型约束。嵌套 Provider 默认继承父级语言、语言包注册表和配置。
- `useLocale()`：读取 `locale`、`formatLocale`、`messages` 和 `t(key, params)`。文案键名及插值参数由导出的 `LocaleKey`、`LocaleMessages`、`LocaleParams` 类型说明，例如 `t('pagination.total', { total: 12 })`。

日历月份和星期、日期标签、默认数字分隔符、数值动画及表格排序跟随格式化语言；原有显式格式化属性仍然优先。原生日期选择界面同时受浏览器与操作系统语言影响。业务标签、内容、自定义校验信息和 schema 错误文案由调用方管理。

独立静态 API 不在调用方的 React 上下文中渲染。请在 Provider 内使用 `useModal()`、`useMessage()`、`useNotification()` 获得绑定语言的 API；也可在 `Modal.confirm`、消息或通知的参数中显式传入 `locale: enUS`。未绑定的静态 API 保持默认中文。`yupResolver(schema, locale)` 的可选第二个参数配置其内置回退错误文案，schema 自带的错误文案保持原样。

文档站右上角提供中英文切换，联动导航、说明、API 表格、示例和外层 ConfigProvider，并将选择保存到 localStorage。切换保留当前页面及表单状态；ConfigProvider 页面的组件语言控件可以显式覆盖整站语言。

### 表单 Hooks

提供 hook-first 的表单状态管理能力，包含 `useForm`、`useWatch`、`Controller`、`FormProvider`、`useFormContext` 和 `useFieldArray`，并提供可选的 Zod、Yup resolver。表单状态通过 Hooks 管理，不提供 `<Form>` 或 `<Form.Item>` 组件。

## 本地开发

环境要求：Node.js `>=20.19.0`。

```bash
npm install
npm run dev
```

开发服务器启动后，终端会显示本地访问地址。

单元测试使用 Vitest、React Testing Library 和 jsdom，不需要启动 Demo 或安装浏览器：

```bash
npm test                 # 一次性运行全部单元测试
npm run test:watch       # 开发时监听运行
npm run test:coverage    # 检查覆盖率并生成 coverage/index.html
```

测试位于 `tests/unit/`，覆盖组件的状态、交互、键盘操作、表单 Hooks 与校验、工具函数、动画计时器和清理行为。覆盖率统计包含全部组件和内部逻辑，排除只做导出的入口及类型声明；最低要求为语句 80%、分支 70%、函数 80%、行 85%。几何尺寸、Canvas 和浏览器观察器在需要时由测试提供模拟，实际布局和样式仍由 Playwright UI 测试验证。

首次运行 UI 测试前，安装 Playwright Chromium 浏览器：

```bash
npx playwright install chromium
npm run test:ui
```

UI 测试会构建生产版 Demo，并检查全部组件样式、导航页面，以及 Rate 和 Transfer 的关键交互。

## 构建与检查

```bash
npm test
npm run typecheck
npm run build
```

`npm run build` 会构建组件库到 `dist/`，并将 Demo 站点构建到 `docs/`。推送 `master` 分支后，GitHub Pages 从 `master /docs` 发布站点。

常用脚本：

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动 Demo 开发服务器 |
| `npm run typecheck` | TypeScript 类型检查 |
| `npm test` | 运行全部单元测试 |
| `npm run test:watch` | 监听运行单元测试 |
| `npm run test:coverage` | 运行单元测试并检查覆盖率 |
| `npm run test:ui` | 运行 Playwright UI 回归测试 |
| `npm run build:lib` | 构建组件库 |
| `npm run build:demo` | 构建 Demo 到 `docs/` |
| `npm run build` | 构建组件库和 Demo |
| `npm run preview` | 本地预览生产构建 |

## 按需导入

每个组件都提供独立入口和对应样式，组件入口会自动加载该组件的 CSS。使用支持 CSS 导入的构建工具（如 Vite、webpack 或 Rspack），按需导入组件即可：

```tsx
import { Button } from 'atelier-ui/button';
import { Table } from 'atelier-ui/table';
import { useForm } from 'atelier-ui/form';
```

包还提供根入口用于集中导入。独立入口适合希望只引入所需组件及其样式的场景。

> 当前项目尚未发布到 npm registry。`package.json` 中的包名和导出路径用于本地构建与后续发布准备。
