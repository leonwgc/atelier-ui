import { useState, type ReactNode } from 'react';
import { highlightCode } from './shared';
import { AnimatedList, BlurFade, BorderBeam, Marquee, NumberTicker, Shimmer, TypingAnimation } from '../src';

export type AnimationPageId = 'marquee' | 'numberTicker' | 'typingAnimation' | 'blurFade' | 'shimmer' | 'animatedList' | 'borderBeam';
type ApiRow = [string, string, string];

interface AnimationPageMeta {
  id: AnimationPageId;
  title: string;
  icon: string;
  description: string;
  code: string;
  rows: ApiRow[];
  preview: ReactNode;
}

export const animationPages: AnimationPageMeta[] = [
  {
    id: 'marquee', title: 'Marquee 滚动展示', icon: '⇢', description: '以连续循环的轨道展示标签、动态或品牌内容。',
    code: `import { Marquee } from 'atelier-ui/marquee';

export function ProjectMarquee() {
  return (
    <Marquee duration={24} gradient pauseOnHover>
      <span>Design systems</span>
      <span>Product teams</span>
      <span>Made to move</span>
    </Marquee>
  );
}`,
    rows: [['children', 'ReactNode', 'required'], ['duration', 'number', '28 秒'], ['direction', "'left' | 'right'", 'left'], ['pauseOnHover', 'boolean', 'true'], ['gradient', 'boolean', 'false']],
    preview: <Marquee duration={12} gradient><span className="animation-pill">Design systems</span><span className="animation-pill">Product teams</span><span className="animation-pill">Made to move</span></Marquee>,
  },
  {
    id: 'numberTicker', title: 'NumberTicker 数值滚动', icon: '↗', description: '使用缓动数字递增强调统计值和关键指标。',
    code: `import { NumberTicker } from 'atelier-ui/number-ticker';

export function MonthlyRevenue() {
  return <NumberTicker value={12840} prefix="$" duration={1400} />;
}`,
    rows: [['value', 'number', 'required'], ['startValue', 'number', '0'], ['duration', 'number', '1200 ms'], ['delay', 'number', '0 ms'], ['decimals', 'number', '0'], ['locale', 'string', 'zh-CN'], ['prefix / suffix', 'string', '—']],
    preview: <div className="animation-number-preview"><NumberTicker value={12840} prefix="$" duration={1600} /></div>,
  },
  {
    id: 'typingAnimation', title: 'TypingAnimation 打字效果', icon: '▏', description: '逐字输入、停顿并轮播多段短文案。',
    code: `import { TypingAnimation } from 'atelier-ui/typing-animation';

export function RotatingHeadline() {
  return (
    <TypingAnimation
      words={['Build with clarity', 'Ship with confidence']}
      typeSpeed={65}
      pauseDuration={1200}
    />
  );
}`,
    rows: [['words', 'string[]', 'required'], ['typeSpeed', 'number', '75 ms'], ['deleteSpeed', 'number', '38 ms'], ['pauseDuration', 'number', '1300 ms'], ['loop', 'boolean', 'true'], ['cursor', 'boolean', 'true']],
    preview: <div className="animation-typing-preview"><TypingAnimation words={['Build with clarity', 'Ship with confidence']} typeSpeed={65} pauseDuration={1000} /></div>,
  },
  {
    id: 'blurFade', title: 'BlurFade 模糊渐入', icon: '◌', description: '让内容以轻微位移和模糊渐显，支持错峰延迟。',
    code: `import { BlurFade } from 'atelier-ui/blur-fade';

export function Intro() {
  return (
    <BlurFade delay={120} duration={600} blur={8} offsetY={12}>
      <h2>Every detail finds its place.</h2>
    </BlurFade>
  );
}`,
    rows: [['children', 'ReactNode', 'required'], ['delay', 'number', '0 ms'], ['duration', 'number', '500 ms'], ['blur', 'number', '6 px'], ['offsetY', 'number', '8 px']],
    preview: <BlurFade key="blur-fade-demo" className="animation-fade-preview" delay={80} duration={850}><strong>Every detail finds its place.</strong></BlurFade>,
  },
  {
    id: 'shimmer', title: 'Shimmer 流光', icon: '✧', description: '为内容表面添加柔和的掠光效果，可自定义高光颜色。',
    code: `import { Shimmer } from 'atelier-ui/shimmer';

export function Highlight() {
  return (
    <Shimmer duration={1800}>
      <strong>Ready for the next release</strong>
    </Shimmer>
  );
}`,
    rows: [['children', 'ReactNode', 'required'], ['duration', 'number', '1800 ms'], ['highlight', 'string', '半透明白色']],
    preview: <Shimmer className="animation-shimmer-preview"><strong>Ready for the next release</strong></Shimmer>,
  },
  {
    id: 'animatedList', title: 'AnimatedList 列表渐入', icon: '☷', description: '以错峰渐入动画呈现动态列表内容。',
    code: `import { AnimatedList } from 'atelier-ui/animated-list';

export function ActivityFeed() {
  return (
    <AnimatedList
      items={['Workspace created', 'Design review completed', 'Release published']}
      staggerDelay={90}
    />
  );
}`,
    rows: [['items', 'ReactNode[]', 'required'], ['staggerDelay', 'number', '70 ms'], ['duration', 'number', '420 ms'], ['itemClassName', 'string', '—'], ['HTML attributes', 'HTMLAttributes<HTMLUListElement>', '—']],
    preview: <AnimatedList key="activity-list-demo" className="animation-list-preview" items={['Workspace created', 'Design review completed', 'Release published']} staggerDelay={120} />,
  },
  {
    id: 'borderBeam', title: 'BorderBeam 边框流光', icon: '✧', description: '为重点内容添加可控颜色和速度的流动边框。',
    code: `import { BorderBeam } from 'atelier-ui/border-beam';

export function HighlightCard() {
  return (
    <BorderBeam color="#2f9472" duration={5}>
      <strong>Ready for the next release</strong>
    </BorderBeam>
  );
}`,
    rows: [['children', 'ReactNode', 'required'], ['color', 'string', '#8b7dff'], ['duration', 'number', '5 秒'], ['paused', 'boolean', 'false'], ['className', 'string', '—']],
    preview: <BorderBeam color="#2f9472"><strong>Ready for the next release</strong></BorderBeam>,
  },
];

