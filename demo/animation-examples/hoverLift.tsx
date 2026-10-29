import { HoverLift } from '../../src/entries/hover-lift';
import './styles.css';

export default function Example() {
  return (
    <div className="animation-demo">
      <p className="animation-demo__hint">鼠标移入卡片观察抬升，移出后恢复</p>
      <div className="animation-demo__stage">
        <HoverLift lift={12} duration={350} className="animation-demo__effect">
          <article className="animation-demo__card">
            <span className="animation-demo__badge">ATELIER UI</span>
            <strong>探索最新项目</strong>
            <p>将鼠标移到卡片上，卡片会向上抬起。</p>
          </article>
        </HoverLift>
      </div>
    </div>
  );
}
