import { createTranslator, zhCN, type Translate } from '../locale';
import { getPathValue, setPathValue } from '../utils';
import type { FieldError, FieldErrors, FieldValues, FormState, RegisterOptions, ResolverResult, UseFormOptions } from './types';

const EMPTY_ERRORS = {} as FieldErrors<FieldValues>;

function readEventValue(event: unknown) {
  if (event && typeof event === 'object' && 'target' in event) {
    const target = (event as { target: HTMLInputElement | HTMLSelectElement }).target;
    if (target.type === 'checkbox') return (target as HTMLInputElement).checked;
    if (target instanceof HTMLSelectElement && target.multiple) return Array.from(target.selectedOptions, (option) => option.value);
    return target.value;
  }
  return event;
}

function ruleError<TValues extends FieldValues>(value: unknown, options: RegisterOptions<TValues>, values: TValues, t: Translate): FieldError | undefined {
  if (options.required && (value == null || value === '' || value === false)) {
    return { type: 'required', get message() { return typeof options.required === 'string' ? options.required : t('form.required'); } };
  }
  const check = (rule: number | { value: number; message: string } | undefined, type: string, message: () => string, predicate: (n: number) => boolean) => {
    if (rule == null || value == null || value === '') return undefined;
    return predicate(Number(value)) ? undefined : { type, get message() { return typeof rule === 'number' ? message() : rule.message; } };
  };
  const min = check(options.min, 'min', () => t('form.min', { min: typeof options.min === 'number' ? options.min : options.min?.value ?? 0 }), (n) => n >= (typeof options.min === 'number' ? options.min : options.min?.value ?? -Infinity));
  if (min) return min;
  const max = check(options.max, 'max', () => t('form.max', { max: typeof options.max === 'number' ? options.max : options.max?.value ?? 0 }), (n) => n <= (typeof options.max === 'number' ? options.max : options.max?.value ?? Infinity));
  if (max) return max;
  const minLength = options.minLength;
  if (minLength != null && String(value ?? '').length < (typeof minLength === 'number' ? minLength : minLength.value)) {
    return { type: 'minLength', get message() { return typeof minLength === 'number' ? t('form.minLength', { min: minLength }) : minLength.message; } };
  }
  const maxLength = options.maxLength;
  if (maxLength != null && String(value ?? '').length > (typeof maxLength === 'number' ? maxLength : maxLength.value)) {
    return { type: 'maxLength', get message() { return typeof maxLength === 'number' ? t('form.maxLength', { max: maxLength }) : maxLength.message; } };
  }
  const pattern = options.pattern;
  if (pattern && !new RegExp(pattern instanceof RegExp ? pattern.source : pattern.value.source, pattern instanceof RegExp ? pattern.flags : pattern.value.flags).test(String(value ?? ''))) {
    return { type: 'pattern', get message() { return pattern instanceof RegExp ? t('form.pattern') : pattern.message; } };
  }
  void values;
  return undefined;
}

function toFieldErrors(result: ResolverResult<FieldValues>): Record<string, FieldError> {
  const errors: Record<string, FieldError> = {};
  for (const [name, error] of Object.entries(result.errors ?? {})) {
    if (error && typeof error === 'object' && 'message' in error) errors[name] = error as FieldError;
    else if (typeof error === 'string') errors[name] = { type: 'schema', message: error };
  }
  return errors;
}

export class FormControl<TValues extends FieldValues = FieldValues> {
  private values: TValues;
  private defaults: TValues;
  private readonly listeners = new Set<() => void>();
  private readonly rules = new Map<string, RegisterOptions<TValues>>();
  private readonly touched = new Set<string>();
  private readonly refs = new Map<string, unknown>();
  private readonly registered = new Set<string>();
  private fieldErrors: Record<string, FieldError> = {};
  private snapshot: FormState<TValues>;
  private submitting = false;
  private submitted = false;
  private submitCountValue = 0;
  private dirty = false;
  private valid = true;

  constructor(readonly options: UseFormOptions<TValues> = {}, private translator: Translate = createTranslator(zhCN.messages)) {
    this.defaults = structuredClone(options.defaultValues ?? {}) as TValues;
    this.values = structuredClone(this.defaults);
    this.snapshot = this.makeSnapshot();
  }

  setTranslator = (translator: Translate) => {
    if (this.translator === translator) return;
    this.translator = translator;
    this.notify();
  };

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.snapshot;
  getValues = () => this.values;
  getValue = (name: string) => getPathValue(this.values, name);

  private makeSnapshot(): FormState<TValues> {
    const dirtyFields: Record<string, boolean> = {};
    for (const name of new Set([...this.registered, ...this.rules.keys()])) {
      dirtyFields[name] = !Object.is(getPathValue(this.values, name), getPathValue(this.defaults, name));
    }
    this.dirty = Object.values(dirtyFields).some(Boolean);
    return {
      errors: Object.keys(this.fieldErrors).length ? { ...this.fieldErrors } as FieldErrors<TValues> : EMPTY_ERRORS as FieldErrors<TValues>,
      dirtyFields,
      touchedFields: Object.fromEntries([...this.touched].map((name) => [name, true])),
      isDirty: this.dirty,
      isSubmitting: this.submitting,
      isSubmitted: this.submitted,
      isValid: this.valid && Object.keys(this.fieldErrors).length === 0,
      submitCount: this.submitCountValue,
    };
  }

