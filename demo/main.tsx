import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Alert, Avatar, Badge, Breadcrumb, Button, Card, Checkbox, CheckboxGroup, Collapse, Controller, DatePicker, Descriptions, Divider, Drawer, Empty, Input, Modal, Pagination, Progress, RadioGroup,
  Select, Skeleton, Spin, Steps, Switch, Table, Tabs, Tag, Textarea, Timeline, Tooltip, Upload, useFieldArray, useForm, useWatch,
  type TableColumn,
} from '../src';
import { additionalComponents, AdditionalComponentPage, isAdditionalPageId, type AdditionalPageId } from './AdditionalPages';
import { dataEntryPages, DataEntryPage, isDataEntryPageId, type DataEntryPageId } from './DataEntryPages';
import { navigationPages, NavigationPage, isNavigationPageId, type NavigationPageId } from './NavigationPages';
import { dataDisplayPages, DataDisplayPage, isDataDisplayPageId, type DataDisplayPageId } from './DataDisplayPages';
import { ApiTable, ExampleCard, PageHeading } from './shared';
import './styles.css';

type PageId = 'overview' | 'form' | 'buttons' | 'inputs' | 'selection' | 'feedback' | 'table' | 'alert' | 'tag' | 'avatar' | 'tooltip' | 'badge' | 'breadcrumb' | 'divider' | 'empty' | 'pagination' | 'progress' | 'skeleton' | 'spin' | 'tabs' | 'card' | 'descriptions' | 'steps' | 'timeline' | 'collapse' | 'datePicker' | 'upload' | 'drawer' | DataEntryPageId | NavigationPageId | DataDisplayPageId | AdditionalPageId;

const navigation: Array<{ id: PageId; title: string; icon: string; group: string }> = [
  { id: 'overview', title: '组件总览', icon: '◫', group: '开始使用' },
  { id: 'form', title: 'Form Hooks', icon: '⌘', group: '数据录入' },
  { id: 'datePicker', title: 'DatePicker 日期选择', icon: '▦', group: '数据录入' },
  { id: 'upload', title: 'Upload 上传', icon: '↑', group: '数据录入' },
  { id: 'buttons', title: 'Button 按钮', icon: '◉', group: '基础组件' },
  { id: 'card', title: 'Card 卡片', icon: '▢', group: '基础组件' },
  { id: 'inputs', title: 'Input 输入', icon: '▤', group: '数据录入' },
  { id: 'selection', title: '选择组件', icon: '☑', group: '数据录入' },
  ...dataEntryPages.map(({ id, title, icon, group }) => ({ id, title, icon, group })),
  { id: 'feedback', title: 'Modal 弹窗', icon: '▣', group: '反馈组件' },
  { id: 'alert', title: 'Alert 提示', icon: 'ⓘ', group: '反馈组件' },
  { id: 'tooltip', title: 'Tooltip 文字提示', icon: '◉', group: '反馈组件' },
  { id: 'drawer', title: 'Drawer 抽屉', icon: '▣', group: '反馈组件' },
  { id: 'empty', title: 'Empty 空状态', icon: '◌', group: '反馈组件' },
  { id: 'progress', title: 'Progress 进度条', icon: '▰', group: '反馈组件' },
  { id: 'spin', title: 'Spin 加载中', icon: '◌', group: '反馈组件' },
  { id: 'skeleton', title: 'Skeleton 骨架屏', icon: '▤', group: '反馈组件' },
  { id: 'breadcrumb', title: 'Breadcrumb 面包屑', icon: '›', group: '导航组件' },
  { id: 'tabs', title: 'Tabs 标签页', icon: '▥', group: '导航组件' },
  { id: 'pagination', title: 'Pagination 分页', icon: '⇄', group: '导航组件' },
  { id: 'steps', title: 'Steps 步骤条', icon: '①', group: '导航组件' },
  { id: 'table', title: 'Table 表格', icon: '▦', group: '数据展示' },
  { id: 'tag', title: 'Tag 标签', icon: '◇', group: '数据展示' },
  { id: 'avatar', title: 'Avatar 头像', icon: '◌', group: '数据展示' },
  { id: 'badge', title: 'Badge 徽标', icon: '●', group: '数据展示' },
  { id: 'descriptions', title: 'Descriptions 描述列表', icon: '☷', group: '数据展示' },
  { id: 'timeline', title: 'Timeline 时间轴', icon: '⋮', group: '数据展示' },
  { id: 'collapse', title: 'Collapse 折叠面板', icon: '⌄', group: '数据展示' },
  { id: 'divider', title: 'Divider 分割线', icon: '―', group: '基础组件' },
  ...navigationPages.map(({ id, title, icon, group }) => ({ id, title, icon, group })),
  ...dataDisplayPages.map(({ id, title, icon, group }) => ({ id, title, icon, group })),
  ...additionalComponents.map(({ id, title, icon, group }) => ({ id, title, icon, group })),
];

function App() {
  const [page, setPage] = useState<PageId>('overview');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeResult, setActiveResult] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const currentPage = navigation.find((item) => item.id === page)!;
  const groups = [...new Set(navigation.map((item) => item.group))];
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    return navigation.filter((item) => !query || `${item.title} ${item.group}`.toLocaleLowerCase().includes(query));
  }, [searchQuery]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchQuery('');
        setActiveResult(0);
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const navigateTo = (item: typeof navigation[number]) => {
    setPage(item.id);
    setMobileMenu(false);
    setCollapsedGroups((current) => current.filter((group) => group !== item.group));
    setSearchOpen(false);
  };
  const closeSearch = () => {
    setSearchOpen(false);
    searchButtonRef.current?.focus();
  };

  return <div className={`site-shell ${sidebarCollapsed ? 'site-shell--sidebar-collapsed' : ''}`}>
    <aside className={`sidebar ${mobileMenu ? 'sidebar--open' : ''} ${sidebarCollapsed ? 'sidebar--collapsed' : ''}`}>
      <a className="brand" href="#top" onClick={(event) => { event.preventDefault(); setPage('overview'); }}>
        <span className="brand__mark"><span /><span /><span /><span /></span>
        <span className="brand__name">atelier<span>ui</span><small>DESIGN SYSTEM</small></span>
      </a>
      <div className="sidebar__version"><span>组件手册</span><span className="version-pill">v0.1.0</span></div>
      <nav className="side-nav" aria-label="组件导航">
        {groups.map((group, groupIndex) => {
          const isCollapsed = collapsedGroups.includes(group);
          const groupId = `nav-group-${groupIndex}`;
          return <div className="side-nav__group" key={group}>
          <button type="button" className="side-nav__label" aria-label={`${group} 分类`} aria-expanded={!isCollapsed} aria-controls={groupId} title={sidebarCollapsed ? group : undefined} onClick={() => setCollapsedGroups((current) => isCollapsed ? current.filter((item) => item !== group) : [...current, group])}>
            <span>{sidebarCollapsed ? group.slice(0, 1) : group}</span><span className={`side-nav__chevron ${isCollapsed ? 'side-nav__chevron--collapsed' : ''}`} aria-hidden="true">⌄</span>
          </button>
          <div className="side-nav__items" id={groupId} hidden={isCollapsed}>
            {navigation.filter((item) => item.group === group).map((item) => <button type="button" key={item.id} title={sidebarCollapsed ? item.title : undefined} aria-label={item.title} className={`side-nav__item ${page === item.id ? 'side-nav__item--active' : ''}`} onClick={() => navigateTo(item)}><span className="side-nav__icon">{item.icon}</span><span className="side-nav__item-label">{item.title}</span>{item.id === 'form' && <span className="nav-tag">NEW</span>}</button>)}
          </div>
          </div>;
        })}
      </nav>
      <div className="sidebar__bottom"><div className="sidebar-note"><span className="sidebar-note__spark">✳</span><div><strong>精心打磨每个细节</strong><span>为产品界面而生的组件</span></div></div><div className="sidebar__copyright">Made for thoughtful interfaces <span>✦</span></div></div>
    </aside>
    <main className="main-area" id="top">
      <header className="topbar"><button className="sidebar-toggle" type="button" aria-label={sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'} title={sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'} onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}><span aria-hidden="true">{sidebarCollapsed ? '›' : '‹'}</span></button><button className="mobile-menu" type="button" aria-label={mobileMenu ? '关闭导航' : '打开导航'} onClick={() => { setSidebarCollapsed(false); setMobileMenu((open) => !open); }}>☰</button><div className="breadcrumbs"><span>组件手册</span><span className="crumb-separator">/</span><strong>{currentPage.title}</strong></div><div className="topbar__right"><button ref={searchButtonRef} className="search-trigger" type="button" onClick={() => { setSearchQuery(''); setActiveResult(0); setSearchOpen(true); }} aria-label="全局搜索，Command 加 K"><span aria-hidden="true">⌕</span><kbd>⌘ K</kbd></button><span className="topbar__status"><i /> 所有组件已就绪</span></div></header>
      <div className="content-wrap">
        {page === 'overview' && <Overview onNavigate={setPage} />}
        {page === 'form' && <FormPage />}
        {page === 'buttons' && <ButtonPage />}
        {page === 'inputs' && <InputPage />}
        {page === 'selection' && <SelectionPage />}
        {page === 'feedback' && <FeedbackPage />}
        {page === 'table' && <TablePage />}
        {page === 'alert' && <AlertPage />}
        {page === 'tag' && <TagPage />}
        {page === 'avatar' && <AvatarPage />}
        {page === 'tooltip' && <TooltipPage />}
        {page === 'badge' && <BadgePage />}
        {page === 'breadcrumb' && <BreadcrumbPage />}
        {page === 'divider' && <DividerPage />}
        {page === 'empty' && <EmptyPage />}
        {page === 'pagination' && <PaginationPage />}
        {page === 'progress' && <ProgressPage />}
        {page === 'skeleton' && <SkeletonPage />}
        {page === 'spin' && <SpinPage />}
        {page === 'tabs' && <TabsPage />}
        {page === 'card' && <CardPage />}
        {page === 'descriptions' && <DescriptionsPage />}
        {page === 'steps' && <StepsPage />}
        {page === 'timeline' && <TimelinePage />}
        {page === 'collapse' && <CollapsePage />}
        {page === 'datePicker' && <DatePickerPage />}
        {page === 'upload' && <UploadPage />}
        {page === 'drawer' && <DrawerPage />}
        {isDataEntryPageId(page) && <DataEntryPage id={page} />}
        {isNavigationPageId(page) && <NavigationPage id={page} />}
        {isDataDisplayPageId(page) && <DataDisplayPage id={page} />}
        {isAdditionalPageId(page) && <AdditionalComponentPage id={page} />}
        <footer className="site-footer"><span>Atelier UI · 让界面细节自然发生</span><span>React 18 · TypeScript</span></footer>
      </div>
    </main>
    {searchOpen && <div className="search-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) closeSearch(); }}>
      <section className="global-search" role="dialog" aria-modal="true" aria-labelledby="global-search-title">
        <h2 id="global-search-title" className="sr-only">搜索组件</h2>
        <div className="global-search__input-wrap"><span aria-hidden="true">⌕</span><input ref={searchInputRef} value={searchQuery} onChange={(event) => { setSearchQuery(event.target.value); setActiveResult(0); }} onKeyDown={(event) => {
          if (event.key === 'Escape') { event.preventDefault(); closeSearch(); }
          if (event.key === 'ArrowDown' && searchResults.length) { event.preventDefault(); setActiveResult((index) => Math.min(index + 1, searchResults.length - 1)); }
          if (event.key === 'ArrowUp' && searchResults.length) { event.preventDefault(); setActiveResult((index) => Math.max(index - 1, 0)); }
          if (event.key === 'Enter' && searchResults[activeResult]) { event.preventDefault(); navigateTo(searchResults[activeResult]); }
        }} placeholder="搜索组件或分类…" aria-label="搜索组件或分类" aria-controls="global-search-results" aria-activedescendant={searchResults[activeResult] ? `search-result-${searchResults[activeResult].id}` : undefined} autoComplete="off" /><kbd>ESC</kbd></div>
        <div className="global-search__results" id="global-search-results" role="listbox" aria-label="搜索结果">
          {searchResults.length ? searchResults.map((item, index) => <button type="button" role="option" aria-selected={activeResult === index} id={`search-result-${item.id}`} key={item.id} className={`global-search__result ${activeResult === index ? 'global-search__result--active' : ''}`} onMouseEnter={() => setActiveResult(index)} onClick={() => navigateTo(item)}><span className="global-search__result-icon">{item.icon}</span><span className="global-search__result-copy"><strong>{item.title}</strong><small>{item.group}</small></span><kbd>↵</kbd></button>) : <p className="global-search__empty">没有找到匹配的组件</p>}
        </div>
        <footer className="global-search__footer"><span>↑ ↓ 选择</span><span>Enter 打开</span><span>Esc 关闭</span></footer>
      </section>
    </div>}
  </div>;
}

