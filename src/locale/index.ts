import { createContext, useContext, useMemo } from 'react';
import { zhCNMessages } from './zh-CN';
import { enUSMessages } from './en-US';
import type { Locale, LocaleInput, LocaleMessages, LocaleOverrides, Translate } from './types';
export type { Locale, LocaleInput, LocaleKey, LocaleMessages, LocaleOverrides, LocaleParams, Translate } from './types';

export const zhCN: Locale = { locale: 'zh-CN', formatLocale: 'zh-CN', messages: zhCNMessages };
export const enUS: Locale = { locale: 'en-US', formatLocale: 'en-US', messages: enUSMessages };
export const locales: Readonly<Record<string, Locale>> = { 'zh-CN': zhCN, 'en-US': enUS };

export function createLocale(locale: string, messages: LocaleOverrides, base: Locale = enUS, formatLocale = locale): Locale {
  return { locale, formatLocale: getFormatLocale(formatLocale, base.formatLocale), messages: mergeMessages(base.messages, messages) };
}

export function mergeMessages(base: LocaleMessages, overrides: LocaleOverrides = {}): LocaleMessages {
  const messages = { ...base };
  for (const key of Object.keys(base) as Array<keyof LocaleMessages>) {
    if (typeof overrides[key] === 'string') messages[key] = overrides[key];
  }
  return messages;
}

export function getFormatLocale(locale: string, fallback = 'zh-CN'): string {
  try {
    return Intl.DateTimeFormat.supportedLocalesOf(locale).length ? locale : fallback;
  } catch {
    return fallback;
  }
}

export function resolveLocale(input: LocaleInput = zhCN, registry: Readonly<Record<string, Locale>> = locales): Locale {
  if (typeof input !== 'string') return { ...input, formatLocale: getFormatLocale(input.formatLocale), messages: mergeMessages(zhCN.messages, input.messages) };
  const pack = registry[input] ?? locales[input];
  if (pack) return pack;
  const base = input.toLowerCase().startsWith('en') ? enUS : zhCN;
  return { ...base, locale: input, formatLocale: getFormatLocale(input, base.formatLocale) };
}

export function createTranslator(messages: LocaleMessages): Translate {
  return (key, params) => messages[key].replace(/\{(\w+)\}/g, (token, name: string) => String(params?.[name] ?? token));
}

export const LocaleContext = createContext<Locale>(zhCN);

export function useLocale() {
  const pack = useContext(LocaleContext);
  return useMemo(() => ({ ...pack, t: createTranslator(pack.messages) }), [pack]);
}
