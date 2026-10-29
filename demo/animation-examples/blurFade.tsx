import { useState } from 'react';
import { Button } from '../../src/entries/button';
import { BlurFade } from '../../src/entries/blur-fade';
import './styles.css';

export default function Example() {
  const [replay, setReplay] = useState(0);

  return (
    <div className="animation-demo">
      <div className="animation-demo__toolbar">
        <Button onClick={() => setReplay((value) => value + 1)}>重新播放</Button>
        <span className="animation-demo__hint">点击按钮可重复观察动画</span>
      </div>
      <div className="animation-demo__stage">
        <BlurFade key={replay} delay={120} duration={900} blur={10} offsetY={24}>
          <article className="animation-demo__card">
            <span className="animation-demo__badge">动画预览</span>
            <strong>让细节自然呈现</strong>
            <p>观察卡片从模糊到清晰，同时向上淡入。</p>
          </article>
        </BlurFade>
      </div>
    </div>
  );
}