export function isAnimationPageId(id: string): id is AnimationPageId {
  return animationPages.some((item) => item.id === id);
}

export function AnimationPage({ id }: { id: AnimationPageId }) {
  const [showCode, setShowCode] = useState(false);
  const item = animationPages.find((page) => page.id === id);
  if (!item) return null;

  return <>
    <div className="page-heading">
      <div className="eyebrow"><span className="eyebrow__dot" />动画组件</div>
      <div className="page-heading__row"><div><h1>{item.title}</h1><p>{item.description}</p></div><span className="heading-badge">{item.title.split(' ')[0]}</span></div>
    </div>
    <section className="example-card">
      <div className="example-card__heading"><div><h3>交互示例</h3><p>体验组件效果，再查看可直接使用的 TypeScript 示例。</p></div><button type="button" className={`code-toggle ${showCode ? 'code-toggle--active' : ''}`} onClick={() => setShowCode((visible) => !visible)}><span>{`</>`}</span>{showCode ? '收起代码' : '查看完整代码'}</button></div>
      <div className="example-card__preview">{item.preview}</div>
      {showCode && <pre className="code-panel"><code dangerouslySetInnerHTML={{ __html: highlightCode(item.code) }} /></pre>}
    </section>
    <section className="api-table-section"><div className="eyebrow"><span className="eyebrow__dot" /> API REFERENCE</div><h2>组件属性</h2><div className="api-table-wrap"><table className="api-table"><thead><tr><th>属性</th><th>类型</th><th>默认值</th></tr></thead><tbody>{item.rows.map(([prop, type, fallback]) => <tr key={prop}><td><code>{prop}</code></td><td>{type}</td><td>{fallback}</td></tr>)}</tbody></table></div></section>
  </>;
}