import { useDemoLocale } from '../locale';
import { useState } from 'react';
import { Button } from '../../src/entries/button';
import { Wobble } from '../../src/entries/wobble';
import './styles.css';

export default function Example() {
  const { t: dt } = useDemoLocale();

  const [replay, setReplay] = useState(0);

  return (
    <div className="animation-demo">
      <div className="animation-demo__toolbar">
        <Button onClick={() => setReplay((value) => value + 1)}>{dt("重新播放")}</Button>
        <span className="animation-demo__hint">{dt("点击按钮可重复观察动画")}</span>
      </div>
      <div className="animation-demo__stage">
        <Wobble key={replay} active duration={900}>
          <article className="animation-demo__card">
            <span className="animation-demo__badge">{dt("动画预览")}</span>
            <strong>{dt("新功能已上线")}</strong>
            <p>{dt("轻轻摇摆，让值得关注的内容更醒目。")}</p>
          </article>
        </Wobble>
      </div>
    </div>
  );
}
