import { useState, type ReactNode } from 'react';
import {
  Affix, Anchor, App, AutoComplete, BorderBeam, Button, Calendar, Carousel, Cascader, ColorPicker, ConfigProvider,
  Dropdown, Flex, FloatButton, Grid, GridCol, Icon, Image, InputNumber, Layout, LayoutContent, LayoutFooter, LayoutHeader,
  LayoutSider, List, Listy, Masonry, Menu, Mentions, Message, Notification, Popconfirm, Popover, QRCode, Rate, Result,
  Segmented, Slider, Space, Splitter, Statistic, TimePicker, Tour, Transfer, Tree, TreeSelect, Typography, Util, Watermark,
} from '../src';

export type AdditionalPageId =
  | 'affix' | 'anchor' | 'autoComplete' | 'dropdown' | 'floatButton' | 'flex' | 'grid' | 'icon' | 'image'
  | 'inputNumber' | 'layout' | 'popover' | 'popconfirm' | 'rate' | 'result' | 'segmented' | 'slider'
  | 'space' | 'statistic' | 'timePicker' | 'typography'
  | 'cascader' | 'colorPicker' | 'mentions' | 'transfer' | 'treeSelect' | 'calendar' | 'carousel' | 'list' | 'listy'
  | 'masonry' | 'qrcode' | 'menu' | 'tree' | 'tour' | 'watermark' | 'splitter' | 'message' | 'notification'
  | 'app' | 'configProvider' | 'borderBeam' | 'util';

type ApiRow = [string, string, string];
interface ComponentPageMeta {
  id: AdditionalPageId;
  title: string;
  icon: string;
  group: string;
  description: string;
  code: string;
  rows: ApiRow[];
  preview: ReactNode;
}

const imageSource = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="420" height="240" viewBox="0 0 420 240"%3E%3Crect width="420" height="240" fill="%23ecebff"/%3E%3Ccircle cx="320" cy="80" r="48" fill="%23b6b0ff"/%3E%3Cpath d="M0 190 115 92l84 75 68-54 153 127H0Z" fill="%23685cf6"/%3E%3C/svg%3E';

