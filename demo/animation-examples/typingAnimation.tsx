import { TypingAnimation } from '../../src/entries/typing-animation';
import './styles.css';

export default function Example() {
  return (
    <div className="animation-demo">
      <p className="animation-demo__hint">依次输入、停顿、删除，再切换下一句。</p>
      <div className="animation-demo__card">
        <span className="animation-demo__badge">为团队打造更好的体验</span>
        <TypingAnimation
          words={['让想法清晰呈现', '让协作自然发生', '让细节恰到好处']}
          typeSpeed={120}
          deleteSpeed={70}
          pauseDuration={1500}
          className="animation-demo__headline"
        />
        <p>观察光标与文字的逐字变化。</p>
      </div>
    </div>
  );
}