  notify = () => {
    this.snapshot = this.makeSnapshot();
    this.listeners.forEach((listener) => listener());
  };

  setValue = (name: string, value: unknown, shouldValidate = false) => {
    this.values = setPathValue(this.values, name, value) as TValues;
    this.notify();
    if (shouldValidate) void this.validate([name]);
  };

  reset = (values?: Partial<TValues>) => {
    this.defaults = structuredClone(values ?? this.options.defaultValues ?? {}) as TValues;
    this.values = structuredClone(this.defaults);
    this.fieldErrors = {};
    this.touched.clear();
    this.submitted = false;
    this.submitCountValue = 0;
    this.notify();
  };

  touch = (name: string) => {
    this.touched.add(name);
    this.notify();
  };

  register = (name: string, options: RegisterOptions<TValues> = {}) => {
    this.rules.set(name, options);
    this.registered.add(name);
    const currentValue = this.getValue(name);
    return {
      name,
      defaultValue: Array.isArray(currentValue) ? currentValue.map(String) : currentValue == null || typeof currentValue === 'boolean' ? undefined : String(currentValue),
      defaultChecked: typeof currentValue === 'boolean' ? currentValue : undefined,
      onChange: (event: unknown) => {
        this.setValue(name, readEventValue(event));
        if (this.options.mode === 'onChange' || (this.submitted && this.options.reValidateMode === 'onChange')) void this.validate([name]);
      },
      onBlur: () => {
        this.touch(name);
        if (this.options.mode === 'onBlur' || (this.submitted && this.options.reValidateMode !== 'onChange')) void this.validate([name]);
      },
      ref: (element: unknown) => {
        if (element) this.refs.set(name, element);
        else this.refs.delete(name);
      },
    };
  };

  unregister = (name: string, keepValue = !this.options.shouldUnregister) => {
    this.registered.delete(name);
    this.rules.delete(name);
    this.touched.delete(name);
    delete this.fieldErrors[name];
    if (!keepValue) this.values = setPathValue(this.values, name, undefined) as TValues;
    this.notify();
  };

  validate = async (names?: string[]) => {
    const targetNames = names ?? [...this.rules.keys()];
    if (this.options.resolver) {
      const result = await this.options.resolver(this.values);
      this.fieldErrors = toFieldErrors(result as ResolverResult<FieldValues>);
      this.valid = Object.keys(this.fieldErrors).length === 0;
      if (names?.length) {
        const unrelated = Object.keys(this.fieldErrors).filter((name) => !names.includes(name));
        for (const name of unrelated) delete this.fieldErrors[name];
      }
    } else {
      for (const name of targetNames) {
        const value = this.getValue(name);
        const options = this.rules.get(name);
        let error = options ? ruleError(value, options, this.values, (key, params) => this.translator(key, params)) : undefined;
        if (!error && options?.validate) {
          const validators = typeof options.validate === 'function' ? { validate: options.validate } : options.validate;
          for (const [type, validate] of Object.entries(validators)) {
            const result = await validate(value, this.values);
            if (result !== true) {
              const translate: Translate = (key, params) => this.translator(key, params);
              error = typeof result === 'string' ? { type, message: result } : { type, get message() { return translate('form.invalid'); } };
              break;
            }
          }
        }
        if (error) this.fieldErrors[name] = error;
        else delete this.fieldErrors[name];
      }
      this.valid = Object.keys(this.fieldErrors).length === 0;
    }
    this.notify();
    return this.valid;
  };

  handleSubmit = (onValid: (values: TValues) => void | Promise<void>, onInvalid?: (errors: FieldErrors<TValues>) => void) => async (event?: { preventDefault?: () => void }) => {
    event?.preventDefault?.();
    this.submitting = true;
    this.notify();
    try {
      const valid = await this.validate();
      this.submitted = true;
      this.submitCountValue += 1;
      if (valid) await onValid(this.values);
      else onInvalid?.(this.snapshot.errors);
    } finally {
      this.submitting = false;
      this.notify();
    }
  };

  controller = (name: string) => ({
    name,
    value: this.getValue(name),
    onChange: (value: unknown) => {
      this.setValue(name, value);
      if (this.options.mode === 'onChange' || (this.submitted && this.options.reValidateMode === 'onChange')) void this.validate([name]);
    },
    onBlur: () => {
      this.touch(name);
      if (this.options.mode === 'onBlur' || (this.submitted && this.options.reValidateMode !== 'onChange')) void this.validate([name]);
    },
    ref: (node: unknown) => { if (node) this.refs.set(name, node); else this.refs.delete(name); },
  });
}
