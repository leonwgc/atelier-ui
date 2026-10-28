import { useRef, useState, type ReactNode } from 'react';
import {
  Avatar, Button, Calendar, Carousel, Countdown, Image, ImagePreviewGroup, Link, List, ListItem, ListItemMeta, Listy, Masonry, Paragraph, QRCode, Splitter, SplitterPanel, Statistic, Tag, Text, Title, Tree, Typography, Watermark,
  type CarouselRef, type ListyRef, type QRCodeStatus, type TreeNode,
} from '../src';
import { ApiTable, ExampleCard, PageHeading } from './shared';

export type DataDisplayPageId = 'typography' | 'statistic' | 'image' | 'carousel' | 'calendar' | 'tree' | 'list' | 'listy' | 'masonry' | 'qrcode' | 'watermark' | 'splitter';

interface Example { title: string; description?: string; code: string; preview: ReactNode }
interface DataDisplayPageMeta {
  id: DataDisplayPageId;
  title: string;
  icon: string;
  group: string;
  eyebrow: string;
  badge: string;
  description: string;
  examples: Example[];
  rows: string[][];
}

const svgImage = (fill: string, accent: string, label: string) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400"><rect width="640" height="400" fill="${fill}"/><circle cx="500" cy="120" r="70" fill="${accent}" opacity=".85"/><path d="M0 320 170 170l130 110 100-80 240 190H0Z" fill="${accent}"/><text x="32" y="60" fill="#fff" font-family="sans-serif" font-size="28" font-weight="700">${label}</text></svg>`)}`;
const covers = [svgImage('#685cf6', '#b6b0ff', 'Aurora'), svgImage('#2f9472', '#9fdcc5', 'Meadow'), svgImage('#c98a29', '#f3d8a3', 'Dune'), svgImage('#222438', '#6f78a8', 'Night')];

function TypographyDemo() {
  const [name, setName] = useState('Atelier 设计系统');
  return <Typography>
    <Title level={2}>{name}</Title>
    <Paragraph>
      一套<Text strong>强调细节</Text>的 React 组件库。<Text type="secondary">次要文本</Text>、<Text type="success">成功</Text>、<Text type="warning">警告</Text>、<Text type="danger">危险</Text>、<Text code>code</Text>、<Text keyboard>⌘K</Text>、<Text mark>高亮</Text>、<Text delete>删除</Text>、<Text underline>下划线</Text>、<Text italic>斜体</Text>与 <Link href="#typography">链接</Link>。
    </Paragraph>
    <Paragraph copyable>这段文本可以一键复制，点击右侧图标试试。</Paragraph>
    <Text editable={{ onChange: setName }}>{name}</Text>
    <Paragraph ellipsis={{ rows: 2, expandable: true }} type="secondary">
      Atelier UI 以可访问性为先：所有交互控件都具备语义角色、可见焦点与键盘操作。组件之间共享同一套主题变量、动效时长与缓动曲线，因此在不同页面之间切换时，界面保持一致的节奏感。你可以通过 ConfigProvider 覆盖主题 token，也可以直接使用 CSS 变量进行细粒度定制。这段文字默认折叠为两行，点击“展开”可以查看全部内容。
    </Paragraph>
    <Text ellipsis style={{ maxWidth: 240 }}>单行省略：这是一段很长很长的文本内容，超出宽度后会显示省略号。</Text>
  </Typography>;
}

function StatisticDemo() {
  const deadline = useRef(Date.now() + 1000 * 60 * 60 * 26 + 1000 * 45).current;
  return <div className="demo-stat-grid">
    <Statistic title="活跃成员" value={128_430} suffix="人" />
    <Statistic title="月度营收" value={2_395_120.5} precision={2} prefix="¥" trend="up" trendLabel="较上月 +12.4%" />
    <Statistic title="跳出率" value={32.18} precision={2} suffix="%" trend="down" trendLabel="较上周 -3.2%" />
    <Statistic title="加载中" value={0} loading />
    <Countdown title="活动倒计时" value={deadline} format="D 天 HH:mm:ss" />
    <Countdown title="毫秒级" value={deadline} format="HH:mm:ss.SS" size="sm" />
  </div>;
}

function ImageDemo() {
  return <div className="demo-stack" style={{ display: 'grid', gap: 20 }}>
    <div className="component-row" style={{ gap: 16, alignItems: 'flex-start' }}>
      <Image src={covers[0]} alt="Aurora 项目封面" width={240} height={150} />
      <Image src="https://invalid.example/broken.png" alt="加载失败示例" width={160} height={150} />
      <Image src="https://invalid.example/broken-2.png" fallback={covers[3]} alt="失败后回退" width={240} height={150} />
    </div>
    <ImagePreviewGroup>
      <div className="component-row" style={{ gap: 12 }}>
        {covers.map((cover, index) => <Image key={cover} src={cover} alt={`相册图片 ${index + 1}`} width={120} height={80} />)}
      </div>
    </ImagePreviewGroup>
  </div>;
}

