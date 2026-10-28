import { useState, type ReactNode } from 'react';
import { highlightCode } from './shared';
import {
  App, BorderBeam, Button, Calendar, Carousel, ConfigProvider, Flex, Grid, GridCol, Icon, Image, InputOTP, Layout, LayoutContent, LayoutFooter, LayoutHeader, LayoutSider, List, Listy, Masonry, Message, Notification, QRCode, Result, Space, Splitter, Statistic, Tree, Typography, Util, Watermark,
} from '../src';

export type AdditionalPageId =
 | 'flex' | 'grid' | 'icon' | 'image' | 'inputOTP' | 'layout' | 'result'
  | 'space' | 'statistic' | 'typography' | 'calendar' | 'carousel' | 'list' | 'listy'
  | 'masonry' | 'qrcode' | 'tree' | 'watermark' | 'splitter' | 'message' | 'notification'
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
  return (
    <>
      <Typography as="h2" variant="title">项目概览</Typography>
      <Typography variant="body">查看团队的最新进展。</Typography>
      <Typography variant="caption">最近更新 · 3 分钟前</Typography>
    </>
  );
}`,
    rows: [['as', 'ElementType', 'p'], ['variant', "'display' | 'title' | 'body' | 'secondary' | 'caption'", 'body'], ['children', 'ReactNode', 'required']],
    preview: <div className="additional-type-preview"><Typography as="h2" variant="title">项目概览</Typography><Typography variant="body">查看团队的最新进展。</Typography><Typography variant="caption">最近更新 · 3 分钟前</Typography></div>,
  },
  {
    id: 'flex', title: 'Flex 弹性布局', icon: '↔', group: '布局组件', description: '使用常见的 Flexbox 属性快速对齐和排列内容。',
    code: `import { Button } from 'atelier-ui/button';
import { Flex } from 'atelier-ui/flex';

export function Toolbar() {
  return (
    <Flex gap={12} justify="space-between">
      <strong>项目</strong>
      <button type="button">筛选</button>
    </Flex>
  );
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
  return (
    <Layout>
      <LayoutHeader>工作区标题</LayoutHeader>
      <Layout>
        <LayoutSider>项目导航</LayoutSider>
        <LayoutContent>主要内容</LayoutContent>
      </Layout>
      <LayoutFooter>© 2026</LayoutFooter>
    </Layout>
  );
}`,
    rows: [['Layout', 'HTMLAttributes<HTMLDivElement>', 'flex container'], ['LayoutHeader', 'HTMLAttributes<HTMLElement>', 'header region'], ['LayoutSider', 'width?: number | string', '220'], ['LayoutContent', 'HTMLAttributes<HTMLElement>', 'main region'], ['LayoutFooter', 'HTMLAttributes<HTMLElement>', 'footer region']],
    preview: <Layout className="additional-layout-preview"><LayoutHeader>工作区标题</LayoutHeader><Layout><LayoutSider width={105}>项目导航</LayoutSider><LayoutContent>主要内容</LayoutContent></Layout><LayoutFooter>© 2026</LayoutFooter></Layout>,
  },
  {
    id: 'grid', title: 'Grid 栅格', icon: '▦', group: '布局组件', description: '基于 24 列的网格快速构建对齐的内容布局。',
    code: `import { Grid, GridCol } from 'atelier-ui/grid';

export function ProjectGrid() {
  return (
    <Grid columns={24} gap={12}>
      <GridCol span={12}>项目名称</GridCol>
      <GridCol span={12}>负责人</GridCol>
      <GridCol span={24}>更多信息</GridCol>
    </Grid>
  );
}`,
    rows: [['Grid.columns', 'number', '24'], ['Grid.gap', 'number | string', '16'], ['GridCol.span', 'number', '12']],
    preview: <Grid columns={24}><GridCol span={12}>项目名称</GridCol><GridCol span={12}>负责人</GridCol><GridCol span={24}>最近更新 · 今天</GridCol></Grid>,
  },
  {
    id: 'inputOTP', title: 'InputOTP 验证码输入', icon: '▦', group: '数据录入', description: '将一次性验证码拆分为易于输入和校验的独立数字格。',
    code: `import { useState } from 'react';
import { InputOTP } from 'atelier-ui/input-otp';

