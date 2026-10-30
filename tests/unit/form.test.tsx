import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FormControl } from '../../src/form/control';
import { Controller, FormProvider, useFieldArray, useForm, useFormContext, useWatch } from '../../src/form/useForm';
import { zodResolver } from '../../src/form/resolvers/zod';
import { yupResolver } from '../../src/form/resolvers/yup';
import type { RegisterOptions } from '../../src/form/types';

describe('FormControl', () => {
  it('isolates defaults, publishes changes and tracks dirty/touched state', () => {
    const defaults = { profile: { name: 'Ada' } }; const control = new FormControl({ defaultValues: defaults });
    control.register('profile.name'); const listener = vi.fn(); const unsubscribe = control.subscribe(listener);
    control.setValue('profile.name', 'Grace'); control.touch('profile.name');
    expect(defaults.profile.name).toBe('Ada');
    expect(control.getSnapshot()).toMatchObject({ isDirty: true, touchedFields: { 'profile.name': true }, dirtyFields: { 'profile.name': true } });
    unsubscribe(); control.reset(); expect(listener).toHaveBeenCalledTimes(2);
    expect(control.getValue('profile.name')).toBe('Ada'); expect(control.getSnapshot().isDirty).toBe(false);
  });
  it.each<[RegisterOptions, unknown, string]>([
    [{ required: 'Required' }, '', 'required'], [{ required: true }, false, 'required'],
    [{ min: 2 }, 1, 'min'], [{ max: { value: 4, message: 'Too big' } }, 5, 'max'],
    [{ minLength: 2 }, 'a', 'minLength'], [{ maxLength: { value: 2, message: 'Long' } }, 'abc', 'maxLength'],
    [{ pattern: /^a$/ }, 'b', 'pattern'], [{ validate: async () => 'Rejected' }, 'x', 'validate'],
    [{ validate: { unique: () => false } }, 'x', 'unique'],
  ])('validates %j against %j', async (rules, value, type) => {
    const control = new FormControl(); control.register('field', rules); control.setValue('field', value);
    expect(await control.validate()).toBe(false); expect(control.getSnapshot().errors.field?.type).toBe(type);
    control.unregister('field'); expect(await control.validate()).toBe(true);
  });
  it('clears corrected errors and validates selected fields', async () => {
    const control = new FormControl(); control.register('a', { required: true }); control.register('b', { required: true });
    await control.validate(); control.setValue('a', 'ok'); await control.validate(['a']);
    expect(control.getSnapshot().errors.a).toBeUndefined(); expect(control.getSnapshot().errors.b).toBeDefined();
    control.setValue('b', 'ok'); expect(await control.validate()).toBe(true);
  });
  it('reads text, checkbox, multiple-select and direct values from register handlers', () => {
    const control = new FormControl(); const field = control.register('field');
    field.onChange({ target: { value: 'text', type: 'text' } }); expect(control.getValue('field')).toBe('text');
    field.onChange({ target: { checked: true, type: 'checkbox' } }); expect(control.getValue('field')).toBe(true);
    const select = document.createElement('select'); select.multiple = true;
    select.innerHTML = '<option value="a" selected>A</option><option value="b" selected>B</option>';
    field.onChange({ target: select }); expect(control.getValue('field')).toEqual(['a', 'b']);
    field.onChange(42); field.onBlur(); expect(control.getValue('field')).toBe(42);
    expect(control.getSnapshot().touchedFields.field).toBe(true);
  });
  it('retains or removes values according to unregister options', () => {
    const control = new FormControl({ defaultValues: { a: 1, b: 2 }, shouldUnregister: true });
    control.register('a'); control.register('b'); control.unregister('a'); control.unregister('b', true);
    expect(control.getValue('a')).toBeUndefined(); expect(control.getValue('b')).toBe(2);
  });
  it('submits valid values, reports invalid errors and always clears submitting after rejection', async () => {
    const control = new FormControl(); control.register('name', { required: true });
    const valid = vi.fn(); const invalid = vi.fn(); const preventDefault = vi.fn();
    await control.handleSubmit(valid, invalid)({ preventDefault });
    expect(preventDefault).toHaveBeenCalledOnce(); expect(valid).not.toHaveBeenCalled(); expect(invalid).toHaveBeenCalled();
    control.setValue('name', 'Ada'); await control.handleSubmit(valid)(); expect(valid).toHaveBeenCalledWith({ name: 'Ada' });
    expect(control.getSnapshot()).toMatchObject({ isSubmitted: true, isSubmitting: false, submitCount: 2 });
    await expect(control.handleSubmit(async () => { throw new Error('network'); })()).rejects.toThrow('network');
    expect(control.getSnapshot().isSubmitting).toBe(false);
    control.reset({ name: 'Grace' }); expect(control.getSnapshot().submitCount).toBe(0);
  });
  it.each(['onChange', 'onBlur'] as const)('validates in %s mode', async (mode) => {
    const control = new FormControl({ mode }); const field = control.register('name', { required: true });
    field.onChange(''); if (mode === 'onBlur') field.onBlur();
    await waitFor(() => expect(control.getSnapshot().isValid).toBe(false));
  });
});