function CarouselDemo() {
  const ref = useRef<CarouselRef>(null);
  const [current, setCurrent] = useState(0);
  return <div className="demo-stack" style={{ display: 'grid', gap: 18 }}>
    <Carousel ref={ref} autoplay arrows aspectRatio={16 / 7} onChange={setCurrent} style={{ maxWidth: 640 }}>
      {covers.map((cover, index) => <img key={cover} src={cover} alt={`幻灯片 ${index + 1}`} />)}
    </Carousel>
    <div className="component-row">
      <Button size="sm" onClick={() => ref.current?.prev()}>上一张</Button>
      <Button size="sm" onClick={() => ref.current?.next()}>下一张</Button>
      <span className="demo-hint">当前：{current + 1} / {covers.length}</span>
    </div>
    <div className="demo-carousel-row">
      <Carousel effect="fade" dotPosition="right" aspectRatio={4 / 3} style={{ maxWidth: 300 }}>
        {['设计评审', '发布计划', '周会纪要'].map((text) => <div key={text} className="demo-slide">{text}</div>)}
      </Carousel>
      <Carousel dotPosition="top" infinite={false} arrows aspectRatio={4 / 3} style={{ maxWidth: 300 }}>
        {['不循环', '第二页', '最后一页'].map((text) => <div key={text} className="demo-slide demo-slide--alt">{text}</div>)}
      </Carousel>
    </div>
  </div>;
}

function CalendarDemo() {
  const [date, setDate] = useState(new Date(2026, 9, 27));
  const events: Record<string, string[]> = { '2026-10-08': ['设计评审'], '2026-10-15': ['发布 v0.2', '周会'], '2026-10-27': ['组件走查'] };
  const key = (value: Date) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  return <div className="demo-stack" style={{ display: 'grid', gap: 20 }}>
    <Calendar value={date} onChange={setDate} cellRender={(value, info) => info.type === 'date' && events[key(value)] ? <ul className="demo-calendar-events">{events[key(value)].map((item) => <li key={item}>{item}</li>)}</ul> : null} />
    <div className="component-row" style={{ alignItems: 'flex-start', gap: 20 }}>
      <Calendar fullscreen={false} value={date} onChange={setDate} cellRender={(value, info) => (info.type === 'date' && events[key(value)] ? true : null)} disabledDate={(value) => value.getDay() === 0} />
      <span className="demo-hint">已选择：{date.toLocaleDateString('zh-CN')}（周日不可选）</span>
    </div>
  </div>;
}

const folderTree: TreeNode[] = [
  { key: 'design', title: '设计部', children: [
    { key: 'brand', title: '品牌项目', children: [{ key: 'logo', title: 'Logo 规范.fig' }, { key: 'poster', title: '海报模板.fig' }] },
    { key: 'ux', title: '体验规范', children: [{ key: 'tokens', title: '设计 Token.json' }, { key: 'motion', title: '动效指南.md', disabled: true }] },
  ] },
  { key: 'engineering', title: '工程部', children: [{ key: 'web', title: 'Web 前端' }, { key: 'mobile', title: '移动端' }] },
  { key: 'archive', title: '归档（空）', isLeaf: false },
];

function TreeDemo() {
  const [checked, setChecked] = useState<string[]>(['logo']);
  const [selected, setSelected] = useState<string[]>(['tokens']);
  const [filter, setFilter] = useState('');
  const [lazyData, setLazyData] = useState<TreeNode[]>(folderTree);
  const loadData = (node: TreeNode) => new Promise<void>((resolve) => setTimeout(() => {
    setLazyData((data) => data.map((item) => (item.key === node.key ? { ...item, children: [{ key: `${node.key}-1`, title: '2024 年归档' }, { key: `${node.key}-2`, title: '2025 年归档' }] } : item)));
    resolve();
  }, 700));
  return <div className="demo-tree-row">
    <div className="demo-tree-frame">
      <Tree treeData={folderTree} checkable defaultExpandAll checkedKeys={checked} onCheck={(keys) => setChecked(keys)} selectedKeys={selected} onSelect={(keys) => setSelected(keys)} label="文件树（可勾选）" />
      <span className="demo-hint">已勾选：{checked.join(', ') || '无'}</span>
    </div>
    <div className="demo-tree-frame">
      <input className="demo-plain-input" placeholder="搜索节点…" value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="搜索树节点" />
      <Tree treeData={lazyData} showLine showIcon icon={(_, state) => <span aria-hidden="true">{state.leaf ? '📄' : state.expanded ? '📂' : '📁'}</span>} filterValue={filter} loadData={loadData} defaultExpandedKeys={['design']} blockNode label="文件树（连线 + 异步加载）" />
    </div>
  </div>;
}

const members = [
  { id: 'lin', name: '林知夏', role: '产品设计师', email: 'lin@atelier.design' },
  { id: 'chen', name: '陈一川', role: '前端工程师', email: 'chen@atelier.design' },
  { id: 'zhou', name: '周禾', role: '产品经理', email: 'zhou@atelier.design' },
  { id: 'shen', name: '沈星河', role: '后端工程师', email: 'shen@atelier.design' },
  { id: 'su', name: '苏晚', role: '测试工程师', email: 'su@atelier.design' },
];