// Every code panel is a standalone TSX example with its imports and local state.
const codeSamples = {
  workspaceForm: `import { Button } from 'atelier-ui/button';
import { Input } from 'atelier-ui/input';
import { Select } from 'atelier-ui/select';
import { Controller, useFieldArray, useForm } from 'atelier-ui/form';

type WorkspaceValues = {
  name: string;
  email: string;
  plan: string;
  members: Array<{ name: string; role: string }>;
};

const plans = [
  { label: 'Starter · 个人项目', value: 'starter' },
  { label: 'Studio · 成长团队', value: 'studio' },
  { label: 'Enterprise · 大型组织', value: 'enterprise' },
];

export function CreateWorkspace() {
  const form = useForm<WorkspaceValues>({
    mode: 'onBlur',
    defaultValues: {
      name: '',
      email: '',
      plan: 'studio',
      members: [{ name: 'Jordan Lee', role: 'Admin' }],
    },
  });
  const members = useFieldArray<WorkspaceValues, WorkspaceValues['members'][number]>({
    control: form.control,
    name: 'members',
  });

  const onSubmit = form.handleSubmit(async (values) => {
    console.log('Create workspace:', values);
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <Input
        label="工作区名称"
        placeholder="例如：Northstar Studio"
        error={form.formState.errors.name?.message}
        {...form.register('name', {
          required: '请输入工作区名称',
          minLength: { value: 3, message: '至少输入 3 个字符' },
        })}
      />
      <Input
        label="工作邮箱"
        type="email"
        placeholder="you@company.com"
        error={form.formState.errors.email?.message}
        {...form.register('email', {
          required: '请输入工作邮箱',
          pattern: {
            value: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/,
            message: '请输入有效的邮箱地址',
          },
        })}
      />
      <Controller
        control={form.control}
        name="plan"
        render={({ field }) => (
          <Select
            label="选择套餐"
            options={plans}
            value={String(field.value ?? '')}
            onChange={(value) => field.onChange(value)}
            onBlur={field.onBlur}
          />
        )}
      />
      <h3>团队成员</h3>
      {members.fields.map((member, index) => (
        <div key={member.id}>
          <Input
            aria-label={\`成员 \${index + 1} 姓名\`}
            placeholder="姓名"
            {...form.register(\`members.\${index}.name\`)}
          />
          <Select
            aria-label={\`成员 \${index + 1} 角色\`}
            options={[
              { label: '管理员', value: 'Admin' },
              { label: '成员', value: 'Member' },
              { label: '访客', value: 'Guest' },
            ]}
            {...form.register(\`members.\${index}.role\`)}
          />
          <button type="button" onClick={() => members.remove(index)}>移除成员</button>
        </div>
      ))}
      <button type="button" onClick={() => members.append({ name: '', role: 'Member' })}>
        添加成员
      </button>
      <Button type="submit" variant="primary" loading={form.formState.isSubmitting}>
        创建工作区
      </Button>
    </form>
  );
}`,
  buttonTypes: `import { Button } from 'atelier-ui/button';

export function ButtonTypes() {
  return (
    <div>
      <Button variant="primary">创建项目</Button>
      <Button variant="secondary">取消</Button>
      <Button variant="tertiary">了解更多</Button>
      <Button variant="danger">删除项目</Button>
      <Button variant="ghost">更多操作</Button>
    </div>
  );
}`,
  buttonStates: `import { Button } from 'atelier-ui/button';

export function ButtonSizesAndStates() {
  return (
    <div>
      <Button size="sm">小号按钮</Button>
      <Button size="md">默认尺寸</Button>
      <Button size="lg" variant="primary">主要操作</Button>
      <Button loading variant="primary">正在保存</Button>
      <Button disabled>暂不可用</Button>
    </div>
  );
}`,
  buttonLoading: `import { useState } from 'react';
import { Button } from 'atelier-ui/button';

export function SaveSettingsButton() {
  const [loading, setLoading] = useState(false);

  async function saveSettings() {
    setLoading(true);
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 1200));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="primary" loading={loading} onClick={saveSettings}>
      保存设置
    </Button>
  );
}`,
  inputs: `import { useState } from 'react';
import { Input } from 'atelier-ui/input';

export function ProjectFields() {
  const [query, setQuery] = useState('');

  return (
    <div>
      <Input label="项目名称" placeholder="请输入项目名称" />
      <Input
        label="搜索成员"
        placeholder="按姓名或邮箱搜索"
        prefix={<span aria-hidden="true">⌕</span>}
        clearable
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <Input
        label="工作邮箱"
        type="email"
        placeholder="name@company.com"
        error="请输入有效的邮箱地址"
      />
      <Input label="只读字段" value="workspace-id-1842" readOnly hint="此字段由系统自动生成" />
    </div>
  );
}`,
  textarea: `import { Textarea } from 'atelier-ui/textarea';

export function ProjectDescription() {
  return (
    <Textarea
      label="项目简介"
      placeholder="描述一下这个项目…"
      rows={4}
      hint="简单介绍项目目标和团队协作方式"
    />
  );
}`,
  checkbox: `import { useState } from 'react';
import { Checkbox, CheckboxGroup } from 'atelier-ui/checkbox';

const topicOptions = [
  { label: '产品设计', value: 'design' },
  { label: '工程实践', value: 'engineering' },
  { label: '团队管理', value: 'team' },
];

export function NotificationPreferences() {
  const [updatesEnabled, setUpdatesEnabled] = useState(true);
  const [topics, setTopics] = useState(['design']);

  return (
    <div>
      <Checkbox
        checked={updatesEnabled}
        onChange={(event) => setUpdatesEnabled(event.target.checked)}
      >
        接收产品更新
      </Checkbox>
      <CheckboxGroup options={topicOptions} value={topics} onChange={setTopics} />
      <p>已选择：{topics.join('、') || '无'}</p>
    </div>
  );
}`,
  radio: `import { useState } from 'react';
import { RadioGroup } from 'atelier-ui/radio';

const roles = [
  { label: '管理员', value: 'admin' },
  { label: '成员', value: 'member' },
  { label: '访客', value: 'guest' },
];

export function WorkspaceRolePicker() {
  const [role, setRole] = useState('member');

  return (
    <div>
      <RadioGroup name="workspace-role" options={roles} value={role} onChange={setRole} />
      <p>当前角色：{role}</p>
    </div>
  );
}`,
  switch: `import { useState } from 'react';
import { Switch } from 'atelier-ui/switch';

export function ProductUpdatesSwitch() {
  const [enabled, setEnabled] = useState(true);

  return (
    <label>
      <span>开启产品更新</span>
      <Switch
        checked={enabled}
        onChange={(event) => setEnabled(event.target.checked)}
        checkedChildren="开"
        unCheckedChildren="关"
      />
    </label>
  );
}`,
  modal: `import { useState } from 'react';
import { Button } from 'atelier-ui/button';
import { Input } from 'atelier-ui/input';
import { Modal } from 'atelier-ui/modal';

export function InviteMember() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');

  async function sendInvitation() {
    console.log('Invite:', email);
    setOpen(false);
  }

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>邀请成员</Button>
      <Modal
        open={open}
        title="邀请团队成员"
        onClose={() => setOpen(false)}
        onOk={sendInvitation}
      >
        <Input
          label="邮箱地址"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </Modal>
    </>
  );
}`,
  confirm: `import { Button } from 'atelier-ui/button';
import { Modal } from 'atelier-ui/modal';

export function DeleteProjectButton() {
  function deleteProject() {
    console.log('Project deleted');
  }

  function confirmDelete() {
    Modal.confirm({
      title: '删除这个项目？',
      content: '此操作无法撤销。',
      danger: true,
      onOk: deleteProject,
    });
  }

  return <Button variant="danger" onClick={confirmDelete}>删除项目</Button>;
}`,
  table: `import { useState } from 'react';
import type { Key } from 'react';
import { Table, type TableColumn } from 'atelier-ui/table';

type Project = {
  id: string;
  name: string;
  owner: string;
  status: string;
  members: number;
};

const projects: Project[] = [
  { id: 'p-01', name: '品牌视觉升级', owner: '林知夏', status: '进行中', members: 8 },
  { id: 'p-02', name: '移动端体验优化', owner: '陈一川', status: '评审中', members: 5 },
  { id: 'p-03', name: '秋季产品发布', owner: '周禾', status: '已完成', members: 12 },
];

const columns: TableColumn<Project>[] = [
  { key: 'name', title: '项目名称', dataIndex: 'name', sorter: true },
  { key: 'owner', title: '负责人', dataIndex: 'owner' },
  { key: 'status', title: '状态', dataIndex: 'status' },
  { key: 'members', title: '成员', dataIndex: 'members', align: 'center' },
];

export function ProjectTable() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  return (
    <Table<Project>
      rowKey="id"
      columns={columns}
      dataSource={projects}
      rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
      onChange={(change) => console.log('Table change:', change)}
    />
  );
}`,
  serverTable: `import { useState } from 'react';
import { Table, type TableChange, type TableColumn } from 'atelier-ui/table';

type Project = { id: string; name: string; owner: string; status: string };

const allProjects: Project[] = Array.from({ length: 42 }, (_, index) => ({
  id: String(index + 1),
  name: '项目 ' + (index + 1),
  owner: index % 2 === 0 ? '林知夏' : '陈一川',
  status: index % 2 === 0 ? '进行中' : '已完成',
}));

async function requestProjects(change: TableChange) {
  await new Promise((resolve) => window.setTimeout(resolve, 250));
  const start = (change.page - 1) * change.pageSize;
  return allProjects.slice(start, start + change.pageSize);
}

const columns: TableColumn<Project>[] = [
  { key: 'name', title: '项目名称', dataIndex: 'name', sorter: true },
  { key: 'owner', title: '负责人', dataIndex: 'owner' },
  { key: 'status', title: '状态', dataIndex: 'status' },
];

export function ServerProjectTable() {
  const [page, setPage] = useState(1);
  const [pageData, setPageData] = useState(allProjects.slice(0, 10));
  const [loading, setLoading] = useState(false);

  async function handleTableChange(change: TableChange) {
    setLoading(true);
    setPage(change.page);
    try {
      setPageData(await requestProjects(change));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Table<Project>
      mode="server"
      rowKey="id"
      columns={columns}
      dataSource={pageData}
      currentPage={page}
      total={allProjects.length}
      pageSize={10}
      loading={loading}
      onChange={handleTableChange}
    />
  );
}`,
  alert: `import { Alert } from 'atelier-ui/alert';

export function WorkspaceNotice() {
  return (
    <div>
      <Alert variant="info" title="即将发布">
        项目成员会收到一封更新通知。
      </Alert>
      <Alert variant="success" title="更改已保存" closable>
        你的工作区信息已更新。
      </Alert>
      <Alert variant="warning" title="存储空间不足">
        请清理文件或升级套餐后继续上传。
      </Alert>
      <Alert variant="error" title="保存失败">
        网络连接中断，请重试。
      </Alert>
    </div>
  );
}`,
  tag: `import { useState } from 'react';
import { Tag } from 'atelier-ui/tag';

export function ProjectTags() {
  const [showDesignTag, setShowDesignTag] = useState(true);

  return (
    <div>
      <Tag variant="primary">设计中</Tag>
      <Tag variant="success">已发布</Tag>
      <Tag variant="warning">待审核</Tag>
      <Tag variant="danger">已阻塞</Tag>
      {showDesignTag && (
        <Tag closable onClose={() => setShowDesignTag(false)}>
          可移除标签
        </Tag>
      )}
    </div>
  );
}`,
  avatar: `import { Avatar } from 'atelier-ui/avatar';

export function TeamAvatars() {
  return (
    <div>
      <Avatar name="林知夏" size="sm" />
      <Avatar name="陈一川" />
      <Avatar name="周禾" size="lg" />
    </div>
  );
}`,
  tooltip: `import { Button } from 'atelier-ui/button';
import { Tooltip } from 'atelier-ui/tooltip';

export function HelpTooltip() {
  return (
    <Tooltip title="保存后，所有工作区成员都能看到更新。" placement="top">
      <Button variant="secondary">保存帮助</Button>
    </Tooltip>
  );
}`,
  badge: `import { Avatar } from 'atelier-ui/avatar';
import { Badge } from 'atelier-ui/badge';
import { Button } from 'atelier-ui/button';

export function NotificationBadge() {
  return (
    <div>
      <Badge count={5}>
        <Avatar name="林知夏" />
      </Badge>
      <Badge count={128} overflowCount={99}>
        <Button>通知</Button>
      </Badge>
      <Badge status="success" text="项目运行正常" />
    </div>
  );
}`,
  breadcrumb: `import { Breadcrumb } from 'atelier-ui/breadcrumb';

export function ProjectBreadcrumb() {
  return (
    <Breadcrumb
      items={[
        { title: '工作区', href: '/' },
        { title: '项目列表', href: '/projects' },
        { title: '品牌视觉升级' },
      ]}
    />
  );
}`,
  breadcrumbCustom: `import { Breadcrumb } from 'atelier-ui/breadcrumb';

export function CustomBreadcrumb() {
  return (
    <Breadcrumb
      separator="›"
      items={[
        { title: '设计团队' },
        { title: '品牌项目' },
        { title: '视觉规范' },
      ]}
    />
  );
}`,
  divider: `import { Divider } from 'atelier-ui/divider';

export function ContentDivider() {
  return (
    <section>
      <p>项目概览</p>
      <Divider orientation="horizontal" />
      <p>成员与权限</p>
      <Divider orientation="vertical" />
      <span>最近更新</span>
    </section>
  );
}`,
  dividerVertical: `import { Divider } from 'atelier-ui/divider';

export function InlineDivider() {
  return (
    <div>
      <span>项目</span>
      <Divider orientation="vertical" />
      <span>成员</span>
      <Divider orientation="vertical" dashed />
      <span>设置</span>
    </div>
  );
}`,
  empty: `import { Button } from 'atelier-ui/button';
import { Empty } from 'atelier-ui/empty';

export function EmptyProjects() {
  return (
    <Empty description="还没有项目">
      <Button variant="primary">创建第一个项目</Button>
    </Empty>
  );
}`,
  emptySearch: `import { Empty } from 'atelier-ui/empty';

export function EmptySearchResults() {
  return <Empty description="没有找到符合条件的结果" />;
}`,
  pagination: `import { useState } from 'react';
import { Pagination } from 'atelier-ui/pagination';

export function ProjectPagination() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  return (
    <Pagination
      current={page}
      pageSize={pageSize}
      total={86}
      showSizeChanger
      onChange={(nextPage, nextPageSize) => {
        setPage(nextPage);
        setPageSize(nextPageSize);
      }}
    />
  );
}`,
  progress: `import { Progress } from 'atelier-ui/progress';

export function UploadProgress() {
  return (
    <div>
      <Progress percent={68} status="active" label="上传中 68%" />
      <Progress percent={100} />
      <Progress percent={42} status="exception" />
    </div>
  );
}`,
  skeleton: `import { Skeleton } from 'atelier-ui/skeleton';

export function ProjectCardPlaceholder() {
  return <Skeleton active avatar title paragraph={{ rows: 3 }} />;
}`,
  skeletonSimple: `import { Skeleton } from 'atelier-ui/skeleton';

export function CompactPlaceholder() {
  return <Skeleton title={false} paragraph={{ rows: 2 }} />;
}`,
  spin: `import { Spin } from 'atelier-ui/spin';

export function LoadingProject() {
  return (
    <Spin spinning tip="正在加载项目…">
      <section style={{ minHeight: 120 }}>
        项目内容加载完成后会显示在这里。
      </section>
    </Spin>
  );
}`,
  spinSizes: `import { Spin } from 'atelier-ui/spin';

export function LoadingIndicators() {
  return (
    <div>
      <Spin size="sm" />
      <Spin tip="正在加载项目…" />
      <Spin size="lg" />
    </div>
  );
}`,
  spinContent: `import { useState } from 'react';
import { Button } from 'atelier-ui/button';
import { Spin } from 'atelier-ui/spin';

export function LoadingMembers() {
  const [spinning, setSpinning] = useState(true);

  return (
    <div>
      <Spin spinning={spinning} tip="正在同步成员…">
        <section style={{ minHeight: 120 }}>
          项目成员：林知夏、陈一川、周禾
        </section>
      </Spin>
      <Button onClick={() => setSpinning((value) => !value)}>
        切换加载状态
      </Button>
    </div>
  );
}`,
  tabs: `import { Tabs } from 'atelier-ui/tabs';

export function ProjectTabs() {
  return (
    <Tabs
      defaultActiveKey="overview"
      items={[
        { key: 'overview', label: '概览', children: '项目进度和关键指标。' },
        { key: 'members', label: '成员', children: '管理项目成员与权限。' },
        { key: 'activity', label: '动态', children: '查看项目最近的变更。' },
      ]}
    />
  );
}`,
  card: `import { Button } from 'atelier-ui/button';
import { Card } from 'atelier-ui/card';

export function ProjectCard() {
  return (
    <div>
      <Card title="品牌视觉升级" extra={<Button variant="tertiary">查看详情</Button>} hoverable>
        <p>正在为新一季产品更新品牌视觉与设计规范。</p>
        <span>最近更新 · 3 分钟前</span>
      </Card>
      <Card title="快速提示" bordered={false}>
        卡片可以按需关闭边框，适合嵌入分组内容。
      </Card>
    </div>
  );
}`,
  descriptions: `import { Descriptions } from 'atelier-ui/descriptions';

export function ProjectDetails() {
  return (
    <Descriptions
      title="项目详情"
      bordered
      column={2}
      items={[
        { key: 'name', label: '项目名称', children: '品牌视觉升级' },
        { key: 'owner', label: '负责人', children: '林知夏' },
        { key: 'status', label: '项目状态', children: '进行中' },
        { key: 'updated', label: '最近更新', children: '3 分钟前' },
      ]}
    />
  );
}`,
  steps: `import { useState } from 'react';
import { Button } from 'atelier-ui/button';
import { Steps } from 'atelier-ui/steps';

export function WorkspaceSetup() {
  const [current, setCurrent] = useState(1);

  return (
    <div>
      <Steps
        current={current}
        onChange={setCurrent}
        items={[
          { title: '创建工作区', description: '填写基本信息' },
          { title: '邀请成员', description: '与团队协作' },
          { title: '完成设置', description: '开始使用' },
        ]}
      />
      <Button onClick={() => setCurrent((step) => (step + 1) % 3)}>
        下一步
      </Button>
    </div>
  );
}`,
  timeline: `import { Timeline } from 'atelier-ui/timeline';

export function ProjectActivity() {
  return (
    <Timeline
      items={[
        { key: 'created', label: '09:30', content: '项目已创建' },
        { key: 'invited', label: '10:15', content: '林知夏邀请了 3 位成员' },
        { key: 'updated', label: '11:20', content: '更新了项目视觉规范' },
      ]}
      pending="等待下一次更新"
    />
  );
}`,
  collapse: `import { useState } from 'react';
import { Collapse } from 'atelier-ui/collapse';

export function ProjectSettings() {
  const [activeKey, setActiveKey] = useState('members');

  return (
    <Collapse
      accordion
      activeKey={activeKey}
      onChange={(key) => setActiveKey(String(key))}
      items={[
        { key: 'members', title: '成员与权限', children: '管理工作区成员的访问级别。' },
        { key: 'notifications', title: '通知设置', children: '选择项目更新的通知方式。' },
        { key: 'archive', title: '归档项目', children: '归档后项目会从活跃列表中移除。' },
      ]}
    />
  );
}`,
  datePicker: `import { useState } from 'react';
import { DatePicker } from 'atelier-ui/date-picker';

export function ReleaseDate() {
  const [date, setDate] = useState('2026-11-15');

  return (
    <div>
      <DatePicker
        label="预计发布日期"
        hint="选择一个工作日作为目标日期"
        value={date}
        onChange={(event) => setDate(event.target.value)}
      />
      <DatePicker label="只读日期" defaultValue="2026-10-27" disabled />
    </div>
  );
}`,
  upload: `import { useState } from 'react';
import { Upload } from 'atelier-ui/upload';

export function ProjectFiles() {
  const [fileNames, setFileNames] = useState<string[]>([]);

  return (
    <div>
      <Upload
        accept=".pdf,.png,.jpg"
        multiple
        onChange={(files) => setFileNames(files.map((file) => file.name))}
      />
      <p>{fileNames.length ? '已选择 ' + fileNames.length + ' 个文件' : '选择的文件仅保存在当前演示状态中'}</p>
    </div>
  );
}`,
  drawer: `import { useState } from 'react';
import { Button } from 'atelier-ui/button';
import { Descriptions } from 'atelier-ui/descriptions';
import { Drawer } from 'atelier-ui/drawer';

export function ProjectDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        查看项目详情
      </Button>
      <Drawer open={open} title="项目详情" onClose={() => setOpen(false)}>
        <p>项目成员、访问权限和最近动态会显示在这里。</p>
        <Descriptions
          column={1}
          items={[
            { key: 'owner', label: '负责人', children: '林知夏' },
            { key: 'status', label: '状态', children: '进行中' },
          ]}
        />
      </Drawer>
    </>
  );
}`,
} as const;

