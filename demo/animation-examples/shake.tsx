import { useState } from 'react';
import { Button } from '../../src/entries/button';
import { Shake } from '../../src/entries/shake';
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
        <Shake key={replay} active duration={650}>
          <article className="animation-demo__card">
            <span className="animation-demo__badge">动画预览</span>
            <strong>请检查输入内容</strong>
            <p>当前信息不完整，请补充后再次提交。</p>
          </article>
        </Shake>
      </div>
    </div>
  );
}