function ListDemo() {
  const [loading, setLoading] = useState(false);
  return <div className="demo-stack" style={{ display: 'grid', gap: 20 }}>
    <List
      dataSource={members}
      rowKey="id"
      bordered
      header={<div className="component-row" style={{ justifyContent: 'space-between' }}><span>团队成员</span><Button size="sm" onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 900); }}>刷新</Button></div>}
      footer={`共 ${members.length} 人`}
      loading={loading}
      pagination={{ pageSize: 3 }}
      renderItem={(member) => <ListItem actions={[<button key="edit" type="button">编辑</button>, <button key="remove" type="button">移除</button>]} extra={<Tag>{member.role}</Tag>}>
        <ListItemMeta avatar={<Avatar name={member.name} />} title={member.name} description={member.email} />
      </ListItem>}
    />
    <List dataSource={members.slice(0, 4)} rowKey="id" grid={{ column: 4, gutter: 14, xs: 1, sm: 2 }} renderItem={(member) => <ListItem><ListItemMeta avatar={<Avatar name={member.name} />} title={member.name} description={member.role} /></ListItem>} />
    <List dataSource={[]} renderItem={() => null} bordered emptyText="还没有成员，点击右上角邀请" />
  </div>;
}

function ListyDemo() {
  const ref = useRef<ListyRef>(null);
  const [count, setCount] = useState(2000);
  const items = Array.from({ length: count }, (_, index) => ({ id: index + 1, name: `成员 ${index + 1}`, note: index % 7 === 0 ? '这一行内容更长一些，用于演示动态高度测量时不同行高的排版效果。' : '普通成员' }));
  return <div className="demo-stack" style={{ display: 'grid', gap: 14 }}>
    <div className="component-row">
      <Button size="sm" onClick={() => ref.current?.scrollTo(999, 'center')}>跳到第 1000 行</Button>
      <Button size="sm" onClick={() => ref.current?.scrollToTop()}>回到顶部</Button>
      <span className="demo-hint">共 {count.toLocaleString()} 行，仅渲染可见区域</span>
    </div>
    <Listy ref={ref} items={items} itemKey={(item) => item.id} height={300} itemHeight={48} dynamicHeight onEndReached={() => setCount((value) => Math.min(value + 500, 10_000))} footer={count >= 10_000 ? '已加载全部' : '滚动到底部自动加载更多'} renderItem={(item) => <div className="demo-listy-row"><Avatar name={item.name} size="sm" /><div><strong>{item.name}</strong><div className="demo-hint">{item.note}</div></div></div>} />
  </div>;
}

function MasonryDemo() {
  const [cards, setCards] = useState(() => Array.from({ length: 9 }, (_, index) => ({ id: index + 1, height: 80 + ((index * 53) % 120), color: covers[index % covers.length] })));
  return <div className="demo-stack" style={{ display: 'grid', gap: 14 }}>
    <div className="component-row">
      <Button size="sm" onClick={() => setCards((list) => [...list, { id: list.length + 1, height: 80 + ((list.length * 53) % 120), color: covers[list.length % covers.length] }])}>添加卡片</Button>
      <Button size="sm" onClick={() => setCards((list) => list.slice(0, -1))} disabled={cards.length === 0}>移除最后一张</Button>
    </div>
    <Masonry dataSource={cards} itemKey={(card) => card.id} columns={{ 0: 1, 480: 2, 760: 3 }} gap={14} renderItem={(card) => <div className="demo-masonry-card" style={{ height: card.height, backgroundImage: `url(${card.color})` }}><span>卡片 {card.id}</span></div>} />
  </div>;
}

function QRCodeDemo() {
  const [status, setStatus] = useState<QRCodeStatus>('active');
  const [text, setText] = useState('https://atelier.design/invite/team-aurora');
  return <div className="demo-stack" style={{ display: 'grid', gap: 16 }}>
    <input className="demo-plain-input" style={{ maxWidth: 420 }} value={text} onChange={(event) => setText(event.target.value)} aria-label="二维码内容" />
    <div className="component-row" style={{ gap: 20, alignItems: 'flex-start' }}>
      <QRCode value={text} />
      <QRCode value={text} icon={covers[0]} size={160} color="#685cf6" />
      <QRCode value={text} type="canvas" size={160} color="#1d1f33" bgColor="#f7f8fb" bordered={false} />
      <QRCode value={text} status={status} onRefresh={() => setStatus('active')} size={160} />
    </div>
    <div className="component-row">
      {(['active', 'loading', 'expired', 'scanned'] as QRCodeStatus[]).map((item) => <Button key={item} size="sm" variant={status === item ? 'primary' : 'secondary'} onClick={() => setStatus(item)}>{item}</Button>)}
    </div>
  </div>;
}