function Overview({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  return <>
    <section className="hero">
      <div className="hero__copy"><div className="hero__kicker"><span>✦</span> A small system for thoughtful products</div><h1>好组件，<em>让界面<br />自然发生。</em></h1><p>一套从零构建的 React 组件库。清晰的 API、克制的视觉与灵活的 Hooks，让产品界面从基础到细节都恰到好处。</p><div className="hero__actions"><Button variant="primary" onClick={() => onNavigate('form')}>探索 Form Hooks <span>↗</span></Button><Button onClick={() => onNavigate('buttons')}>浏览基础组件</Button></div><div className="hero__meta"><span><b className="meta-dot meta-dot--purple" /> React 18</span><span><b className="meta-dot meta-dot--green" /> TypeScript</span><span><b className="meta-dot meta-dot--orange" /> CSS Variables</span></div></div>
      <div className="hero-art" aria-label="组件库示例卡片"><div className="hero-art__halo" /><div className="floating-chip floating-chip--top"><i>✦</i> Thoughtful by design</div><div className="hero-card"><div className="hero-card__top"><span className="hero-card__tag">NEW PROJECT</span><span className="hero-card__more">···</span></div><div className="hero-card__title">Create a workspace</div><div className="hero-card__sub">Tell us a little about your team.</div><div className="mock-label">Workspace name</div><div className="mock-input"><span>✳</span> Northstar Studio</div><div className="mock-label mock-label--spaced">Plan</div><div className="mock-select"><span className="mock-avatar">✦</span><span><b>Studio</b><small>For growing teams</small></span><span className="mock-check">✓</span></div><div className="mock-footer"><span>Step 1 of 3</span><Button variant="primary" size="sm">Continue <span>→</span></Button></div></div><div className="floating-chip floating-chip--bottom"><span className="avatar-stack"><i>J</i><i>M</i><i>A</i></span> Built for real work</div><span className="hero-art__star hero-art__star--one">✳</span><span className="hero-art__star hero-art__star--two">✦</span></div>
    </section>
    <section className="stats-strip"><div><strong>32</strong><span>精心设计的常用组件</span></div><i /><div><strong>01</strong><span>灵活的表单 Hooks</span></div><i /><div><strong>100<span>%</span></strong><span>TypeScript 类型支持</span></div><i /><div><strong>CSS</strong><span>变量驱动的主题系统</span></div></section>
    <div className="section-intro"><div><div className="eyebrow"><span className="eyebrow__dot" /> COMPONENT LIBRARY</div><h2>从基础控件，到完整体验</h2><p>每个组件都经过精心设计，准备好成为你产品的一部分。</p></div><span className="section-index">01 — 04</span></div>
    <div className="overview-grid">
      <OverviewTile index="01" title="Form Hooks" subtitle="灵活管理表单状态" color="lavender" icon="⌘" onClick={() => onNavigate('form')}><div className="tile-form-preview"><div className="tile-form-preview__label">项目名称 <i>*</i></div><div className="tile-form-preview__input">Aurora workspace <span>⌁</span></div><div className="tile-form-preview__hint">名称清晰，团队更易找到</div></div><span className="tile-tag">useForm · Controller · useFieldArray</span></OverviewTile>
      <OverviewTile index="02" title="基础组件" subtitle="一切从好的细节开始" color="peach" icon="◉" onClick={() => onNavigate('buttons')}><div className="tile-button-preview"><span className="tile-mock-button tile-mock-button--primary">Create project</span><span className="tile-mock-button">Cancel</span><span className="tile-mock-button tile-mock-button--text">Learn more ↗</span></div><span className="tile-tag">Button · Input · Select · Switch</span></OverviewTile>
      <OverviewTile index="03" title="反馈体验" subtitle="适时出现，恰好表达" color="mint" icon="▣" onClick={() => onNavigate('feedback')}><div className="tile-feedback-preview"><span className="success-mark">✓</span><span><b>更改已保存</b><small>你的工作区已更新</small></span><span className="feedback-time">刚刚</span></div><span className="tile-tag">Modal · Confirm · Loading</span></OverviewTile>
      <OverviewTile index="04" title="数据展示" subtitle="让信息更清晰有序" color="sky" icon="▦" onClick={() => onNavigate('table')}><div className="tile-table-preview"><div><i /><b>可见性</b><span>成员</span><em>最近更新</em></div><div><i /><b>仅团队</b><span>12 人</span><em>3 分钟前</em></div><div><i /><b>公开</b><span>28 人</span><em>昨天</em></div></div><span className="tile-tag">Table · Pagination · Selection</span></OverviewTile>
    </div>
    <section className="principles"><div className="principles__intro"><div className="eyebrow"><span className="eyebrow__dot" /> THE PRINCIPLES</div><h2>设计从不止于<br /><em>看起来不错。</em></h2><p>好用的组件，应该把正确的默认值、可靠的状态管理与柔和的视觉融合在一起。</p><Button variant="tertiary" onClick={() => onNavigate('form')}>了解表单设计理念 <span>→</span></Button></div><div className="principle-list"><Principle number="01" title="清晰而有力的 API" text="熟悉的心智模型，减少学习成本，让你专注于产品本身。" /><Principle number="02" title="状态管理不打扰" text="订阅式更新与受控接入，字段变化只更新真正相关的内容。" /><Principle number="03" title="细节经得起推敲" text="从焦点状态到错误提示，每一次交互都有清楚的回应。" /></div></section>
    <section className="getting-started"><div><span className="eyebrow"><span className="eyebrow__dot" /> GET STARTED</span><h2>从一个组件开始，<br />搭建属于你的界面。</h2><p>安装后即可使用组件与 Hooks。完整文档、交互示例和 API 说明都在这里。</p></div><div className="install-card"><div className="install-card__top"><span><i /> Terminal</span><span>⌘</span></div><code><b>$</b> npm install ../atelier-ui</code><div className="install-card__line" /><pre><span>import</span> {'{ useForm }'} <span>from</span> <i>'atelier-ui/form'</i></pre><Button variant="primary" onClick={() => onNavigate('buttons')}>开始浏览 <span>↗</span></Button></div></section>
  </>;
}

function OverviewTile({ index, title, subtitle, color, icon, onClick, children }: { index: string; title: string; subtitle: string; color: string; icon: string; onClick: () => void; children: ReactNode }) {
  return <button type="button" className={`overview-tile overview-tile--${color}`} onClick={onClick}><div className="overview-tile__head"><span className="tile-icon">{icon}</span><span className="tile-index">{index}</span></div><div className="overview-tile__text"><h3>{title}</h3><span>{subtitle}</span></div><div className="overview-tile__visual">{children}</div><span className="tile-arrow">↗</span></button>;
}

function Principle({ number, title, text }: { number: string; title: string; text: string }) {
  return <div className="principle"><span className="principle__number">{number}</span><div><h3>{title}</h3><p>{text}</p></div><span className="principle__spark">✦</span></div>;
}

function FormPage() {
  const form = useForm<{ workspace: string; email: string; plan: string; updates: boolean; members: Array<{ name: string; role: string }> }>({ mode: 'onBlur', defaultValues: { workspace: '', email: '', plan: 'studio', updates: true, members: [{ name: 'Jordan Lee', role: 'Admin' }] } });
  const members = useFieldArray<{ workspace: string; email: string; plan: string; updates: boolean; members: Array<{ name: string; role: string }> }, { name: string; role: string }>({ control: form.control, name: 'members' });
  const watchedPlan = useWatch({ control: form.control, name: 'plan' });
  const onSubmit = form.handleSubmit(async (values) => {
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    window.alert(`已创建工作区：${values.workspace}`);
  });
  return <>
    <PageHeading eyebrow="FORM MANAGEMENT" title="Form Hooks" description="以 Hooks 管理表单状态、校验与提交。用原生 form 组织界面，让数据流保持清晰。" badge="Hook-first API" />
    <div className="docs-callout"><span>✦</span><div><strong>从 useForm 开始</strong><p>字段通过 register 接入；复杂受控组件使用 Controller。字段订阅独立更新，减少不必要的渲染。</p></div><a href="#form-api">API 说明 ↓</a></div>
    <ExampleCard title="创建工作区" description="结合注册字段、受控 Select、动态成员列表与提交状态。" code={codeSamples.workspaceForm}>
      <div className="form-preview-layout"><form className="workspace-form" onSubmit={(event) => void onSubmit(event)} noValidate>
        <div className="form-preview-heading"><span className="form-preview-icon">✳</span><div><h4>创建你的工作区</h4><p>邀请团队成员，一起开始协作。</p></div></div>
        <div className="form-fields-grid"><Input label="工作区名称" placeholder="例如：Northstar Studio" error={form.formState.errors.workspace?.message} {...form.register('workspace', { required: '请输入工作区名称', minLength: { value: 3, message: '至少输入 3 个字符' } })} /><Input label="工作邮箱" placeholder="you@company.com" type="email" error={form.formState.errors.email?.message} {...form.register('email', { required: '请输入工作邮箱', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '请输入有效的邮箱地址' } })} /></div>
        <Controller control={form.control} name="plan" render={({ field }) => <Select label="选择套餐" value={String(field.value ?? '')} onChange={(value) => field.onChange(value)} onBlur={field.onBlur} options={[{ label: 'Starter · 个人项目', value: 'starter' }, { label: 'Studio · 成长团队', value: 'studio' }, { label: 'Enterprise · 大型组织', value: 'enterprise' }]} />} />
        <div className="dynamic-members"><div className="dynamic-members__top"><div><label className="at-field__label">团队成员</label><span>添加一起协作的伙伴</span></div><Button size="sm" onClick={() => members.append({ name: '', role: 'Member' })}>＋ 添加成员</Button></div>{members.fields.map((member, index) => <div className="member-row" key={member.id}><Input aria-label={`成员 ${index + 1} 姓名`} placeholder="姓名" {...form.register(`members.${index}.name`)} /><Select aria-label={`成员 ${index + 1} 角色`} options={[{ label: '管理员', value: 'Admin' }, { label: '成员', value: 'Member' }, { label: '访客', value: 'Guest' }]} {...form.register(`members.${index}.role`)} /><button type="button" className="remove-member" aria-label="移除成员" onClick={() => members.remove(index)}>×</button></div>)}</div>
        <div className="form-preview-footer"><Checkbox {...form.register('updates')}>接收产品更新和团队灵感</Checkbox><Button type="submit" variant="primary" loading={form.formState.isSubmitting}>创建工作区 <span>→</span></Button></div>
      </form><aside className="form-state-panel"><div className="state-panel__title"><span>LIVE STATE</span><i /></div><div className="state-row"><span>当前套餐</span><b>{String(watchedPlan ?? '—')}</b></div><div className="state-row"><span>表单状态</span><b className={form.formState.isDirty ? 'state-value--active' : ''}>{form.formState.isDirty ? '已修改' : '初始状态'}</b></div><div className="state-row"><span>校验状态</span><b>{form.formState.isValid ? '无错误' : `${Object.keys(form.formState.errors).length} 个错误`}</b></div><div className="state-json"><span>formState</span><code>{`{\n  isDirty: ${form.formState.isDirty},\n  isSubmitting: ${form.formState.isSubmitting},\n  submitCount: ${form.formState.submitCount}\n}`}</code></div><button type="button" className="reset-link" onClick={() => form.reset()}>↺ 重置所有字段</button></aside></div>
    </ExampleCard>
    <div className="section-heading-row" id="form-api"><div><div className="eyebrow"><span className="eyebrow__dot" /> CORE API</div><h2>让表单状态有迹可循</h2></div><span className="section-index">01 — 03</span></div>
    <div className="api-grid"><ApiCard title="useForm" text="创建并配置表单实例，返回字段注册、提交处理和状态控制方法。" tags={['register', 'handleSubmit', 'reset', 'trigger']} /><ApiCard title="Controller" text="连接 Select 等受控组件，统一提供 value、onChange、onBlur 与字段状态。" tags={['field', 'fieldState', 'formState']} /><ApiCard title="useFieldArray" text="管理动态增删的字段数组，并提供 append、remove、move 等操作。" tags={['append', 'remove', 'move', 'replace']} /></div>
    <div className="implementation-note"><span>✦</span><p><strong>校验按需触发。</strong>默认在提交时校验，也可以配置为输入或失焦时校验。内置规则覆盖必填、长度、数值范围、正则与异步自定义校验；Resolver 可连接 Zod 或 Yup。</p></div>
  </>;
}

