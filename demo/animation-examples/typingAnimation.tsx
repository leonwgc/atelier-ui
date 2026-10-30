import { useDemoLocale } from '../locale';
import { TypingAnimation } from '../../src/entries/typing-animation';
import './styles.css';

export default function Example() {
  const { t: dt } = useDemoLocale();

  return (
    <div className="animation-demo">
      <p className="animation-demo__hint">{dt("依次输入、停顿、删除，再切换下一句。")}</p>
      <div className="animation-demo__card">
        <span className="animation-demo__badge">{dt("为团队打造更好的体验")}</span>
        <TypingAnimation
          words={[dt("让想法清晰呈现"), dt("让协作自然发生"), dt("让细节恰到好处")]}
          typeSpeed={120}
          deleteSpeed={70}
          pauseDuration={1500}
          className="animation-demo__headline"
        />
        <p>{dt("观察光标与文字的逐字变化。")}</p>
      </div>
    </div>
  );
}
