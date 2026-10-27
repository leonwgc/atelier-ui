import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/checkbox.css';
import { cx } from './utils';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  children?: ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({ children, className, ...props }, ref) {
  return <label className={cx('at-check', className)}><input {...props} ref={ref} type="checkbox" className="at-check__input" /><span className="at-check__box" aria-hidden="true">✓</span>{children && <span>{children}</span>}</label>;
});

export interface CheckboxOption { label: ReactNode; value: string; disabled?: boolean }
export interface CheckboxGroupProps {
  options: CheckboxOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  disabled?: boolean;
  className?: string;
}

export function CheckboxGroup({ options, value, defaultValue = [], onChange, disabled, className }: CheckboxGroupProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const selected = value ?? uncontrolledValue;
  return <div className={cx('at-choice-group', className)} role="group">{options.map((option) => <Checkbox key={option.value} checked={selected.includes(option.value)} disabled={disabled || option.disabled} onChange={(event) => {
    const next = event.target.checked ? [...selected, option.value] : selected.filter((item) => item !== option.value);
    if (value == null) setUncontrolledValue(next);
    onChange?.(next);
  }}>{option.label}</Checkbox>)}</div>;
}
