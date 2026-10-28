import './styles/theme.css';
import './styles/flex.css';
import type { CSSProperties, HTMLAttributes } from 'react';

export interface FlexProps extends HTMLAttributes<HTMLDivElement> {
	vertical?: boolean;
	gap?: number | string;
	align?: CSSProperties['alignItems'];
	justify?: CSSProperties['justifyContent'];
	wrap?: boolean;
}

export function Flex({ vertical = false, gap = 12, align = 'center', justify = 'flex-start', wrap = false, style, className = '', ...props }: FlexProps) {
	return <div {...props} className={`at-flex ${className}`} style={{ display: 'flex', flexDirection: vertical ? 'column' : 'row', gap, alignItems: align, justifyContent: justify, flexWrap: wrap ? 'wrap' : 'nowrap', ...style }} />;
}
