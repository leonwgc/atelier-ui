import './styles/theme.css';
import './styles/config-provider.css';
import { createContext, useContext, type CSSProperties, type ReactNode } from 'react';

export type ConfigSize = 'small' | 'middle' | 'large';
export type ConfigLocale = 'zh-CN' | 'en-US';
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
	theme: ThemeTokens;
}

const defaultUIConfig: UIConfig = { prefixCls: 'at', direction: 'ltr', size: 'middle', locale: 'zh-CN', theme: {} };
const UIConfigContext = createContext<UIConfig>(defaultUIConfig);

export interface ConfigProviderProps {
	children: ReactNode;
	prefixCls?: string;
	direction?: UIConfig['direction'];
	size?: ConfigSize;
	locale?: ConfigLocale;
	theme?: ThemeTokens;
}

export function ConfigProvider({ children, prefixCls = 'at', direction = 'ltr', size = 'middle', locale = 'zh-CN', theme = {} }: ConfigProviderProps) {
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
	return <UIConfigContext.Provider value={{ prefixCls, direction, size, locale, theme }}><div className={`${prefixCls}-config`} dir={direction} lang={locale} data-size={size} style={style}>{children}</div></UIConfigContext.Provider>;
}

export function useConfig() { return useContext(UIConfigContext); }
