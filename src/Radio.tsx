import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/radio.css';
import { cx } from './utils';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> { children?: ReactNode }
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio({ children, className, ...props }, ref) {
  return <label className={cx('at-radio', className)}><input {...props} ref={ref} type="radio" className="at-radio__input" /><span className="at-radio__circle" aria-hidden="true" />{children && <span>{children}</span>}</label>;
});

export interface RadioOption { label: ReactNode; value: string; disabled?: boolean }
export interface RadioGroupProps {
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
  className?: string;
}

export function RadioGroup({ options, value, defaultValue, onChange, name, disabled, className }: RadioGroupProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const selectedValue = value ?? uncontrolledValue;
  return <div className={cx('at-choice-group', className)} role="radiogroup">{options.map((option) => <Radio key={option.value} name={name} value={option.value} checked={selectedValue === option.value} disabled={disabled || option.disabled} onChange={() => { if (value == null) setUncontrolledValue(option.value); onChange?.(option.value); }}>{option.label}</Radio>)}</div>;
}