export const additionalComponents: ComponentPageMeta[] = [
  {
    id: 'floatButton', title: 'FloatButton 悬浮按钮', icon: '↗', group: '基础组件', description: '将常用快捷操作固定在视口边缘，滚动页面时仍可访问。',
    code: `import { FloatButton } from 'atelier-ui/float-button';

export function HelpShortcut() {
  return <FloatButton icon="?" aria-label="获取帮助" onClick={() => window.alert('帮助中心')} />;
}`,
    rows: [['icon', 'ReactNode', '↑'], ['description', 'ReactNode', '—'], ['shape', "'circle' | 'square'", 'circle'], ['onClick', 'MouseEventHandler', '—']],
    preview: <div className="additional-float-preview"><span>页面内容区域</span><FloatButton icon="?" aria-label="打开帮助" onClick={() => window.alert('帮助中心')} /></div>,
  },
  {
    id: 'icon', title: 'Icon 图标', icon: '✦', group: '基础组件', description: '使用轻量的内联 SVG 图标表达清晰、可访问的操作含义。',
    code: `import { Icon } from 'atelier-ui/icon';

export function ActionIcons() {
  return <div><Icon name="search" title="搜索" /><Icon name="plus" size={24} /></div>;
}`,
    rows: [['name', "'plus' | 'search' | 'check' | 'close' | 'arrow-right' | 'info' | 'more'", 'required'], ['size', 'number', '20'], ['title', 'string', '—']],
    preview: <div className="additional-icon-preview"><Icon name="search" title="搜索" /><Icon name="plus" size={24} /><Icon name="check" size={24} /><Icon name="arrow-right" size={24} /></div>,
  },
  {
    id: 'typography', title: 'Typography 排版', icon: 'T', group: '基础组件', description: '通过一致的字号层级和文本颜色组织内容结构。',
    code: `import { Typography } from 'atelier-ui/typography';

export function TextHierarchy() {
  return <><Typography as="h2" variant="title">项目概览</Typography><Typography variant="body">查看团队的最新进展。</Typography><Typography variant="caption">最近更新 · 3 分钟前</Typography></>;
}`,
    rows: [['as', 'ElementType', 'p'], ['variant', "'display' | 'title' | 'body' | 'secondary' | 'caption'", 'body'], ['children', 'ReactNode', 'required']],
    preview: <div className="additional-type-preview"><Typography as="h2" variant="title">项目概览</Typography><Typography variant="body">查看团队的最新进展。</Typography><Typography variant="caption">最近更新 · 3 分钟前</Typography></div>,
  },
  {
    id: 'flex', title: 'Flex 弹性布局', icon: '↔', group: '布局组件', description: '使用常见的 Flexbox 属性快速对齐和排列内容。',
    code: `import { Button } from 'atelier-ui/button';
import { Flex } from 'atelier-ui/flex';

export function Toolbar() {
  return <Flex gap={12} justify="space-between"><strong>项目</strong><button type="button">筛选</button></Flex>;
}`,
    rows: [['vertical', 'boolean', 'false'], ['gap', 'number | string', '12'], ['align', 'CSSProperties[alignItems]', 'center'], ['justify', 'CSSProperties[justifyContent]', 'flex-start'], ['wrap', 'boolean', 'false']],
    preview: <Flex className="additional-flex-preview" justify="space-between"><strong>项目工作区</strong><Button size="sm">筛选</Button><TagLike>全部项目</TagLike></Flex>,
  },
  {
    id: 'space', title: 'Space 间距', icon: '↔', group: '布局组件', description: '为一组相邻元素提供统一、可换行的间距。',
    code: `import { Button } from 'atelier-ui/button';
import { Space } from 'atelier-ui/space';

export function Actions() {
  return <Space size={12}><Button>保存草稿</Button><Button variant="primary">发布</Button></Space>;
}`,
    rows: [['size', 'number | string', '12'], ['direction', "'horizontal' | 'vertical'", 'horizontal'], ['wrap', 'boolean', 'false'], ['children', 'ReactNode', 'required']],
    preview: <Space wrap><Button>保存草稿</Button><Button variant="primary">发布</Button><Button variant="tertiary">更多</Button></Space>,
  },
  {
    id: 'layout', title: 'Layout 布局', icon: '▤', group: '布局组件', description: '组合页头、侧栏、内容区和页脚，搭建常见页面骨架。',
    code: `import { Layout, LayoutContent, LayoutFooter, LayoutHeader, LayoutSider } from 'atelier-ui/layout';

export function ProjectLayout() {
  return <Layout><LayoutHeader>工作区标题</LayoutHeader><Layout><LayoutSider>项目导航</LayoutSider><LayoutContent>主要内容</LayoutContent></Layout><LayoutFooter>© 2026</LayoutFooter></Layout>;
}`,
    rows: [['Layout', 'HTMLAttributes<HTMLDivElement>', 'flex container'], ['LayoutHeader', 'HTMLAttributes<HTMLElement>', 'header region'], ['LayoutSider', 'width?: number | string', '220'], ['LayoutContent', 'HTMLAttributes<HTMLElement>', 'main region'], ['LayoutFooter', 'HTMLAttributes<HTMLElement>', 'footer region']],
    preview: <Layout className="additional-layout-preview"><LayoutHeader>工作区标题</LayoutHeader><Layout><LayoutSider width={105}>项目导航</LayoutSider><LayoutContent>主要内容</LayoutContent></Layout><LayoutFooter>© 2026</LayoutFooter></Layout>,
  },
  {
    id: 'grid', title: 'Grid 栅格', icon: '▦', group: '布局组件', description: '基于 24 列的网格快速构建对齐的内容布局。',
    code: `import { Grid, GridCol } from 'atelier-ui/grid';

export function ProjectGrid() {
  return <Grid columns={24} gap={12}><GridCol span={12}>项目名称</GridCol><GridCol span={12}>负责人</GridCol><GridCol span={24}>更多信息</GridCol></Grid>;
}`,
    rows: [['Grid.columns', 'number', '24'], ['Grid.gap', 'number | string', '16'], ['GridCol.span', 'number', '12']],
    preview: <Grid columns={24}><GridCol span={12}>项目名称</GridCol><GridCol span={12}>负责人</GridCol><GridCol span={24}>最近更新 · 今天</GridCol></Grid>,
  },
  {
    id: 'affix', title: 'Affix 固钉', icon: '⌖', group: '布局组件', description: '滚动时将操作区保持在可视区域的指定位置。',
    code: `import { Button } from 'atelier-ui/button';
import { Affix } from 'atelier-ui/affix';

export function StickyAction() {
  return <Affix top={12}><Button variant="primary">创建项目</Button></Affix>;
}`,
    rows: [['top', 'number', '16'], ['children', 'ReactNode', 'required']],
    preview: <div className="additional-affix-preview"><span>页面内容</span><Affix top={8}><Button variant="primary">固定操作</Button></Affix></div>,
  },
  {
    id: 'anchor', title: 'Anchor 锚点', icon: '⚓', group: '导航组件', description: '通过页内链接快速定位到长页面中的内容区块。',
    code: `import { Anchor } from 'atelier-ui/anchor';

export function PageNavigation() {
  return <><Anchor items={[{ href: '#overview', title: '概览' }, { href: '#members', title: '成员' }]} /><section id="overview">项目概览</section><section id="members">项目成员</section></>;
}`,
    rows: [['items', 'AnchorItem[]', 'required'], ['AnchorItem.href', 'string', 'required'], ['AnchorItem.title', 'ReactNode', 'required']],
    preview: <Anchor items={[{ href: '#overview', title: '项目概览' }, { href: '#members', title: '项目成员' }, { href: '#activity', title: '最近动态' }]} />,
  },
  {
    id: 'dropdown', title: 'Dropdown 下拉菜单', icon: '⌄', group: '导航组件', description: '在触发器旁展示一组相关操作或导航选项。',
    code: `import { Button } from 'atelier-ui/button';
import { Dropdown } from 'atelier-ui/dropdown';

export function ProjectActions() {
  return <Dropdown items={[{ key: 'edit', label: '编辑项目' }, { key: 'archive', label: '归档项目' }]}><Button>更多操作</Button></Dropdown>;
}`,
    rows: [['items', 'DropdownItem[]', 'required'], ['placement', "'bottom-start' | 'bottom-end'", 'bottom-start'], ['DropdownItem.onClick', '() => void', '—']],
    preview: <Dropdown items={[{ key: 'edit', label: '编辑项目', onClick: () => window.alert('编辑项目') }, { key: 'archive', label: '归档项目' }]}><Button>更多操作</Button></Dropdown>,
  },
  {
    id: 'autoComplete', title: 'AutoComplete 自动完成', icon: '⌕', group: '数据录入', description: '在输入过程中提供匹配建议，同时允许输入自定义内容。',
    code: `import { AutoComplete } from 'atelier-ui/auto-complete';

export function ProjectSearch() {
  return <AutoComplete label="负责人" options={['林知夏', '陈一川', '周禾']} placeholder="搜索或输入姓名" />;
}`,
    rows: [['options', 'string[]', 'required'], ['value', 'string', '—'], ['onChange', '(value: string) => void', '—'], ['label', 'string', '—']],
    preview: <AutoComplete label="负责人" options={['林知夏', '陈一川', '周禾']} placeholder="搜索或输入姓名" />,
  },
  {
    id: 'inputNumber', title: 'InputNumber 数字输入框', icon: '#', group: '数据录入', description: '录入数值并通过范围、步长约束输入结果。',
    code: `import { InputNumber } from 'atelier-ui/input-number';

export function TeamCapacity() {
  return <InputNumber label="团队人数" min={1} max={100} defaultValue={8} onValueChange={(value) => console.log(value)} />;
}`,
    rows: [['min / max', 'number', '—'], ['step', 'number', '1'], ['value', 'number | string', '—'], ['onValueChange', '(value: number | null) => void', '—']],
    preview: <InputNumber label="团队人数" min={1} max={100} defaultValue={8} />,
  },
  {
    id: 'rate', title: 'Rate 评分', icon: '★', group: '数据录入', description: '用离散星级快速收集满意度或质量评分。',
    code: `import { Rate } from 'atelier-ui/rate';

export function Satisfaction() {
  return <Rate defaultValue={4} onChange={(value) => console.log('评分：', value)} />;
}`,
    rows: [['value', 'number', '0'], ['count', 'number', '5'], ['allowClear', 'boolean', 'true'], ['onChange', '(value: number) => void', '—']],
    preview: <Rate defaultValue={4} />,
  },
  {
    id: 'slider', title: 'Slider 滑动输入条', icon: '━', group: '数据录入', description: '在连续数值范围内通过拖动选择数值。',
    code: `import { Slider } from 'atelier-ui/slider';

export function OpacitySetting() {
  return <Slider label="透明度" min={0} max={100} defaultValue={72} onChange={(value) => console.log(value)} />;
}`,
    rows: [['min / max', 'number', '0 / 100'], ['step', 'number', '1'], ['value', 'number', '—'], ['onChange', '(value: number) => void', '—']],
    preview: <Slider label="透明度" min={0} max={100} defaultValue={72} />,
  },
  {
    id: 'timePicker', title: 'TimePicker 时间选择', icon: '◷', group: '数据录入', description: '使用原生时间输入控件选择一个本地时间。',
    code: `import { TimePicker } from 'atelier-ui/time-picker';

export function MeetingTime() {
  return <TimePicker label="会议时间" defaultValue="14:30" min="09:00" max="18:00" />;
}`,
    rows: [['type', "'time'", 'time'], ['value / defaultValue', 'string', '—'], ['min / max', 'string', '—'], ['disabled', 'boolean', 'false']],
    preview: <TimePicker label="会议时间" defaultValue="14:30" min="09:00" max="18:00" />,
  },
  {
    id: 'segmented', title: 'Segmented 分段控制器', icon: '◧', group: '数据展示', description: '在少量互斥选项间切换当前内容或视图。',
    code: `import { Segmented } from 'atelier-ui/segmented';

export function ViewSwitch() {
  return <Segmented options={[{ label: '列表', value: 'list' }, { label: '看板', value: 'board' }]} onChange={(value) => console.log(value)} />;
}`,
    rows: [['options', 'Array<{ label, value, disabled? }>', 'required'], ['value', 'string', '—'], ['defaultValue', 'string', '首个选项'], ['onChange', '(value) => void', '—']],
    preview: <Segmented options={[{ label: '列表', value: 'list' }, { label: '看板', value: 'board' }, { label: '日历', value: 'calendar' }]} />,
  },
  {
    id: 'statistic', title: 'Statistic 统计数值', icon: '↗', group: '数据展示', description: '突出展示关键数值，并支持前缀、后缀与精度配置。',
    code: `import { Statistic } from 'atelier-ui/statistic';

export function ActiveMembers() {
  return <Statistic title="活跃成员" value={1284} suffix="人" />;
}`,
    rows: [['title', 'ReactNode', 'required'], ['value', 'number | string', 'required'], ['prefix / suffix', 'ReactNode', '—'], ['precision', 'number', '0']],
    preview: <div className="additional-statistics"><Statistic title="本月新增项目" value={248} prefix="+" /><Statistic title="活跃成员" value={1284} suffix="人" /></div>,
  },
  {
    id: 'image', title: 'Image 图片', icon: '▧', group: '数据展示', description: '展示图片，并提供点击放大的预览层。',
    code: `import { Image } from 'atelier-ui/image';

export function CoverImage() {
  return <Image src="/images/project-cover.png" alt="项目封面" width={420} preview />;
}`,
    rows: [['src', 'string', 'required'], ['alt', 'string', "''"], ['preview', 'boolean', 'true'], ['width / height', 'number | string', '—']],
    preview: <Image src={imageSource} alt="紫色山峦风格的项目封面" width={420} />,
  },
  {
    id: 'popover', title: 'Popover 气泡卡片', icon: '▱', group: '反馈组件', description: '在触发元素附近展示可包含标题和复杂内容的浮层。',
    code: `import { Popover } from 'atelier-ui/popover';

export function ShareDetails() {
  return <Popover title="分享项目" content={<span>复制链接并邀请团队成员加入。</span>}><span>分享说明</span></Popover>;
}`,
    rows: [['content', 'ReactNode', 'required'], ['title', 'ReactNode', '—'], ['trigger', "'click' | 'hover'", 'click'], ['children', 'ReactNode', 'required']],
    preview: <Popover title="分享项目" content="复制链接并邀请团队成员加入。"><span>分享说明</span></Popover>,
  },
  {
    id: 'popconfirm', title: 'Popconfirm 气泡确认框', icon: '✓', group: '反馈组件', description: '在执行小型、可撤销操作前就地请求用户确认。',
    code: `import { Popconfirm } from 'atelier-ui/popconfirm';

export function ArchiveProject() {
  return <Popconfirm title="归档这个项目？" description="你之后仍可以从归档列表恢复。" onConfirm={() => console.log('已归档')}><span>归档项目</span></Popconfirm>;
}`,
    rows: [['title', 'ReactNode', 'required'], ['description', 'ReactNode', '—'], ['onConfirm', '() => void', '—'], ['children', 'ReactNode', 'required']],
    preview: <Popconfirm title="归档这个项目？" description="你之后仍可以从归档列表恢复。" onConfirm={() => window.alert('项目已归档')}><span>归档项目</span></Popconfirm>,
  },
  {
    id: 'result', title: 'Result 结果', icon: '✓', group: '反馈组件', description: '在独立页面或任务结束后呈现清晰的状态与下一步操作。',
    code: `import { Button } from 'atelier-ui/button';
import { Result } from 'atelier-ui/result';

export function SaveResult() {
  return <Result status="success" title="保存成功" subTitle="项目设置已更新。" extra={<Button variant="primary">返回项目</Button>} />;
}`,
    rows: [['status', "'success' | 'error' | 'info' | 'warning' | '404' | '500'", 'info'], ['title', 'ReactNode', 'required'], ['subTitle', 'ReactNode', '—'], ['extra', 'ReactNode', '—']],
    preview: <Result status="success" title="保存成功" subTitle="项目设置已更新。" extra={<Button variant="primary">返回项目</Button>} />,
  },

  {
    id: 'cascader', title: 'Cascader 级联选择', icon: '›', group: '数据录入', description: '按层级逐步缩小范围，适合地点、组织和分类路径。',
    code: `import { Cascader } from 'atelier-ui/cascader';

const regions = [{ label: '中国', value: 'cn', children: [{ label: '上海', value: 'sh', children: [{ label: '徐汇区', value: 'xh' }] }] }];

export function RegionPicker() {
  return <Cascader options={regions} onChange={(path) => console.log(path)} />;
}`,
    rows: [['options', 'CascaderOption[]', 'required'], ['value / defaultValue', 'string[]', '— / []'], ['onChange', '(path, selectedOptions) => void', '—']],
    preview: <Cascader options={[{ label: '中国', value: 'cn', children: [{ label: '上海', value: 'sh', children: [{ label: '徐汇区', value: 'xh' }, { label: '长宁区', value: 'cn' }] }, { label: '杭州', value: 'hz', children: [{ label: '西湖区', value: 'xh' }] }] }]} />,
  },
  {
    id: 'colorPicker', title: 'ColorPicker 颜色选择器', icon: '◉', group: '数据录入', description: '通过原生颜色面板选择颜色，并读取标准十六进制值。',
    code: `import { ColorPicker } from 'atelier-ui/color-picker';

export function BrandColor() {
  return <ColorPicker label="品牌主色" defaultValue="#685cf6" onChange={(color) => console.log(color)} />;
}`,
    rows: [['value / defaultValue', 'string', '— / #685cf6'], ['onChange', '(color: string) => void', '—'], ['disabled', 'boolean', 'false']],
    preview: <ColorPicker label="品牌主色" defaultValue="#685cf6" />,
  },
  {
    id: 'mentions', title: 'Mentions 提及', icon: '@', group: '数据录入', description: '在多行内容中输入成员提及文本，并显示候选成员。',
    code: `import { Mentions } from 'atelier-ui/mentions';

export function TeamNote() {
  return <Mentions label="项目留言" options={['林知夏', '陈一川', '周禾']} onChange={(text) => console.log(text)} />;
}`,
    rows: [['options', 'string[]', 'required'], ['value / defaultValue', 'string', '— / 空字符串'], ['onChange', '(value: string) => void', '—']],
    preview: <Mentions label="项目留言" options={['林知夏', '陈一川', '周禾']} defaultValue="@林知夏 请确认设计稿" />,
  },
  {
    id: 'transfer', title: 'Transfer 穿梭框', icon: '⇄', group: '数据录入', description: '在可选列表与已选列表之间批量移动条目。',
    code: `import { Transfer } from 'atelier-ui/transfer';

const members = [{ key: 'lin', title: '林知夏' }, { key: 'chen', title: '陈一川' }, { key: 'zhou', title: '周禾' }];

export function MemberTransfer() {
  return <Transfer dataSource={members} defaultTargetKeys={['lin']} onChange={(keys) => console.log(keys)} />;
}`,
    rows: [['dataSource', 'TransferItem[]', 'required'], ['targetKeys', 'string[]', '—'], ['defaultTargetKeys', 'string[]', '[]'], ['onChange', '(nextTargetKeys) => void', '—']],
    preview: <Transfer dataSource={[{ key: 'lin', title: '林知夏' }, { key: 'chen', title: '陈一川' }, { key: 'zhou', title: '周禾' }]} defaultTargetKeys={['lin']} />,
  },
  {
    id: 'treeSelect', title: 'TreeSelect 树选择', icon: '⌄', group: '数据录入', description: '从带层级关系的选项中选择单个值。',
    code: `import { TreeSelect } from 'atelier-ui/tree-select';

const teams = [{ label: '设计部', value: 'design', children: [{ label: '品牌组', value: 'brand' }] }];

export function TeamSelect() {
  return <TreeSelect label="所属团队" options={teams} defaultValue="brand" onChange={(value) => console.log(value)} />;
}`,
    rows: [['options', 'CascaderOption[]', 'required'], ['value / defaultValue', 'string', '— / 空字符串'], ['onChange', '(value: string) => void', '—']],
    preview: <TreeSelect label="所属团队" options={[{ label: '设计部', value: 'design', children: [{ label: '品牌组', value: 'brand' }, { label: '体验组', value: 'ux' }] }, { label: '工程部', value: 'engineering' }]} defaultValue="brand" />,
  },
  {
    id: 'calendar', title: 'Calendar 日历', icon: '▦', group: '数据展示', description: '按月浏览日期并通过键盘可访问的日历按钮选择日期。',
    code: `import { useState } from 'react';
import { Calendar } from 'atelier-ui/calendar';

export function ProjectCalendar() {
  const [date, setDate] = useState(new Date(2026, 9, 27));
  return <Calendar value={date} onChange={setDate} />;
}`,
    rows: [['value / defaultValue', 'Date', '— / 当前日期'], ['onChange', '(date: Date) => void', '—']],
    preview: <Calendar defaultValue={new Date(2026, 9, 27)} />,
  },
  {
    id: 'carousel', title: 'Carousel 走马灯', icon: '◁', group: '数据展示', description: '通过前后控件轮换一组展示内容，可选自动播放。',
    code: `import { Carousel } from 'atelier-ui/carousel';

export function FeatureCarousel() {
  return <Carousel autoplay interval={5000} items={[<span key="one">灵活的表单 Hooks</span>, <span key="two">按需加载组件</span>]} />;
}`,
    rows: [['items', 'ReactNode[]', 'required'], ['autoplay', 'boolean', 'false'], ['interval', 'number', '4000 ms']],
    preview: <Carousel items={[<span key="one">灵活的表单 Hooks</span>, <span key="two">按需加载组件</span>, <span key="three">独立组件样式</span>]} />,
  },
  {
    id: 'list', title: 'List 列表', icon: '☷', group: '数据展示', description: '以一致的行间距展示一组文本或自定义内容。',
    code: `import { List } from 'atelier-ui/list';

const tasks = ['更新产品视觉', '检查成员权限', '整理发布记录'];

export function TaskList() {
  return <List bordered dataSource={tasks} renderItem={(task) => <span>{task}</span>} />;
}`,
    rows: [['dataSource', 'T[]', 'required'], ['renderItem', '(item: T, index: number) => ReactNode', 'required'], ['bordered', 'boolean', 'false']],
    preview: <List bordered dataSource={['更新产品视觉', '检查成员权限', '整理发布记录']} renderItem={(task) => <span>{task}</span>} />,
  },
  {
    id: 'listy', title: 'Listy 虚拟列表', icon: '☷', group: '数据展示', description: '只渲染可视区域附近的固定高度行，适合较长列表。',
    code: `import { Listy } from 'atelier-ui/listy';

const records = Array.from({ length: 500 }, (_, index) => ` + '`成员 ${index + 1}`' + `);

export function VirtualMembers() {
  return <Listy items={records} itemHeight={44} height={220} />;
}`,
    rows: [['items', 'ReactNode[]', 'required'], ['itemHeight', 'number', '44'], ['height', 'number', '220']],
    preview: <Listy items={Array.from({ length: 120 }, (_, index) => `成员 ${index + 1} · 项目协作者`)} />,
  },
  {
    id: 'masonry', title: 'Masonry 瀑布流', icon: '▥', group: '布局组件', description: '以 CSS 多列流式排列不同高度的卡片内容。',
    code: `import { Masonry } from 'atelier-ui/masonry';

export function ProjectGallery() {
  return <Masonry columns={3} gap={14} items={[<article key="a">品牌升级</article>, <article key="b">移动端体验改版<br />新增设计规范</article>, <article key="c">数据看板</article>]} />;
}`,
    rows: [['items', 'ReactNode[]', 'required'], ['columns', 'number', '3'], ['gap', 'number', '16']],
    preview: <Masonry columns={3} items={[<span key="a">品牌升级</span>, <span key="b">移动端体验改版<br />新增设计规范</span>, <span key="c">数据看板</span>, <span key="d">设计系统</span>]} />,
  },
  {
    id: 'qrcode', title: 'QRCode 二维码', icon: '▦', group: '数据展示', description: '将文本或链接编码为可扫描的二维码图像。',
    code: `import { QRCode } from 'atelier-ui/qrcode';

export function InviteCode() {
  return <QRCode value="https://example.com/invite/team-aurora" size={160} title="团队邀请链接" />;
}`,
    rows: [['value', 'string', 'required'], ['size', 'number', '144'], ['title', 'string', '二维码']],
    preview: <QRCode value="https://example.com/invite/team-aurora" size={144} title="团队邀请链接" />,
  },
  {
    id: 'menu', title: 'Menu 导航菜单', icon: '☰', group: '导航组件', description: '在垂直或水平菜单中切换页面或触发操作。',
    code: `import { useState } from 'react';
import { Menu } from 'atelier-ui/menu';

export function WorkspaceMenu() {
  const [selectedKey, setSelectedKey] = useState('projects');
  return <Menu selectedKey={selectedKey} onSelect={setSelectedKey} items={[{ key: 'projects', label: '项目' }, { key: 'members', label: '成员' }]} />;
}`,
    rows: [['items', 'MenuItem[]', 'required'], ['selectedKey', 'string', '—'], ['orientation', "'vertical' | 'horizontal'", 'vertical'], ['onSelect', '(key: string) => void', '—']],
    preview: <Menu selectedKey="projects" items={[{ key: 'projects', label: '项目' }, { key: 'members', label: '成员' }, { key: 'settings', label: '设置' }]} />,
  },
  {
    id: 'tree', title: 'Tree 树形控件', icon: '⋮', group: '数据展示', description: '以可展开层级结构呈现目录、组织或分类数据。',
    code: `import { Tree } from 'atelier-ui/tree';

const folders = [{ label: '设计部', value: 'design', children: [{ label: '品牌项目', value: 'brand' }, { label: '体验规范', value: 'ux' }] }];

export function FolderTree() {
  return <Tree options={folders} onSelect={(node) => console.log(node.value)} />;
}`,
    rows: [['options', 'CascaderOption[]', 'required'], ['onSelect', '(option: CascaderOption) => void', '—'], ['CascaderOption.children', 'CascaderOption[]', '—']],
    preview: <Tree options={[{ label: '设计部', value: 'design', children: [{ label: '品牌项目', value: 'brand' }, { label: '体验规范', value: 'ux' }] }, { label: '工程部', value: 'engineering' }]} />,
  },
  {
    id: 'tour', title: 'Tour 漫游式引导', icon: '✧', group: '反馈组件', description: '通过分步卡片介绍新功能，并让用户前进、返回或跳过。',
    code: `import { Tour } from 'atelier-ui/tour';

export function ProductOnboarding() {
  return <Tour steps={[{ title: '创建项目', description: '从空白工作区开始。' }, { title: '邀请成员', description: '与团队一起协作。' }]} onClose={() => console.log('引导结束')} />;
}`,
    rows: [['steps', 'Array<{ title, description? }>', 'required'], ['open', 'boolean', 'true'], ['onClose', '() => void', '—']],
    preview: <Tour steps={[{ title: '创建项目', description: '先为项目取一个清晰的名称。' }, { title: '邀请成员', description: '和团队一起完成设置。' }]} />,
  },
  {
    id: 'watermark', title: 'Watermark 水印', icon: '▧', group: '反馈组件', description: '在内容容器上平铺轻量文字水印，提示内容归属。',
    code: `import { Watermark } from 'atelier-ui/watermark';

export function ProtectedPreview() {
  return <Watermark content="Atelier · 内部预览"><div style={{ minHeight: 120 }}>工作区内容</div></Watermark>;
}`,
    rows: [['content', 'string', 'required'], ['rotate', 'number', '-20'], ['opacity', 'number', '0.1'], ['children', 'ReactNode', 'required']],
    preview: <Watermark content="Atelier · 内部预览"><div>工作区内容 · 仅供团队查看</div></Watermark>,
  },
  {
    id: 'splitter', title: 'Splitter 分隔面板', icon: '◫', group: '布局组件', description: '拖动分隔条调整两个相邻内容面板的空间比例。',
    code: `import { Splitter } from 'atelier-ui/splitter';

export function ResizablePanels() {
  return <Splitter first={<strong>项目导航</strong>} second={<p>项目详情与最近动态</p>} defaultSize={36} />;
}`,
    rows: [['first / second', 'ReactNode', 'required'], ['defaultSize', 'number', '50%'], ['separator', '键盘左右方向键', '可调整']],
    preview: <Splitter first={<strong>项目导航</strong>} second={<p>项目详情与最近动态</p>} defaultSize={36} />,
  },
  {
    id: 'message', title: 'Message 全局提示', icon: '·', group: '反馈组件', description: '在页面顶部短暂展示轻量级的操作结果提示。',
    code: `import { useState } from 'react';
import { Button } from 'atelier-ui/button';
import { Message } from 'atelier-ui/message';

export function SaveMessage() {
  const [visible, setVisible] = useState(false);
  return <><Button onClick={() => setVisible(true)}>保存设置</Button>{visible && <Message type="success" content="设置已保存" onClose={() => setVisible(false)} />}</>;
}`,
    rows: [['type', "'success' | 'info' | 'warning' | 'error'", 'info'], ['content', 'ReactNode', 'required'], ['duration', 'number', '4000 ms'], ['onClose', '() => void', '—']],
    preview: <Message type="success" content="设置已保存" />,
  },
  {
    id: 'notification', title: 'Notification 通知提醒', icon: '▣', group: '反馈组件', description: '在屏幕角落呈现带标题和描述的详细通知卡片。',
    code: `import { Notification } from 'atelier-ui/notification';

export function ProjectNotice() {
  return <Notification title="成员已加入" description="林知夏已加入 Aurora workspace。" type="success" placement="top-right" onClose={() => console.log('已关闭')} />;
}`,
    rows: [['title', 'ReactNode', 'required'], ['description', 'ReactNode', '—'], ['type', "'success' | 'info' | 'warning' | 'error'", 'info'], ['placement', "'top-right' | 'bottom-right' | 'top-left' | 'bottom-left'", 'top-right']],
    preview: <Notification title="成员已加入" description="林知夏已加入 Aurora workspace。" type="success" placement="top-right" />,
  },
  {
    id: 'app', title: 'App 应用容器', icon: '▣', group: '其他组件', description: '为应用内容提供统一的组件容器和样式边界。',
    code: `import { App } from 'atelier-ui/app';
import { Button } from 'atelier-ui/button';

export function AppRoot() {
  return <App><Button variant="primary">创建工作区</Button></App>;
}`,
    rows: [['children', 'ReactNode', 'required'], ['className', 'string', '—'], ['HTML attributes', 'HTMLAttributes<HTMLDivElement>', '—']],
    preview: <App><Button variant="primary">创建工作区</Button></App>,
  },
  {
    id: 'configProvider', title: 'ConfigProvider 全局化配置', icon: '⚙', group: '其他组件', description: '在子树范围统一配置前缀、方向和基础主题变量。',
    code: `import { ConfigProvider } from 'atelier-ui/config-provider';
import { Button } from 'atelier-ui/button';

export function BrandedSection() {
  return <ConfigProvider theme={{ primaryColor: '#2f9472', borderRadius: '16px' }}><Button variant="primary">保存更改</Button></ConfigProvider>;
}`,
    rows: [['prefixCls', 'string', 'at'], ['direction', "'ltr' | 'rtl'", 'ltr'], ['theme.primaryColor', 'string', '—'], ['theme.borderRadius', 'string', '—'], ['useConfig()', 'UIConfig', '读取上下文']],
    preview: <ConfigProvider theme={{ primaryColor: '#2f9472' }}><Button variant="primary">保存更改</Button></ConfigProvider>,
  },
  {
    id: 'borderBeam', title: 'BorderBeam 边框流光', icon: '✧', group: '其他组件', description: '为重点卡片添加可自定义颜色和速度的流动边框。',
    code: `import { BorderBeam } from 'atelier-ui/border-beam';

export function HighlightCard() {
  return <BorderBeam color="#685cf6" duration={5}><strong>为新项目准备好了吗？</strong></BorderBeam>;
}`,
    rows: [['children', 'ReactNode', 'required'], ['color', 'string', '#8b7dff'], ['duration', 'number', '5 秒']],
    preview: <BorderBeam><strong>为新项目准备好了吗？</strong></BorderBeam>,
  },
  {
    id: 'util', title: 'Util 常用工具', icon: '⌘', group: '其他组件', description: '提供数字范围、数字格式和类名拼接等小型工具函数。',
    code: `import { Util } from 'atelier-ui/util';

export function CapacityLabel() {
  const value = Util.clamp(128, 0, 100);
  return <span>{Util.formatNumber(value)} 位成员 · {Util.classNames('capacity', value === 100 && 'capacity--full')}</span>;
}`,
    rows: [['Util.clamp(value, min, max)', '(number, number, number) => number', '—'], ['Util.formatNumber(value, locale?)', '(number, string?) => string', 'zh-CN'], ['Util.classNames(...names)', '(...string[]) => string', '—']],
    preview: <span>{Util.formatNumber(1284)} 位活跃成员 · {Util.classNames('capacity', 'capacity--active')}</span>,
  },

];

