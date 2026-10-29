import { useState } from 'react';
import { Button } from '../../src/entries/button';
import { ScaleIn } from '../../src/entries/scale-in';
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
        <ScaleIn key={replay} startScale={0.65} duration={800}>
          <article className="animation-demo__card">
            <span className="animation-demo__badge">动画预览</span>
            <strong>欢迎回到工作区</strong>
            <p>观察卡片从较小尺寸放大并淡入。</p>
          </article>
        </ScaleIn>
      </div>
    </div>
  );
}
