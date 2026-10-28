import { useRef, useState, type ReactNode } from 'react';
import {
  Affix, Anchor, BackTop, Button, Dropdown, FloatButton, FloatButtonGroup, Menu, Popconfirm, Popover, Tag, Tour,
  type DropdownItem, type MenuItem, type TourStep,
} from '../src';
import { ApiTable, ExampleCard, PageHeading } from './shared';

export type NavigationPageId = 'dropdown' | 'menu' | 'anchor' | 'affix' | 'tour' | 'floatButton' | 'popover' | 'popconfirm';

interface Example { title: string; description?: string; code: string; preview: ReactNode }
interface NavigationPageMeta {
  id: NavigationPageId;
  title: string;
  icon: string;
  group: string;
  eyebrow: string;
  badge: string;
  description: string;
  examples: Example[];
  rows: string[][];
}

const EditIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>;
const CopyIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>;
const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>;
const HomeIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3 11 9-8 9 8v10a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1Z" /></svg>;
const FolderIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /></svg>;
const UsersIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4.5-6.2" /></svg>;
const SettingsIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></svg>;
const ChatIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12Z" /></svg>;
const HelpIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01" /></svg>;

const projectActions: DropdownItem[] = [
  { key: 'edit', label: '编辑项目', icon: <EditIcon />, extra: '⌘E' },
  { key: 'duplicate', label: '复制项目', icon: <CopyIcon />, extra: '⌘D' },
  { key: 'divider-1', type: 'divider' },
  { key: 'share', type: 'group', label: '分享', children: [{ key: 'link', label: '复制链接' }, { key: 'invite', label: '邀请成员' }] },
  { key: 'divider-2', type: 'divider' },
  { key: 'archive', label: '归档项目', disabled: true },
  { key: 'delete', label: '删除项目', icon: <TrashIcon />, danger: true },
];

function BasicDropdown() {
  const [last, setLast] = useState('');
  return <div className="component-row" style={{ gap: 18 }}>
    <Dropdown items={projectActions} onSelect={(key) => setLast(key)}><Button>更多操作</Button></Dropdown>
    <Dropdown items={projectActions.filter((item) => item.type !== 'group' && item.key !== 'divider-2')} trigger="hover" placement="bottom-end" showArrow onSelect={(key) => setLast(key)}>
      <span className="demo-link-trigger">悬停展开</span>
    </Dropdown>
    <Dropdown items={[{ key: 'rename', label: '重命名' }, { key: 'move', label: '移动到…' }, { key: 'divider', type: 'divider' }, { key: 'remove', label: '移除', danger: true }]} trigger="contextMenu" onSelect={(key) => setLast(key)}>
      <div className="demo-context-area">右键点击此区域</div>
    </Dropdown>
    <span className="demo-hint">{last ? `最近选择：${last}` : '选择一项后会显示在这里'}</span>
  </div>;
}

const workspaceMenu: MenuItem[] = [
  { key: 'home', label: '工作台', icon: <HomeIcon /> },
  { key: 'projects', label: '项目', icon: <FolderIcon />, children: [
    { key: 'all', label: '全部项目' },
    { key: 'mine', label: '我负责的' },
    { key: 'archived', label: '已归档', disabled: true },
  ] },
  { key: 'members', label: '成员', icon: <UsersIcon />, children: [
    { key: 'group-teams', type: 'group', label: '团队', children: [{ key: 'design', label: '设计部' }, { key: 'engineering', label: '工程部' }] },
    { key: 'invite', label: '邀请成员' },
  ] },
  { key: 'divider', type: 'divider' },
  { key: 'settings', label: '设置', icon: <SettingsIcon /> },
];

