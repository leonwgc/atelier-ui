import { cloneElement, createContext, isValidElement, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ConfigProvider } from '../../src/ConfigProvider';
import english from './en-US.json';

export type DemoLanguage = 'zh-CN' | 'en-US';
export type DemoTranslate = (text: string, params?: Record<string, unknown>) => string;
const translations: Readonly<Record<string, string>> = english;
const phrases = Object.keys(translations).filter((key) => key.length > 1).sort((a, b) => b.length - a.length);
const phrasePattern = new RegExp(phrases.map((key) => key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');

function createDemoTranslator(locale: DemoLanguage): DemoTranslate {
  return (text, params) => {
    const translated = locale === 'zh-CN' ? text : translations[text] ?? text.replace(phrasePattern, (phrase) => translations[phrase]);
    return translated.replace(/\{(\d+)\}/g, (token, index: string) => String(params?.[index] ?? token));
  };
}

const DemoLocaleContext = createContext({
  locale: 'zh-CN' as DemoLanguage,
  setLocale: (_locale: DemoLanguage) => {},
  t: createDemoTranslator('zh-CN'),
});

export function DemoLanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<DemoLanguage>(() => {
    try { return localStorage.getItem('atelier-ui-docs-locale') === 'en-US' ? 'en-US' : 'zh-CN'; }
    catch { return 'zh-CN'; }
  });
  const value = useMemo(() => ({ locale, setLocale, t: createDemoTranslator(locale) }), [locale]);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = locale === 'zh-CN' ? 'Atelier UI · 组件实验室' : 'Atelier UI · Component Guide';
    try { localStorage.setItem('atelier-ui-docs-locale', locale); } catch { /* Storage may be unavailable in private or embedded contexts. */ }
  }, [locale]);
  return <DemoLocaleContext.Provider value={value}><ConfigProvider locale={locale}>{children}</ConfigProvider></DemoLocaleContext.Provider>;
}

export function useDemoLocale() { return useContext(DemoLocaleContext); }

/** Localize immutable catalog data and predeclared JSX without changing identifiers or callbacks. */
export function translateDemoValue<T>(value: T, t: DemoTranslate): T {
  if (typeof value === 'string') return t(value) as T;
  if (isValidElement<Record<string, unknown>>(value)) return cloneElement(value, translateDemoValue(value.props, t)) as T;
  if (Array.isArray(value)) return value.map((item) => translateDemoValue(item, t)) as T;
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, translateDemoValue(item, t)])) as T;
  }
  return value;
}
