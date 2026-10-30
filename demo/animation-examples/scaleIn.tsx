import { useDemoLocale } from '../locale';
import { useState } from 'react';
import { Button } from '../../src/entries/button';
import { ScaleIn } from '../../src/entries/scale-in';
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
        <ScaleIn key={replay} startScale={0.65} duration={800}>
          <article className="animation-demo__card">
            <span className="animation-demo__badge">{dt("动画预览")}</span>
            <strong>{dt("欢迎回到工作区")}</strong>
            <p>{dt("观察卡片从较小尺寸放大并淡入。")}</p>
          </article>
        </ScaleIn>
      </div>
    </div>
  );
}
