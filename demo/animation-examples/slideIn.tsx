import { useState } from 'react';
import { Button } from '../../src/entries/button';
import { SlideIn } from '../../src/entries/slide-in';
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
        <SlideIn key={replay} direction="left" distance={64} duration={900}>
          <article className="animation-demo__card">
            <span className="animation-demo__badge">动画预览</span>
            <strong>从左侧进入视野</strong>
            <p>观察卡片平滑滑入，同时逐渐显示。</p>
          </article>
        </SlideIn>
      </div>
    </div>
  );
}
