import { useState } from 'react';
import { Button } from '../../src/entries/button';
import { FlipIn } from '../../src/entries/flip-in';
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
        <FlipIn key={replay} direction="y" duration={900}>
          <article className="animation-demo__card">
            <span className="animation-demo__badge">动画预览</span>
            <strong>新内容已准备就绪</strong>
            <p>观察卡片绕 Y 轴翻转并逐渐显示。</p>
          </article>
        </FlipIn>
      </div>
    </div>
  );
}
