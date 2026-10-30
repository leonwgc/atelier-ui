import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Alert } from '../../src/Alert';
import { Tag } from '../../src/Tag';
import { Avatar } from '../../src/Avatar';
import { Badge } from '../../src/Badge';
import { Card } from '../../src/Card';
import { Descriptions } from '../../src/Descriptions';
import { Steps } from '../../src/Steps';
import { Timeline } from '../../src/Timeline';
import { Breadcrumb } from '../../src/Breadcrumb';
import { Divider } from '../../src/Divider';
import { Empty } from '../../src/Empty';
import { Result } from '../../src/Result';
import { Progress } from '../../src/Progress';
import { Spin } from '../../src/Spin';
import { Skeleton } from '../../src/Skeleton';
import { Statistic } from '../../src/Statistic';
import { Flex } from '../../src/Flex';
import { Space } from '../../src/Space';
import { Layout, LayoutHeader, LayoutSider, LayoutContent, LayoutFooter } from '../../src/Layout';
import { Grid, GridCol } from '../../src/Grid';
import { Icon, type IconName } from '../../src/Icon';
import { ConfigProvider, useConfig } from '../../src/ConfigProvider';
import { Typography } from '../../src/Typography';
import { FloatButton, FloatButtonGroup, BackTop } from '../../src/FloatButton';
import { Image, ImagePreviewGroup } from '../../src/Image';
import { QRCode } from '../../src/QRCode';
import { Watermark } from '../../src/Watermark';

