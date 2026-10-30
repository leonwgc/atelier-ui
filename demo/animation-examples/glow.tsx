import { useDemoLocale } from '../locale';
import { Glow } from '../../src/entries/glow';
import './styles.css';

export default function Example() {
  const { t: dt } = useDemoLocale();

  return (
    <div className="animation-demo">
      <p className="animation-demo__hint">{dt("持续循环，观察卡片周围的光晕")}</p>
      <div className="animation-demo__stage">
        <Glow color="var(--at-color-primary)" duration={2000} className="animation-demo__effect">
          <article className="animation-demo__card">
            <span className="animation-demo__badge">ATELIER UI</span>
            <strong>{dt("本周精选项目")}</strong>
            <p>{dt("卡片边缘的柔光持续明暗变化。")}</p>
          </article>
        </Glow>
      </div>
    </div>
  );
}
