import { createRef } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Tabs } from '../../src/Tabs';
import { Collapse } from '../../src/Collapse';
import { Pagination } from '../../src/Pagination';
import { Menu } from '../../src/Menu';
import { Tree } from '../../src/Tree';
import { Table, type TableColumn } from '../../src/Table';
import { Calendar } from '../../src/Calendar';
import { Carousel, type CarouselRef } from '../../src/Carousel';
import { List } from '../../src/List';
import { Listy, type ListyRef } from '../../src/Listy';
import { Masonry } from '../../src/Masonry';
import { Anchor } from '../../src/Anchor';
import { Affix } from '../../src/Affix';
import { Splitter, SplitterPanel } from '../../src/Splitter';

describe('navigation', () => {
  it('links tabs to panels, skips disabled tabs and moves focus', async () => {
    render(<Tabs items={[{ key: 'a', label: 'A', children: 'Panel A' }, { key: 'b', label: 'B', children: 'Panel B', disabled: true }, { key: 'c', label: 'C', children: 'Panel C' }]} />);
    await userEvent.click(screen.getByRole('tab', { name: 'A' })); await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel C'); expect(screen.getByRole('tab', { name: 'C' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'C' })).toHaveAttribute('aria-controls', screen.getByRole('tabpanel').id);
  });
  it('keeps only one accordion panel open and supports closing all', async () => {
    const change = vi.fn(); render(<Collapse accordion items={[{ key: 'a', title: 'A', children: 'Body A' }, { key: 'b', title: 'B', children: 'Body B' }]} onChange={change} />);
    await userEvent.click(screen.getByRole('button', { name: 'A' })); await userEvent.click(screen.getByRole('button', { name: 'B' })); expect(screen.queryByText('Body A')).toBeNull(); expect(screen.getByRole('region')).toHaveTextContent('Body B');
    await userEvent.click(screen.getByRole('button', { name: 'B' })); expect(change).toHaveBeenLastCalledWith('');
  });
  it('clamps pagination, disables boundaries and resets page on size change', async () => {
    const change = vi.fn(); const { rerender } = render(<Pagination current={0} pageSize={10} total={100} showSizeChanger onChange={change} />);
    expect(screen.getByLabelText('上一页')).toBeDisabled(); await userEvent.click(screen.getByLabelText('下一页')); expect(change).toHaveBeenLastCalledWith(2, 10);
    await userEvent.selectOptions(screen.getByLabelText('每页条数'), '20'); expect(change).toHaveBeenLastCalledWith(1, 20);
    rerender(<Pagination current={999} pageSize={10} total={100} onChange={change} />); expect(screen.getByLabelText('下一页')).toBeDisabled(); expect(screen.getByLabelText('第 10 页')).toHaveAttribute('aria-current', 'page');
  });
  it('selects menu entries and expands inline submenus', async () => {
    const select = vi.fn(); render(<Menu items={[{ key: 'a', label: 'Alpha' }, { key: 'group', label: 'Group', children: [{ key: 'child', label: 'Child' }] }, { key: 'b', label: 'Blocked', disabled: true }]} onSelect={select} />);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Alpha' })); expect(select).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Group' })); expect(screen.getByRole('menuitem', { name: 'Child' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Blocked' })).toHaveAttribute('aria-disabled', 'true');
  });
  it('expands tree nodes and cascades checks to descendants', async () => {
    const check = vi.fn(); const select = vi.fn(); const { container } = render(<Tree treeData={[{ key: 'r', title: 'Root', children: [{ key: 'a', title: 'Alpha' }, { key: 'b', title: 'Beta' }] }]} checkable onCheck={check} onSelect={select} />);
    await userEvent.click(screen.getByRole('button', { name: '展开' })); await userEvent.click(screen.getByText('Alpha')); expect(select).toHaveBeenCalledWith(['a'], expect.objectContaining({ selected: true }));
    const checkbox = container.querySelector('[data-key="r"] .at-tree__checkbox')!; fireEvent.click(checkbox);
    expect(check).toHaveBeenCalledWith(expect.arrayContaining(['r', 'a', 'b']), expect.objectContaining({ checked: true })); expect(container.querySelector('[data-key="a"]')).toHaveAttribute('aria-checked', 'true');
  });
  it('auto-expands filtered tree ancestors and supports keyboard checking', () => {
    render(<Tree treeData={[{ key: 'r', title: 'Root', children: [{ key: 'a', title: 'Alpha' }] }]} filterValue="Alpha" checkable />);
    const leaf = screen.getByRole('treeitem', { name: 'Alpha' }); fireEvent.keyDown(leaf, { key: ' ' }); expect(leaf).toHaveAttribute('aria-checked', 'true');
  });
});