function ApiCard({ title, text, tags }: { title: string; text: string; tags: string[] }) {
  return <article className="api-card"><span className="api-card__icon">⌘</span><h3>{title}</h3><p>{text}</p><div className="api-tags">{tags.map((tag) => <code key={tag}>{tag}</code>)}</div></article>;
}

function ButtonPage() {
  const [loading, setLoading] = useState(false);
  return <><PageHeading eyebrow="FOUNDATIONS" title="Button 按钮" description="清楚表达操作优先级，在需要的时候给出恰到好处的反馈。" badge="Button" />
    <ExampleCard title="按钮类型" description="根据操作的重要程度，选择合适的视觉权重。" code={codeSamples.buttonTypes}><div className="component-row"><Button variant="primary">创建项目 <span>→</span></Button><Button variant="secondary">取消</Button><Button variant="tertiary">了解更多 ↗</Button><Button variant="danger">删除项目</Button><Button variant="ghost">更多操作</Button></div></ExampleCard>
    <ExampleCard title="尺寸与状态" description="提供三种尺寸，并支持加载和禁用状态。" code={codeSamples.buttonStates}><div className="component-row component-row--align-end"><Button size="sm">小号按钮</Button><Button size="md">默认尺寸</Button><Button size="lg" variant="primary">主要操作</Button><Button loading variant="primary">正在保存</Button><Button disabled>暂不可用</Button></div></ExampleCard>
    <ExampleCard title="交互示例" description="点击按钮体验异步加载状态。" code={codeSamples.buttonLoading}><div className="component-row"><Button variant="primary" loading={loading} onClick={() => { setLoading(true); window.setTimeout(() => setLoading(false), 1200); }}>保存设置</Button><span className="demo-hint">点击后显示 1.2 秒加载状态</span></div></ExampleCard>
    <ApiTable rows={[["variant", "primary | secondary | tertiary | danger | ghost", "secondary"], ["size", "sm | md | lg", "md"], ["loading", "boolean", "false"], ["fullWidth", "boolean", "false"], ["icon", "ReactNode", "—"]]} />
  </>;
}

