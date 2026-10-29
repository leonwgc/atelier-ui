import { Pulse } from '../../src/entries/pulse';
import './styles.css';

export default function Example() {
  return (
    <div className="animation-demo">
      <p className="animation-demo__hint">持续循环，观察卡片的呼吸变化</p>
      <div className="animation-demo__stage">
        <Pulse duration={1700} className="animation-demo__effect">
          <article className="animation-demo__card">
            <span className="animation-demo__badge">ATELIER UI</span>
            <strong>服务运行中</strong>
            <p>卡片持续轻微缩放并改变透明度。</p>
          </article>
        </Pulse>
      </div>
    </div>
  );
}
