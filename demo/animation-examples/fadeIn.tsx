import { useState } from 'react';
import { Button } from '../../src/entries/button';
import { FadeIn } from '../../src/entries/fade-in';
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
        <FadeIn key={replay} delay={120} duration={1200}>
          <article className="animation-demo__card">
            <span className="animation-demo__badge">动画预览</span>
            <strong>每个细节都有自己的位置</strong>
            <p>观察卡片从透明逐渐变得清晰可见。</p>
          </article>
        </FadeIn>
      </div>
    </div>
  );
}