function InlineMenu() {
  const [selected, setSelected] = useState('mine');
  const [collapsed, setCollapsed] = useState(false);
  return <div className="demo-menu-row">
    <div className="demo-menu-frame">
      <Menu items={workspaceMenu} selectedKey={selected} onSelect={setSelected} defaultOpenKeys={['projects']} collapsed={collapsed} label="工作区导航" />
    </div>
    <div className="demo-menu-side">
      <Button size="sm" onClick={() => setCollapsed((value) => !value)}>{collapsed ? '展开菜单' : '收起菜单'}</Button>
      <span className="demo-hint">当前选中：{selected}</span>
    </div>
  </div>;
}
function HorizontalMenu() {
  const [selected, setSelected] = useState('home');
  return <div className="demo-stack" style={{ display: 'grid', gap: 18 }}>
    <div className="demo-menu-bar"><Menu mode="horizontal" items={workspaceMenu.filter((item) => item.type !== 'divider')} selectedKey={selected} onSelect={setSelected} label="顶部导航" /></div>
    <div className="demo-menu-row">
      <div className="demo-menu-frame"><Menu mode="vertical" items={workspaceMenu} defaultSelectedKey="home" label="侧边导航（弹出子菜单）" /></div>
      <Menu theme="dark" items={workspaceMenu} defaultSelectedKey="design" defaultOpenKeys={['members']} label="深色菜单" />
    </div>
  </div>;
}

function ScrollSpyAnchor({ direction = 'vertical' }: { direction?: 'vertical' | 'horizontal' }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prefix = direction === 'vertical' ? 'anchor' : 'hanchor';
  const sections = [{ id: `${prefix}-overview`, title: '项目概览', children: direction === 'vertical' ? [{ id: `${prefix}-goals`, title: '目标' }, { id: `${prefix}-scope`, title: '范围' }] : undefined }, { id: `${prefix}-members`, title: '项目成员' }, { id: `${prefix}-activity`, title: '最近动态' }, { id: `${prefix}-files`, title: '文件' }];
  const items = sections.map((section) => ({ href: `#${section.id}`, title: section.title, children: section.children?.map((child) => ({ href: `#${child.id}`, title: child.title })) }));
  const anchor = <Anchor items={items} direction={direction} getContainer={() => containerRef.current ?? window} offsetTop={12} replace affix={false} />;
  return <div className={direction === 'vertical' ? 'demo-anchor-layout' : 'demo-anchor-layout demo-anchor-layout--horizontal'}>
    {direction === 'horizontal' && anchor}
    <div ref={containerRef} className="demo-anchor-scroll">
      {sections.flatMap((section) => [section, ...(section.children ?? [])]).map((section) => <section key={section.id} id={section.id} className="demo-anchor-section"><h4>{section.title}</h4><p>滚动内容时，锚点会自动高亮对应区块；点击锚点可平滑定位。</p></section>)}
    </div>
    {direction === 'vertical' && anchor}
  </div>;
}

function ScrollAffix() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pinned, setPinned] = useState(false);
  return <div className="demo-stack" style={{ display: 'grid', gap: 10 }}>
    <div ref={containerRef} className="demo-affix-scroll">
      <p className="demo-affix-filler">向下滚动这个容器，操作栏会固定在容器顶部。</p>
      <Affix target={() => containerRef.current} offsetTop={0} onChange={setPinned}>
        <div className={`demo-affix-bar ${pinned ? 'demo-affix-bar--pinned' : ''}`}><strong>项目设置</strong><Button size="sm" variant="primary">保存更改</Button></div>
      </Affix>
      {Array.from({ length: 8 }, (_, index) => <p key={index} className="demo-affix-filler">内容段落 {index + 1} · 固钉在滚动时保持可见。</p>)}
    </div>
    <span className="demo-hint">当前状态：{pinned ? '已固定' : '未固定'}</span>
  </div>;
}