type Row = { id: number; name: string; category: string };
const rows: Row[] = [{ id: 1, name: 'Zed', category: 'a' }, { id: 2, name: 'Ada', category: 'b' }, { id: 3, name: 'Grace', category: 'a' }];
const columns: TableColumn<Row>[] = [{ key: 'name', title: 'Name', dataIndex: 'name', sorter: true }, { key: 'category', title: 'Category', dataIndex: 'category', filters: [{ label: 'A', value: 'a' }] }];

describe('Table and lists', () => {
  it('sorts, filters and paginates client data without mutating the source', async () => {
    const change = vi.fn(); render(<Table columns={columns} dataSource={rows} rowKey="id" pageSize={2} pageSizeOptions={[2, 4]} onChange={change} />);
    await userEvent.click(screen.getByLabelText('按Name排序')); expect(screen.getAllByRole('row')[1]).toHaveTextContent('Ada'); expect(rows[0].name).toBe('Zed');
    await userEvent.selectOptions(screen.getByLabelText('筛选Category'), 'a'); expect(screen.queryByText('Ada')).toBeNull(); expect(screen.getByText('Grace')).toBeInTheDocument();
    expect(change).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, filters: { category: 'a' } }));
  });
  it('reports row and page selection with selected records', async () => {
    const selection = vi.fn(); render(<Table columns={columns} dataSource={rows} rowKey={(row) => row.id} rowSelection={{ selectedRowKeys: [], onChange: selection }} />);
    await userEvent.click(screen.getByLabelText('选择第 1 行')); expect(selection).toHaveBeenLastCalledWith([1], [rows[0]]);
    await userEvent.click(screen.getByLabelText('选择本页全部行')); expect(selection).toHaveBeenLastCalledWith([1, 2, 3], rows);
  });
  it('keeps server data ordering and renders custom empty/loading states', async () => {
    const { rerender } = render(<Table columns={columns} dataSource={rows} rowKey="id" mode="server" />);
    await userEvent.click(screen.getByLabelText('按Name排序')); expect(screen.getAllByRole('row')[1]).toHaveTextContent('Zed');
    rerender(<Table columns={columns} dataSource={[]} rowKey="id" emptyText="No records" />); expect(screen.getByText('No records')).toBeInTheDocument();
    rerender(<Table columns={columns} dataSource={rows} rowKey="id" loading />); expect(screen.getByText('正在加载数据…')).toBeInTheDocument();
  });
  it('paginates List and switches to empty and skeleton states', async () => {
    const renderItem = (item: Row) => <List.Item><List.Item.Meta title={item.name} description={item.category} /></List.Item>;
    const { rerender } = render(<List dataSource={rows} renderItem={renderItem} pagination={{ pageSize: 1 }} />);
    expect(screen.getByText('Zed')).toBeInTheDocument(); await userEvent.click(screen.getByLabelText('下一页')); expect(screen.getByText('Ada')).toBeInTheDocument(); expect(screen.queryByText('Zed')).toBeNull();
    rerender(<List dataSource={[]} renderItem={renderItem} emptyText="Empty list" />); expect(screen.getByText('Empty list')).toBeInTheDocument();
    rerender(<List dataSource={rows} renderItem={renderItem} loading />); expect(screen.getByLabelText('加载中')).toHaveAttribute('aria-busy', 'true');
  });
  it('virtualizes Listy, emits range and end events and supports imperative scrolling', () => {
    const items = Array.from({ length: 100 }, (_, i) => i); const range = vi.fn(); const end = vi.fn(); const ref = createRef<ListyRef>();
    render(<Listy ref={ref} items={items} renderItem={(item) => `Row ${item}`} height={100} itemHeight={20} overscan={0} onVisibleRangeChange={range} onEndReached={end} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(6); expect(screen.queryByText('Row 99')).toBeNull();
    const viewport = screen.getByRole('list'); const scroll = vi.fn(); viewport.scrollTo = scroll;
    act(() => ref.current?.scrollTo(10)); expect(scroll).toHaveBeenLastCalledWith({ top: 200 });
    fireEvent.scroll(viewport, { target: { scrollTop: 1900 } }); expect(end).toHaveBeenCalledOnce(); expect(screen.getByText('Row 99')).toBeInTheDocument();
    fireEvent.scroll(viewport); expect(end).toHaveBeenCalledOnce(); act(() => ref.current?.scrollToTop()); expect(scroll).toHaveBeenLastCalledWith({ top: 0 });
  });
  it('lays masonry items into columns using measured dimensions', () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(400);
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 200, 100));
    const layout = vi.fn(); const { container } = render(<Masonry columns={2} gap={10} onLayout={layout}><span>A</span><span>B</span><span>C</span></Masonry>);
    expect(layout).toHaveBeenCalledWith({ columns: 2, height: 210 }); expect(container.querySelectorAll('.at-masonry__item')[2]).toHaveStyle({ transform: 'translate(0px, 110px)', width: '195px' });
  });
});