export function VerificationCode() {
  const [code, setCode] = useState('');

  return (
    <InputOTP
      value={code}
      onChange={setCode}
      onComplete={(value) => console.log('验证码：', value)}
      ariaLabel="登录验证码"
    />
  );
}`,
    rows: [['length', 'number', '6'], ['value / defaultValue', 'string', '—'], ['onChange', '(value: string) => void', '—'], ['onComplete', '(value: string) => void', '—'], ['disabled', 'boolean', 'false'], ['autoFocus', 'boolean', 'false']],
    preview: <InputOTP defaultValue="482" ariaLabel="演示验证码" />,
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
    id: 'result', title: 'Result 结果', icon: '✓', group: '反馈组件', description: '在独立页面或任务结束后呈现清晰的状态与下一步操作。',
    code: `import { Button } from 'atelier-ui/button';
import { Result } from 'atelier-ui/result';

export function SaveResult() {
  return (
    <Result
      status="success"
      title="保存成功"
      subTitle="项目设置已更新。"
      extra={<Button variant="primary">返回项目</Button>}
    />
  );
}`,
    rows: [['status', "'success' | 'error' | 'info' | 'warning' | '404' | '500'", 'info'], ['title', 'ReactNode', 'required'], ['subTitle', 'ReactNode', '—'], ['extra', 'ReactNode', '—']],
    preview: <Result status="success" title="保存成功" subTitle="项目设置已更新。" extra={<Button variant="primary">返回项目</Button>} />,
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
  return (
    <Carousel
      autoplay
      interval={5000}
      items={[
        <span key="one">灵活的表单 Hooks</span>,
        <span key="two">按需加载组件</span>,
      ]}
    />
  );
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
  return (
    <Masonry
      columns={3}
      gap={14}
      items={[
        <article key="a">品牌升级</article>,
        <article key="b">
          移动端体验改版
          <br />
          新增设计规范
        </article>,
        <article key="c">数据看板</article>,
      ]}
    />
  );
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
    id: 'tree', title: 'Tree 树形控件', icon: '⋮', group: '数据展示', description: '以可展开层级结构呈现目录、组织或分类数据。',
    code: `import { Tree } from 'atelier-ui/tree';

const folders = [
  {
    label: '设计部',
    value: 'design',
    children: [
      { label: '品牌项目', value: 'brand' },
      { label: '体验规范', value: 'ux' },
    ],
  },
];

export function FolderTree() {
  return <Tree options={folders} onSelect={(node) => console.log(node.value)} />;
}`,
    rows: [['options', 'CascaderOption[]', 'required'], ['onSelect', '(option: CascaderOption) => void', '—'], ['CascaderOption.children', 'CascaderOption[]', '—']],
    preview: <Tree options={[{ label: '设计部', value: 'design', children: [{ label: '品牌项目', value: 'brand' }, { label: '体验规范', value: 'ux' }] }, { label: '工程部', value: 'engineering' }]} />,
  },
  {
    id: 'watermark', title: 'Watermark 水印', icon: '▧', group: '反馈组件', description: '在内容容器上平铺轻量文字水印，提示内容归属。',
    code: `import { Watermark } from 'atelier-ui/watermark';

export function ProtectedPreview() {
  return (
    <Watermark content="Atelier · 内部预览">
      <div style={{ minHeight: 120 }}>工作区内容</div>
    </Watermark>
  );
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
  return (
    <>
      <Button onClick={() => setVisible(true)}>保存设置</Button>
      {visible && (
        <Message
          type="success"
          content="设置已保存"
          onClose={() => setVisible(false)}
        />
      )}
    </>
  );
}`,
    rows: [['type', "'success' | 'info' | 'warning' | 'error'", 'info'], ['content', 'ReactNode', 'required'], ['duration', 'number', '4000 ms'], ['onClose', '() => void', '—']],
    preview: <Message type="success" content="设置已保存" />,
  },
  {
    id: 'notification', title: 'Notification 通知提醒', icon: '▣', group: '反馈组件', description: '在屏幕角落呈现带标题和描述的详细通知卡片。',
    code: `import { Notification } from 'atelier-ui/notification';

export function ProjectNotice() {
  return (
    <Notification
      title="成员已加入"
      description="林知夏已加入 Aurora workspace。"
      type="success"
      placement="top-right"
      onClose={() => console.log('已关闭')}
    />
  );
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
  return (
    <ConfigProvider
      theme={{ primaryColor: '#2f9472', borderRadius: '16px' }}
    >
      <Button variant="primary">保存更改</Button>
    </ConfigProvider>
  );
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
  return (
    <span>
      {Util.formatNumber(value)} 位成员 ·{' '}
      {Util.classNames('capacity', value === 100 && 'capacity--full')}
    </span>
  );
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