function InputPage() {
  const [query, setQuery] = useState('');
  return <><PageHeading eyebrow="DATA ENTRY" title="Input 输入组件" description="为文本与多行内容提供清晰、友好的输入体验。" badge="Input · Textarea" />
    <ExampleCard title="Input 输入框" description="支持标签、提示、错误状态、前后缀和清空操作。" code={codeSamples.inputs}><div className="input-demo-grid"><Input label="项目名称" placeholder="请输入项目名称" /><Input label="搜索成员" placeholder="按姓名或邮箱搜索" prefix={<span className="search-icon">⌕</span>} clearable value={query} onChange={(event) => setQuery(event.target.value)} /><Input label="工作邮箱" placeholder="name@company.com" error="请输入有效的邮箱地址" /><Input label="只读字段" value="workspace-id-1842" readOnly hint="此字段由系统自动生成" /></div></ExampleCard>
    <ExampleCard title="Textarea 多行输入" description="适合备注、描述等较长内容。" code={codeSamples.textarea}><div className="textarea-demo"><Textarea label="项目简介" placeholder="描述一下这个项目…" rows={4} hint="简单介绍项目目标和团队协作方式" /></div></ExampleCard>
    <ApiTable rows={[["label", "string", "—"], ["hint / error", "string", "—"], ["prefix / suffix", "ReactNode", "—"], ["clearable", "boolean", "false"], ["size", "'sm' | 'md' | 'lg'", "'md'"], ["rows", "number", "3"]]} />
  </>;
}

