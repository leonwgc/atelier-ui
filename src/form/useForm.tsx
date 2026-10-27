import { createContext, useContext, useEffect, useMemo, useRef, useSyncExternalStore, type ReactNode } from 'react';
import { getPathValue } from '../utils';
import { FormControl } from './control';
import type { Control, FieldValues, FormControlInstance, UseFormOptions, UseFormReturn } from './types';

const FormContext = createContext<Control | null>(null);

export function useForm<TValues extends FieldValues = FieldValues>(options: UseFormOptions<TValues> = {}): UseFormReturn<TValues> {
  const control = useMemo(() => new FormControl(options), []);
  const formState = useSyncExternalStore(control.subscribe, control.getSnapshot, control.getSnapshot);
  return {
    register: control.register,
    unregister: control.unregister,
    handleSubmit: control.handleSubmit,
    watch: (name?: string) => name ? getPathValue(control.getValues(), name) : control.getValues(),
    setValue: (name, value, config) => control.setValue(name, value, config?.shouldValidate),
    getValues: control.getValues,
    reset: control.reset,
    trigger: (name) => control.validate(name ? [name] : undefined),
    control: { _control: control },
    formState,
  };
}

export function FormProvider<TValues extends FieldValues>({ control, children }: { control: Control<TValues>; children: ReactNode }) {
  return <FormContext.Provider value={control as Control}>{children}</FormContext.Provider>;
}

export function useFormContext<TValues extends FieldValues = FieldValues>() {
  const control = useContext(FormContext) as Control<TValues> | null;
  if (!control) throw new Error('useFormContext must be used inside FormProvider');
  return useFormFromControl(control);
}

function useFormFromControl<TValues extends FieldValues>(control: Control<TValues>): UseFormReturn<TValues> {
  const instance = control._control as FormControlInstance<TValues>;
  const formState = useSyncExternalStore(instance.subscribe, instance.getSnapshot, instance.getSnapshot);
  return {
    register: instance.register,
    unregister: instance.unregister,
    handleSubmit: instance.handleSubmit,
    watch: (name?: string) => name ? instance.getValue(name) : instance.getValues(),
    setValue: (name, value, options) => instance.setValue(name, value, options?.shouldValidate),
    getValues: instance.getValues,
    reset: instance.reset,
    trigger: (name) => instance.validate(name ? [name] : undefined),
    control,
    formState,
  };
}

export function useWatch<TValues extends FieldValues = FieldValues>({ control, name }: { control: Control<TValues>; name: string }): unknown {
  const instance = control._control;
  return useSyncExternalStore(instance.subscribe, () => instance.getValue(name), () => instance.getValue(name));
}

export interface ControllerRenderProps<TValues extends FieldValues = FieldValues> {
  field: ReturnType<FormControl<TValues>['controller']>;
  fieldState: { error?: { type: string; message: string }; isTouched: boolean; isDirty: boolean };
  formState: ReturnType<FormControl<TValues>['getSnapshot']>;
}

export function Controller<TValues extends FieldValues = FieldValues>({
  control,
  name,
  rules,
  render,
}: {
  control: Control<TValues>;
  name: string;
  rules?: Parameters<FormControl<TValues>['register']>[1];
  render: (props: ControllerRenderProps<TValues>) => ReactNode;
}) {
  const instance = control._control;
  const rulesRef = useRef(rules);
  rulesRef.current = rules;
  useEffect(() => {
    instance.register(name, rulesRef.current);
    return () => instance.unregister(name, !instance.options.shouldUnregister);
  }, [instance, name]);
  const value = useSyncExternalStore(instance.subscribe, () => instance.getValue(name), () => instance.getValue(name));
  const formState = useSyncExternalStore(instance.subscribe, instance.getSnapshot, instance.getSnapshot);
  const field = { ...instance.controller(name), value };
  return render({
    field,
    fieldState: { error: formState.errors[name], isTouched: Boolean(formState.touchedFields[name]), isDirty: Boolean(formState.dirtyFields[name]) },
    formState,
  });
}

export function useFieldArray<TValues extends FieldValues = FieldValues, TItem extends FieldValues = FieldValues>({ control, name }: { control: Control<TValues>; name: string }) {
  const instance = control._control;
  const values = useSyncExternalStore(instance.subscribe, () => (instance.getValue(name) as TItem[] | undefined) ?? EMPTY_ITEMS as TItem[], () => EMPTY_ITEMS as TItem[]);
  const ids = useRef<string[]>([]);
  while (ids.current.length < values.length) ids.current.push(createFieldId());
  while (ids.current.length > values.length) ids.current.pop();
  const replace = (next: TItem[]) => instance.setValue(name, next);
  return {
    fields: values.map((item, index) => ({ ...item, id: ids.current[index] })),
    append: (value: TItem) => { ids.current.push(createFieldId()); replace([...values, value]); },
    prepend: (value: TItem) => { ids.current.unshift(createFieldId()); replace([value, ...values]); },
    insert: (index: number, value: TItem) => { ids.current.splice(index, 0, createFieldId()); replace([...values.slice(0, index), value, ...values.slice(index)]); },
    remove: (index?: number) => { if (index == null) ids.current = []; else ids.current.splice(index, 1); replace(index == null ? [] : values.filter((_, current) => current !== index)); },
    swap: (first: number, second: number) => { const next = [...values]; [next[first], next[second]] = [next[second], next[first]]; [ids.current[first], ids.current[second]] = [ids.current[second], ids.current[first]]; replace(next); },
    move: (from: number, to: number) => { const next = [...values]; const [item] = next.splice(from, 1); const [id] = ids.current.splice(from, 1); next.splice(to, 0, item); ids.current.splice(to, 0, id); replace(next); },
    update: (index: number, value: TItem) => replace(values.map((item, current) => current === index ? value : item)),
    replace,
  };
}

const EMPTY_ITEMS: FieldValues[] = [];

let fieldId = 0;
function createFieldId() {
  fieldId += 1;
  return `at-field-${fieldId}`;
}
