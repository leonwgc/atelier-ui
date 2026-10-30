import './styles/theme.css';
import './styles/config-provider.css';
import { createContext, useContext, useMemo, type CSSProperties, type ReactNode } from 'react';

import { LocaleContext, locales as builtinLocales, mergeMessages, resolveLocale, zhCN, type Locale, type LocaleInput, type LocaleOverrides } from './locale';

export type ConfigSize = 'small' | 'middle' | 'large';
export type ConfigLocale = string;
export interface ThemeTokens {
	primaryColor?: string;
	borderRadius?: string;
	colorBgContainer?: string;
	colorText?: string;
	colorBorder?: string;
}
export interface UIConfig {
	prefixCls: string;
	direction: 'ltr' | 'rtl';
	size: ConfigSize;
	locale: ConfigLocale;
	localePack: Locale;
	locales: Readonly<Record<string, Locale>>;
	theme: ThemeTokens;
}

const defaultUIConfig: UIConfig = { prefixCls: 'at', direction: 'ltr', size: 'middle', locale: 'zh-CN', localePack: zhCN, locales: builtinLocales, theme: {} };
const UIConfigContext = createContext<UIConfig>(defaultUIConfig);

export interface ConfigProviderProps {
	children: ReactNode;
	prefixCls?: string;
	direction?: UIConfig['direction'];
	size?: ConfigSize;
	locale?: LocaleInput;
	locales?: Readonly<Record<string, Locale>>;
	messages?: LocaleOverrides;
	theme?: ThemeTokens;
}

export function ConfigProvider({ children, prefixCls: prefixProp, direction: directionProp, size: sizeProp, locale: localeProp, locales: localeRegistry, messages, theme: themeProp }: ConfigProviderProps) {
	const parent = useConfig();
	const prefixCls = prefixProp ?? parent.prefixCls;
	const direction = directionProp ?? parent.direction;
	const size = sizeProp ?? parent.size;
	const theme = useMemo(() => ({ ...parent.theme, ...themeProp }), [parent.theme, themeProp]);
	const registry = useMemo(() => ({ ...parent.locales, ...localeRegistry }), [parent.locales, localeRegistry]);
	const localePack = useMemo(() => {
		const base = localeProp === undefined ? parent.localePack : resolveLocale(localeProp, registry);
		return { ...base, messages: mergeMessages(base.messages, messages) };
	}, [localeProp, registry, parent.localePack, messages]);
	const locale = localePack.locale;
	const config = useMemo(() => ({ prefixCls, direction, size, locale, localePack, locales: registry, theme }), [prefixCls, direction, size, locale, localePack, registry, theme]);
	const sizeHeight = size === 'small' ? '32px' : size === 'large' ? '48px' : '40px';
	const style: CSSProperties & Record<`--at-${string}`, string> = { '--at-control-height': sizeHeight };
	if (theme.primaryColor) {
		style['--at-color-primary'] = theme.primaryColor;
		style['--at-color-primary-hover'] = `color-mix(in srgb, ${theme.primaryColor} 88%, black)`;
		style['--at-color-primary-soft'] = `color-mix(in srgb, ${theme.primaryColor} 10%, white)`;
	}
	if (theme.borderRadius) style['--at-radius-md'] = theme.borderRadius;
	if (theme.colorBgContainer) style['--at-color-surface'] = theme.colorBgContainer;
	if (theme.colorText) style['--at-color-text'] = theme.colorText;
	if (theme.colorBorder) style['--at-color-border'] = theme.colorBorder;
	return <UIConfigContext.Provider value={config}><LocaleContext.Provider value={localePack}><div className={`${prefixCls}-config`} dir={direction} lang={locale} data-size={size} style={style}>{children}</div></LocaleContext.Provider></UIConfigContext.Provider>;
}

export function useConfig() { return useContext(UIConfigContext); }
