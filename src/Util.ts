export const Util = {
	clamp(value: number, min: number, max: number) { return Math.min(max, Math.max(min, value)); },
	formatNumber(value: number, locale = 'zh-CN') { return new Intl.NumberFormat(locale).format(value); },
	classNames(...names: Array<string | false | null | undefined>) { return names.filter(Boolean).join(' '); },
};