describe('status and display components', () => {
  it('dismisses alerts and emits tag removal without swallowing parent handlers', async () => {
    const close = vi.fn(); const click = vi.fn(); render(<><Alert title="Failed" variant="error" closable onClose={close}>Retry</Alert><Tag closable onClose={close} onClick={click}>Label</Tag></>);
    expect(screen.getByRole('alert')).toHaveTextContent('Failed'); await userEvent.click(screen.getByLabelText('关闭提示')); expect(screen.queryByRole('alert')).toBeNull();
    await userEvent.click(screen.getByLabelText('移除标签')); expect(close).toHaveBeenCalledTimes(2); expect(click).toHaveBeenCalledOnce();
  });
  it('falls back on avatar errors and retries when source changes', () => {
    const { rerender } = render(<Avatar src="bad.png" name=" ada " />); fireEvent.error(screen.getByRole('img')); expect(screen.getByText('A')).toBeInTheDocument();
    rerender(<Avatar src="good.png" name="Ada" />); expect(screen.getByRole('img')).toHaveAttribute('src', 'good.png');
    rerender(<Avatar />); expect(screen.getByText('?')).toBeInTheDocument();
  });
  it('hides zero badge counts, supports overflow and status mode', () => {
    const { rerender } = render(<Badge count={0}><span>Inbox</span></Badge>); expect(screen.queryByLabelText('数量 0')).toBeNull();
    rerender(<Badge count={120}><span>Inbox</span></Badge>); expect(screen.getByLabelText('数量 99+')).toHaveTextContent('99+');
    rerender(<Badge count={0} showZero><span>Inbox</span></Badge>); expect(screen.getByLabelText('数量 0')).toBeInTheDocument();
    rerender(<Badge dot><span>Inbox</span></Badge>); expect(screen.getByLabelText('有新消息')).toBeEmptyDOMElement();
    rerender(<Badge status="success" text="Ready" />); expect(screen.getByText('Ready')).toBeInTheDocument();
  });
  it('renders card content seams and description semantics with bounded columns', () => {
    const { container } = render(<><Card title="Profile" extra={<button>Edit</button>} bordered={false}>Body</Card><Descriptions title="Details" column={99} items={[{ key: 'name', label: 'Name', children: 'Ada' }]} /></>);
    expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument(); expect(screen.getByRole('button')).toHaveTextContent('Edit');
    expect(container.querySelector('dt')).toHaveTextContent('Name'); expect(container.querySelector('dd')).toHaveTextContent('Ada'); expect(container.querySelector('dl')).toHaveStyle({ gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' });
  });
  it('reports step changes and renders pending timeline items', async () => {
    const change = vi.fn(); const { container } = render(<><Steps current={1} onChange={change} items={[{ title: 'First' }, { title: 'Second' }, { title: 'Third', disabled: true }]} /><Timeline items={[{ key: 'a', content: 'Created', label: 'Today', color: 'red' }]} pending="Pending" /></>);
    expect(container.querySelector('[aria-current="step"]')).toHaveTextContent('Second'); await userEvent.click(screen.getByRole('button', { name: /First/ })); expect(change).toHaveBeenCalledWith(0);
    expect(screen.getByText('Pending')).toBeInTheDocument(); expect(container.querySelector('time')).toHaveTextContent('Today');
  });
  it('renders breadcrumb links/actions and a current page', async () => {
    const click = vi.fn(); const { container } = render(<Breadcrumb items={[{ title: 'Home', href: '/home' }, { title: 'Group', onClick: click }, { title: 'Current', href: '/current' }]} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/home'); await userEvent.click(screen.getByRole('button')); expect(click).toHaveBeenCalledOnce(); expect(container.querySelector('[aria-current="page"]')).toHaveTextContent('Current');
  });
  it('exposes divider orientations and custom empty/result actions', () => {
    render(<><Divider orientation="vertical" /><Divider plain dashed>Section</Divider><Empty description="No records" image={<span>Art</span>}><button>Create</button></Empty><Result status="404" title="Missing" subTitle="Try again" extra={<a href="/">Home</a>} /></>);
    expect(screen.getAllByRole('separator').map((el) => el.getAttribute('aria-orientation'))).toEqual(['vertical', 'horizontal']); expect(screen.getByRole('button')).toHaveTextContent('Create'); expect(screen.getByRole('heading')).toHaveTextContent('Missing');
  });
  it.each([-10, 50, 150])('clamps progress %s to its accessible range', (percent) => {
    render(<Progress percent={percent} label="Upload" />); expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', String(Math.min(100, Math.max(0, percent))));
  });
  it('hides inactive spinners and renders skeleton children when loading ends', () => {
    const { rerender } = render(<Spin tip="Working"><span>Content</span></Spin>); expect(screen.getByRole('status', { name: 'Working' })).toBeInTheDocument();
    rerender(<Spin spinning={false}><span>Content</span></Spin>); expect(screen.queryByRole('status')).toBeNull(); expect(screen.getByText('Content')).toBeInTheDocument();
    rerender(<Skeleton active avatar title paragraph={{ rows: 2 }} />); expect(screen.getByLabelText('内容加载中')).toHaveAttribute('aria-busy', 'true');
  });
  it('renders statistic formatting/custom content and loading', () => {
    const { rerender } = render(<Statistic title="Revenue" value={1234.5} precision={2} prefix="$" suffix="USD" trend="up" trendLabel="Growing" />);
    expect(screen.getByText('1,234')).toBeInTheDocument(); expect(screen.getByText('.50')).toBeInTheDocument(); expect(screen.getByLabelText('上升')).toBeInTheDocument();
    rerender(<Statistic value={1} formatter={(value) => `Value ${value}`} />); expect(screen.getByText('Value 1')).toBeInTheDocument();
    rerender(<Statistic value={1} loading />); expect(screen.getByLabelText('加载中')).toHaveAttribute('aria-busy', 'true');
  });
});

describe('layout and configuration', () => {
  it('composes semantic layout regions, grid spans and spacing props', () => {
    const { container } = render(<Layout><LayoutHeader>Header</LayoutHeader><LayoutSider width={180}>Side</LayoutSider><LayoutContent><Grid columns={12}><GridCol span={6}><Flex vertical gap={8} wrap data-testid="flex"><Space direction="vertical" size={4}>Content</Space></Flex></GridCol></Grid></LayoutContent><LayoutFooter>Footer</LayoutFooter></Layout>);
    expect(screen.getByRole('main')).toHaveTextContent('Content'); expect(screen.getByRole('complementary')).toHaveStyle({ width: '180px' }); expect(screen.getByTestId('flex')).toHaveStyle({ flexDirection: 'column', gap: '8px', flexWrap: 'wrap' }); expect(container.querySelector('.at-grid__col')).toHaveStyle({ gridColumn: 'span 6' });
  });
  it.each<IconName>(['plus', 'search', 'check', 'close', 'arrow-right', 'info', 'more'])('provides an accessible title for %s icons', (name) => {
    const { rerender, container } = render(<Icon name={name} title="Action" size={24} />); expect(screen.getByRole('img', { name: 'Action' })).toHaveAttribute('width', '24');
    rerender(<Icon name={name} />); expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
  it('provides defaults and applies configured tokens to its wrapper', () => {
    function Consumer() { const config = useConfig(); return <output>{`${config.locale}/${config.direction}/${config.size}`}</output>; }
    const { rerender, container } = render(<Consumer />); expect(screen.getByRole('status')).toHaveTextContent('zh-CN/ltr/middle');
    rerender(<ConfigProvider locale="en-US" direction="rtl" size="large" theme={{ primaryColor: '#ff0000', borderRadius: '8px', colorBgContainer: 'white', colorText: 'black', colorBorder: 'gray' }}><Consumer /></ConfigProvider>);
    expect(screen.getByRole('status')).toHaveTextContent('en-US/rtl/large'); expect(container.firstChild).toHaveAttribute('dir', 'rtl'); expect(container.firstChild).toHaveStyle({ '--at-control-height': '48px', '--at-color-primary': '#ff0000' });
  });
});

describe('typography and floating actions', () => {
  it('renders semantic typography and supports editing commit/cancel', async () => {
    const change = vi.fn(); const cancel = vi.fn(); render(<><Typography.Title level={2}>Title</Typography.Title><Typography.Paragraph editable={{ onChange: change, onCancel: cancel }}>Original</Typography.Paragraph><Typography.Link href="/docs">Docs</Typography.Link></>);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Title'); await userEvent.click(screen.getByLabelText('编辑')); const editor = screen.getByRole('textbox');
    fireEvent.change(editor, { target: { value: 'Updated' } }); fireEvent.keyDown(editor, { key: 'Enter' }); expect(change).toHaveBeenCalledWith('Updated');
    await userEvent.click(screen.getByLabelText('编辑')); fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' }); expect(cancel).toHaveBeenCalled(); expect(screen.getByRole('link')).toHaveAttribute('href', '/docs');
  });
  it('copies text through clipboard', async () => {
    const user = userEvent.setup(); const copy = vi.spyOn(navigator.clipboard, 'writeText'); render(<Typography.Text copyable>Copy me</Typography.Text>);
    await user.click(screen.getByLabelText('复制')); expect(copy).toHaveBeenCalledWith('Copy me'); expect(screen.getByLabelText('已复制')).toBeInTheDocument();
  });
  it('expands FloatButtonGroup and dismisses with Escape', async () => {
    render(<FloatButtonGroup trigger="click" tooltip="Actions"><FloatButton tooltip="Help" /></FloatButtonGroup>);
    await userEvent.click(screen.getByLabelText('Actions')); expect(screen.getByRole('menu')).toBeInTheDocument(); fireEvent.keyDown(document, { key: 'Escape' }); expect(screen.queryByRole('menu')).toBeNull();
  });
  it('shows BackTop after scrolling and scrolls to the top', async () => {
    const target = document.createElement('div'); const scroll = vi.fn(); target.scrollTo = scroll; const getTarget = () => target; const { rerender } = render(<BackTop target={getTarget} duration={0} />);
    expect(screen.queryByRole('button')).toBeNull(); target.scrollTop = 500; rerender(<BackTop target={getTarget} duration={0} visibilityHeight={100} />);
    await userEvent.click(screen.getByRole('button')); expect(scroll).toHaveBeenCalledWith({ top: 0 });
  });
});

describe('media', () => {
  it('uses image fallback and resets when src changes', () => {
    const { rerender } = render(<Image src="bad.png" fallback="fallback.png" alt="Picture" />); fireEvent.error(screen.getByAltText('Picture')); expect(screen.getByAltText('Picture')).toHaveAttribute('src', 'fallback.png');
    rerender(<Image src="good.png" alt="Picture" />); expect(screen.getByAltText('Picture')).toHaveAttribute('src', 'good.png');
  });
  it('opens grouped previews, changes image, zooms, resets and closes', async () => {
    render(<ImagePreviewGroup><Image src="a.png" alt="A" /><Image src="b.png" alt="B" /></ImagePreviewGroup>);
    fireEvent.load(screen.getByAltText('A')); fireEvent.load(screen.getByAltText('B')); await userEvent.click(screen.getByLabelText('预览：A'));
    expect(screen.getByRole('dialog', { name: '图片预览' })).toBeInTheDocument(); await userEvent.click(screen.getByLabelText('放大')); expect(screen.getByText('125%')).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('下一张')); expect(screen.getByText('2 / 2')).toBeInTheDocument(); await userEvent.click(screen.getByLabelText('重置')); expect(screen.getByText('100%')).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' }); expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('renders QR codes with refresh and overlong-content fallback', async () => {
    const refresh = vi.fn(); const { rerender, container } = render(<QRCode value="hello" status="expired" onRefresh={refresh} />); expect(container.querySelector('svg path')).toHaveAttribute('d'); await userEvent.click(screen.getByText('点击刷新')); expect(refresh).toHaveBeenCalledOnce();
    rerender(<QRCode value={'x'.repeat(5000)} />); expect(screen.getByText('内容过长，无法生成')).toBeInTheDocument();
  });
  it('preserves watermark content when canvas rendering is unavailable', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null); const { container } = render(<Watermark content="Private"><span>Document</span></Watermark>);
    expect(screen.getByText('Document')).toBeInTheDocument(); expect(container.querySelector('.at-watermark__mark')).toHaveAttribute('aria-hidden', 'true');
  });
});