function OnboardingTour() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'default' | 'primary'>('default');
  const createRef = useRef<HTMLButtonElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const membersRef = useRef<HTMLDivElement | null>(null);
  const steps: TourStep[] = [
    { title: '欢迎使用 Atelier', description: '花 30 秒了解工作区的三个核心区域。' },
    { title: '新建项目', description: '从这里创建项目，所有协作都从一个清晰的项目开始。', target: () => createRef.current, placement: 'bottom-start' },
    { title: '全局搜索', description: '输入名称、成员或标签即可快速定位，也可以用 ⌘K 打开。', target: searchRef, placement: 'bottom' },
    { title: '成员与权限', description: '邀请成员并分配角色，权限变更会实时生效。', target: membersRef, placement: 'top' },
  ];
  return <div className="demo-stack" style={{ display: 'grid', gap: 16 }}>
    <div className="demo-tour-toolbar">
      <Button ref={createRef} variant="primary">＋ 新建项目</Button>
      <div ref={searchRef} className="demo-tour-search">⌕ 搜索项目、成员…</div>
      <div ref={membersRef} className="demo-tour-members"><span>林</span><span>陈</span><span>周</span><em>+3</em></div>
    </div>
    <div className="component-row">
      <Button onClick={() => { setType('default'); setOpen(true); }}>开始引导</Button>
      <Button onClick={() => { setType('primary'); setOpen(true); }}>主色风格</Button>
    </div>
    <Tour open={open} steps={steps} type={type} onClose={() => setOpen(false)} onFinish={() => console.info('tour finished')} />
  </div>;
}

function FloatButtons() {
  const [open, setOpen] = useState(false);
  return <div className="demo-float-stage">
    <div className="demo-float-cell"><FloatButton inline tooltip="帮助" icon={<HelpIcon />} /><span className="demo-hint">默认</span></div>
    <div className="demo-float-cell"><FloatButton inline type="primary" shape="square" icon={<ChatIcon />} description="反馈" badge={{ count: 5 }} /><span className="demo-hint">主色 · 方形 · 徽标</span></div>
    <div className="demo-float-cell">
      <FloatButtonGroup inline shape="square">
        <FloatButton icon={<HelpIcon />} tooltip="帮助" />
        <FloatButton icon={<ChatIcon />} tooltip="反馈" badge={{ dot: true }} />
        <FloatButton icon={<SettingsIcon />} tooltip="设置" />
      </FloatButtonGroup>
      <span className="demo-hint">静态分组</span>
    </div>
    <div className="demo-float-cell demo-float-cell--tall">
      <FloatButtonGroup inline trigger="click" type="primary" open={open} onOpenChange={setOpen} tooltip="快捷操作">
        <FloatButton icon={<EditIcon />} tooltip="新建文档" />
        <FloatButton icon={<UsersIcon />} tooltip="邀请成员" />
        <FloatButton icon={<ChatIcon />} tooltip="发起讨论" />
      </FloatButtonGroup>
      <span className="demo-hint">点击展开菜单</span>
    </div>
    <BackTop visibilityHeight={200} tooltip="回到顶部" />
  </div>;
}

function PopoverExamples() {
  const [open, setOpen] = useState(false);
  return <div className="component-row" style={{ gap: 18 }}>
    <Popover title="分享项目" content="复制链接并邀请团队成员加入。"><Button>点击触发</Button></Popover>
    <Popover trigger="hover" placement="top" content="悬停时显示，离开后延迟关闭。"><Button variant="tertiary">悬停触发</Button></Popover>
    <Popover trigger="focus" placement="right" arrow={false} content="聚焦输入框时显示提示。"><input className="demo-plain-input" placeholder="聚焦触发" aria-label="聚焦触发示例" /></Popover>
    <Popover open={open} onOpenChange={setOpen} placement="bottom-end" title="受控弹层" content={<div className="demo-popover-body"><p>可以在内容中放置任意交互元素。</p><div className="component-row"><Button size="sm" onClick={() => setOpen(false)}>关闭</Button><Button size="sm" variant="primary" onClick={() => setOpen(false)}>知道了</Button></div></div>}>
      <Button variant="primary">受控 · 富内容</Button>
    </Popover>
  </div>;
}

