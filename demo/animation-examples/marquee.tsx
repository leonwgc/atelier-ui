import { Marquee } from '../../src/entries/marquee';
import './styles.css';

export default function Example() {
  return (
    <div className="animation-demo">
      <p className="animation-demo__hint">内容持续滚动，将鼠标移入下方区域可暂停。</p>
      <div className="animation-demo__marquee">
        <Marquee duration={16} gradient pauseOnHover>
          {['设计系统', '团队协作', '无障碍体验', '灵活组合', '细节打磨'].map((label) => (
            <span key={label} className="animation-demo__pill">✦ {label}</span>
          ))}
        </Marquee>
      </div>
    </div>
  );
}
