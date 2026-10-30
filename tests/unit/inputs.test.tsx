import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../../src/Button';
import { Input } from '../../src/Input';
import { Textarea } from '../../src/Textarea';
import { Checkbox, CheckboxGroup } from '../../src/Checkbox';
import { Radio, RadioGroup } from '../../src/Radio';
import { Switch } from '../../src/Switch';
import { InputOTP } from '../../src/InputOTP';
import { InputNumber } from '../../src/InputNumber';
import { Rate } from '../../src/Rate';
import { Slider } from '../../src/Slider';
import { Segmented } from '../../src/Segmented';
import { DatePicker } from '../../src/DatePicker';
import { Upload } from '../../src/Upload';

describe('basic inputs', () => {
  it('forwards button refs, attributes and clicks; loading prevents activation', async () => {
    const user = userEvent.setup(); const click = vi.fn(); const ref = createRef<HTMLButtonElement>();
    const { rerender } = render(<Button ref={ref} onClick={click} icon={<span>Icon</span>}>Save</Button>);
    expect(ref.current).toBe(screen.getByRole('button')); expect(ref.current).toHaveAttribute('type', 'button');
    await user.click(screen.getByRole('button')); expect(click).toHaveBeenCalledOnce();
    rerender(<Button loading onClick={click}>Save</Button>); await user.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true'); expect(click).toHaveBeenCalledOnce();
  });
  it('associates input/textarea labels, errors and native attributes', async () => {
    render(<><Input label="Email" error="Invalid email" hint="Hidden hint" required /><Textarea label="Notes" hint="Optional" maxLength={10} /></>);
    expect(screen.getByLabelText('Email')).toBeRequired(); expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email'); expect(screen.queryByText('Hidden hint')).toBeNull();
    await userEvent.type(screen.getByLabelText('Notes'), 'hello'); expect(screen.getByLabelText('Notes')).toHaveValue('hello');
    expect(screen.getByText('Optional')).toBeInTheDocument();
  });
  it('emits an empty controlled input value on clear', async () => {
    const change = vi.fn(); render(<Input value="Ada" label="Name" clearable onChange={change} />);
    await userEvent.click(screen.getByRole('button', { name: '清空输入' }));
    expect(change.mock.calls[0][0].target.value).toBe(''); expect(screen.getByLabelText('Name')).toHaveValue('Ada');
  });
  it.each([['checkbox', Checkbox], ['radio', Radio], ['switch', Switch]] as const)('supports native %s input changes and disabled state', async (role, Component) => {
    const change = vi.fn(); const { rerender } = render(<Component aria-label="Choice" onChange={change} />);
    await userEvent.click(screen.getByRole(role)); expect(change).toHaveBeenCalledOnce(); expect(screen.getByRole(role)).toBeChecked();
    rerender(<Component aria-label="Choice" disabled onChange={change} />); await userEvent.click(screen.getByRole(role)); expect(change).toHaveBeenCalledOnce();
  });
  it('adds/removes checkbox group choices and respects option disabling', async () => {
    const change = vi.fn(); render(<CheckboxGroup options={[{ label: 'A', value: 'a' }, { label: 'B', value: 'b', disabled: true }]} defaultValue={['a']} onChange={change} />);
    await userEvent.click(screen.getByRole('checkbox', { name: /A/ })); expect(change).toHaveBeenLastCalledWith([]);
    await userEvent.click(screen.getByRole('checkbox', { name: /A/ })); expect(change).toHaveBeenLastCalledWith(['a']);
    expect(screen.getByRole('checkbox', { name: /B/ })).toBeDisabled();
  });
  it('preserves controlled radio group state until props change', async () => {
    const change = vi.fn(); render(<RadioGroup name="group" options={[{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }]} value="a" onChange={change} />);
    await userEvent.click(screen.getByLabelText('B')); expect(change).toHaveBeenCalledWith('b'); expect(screen.getByLabelText('A')).toBeChecked();
  });
  it('exposes date bounds and associated help', () => {
    render(<DatePicker label="Date" hint="Pick a day" min="2026-01-01" max="2026-12-31" />);
    const input = screen.getByLabelText('Date'); expect(input).toHaveAttribute('type', 'date'); expect(input).toHaveAccessibleDescription('Pick a day');
    expect(input).toHaveAttribute('min', '2026-01-01');
  });
});