function WatermarkDemo() {
  const [text, setText] = useState('Atelier · 内部预览');
  return <div className="demo-stack" style={{ display: 'grid', gap: 14 }}>
    <input className="demo-plain-input" style={{ maxWidth: 320 }} value={text} onChange={(event) => setText(event.target.value)} aria-label="水印文字" />
    <Watermark content={[text, 'lin@atelier.design']} font={{ color: 'rgba(104, 92, 246, 0.16)', fontSize: 14 }} gap={[80, 70]}>
      <div className="demo-watermark-body">
        <Title level={4}>项目设置</Title>
        <Paragraph type="secondary">水印由 canvas 生成并平铺在内容之上；通过开发者工具删除或隐藏水印节点时会被自动恢复。</Paragraph>
        <div className="component-row"><Button variant="primary">保存</Button><Button>取消</Button></div>
      </div>
    </Watermark>
  </div>;
}

function SplitterDemo() {
  const [sizes, setSizes] = useState<number[]>([]);
  return <div className="demo-stack" style={{ display: 'grid', gap: 14 }}>
    <Splitter style={{ height: 240 }} onResizeEnd={setSizes}>
      <SplitterPanel defaultSize="30%" min="18%" max="50%" collapsible><strong>导航</strong><p className="demo-hint">可拖拽、可折叠，最小 18%，最大 50%。</p></SplitterPanel>
      <SplitterPanel><strong>内容区</strong><p className="demo-hint">按住分隔条拖动，或聚焦分隔条后使用方向键（Shift 加速）。</p></SplitterPanel>
      <SplitterPanel defaultSize={200} min={120} resizable={false}><strong>属性面板</strong><p className="demo-hint">resizable=false，宽度固定。</p></SplitterPanel>
    </Splitter>
    <Splitter layout="vertical" style={{ height: 260 }} lazy>
      <SplitterPanel defaultSize="40%" min={60}><strong>编辑器</strong><p className="demo-hint">垂直布局，lazy 模式在松开时才应用新尺寸。</p></SplitterPanel>
      <SplitterPanel collapsible><strong>控制台</strong><p className="demo-hint">可折叠面板。</p></SplitterPanel>
    </Splitter>
    <span className="demo-hint">{sizes.length ? `当前宽度：${sizes.map((size) => Math.round(size)).join(' / ')} px` : '拖动上方分隔条查看尺寸回调'}</span>
  </div>;
}

