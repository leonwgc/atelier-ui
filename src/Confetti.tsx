import './styles/theme.css';
import './styles/confetti.css';
import type { CSSProperties, ReactNode } from 'react';

export interface ConfettiProps {
  children?: ReactNode;
  active?: boolean;
  count?: number;
  duration?: number;
  colors?: string[];
}

const defaultColors = ['#7c3aed', '#06b6d4', '#f59e0b', '#ec4899', '#22c55e'];
const horizontalPositions = [-42, -31, -20, -9, 2, 13, 24, 35, 44];
const verticalOffsets = [-8, -16, -24, -12, -20, -4, -18];
const rotations = [35, 95, 155, 215, 275, 325];

export function Confetti({
  children,
  active = true,
  count = 24,
  duration = 1800,
  colors = defaultColors,
}: ConfettiProps) {
  const safeCount = Number.isFinite(count) ? Math.min(100, Math.max(0, Math.floor(count))) : 0;
  const safeDuration = Number.isFinite(duration) ? Math.max(0, duration) : 0;
  const palette = colors.length > 0 ? colors : defaultColors;

  return (
    <span className="at-confetti">
      {children}
      {active && Array.from({ length: safeCount }, (_, index) => {
        const particleStyle = {
          '--at-confetti-x': `${horizontalPositions[index % horizontalPositions.length]}px`,
          '--at-confetti-y': `${verticalOffsets[index % verticalOffsets.length]}px`,
          '--at-confetti-rotate': `${rotations[index % rotations.length]}deg`,
          '--at-confetti-size': `${6 + (index % 4) * 2}px`,
          '--at-confetti-duration': `${safeDuration}ms`,
          '--at-confetti-delay': `${(index % 6) * 25}ms`,
          '--at-confetti-color': palette[index % palette.length],
        } as CSSProperties;

        return <span key={index} className="at-confetti__particle" style={particleStyle} aria-hidden="true" />;
      })}
    </span>
  );
}
