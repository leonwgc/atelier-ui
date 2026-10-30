import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ConfigProvider, type ColorScheme } from '../src/ConfigProvider';
import { useDemoLocale } from './locale';

const ThemeContext = createContext({ colorScheme: 'light' as ColorScheme, toggle: () => {} });

export function DemoThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<ColorScheme | null>(() => {
    try {
      const saved = localStorage.getItem('atelier-ui-docs-theme');
      return saved === 'dark' || saved === 'light' ? saved : null;
    } catch { return null; }
  });
  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  const colorScheme = preference ?? (systemDark ? 'dark' : 'light');
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setSystemDark(media.matches);
    media.addEventListener('change', update);
    update();
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.atTheme = colorScheme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', colorScheme === 'dark' ? '#11131d' : '#f6f7fb');
    if (preference) {
      try { localStorage.setItem('atelier-ui-docs-theme', preference); } catch { /* The switch also works without storage. */ }
    }
  }, [colorScheme, preference]);
  const value = useMemo(() => ({ colorScheme, toggle: () => setPreference(colorScheme === 'dark' ? 'light' : 'dark') }), [colorScheme]);
  return <ThemeContext.Provider value={value}><ConfigProvider colorScheme={colorScheme}>{children}</ConfigProvider></ThemeContext.Provider>;
}

export function ThemeToggle() {
  const { colorScheme, toggle } = useContext(ThemeContext);
  const { t } = useDemoLocale();
  const label = t(colorScheme === 'dark' ? '切换到浅色模式' : '切换到深色模式');
  return <button type="button" className="theme-toggle" aria-label={label} title={label} aria-pressed={colorScheme === 'dark'} onClick={toggle}>
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {colorScheme === 'dark' ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5" /></> : <path d="M20.6 13.2A8.8 8.8 0 0 1 10.8 3.4a8.8 8.8 0 1 0 9.8 9.8Z" />}
    </svg>
  </button>;
}
