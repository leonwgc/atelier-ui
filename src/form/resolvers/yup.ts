import { createTranslator, resolveLocale, type LocaleInput } from '../../locale';
import type { FieldErrors, FieldValues, Resolver } from '../types';

export interface YupLikeSchema<TValues extends FieldValues> {
  validate: (values: unknown, options?: { abortEarly?: boolean }) => Promise<TValues>;
}

export function yupResolver<TValues extends FieldValues>(schema: YupLikeSchema<TValues>, locale?: LocaleInput): Resolver<TValues> {
  return async (values) => {
    try {
      return { values: await schema.validate(values, { abortEarly: false }), errors: {} };
    } catch (error) {
      const errors: FieldErrors<TValues> = {};
      const inner = error && typeof error === 'object' && 'inner' in error && Array.isArray(error.inner)
        ? error.inner as Array<{ path?: string; message?: string; type?: string }>
        : [error as { path?: string; message?: string; type?: string }];
      for (const item of inner) {
        if (item.path && !errors[item.path]) errors[item.path] = { type: item.type ?? 'schema', message: item.message ?? createTranslator(resolveLocale(locale).messages)('form.invalid') };
      }
      return { values, errors };
    }
  };
}
