import type { FieldErrors, FieldValues, Resolver } from '../types';

export interface ZodLikeSchema<TValues extends FieldValues> {
  safeParseAsync?: (values: unknown) => Promise<{ success: true; data: TValues } | { success: false; error: { issues: Array<{ path: Array<string | number>; message: string; code?: string }> } }>;
  safeParse?: (values: unknown) => { success: true; data: TValues } | { success: false; error: { issues: Array<{ path: Array<string | number>; message: string; code?: string }> } };
}

export function zodResolver<TValues extends FieldValues>(schema: ZodLikeSchema<TValues>): Resolver<TValues> {
  return async (values) => {
    const result = schema.safeParseAsync ? await schema.safeParseAsync(values) : schema.safeParse?.(values);
    if (!result) return { values, errors: {} };
    if (result.success) return { values: result.data, errors: {} };
    const errors: FieldErrors<TValues> = {};
    for (const issue of result.error.issues) {
      const name = issue.path.join('.');
      if (name && !errors[name]) errors[name] = { type: issue.code ?? 'schema', message: issue.message };
    }
    return { values, errors };
  };
}
