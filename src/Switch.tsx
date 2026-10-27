import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/switch.css';
import { cx } from './utils';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checkedChildren?: ReactNode;
  unCheckedChildren?: ReactNode;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch({ checkedChildren, unCheckedChildren, className, ...props }, ref) {
  return <label className={cx('at-switch', className)}><input {...props} ref={ref} type="checkbox" role="switch" className="at-switch__input" /><span className="at-switch__track"><span className="at-switch__thumb" /><span className="at-switch__label at-switch__label--on">{checkedChildren}</span><span className="at-switch__label at-switch__label--off">{unCheckedChildren}</span></span></label>;
});