describe('form React bindings', () => {
  it('shares provider state with useWatch and controlled fields', async () => {
    function Watcher() { const form = useFormContext(); const name = useWatch({ control: form.control, name: 'name' }); return <output>{String(name)}</output>; }
    function App() {
      const form = useForm({ defaultValues: { name: '' } });
      return <FormProvider control={form.control}><Watcher /><Controller control={form.control} name="name" rules={{ required: 'Required' }} render={({ field, fieldState }) => <><input aria-label="Name" value={String(field.value)} onChange={(e) => field.onChange(e.target.value)} onBlur={field.onBlur} /><span>{fieldState.error?.message}</span></>} /><button onClick={() => void form.trigger()}>Validate</button><button onClick={() => form.reset()}>Reset</button></FormProvider>;
    }
    render(<App />); fireEvent.click(screen.getByText('Validate')); expect(await screen.findByText('Required')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ada' } }); expect(screen.getByRole('status')).toHaveTextContent('Ada');
    fireEvent.click(screen.getByText('Reset')); expect(screen.getByLabelText('Name')).toHaveValue('');
  });
  it('supports all field-array operations while preserving identity on moves', () => {
    const { result } = renderHook(() => { const form = useForm({ defaultValues: { rows: [{ name: 'a' }, { name: 'b' }] } }); return useFieldArray({ control: form.control, name: 'rows' }); });
    const id = result.current.fields[0].id;
    act(() => result.current.append({ name: 'c' })); act(() => result.current.prepend({ name: 'z' }));
    act(() => result.current.insert(1, { name: 'x' })); act(() => result.current.swap(0, 2));
    expect(result.current.fields[0].id).toBe(id);
    act(() => result.current.move(0, 3)); expect(result.current.fields[3].id).toBe(id);
    act(() => result.current.update(3, { name: 'updated' })); expect(result.current.fields[3].name).toBe('updated');
    act(() => result.current.remove(1)); expect(result.current.fields).toHaveLength(4);
    act(() => result.current.replace([{ name: 'only' }])); expect(result.current.fields).toHaveLength(1);
    act(() => result.current.remove()); expect(result.current.fields).toEqual([]);
  });
});

describe('schema adapters', () => {
  it('supports sync and async Zod-style parsing and retains first nested issue', async () => {
    expect(await zodResolver({ safeParse: () => ({ success: true, data: { name: 'trimmed' } }) })({ name: ' raw ' })).toEqual({ values: { name: 'trimmed' }, errors: {} });
    const resolver = zodResolver({ safeParseAsync: async () => ({ success: false, error: { issues: [{ path: ['rows', 0, 'name'], message: 'Required', code: 'required' }, { path: ['rows', 0, 'name'], message: 'Other' }] } }) });
    expect((await resolver({})).errors).toEqual({ 'rows.0.name': { message: 'Required', type: 'required' } });
    expect(await zodResolver({})({ a: 1 })).toEqual({ values: { a: 1 }, errors: {} });
  });
  it('maps Yup-style validation errors and returns transformed successful values', async () => {
    const validate = vi.fn(async () => ({ name: 'trimmed' }));
    expect(await yupResolver({ validate })({ name: ' raw ' })).toEqual({ values: { name: 'trimmed' }, errors: {} });
    expect(validate).toHaveBeenCalledWith({ name: ' raw ' }, { abortEarly: false });
    const resolver = yupResolver<Record<string, unknown>>({ validate: async () => { throw { inner: [{ path: 'name', message: 'First', type: 'required' }, { path: 'name', message: 'Second' }, { path: 'age' }] }; } });
    expect((await resolver({})).errors).toEqual({ name: { type: 'required', message: 'First' }, age: { type: 'schema', message: '字段校验未通过' } });
    expect((await yupResolver<Record<string, unknown>>({ validate: async () => { throw { path: 'name', message: 'Invalid' }; } })({})).errors.name?.message).toBe('Invalid');
  });
});