export const dataDisplayPages: DataDisplayPageMeta[] = [
  {
    id: 'typography', title: 'Typography 排版', icon: 'T', group: '基础组件', eyebrow: 'GENERAL', badge: 'Typography', description: '标题、段落、文本与链接的统一排版，支持复制、编辑、省略展开与多种语义样式。',
    examples: [{ title: '标题、文本样式、复制、编辑与省略', preview: <TypographyDemo />, code: `import { useState } from 'react';
import { Link, Paragraph, Text, Title, Typography } from 'atelier-ui/typography';

export function Intro() {
  const [name, setName] = useState('Atelier 设计系统');
  return (
    <Typography>
      <Title level={2}>{name}</Title>
      <Paragraph>
        一套<Text strong>强调细节</Text>的组件库。<Text type="secondary">次要</Text>、<Text code>code</Text>、<Text keyboard>⌘K</Text>、<Text mark>高亮</Text> 与 <Link href="#">链接</Link>。
      </Paragraph>
      <Paragraph copyable>这段文本可以一键复制。</Paragraph>
      <Text editable={{ onChange: setName }}>{name}</Text>
      <Paragraph ellipsis={{ rows: 2, expandable: true }}>很长的段落……</Paragraph>
      <Text ellipsis style={{ maxWidth: 240 }}>单行省略文本</Text>
    </Typography>
  );
}` }],
    rows: [['Title.level', '1 | 2 | 3 | 4 | 5', '1'], ['type', "'secondary' | 'success' | 'warning' | 'danger'", '—'], ['strong / italic / underline / delete', 'boolean', 'false'], ['code / keyboard / mark', 'boolean', 'false'], ['disabled', 'boolean', 'false'], ['copyable', 'boolean | { text?, onCopy?, tooltips? }', 'false'], ['editable', 'boolean | { editing?, onStart?, onChange?, onCancel?, onEnd?, maxLength? }', 'false'], ['ellipsis', 'boolean | { rows?, expandable?, symbol?, onExpand?, tooltip? }', 'false'], ['Link.href / target', 'string', '—'], ['Typography.as', "'article' | 'section' | 'div'", "'article'"]],
  },
  {
    id: 'statistic', title: 'Statistic 统计数值', icon: '↗', group: '数据展示', eyebrow: 'DATA DISPLAY', badge: 'Statistic', description: '突出展示关键指标，支持千分位、精度、前后缀、趋势标识、加载骨架以及倒计时。',
    examples: [{ title: '数值、趋势与倒计时', preview: <StatisticDemo />, code: `import { Countdown, Statistic } from 'atelier-ui/statistic';

export function Metrics() {
  const deadline = Date.now() + 1000 * 60 * 60 * 26;
  return (
    <>
      <Statistic title="活跃成员" value={128430} suffix="人" />
      <Statistic title="月度营收" value={2395120.5} precision={2} prefix="¥" trend="up" trendLabel="较上月 +12.4%" />
      <Statistic title="跳出率" value={32.18} precision={2} suffix="%" trend="down" />
      <Statistic title="加载中" value={0} loading />
      <Countdown title="活动倒计时" value={deadline} format="D 天 HH:mm:ss" onFinish={() => console.log('结束')} />
    </>
  );
}` }],
    rows: [['title', 'ReactNode', '—'], ['value', 'number | string', 'required'], ['precision', 'number', '—'], ['groupSeparator / decimalSeparator', 'string', "',' / '.'"], ['prefix / suffix', 'ReactNode', '—'], ['formatter', '(value) => ReactNode', '—'], ['loading', 'boolean', 'false'], ['trend', "'up' | 'down'", '—'], ['trendLabel', 'ReactNode', '—'], ['size', "'sm' | 'md' | 'lg'", "'md'"], ['valueStyle', 'CSSProperties', '—'], ['Countdown.value', 'number | Date', 'required'], ['Countdown.format', "string（D / H / m / s / S）", "'HH:mm:ss'"], ['Countdown.onFinish / onChange', '() => void / (ms) => void', '—']],
  },
  {
    id: 'image', title: 'Image 图片', icon: '▧', group: '数据展示', eyebrow: 'DATA DISPLAY', badge: 'Image', description: '带骨架占位、失败回退与全屏预览的图片组件，预览支持缩放、旋转、翻转、拖拽与相册切换。',
    examples: [{ title: '占位、回退与相册预览', description: '点击任意图片打开预览层；相册内可用 ← → 切换，滚轮缩放，Esc 关闭。', preview: <ImageDemo />, code: `import { Image, ImagePreviewGroup } from 'atelier-ui/image';

export function Gallery({ covers }: { covers: string[] }) {
  return (
    <>
      <Image src={covers[0]} alt="项目封面" width={240} height={150} />
      <Image src="/broken.png" fallback={covers[1]} alt="失败后回退" width={240} height={150} />
      <ImagePreviewGroup>
        {covers.map((cover, index) => <Image key={cover} src={cover} alt={\`图片 \${index + 1}\`} width={120} height={80} />)}
      </ImagePreviewGroup>
    </>
  );
}` }],
    rows: [['src', 'string', 'required'], ['alt', 'string', "''"], ['preview', 'boolean | { src?, mask?, visible?, onVisibleChange? }', 'true'], ['fallback', 'string', '—'], ['placeholder', 'boolean | ReactNode', 'true'], ['fit', 'CSS object-fit', "'cover'"], ['rounded', 'boolean | number', 'true'], ['loading', "'lazy' | 'eager'", "'lazy'"], ['onPreviewOpen', '() => void', '—'], ['PreviewGroup.items', 'Array<string | { src, previewSrc? }>', '子元素自动收集'], ['PreviewGroup.current / onChange', 'number / (index) => void', '—'], ['PreviewGroup.visible / onVisibleChange', 'boolean / (visible) => void', '—']],
  },
  {
    id: 'carousel', title: 'Carousel 走马灯', icon: '▭', group: '数据展示', eyebrow: 'DATA DISPLAY', badge: 'Carousel', description: '滑动 / 淡入两种切换效果，支持自动播放（悬停暂停）、拖拽、箭头、指示点位置与命令式控制。',
    examples: [{ title: '自动播放、拖拽、淡入与非循环', preview: <CarouselDemo />, code: `import { useRef } from 'react';
import { Carousel, type CarouselRef } from 'atelier-ui/carousel';

export function Banner({ covers }: { covers: string[] }) {
  const ref = useRef<CarouselRef>(null);
  return (
    <>
      <Carousel ref={ref} autoplay arrows aspectRatio={16 / 7} onChange={(index) => console.log(index)}>
        {covers.map((cover) => <img key={cover} src={cover} alt="" />)}
      </Carousel>
      <button type="button" onClick={() => ref.current?.next()}>下一张</button>
      <Carousel effect="fade" dotPosition="right" aspectRatio={4 / 3}>
        <div>设计评审</div><div>发布计划</div>
      </Carousel>
    </>
  );
}` }],
    rows: [['children / items', 'ReactNode / ReactNode[]', '—'], ['autoplay', 'boolean', 'false'], ['autoplaySpeed', 'number (ms)', '4000'], ['pauseOnHover', 'boolean', 'true'], ['effect', "'slide' | 'fade'", "'slide'"], ['dots', 'boolean', 'true'], ['dotPosition', "'bottom' | 'top' | 'left' | 'right'", "'bottom'"], ['arrows', 'boolean', 'false'], ['infinite', 'boolean', 'true'], ['draggable', 'boolean', 'true'], ['speed', 'number (ms)', '450'], ['current / defaultCurrent', 'number', '— / 0'], ['onChange / beforeChange / afterChange', '(index) => void', '—'], ['aspectRatio', 'number', '—'], ['ref', '{ next, prev, goTo }', '—']],
  },
  {
    id: 'calendar', title: 'Calendar 日历', icon: '▦', group: '数据展示', eyebrow: 'DATA DISPLAY', badge: 'Calendar', description: '月 / 年两种面板，支持全屏日程单元格、紧凑卡片、禁用日期、有效范围与完整键盘导航。',
    examples: [{ title: '全屏日程与紧凑卡片', description: '方向键移动焦点，PageUp / PageDown 切换月份，Enter 选择。', preview: <CalendarDemo />, code: `import { useState } from 'react';
import { Calendar } from 'atelier-ui/calendar';

const events: Record<string, string[]> = { '2026-10-15': ['发布 v0.2', '周会'] };
const key = (date: Date) => date.toISOString().slice(0, 10);

export function Schedule() {
  const [date, setDate] = useState(new Date(2026, 9, 27));
  return (
    <>
      <Calendar value={date} onChange={setDate} cellRender={(value, info) => info.type === 'date' && events[key(value)] ? <ul>{events[key(value)].map((item) => <li key={item}>{item}</li>)}</ul> : null} />
      <Calendar fullscreen={false} value={date} onChange={setDate} disabledDate={(value) => value.getDay() === 0} />
    </>
  );
}` }],
    rows: [['value / defaultValue', 'Date', '— / 今天'], ['onChange', '(date) => void', '—'], ['onSelect', '(date, { source }) => void', '—'], ['onPanelChange', '(date, mode) => void', '—'], ['mode / defaultMode', "'month' | 'year'", "— / 'month'"], ['fullscreen', 'boolean', 'true'], ['cellRender', '(date, info) => ReactNode', '—'], ['disabledDate', '(date) => boolean', '—'], ['validRange', '[Date, Date]', '—'], ['firstDayOfWeek', '0 | 1', '1'], ['weekdayLabels', 'string[]', '日一二三四五六'], ['showToday', 'boolean', 'true'], ['headerRender', '(info) => ReactNode', '—']],
  },
  {
    id: 'tree', title: 'Tree 树形控件', icon: '⋮', group: '数据展示', eyebrow: 'DATA DISPLAY', badge: 'Tree', description: '层级数据的展开、选择与级联勾选，支持连线、图标、搜索高亮、异步加载与键盘导航。',
    examples: [{ title: '可勾选、连线 + 图标、搜索与异步加载', description: '左侧为级联勾选；右侧输入关键字会高亮并自动展开，“归档”节点在展开时异步加载子节点。', preview: <TreeDemo />, code: `import { useState } from 'react';
import { Tree, type TreeNode } from 'atelier-ui/tree';

const data: TreeNode[] = [
  { key: 'design', title: '设计部', children: [{ key: 'brand', title: '品牌项目' }, { key: 'ux', title: '体验规范' }] },
  { key: 'archive', title: '归档', isLeaf: false },
];

export function FolderTree() {
  const [checked, setChecked] = useState<string[]>([]);
  const [tree, setTree] = useState(data);
  const loadData = (node: TreeNode) => fetch(\`/api/folders/\${node.key}\`).then((res) => res.json()).then((children) => {
    setTree((current) => current.map((item) => (item.key === node.key ? { ...item, children } : item)));
  });
  return (
    <>
      <Tree treeData={tree} checkable defaultExpandAll checkedKeys={checked} onCheck={(keys) => setChecked(keys)} />
      <Tree treeData={tree} showLine showIcon loadData={loadData} filterValue="品牌" blockNode />
    </>
  );
}` }],
    rows: [['treeData', 'TreeNode[]', 'required'], ['checkable / checkStrictly', 'boolean', 'false'], ['selectable / multiple', 'boolean', 'true / false'], ['expandedKeys / defaultExpandedKeys / defaultExpandAll', 'string[] / string[] / boolean', '—'], ['onExpand', '(keys, { expanded, node }) => void', '—'], ['selectedKeys / defaultSelectedKeys', 'string[]', '—'], ['onSelect', '(keys, { selected, node }) => void', '—'], ['checkedKeys / defaultCheckedKeys', 'string[]', '—'], ['onCheck', '(keys, { checked, node, halfCheckedKeys }) => void', '—'], ['showLine / showIcon', 'boolean', 'false'], ['icon', 'ReactNode | (node, { expanded, leaf }) => ReactNode', '—'], ['switcherIcon', 'ReactNode', '›'], ['titleRender', '(node) => ReactNode', '—'], ['filterValue', 'string', '—'], ['loadData', '(node) => Promise<void>', '—'], ['expandAction', "'click' | false", 'false'], ['blockNode', 'boolean', 'false'], ['TreeNode', '{ key, title, children?, disabled?, disableCheckbox?, selectable?, checkable?, icon?, isLeaf? }', '—']],
  },
  {
    id: 'list', title: 'List 列表', icon: '☰', group: '数据展示', eyebrow: 'DATA DISPLAY', badge: 'List', description: '通用列表容器：头尾、分割线、尺寸、加载骨架、分页、栅格布局与空状态。',
    examples: [{ title: '分页列表、栅格与空状态', preview: <ListDemo />, code: `import { Avatar } from 'atelier-ui/avatar';
import { List, ListItem, ListItemMeta } from 'atelier-ui/list';
import { Tag } from 'atelier-ui/tag';

const members = [{ id: 'lin', name: '林知夏', role: '产品设计师', email: 'lin@atelier.design' }];

export function Members() {
  return (
    <>
      <List
        dataSource={members}
        rowKey="id"
        bordered
        header="团队成员"
        pagination={{ pageSize: 3 }}
        renderItem={(member) => (
          <ListItem actions={[<button key="edit" type="button">编辑</button>]} extra={<Tag>{member.role}</Tag>}>
            <ListItemMeta avatar={<Avatar name={member.name} />} title={member.name} description={member.email} />
          </ListItem>
        )}
      />
      <List dataSource={members} rowKey="id" grid={{ column: 4, gutter: 14, xs: 1, sm: 2 }} renderItem={(member) => <ListItem>{member.name}</ListItem>} />
    </>
  );
}` }],
    rows: [['dataSource', 'T[]', 'required'], ['renderItem', '(item, index) => ReactNode', 'required'], ['rowKey', 'keyof T | (item, index) => Key', 'index'], ['header / footer', 'ReactNode', '—'], ['bordered / split', 'boolean', 'false / true'], ['size', "'sm' | 'md' | 'lg'", "'md'"], ['loading / loadingRows', 'boolean / number', 'false / 3'], ['emptyText', 'ReactNode', "'暂无数据'"], ['grid', '{ column?, gutter?, xs?, sm?, md?, lg? }', '—'], ['pagination', 'boolean | { pageSize?, current?, onChange?, position?, align? }', 'false'], ['height / onEndReached', 'number / () => void', '—'], ['ListItem.actions / extra', 'ReactNode[] / ReactNode', '—'], ['ListItemMeta.avatar / title / description', 'ReactNode', '—']],
  },
  {
    id: 'listy', title: 'Listy 虚拟列表', icon: '≡', group: '数据展示', eyebrow: 'DATA DISPLAY', badge: 'Listy', description: '只渲染可视区域的长列表，支持固定 / 动态行高、滚动到指定行、触底加载与页脚。',
    examples: [{ title: '一万行数据的虚拟滚动', preview: <ListyDemo />, code: `import { useRef, useState } from 'react';
import { Listy, type ListyRef } from 'atelier-ui/listy';

export function BigList() {
  const ref = useRef<ListyRef>(null);
  const [count, setCount] = useState(2000);
  const items = Array.from({ length: count }, (_, index) => ({ id: index + 1, name: \`成员 \${index + 1}\` }));
  return (
    <>
      <button type="button" onClick={() => ref.current?.scrollTo(999, 'center')}>跳到第 1000 行</button>
      <Listy
        ref={ref}
        items={items}
        itemKey={(item) => item.id}
        height={300}
        itemHeight={48}
        dynamicHeight
        onEndReached={() => setCount((value) => value + 500)}
        renderItem={(item) => <strong>{item.name}</strong>}
      />
    </>
  );
}` }],
    rows: [['items', 'T[]', 'required'], ['renderItem', '(item, index) => ReactNode', 'required'], ['itemKey', '(item, index) => Key', 'index'], ['height', 'number', '320'], ['itemHeight', 'number', '44'], ['dynamicHeight', 'boolean', 'false'], ['overscan', 'number', '4'], ['onEndReached / endReachedThreshold', '() => void / number', '— / 120'], ['onVisibleRangeChange', '({ start, end }) => void', '—'], ['emptyText / footer', 'ReactNode', '—'], ['split', 'boolean', 'true'], ['ref', '{ scrollTo(index, align), scrollToTop() }', '—']],
  },
  {
    id: 'masonry', title: 'Masonry 瀑布流', icon: '▤', group: '数据展示', eyebrow: 'DATA DISPLAY', badge: 'Masonry', description: '基于测量的真正瀑布流：按最短列放置，响应式列数，增删卡片时平滑重排。',
    examples: [{ title: '响应式列数与动态增删', preview: <MasonryDemo />, code: `import { Masonry } from 'atelier-ui/masonry';

export function Gallery({ cards }: { cards: Array<{ id: number; height: number }> }) {
  return (
    <Masonry
      dataSource={cards}
      itemKey={(card) => card.id}
      columns={{ 0: 1, 480: 2, 760: 3 }}
      gap={14}
      renderItem={(card) => <div style={{ height: card.height }}>卡片 {card.id}</div>}
    />
  );
}` }],
    rows: [['children / dataSource + renderItem', 'ReactNode / T[] + (item, index) => ReactNode', '—'], ['itemKey', '(item, index) => Key', 'index'], ['columns', 'number | Record<minWidth, number>', '3'], ['gap', 'number | [column, row]', '16'], ['sequential', 'boolean', 'false'], ['onLayout', '({ columns, height }) => void', '—']],
  },
  {
    id: 'qrcode', title: 'QRCode 二维码', icon: '▣', group: '数据展示', eyebrow: 'DATA DISPLAY', badge: 'QRCode', description: '内置零依赖的 QR 编码器（Byte 模式，1–40 版本，L/M/Q/H 纠错），支持 SVG / Canvas 渲染、中心 Logo 与状态遮罩。',
    examples: [{ title: '渲染方式、Logo 与状态', description: '修改输入框内容会即时重新编码，可直接用手机扫描验证。', preview: <QRCodeDemo />, code: `import { QRCode } from 'atelier-ui/qrcode';

export function Invite({ url, logo }: { url: string; logo: string }) {
  return (
    <>
      <QRCode value={url} />
      <QRCode value={url} icon={logo} color="#685cf6" />
      <QRCode value={url} type="canvas" bgColor="#f7f8fb" bordered={false} />
      <QRCode value={url} status="expired" onRefresh={() => console.log('refresh')} />
    </>
  );
}` }],
    rows: [['value', 'string', 'required'], ['size', 'number', '160'], ['type', "'svg' | 'canvas'", "'svg'"], ['errorLevel', "'L' | 'M' | 'Q' | 'H'", "'M'（有 icon 时 'H'）"], ['color / bgColor', 'string', "'#222438' / '#ffffff'"], ['icon / iconSize', 'string / number', '— / size × 0.22'], ['bordered', 'boolean', 'true'], ['margin', 'number（模块数）', '2'], ['status', "'active' | 'expired' | 'loading' | 'scanned'", "'active'"], ['onRefresh', '() => void', '—'], ['statusRender', '(status, { onRefresh }) => ReactNode', '—'], ['encodeQR (独立导出)', '(text, level?) => { size, version, modules }', '—']],
  },
  {
    id: 'watermark', title: 'Watermark 水印', icon: '▧', group: '反馈组件', eyebrow: 'FEEDBACK', badge: 'Watermark', description: '基于 canvas 的文字 / 图片平铺水印，支持多行、旋转、间距、字体配置、全屏模式与防篡改。',
    examples: [{ title: '多行文字水印与防篡改', preview: <WatermarkDemo />, code: `import { Watermark } from 'atelier-ui/watermark';

export function ProtectedPreview() {
  return (
    <Watermark content={['Atelier · 内部预览', 'lin@atelier.design']} font={{ color: 'rgba(104, 92, 246, 0.16)', fontSize: 14 }} gap={[80, 70]}>
      <div style={{ minHeight: 200 }}>受保护的内容</div>
    </Watermark>
  );
}` }],
    rows: [['content', 'string | string[]', '—'], ['image', 'string', '—'], ['width / height', 'number', '按内容测量'], ['rotate', 'number', '-22'], ['gap', '[number, number]', '[100, 100]'], ['offset', '[number, number]', 'gap / 2'], ['font', '{ color?, fontSize?, fontWeight?, fontFamily?, fontStyle?, textAlign? }', "rgba(0,0,0,.12) / 16px"], ['zIndex', 'number', '9'], ['fullscreen', 'boolean', 'false']],
  },
  {
    id: 'splitter', title: 'Splitter 分隔面板', icon: '◫', group: '布局组件', eyebrow: 'LAYOUT', badge: 'Splitter', description: '可拖拽调整的多面板布局，支持水平 / 垂直、最小最大尺寸、折叠、禁止调整与延迟应用。',
    examples: [{ title: '水平三栏与垂直两栏', preview: <SplitterDemo />, code: `import { Splitter, SplitterPanel } from 'atelier-ui/splitter';

export function Workbench() {
  return (
    <>
      <Splitter style={{ height: 240 }} onResizeEnd={(sizes) => console.log(sizes)}>
        <SplitterPanel defaultSize="30%" min="18%" max="50%" collapsible>导航</SplitterPanel>
        <SplitterPanel>内容区</SplitterPanel>
        <SplitterPanel defaultSize={200} resizable={false}>属性面板</SplitterPanel>
      </Splitter>
      <Splitter layout="vertical" style={{ height: 260 }} lazy>
        <SplitterPanel defaultSize="40%" min={60}>编辑器</SplitterPanel>
        <SplitterPanel collapsible>控制台</SplitterPanel>
      </Splitter>
    </>
  );
}` }],
    rows: [['layout', "'horizontal' | 'vertical'", "'horizontal'"], ['lazy', 'boolean', 'false'], ['onResizeStart / onResize / onResizeEnd', '(sizes: number[]) => void', '—'], ['Panel.size / defaultSize', 'number | string（px 或 %）', '平均分配'], ['Panel.min / max', 'number | string', '—'], ['Panel.resizable', 'boolean', 'true'], ['Panel.collapsible', "boolean | { start?, end? }", 'false']],
  },
];

export function isDataDisplayPageId(id: string): id is DataDisplayPageId {
  return dataDisplayPages.some((item) => item.id === id);
}

export function DataDisplayPage({ id }: { id: DataDisplayPageId }) {
  const page = dataDisplayPages.find((item) => item.id === id);
  if (!page) return null;
  return <>
    <PageHeading eyebrow={page.eyebrow} title={page.title} description={page.description} badge={page.badge} />
    {page.examples.map((example) => <ExampleCard key={example.title} title={example.title} description={example.description} code={example.code}>{example.preview}</ExampleCard>)}
    <ApiTable rows={page.rows} />
  </>;
}