function PopconfirmExamples() {
  const [log, setLog] = useState('');
  return <div className="component-row" style={{ gap: 18 }}>
    <Popconfirm title="归档这个项目？" description="你之后仍可以从归档列表恢复。" onConfirm={() => setLog('已归档')} onCancel={() => setLog('已取消')}><Button>归档项目</Button></Popconfirm>
    <Popconfirm title="删除项目" description="删除后不可恢复，确定继续吗？" okText="删除" okType="danger" placement="bottom" onConfirm={() => new Promise<void>((resolve) => setTimeout(() => { setLog('已删除（异步 800ms）'); resolve(); }, 800))}><Button variant="danger">删除项目</Button></Popconfirm>
    <Popconfirm title="发布到生产环境" description="本示例会模拟一次失败的请求。" okText="发布" placement="right" onConfirm={() => new Promise<void>((_, reject) => setTimeout(() => reject(new Error('network')), 600))}><Button variant="tertiary">模拟失败</Button></Popconfirm>
    <Tag>{log || '等待操作'}</Tag>
  </div>;
}

export const navigationPages: NavigationPageMeta[] = [
  {
    id: 'dropdown', title: 'Dropdown 下拉菜单', icon: '⌄', group: '导航组件', eyebrow: 'NAVIGATION', badge: 'Dropdown', description: '在触发器旁展示一组操作，支持图标、快捷键提示、分组、分割线、危险项与键盘导航。',
    examples: [{ title: '触发方式与菜单结构', description: '点击、悬停与右键三种触发；菜单项支持 icon / extra / group / divider / danger / disabled。', preview: <BasicDropdown />, code: `import { Button } from 'atelier-ui/button';
import { Dropdown, type DropdownItem } from 'atelier-ui/dropdown';

const items: DropdownItem[] = [
  { key: 'edit', label: '编辑项目', extra: '⌘E' },
  { key: 'duplicate', label: '复制项目', extra: '⌘D' },
  { key: 'divider', type: 'divider' },
  { key: 'share', type: 'group', label: '分享', children: [{ key: 'link', label: '复制链接' }, { key: 'invite', label: '邀请成员' }] },
  { key: 'delete', label: '删除项目', danger: true },
];

export function ProjectActions() {
  return (
    <>
      <Dropdown items={items} onSelect={(key) => console.log(key)}>
        <Button>更多操作</Button>
      </Dropdown>
      <Dropdown items={items} trigger="hover" placement="bottom-end" showArrow>
        <span>悬停展开</span>
      </Dropdown>
      <Dropdown items={items} trigger="contextMenu">
        <div style={{ padding: 24, border: '1px dashed #ccc' }}>右键点击此区域</div>
      </Dropdown>
    </>
  );
}` }],
    rows: [['items', 'DropdownItem[]', 'required'], ['onSelect', '(key, item) => void', '—'], ['trigger', "'click' | 'hover' | 'contextMenu' | 数组", "'click'"], ['placement', 'PopupPlacement', "'bottom-start'"], ['open / defaultOpen / onOpenChange', 'boolean / boolean / (open) => void', '—'], ['showArrow', 'boolean', 'false'], ['matchTriggerWidth', 'boolean', 'false'], ['disabled', 'boolean', 'false'], ['overlayClassName / overlayStyle', 'string / CSSProperties', '—'], ['menuClassName', 'string', '—'], ['DropdownItem', '{ key, label, icon?, extra?, disabled?, danger?, type?, children?, onClick? }', '—']],
  },
  {
    id: 'menu', title: 'Menu 导航菜单', icon: '☰', group: '导航组件', eyebrow: 'NAVIGATION', badge: 'Menu', description: '支持内嵌展开、水平与垂直弹出三种模式，可折叠为图标栏，提供深色主题与完整键盘导航。',
    examples: [
      { title: '内嵌模式与折叠', description: '子菜单以动画展开；折叠后仅显示图标，子菜单改为悬浮弹出。', preview: <InlineMenu />, code: `import { useState } from 'react';
import { Menu, type MenuItem } from 'atelier-ui/menu';

const items: MenuItem[] = [
  { key: 'home', label: '工作台', icon: <HomeIcon /> },
  { key: 'projects', label: '项目', icon: <FolderIcon />, children: [
    { key: 'all', label: '全部项目' },
    { key: 'mine', label: '我负责的' },
  ] },
  { key: 'divider', type: 'divider' },
  { key: 'settings', label: '设置', icon: <SettingsIcon /> },
];

export function WorkspaceMenu() {
  const [selected, setSelected] = useState('mine');
  const [collapsed, setCollapsed] = useState(false);
  return (
    <>
      <Menu items={items} selectedKey={selected} onSelect={setSelected} defaultOpenKeys={['projects']} collapsed={collapsed} />
      <button type="button" onClick={() => setCollapsed((value) => !value)}>切换折叠</button>
    </>
  );
}` },
      { title: '水平、垂直弹出与深色主题', description: 'horizontal 适合顶栏；vertical 的子菜单向右弹出；theme="dark" 适配深色侧栏。', preview: <HorizontalMenu />, code: `import { Menu } from 'atelier-ui/menu';

export function Navigations({ items }) {
  return (
    <>
      <Menu mode="horizontal" items={items} defaultSelectedKey="home" />
      <Menu mode="vertical" items={items} defaultSelectedKey="home" />
      <Menu theme="dark" items={items} defaultSelectedKey="design" defaultOpenKeys={['members']} />
    </>
  );
}` },
    ],
    rows: [['items', 'MenuItem[]', 'required'], ['mode', "'inline' | 'vertical' | 'horizontal'", "'inline'"], ['selectedKey / defaultSelectedKey', 'string', '—'], ['onSelect', '(key, item) => void', '—'], ['openKeys / defaultOpenKeys', 'string[]', '— / []'], ['onOpenChange', '(openKeys) => void', '—'], ['collapsed', 'boolean', 'false'], ['theme', "'light' | 'dark'", "'light'"], ['inlineIndent', 'number', '20'], ['selectable', 'boolean', 'true'], ['label', 'string', "'菜单'"], ['MenuItem', '{ key, label, icon?, disabled?, danger?, type?, children?, href?, onClick? }', '—']],
  },
  {
    id: 'anchor', title: 'Anchor 锚点', icon: '⚓', group: '导航组件', eyebrow: 'NAVIGATION', badge: 'Anchor', description: '页内导航：滚动时自动高亮当前区块，点击平滑定位，支持嵌套层级与水平布局。',
    examples: [
      { title: '滚动监听', description: '通过 getContainer 指定滚动容器；滚动时墨条跟随高亮项移动。', preview: <ScrollSpyAnchor />, code: `import { useRef } from 'react';
import { Anchor } from 'atelier-ui/anchor';

export function PageNavigation() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  return (
    <div style={{ display: 'flex', gap: 24 }}>
      <div ref={containerRef} style={{ height: 320, overflow: 'auto' }}>
        <section id="overview">项目概览</section>
        <section id="members">项目成员</section>
        <section id="activity">最近动态</section>
      </div>
      <Anchor
        getContainer={() => containerRef.current ?? window}
        offsetTop={12}
        items={[
          { href: '#overview', title: '项目概览', children: [{ href: '#goals', title: '目标' }] },
          { href: '#members', title: '项目成员' },
          { href: '#activity', title: '最近动态' },
        ]}
        onChange={(href) => console.log(href)}
      />
    </div>
  );
}` },
      { title: '水平方向', description: 'direction="horizontal" 适合放在内容区顶部作为小节导航。', preview: <ScrollSpyAnchor direction="horizontal" />, code: `import { useRef } from 'react';
import { Anchor } from 'atelier-ui/anchor';

export function SectionTabs() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  return (
    <>
      <Anchor
        direction="horizontal"
        affix={false}
        getContainer={() => containerRef.current ?? window}
        items={[{ href: '#overview', title: '概览' }, { href: '#members', title: '成员' }, { href: '#files', title: '文件' }]}
      />
      <div ref={containerRef} style={{ height: 300, overflow: 'auto' }}>
        <section id="overview">概览</section>
        <section id="members">成员</section>
        <section id="files">文件</section>
      </div>
    </>
  );
}` },
    ],
    rows: [['items', 'AnchorItem[]', 'required'], ['offsetTop', 'number', '0'], ['bounds', 'number', '5'], ['targetOffset', 'number', 'offsetTop'], ['direction', "'vertical' | 'horizontal'", "'vertical'"], ['affix', 'boolean', 'true'], ['getContainer', '() => HTMLElement | Window', 'window'], ['replace', 'boolean', 'false'], ['onChange', '(activeHref) => void', '—'], ['onClick', '(event, item) => void', '—'], ['AnchorItem', '{ key?, href, title, children? }', '—']],
  },
  {
    id: 'affix', title: 'Affix 固钉', icon: '⌖', group: '布局组件', eyebrow: 'LAYOUT', badge: 'Affix', description: '当元素滚动到指定位置时将其固定，并以占位元素保持原有布局，支持自定义滚动容器。',
    examples: [{ title: '在滚动容器中固定', description: 'target 指定滚动容器，onChange 返回固定状态。', preview: <ScrollAffix />, code: `import { useRef, useState } from 'react';
import { Affix } from 'atelier-ui/affix';
import { Button } from 'atelier-ui/button';

export function StickyToolbar() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pinned, setPinned] = useState(false);
  return (
    <div ref={containerRef} style={{ height: 260, overflow: 'auto' }}>
      <p>向下滚动…</p>
      <Affix target={() => containerRef.current} offsetTop={0} onChange={setPinned}>
        <div className={pinned ? 'toolbar toolbar--pinned' : 'toolbar'}>
          <strong>项目设置</strong>
          <Button size="sm" variant="primary">保存更改</Button>
        </div>
      </Affix>
      {/* 更多内容 */}
    </div>
  );
}` }],
    rows: [['offsetTop', 'number', '0'], ['offsetBottom', 'number', '—'], ['target', '() => HTMLElement | Window', 'window'], ['onChange', '(affixed: boolean) => void', '—'], ['children', 'ReactNode', 'required']],
  },
  {
    id: 'tour', title: 'Tour 漫游式引导', icon: '✧', group: '反馈组件', eyebrow: 'FEEDBACK', badge: 'Tour', description: '聚光遮罩高亮目标元素，卡片自动定位并带箭头，支持步骤指示、键盘切换与主色风格。',
    examples: [{ title: '分步引导', description: '第一步无目标时居中展示；后续步骤跟随目标元素并平滑过渡。', preview: <OnboardingTour />, code: `import { useRef, useState } from 'react';
import { Button } from 'atelier-ui/button';
import { Tour, type TourStep } from 'atelier-ui/tour';

export function Onboarding() {
  const [open, setOpen] = useState(false);
  const createRef = useRef<HTMLButtonElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const steps: TourStep[] = [
    { title: '欢迎使用 Atelier', description: '花 30 秒了解工作区。' },
    { title: '新建项目', description: '从这里创建项目。', target: () => createRef.current, placement: 'bottom-start' },
    { title: '全局搜索', description: '也可以用 ⌘K 打开。', target: searchRef, placement: 'bottom' },
  ];
  return (
    <>
      <Button ref={createRef} variant="primary">＋ 新建项目</Button>
      <div ref={searchRef}>⌕ 搜索项目、成员…</div>
      <Button onClick={() => setOpen(true)}>开始引导</Button>
      <Tour open={open} steps={steps} onClose={() => setOpen(false)} onFinish={() => console.log('done')} />
    </>
  );
}` }],
    rows: [['steps', 'TourStep[]', 'required'], ['open', 'boolean', 'false'], ['onClose', '(current) => void', '—'], ['onFinish', '() => void', '—'], ['current / defaultCurrent', 'number', '— / 0'], ['onChange', '(current) => void', '—'], ['mask', 'boolean', 'true'], ['type', "'default' | 'primary'", "'default'"], ['arrow', 'boolean', 'true'], ['gap / radius', 'number', '6 / 10'], ['closable', 'boolean', 'true'], ['indicatorsRender', '(current, total) => ReactNode', '圆点'], ['zIndex', 'number', '1200'], ['scrollIntoViewOptions', 'boolean | ScrollIntoViewOptions', "{ block: 'center', behavior: 'smooth' }"], ['TourStep', '{ title, description?, cover?, target?, placement?, mask?, nextButtonProps?, prevButtonProps? }', '—']],
  },
  {
    id: 'floatButton', title: 'FloatButton 悬浮按钮', icon: '↗', group: '基础组件', eyebrow: 'GENERAL', badge: 'FloatButton', description: '固定在视口角落的快捷操作，支持主色与方形样式、徽标、分组展开菜单以及回到顶部。',
    examples: [{ title: '形态、分组与回到顶部', description: '示例以 inline 方式内嵌展示；页面滚动超过 200px 后右下角会出现 BackTop。', preview: <FloatButtons />, code: `import { BackTop, FloatButton, FloatButtonGroup } from 'atelier-ui/float-button';

export function QuickActions() {
  return (
    <>
      <FloatButton tooltip="帮助" icon={<HelpIcon />} />
      <FloatButton type="primary" shape="square" icon={<ChatIcon />} description="反馈" badge={{ count: 5 }} />
      <FloatButtonGroup shape="square">
        <FloatButton icon={<HelpIcon />} tooltip="帮助" />
        <FloatButton icon={<ChatIcon />} tooltip="反馈" badge={{ dot: true }} />
      </FloatButtonGroup>
      <FloatButtonGroup trigger="click" type="primary" tooltip="快捷操作">
        <FloatButton icon={<EditIcon />} tooltip="新建文档" />
        <FloatButton icon={<UsersIcon />} tooltip="邀请成员" />
      </FloatButtonGroup>
      <BackTop visibilityHeight={200} />
    </>
  );
}` }],
    rows: [['icon', 'ReactNode', '↑'], ['description', 'ReactNode', '—'], ['shape', "'circle' | 'square'", "'circle'"], ['type', "'default' | 'primary'", "'default'"], ['tooltip', 'string', '—'], ['href / target', 'string', '—'], ['badge', '{ count?, dot?, overflowCount? }', '—'], ['inline', 'boolean', 'false'], ['FloatButtonGroup.trigger', "'click' | 'hover'", '—'], ['FloatButtonGroup.open / onOpenChange', 'boolean / (open) => void', '—'], ['FloatButtonGroup.placement', "'top' | 'bottom' | 'left' | 'right'", "'top'"], ['BackTop.visibilityHeight', 'number', '400'], ['BackTop.target', '() => HTMLElement | Window', 'window'], ['BackTop.duration', 'number', '450']],
  },
  {
    id: 'popover', title: 'Popover 气泡卡片', icon: '▱', group: '反馈组件', eyebrow: 'FEEDBACK', badge: 'Popover', description: '在触发元素附近展示带标题的浮层，支持点击 / 悬停 / 聚焦触发、八种位置、箭头与受控模式。',
    examples: [{ title: '触发方式与位置', preview: <PopoverExamples />, code: `import { useState } from 'react';
import { Button } from 'atelier-ui/button';
import { Popover } from 'atelier-ui/popover';

export function ShareDetails() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Popover title="分享项目" content="复制链接并邀请团队成员加入。"><Button>点击触发</Button></Popover>
      <Popover trigger="hover" placement="top" content="悬停时显示。"><Button variant="tertiary">悬停触发</Button></Popover>
      <Popover trigger="focus" placement="right" arrow={false} content="聚焦时显示。"><input placeholder="聚焦触发" /></Popover>
      <Popover
        open={open}
        onOpenChange={setOpen}
        placement="bottom-end"
        title="受控弹层"
        content={<Button size="sm" onClick={() => setOpen(false)}>知道了</Button>}
      >
        <Button variant="primary">受控 · 富内容</Button>
      </Popover>
    </>
  );
}` }],
    rows: [['content', 'ReactNode', 'required'], ['title', 'ReactNode', '—'], ['trigger', "'click' | 'hover' | 'focus' | 'contextMenu' | 数组", "'click'"], ['placement', 'PopupPlacement', "'bottom'"], ['arrow', 'boolean', 'true'], ['open / defaultOpen / onOpenChange', 'boolean / boolean / (open) => void', '—'], ['mouseEnterDelay / mouseLeaveDelay', 'number (ms)', '80 / 120'], ['disabled', 'boolean', 'false'], ['overlayClassName / overlayStyle', 'string / CSSProperties', '—'], ['children', 'ReactNode', 'required']],
  },
  {
    id: 'popconfirm', title: 'Popconfirm 气泡确认框', icon: '✓', group: '反馈组件', eyebrow: 'FEEDBACK', badge: 'Popconfirm', description: '就地请求确认，支持异步确认（自动 loading）、失败提示、危险操作样式与自定义文案。',
    examples: [{ title: '基础、异步与失败处理', preview: <PopconfirmExamples />, code: `import { Button } from 'atelier-ui/button';
import { Popconfirm } from 'atelier-ui/popconfirm';

export function ProjectDanger() {
  return (
    <>
      <Popconfirm title="归档这个项目？" description="你之后仍可以从归档列表恢复。" onConfirm={() => console.log('归档')}>
        <Button>归档项目</Button>
      </Popconfirm>
      <Popconfirm
        title="删除项目"
        description="删除后不可恢复，确定继续吗？"
        okText="删除"
        okType="danger"
        onConfirm={() => fetch('/api/projects/1', { method: 'DELETE' }).then(() => undefined)}
      >
        <Button variant="danger">删除项目</Button>
      </Popconfirm>
    </>
  );
}` }],
    rows: [['title', 'ReactNode', 'required'], ['description', 'ReactNode', '—'], ['icon', 'ReactNode', '警示图标'], ['onConfirm', '(event) => void | Promise<void>', '—'], ['onCancel', '(event) => void', '—'], ['okText / cancelText', 'ReactNode', "'确定' / '取消'"], ['okType', "'primary' | 'danger'", "'primary'"], ['showCancel', 'boolean', 'true'], ['errorText', 'ReactNode', "'操作失败，请重试。'"], ['placement', 'PopupPlacement', "'top'"], ['open / defaultOpen / onOpenChange', 'boolean / boolean / (open) => void', '—'], ['disabled', 'boolean', 'false'], ['overlayClassName / overlayStyle', 'string / CSSProperties', '—']],
  },
];

export function isNavigationPageId(id: string): id is NavigationPageId {
  return navigationPages.some((item) => item.id === id);
}

export function NavigationPage({ id }: { id: NavigationPageId }) {
  const page = navigationPages.find((item) => item.id === id);
  if (!page) return null;
  return <>
    <PageHeading eyebrow={page.eyebrow} title={page.title} description={page.description} badge={page.badge} />
    {page.examples.map((example) => <ExampleCard key={example.title} title={example.title} description={example.description} code={example.code}>{example.preview}</ExampleCard>)}
    <ApiTable rows={page.rows} />
  </>;
}
