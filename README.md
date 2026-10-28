<div align="center">

# Atelier UI

### 面向 React 的 TypeScript 组件库

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
| Button 按钮 | 操作按钮、视觉类型、尺寸及加载状态 |
| FloatButton 悬浮按钮 | 固定在视口边缘的快捷操作 |
| Icon 图标 | 轻量内联 SVG 图标 |
| Typography 排版 | 统一标题、正文与辅助文本层级 |

### 布局组件

| 组件 | 说明 |
| --- | --- |
| Affix 固钉 | 滚动时保持内容在视口内可见 |
| Divider 分割线 | 分隔相关内容 |
| Flex 弹性布局 | 以 Flexbox 属性排列内容 |
| Grid 栅格 | 基于列数的网格布局 |
| Layout 布局 | 组合页头、侧栏、内容区与页脚 |
| Masonry 瀑布流 | 多列排列不同高度的卡片 |
| Space 间距 | 为相邻元素设置一致间距 |
| Splitter 分隔面板 | 拖动调整相邻面板空间 |

### 导航组件

| 组件 | 说明 |
| --- | --- |
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
| Checkbox 复选框 | 单项及复选框组 |
| ColorPicker 颜色选择器 | 选择并读取颜色值 |
| DatePicker 日期选择 | 选择日期 |
| Input 输入框 | 单行文本输入 |
| InputNumber 数字输入框 | 按范围和步长录入数值 |
| Mentions 提及 | 在文本中输入成员提及 |
| Radio 单选框 | 单项及单选框组 |
| Rate 评分 | 通过星级收集评分 |
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
| Image 图片 | 展示图片并支持预览 |
| List 列表 | 展示自定义数据行 |
| Listy 虚拟列表 | 高效展示长列表 |
| Popover 气泡卡片 | 展示带标题或内容的浮层 |
| QRCode 二维码 | 将文本或链接编码成可扫描二维码 |
| Segmented 分段控制器 | 在互斥选项间切换 |
| Statistic 统计数值 | 突出展示关键数值 |
| Table 表格 | 数据表格、分页、排序、筛选与行选择 |
| Tag 标签 | 状态与分类标记 |
| Timeline 时间轴 | 按时间顺序展示事件 |
| Tooltip 文字提示 | 悬停或聚焦时显示说明 |
| Tree 树形控件 | 展示可展开的层级结构 |

### 反馈组件

| 组件 | 说明 |
| --- | --- |
| Alert 提示 | 页面内状态提示 |
| Drawer 抽屉 | 侧边抽屉面板 |
| Message 全局提示 | 显示轻量操作结果 |
| Modal 弹窗 | 对话框及确认交互 |
| Notification 通知 | 展示带标题和描述的通知卡片 |
| Popconfirm 气泡确认框 | 就地确认轻量操作 |
| Progress 进度条 | 展示任务进度 |
| Result 结果 | 展示任务状态和后续操作 |
| Skeleton 骨架屏 | 内容加载占位 |
| Spin 加载中 | 局部或页面加载状态 |
| Tour 漫游式引导 | 分步介绍产品功能 |
| Watermark 水印 | 在内容区域平铺归属标记 |

### 其他组件与工具

| 组件 | 说明 |
| --- | --- |
| App 应用容器 | 为应用内容提供统一容器 |
| BorderBeam 边框流光 | 为重点内容添加动态边框 |
| ConfigProvider 全局化配置 | 配置组件前缀、方向和主题变量 |
| Util 常用工具 | 数字范围、格式化与类名拼接 |

### 表单 Hooks

提供 hook-first 的表单状态管理能力，包含 `useForm`、`useWatch`、`Controller`、`FormProvider`、`useFormContext` 和 `useFieldArray`，并提供可选的 Zod、Yup resolver。表单状态通过 Hooks 管理，不提供 `<Form>` 或 `<Form.Item>` 组件。

## 本地开发

环境要求：Node.js `>=20.19.0`。

```bash
npm install
npm run dev
```

开发服务器启动后，终端会显示本地访问地址。

首次运行 UI 测试前，安装 Playwright Chromium 浏览器：

```bash
npx playwright install chromium
npm run test:ui
```

UI 测试会构建生产版 Demo，并检查全部组件样式、导航页面，以及 Rate 和 Transfer 的关键交互。

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