describe('InputOTP', () => {
  it('filters pasted characters, truncates, completes and moves focus', async () => {
    const user = userEvent.setup(); const complete = vi.fn(); const change = vi.fn();
    render(<InputOTP length={4} onChange={change} onComplete={complete} />);
    await user.click(screen.getAllByRole('textbox')[0]); await user.paste('a12b345');
    expect(screen.getAllByRole('textbox').map((input) => (input as HTMLInputElement).value)).toEqual(['1', '2', '3', '4']);
    expect(complete).toHaveBeenCalledWith('1234'); expect(change).toHaveBeenCalledWith('1234'); expect(screen.getAllByRole('textbox')[3]).toHaveFocus();
    await user.keyboard('{ArrowLeft}{Backspace}'); expect(change).toHaveBeenLastCalledWith('124');
  });
  it('keeps controlled digits and disables every cell', () => {
    const { rerender } = render(<InputOTP value="a12" length={3} />); expect(screen.getAllByRole('textbox')[0]).toHaveValue('1');
    rerender(<InputOTP value="345" length={3} disabled />); screen.getAllByRole('textbox').forEach((input) => expect(input).toBeDisabled());
  });
});

describe('numeric and choice controls', () => {
  it('steps and clamps InputNumber, commits text and clears invalid text', () => {
    const change = vi.fn(); render(<InputNumber label="Quantity" defaultValue={1} min={0} max={2} step={.5} onChange={change} />);
    const input = screen.getByRole('spinbutton'); fireEvent.keyDown(input, { key: 'ArrowUp' }); expect(change).toHaveBeenLastCalledWith(1.5);
    fireEvent.change(input, { target: { value: '99' } }); fireEvent.blur(input); expect(change).toHaveBeenLastCalledWith(2); expect(screen.getByLabelText('增加')).toBeDisabled();
    fireEvent.change(input, { target: { value: '-' } }); fireEvent.keyDown(input, { key: 'Enter' }); expect(change).toHaveBeenLastCalledWith(null);
  });
  it('prevents changes to disabled InputNumber', () => {
    const change = vi.fn(); render(<InputNumber defaultValue={1} disabled onChange={change} />);
    fireEvent.keyDown(screen.getByRole('spinbutton'), { key: 'ArrowUp' }); expect(change).not.toHaveBeenCalled();
  });
  it('rates, clears and handles half-step keyboard input', () => {
    const change = vi.fn(); render(<Rate defaultValue={2} allowHalf onChange={change} />);
    fireEvent.click(screen.getByRole('button', { name: '2 星' })); expect(change).toHaveBeenLastCalledWith(0);
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' }); expect(change).toHaveBeenLastCalledWith(.5);
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'End' }); expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '5');
  });
  it('snaps slider keyboard input and emits completed values', () => {
    const change = vi.fn(); const complete = vi.fn(); render(<Slider defaultValue={20} step={null} marks={{ 0: 'Low', 20: 'Medium', 100: 'High' }} onChange={change} onChangeComplete={complete} />);
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' }); expect(change).toHaveBeenLastCalledWith(100); expect(complete).toHaveBeenLastCalledWith(100);
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'Home' }); expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '0');
  });
  it('sorts range values and keeps disabled sliders unchanged', () => {
    const change = vi.fn(); const { rerender } = render(<Slider range defaultValue={[80, 20]} onChange={change} />);
    expect(screen.getAllByRole('slider').map((el) => el.getAttribute('aria-valuenow'))).toEqual(['20', '80']);
    rerender(<Slider range value={[20, 80]} disabled onChange={change} />); fireEvent.keyDown(screen.getAllByRole('slider')[0], { key: 'End' }); expect(change).not.toHaveBeenCalled();
  });
  it('moves segmented selection and focus past disabled options', async () => {
    render(<Segmented<string> options={['A', { value: 'B', label: 'B', disabled: true }, 'C']} />);
    await userEvent.click(screen.getByRole('radio', { name: 'A' })); await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'C' })).toHaveAttribute('aria-checked', 'true'); expect(screen.getByRole('radio', { name: 'C' })).toHaveFocus();
  });
});

describe('Upload', () => {
  it('filters extensions and MIME types, appends files and removes a selection', async () => {
    const change = vi.fn(); const { container } = render(<Upload accept=".txt,image/*" multiple onChange={change} />);
    const txt = new File(['text'], 'notes.TXT', { type: 'text/plain' }); const image = new File(['image'], 'a.png', { type: 'image/png' }); const bad = new File(['pdf'], 'a.pdf', { type: 'application/pdf' });
    const input = container.querySelector('input')!;
    fireEvent.change(input, { target: { files: [txt, bad] } }); expect(change).toHaveBeenLastCalledWith([txt]);
    fireEvent.drop(container.firstChild!, { dataTransfer: { files: [image] } }); expect(change).toHaveBeenLastCalledWith([txt, image]);
    await userEvent.click(screen.getByLabelText('移除 notes.TXT')); expect(change).toHaveBeenLastCalledWith([image]);
  });
  it('ignores dropped files while disabled', () => {
    const change = vi.fn(); const { container } = render(<Upload disabled onChange={change} />);
    fireEvent.drop(container.firstChild!, { dataTransfer: { files: [new File([''], 'a')] } }); expect(change).not.toHaveBeenCalled();
  });
});
