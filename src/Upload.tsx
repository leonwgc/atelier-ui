import { useLocale } from './locale';
import { useId, useRef, useState, type DragEvent, type HTMLAttributes } from 'react';
import './styles/theme.css';
import './styles/upload.css';
import { cx } from './utils';

export interface UploadProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  onChange?: (files: File[]) => void;
}

export function Upload({ accept, multiple = false, disabled = false, onChange, onDrop, onDragOver, className, ...props }: UploadProps) {
  const { t } = useLocale();

  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const updateFiles = (incoming: File[]) => {
    const acceptedTypes = accept?.split(',').map((type) => type.trim().toLowerCase()).filter(Boolean) ?? [];
    const acceptedFiles = acceptedTypes.length ? incoming.filter((file) => acceptedTypes.some((type) => (
      type.startsWith('.') ? file.name.toLowerCase().endsWith(type)
        : type.endsWith('/*') ? file.type.toLowerCase().startsWith(type.slice(0, -1))
          : file.type.toLowerCase() === type
    ))) : incoming;
    const next = multiple ? [...files, ...acceptedFiles] : acceptedFiles.slice(0, 1);
    setFiles(next);
    onChange?.(next);
  };
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    onDrop?.(event);
    if (!disabled) updateFiles(Array.from(event.dataTransfer.files));
  };
  return <div {...props} className={cx('at-upload', disabled && 'at-upload--disabled', className)} onDragOver={(event) => { event.preventDefault(); onDragOver?.(event); }} onDrop={handleDrop}>
    <input ref={inputRef} id={inputId} className="at-upload__input" type="file" aria-label={t('upload.choose')} accept={accept} multiple={multiple} disabled={disabled} onChange={(event) => { updateFiles(Array.from(event.currentTarget.files ?? [])); event.currentTarget.value = ''; }} />
    <div className="at-upload__prompt"><span className="at-upload__icon" aria-hidden="true">↑</span><div><strong>{t('upload.prompt')}{' '}<button type="button" disabled={disabled} onClick={() => inputRef.current?.click()}>{t('upload.choose')}</button></strong><span>{accept ? t('upload.accept', { accept }) : t('upload.hint')}</span></div></div>
    {files.length > 0 && <ul className="at-upload__list" aria-label={t('upload.selected')}>{files.map((file, index) => <li key={`${file.name}-${file.lastModified}-${index}`}><span>{file.name}</span><button type="button" disabled={disabled} aria-label={t('common.removeItem', { name: file.name })} onClick={() => { const next = files.filter((_, fileIndex) => fileIndex !== index); setFiles(next); onChange?.(next); }}>{t('common.remove')}</button></li>)}</ul>}
  </div>;
}
