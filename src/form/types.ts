export type FieldValues = Record<string, unknown>;
export type FieldPath<T extends FieldValues = FieldValues> = string & { readonly __fieldPath?: T };
export type FieldErrors<T extends FieldValues = FieldValues> = Record<string, FieldError | undefined> & { root?: FieldError; readonly __valuesType?: T };
export interface FieldError { type: string; message: string }

export type Validate<T = unknown, TValues extends FieldValues = FieldValues> =
  | ((value: T, values: TValues) => boolean | string | Promise<boolean | string>)
  | Record<string, (value: T, values: TValues) => boolean | string | Promise<boolean | string>>;

export interface RegisterOptions<TValues extends FieldValues = FieldValues> {
  required?: boolean | string;
  min?: number | { value: number; message: string };
  max?: number | { value: number; message: string };
  minLength?: number | { value: number; message: string };
  maxLength?: number | { value: number; message: string };
  pattern?: RegExp | { value: RegExp; message: string };
  validate?: Validate<unknown, TValues>;
}

export interface ResolverResult<TValues extends FieldValues> {
  values: TValues;
  errors: FieldErrors<TValues>;
}

export type Resolver<TValues extends FieldValues = FieldValues> = (
  values: TValues,
) => ResolverResult<TValues> | Promise<ResolverResult<TValues>>;

export interface UseFormOptions<TValues extends FieldValues = FieldValues> {
  defaultValues?: Partial<TValues>;
  mode?: 'onSubmit' | 'onBlur' | 'onChange';
  reValidateMode?: 'onBlur' | 'onChange';
  shouldUnregister?: boolean;
  resolver?: Resolver<TValues>;
}

export interface FormState<TValues extends FieldValues = FieldValues> {
  errors: FieldErrors<TValues>;
  dirtyFields: Record<string, boolean>;
  touchedFields: Record<string, boolean>;
  isDirty: boolean;
  isSubmitting: boolean;
  isSubmitted: boolean;
  isValid: boolean;
  submitCount: number;
}

export interface FieldController<TValues extends FieldValues = FieldValues> {
  name: FieldPath<TValues> | string;
  value: unknown;
  onChange: (value: unknown) => void;
  onBlur: () => void;
  ref: (node: unknown) => void;
  disabled?: boolean;
}

export interface FormControlInstance<TValues extends FieldValues = FieldValues> {
  options: UseFormOptions<TValues>;
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => FormState<TValues>;
  getValues: () => TValues;
  getValue: (name: string) => unknown;
  setValue: (name: string, value: unknown, shouldValidate?: boolean) => void;
  reset: (values?: Partial<TValues>) => void;
  touch: (name: string) => void;
  register: (name: string, options?: RegisterOptions<TValues>) => {
    name: string;
    defaultValue: string | string[] | undefined;
    defaultChecked?: boolean;
    onChange: (event: unknown) => void;
    onBlur: () => void;
    ref: (element: unknown) => void;
  };
  unregister: (name: string, keepValue?: boolean) => void;
  validate: (names?: string[]) => Promise<boolean>;
  handleSubmit: (onValid: (values: TValues) => void | Promise<void>, onInvalid?: (errors: FieldErrors<TValues>) => void) => (event?: { preventDefault?: () => void }) => Promise<void>;
  controller: (name: string) => FieldController<TValues>;
}

export interface Control<TValues extends FieldValues = FieldValues> {
  _control: FormControlInstance<TValues>;
}

export interface UseFormReturn<TValues extends FieldValues = FieldValues> {
  register: (name: FieldPath<TValues> | string, options?: RegisterOptions<TValues>) => ReturnType<FormControlInstance<TValues>['register']>;
  unregister: (name: FieldPath<TValues> | string, keepValue?: boolean) => void;
  handleSubmit: FormControlInstance<TValues>['handleSubmit'];
  watch: (name?: FieldPath<TValues> | string) => unknown;
  setValue: (name: FieldPath<TValues> | string, value: unknown, options?: { shouldValidate?: boolean }) => void;
  getValues: () => TValues;
  reset: (values?: Partial<TValues>) => void;
  trigger: (name?: FieldPath<TValues> | string) => Promise<boolean>;
  control: Control<TValues>;
  formState: FormState<TValues>;
}
