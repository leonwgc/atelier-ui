import { useDemoLocale } from '../locale';
import { Marquee } from '../../src/entries/marquee';
import './styles.css';

export default function Example() {
  const { t: dt } = useDemoLocale();

  return (
    <div className="animation-demo">
      <p className="animation-demo__hint">{dt("内容持续滚动，将鼠标移入下方区域可暂停。")}</p>
      <div className="animation-demo__marquee">
        <Marquee duration={16} gradient pauseOnHover>
          {[dt("设计系统"), dt("团队协作"), dt("无障碍体验"), dt("灵活组合"), dt("细节打磨")].map((label) => (
            <span key={label} className="animation-demo__pill">✦ {label}</span>
          ))}
        </Marquee>
      </div>
    </div>
  );
}
