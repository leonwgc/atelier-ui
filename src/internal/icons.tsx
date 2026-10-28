import type { SVGProps } from 'react';

type Props = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 16, children, ...props }: Props) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>{children}</svg>;
}

export const ChevronDown = (props: Props) => <Svg {...props}><path d="m6 9 6 6 6-6" /></Svg>;
export const ChevronRight = (props: Props) => <Svg {...props}><path d="m9 6 6 6-6 6" /></Svg>;
export const ChevronLeft = (props: Props) => <Svg {...props}><path d="m15 6-6 6 6 6" /></Svg>;
export const Check = (props: Props) => <Svg {...props}><path d="m5 12 4.5 4.5L19 7" /></Svg>;
export const Close = (props: Props) => <Svg {...props}><path d="M6 6l12 12M18 6 6 18" /></Svg>;
export const Clock = (props: Props) => <Svg {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>;
export const Search = (props: Props) => <Svg {...props}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></Svg>;
export const Plus = (props: Props) => <Svg {...props}><path d="M12 5v14M5 12h14" /></Svg>;
export const Minus = (props: Props) => <Svg {...props}><path d="M5 12h14" /></Svg>;
export const Star = ({ size = 24, ...props }: Props) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}><path d="M12 2.5l2.95 6.26 6.85.84-5.05 4.72 1.3 6.78L12 17.77 5.95 21.1l1.3-6.78L2.2 9.6l6.85-.84L12 2.5z" /></svg>;
