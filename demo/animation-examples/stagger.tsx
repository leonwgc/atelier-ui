import { useState } from 'react';
import { Button } from '../../src/entries/button';
import { Stagger } from '../../src/entries/stagger';
import './styles.css';

export default function Example() {
  const [replay, setReplay] = useState(0);

  return (
    <div className="animation-demo">
      <div className="animation-demo__toolbar">
        <Button onClick={() => setReplay((value) => value + 1)}>重新播放</Button>
        <span className="animation-demo__hint">每项间隔 180ms，按顺序进入</span>
      </div>
      <Stagger key={replay} staggerDelay={180} duration={600} className="animation-demo__steps">
        {['建立工作区', '邀请团队成员', '开始第一个项目'].map((title, index) => (
          <article key={title} className="animation-demo__step">
            <span className="animation-demo__badge">0{index + 1}</span>
            <strong>{title}</strong>
          </article>
        ))}
      </Stagger>
    </div>
  );
}