function SelectionPage() {
  const [topics, setTopics] = useState(['design']);
  const [role, setRole] = useState('member');
  const [enabled, setEnabled] = useState(true);
  return <><PageHeading eyebrow="DATA ENTRY" title="选择组件" description="Checkbox、Radio 与 Switch，覆盖多选、单选和即时开关状态。" badge="Checkbox · Radio · Switch" />
    <ExampleCard title="Checkbox 多选" description="独立复选和分组选项都支持受控状态。" code={codeSamples.checkbox}><div className="selection-layout"><div className="selection-block"><span className="demo-label">独立复选</span><Checkbox defaultChecked>同意服务条款</Checkbox><Checkbox disabled>当前不可选</Checkbox></div><div className="selection-block"><span className="demo-label">兴趣主题</span><CheckboxGroup value={topics} onChange={setTopics} options={[{ label: '产品设计', value: 'design' }, { label: '工程实践', value: 'engineering' }, { label: '团队管理', value: 'team' }]} /><span className="demo-hint">已选择：{topics.join('、') || '无'}</span></div></div></ExampleCard>
    <ExampleCard title="Radio 单选" description="在一组选项中选择一个明确的值。" code={codeSamples.radio}><div className="selection-layout"><div className="selection-block"><span className="demo-label">工作区角色</span><RadioGroup name="role-demo" value={role} onChange={setRole} options={[{ label: '管理员', value: 'admin' }, { label: '成员', value: 'member' }, { label: '访客', value: 'guest' }]} /><span className="demo-hint">当前角色：{role}</span></div></div></ExampleCard>
    <ExampleCard title="Switch 开关" description="用于立即生效的二元设置。" code={codeSamples.switch}><div className="switch-row"><div><strong>开启产品更新</strong><span>接收功能更新、技巧与灵感</span></div><Switch checked={enabled} onChange={(event) => setEnabled(event.target.checked)} checkedChildren="开" unCheckedChildren="关" /></div></ExampleCard>
  </>;
}

function FeedbackPage() {
  const [open, setOpen] = useState(false);
  return <><PageHeading eyebrow="FEEDBACK" title="Modal 弹窗" description="在需要聚焦重要决策时出现，不打断用户理解当前上下文。" badge="Modal" />
    <ExampleCard title="受控 Modal" description="用于确认、编辑或承载需要专注完成的短流程。" code={codeSamples.modal}><div className="component-row"><Button variant="primary" onClick={() => setOpen(true)}>邀请成员</Button><span className="demo-hint">弹窗支持遮罩关闭、Escape 和焦点管理</span></div><Modal open={open} title="邀请团队成员" description="发送邀请后，对方会收到一封加入工作区的邮件。" onClose={() => setOpen(false)} onOk={() => setOpen(false)}><div className="modal-demo-content"><Input label="邮箱地址" placeholder="name@company.com" /><Select label="成员权限" options={[{ label: '成员 · 可编辑内容', value: 'member' }, { label: '管理员 · 管理工作区', value: 'admin' }, { label: '访客 · 仅查看', value: 'guest' }]} /><p className="modal-demo-note">你可以在成员设置中随时调整权限。</p></div></Modal></ExampleCard>
    <ExampleCard title="命令式确认" description="删除、归档等需要明确确认的破坏性操作。" code={codeSamples.confirm}><div className="component-row"><Button variant="danger" onClick={() => Modal.confirm({ title: '删除这个项目？', content: '删除后，项目和其中的所有内容都将无法恢复。', danger: true, onOk: () => window.alert('项目已删除') })}>删除项目</Button><span className="demo-hint">点击体验命令式确认弹窗</span></div></ExampleCard>
    <ApiTable rows={[["open", "boolean", "—"], ["onClose", "() => void", "—"], ["onOk", "() => void | Promise<void>", "—"], ["maskClosable", "boolean", "true"], ["closeOnEscape", "boolean", "true"], ["Modal.confirm", "ConfirmOptions → { destroy }", "—"]]} />
  </>;
}

function AlertPage() {
  return <>
    <PageHeading eyebrow="FEEDBACK" title="Alert 提示" description="用语义化状态表达成功、提醒和错误信息。" badge="Alert" />
    <ExampleCard title="提示类型" description="提供信息、成功、警告和错误四种状态。" code={codeSamples.alert}>
      <div className="common-demo-stack">
        <Alert variant="info" title="即将发布">项目成员会收到一封更新通知。</Alert>
        <Alert variant="success" title="更改已保存" closable>你的工作区信息已更新。</Alert>
        <Alert variant="warning" title="存储空间不足">请清理文件或升级套餐后继续上传。</Alert>
        <Alert variant="error" title="保存失败">网络连接中断，请重试。</Alert>
      </div>
    </ExampleCard>
    <ApiTable rows={[["variant", "info | success | warning | error", "info"], ["title", "ReactNode", "—"], ["closable", "boolean", "false"], ["onClose", "() => void", "—"]]} />
  </>;
}

function TagPage() {
  const [showTag, setShowTag] = useState(true);
  return <>
    <PageHeading eyebrow="DATA DISPLAY" title="Tag 标签" description="为状态、分类和筛选条件提供紧凑标记。" badge="Tag" />
    <ExampleCard title="标签类型" description="用颜色区分标签的语义和优先级。" code={codeSamples.tag}>
      <div className="common-demo-row">
        <Tag variant="primary">设计中</Tag><Tag variant="success">已发布</Tag><Tag variant="warning">待审核</Tag><Tag variant="danger">已阻塞</Tag>
        {showTag && <Tag closable onClose={() => setShowTag(false)}>可移除标签</Tag>}
      </div>
    </ExampleCard>
    <ApiTable rows={[["variant", "neutral | primary | success | warning | danger", "neutral"], ["closable", "boolean", "false"], ["onClose", "() => void", "—"]]} />
  </>;
}

function AvatarPage() {
  return <>
    <PageHeading eyebrow="DATA DISPLAY" title="Avatar 头像" description="展示成员身份，并在图片不可用时使用姓名首字母。" badge="Avatar" />
    <ExampleCard title="头像尺寸与回退" description="提供多种尺寸；图片无法加载时显示姓名标记。" code={codeSamples.avatar}>
      <div className="common-demo-row common-demo-row--align-end">
        <Avatar name="林知夏" size="sm" /><Avatar name="陈一川" /><Avatar name="周禾" size="lg" />
        <span className="demo-hint">图片加载失败时自动回退到姓名标记</span>
      </div>
    </ExampleCard>
    <ApiTable rows={[["src", "string", "—"], ["alt / name", "string", "—"], ["size", "sm | md | lg", "md"]]} />
  </>;
}

function TooltipPage() {
  return <>
    <PageHeading eyebrow="FEEDBACK" title="Tooltip 文字提示" description="悬停或键盘聚焦时显示简短补充说明。" badge="Tooltip" />
    <ExampleCard title="提示位置" description="可将提示放在触发元素的上、下、左或右侧。" code={codeSamples.tooltip}>
      <div className="common-demo-row">
        <Tooltip title="保存后，所有工作区成员都能看到更新。" placement="top"><Button variant="secondary">保存帮助</Button></Tooltip>
        <Tooltip title="邀请链接将在 7 天后失效。" placement="right"><Button variant="tertiary">邀请说明</Button></Tooltip>
        <span className="demo-hint">将鼠标移到按钮上，或使用 Tab 键聚焦</span>
      </div>
    </ExampleCard>
    <ApiTable rows={[["title", "ReactNode", "required"], ["placement", "top | bottom | left | right", "top"], ["children", "ReactNode", "required"]]} />
  </>;
}

function BadgePage() {
  return <><PageHeading eyebrow="DATA DISPLAY" title="Badge 徽标" description="在图标、头像等元素旁呈现数量或状态提醒。" badge="Badge" />
    <ExampleCard title="数量与状态" description="支持数字上限、红点和语义状态。" code={codeSamples.badge}><div className="common-demo-row"><Badge count={5}><Avatar name="林知夏" size="lg" /></Badge><Badge count={128} overflowCount={99}><Button>通知</Button></Badge><Badge dot><Button variant="secondary">消息</Button></Badge><Badge status="success" text="项目运行正常" /></div></ExampleCard>
    <ApiTable rows={[["count", "ReactNode", "—"], ["dot", "boolean", "false"], ["overflowCount", "number", "99"], ["showZero", "boolean", "false"], ["status", "default | success | processing | warning | error", "default"], ["text", "ReactNode", "—"]]} />
  </>;
}

