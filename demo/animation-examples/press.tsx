import { useDemoLocale } from '../locale';
import { useState } from 'react';
import { Button } from '../../src/entries/button';
import { Press } from '../../src/entries/press';
import './styles.css';

export default function Example() {
  const { t: dt } = useDemoLocale();

  const [presses, setPresses] = useState(0);

  return (
    <div className="animation-demo">
      <p className="animation-demo__hint">{dt("按住按钮观察缩小，松开后恢复；也可使用键盘点击。")}</p>
      <div className="animation-demo__stage">
        <Press duration={180}>
          <Button variant="primary" fullWidth onClick={() => setPresses((value) => value + 1)}>{dt("按住体验缩放")}</Button>
        </Press>
      </div>
      <span className="animation-demo__hint" aria-live="polite">{dt("已完成")}{presses} {dt("次点击")}</span>
    </div>
  );
}
