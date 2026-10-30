import { useDemoLocale } from '../locale';
import { useState } from 'react';
import { Button } from '../../src/entries/button';
import { FlipCard } from '../../src/entries/flip-card';
import './styles.css';

export default function Example() {
  const { t: dt } = useDemoLocale();

  const [flipped, setFlipped] = useState(false);

  return (
    <div className="animation-demo">
      <div className="animation-demo__toolbar">
        <Button aria-pressed={flipped} onClick={() => setFlipped((value) => !value)}>
          {flipped ? dt("翻回正面") : dt("翻到背面")}
        </Button>
        <span className="animation-demo__hint" aria-live="polite">
          {flipped ? dt("当前：背面 · 成员详情") : dt("当前：正面 · 成员名片")}
        </span>
      </div>
      <FlipCard
        className="animation-demo__flip"
        aria-label={dt("成员名片")}
        flipped={flipped}
        front={
          <article className="animation-demo__member">
            <span className="animation-demo__side">{dt("正面 / PROFILE")}</span>
            <span className="animation-demo__avatar" aria-hidden="true">AM</span>
            <strong>Alex Morgan</strong>
            <span>{dt("产品设计师")}</span>
            <small>{dt("翻转卡片，查看成员详情 →")}</small>
          </article>
        }
        back={
          <article className="animation-demo__member animation-demo__member--back">
            <span className="animation-demo__side">{dt("背面 / DETAILS")}</span>
            <strong>{dt("让好想法成为好体验")}</strong>
            <p>{dt("负责产品交互与设计系统，让每个界面细节保持一致。")}</p>
            <span>alex@example.com</span>
            <small>{dt("点击“翻回正面”再次查看翻转效果")}</small>
          </article>
        }
      />
    </div>
  );
}