describe('calendar and carousel', () => {
  it('selects enabled dates and changes month/year views', async () => {
    const change = vi.fn(); render(<Calendar defaultValue={new Date(2026, 9, 15)} disabledDate={(date) => date.getDate() === 16} onChange={change} />);
    await userEvent.click(screen.getByRole('gridcell', { name: '2026年10月16日' })); expect(change).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('gridcell', { name: '2026年10月17日' })); expect(change).toHaveBeenCalledWith(new Date(2026, 9, 17));
    await userEvent.click(screen.getByLabelText('下个月')); expect(screen.getByText('2026 年 11 月')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('radio', { name: '年' })); expect(screen.getAllByRole('gridcell')).toHaveLength(12);
  });
  it('supports carousel controls, bounds and imperative navigation', async () => {
    const change = vi.fn(); const ref = createRef<CarouselRef>(); render(<Carousel ref={ref} items={['A', 'B', 'C']} arrows infinite={false} onChange={change} />);
    expect(screen.getByLabelText('上一张')).toBeDisabled(); await userEvent.click(screen.getByLabelText('下一张')); expect(change).toHaveBeenLastCalledWith(1);
    act(() => ref.current?.goTo(99)); expect(change).toHaveBeenLastCalledWith(2); expect(screen.getByLabelText('下一张')).toBeDisabled();
    act(() => ref.current?.prev()); expect(screen.getByRole('tab', { name: '第 2 张' })).toHaveAttribute('aria-selected', 'true');
  });
  it('autoplays carousel, pauses on hover and clears timers on unmount', () => {
    vi.useFakeTimers(); const change = vi.fn(); const { unmount } = render(<Carousel items={['A', 'B']} autoplay autoplaySpeed={1000} onChange={change} />);
    act(() => vi.advanceTimersByTime(1000)); expect(change).toHaveBeenCalledWith(1); fireEvent.mouseEnter(screen.getByRole('region'));
    act(() => vi.advanceTimersByTime(2000)); expect(change).toHaveBeenCalledTimes(1); unmount(); expect(vi.getTimerCount()).toBe(0);
  });
});

describe('layout interactions', () => {
  it('scrolls anchor targets with offsets and updates active location', async () => {
    const container = document.createElement('div'); const scroll = vi.fn(); container.scrollTo = scroll;
    render(<><Anchor getContainer={() => container} items={[{ href: '#section', title: 'Section' }]} targetOffset={10} /><section id="section">Body</section></>);
    await userEvent.click(screen.getByRole('link')); expect(scroll).toHaveBeenCalledWith({ top: -10, behavior: 'smooth' }); expect(screen.getByRole('link')).toHaveAttribute('aria-current', 'location');
  });
  it('pins Affix when its placeholder crosses its offset', () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(new DOMRect(10, -10, 100, 30));
    const change = vi.fn(); const target = document.createElement('div');
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 800, 600));
    render(<Affix target={() => target} offsetTop={5} onChange={change}><button>Sticky</button></Affix>);
    expect(change).toHaveBeenCalledWith(true); expect(screen.getByText('Sticky').parentElement).toHaveStyle({ position: 'fixed', top: '5px' });
  });
  it('resizes splitter panels using the keyboard', () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 600, 200));
    const resize = vi.fn(); render(<Splitter onResize={resize}><SplitterPanel min={100}>Left</SplitterPanel><SplitterPanel>Right</SplitterPanel></Splitter>);
    fireEvent.keyDown(screen.getByRole('separator'), { key: 'ArrowRight' }); expect(resize).toHaveBeenCalled(); expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
  });
});
