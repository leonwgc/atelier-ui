import { useState } from 'react';
import { Button } from '../../src/entries/button';
import { Confetti } from '../../src/entries/confetti';
import './styles.css';

export default function Example() {
  const [replay, setReplay] = useState(0);

  return (
    <div className="animation-demo">
      <div className="animation-demo__toolbar">
        <Button onClick={() => setReplay((value) => value + 1)}>庆祝一下</Button>
        <span className="animation-demo__hint">点击按钮可重复观察动画</span>
      </div>
      <div className="animation-demo__stage">
        <Confetti key={replay} count={40} duration={1500}>
          <article className="animation-demo__card">
            <span className="animation-demo__badge">发布成功</span>
            <strong>项目发布成功</strong>
            <p>本次更新已完成，和团队一起庆祝吧。</p>
          </article>
        </Confetti>
      </div>
    </div>
  );
}
