import { useDemoLocale } from '../locale';
import { useRef } from 'react';
import { Button } from '../../src/entries/button';
import { ScrollReveal } from '../../src/entries/scroll-reveal';
import './styles.css';

export default function Example() {
  const { t: dt } = useDemoLocale();

  const scrollArea = useRef<HTMLDivElement>(null);

  return (
    <div className="animation-demo">
      <div className="animation-demo__toolbar">
        <Button onClick={() => scrollArea.current?.scrollTo({ top: 0, behavior: 'instant' })}>{dt("回到顶部")}</Button>
        <span className="animation-demo__hint">{dt("在下方区域向下滚动，让卡片进入视野")}</span>
      </div>
      <div ref={scrollArea} className="animation-demo__scroll" tabIndex={0} role="region" aria-label={dt("滚动动画演示区域")}>
        <div className="animation-demo__scroll-spacer">{dt("向下滚动 ↓")}</div>
        <ScrollReveal once={false} distance={36} duration={800} threshold={0.3}>
          <article className="animation-demo__card">
            <span className="animation-demo__badge">ATELIER UI</span>
            <strong>{dt("刚好在此刻出现")}</strong>
            <p>{dt("卡片进入可见区域时显示，移出后可再次触发。")}</p>
          </article>
        </ScrollReveal>
        <div className="animation-demo__scroll-end">{dt("↑ 向上滚动可再次观察")}</div>
      </div>
    </div>
  );
}
