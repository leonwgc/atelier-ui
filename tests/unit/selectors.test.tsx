import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Select } from '../../src/Select';
import { AutoComplete } from '../../src/AutoComplete';
import { Cascader } from '../../src/Cascader';
import { TreeSelect } from '../../src/TreeSelect';
import { TimePicker } from '../../src/TimePicker';
import { ColorPicker } from '../../src/ColorPicker';
import { Mentions } from '../../src/Mentions';
import { Transfer } from '../../src/Transfer';

const options = [{ label: 'Alpha', value: 'a' }, { label: 'Blocked', value: 'b', disabled: true }, { label: 'Charlie', value: 'c' }];

describe('Select', () => {
  it('opens, skips disabled options by keyboard, selects and closes', async () => {
    const change = vi.fn(); render(<Select label="Project" options={options} onChange={change} />);
    const trigger = screen.getByRole('combobox'); await userEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: 'ArrowDown' }); fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(change).toHaveBeenCalledWith('c', options[2]); expect(trigger).toHaveAttribute('aria-expanded', 'false'); expect(trigger).toHaveFocus();
  });
  it('searches grouped options and displays a custom empty state', async () => {
    render(<Select label="Project" options={[{ label: 'Group', options }]} searchable notFoundContent="No matches" />);
    await userEvent.click(screen.getByRole('combobox')); const search = screen.getByLabelText('Project搜索');
    fireEvent.change(search, { target: { value: 'char' } }); expect(screen.getAllByRole('option')).toHaveLength(1);
    fireEvent.change(search, { target: { value: 'missing' } }); expect(screen.getByText('No matches')).toBeInTheDocument();
  });
  it('toggles multiple selection, serializes hidden fields and clears', async () => {
    const change = vi.fn(); const { container } = render(<Select options={options} multiple name="projects" allowClear onChange={change} />);
    await userEvent.click(screen.getByRole('combobox')); await userEvent.click(screen.getByRole('option', { name: 'Alpha' }));
    expect(change).toHaveBeenLastCalledWith(['a'], [options[0]]); expect(container.querySelector('input[type=hidden]')).toHaveValue('a');
    await userEvent.click(screen.getByRole('option', { name: 'Charlie' })); expect(change).toHaveBeenLastCalledWith(['a', 'c'], [options[0], options[2]]);
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Backspace' }); expect(change).toHaveBeenLastCalledWith(['a'], [options[0]]);
    await userEvent.click(screen.getByLabelText('清除')); expect(change).toHaveBeenLastCalledWith([], []);
  });
  it('preserves controlled value and open state and ignores disabled activation', async () => {
    const change = vi.fn(); const { rerender } = render(<Select value="a" open options={options} onChange={change} />);
    await userEvent.click(screen.getByRole('option', { name: 'Charlie' })); expect(change).toHaveBeenCalledWith('c', options[2]);
    expect(screen.getByRole('option', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true');
    rerender(<Select disabled options={options} />); await userEvent.click(screen.getByRole('combobox')); expect(screen.queryByRole('listbox')).toBeNull();
  });
});

describe('specialized selectors', () => {
  it('filters autocomplete suggestions and selects using the keyboard', async () => {
    const select = vi.fn(); render(<AutoComplete label="City" options={['Berlin', 'Paris']} onSelect={select} />);
    const input = screen.getByRole('combobox'); await userEvent.type(input, 'Ber'); expect(screen.getAllByRole('option')).toHaveLength(1);
    fireEvent.keyDown(input, { key: 'ArrowDown' }); fireEvent.keyDown(input, { key: 'Enter' });
    expect(input).toHaveValue('Berlin'); expect(select).toHaveBeenCalledWith('Berlin', expect.objectContaining({ value: 'Berlin' }));
  });
  it('selects a full cascader path', async () => {
    const change = vi.fn(); const children = [{ label: 'City', value: 'city' }]; const parent = { label: 'Country', value: 'country', children };
    render(<Cascader options={[parent]} onChange={change} />); await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByText('Country')); await userEvent.click(screen.getByText('City'));
    expect(change).toHaveBeenCalledWith(['country', 'city'], [parent, children[0]]);
  });
  it('selects a tree-select leaf', async () => {
    const change = vi.fn(); render(<TreeSelect treeData={[{ label: 'Root', value: 'root', children: [{ label: 'Leaf', value: 'leaf' }] }]} onChange={change} />);
    await userEvent.click(screen.getByRole('combobox'));
    const expand = screen.queryByLabelText('展开'); if (expand) await userEvent.click(expand);
    await userEvent.click(screen.getByText('Leaf')); expect(change).toHaveBeenCalledWith('leaf', expect.anything());
  });
  it('disables bounded time options and commits a selected time', async () => {
    const change = vi.fn(); render(<TimePicker label="Time" defaultValue="10:00" minTime="09:00" maxTime="17:00" minuteStep={30} onChange={change} />);
    await userEvent.click(screen.getByRole('combobox'));
    const hours = screen.getByRole('listbox', { name: '时' }); expect(within(hours).getByText('08')).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(within(hours).getByText('11')); expect(change).toHaveBeenLastCalledWith('11:00', { hour: 11, minute: 0, second: 0 });
    await userEvent.click(screen.getByRole('button', { name: '确定' })); expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('chooses a preset color and provides a normalized color object', async () => {
    const change = vi.fn(); render(<ColorPicker presets={['#ff0000']} onChange={change} />);
    await userEvent.click(screen.getByRole('button')); await userEvent.click(screen.getByRole('button', { name: '#ff0000' }));
    expect(change).toHaveBeenCalledWith('#ff0000', expect.objectContaining({ hex: '#ff0000', rgb: { r: 255, g: 0, b: 0, a: 1 } }));
  });
  it('shows mention suggestions after a prefix and inserts a selected mention', () => {
    const change = vi.fn(); render(<Mentions options={[{ value: 'ada', label: 'Ada' }]} onChange={change} />);
    const input = screen.getByRole('combobox'); fireEvent.change(input, { target: { value: '@a', selectionStart: 2 } });
    fireEvent.keyUp(input, { key: 'a' }); fireEvent.keyDown(input, { key: 'ArrowDown' }); fireEvent.keyDown(input, { key: 'Enter' });
    expect(change).toHaveBeenLastCalledWith('@ada ');
  });
  it('moves selected transfer items and supports searching without selecting disabled items', async () => {
    const change = vi.fn(); render(<Transfer showSearch dataSource={[{ key: 'a', title: 'Alpha' }, { key: 'b', title: 'Blocked', disabled: true }]} onChange={change} />);
    expect(screen.getByLabelText('Blocked')).toBeDisabled();
    await userEvent.click(screen.getByLabelText('Alpha')); await userEvent.click(screen.getByRole('button', { name: '移至已选' }));
    expect(change).toHaveBeenLastCalledWith(['a'], 'right', ['a']);
    await userEvent.type(screen.getByLabelText('搜索可选项目'), 'missing'); expect(screen.getByText('暂无数据')).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('Alpha')); await userEvent.click(screen.getByRole('button', { name: '移回可选' })); expect(change).toHaveBeenLastCalledWith([], 'left', ['a']);
  });
});
