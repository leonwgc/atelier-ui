import type { zhCNMessages } from './zh-CN';

export type LocaleKey = keyof typeof zhCNMessages;
export type LocaleMessages = Record<LocaleKey, string>;
export type LocaleOverrides = Partial<LocaleMessages>;
export type LocaleParams = Record<string, string | number>;
export type Translate = (key: LocaleKey, params?: LocaleParams) => string;

export interface Locale {
  locale: string;
  /** A valid Intl locale; useful when the language-pack identifier is application-specific. */
  formatLocale: string;
  messages: LocaleMessages;
}

export type LocaleInput = string | Locale;