function TagLike({ children }: { children: ReactNode }) { return <span className="additional-tag-like">{children}</span>; }

export function isAdditionalPageId(id: string): id is AdditionalPageId {
  return additionalComponents.some((item) => item.id === id);
}

export function AdditionalComponentPage({ id }: { id: AdditionalPageId }) {
  const [showCode, setShowCode] = useState(false);
  const item = additionalComponents.find((component) => component.id === id);
  if (!item) return null;
  return <><div className="page-heading"><div className="eyebrow"><span className="eyebrow__dot" />{item.group.toLocaleUpperCase()}</div><div className="page-heading__row"><div><h1>{item.title}</h1><p>{item.description}</p></div><span className="heading-badge">{item.title.split(' ')[0]}</span></div></div><section className="example-card"><div className="example-card__heading"><div><h3>交互示例</h3><p>在下方体验组件，再展开查看可直接使用的 TypeScript 示例。</p></div><button type="button" className={`code-toggle ${showCode ? 'code-toggle--active' : ''}`} onClick={() => setShowCode((visible) => !visible)}><span>{`</>`}</span>{showCode ? '收起代码' : '查看完整代码'}</button></div><div className="example-card__preview">{item.preview}</div>{showCode && <pre className="code-panel"><code dangerouslySetInnerHTML={{ __html: highlightCode(item.code) }} /></pre>}</section><section className="api-table-section"><div className="eyebrow"><span className="eyebrow__dot" /> API REFERENCE</div><h2>组件属性</h2><div className="api-table-wrap"><table className="api-table"><thead><tr><th>属性</th><th>类型</th><th>默认值</th></tr></thead><tbody>{item.rows.map(([prop, type, fallback]) => <tr key={prop}><td><code>{prop}</code></td><td>{type}</td><td>{fallback}</td></tr>)}</tbody></table></div></section></>;
}

const codeTokens = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|<\/?[A-Za-z][\w.]*(?=[\s/>])|\b(?:import|from|export|default|const|let|var|function|return|async|await|type|interface|new|true|false|null|undefined|if|else)\b|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*(?=\s*\()|[{}()[\].,;:=<>!?|&+*/-])/g;
function escapeHtml(value: string) { return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;'); }
function highlightCode(source: string) {
  return source.replace(codeTokens, (token) => {
    const className = token.startsWith('//') || token.startsWith('/*') ? 'code-token--comment'
      : token.startsWith('"') || token.startsWith("'") || token.startsWith('`') ? 'code-token--string'
        : token.startsWith('<') ? 'code-token--tag'
          : /^(?:import|from|export|default|const|let|var|function|return|async|await|type|interface|new|true|false|null|undefined|if|else)$/.test(token) ? 'code-token--keyword'
            : /^\d/.test(token) ? 'code-token--number'
              : /^[A-Za-z_$]/.test(token) ? 'code-token--function' : 'code-token--punctuation';
    return `<span class="${className}">${escapeHtml(token)}</span>`;
  }).split(/(<span class="[^"]+">[\s\S]*?<\/span>)/g).map((part) => part.startsWith('<span ') ? part : escapeHtml(part)).join('');
}
