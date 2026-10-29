import { Shimmer } from '../../src/entries/shimmer';
import './styles.css';

export default function Example() {
  return (
    <div className="animation-demo">
      <p className="animation-demo__hint">持续循环，观察从左到右的流光</p>
      <div className="animation-demo__stage">
        <Shimmer duration={2200} className="animation-demo__effect">
          <article className="animation-demo__card">
            <span className="animation-demo__badge">ATELIER UI</span>
            <strong>准备好迎接下一次发布</strong>
            <p>一道光从卡片表面扫过。</p>
          </article>
        </Shimmer>
      </div>
    </div>
  );
}
