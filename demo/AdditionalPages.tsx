import { useState, type ReactNode } from 'react';
import { CodeBlock } from './shared';
import {
  Button, ConfigProvider, Flex, Grid, GridCol, Icon, InputOTP, Layout, LayoutContent, LayoutFooter, LayoutHeader, LayoutSider, message, notification, Result, Space,
} from '../src';

export type AdditionalPageId =
 | 'flex' | 'grid' | 'icon' | 'inputOTP' | 'layout' | 'result'
  | 'space' | 'message' | 'notification'
  | 'configProvider';

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
    id: 'message', title: 'Message 全局提示', icon: '·', group: '反馈组件', description: '在页面顶部短暂展示轻量级的操作结果提示。',
    code: `import { Button } from 'atelier-ui/button';
import { message } from 'atelier-ui/message';

export function SaveMessage() {
  return <Button onClick={() => message.success('设置已保存')}>保存设置</Button>;
}`,
    rows: [['message.success(content, options?)', '(ReactNode, MessageOptions?) => { close }', '—'], ['message.open(content, options?)', '(ReactNode, MessageOptions?) => { close }', 'info'], ['duration', 'number', '4000 ms'], ['message.destroy()', '() => void', '关闭所有消息']],
    preview: <Button onClick={() => message.success('设置已保存')}>保存设置</Button>,
  },
  {
    id: 'notification', title: 'Notification 通知提醒', icon: '▣', group: '反馈组件', description: '在屏幕角落呈现带标题和描述的详细通知卡片。',
    code: `import { Button } from 'atelier-ui/button';
import { notification } from 'atelier-ui/notification';

export function ProjectNotice() {
  return <Button onClick={() => notification.success({
    title: '成员已加入',
    description: '林知夏已加入 Aurora workspace。',
  })}>查看通知</Button>;
}`,
    rows: [['notification.open(options)', 'NotificationOptions => { close }', '—'], ['title', 'ReactNode', 'required'], ['description', 'ReactNode', '—'], ['type', "'success' | 'info' | 'warning' | 'error'", 'info'], ['placement', "'top-right' | 'bottom-right' | 'top-left' | 'bottom-left'", 'top-right'], ['notification.destroy()', '() => void', '关闭所有通知']],
    preview: <Button onClick={() => notification.success({ title: '成员已加入', description: '林知夏已加入 Aurora workspace。' })}>查看通知</Button>,
  },
  {
    id: 'configProvider', title: 'ConfigProvider 全局化配置', icon: '⚙', group: '通用组件', description: '在子树范围统一配置前缀、方向、尺寸、语言和主题变量。',
    code: `import { ConfigProvider } from 'atelier-ui/config-provider';
import { Button } from 'atelier-ui/button';

export function BrandedSection() {
  return (
    <ConfigProvider
      size="large"
      locale="zh-CN"
      theme={{ primaryColor: '#2f9472', borderRadius: '12px' }}
    >
      <Button variant="primary">保存更改</Button>
    </ConfigProvider>
  );
}`,
    rows: [['prefixCls', 'string', 'at'], ['direction', "'ltr' | 'rtl'", 'ltr'], ['size', "'small' | 'middle' | 'large'", 'middle'], ['locale', "'zh-CN' | 'en-US'", 'zh-CN'], ['theme.primaryColor', 'string', '—'], ['theme.borderRadius', 'string', '—'], ['useConfig()', 'UIConfig', '读取上下文']],
    preview: <ConfigProvider size="large" locale="zh-CN" theme={{ primaryColor: '#2f9472' }}><Button variant="primary">保存更改</Button></ConfigProvider>,
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
  return <><div className="page-heading"><div className="eyebrow"><span className="eyebrow__dot" />{item.group.toLocaleUpperCase()}</div><div className="page-heading__row"><div><h1>{item.title}</h1><p>{item.description}</p></div><span className="heading-badge">{item.title.split(' ')[0]}</span></div></div><section className="example-card"><div className="example-card__heading"><div><h3>交互示例</h3><p>在下方体验组件，再展开查看可直接使用的 TypeScript 示例。</p></div><button type="button" className={`code-toggle ${showCode ? 'code-toggle--active' : ''}`} onClick={() => setShowCode((visible) => !visible)}><span>{`</>`}</span>{showCode ? '收起代码' : '查看完整代码'}</button></div><div className="example-card__preview">{item.preview}</div>{showCode && <CodeBlock code={item.code} />}</section><section className="api-table-section"><div className="eyebrow"><span className="eyebrow__dot" /> API REFERENCE</div><h2>组件属性</h2><div className="api-table-wrap"><table className="api-table"><thead><tr><th>属性</th><th>类型</th><th>默认值</th></tr></thead><tbody>{item.rows.map(([prop, type, fallback]) => <tr key={prop}><td><code>{prop}</code></td><td>{type}</td><td>{fallback}</td></tr>)}</tbody></table></div></section></>;
}
