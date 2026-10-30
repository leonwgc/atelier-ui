import { useDemoLocale } from '../locale';
import { useState } from 'react';
import { Button } from '../../src/entries/button';
import { BorderBeam } from '../../src/entries/border-beam';
import './styles.css';

export default function Example() {
  const { t: dt } = useDemoLocale();

  const [paused, setPaused] = useState(false);

  return (
    <div className="animation-demo">
      <div className="animation-demo__toolbar">
        <Button aria-pressed={paused} onClick={() => setPaused((value) => !value)}>
          {paused ? dt("继续流光") : dt("暂停流光")}
        </Button>
        <span className="animation-demo__hint">{dt("观察沿卡片边缘旋转的绿色光线")}</span>
      </div>
      <BorderBeam color="var(--at-color-success)" duration={3} paused={paused} className="animation-demo__beam">
        <span className="animation-demo__badge">PRO WORKSPACE</span>
        <h3>{dt("让创意持续流动")}</h3>
        <p>{dt("边框流光强调当前值得关注的内容。")}</p>
      </BorderBeam>
    </div>
  );
}