function BreadcrumbPage() {
  return <><PageHeading eyebrow="NAVIGATION" title="Breadcrumb 面包屑" description="展示当前位置，并帮助用户快速返回上级页面。" badge="Breadcrumb" />
    <ExampleCard title="页面路径" description="通过 href 或 onClick 为上级路径提供导航行为。" code={codeSamples.breadcrumb}><Breadcrumb items={[{ title: '工作区', onClick: () => window.alert('返回工作区') }, { title: '项目列表', onClick: () => window.alert('返回项目列表') }, { title: '品牌视觉升级' }]} /></ExampleCard>
    <ExampleCard title="自定义分隔符" description="分隔符可以是文本或任意 React 节点。" code={codeSamples.breadcrumbCustom}><Breadcrumb separator="›" items={[{ title: '设计团队' }, { title: '品牌项目' }, { title: '视觉规范' }]} /></ExampleCard>
    <ApiTable rows={[["items", "BreadcrumbItem[]", "required"], ["items[].title", "ReactNode", "required"], ["items[].href", "string", "—"], ["items[].onClick", "() => void", "—"], ["separator", "ReactNode", "'/ '"]]} />
  </>;
}

function DividerPage() {
  return <><PageHeading eyebrow="FOUNDATIONS" title="Divider 分割线" description="分隔相邻内容，或为相关信息添加轻量标题。" badge="Divider" />
    <ExampleCard title="水平分割" description="支持普通线、虚线与带标题分割线。" code={codeSamples.divider}><div className="divider-demo"><span>项目概览</span><Divider /><span>成员与权限</span><Divider dashed>团队设置</Divider><span>最近更新</span></div></ExampleCard>
    <ExampleCard title="垂直分割" code={codeSamples.dividerVertical}><div className="common-demo-row"><span>项目</span><Divider orientation="vertical" /><span>成员</span><Divider orientation="vertical" dashed /><span>设置</span></div></ExampleCard>
    <ApiTable rows={[["orientation", "horizontal | vertical", "horizontal"], ["dashed", "boolean", "false"], ["plain", "boolean", "false"], ["children", "ReactNode", "—"]]} />
  </>;
}

function EmptyPage() {
  return <><PageHeading eyebrow="FEEDBACK" title="Empty 空状态" description="在列表、搜索或数据面板中清楚说明当前没有内容。" badge="Empty" />
    <ExampleCard title="带操作的空状态" description="提供下一步操作，帮助用户从空白状态继续。" code={codeSamples.empty}><Empty description="还没有项目"><Button variant="primary">创建第一个项目</Button></Empty></ExampleCard>
    <ExampleCard title="自定义描述" code={codeSamples.emptySearch}><Empty description="没有找到符合条件的结果" /></ExampleCard>
    <ApiTable rows={[["description", "ReactNode", "暂无数据"], ["image", "ReactNode", "默认插画"], ["children", "ReactNode", "—"]]} />
  </>;
}

function PaginationPage() {
  const [current, setCurrent] = useState(3);
  const [pageSize, setPageSize] = useState(10);
  return <><PageHeading eyebrow="NAVIGATION" title="Pagination 分页" description="将长列表拆分为清晰、可浏览的数据页。" badge="Pagination" />
    <ExampleCard title="分页与每页条数" description="支持受控页码、总数提示及每页条数切换。" code={codeSamples.pagination}><Pagination current={current} pageSize={pageSize} total={86} showSizeChanger onChange={(page, size) => { setCurrent(page); setPageSize(size); }} /></ExampleCard>
    <ApiTable rows={[["current", "number", "required"], ["pageSize", "number", "required"], ["total", "number", "required"], ["onChange", "(page, pageSize) => void", "required"], ["showSizeChanger", "boolean", "false"], ["pageSizeOptions", "number[]", "[10, 20, 50]"]]} />
  </>;
}

function ProgressPage() {
  const [percent, setPercent] = useState(68);
  return <><PageHeading eyebrow="FEEDBACK" title="Progress 进度条" description="用进度和状态让长时间任务保持可见。" badge="Progress" />
    <ExampleCard title="进度与状态" description="百分比会限制在 0 至 100，并支持自定义文案和颜色。" code={codeSamples.progress}><div className="common-demo-stack"><Progress percent={percent} status="active" label={`上传中 ${percent}%`} /><Progress percent={100} /><Progress percent={42} status="exception" label="上传失败 · 42%" /><Button onClick={() => setPercent((value) => value >= 100 ? 0 : value + 8)}>推进进度</Button></div></ExampleCard>
    <ApiTable rows={[["percent", "number", "required"], ["status", "normal | active | success | exception", "自动判断"], ["showInfo", "boolean", "true"], ["strokeColor", "string", "主题色"], ["label", "ReactNode", "百分比"]]} />
  </>;
}

function SkeletonPage() {
  return <><PageHeading eyebrow="FEEDBACK" title="Skeleton 骨架屏" description="内容加载时先展示结构轮廓，减少页面跳动。" badge="Skeleton" />
    <ExampleCard title="动态骨架" description="支持头像、标题和可配置行数。" code={codeSamples.skeleton}><Skeleton active avatar title paragraph={{ rows: 3 }} /></ExampleCard>
    <ExampleCard title="简洁占位" code={codeSamples.skeletonSimple}><Skeleton title={false} paragraph={{ rows: 2 }} /></ExampleCard>
    <ApiTable rows={[["active", "boolean", "false"], ["avatar", "boolean", "false"], ["title", "boolean", "true"], ["paragraph", "boolean | { rows?: number }", "true"]]} />
  </>;
}

function SpinPage() {
  const [spinning, setSpinning] = useState(true);
  return <><PageHeading eyebrow="FEEDBACK" title="Spin 加载中" description="在请求或局部内容更新期间提供轻量加载反馈。" badge="Spin" />
    <ExampleCard title="独立加载指示器" description="提供三种尺寸和可选说明。" code={codeSamples.spinSizes}><div className="common-demo-row"><Spin size="sm" /><Spin tip="正在加载项目…" /><Spin size="lg" /></div></ExampleCard>
    <ExampleCard title="局部内容加载" description="可以遮罩一个容器，保留上下文。" code={codeSamples.spinContent}><div className="spin-demo"><Spin spinning={spinning} tip="正在同步成员…"><div><strong>项目成员</strong><p>林知夏 · 陈一川 · 周禾</p></div></Spin></div><Button onClick={() => setSpinning((value) => !value)}>{spinning ? '显示内容' : '重新加载'}</Button></ExampleCard>
    <ApiTable rows={[["spinning", "boolean", "true"], ["size", "sm | md | lg", "md"], ["tip", "ReactNode", "—"], ["children", "ReactNode", "—"]]} />
  </>;
}

function TabsPage() {
  const [activeKey, setActiveKey] = useState('overview');
  return <><PageHeading eyebrow="NAVIGATION" title="Tabs 标签页" description="在同一页面内切换相互关联的内容视图。" badge="Tabs" />
    <ExampleCard title="受控标签页" description="支持受控或默认选中，并提供键盘方向键切换。" code={codeSamples.tabs}><Tabs activeKey={activeKey} onChange={setActiveKey} items={[{ key: 'overview', label: '概览', children: '项目进度和关键指标会显示在这里。' }, { key: 'members', label: '成员', children: '管理项目成员与权限。' }, { key: 'activity', label: '动态', children: '查看项目最近的变更。' }]} /></ExampleCard>
    <ApiTable rows={[["items", "TabItem[]", "required"], ["items[].key", "string", "required"], ["items[].label", "ReactNode", "required"], ["items[].children", "ReactNode", "required"], ["activeKey", "string", "非受控"], ["onChange", "(key) => void", "—"]]} />
  </>;
}

function CardPage() {
  return <><PageHeading eyebrow="FOUNDATIONS" title="Card 卡片" description="将相关内容、操作和信息组织在独立容器中。" badge="Card" />
    <ExampleCard title="带标题与操作的卡片" description="支持标题、辅助操作和悬停反馈。" code={codeSamples.card}><div className="card-demo"><Card title="品牌视觉升级" extra={<Button variant="tertiary">查看详情</Button>} hoverable><p>正在为新一季产品更新品牌视觉与设计规范。</p><span>最近更新 · 3 分钟前</span></Card><Card title="快速提示" bordered={false}>卡片可以按需关闭边框，适合嵌入分组内容。</Card></div></ExampleCard>
    <ApiTable rows={[["title", "ReactNode", "—"], ["extra", "ReactNode", "—"], ["hoverable", "boolean", "false"], ["bordered", "boolean", "true"], ["children", "ReactNode", "—"]]} />
  </>;
}

function DescriptionsPage() {
  const items = [{ key: 'name', label: '项目名称', children: '品牌视觉升级' }, { key: 'owner', label: '负责人', children: '林知夏' }, { key: 'status', label: '项目状态', children: '进行中' }, { key: 'updated', label: '最近更新', children: '3 分钟前' }];
  return <><PageHeading eyebrow="DATA DISPLAY" title="Descriptions 描述列表" description="以标签和值的形式展示对象属性和详情信息。" badge="Descriptions" />
    <ExampleCard title="项目详情" description="支持自适应列数和边框布局。" code={codeSamples.descriptions}><Descriptions title="项目详情" bordered column={2} items={items} /></ExampleCard>
    <ApiTable rows={[["items", "DescriptionItem[]", "required"], ["items[].key", "string", "required"], ["items[].label", "ReactNode", "required"], ["items[].children", "ReactNode", "required"], ["column", "number", "3"], ["bordered", "boolean", "false"]]} />
  </>;
}

