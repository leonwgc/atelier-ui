import { useState } from 'react';
import { Button } from '../../src/entries/button';
import { NumberTicker } from '../../src/entries/number-ticker';
import './styles.css';

export default function Example() {
  const [replay, setReplay] = useState(0);
  const [revenue, setRevenue] = useState(12840);

  return (
    <div className="animation-demo">
      <div className="animation-demo__toolbar">
        <Button onClick={() => setReplay((value) => value + 1)}>重新计数</Button>
        <Button variant="tertiary" onClick={() => setRevenue((value) => value === 12840 ? 24680 : 12840)}>
          切换目标数值
        </Button>
      </div>
      <div className="animation-demo__card">
        <span className="animation-demo__hint">本月收入 · 从 0 开始递增</span>
        <NumberTicker key={replay} value={revenue} duration={1800} prefix="¥" className="animation-demo__number" />
        <span className="animation-demo__badge">目标 {revenue.toLocaleString('zh-CN')}</span>
      </div>
    </div>
  );
}
