import { useLocale } from './locale';
import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react';
import './styles/theme.css';
import './styles/input-otp.css';

export interface InputOTPProps {
  length?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  ariaLabel?: string;
  className?: string;
}

export function InputOTP({
  length = 6,
  value,
  defaultValue = '',
  onChange,
  onComplete,
  disabled = false,
  autoFocus = false,
  ariaLabel: ariaLabelProp,
  className = '',
}: InputOTPProps) {
  const { t } = useLocale();
  const ariaLabel = ariaLabelProp === undefined ? t('inputOTP.label') : ariaLabelProp;

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [internalValue, setInternalValue] = useState(defaultValue.replace(/\D/g, '').slice(0, length));
  const controlled = value !== undefined;
  const currentValue = (controlled ? value : internalValue).replace(/\D/g, '').slice(0, length);
  const slots = Array.from({ length: Math.max(1, Math.floor(length)) }, (_, index) => currentValue[index] ?? '');

  const updateValue = (nextValue: string) => {
    const next = nextValue.replace(/\D/g, '').slice(0, slots.length);
    if (!controlled) setInternalValue(next);
    onChange?.(next);
    if (next.length === slots.length) onComplete?.(next);
  };

  const focusInput = (index: number) => inputRefs.current[Math.max(0, Math.min(index, slots.length - 1))]?.focus();
  const fillFrom = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (!digits) return;
    const chars = currentValue.split('');
    digits.slice(0, slots.length - index).split('').forEach((digit, offset) => { chars[index + offset] = digit; });
    updateValue(chars.join(''));
    focusInput(Math.min(index + digits.length, slots.length - 1));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); focusInput(index - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); focusInput(index + 1); }
    if (event.key === 'Backspace') {
      event.preventDefault();
      const target = currentValue[index] ? index : index - 1;
      if (target >= 0) {
        const chars = currentValue.split('');
        chars[target] = '';
        updateValue(chars.join(''));
        focusInput(target);
      }
    }
    if (event.key === 'Delete' && currentValue[index]) {
      const chars = currentValue.split('');
      chars[index] = '';
      updateValue(chars.join(''));
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    const focusedIndex = inputRefs.current.findIndex((input) => input === document.activeElement);
    fillFrom(Math.max(0, focusedIndex), event.clipboardData.getData('text'));
  };

  return (
    <div className={`at-input-otp ${className}`} role="group" aria-label={ariaLabel} onPaste={handlePaste}>
      {slots.map((digit, index) => (
        <input
          key={index}
          ref={(node) => { inputRefs.current[index] = node; }}
          className="at-input-otp__cell"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          aria-label={t('inputOTP.digit', { label: ariaLabel, index: index + 1 })}
          value={digit}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          onChange={(event) => fillFrom(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(event, index)}
        />
      ))}
    </div>
  );
}