function StepsPage() {
  const [current, setCurrent] = useState(1);
  const items = [{ title: '创建工作区', description: '填写基本信息' }, { title: '邀请成员', description: '与团队协作' }, { title: '完成设置', description: '开始使用' }];
  return <><PageHeading eyebrow="NAVIGATION" title="Steps 步骤条" description="展示多阶段流程的进度，并帮助用户理解当前步骤。" badge="Steps" />
    <ExampleCard title="可交互步骤" description="点击步骤切换当前进度，也可仅展示只读状态。" code={codeSamples.steps}><div className="steps-demo"><Steps current={current} onChange={setCurrent} items={items} /><Button onClick={() => setCurrent((step) => (step + 1) % items.length)}>下一步</Button></div></ExampleCard>
    <ApiTable rows={[["items", "StepItem[]", "required"], ["current", "number", "0"], ["direction", "horizontal | vertical", "horizontal"], ["onChange", "(step) => void", "—"], ["items[].status", "wait | process | finish | error", "自动计算"]]} />
  </>;
}

function TimelinePage() {
  const items = [{ key: 'created', label: '09:30', content: '项目已创建' }, { key: 'invited', label: '10:15', content: '林知夏邀请了 3 位成员' }, { key: 'updated', label: '11:20', content: '更新了项目视觉规范', color: '#48a982' }];
  return <><PageHeading eyebrow="DATA DISPLAY" title="Timeline 时间轴" description="按时间顺序呈现活动、变更和事件记录。" badge="Timeline" />
    <ExampleCard title="项目动态" description="支持时间标记、节点颜色和待处理项。" code={codeSamples.timeline}><Timeline items={items} pending="等待下一次更新" /></ExampleCard>
    <ApiTable rows={[["items", "TimelineItem[]", "required"], ["items[].key", "string", "required"], ["items[].content", "ReactNode", "required"], ["items[].label", "ReactNode", "—"], ["items[].color", "string", "主题色"], ["pending", "ReactNode", "—"]]} />
  </>;
}

function CollapsePage() {
  const [activeKey, setActiveKey] = useState('members');
  const items = [{ key: 'members', title: '成员与权限', children: '管理工作区成员的访问级别。' }, { key: 'notifications', title: '通知设置', children: '选择项目更新的通知方式。' }, { key: 'archive', title: '归档项目', children: '归档后项目会从活跃列表中移除。' }];
  return <><PageHeading eyebrow="DATA DISPLAY" title="Collapse 折叠面板" description="按需展开内容，保持长页面结构简洁。" badge="Collapse" />
    <ExampleCard title="手风琴面板" description="手风琴模式下同一时间只展开一项。" code={codeSamples.collapse}><Collapse accordion activeKey={activeKey} onChange={(key) => setActiveKey(String(key))} items={items} /></ExampleCard>
    <ApiTable rows={[["items", "CollapseItem[]", "required"], ["accordion", "boolean", "false"], ["activeKey", "string | string[]", "非受控"], ["defaultActiveKey", "string | string[]", "—"], ["onChange", "(activeKey) => void", "—"]]} />
  </>;
}

function DatePickerPage() {
  const [date, setDate] = useState('2026-11-15');
  return <><PageHeading eyebrow="DATA ENTRY" title="DatePicker 日期选择" description="使用浏览器原生日期控件输入和选择日期。" badge="DatePicker" />
    <ExampleCard title="发布日期" description="保留原生键盘与平台日期选择交互。" code={codeSamples.datePicker}><div className="common-demo-stack"><DatePicker label="预计发布日期" hint="选择一个工作日作为目标日期" value={date} onChange={(event) => setDate(event.target.value)} /><span className="demo-hint">当前值：{date}</span><DatePicker label="只读日期" defaultValue="2026-10-27" disabled /></div></ExampleCard>
    <ApiTable rows={[["label", "ReactNode", "—"], ["hint / error", "ReactNode", "—"], ["value / defaultValue", "string", "—"], ["min / max", "string", "—"], ["disabled", "boolean", "false"], ["onChange", "ChangeEvent<HTMLInputElement>", "—"]]} />
  </>;
}

function UploadPage() {
  const [fileNames, setFileNames] = useState<string[]>([]);
  return <><PageHeading eyebrow="DATA ENTRY" title="Upload 上传" description="通过选择文件或拖放文件，将本地内容接入业务流程。" badge="Upload" />
    <ExampleCard title="项目附件" description="支持文件类型过滤、多选、拖放和移除已选文件。" code={codeSamples.upload}><div className="upload-demo"><Upload accept=".pdf,.png,.jpg" multiple onChange={(files) => setFileNames(files.map((file) => file.name))} /><span className="demo-hint">{fileNames.length ? `已选择 ${fileNames.length} 个文件` : '选择的文件仅保存在当前演示状态中'}</span></div></ExampleCard>
    <ApiTable rows={[["accept", "string", "—"], ["multiple", "boolean", "false"], ["disabled", "boolean", "false"], ["onChange", "(files: File[]) => void", "—"]]} />
  </>;
}

function DrawerPage() {
  const [open, setOpen] = useState(false);
  return <><PageHeading eyebrow="FEEDBACK" title="Drawer 抽屉" description="从页面边缘展示辅助内容，同时保留当前页面上下文。" badge="Drawer" />
    <ExampleCard title="项目详情抽屉" description="支持左右方向、遮罩关闭和 Escape 关闭。" code={codeSamples.drawer}><div className="common-demo-row"><Button variant="primary" onClick={() => setOpen(true)}>查看项目详情</Button><span className="demo-hint">点击打开右侧抽屉</span><Drawer open={open} title="项目详情" onClose={() => setOpen(false)}><p>项目成员、访问权限和最近动态会显示在这里。</p><Descriptions column={1} items={[{ key: 'owner', label: '负责人', children: '林知夏' }, { key: 'status', label: '状态', children: '进行中' }]} /></Drawer></div></ExampleCard>
    <ApiTable rows={[["open", "boolean", "required"], ["title", "ReactNode", "—"], ["placement", "left | right", "right"], ["width", "number | string", "420"], ["onClose", "() => void", "required"], ["maskClosable / closeOnEscape", "boolean", "true"]]} />
  </>;
}

type Project = { id: string; name: string; owner: string; status: string; updated: string; members: number };
const projects: Project[] = [
  { id: 'p-01', name: '品牌视觉升级', owner: '林知夏', status: '进行中', updated: '3 分钟前', members: 8 },
  { id: 'p-02', name: '移动端体验优化', owner: '陈一川', status: '评审中', updated: '28 分钟前', members: 5 },
  { id: 'p-03', name: '秋季产品发布', owner: '周禾', status: '已完成', updated: '昨天', members: 12 },
  { id: 'p-04', name: '客户洞察研究', owner: '许安然', status: '进行中', updated: '昨天', members: 4 },
  { id: 'p-05', name: '设计系统 2.0', owner: '顾清', status: '评审中', updated: '2 天前', members: 9 },
  { id: 'p-06', name: '增长落地页', owner: '沈星野', status: '已完成', updated: '3 天前', members: 3 },
  { id: 'p-07', name: '合作伙伴门户', owner: '白予', status: '进行中', updated: '4 天前', members: 7 },
  { id: 'p-08', name: '数据看板改版', owner: '叶知秋', status: '已完成', updated: '上周', members: 6 },
  { id: 'p-09', name: '帮助中心重构', owner: '唐木', status: '评审中', updated: '上周', members: 4 },
];
const projectColumns: TableColumn<Project>[] = [
  { key: 'name', title: '项目名称', dataIndex: 'name', sorter: true, render: (value) => <span className="project-cell"><i className="project-cell__icon">✳</i><b>{String(value)}</b></span> },
  { key: 'owner', title: '负责人', dataIndex: 'owner' },
  { key: 'status', title: '状态', dataIndex: 'status', filters: [{ label: '进行中', value: '进行中' }, { label: '评审中', value: '评审中' }, { label: '已完成', value: '已完成' }], onFilter: (value, record) => record.status === value, render: (value) => <span className={`status-pill status-pill--${value === '进行中' ? 'active' : value === '评审中' ? 'review' : 'done'}`}><i />{String(value)}</span> },
  { key: 'members', title: '成员', dataIndex: 'members', align: 'center' },
  { key: 'updated', title: '最近更新', dataIndex: 'updated', sorter: true },
];

function TablePage() {
  const [selected, setSelected] = useState<import('react').Key[]>([]);
  const [serverPage, setServerPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const serverData = useMemo(() => projects.slice((serverPage - 1) * 4, serverPage * 4), [serverPage]);
  return <><PageHeading eyebrow="DATA DISPLAY" title="Table 表格" description="结构化呈现数据，并将排序、筛选和选择等操作保持在用户视线之内。" badge="Table" />
    <ExampleCard title="项目列表" description="本地分页、排序、筛选与行选择。" code={codeSamples.table}><div className="table-toolbar"><div><strong>所有项目</strong><span>共 9 个项目</span></div><div><Button onClick={() => { setLoading(true); window.setTimeout(() => setLoading(false), 850); }}>↻ 刷新数据</Button><Button variant="primary">＋ 新建项目</Button></div></div><Table<Project> rowKey="id" columns={projectColumns} dataSource={projects} rowSelection={{ selectedRowKeys: selected, onChange: setSelected }} loading={loading} onChange={(change) => console.info('Table change', change)} /><div className="table-selection-note">{selected.length ? `已选择 ${selected.length} 个项目` : '点击行首复选框，选择需要批量操作的项目'}</div></ExampleCard>
    <ExampleCard title="服务端分页模式" description="通过受控模式将分页和筛选交给业务请求。" code={codeSamples.serverTable}><div className="server-table-toolbar"><span>服务端数据模拟 · 每页 4 条</span><span>当前请求页：<b>{serverPage}</b></span></div><Table<Project> mode="server" rowKey="id" columns={projectColumns} dataSource={serverData} currentPage={serverPage} total={projects.length} pageSize={4} pageSizeOptions={[4]} onChange={(change) => { setServerPage(change.page); }} /></ExampleCard>
  </>;
}

createRoot(document.getElementById('root')!).render(<App />);
