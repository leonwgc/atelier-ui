<div align="center">

# Atelier UI

### 面向 React 18 的 TypeScript 组件库

为产品界面精心打磨的组件、表单 Hooks 与交互式组件手册。

[在线组件手册](https://leonwgc.github.io/ui-design/) · [组件目录](#组件目录) · [本地开发](#本地开发)

</div>

---

## 项目介绍

Atelier UI 是一个从零实现的 React 组件库与配套 Demo 站点。项目使用 TypeScript 编写，组件样式按组件拆分，并支持组件级按需导入；示例站点提供交互演示、完整示例代码和 API 说明。

你好，欢迎来到 Atelier UI。你可以先在在线手册里试试组件交互，再查看完整示例代码，把合适的组件带进自己的项目；无论是搭建界面，还是查找某个组件的用法，都可以从下面的分类目录开始。

项目采用单一 npm 工程，不使用 npm workspaces：

- `src/`：组件库源码、表单 Hooks 与组件样式。
- `demo/`：组件手册和交互示例。
- `docs/`：GitHub Pages 发布目录，由生产构建生成。

## 组件目录

### 基础组件

| 组件 | 说明 |
| --- | --- |
| [Button 按钮](https://leonwgc.github.io/ui-design/) | 操作按钮、视觉类型、尺寸及加载状态 |

### 数据录入

| 组件 | 说明 |
| --- | --- |
| Input 输入框 | 单行文本输入 |
| Textarea 多行输入 | 多行文本输入 |
| Select 选择器 | 下拉选择 |
| Checkbox 复选框 | 单项及复选框组 |
| Radio 单选框 | 单项及单选框组 |
| Switch 开关 | 二态切换 |
| DatePicker 日期选择 | 日期选择与格式化 |
| Upload 上传 | 文件选择与上传状态展示 |

### 反馈组件

| 组件 | 说明 |
| --- | --- |
| Alert 提示 | 页面内状态提示 |
| Modal 弹窗 | 对话框及确认交互 |
| Drawer 抽屉 | 侧边抽屉面板 |
| Tooltip 文字提示 | 悬停或聚焦时显示说明 |
| Progress 进度条 | 任务进度展示 |
| Spin 加载中 | 局部或页面加载状态 |
| Skeleton 骨架屏 | 内容加载占位 |

### 数据展示

| 组件 | 说明 |
| --- | --- |
| Table 表格 | 数据表格、分页、排序、筛选与行选择 |
| Tag 标签 | 状态与分类标记 |
| Avatar 头像 | 用户或对象头像 |
| Badge 徽标 | 数量与状态徽标 |
| Descriptions 描述列表 | 结构化属性展示 |
| Timeline 时间轴 | 按时间顺序展示事件 |

### 导航组件

| 组件 | 说明 |
| --- | --- |
| Breadcrumb 面包屑 | 层级路径导航 |
| Tabs 标签页 | 同级内容切换 |
| Pagination 分页 | 分页导航与页码切换 |
| Steps 步骤条 | 流程步骤展示 |

### 布局与占位

| 组件 | 说明 |
| --- | --- |
| Card 卡片 | 内容容器 |
| Divider 分割线 | 内容分隔 |
| Collapse 折叠面板 | 可展开与收起的内容区域 |
| Empty 空状态 | 无数据时的占位展示 |

### 表单 Hooks

提供 hook-first 的表单状态管理能力，包含 `useForm`、`useWatch`、`Controller`、`FormProvider`、`useFormContext` 和 `useFieldArray`，并提供可选的 Zod、Yup resolver。表单状态通过 Hooks 管理，不提供 `<Form>` 或 `<Form.Item>` 组件。

## 本地开发

环境要求：Node.js `>=20.19.0`。

```bash
npm install
npm run dev
```

开发服务器启动后，终端会显示本地访问地址。

## 构建与检查

```bash
npm run typecheck
npm run build
```

`npm run build` 会构建组件库到 `dist/`，并将 Demo 站点构建到 `docs/`。推送 `master` 分支后，GitHub Pages 从 `master /docs` 发布站点。

常用脚本：

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动 Demo 开发服务器 |
| `npm run typecheck` | TypeScript 类型检查 |
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
